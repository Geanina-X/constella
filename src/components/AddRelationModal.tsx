import { useState, useMemo } from 'react';
import { useStore } from '../data/store';
import { RELATION_COLORS, RELATION_LABELS } from '../types';
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
  const [creatingNew, setCreatingNew] = useState(false);

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
      type, label: RELATION_LABELS[type],
      sourceMeaningIndex, targetMeaningIndex: targetMeaningIdx,
    });
    onClose();
  };

  const createNew = () => {
    const w: Word = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      word: search.trim(), pronunciation: '', tags: [],
      meanings: [{ partOfSpeech: 'v.', meaning: '', definition: '', example: '', mnemonic: '' }],
      notes: '',
    };
    addWord(w);
    addRelationship({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      sourceId: sourceWordId, targetId: w.id,
      type, label: RELATION_LABELS[type],
      sourceMeaningIndex, targetMeaningIndex: 0,
    });
    onClose();
  };

  const types: RelationType[] = ['synonym', 'antonym', 'similar-form', 'derivative', 'root-share', 'prefix-share', 'suffix-share', 'custom'];

  return (
    <div onClick={onClose} style={{ position:'fixed',inset:0,zIndex:300,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'rgba(15,15,40,0.98)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:14,padding:28,width:440,maxHeight:'80vh',overflowY:'auto' }}>
        <h2 style={{ color:'#fff',margin:'0 0 4px',fontSize:18 }}>添加{RELATION_LABELS[type]}关系</h2>
        <div style={{ color:'#888',fontSize:13,marginBottom:16 }}>
          {src?.word}「{srcMeaning?.meaning}」
        </div>

        <label style={{ color:'#888',fontSize:12,display:'block',marginBottom:4 }}>搜索或创建目标单词</label>
        <input autoFocus value={search} onChange={e=>{setSearch(e.target.value);setTargetId(null);setCreatingNew(false);}}
          placeholder="输入单词..." style={{ width:'100%',padding:'8px 12px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:6,color:'#fff',fontSize:14,outline:'none',boxSizing:'border-box',marginBottom:8 }} />

        {/* Existing matches */}
        {filtered.map(w=>(
          <div key={w.id} onClick={()=>{setTargetId(w.id);setTargetMeaningIdx(0);setCreatingNew(false);}} style={{
            padding:'8px 12px',cursor:'pointer',marginBottom:2,
            background:targetId===w.id?'rgba(100,200,255,0.12)':'transparent',
            border:targetId===w.id?'1px solid rgba(100,200,255,0.25)':'1px solid transparent',borderRadius:6,
          }}>
            <span style={{color:'#fff',fontWeight:600,fontSize:13}}>{w.word}</span>
            <span style={{color:'#888',fontSize:12,marginLeft:8}}>{w.meanings[0]?.meaning}</span>
          </div>
        ))}

        {/* Create new word */}
        {exactMatch && search.trim() && (
          <div onClick={createNew} style={{
            padding:'10px 12px',cursor:'pointer',borderRadius:6,marginTop:4,
            background:creatingNew?'rgba(100,255,150,0.12)':'rgba(100,255,150,0.04)',
            border:'1px dashed rgba(100,255,150,0.25)',
          }}>
            <span style={{color:'#5ee0a0',fontSize:13}}>＋ 创建新单词 </span>
            <span style={{color:'#fff',fontWeight:600,fontSize:13}}>"{search.trim()}"</span>
            <div style={{color:'#888',fontSize:11,marginTop:2}}>新单词会自动出现在星空图上</div>
          </div>
        )}

        {/* Target meaning selector */}
        {targetWord && targetWord.meanings.length > 1 && (
          <div style={{ marginTop:10 }}>
            <label style={{color:'#888',fontSize:11,display:'block',marginBottom:4}}>选择目标释义（可选）</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
              <button onClick={()=>setTargetMeaningIdx(undefined)} style={{
                padding:'4px 10px',fontSize:11,borderRadius:4,cursor:'pointer',
                background:targetMeaningIdx===undefined?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.04)',
                border:targetMeaningIdx===undefined?'1px solid rgba(255,255,255,0.2)':'1px solid rgba(255,255,255,0.06)',
                color:targetMeaningIdx===undefined?'#fff':'#888',
              }}>不指定</button>
              {targetWord.meanings.map((m,i)=>(
                <button key={i} onClick={()=>setTargetMeaningIdx(i)} style={{
                  padding:'4px 10px',fontSize:11,borderRadius:4,cursor:'pointer',
                  background:targetMeaningIdx===i?'rgba(100,200,255,0.15)':'rgba(255,255,255,0.04)',
                  border:targetMeaningIdx===i?'1px solid rgba(100,200,255,0.3)':'1px solid rgba(255,255,255,0.06)',
                  color:targetMeaningIdx===i?'#fff':'#888',
                }}>{m.meaning||`释义${i+1}`}</button>
              ))}
            </div>
          </div>
        )}

        {targetId && (
          <div style={{padding:8,margin:'10px 0',background:'rgba(100,255,100,0.06)',border:'1px solid rgba(100,255,100,0.15)',borderRadius:8,color:'#5ec4c0',fontSize:13}}>
            已选: <strong>{targetWord?.word}</strong>
            {targetMeaningIdx!=null&&targetWord&&<span style={{color:'#888'}}> — {targetWord.meanings[targetMeaningIdx]?.meaning}</span>}
          </div>
        )}

        <label style={{color:'#888',fontSize:12,display:'block',marginBottom:8,marginTop:14}}>关系类型</label>
        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
          {types.map(t=>(
            <button key={t} onClick={()=>setType(t)} style={{
              padding:'6px 12px',
              background:type===t?`${RELATION_COLORS[t]}22`:'rgba(255,255,255,0.04)',
              border:type===t?`1px solid ${RELATION_COLORS[t]}55`:'1px solid rgba(255,255,255,0.08)',
              borderRadius:6,color:type===t?RELATION_COLORS[t]:'#888',cursor:'pointer',fontSize:12,
            }}>{RELATION_LABELS[t]}</button>
          ))}
        </div>

        <div style={{display:'flex',gap:12,marginTop:20}}>
          <button onClick={submit} disabled={!targetId} style={{flex:1,padding:10,background:targetId?'rgba(100,200,255,0.2)':'rgba(255,255,255,0.04)',border:targetId?'1px solid rgba(100,200,255,0.4)':'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:targetId?'#fff':'#555',cursor:targetId?'pointer':'default',fontSize:14,fontWeight:600}}>确认</button>
          <button onClick={onClose} style={{padding:'10px 20px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#888',cursor:'pointer',fontSize:14}}>取消</button>
        </div>
      </div>
    </div>
  );
}
