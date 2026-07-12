import { create } from 'zustand';
import type { Word, Relationship, ExportData } from '../types';

interface StoreState {
  words: Word[];
  relationships: Relationship[];
  selectedWordId: string | null;

  addWord: (w: Word) => void;
  updateWord: (id: string, u: Partial<Word>) => void;
  deleteWord: (id: string) => void;

  addRelationship: (r: Relationship) => void;
  deleteRelationship: (id: string) => void;

  selectWord: (id: string | null) => void;

  loadFromStorage: () => void;
  saveToStorage: () => void;
  exportData: () => ExportData;
  importData: (d: ExportData) => void;
  clearAll: () => void;
}

const KEY = 'starwords-hub';

export const useStore = create<StoreState>((set, get) => ({
  words: [],
  relationships: [],
  selectedWordId: null,

  addWord: (w) => { set((s) => ({ words: [...s.words, w] })); get().saveToStorage(); },
  updateWord: (id, u) => {
    set((s) => ({ words: s.words.map((w) => (w.id === id ? { ...w, ...u } : w)) }));
    get().saveToStorage();
  },
  deleteWord: (id) => {
    set((s) => ({
      words: s.words.filter((w) => w.id !== id),
      relationships: s.relationships.filter((r) => r.sourceId !== id && r.targetId !== id),
      selectedWordId: s.selectedWordId === id ? null : s.selectedWordId,
    }));
    get().saveToStorage();
  },

  addRelationship: (r) => { set((s) => ({ relationships: [...s.relationships, r] })); get().saveToStorage(); },
  deleteRelationship: (id) => {
    set((s) => ({ relationships: s.relationships.filter((r) => r.id !== id) }));
    get().saveToStorage();
  },

  selectWord: (id) => set({ selectedWordId: id }),

  loadFromStorage: () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d: ExportData = JSON.parse(raw);
        set({ words: d.words, relationships: d.relationships });
      }
    } catch {}
  },
  saveToStorage: () => localStorage.setItem(KEY, JSON.stringify(get().exportData())),

  exportData: () => ({ version: 1, words: get().words, relationships: get().relationships }),
  importData: (d) => { set({ words: d.words, relationships: d.relationships, selectedWordId: null }); get().saveToStorage(); },
  clearAll: () => { set({ words: [], relationships: [], selectedWordId: null }); get().saveToStorage(); },
}));
