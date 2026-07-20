import { create } from 'zustand';
import type { Word, Relationship, ExportData } from '../types';
import { RELATION_LABELS } from '../types';
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
  updateRelationship: (id: string, u: Partial<Relationship>) => Promise<void>;
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
    set((s) => ({ words: [...s.words, w], selectedWordId: w.id }));
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { error } = await supabase.from('words').insert({
      id: w.id, user_id: user.user.id, word: w.word,
      pronunciation: w.pronunciation, meanings: w.meanings,
      tags: w.tags, notes: w.notes,
    });
    if (error) { console.error('addWord sync failed:', error); alert('同步失败，请刷新页面后重试'); }
  },

  updateWord: async (id, u) => {
    set((s) => ({ words: s.words.map((w) => (w.id === id ? { ...w, ...u } : w)) }));
    if (Object.keys(u).length === 0) return;
    const patch: Record<string, unknown> = {};
    if ('word' in u) patch.word = u.word;
    if ('pronunciation' in u) patch.pronunciation = u.pronunciation;
    if ('meanings' in u) patch.meanings = u.meanings;
    if ('tags' in u) patch.tags = u.tags;
    if ('notes' in u) patch.notes = u.notes;
    const { error } = await supabase.from('words').update(patch).eq('id', id);
    if (error) { console.error('updateWord sync failed:', error); }
  },

  deleteWord: async (id) => {
    set((s) => ({
      words: s.words.filter((w) => w.id !== id),
      relationships: s.relationships.filter((r) => r.sourceId !== id && r.targetId !== id),
      selectedWordId: s.selectedWordId === id ? null : s.selectedWordId,
    }));
    const { error } = await supabase.from('words').delete().eq('id', id);
    if (error) { console.error('deleteWord sync failed:', error); alert('同步失败，请刷新页面后重试'); return; }
    const { data: user } = await supabase.auth.getUser();
    if (user.user) {
      await supabase.from('relationships').delete().eq('user_id', user.user.id)
        .or(`source_id.eq.${id},target_id.eq.${id}`);
    }
  },

  addRelationship: async (r) => {
    set((s) => ({ relationships: [...s.relationships, r] }));
    const { data: user } = await supabase.auth.getUser();
    if (user.user) {
      const { error } = await supabase.from('relationships').insert({
        id: r.id, user_id: user.user.id,
        source_id: r.sourceId, target_id: r.targetId, type: r.type,
        label: r.label, notes: r.notes || '',
        source_meaning_index: r.sourceMeaningIndex,
        target_meaning_index: r.targetMeaningIndex,
      });
      if (error) { console.error('addRelationship sync failed:', error); }
    }

    // Word Family transitive closure: when adding a derivative,
    // auto-connect the new word with all existing family members
    if (r.type === 'derivative') {
      const state = get();
      const members = new Set<string>([r.sourceId, r.targetId]);

      // Collect all words already in the source's or target's derivative family
      state.relationships
        .filter(rel => rel.type === 'derivative')
        .forEach(rel => {
          if (members.has(rel.sourceId)) members.add(rel.targetId);
          if (members.has(rel.targetId)) members.add(rel.sourceId);
        });

      // Build missing connections — every pair in the clique
      const mArr = Array.from(members);
      const newRels: Relationship[] = [];
      for (let i = 0; i < mArr.length; i++) {
        for (let j = i + 1; j < mArr.length; j++) {
          const a = mArr[i], b = mArr[j];
          const exists = state.relationships.some(rel =>
            rel.type === 'derivative' &&
            ((rel.sourceId === a && rel.targetId === b) ||
             (rel.sourceId === b && rel.targetId === a))
          );
          if (!exists) {
            newRels.push({
              id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6) + newRels.length,
              sourceId: a, targetId: b,
              type: 'derivative', label: RELATION_LABELS.derivative, notes: '',
            });
          }
        }
      }

      if (newRels.length > 0) {
        set((s) => ({ relationships: [...s.relationships, ...newRels] }));
        if (user.user) {
          const { error } = await supabase.from('relationships').insert(
            newRels.map(nr => ({
              id: nr.id, user_id: user.user.id,
              source_id: nr.sourceId, target_id: nr.targetId,
              type: nr.type, label: nr.label, notes: '',
            }))
          );
          if (error) { console.error('addRelationship transitive sync failed:', error); }
        }
      }
    }
  },

  updateRelationship: async (id, u) => {
    set((s) => ({ relationships: s.relationships.map((r) => (r.id === id ? { ...r, ...u } : r)) }));
    const patch: Record<string, unknown> = {};
    if ('label' in u) patch.label = u.label;
    if ('notes' in u) patch.notes = u.notes;
    if ('type' in u) patch.type = u.type;
    if (Object.keys(patch).length === 0) return;
    const { error } = await supabase.from('relationships').update(patch).eq('id', id);
    if (error) { console.error('updateRelationship sync failed:', error); }
  },

  deleteRelationship: async (id) => {
    set((s) => ({ relationships: s.relationships.filter((r) => r.id !== id) }));
    const { error } = await supabase.from('relationships').delete().eq('id', id);
    if (error) { console.error('deleteRelationship sync failed:', error); }
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
        supabase.from('relationships').select('id,source_id,target_id,type,label,notes,source_meaning_index,target_meaning_index'),
      ]);

      if (we) console.error('Supabase words error:', we);
      if (re) console.error('Supabase relationships error:', re);

      if (words) {
        set({
          words: words.map((w: any) => ({
            id: w.id, word: w.word, pronunciation: w.pronunciation || '',
            meanings: (w.meanings || []).map((m: any) => ({ ...m, notes: m.notes || '' })), tags: w.tags || [], notes: w.notes || '',
          })),
        });
      }
      if (relationships) {
        set({
          relationships: relationships.map((r: any) => ({
            id: r.id, sourceId: r.source_id, targetId: r.target_id,
            type: r.type, label: r.label || '', notes: r.notes || '',
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

    const { error: e1 } = await supabase.from('words').delete().eq('user_id', user.user.id);
    const { error: e2 } = await supabase.from('relationships').delete().eq('user_id', user.user.id);
    if (e1 || e2) { console.error('importData delete failed:', e1 || e2); alert('导入失败，请刷新页面后重试'); return; }

    if (d.words.length > 0) {
      const { error } = await supabase.from('words').insert(
        d.words.map((w) => ({
          id: w.id, user_id: user.user.id, word: w.word,
          pronunciation: w.pronunciation, meanings: w.meanings,
          tags: w.tags, notes: w.notes,
        }))
      );
      if (error) { console.error('importData words insert failed:', error); alert('导入失败，请刷新页面后重试'); return; }
    }
    if (d.relationships.length > 0) {
      const { error } = await supabase.from('relationships').insert(
        d.relationships.map((r) => ({
          id: r.id, user_id: user.user.id,
          source_id: r.sourceId, target_id: r.targetId,
          type: r.type, label: r.label, notes: r.notes || '',
          source_meaning_index: r.sourceMeaningIndex,
          target_meaning_index: r.targetMeaningIndex,
        }))
      );
      if (error) { console.error('importData relationships insert failed:', error); alert('导入失败，请刷新页面后重试'); return; }
    }
  },

  clearAll: async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    set({ words: [], relationships: [], selectedWordId: null });
    const { error: e1 } = await supabase.from('words').delete().eq('user_id', user.user.id);
    const { error: e2 } = await supabase.from('relationships').delete().eq('user_id', user.user.id);
    if (e1 || e2) { console.error('clearAll failed:', e1 || e2); alert('清空失败，请刷新页面后重试'); }
  },
}));
