import { create } from 'zustand';
import type { Word, Relationship, ExportData } from '../types';
import { supabase } from '../supabase';

interface StoreState {
  words: Word[];
  relationships: Relationship[];
  selectedWordId: string | null;
  loading: boolean;

  addWord: (w: Word) => Promise<void>;
  updateWord: (id: string, u: Partial<Word>) => Promise<void>;
  deleteWord: (id: string) => Promise<void>;

  addRelationship: (r: Relationship) => Promise<void>;
  deleteRelationship: (id: string) => Promise<void>;

  selectWord: (id: string | null) => void;

  loadDemoData: (d: ExportData) => void;
  loadFromCloud: () => Promise<void>;
  exportData: () => ExportData;
  importData: (d: ExportData) => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  words: [],
  relationships: [],
  selectedWordId: null,
  loading: false,

  addWord: async (w) => {
    set((s) => ({ words: [...s.words, w] }));
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    await supabase.from('words').insert({
      id: w.id, user_id: user.user.id, word: w.word,
      pronunciation: w.pronunciation, meanings: w.meanings,
      tags: w.tags, notes: w.notes,
    });
  },

  updateWord: async (id, u) => {
    set((s) => ({ words: s.words.map((w) => (w.id === id ? { ...w, ...u } : w)) }));
    if (Object.keys(u).length === 0) return;
    await supabase.from('words').update({
      word: u.word, pronunciation: u.pronunciation,
      meanings: u.meanings, tags: u.tags, notes: u.notes,
    }).eq('id', id);
  },

  deleteWord: async (id) => {
    set((s) => ({
      words: s.words.filter((w) => w.id !== id),
      relationships: s.relationships.filter((r) => r.sourceId !== id && r.targetId !== id),
      selectedWordId: s.selectedWordId === id ? null : s.selectedWordId,
    }));
    await supabase.from('words').delete().eq('id', id);
    const { data: user } = await supabase.auth.getUser();
    if (user.user) {
      await supabase.from('relationships').delete().eq('user_id', user.user.id)
        .or(`source_id.eq.${id},target_id.eq.${id}`);
    }
  },

  addRelationship: async (r) => {
    set((s) => ({ relationships: [...s.relationships, r] }));
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    await supabase.from('relationships').insert({
      id: r.id, user_id: user.user.id,
      source_id: r.sourceId, target_id: r.targetId, type: r.type,
      label: r.label, source_meaning_index: r.sourceMeaningIndex,
      target_meaning_index: r.targetMeaningIndex,
    });
  },

  deleteRelationship: async (id) => {
    set((s) => ({ relationships: s.relationships.filter((r) => r.id !== id) }));
    await supabase.from('relationships').delete().eq('id', id);
  },

  selectWord: (id) => set({ selectedWordId: id }),

  // Demo mode: load preset data into local state only (no Supabase)
  loadDemoData: (d) => set({ words: d.words, relationships: d.relationships, selectedWordId: null }),

  loadFromCloud: async () => {
    set({ loading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { set({ loading: false }); return; }

      const [{ data: words, error: we }, { data: relationships, error: re }] = await Promise.all([
        supabase.from('words').select('id,word,pronunciation,meanings,tags,notes'),
        supabase.from('relationships').select('id,source_id,target_id,type,label,source_meaning_index,target_meaning_index'),
      ]);

      if (we) console.error('Supabase words error:', we);
      if (re) console.error('Supabase relationships error:', re);

      if (words) {
        set({
          words: words.map((w: any) => ({
            id: w.id, word: w.word, pronunciation: w.pronunciation || '',
            meanings: w.meanings || [], tags: w.tags || [], notes: w.notes || '',
          })),
        });
      }
      if (relationships) {
        set({
          relationships: relationships.map((r: any) => ({
            id: r.id, sourceId: r.source_id, targetId: r.target_id,
            type: r.type, label: r.label || '',
            sourceMeaningIndex: r.source_meaning_index ?? 0,
            targetMeaningIndex: r.target_meaning_index ?? 0,
          })),
        });
      }
    } catch (e) {
      console.error('loadFromCloud failed:', e);
    }
    set({ loading: false });
  },

  exportData: () => ({
    version: 1,
    words: get().words,
    relationships: get().relationships,
  }),

  importData: async (d) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    set({ words: d.words, relationships: d.relationships, selectedWordId: null });

    await supabase.from('words').delete().eq('user_id', user.user.id);
    await supabase.from('relationships').delete().eq('user_id', user.user.id);

    if (d.words.length > 0) {
      await supabase.from('words').insert(
        d.words.map((w) => ({
          id: w.id, user_id: user.user.id, word: w.word,
          pronunciation: w.pronunciation, meanings: w.meanings,
          tags: w.tags, notes: w.notes,
        }))
      );
    }
    if (d.relationships.length > 0) {
      await supabase.from('relationships').insert(
        d.relationships.map((r) => ({
          id: r.id, user_id: user.user.id,
          source_id: r.sourceId, target_id: r.targetId,
          type: r.type, label: r.label,
          source_meaning_index: r.sourceMeaningIndex,
          target_meaning_index: r.targetMeaningIndex,
        }))
      );
    }
  },

  clearAll: async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    set({ words: [], relationships: [], selectedWordId: null });
    await supabase.from('words').delete().eq('user_id', user.user.id);
    await supabase.from('relationships').delete().eq('user_id', user.user.id);
  },
}));
