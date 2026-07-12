// Garden vine palette — richer, darker for parchment contrast
export const RELATION_COLORS: Record<string, string> = {
  'synonym':      '#4a8050',  // deep green vine
  'antonym':      '#904030',  // dark reddish stem
  'root-share':   '#8a6020',  // brown amber root
  'prefix-share': '#6a4090',  // deep purple stem
  'suffix-share': '#406080',  // dark blue vine
  'derivative':   '#985820',  // rust orange tendril
  'similar-form': '#407070',  // dark teal vine
  'custom':       '#666',
};

const POS_COLORS: Record<string, string> = {
  'v.':   '#ffb0b8',
  'n.':   '#90e0c0',
  'adj.': '#ffe078',
  'adv.': '#c8b8f8',
  'prep.':'#f8c8a0',
  'conj.':'#a0d8d8',
  'pron.':'#e0c8d0',
  'root': '#ffe078',
  'pref': '#c8b8f8',
  'suf':  '#a0d8d8',
};

export function getNodeColor(pos: string): string {
  return POS_COLORS[pos] || '#b0b0b0';
}

export function getEdgeClass(type: string): string {
  return `edge-type-${type}`;
}

