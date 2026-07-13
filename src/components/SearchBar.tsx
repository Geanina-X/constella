import { useState, useCallback } from 'react';
import { useStore } from '../data/store';

export default function SearchBar({ onCreateWord, onCreateRoot }: {
  onCreateWord?: (word: string) => void;
  onCreateRoot?: (word: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ wordId: string; text: string }[]>([]);
  const [open, setOpen] = useState(false);
  const { words, selectWord } = useStore();

  const exactMatch = words.some(w => w.word.toLowerCase() === query.trim().toLowerCase());
  const showCreate = query.trim().length >= 1 && !exactMatch;

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    if (q.length < 1) { setResults([]); setOpen(false); return; }
    const lower = q.toLowerCase();
    const matched = words
      .filter((w) => {
        const text = `${w.word} ${w.meanings.map((m) => m.meaning).join(' ')} ${w.meanings.map((m) => m.definition).join(' ')}`.toLowerCase();
        return text.includes(lower);
      })
      .slice(0, 10)
      .map((w) => ({ wordId: w.id, text: `${w.word}  ${w.meanings[0]?.meaning || ''}` }));
    setResults(matched);
    setOpen(matched.length > 0 || (q.trim().length >= 1 && !words.some(w => w.word.toLowerCase() === q.trim().toLowerCase())));
  }, [words]);

  const doCreateWord = () => { onCreateWord?.(query.trim()); setOpen(false); setQuery(''); };
  const doCreateRoot = () => { onCreateRoot?.(query.trim()); setOpen(false); setQuery(''); };

  const hasContent = results.length > 0 || showCreate;

  return (
    <div style={{ position: 'relative' }}>
      <input type="text" value={query} onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => hasContent && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder="🔍 搜索单词..."
        style={{ background:"rgba(0,0,0,0.04)", border:"1px solid rgba(0,0,0,0.15)", borderRadius: 8, color: '#3a3028', padding: '8px 14px', fontSize: 14, width: 240, outline: 'none', backdropFilter: 'blur(10px)' }} />
      {open && hasContent && (
        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: 'rgba(250,246,238,0.98)', border:"1px solid rgba(0,0,0,0.15)", borderRadius: 8, zIndex: 200, width: 280, maxHeight: 300, overflowY: 'auto', backdropFilter: 'blur(20px)' }}>
          {results.map((r) => (
            <div key={r.wordId} onMouseDown={() => { selectWord(r.wordId); setOpen(false); }}
              style={{ padding: '8px 14px', cursor: 'pointer', color: '#3a3028', fontSize: 13, borderBottom:"1px solid rgba(0,0,0,0.06)" }}>
              {r.text}
            </div>
          ))}
          {showCreate && (
            <div style={{ padding: '8px 14px', borderTop: results.length > 0 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
              <div style={{ color: '#8a8070', fontSize: 11, marginBottom: 6 }}>未找到「{query.trim()}」，要新建吗？</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onMouseDown={doCreateWord} style={{
                  padding: '3px 10px', fontSize: 11, borderRadius: 12, cursor: 'pointer',
                  background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.12)',
                  color: '#3a3028', fontFamily: 'inherit',
                }}>📝 新建单词</button>
                <button onMouseDown={doCreateRoot} style={{
                  padding: '3px 10px', fontSize: 11, borderRadius: 12, cursor: 'pointer',
                  background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.12)',
                  color: '#3a3028', fontFamily: 'inherit',
                }}>🌿 新建词根词缀</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
