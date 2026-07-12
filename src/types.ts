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
  sourceMeaningIndex?: number;
  targetMeaningIndex?: number;
}

// ===== Relation labels (Chinese) =====
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

// ===== Export =====
export interface ExportData {
  version: 1;
  words: Word[];
  relationships: Relationship[];
}
