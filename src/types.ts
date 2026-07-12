// ===== Word meaning =====
export interface WordMeaning {
  partOfSpeech: string;
  meaning: string;
  definition: string;
  example: string;
  mnemonic: string;
}

// ===== Word: graph node + entry =====
export interface Word {
  id: string;
  word: string;
  pronunciation: string;
  meanings: WordMeaning[];
  tags: string[];
  notes: string;
}

// ===== Relationship: graph edge =====
export type RelationType =
  | 'synonym'
  | 'antonym'
  | 'root-share'
  | 'prefix-share'
  | 'suffix-share'
  | 'derivative'
  | 'similar-form'
  | 'custom';

export interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationType;
  label: string;
  // Which meaning index this applies to (for syn/ant/derivative/similar-form)
  sourceMeaningIndex?: number;
  targetMeaningIndex?: number;
}

// ===== Edge colors =====
export const RELATION_COLORS: Record<RelationType, string> = {
  'synonym':      '#4ade80',
  'antonym':      '#f87171',
  'root-share':   '#fbbf24',
  'prefix-share': '#c084fc',
  'suffix-share': '#60a5fa',
  'derivative':   '#fb923c',
  'similar-form': '#67e8f9',
  'custom':       '#9ca3af',
};

export const RELATION_LABELS: Record<RelationType, string> = {
  'synonym':      '同义',
  'antonym':      '反义',
  'root-share':   '词根',
  'prefix-share': '前缀',
  'suffix-share': '后缀',
  'derivative':   '词族',
  'similar-form': '形近',
  'custom':       '自定义',
};

// ===== POS → node color =====
const POS_COLORS: Record<string, string> = {
  'v.':   '#f08080',
  'n.':   '#5ec4c0',
  'adj.': '#e8c84a',
  'adv.': '#a89af0',
};

export function getNodeColor(word: Word): string {
  const primaryPos = word.meanings[0]?.partOfSpeech || '';
  return POS_COLORS[primaryPos] || '#a0a0c0';
}

// ===== Export =====
export interface ExportData {
  version: 1;
  words: Word[];
  relationships: Relationship[];
}
