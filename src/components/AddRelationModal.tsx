import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../data/store';
import { RELATION_LABELS } from '../types';
import { RELATION_COLORS } from '../utils/graphStyles';
import type { RelationType, Word } from '../types';

export default function AddRelationModal({
  sourceWordId, sourceMeaningIndex, initialType, onClose,
}: {
  sourceWordId: string; sourceMeaningIndex: number; initialType: RelationType; onClose: () => void;
}) {
  const { words, addRelationship, addWord } = useStore();
  const src = words.find((w) => w.id === sourceWordId);
  const srcMeaning = src?.meanings[sourceMeaningIndex];
  const [search, setSearch] = useState('');
  const [targetId, setTargetId] = useState<string | null>(null);
  const [targetMeaningIdx, setTargetMeaningIdx] = useState<number | undefined>(undefined);
  const [type, setType] = useState<RelationType>(initialType);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const targetWord = targetId ? words.find((w) => w.id === targetId) : null;

  const filtered = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return words.filter((w) => w.id !== sourceWordId && (
      w.word.toLowerCase().includes(q) || w.meanings.some((m) => m.meaning.includes(search))
    )).slice(0, 10);
  }, [search, words, sourceWordId]);

  const exactMatch = useMemo(() =>
    search.trim() && !filtered.some(w => w.word.toLowerCase() === search.trim().toLowerCase()),
  [search, filtered]);

  const submit = () => {
    if (!targetId) return;
    addRelationship({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      sourceId: sourceWordId, targetId,
      type, label: RELATION_LABELS[type], notes: '',
      sourceMeaningIndex, targetMeaningIndex: targetMeaningIdx,
    });
    onClose();
  };

  const createNew = () => {
    const srcIsRoot = src?.tags.includes('词根节点');
    const srcIsPrefix = src?.tags.includes('前缀节点');
    const srcIsSuffix = src?.tags.includes('后缀节点');
    const srcIsHub = srcIsRoot || srcIsPrefix || srcIsSuffix;

    let tags: string[] = [];
    let pos = 'v.';

    if (type === 'root-share') {
      // hub ↔ word: opposite of source
      if (srcIsHub) { tags = []; pos = 'v.'; }
      else { tags = ['词根节点']; pos = 'root'; }
    } else if (type === 'prefix-share') {
      if (srcIsHub) { tags = []; pos = 'v.'; }
      else { tags = ['前缀节点']; pos = 'pref'; }
    } else if (type === 'suffix-share') {
      if (srcIsHub) { tags = []; pos = 'v.'; }
      else { tags = ['后缀节点']; pos = 'suf'; }
    } else if (type === 'related-root') {
      tags = ['词根节点']; pos = 'root';
    } else if (type === 'synonym' || type === 'antonym') {
      // Same type as source
      if (srcIsRoot) { tags = ['词根节点']; pos = 'root'; }
      else if (srcIsPrefix) { tags = ['前缀节点']; pos = 'pref'; }
      else if (srcIsSuffix) { tags = ['后缀节点']; pos = 'suf'; }
    }
    // derivative, similar-form, custom → default (tags:[], pos:'v.')

    const w: Word = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      word: search.trim(), pronunciation: '', tags,
      meanings: [{ partOfSpeech: pos, meaning: '(待编辑)', definition: '', example: '', mnemonic: '', notes: '' }],
      notes: '',
    };
    addWord(w);
    addRelationship({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      sourceId: sourceWordId, targetId: w.id,
      type, label: RELATION_LABELS[type], notes: '',
      sourceMeaningIndex, targetMeaningIndex: 0,
    });
    onClose();
  };

  const types: RelationType[] = ['synonym', 'antonym', 'similar-form', 'derivative', 'root-share', 'prefix-share', 'suffix-share', 'related-root', 'custom'];

  const itemBase = {
    padding: '8px 12px', cursor: 'pointer', marginBottom: 2, borderRadius: 6,
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#faf6ee', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: 28, width: 440, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}>
        <h2 style={{ color: '#3a3028', margin: '0 0 4px', fontSize: 18, fontFamily: "'Georgia','Noto Serif SC',serif" }}>添加{RELATION_LABELS[type]}关系</h2>
        <div style={{ color: '#8a8070', fontSize: 13, marginBottom: 16 }}>
          {src?.word}「{srcMeaning?.meaning}」
        </div>

        <label style={{ color: '#6a5a48', fontSize: 12, display: 'block', marginBottom: 4, fontWeight: 500 }}>搜索或创建目标单词</label>
        <input autoFocus value={search} onChange={e => { setSearch(e.target.value); setTargetId(null); }}
          placeholder="输入单词..." style={{ width: '100%', padding: '9px 12px', background: '#faf6ee', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 7, color: '#3a3028', fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 8 }} />

        {/* Existing matches */}
        {filtered.map(w => (
          <div key={w.id} onClick={() => { setTargetId(w.id); setTargetMeaningIdx(0); }} style={{
            ...itemBase,
            background: targetId === w.id ? 'rgba(138,96,32,0.08)' : 'transparent',
            border: targetId === w.id ? '1px solid rgba(138,96,32,0.2)' : '1px solid transparent',
          }}>
            <span style={{ color: '#3a3028', fontWeight: 600, fontSize: 13 }}>{w.word}</span>
            <span style={{ color: '#8a8070', fontSize: 12, marginLeft: 8 }}>{w.meanings[0]?.meaning}</span>
          </div>
        ))}

        {/* Create new word/root/affix */}
        {exactMatch && search.trim() && (() => {
          const sIr = src?.tags.includes('词根节点');
          const sIp = src?.tags.includes('前缀节点');
          const sIs = src?.tags.includes('后缀节点');
          const sHub = sIr || sIp || sIs;
          let tl = '单词';
          if (type === 'root-share') { tl = sHub ? '单词' : '词根'; }
          else if (type === 'prefix-share') { tl = sHub ? '单词' : '前缀'; }
          else if (type === 'suffix-share') { tl = sHub ? '单词' : '后缀'; }
          else if (type === 'related-root') { tl = '词根'; }
          else if (type === 'synonym' || type === 'antonym') {
            if (sIr) tl = '词根'; else if (sIp) tl = '前缀'; else if (sIs) tl = '后缀';
          }
          return (
          <div onClick={createNew} style={{
            padding: '10px 12px', cursor: 'pointer', borderRadius: 7, marginTop: 4,
            background: 'rgba(74,128,80,0.02)',
            border: '1px dashed rgba(74,128,80,0.25)',
          }}>
            <span style={{ color: '#4a8050', fontSize: 13 }}>＋ 创建新{tl} </span>
            <span style={{ color: '#3a3028', fontWeight: 600, fontSize: 13 }}>"{search.trim()}"</span>
            <div style={{ color: '#8a8070', fontSize: 11, marginTop: 2 }}>新{tl}会自动出现在星空图上</div>
          </div>
        );})()}

        {/* Target meaning selector */}
        {targetWord && targetWord.meanings.length > 1 && (
          <div style={{ marginTop: 10 }}>
            <label style={{ color: '#6a5a48', fontSize: 11, display: 'block', marginBottom: 4, fontWeight: 500 }}>选择目标释义（可选）</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              <button onClick={() => setTargetMeaningIdx(undefined)} style={{
                padding: '4px 10px', fontSize: 11, borderRadius: 4, cursor: 'pointer',
                background: targetMeaningIdx === undefined ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.02)',
                border: targetMeaningIdx === undefined ? '1px solid rgba(0,0,0,0.15)' : '1px solid rgba(0,0,0,0.06)',
                color: targetMeaningIdx === undefined ? '#3a3028' : '#8a8070', fontFamily: 'inherit',
              }}>不指定</button>
              {targetWord.meanings.map((m, i) => (
                <button key={i} onClick={() => setTargetMeaningIdx(i)} style={{
                  padding: '4px 10px', fontSize: 11, borderRadius: 4, cursor: 'pointer',
                  background: targetMeaningIdx === i ? 'rgba(138,96,32,0.1)' : 'rgba(0,0,0,0.02)',
                  border: targetMeaningIdx === i ? '1px solid rgba(138,96,32,0.25)' : '1px solid rgba(0,0,0,0.06)',
                  color: targetMeaningIdx === i ? '#3a3028' : '#8a8070', fontFamily: 'inherit',
                }}>{m.meaning || `释义${i + 1}`}</button>
              ))}
            </div>
          </div>
        )}

        {targetId && (
          <div style={{ padding: 8, margin: '10px 0', background: 'rgba(74,128,80,0.06)', border: '1px solid rgba(74,128,80,0.12)', borderRadius: 8, color: '#4a8050', fontSize: 13 }}>
            已选: <strong>{targetWord?.word}</strong>
            {targetMeaningIdx != null && targetWord && <span style={{ color: '#8a8070' }}> — {targetWord.meanings[targetMeaningIdx]?.meaning}</span>}
          </div>
        )}

        <label style={{ color: '#6a5a48', fontSize: 12, display: 'block', marginBottom: 8, marginTop: 14, fontWeight: 500 }}>关系类型</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {types.map(t => (
            <button key={t} onClick={() => setType(t)} style={{
              padding: '6px 12px',
              background: type === t ? `${RELATION_COLORS[t]}18` : 'rgba(0,0,0,0.03)',
              border: type === t ? `1px solid ${RELATION_COLORS[t]}44` : '1px solid rgba(0,0,0,0.08)',
              borderRadius: 6, color: type === t ? RELATION_COLORS[t] : '#8a8070', cursor: 'pointer', fontSize: 12,
              fontFamily: 'inherit',
            }}>{RELATION_LABELS[t]}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button onClick={submit} disabled={!targetId} style={{ flex: 1, padding: 10, background: targetId ? '#3a3028' : 'rgba(0,0,0,0.06)', border: targetId ? '1px solid #3a3028' : '1px solid rgba(0,0,0,0.08)', borderRadius: 8, color: targetId ? '#f5f1e8' : '#aaa', cursor: targetId ? 'pointer' : 'default', fontSize: 14, fontWeight: 600, fontFamily: 'inherit' }}>确认</button>
          <button onClick={onClose} style={{ padding: '10px 20px', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, color: '#6a5a48', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>取消</button>
        </div>
      </div>
    </div>
  );
}
