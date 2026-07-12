import type { RelationType } from '../types';

// Edge colors — parchment-safe "vine palette" (tested against #f5f1e8 background)
export const RELATION_COLORS: Record<RelationType, string> = {
  'synonym':      '#4a8050',
  'antonym':      '#904030',
  'root-share':   '#8a6020',
  'prefix-share': '#6a4090',
  'suffix-share': '#406080',
  'derivative':   '#985820',
  'similar-form': '#407070',
  'custom':       '#666',
};

// Part-of-speech → node color (warm, parchment contrast)
const POS_COLORS: Record<string, string> = {
  'v.':   '#ffb0b8',
  'vi.':  '#ffb0b8',
  'vt.':  '#ffb0b8',
  'n.':   '#90e0c0',
  'adj.': '#ffe078',
  'adv.': '#c8b8f8',
  'prep.':'#f8c8a0',
  'conj.':'#a0d8d8',
  'pron.':'#e0c8d0',
  'interj.':'#f0b0d0',
  'art.': '#d0c8a0',
  'num.': '#b8c8e0',
  'det.': '#c0d0b0',
  'aux.': '#e0c0b0',
  'root': '#ffe078',
  'pref': '#c8b8f8',
  'suf':  '#a0d8d8',
};

export function getNodeColor(pos: string): string {
  return POS_COLORS[pos] || '#b0b0b0';
}
