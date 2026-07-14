import { useState, useMemo } from 'react';
import { useStore } from '../data/store';
import { RELATION_LABELS } from '../types';
import { RELATION_COLORS, getNodeColor, POS_OPTIONS } from '../utils/graphStyles';
import type { WordMeaning, RelationType, Relationship } from '../types';

const S = {
  wordName: 24, pron: 14, sectionTitle: 12, meaningText: 16,
  posText: 14, relWord: 14, relMeaning: 12, body: 15, addBtn: 12,
};

export default function WordDetailPanel({ onAddRelation, readonly }: {
  onAddRelation?: (wordId: string, meaningIndex: number, type: RelationType) => void;
  readonly?: boolean;
}) {
  const { words, relationships, selectedWordId, selectWord, updateWord, deleteWord, deleteRelationship } = useStore();
  const word = words.find((w) => w.id === selectedWordId);

  const groupedMeanings = useMemo(() => {
    if (!word) return [];
    const map = new Map<string, { pos: string; items: { meaning: WordMeaning; originalIndex: number }[] }>();
    word.meanings.forEach((m, i) => {
      const g = map.get(m.partOfSpeech) || { pos: m.partOfSpeech, items: [] };
      g.items.push({ meaning: m, originalIndex: i });
      map.set(m.partOfSpeech, g);
    });
    return Array.from(map.values());
  }, [word?.meanings]);

  if (!word) return null;

  const isRoot = word.tags.includes('词根节点');
  const isPrefix = word.tags.includes('前缀节点');
  const isSuffix = word.tags.includes('后缀节点');
  const isSpecial = isRoot || isPrefix || isSuffix;
  const allRels = relationships.filter(r => r.sourceId === word.id || r.targetId === word.id);
  const getOther = (rel: Relationship) => { const oid = rel.sourceId === word.id ? rel.targetId : rel.sourceId; return words.find(w => w.id === oid); };
  const editTarget = (wid:string,midx:number,val:string) => {
    const tw=words.find(w=>w.id===wid);if(!tw)return;
    const ms=[...tw.meanings];ms[midx]={...ms[midx],meaning:val};updateWord(wid,{meanings:ms});
  };
  const addRel = readonly ? undefined : onAddRelation;

  const emptyMeaning = (pos: string): WordMeaning => ({ partOfSpeech: pos, meaning: '', definition: '', example: '', mnemonic: '', notes: '' });

  const addMeaningToGroup = (pos: string) => {
    updateWord(word.id, { meanings: [...word.meanings, emptyMeaning(pos)] });
  };

  const addNewPosGroup = (pos: string) => {
    updateWord(word.id, { meanings: [...word.meanings, emptyMeaning(pos)] });
  };

  return (
    <div style={{ position:'fixed',right:0,top:56,bottom:12,width:420,zIndex:150,
      background:'rgba(250,246,238,0.97)',backdropFilter:'blur(24px)',
      border:'1px solid rgba(0,0,0,0.05)',borderRadius:'12px 0 0 12px',
      boxShadow:'-4px 0 20px rgba(0,0,0,0.04)',
      display:'flex',flexDirection:'column',overflow:'hidden' }}>
      {/* Header */}
      <div style={{ padding:'18px 20px 14px',borderBottom:'1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <InlineEdit value={word.word} onSave={v=>updateWord(word.id,{word:v})} fontSize={S.wordName} color='#3a3028' weight={700} readonly={readonly} />
              <button onClick={() => { const u = new SpeechSynthesisUtterance(word.word); u.lang = 'en-US'; u.rate = 0.85; speechSynthesis.speak(u); }}
                title="播放读音" aria-label={`播放 ${word.word} 的读音`}
                style={{ background:'none', border:'none', color:'#b0a090', fontSize:18, cursor:'pointer', padding:'2px 4px', lineHeight:1, transition:'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#6a5a48')}
                onMouseLeave={e => (e.currentTarget.style.color = '#b0a090')}>
                🔊
              </button>
            </div>
            {word.pronunciation ? <div style={{ marginTop:4 }}>
              <InlineEdit value={word.pronunciation} onSave={v=>updateWord(word.id,{pronunciation:v})} fontSize={S.pron} color='#888' readonly={readonly} />
            </div> : null}
          </div>
          <button onClick={()=>selectWord(null)} style={{ background:'none',border:'none',color:'#5a4a38',fontSize:18,cursor:'pointer',padding:'4px 8px' }}>✕</button>
        </div>
      </div>

      <div style={{ flex:1,overflowY:'auto',padding:'16px 20px' }}>

        {/* ═══ Special: root/prefix/suffix ═══ */}
        {isSpecial && <>
          <SectionTitle>释义</SectionTitle>
          {word.meanings.map((m,i)=>(
            <MeaningBlock key={i} meaning={m} hidePOS onChange={upd=>{const ms=[...word.meanings];ms[i]={...ms[i],...upd};updateWord(word.id,{meanings:ms});}} onDelete={()=>updateWord(word.id,{meanings:word.meanings.filter((_,j)=>j!==i)})} readonly={readonly} />
          ))}
          {!readonly && <SubtleAdd onClick={()=>updateWord(word.id,{meanings:[...word.meanings,emptyMeaning(isRoot?'root':isPrefix?'pref':'suf')]})} label="添加释义" />}

          <Spacer />
          <SectionTitle>{isRoot?'同词根单词':isPrefix?'同前缀单词':'同后缀单词'}</SectionTitle>
          <RelGroup rels={allRels.filter(r=>r.type===(isRoot?'root-share':isPrefix?'prefix-share':'suffix-share'))} getOther={getOther} onSelect={selectWord} onDelete={deleteRelationship} readonly={readonly} />
          {!readonly && addRel && <SubtleAdd onClick={()=>addRel(word.id,0,isRoot?'root-share':isPrefix?'prefix-share':'suffix-share')} label="添加单词" />}

          <Spacer />
          <SectionTitle>关联词根 / 词缀</SectionTitle>
          <RelGroup rels={allRels.filter(r=>r.type==='related-root')} getOther={getOther} onSelect={selectWord} onDelete={deleteRelationship} readonly={readonly} />
          {!readonly && addRel && <SubtleAdd onClick={()=>addRel(word.id,0,'related-root')} label="添加关联词根/词缀" />}

          {word.notes && (<><Spacer /><Card><SectionTitle>备注</SectionTitle><div style={{fontSize:13,color:'#5a4a48',lineHeight:1.5,whiteSpace:'pre-wrap'}}>{word.notes}</div></Card></>)}
        </>}

        {/* ═══ Regular word ═══ */}
        {!isSpecial && <>
          <Card><SectionTitle>释义</SectionTitle>
          {groupedMeanings.map(group => (
            <div key={group.pos} style={{ marginBottom: 14 }}>
              <div style={{
                color: getNodeColor(group.pos), fontSize: S.posText + 1, fontWeight: 700,
                marginBottom: 6, paddingBottom: 3,
                borderBottom: `1px solid ${getNodeColor(group.pos)}22`,
              }}>{group.pos}</div>
              {group.items.map(({ meaning: m, originalIndex: i }) => {
                const indexedSyn = allRels.filter(r => r.type === 'synonym' && relIdx(r, word.id) === i);
                const indexedAnt = allRels.filter(r => r.type === 'antonym' && relIdx(r, word.id) === i);
                const orphanSyn = i === 0 ? allRels.filter(r => r.type === 'synonym' && relIdx(r, word.id) == null) : [];
                const orphanAnt = i === 0 ? allRels.filter(r => r.type === 'antonym' && relIdx(r, word.id) == null) : [];
                const synRels = indexedSyn.concat(orphanSyn);
                const antRels = indexedAnt.concat(orphanAnt);
                return (
                  <div key={i} style={{ marginBottom: 8, marginLeft: 6 }}>
                    <MeaningBlock meaning={m} hidePOS
                      onChange={upd => { const ms = [...word.meanings]; ms[i] = { ...ms[i], ...upd }; updateWord(word.id, { meanings: ms }); }}
                      onDelete={() => updateWord(word.id, { meanings: word.meanings.filter((_, j) => j !== i) })}
                      readonly={readonly} />
                    {(synRels.length > 0 || antRels.length > 0 || (!readonly && addRel)) && (
                      <InlineRelTags
                        synRels={synRels} antRels={antRels}
                        getOther={getOther} onEditTarget={editTarget}
                        onSelect={selectWord} onDelete={deleteRelationship}
                        onAddSyn={addRel ? () => addRel(word.id, i, 'synonym') : undefined}
                        onAddAnt={addRel ? () => addRel(word.id, i, 'antonym') : undefined}
                        readonly={readonly}
                      />
                    )}
                  </div>
                );
              })}
              {!readonly && <SubtleAdd onClick={() => addMeaningToGroup(group.pos)} label={`添加${group.pos}释义`} />}
            </div>
          ))}
          {!readonly && <AddPosGroup onSelect={addNewPosGroup} />}
          </Card>

          <Spacer />

          <Card><Collapse title="Word Family" defaultOpen={allRels.some(r=>r.type==='derivative')}>
            <RelGroup rels={allRels.filter(r=>r.type==='derivative')} onEditTarget={editTarget} getOther={getOther} onSelect={selectWord} onDelete={deleteRelationship} readonly={readonly} />
            {!readonly && addRel && <SubtleAdd onClick={()=>addRel(word.id,0,'derivative')} label="添加" />}
          </Collapse></Card>

          <Card><Collapse title="词根词缀" defaultOpen={allRels.some(r=>r.type==='root-share'||r.type==='prefix-share'||r.type==='suffix-share')}>
            {(['root-share','prefix-share','suffix-share'] as RelationType[]).map(t=>{
              const rels=allRels.filter(r=>r.type===t);
              return (
                <div key={t} style={{ marginBottom:6 }}>
                  <div style={{ color:RELATION_COLORS[t],fontSize:11,fontWeight:600,marginBottom:2 }}>{RELATION_LABELS[t]}</div>
                  <RelGroup rels={rels} onEditTarget={editTarget} getOther={getOther} onSelect={selectWord} onDelete={deleteRelationship} readonly={readonly} />
                  {!readonly && addRel && <SubtleAdd onClick={()=>addRel(word.id,0,t)} label={`添加${RELATION_LABELS[t]}`} />}
                </div>
              );
            })}
          </Collapse></Card>

          <Card><Collapse title="形近词" defaultOpen={allRels.some(r=>r.type==='similar-form')}>
            <RelGroup rels={allRels.filter(r=>r.type==='similar-form')} onEditTarget={editTarget} getOther={getOther} onSelect={selectWord} onDelete={deleteRelationship} readonly={readonly} />
            {!readonly && addRel && <SubtleAdd onClick={()=>addRel(word.id,0,'similar-form')} label="添加" />}
          </Collapse></Card>

          {word.notes && <Card><SectionTitle>备注</SectionTitle><div style={{fontSize:13,color:'#5a4a48',lineHeight:1.5,whiteSpace:'pre-wrap'}}>{word.notes}</div></Card>}
        </>}
      </div>

      {/* Delete — hidden in readonly mode */}
      {!readonly && (
        <div style={{ padding:'12px 20px',borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          <button onClick={()=>{if(confirm(`删除 "${word.word}"？`)) deleteWord(word.id);}}
            style={{ width:'100%',padding:8,background:'rgba(200,68,68,0.06)',border:'1px solid rgba(200,68,68,0.15)',borderRadius:6,color:'#e88',cursor:'pointer',fontSize:12 }}>
            删除单词
          </button>
        </div>
      )}
    </div>
  );
}

// ── Components ──

function SectionTitle({children}:{children:string}){return <div style={{color:'#3a3028',fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:8}}>{children}</div>;}
function Spacer(){return <div style={{height:16}}/>;}
function Card({children}:{children:React.ReactNode}){return <div style={{marginBottom:14,padding:14,background:'rgba(0,0,0,0.015)',border:'1px solid rgba(0,0,0,0.07)',borderRadius:10}}>{children}</div>;}

function MeaningBlock({meaning,onChange,onDelete,readonly,hidePOS}:{meaning:WordMeaning;onChange:(u:Partial<WordMeaning>)=>void;onDelete:()=>void;readonly?:boolean;hidePOS?:boolean}){
  const [showNotes, setShowNotes] = useState(false);
  const hasNotes = !!meaning.notes;
  if (readonly) {
    return (
      <div>
        <div style={{ display:'flex',gap:8,alignItems:'center' }}>
          {!hidePOS && <span style={{ width:60,textAlign:'center',color:getNodeColor(meaning.partOfSpeech),fontSize:S.posText,fontWeight:600 }}>{meaning.partOfSpeech}</span>}
          <span style={{ fontSize:S.meaningText,color:'#2a1a10',fontWeight:600,lineHeight:1.4 }}>{meaning.meaning}</span>
        </div>
        {meaning.notes && <div style={{ marginLeft: hidePOS ? 0 : 68, marginTop: 2, fontSize: 11, color: '#9a8a78', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{meaning.notes}</div>}
      </div>
    );
  }
  return (
    <div>
      <div style={{ display:'flex',gap:6,alignItems:'center' }}>
        {!hidePOS && <PosChip value={meaning.partOfSpeech} onChange={v=>onChange({partOfSpeech:v})} />}
        <InlineEdit value={meaning.meaning} onSave={v=>onChange({meaning:v})} fontSize={S.meaningText} color='#2a1a10' weight={600} />
        <button onClick={() => setShowNotes(!showNotes)} title={hasNotes ? '点击查看/编辑备注' : '添加备注'} style={{
          background: hasNotes ? '#f5e6c8' : 'none',
          border: hasNotes ? '1px solid #d4b87a' : 'none',
          color: hasNotes ? '#8b6914' : '#c0b8a8',
          fontSize: 11, cursor: 'pointer', padding: hasNotes ? '1px 6px' : '2px 4px',
          borderRadius: hasNotes ? 3 : 0, flexShrink: 0,
          fontWeight: hasNotes ? 500 : 400,
        }}>{hasNotes ? '📝 备注' : '📝'}</button>
        <button onClick={onDelete} style={{ background:'none',border:'none',color:'#c0b8a8',fontSize:10,cursor:'pointer',padding:'2px 4px',flexShrink:0 }}>✕</button>
      </div>
      {/* collapsed preview when notes exist but textarea is hidden */}
      {hasNotes && !showNotes && (
        <div style={{ marginLeft: hidePOS ? 0 : 72, marginTop: 3, fontSize: 11, color: '#b0a088', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 300, cursor: 'pointer' }}
          onClick={() => setShowNotes(true)} title="点击展开备注">
          {meaning.notes}
        </div>
      )}
      {showNotes && (
        <div style={{ marginLeft: hidePOS ? 0 : 72, marginTop: 4 }}>
          <textarea value={meaning.notes} onChange={e => onChange({ notes: e.target.value })}
            placeholder="备注（英文释义、例句、记法...）"
            rows={3}
            style={{
              width: '100%', padding: '6px 10px', fontSize: 12,
              background: '#faf6ee', border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: 6, color: '#3a3028', outline: 'none',
              boxSizing: 'border-box' as const, resize: 'vertical',
              fontFamily: 'inherit',
            }} />
        </div>
      )}
    </div>
  );
}

function PosChip({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [custom, setCustom] = useState('');
  const isCustom = !POS_OPTIONS.includes(value) && value !== '';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
      <select value={isCustom ? '__custom__' : value} onChange={e => {
        if (e.target.value === '__custom__') { setCustom(''); onChange(''); }
        else onChange(e.target.value);
      }} style={{
        width: 58, padding: '3px 2px', fontSize: S.posText, fontWeight: 600,
        background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 4, color: getNodeColor(isCustom ? custom : value),
        outline: 'none', textAlign: 'center', fontFamily: 'inherit',
      }}>
        {POS_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
        {(isCustom || !POS_OPTIONS.includes(value)) && <option value="__custom__">…</option>}
      </select>
      {isCustom && (
        <input value={custom || value} onChange={e => { setCustom(e.target.value); onChange(e.target.value); }}
          placeholder="自定义" style={{
            width: 60, padding: '2px 4px', fontSize: 11,
            background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 4, color: '#3a3028', outline: 'none', fontFamily: 'inherit',
          }} />
      )}
    </div>
  );
}

function AddPosGroup({ onSelect }: { onSelect: (pos: string) => void }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState('');
  if (!open) return <SubtleAdd onClick={() => setOpen(true)} label="添加词性" />;
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
        {POS_OPTIONS.map(p => (
          <button key={p} onClick={() => { onSelect(p); setOpen(false); }} style={{
            padding: '3px 8px', fontSize: 11, borderRadius: 12, cursor: 'pointer',
            background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)',
            color: getNodeColor(p), fontFamily: 'inherit', fontWeight: 500,
          }}>{p}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <input value={custom} onChange={e => setCustom(e.target.value)} placeholder="自定义词性..."
          style={{
            flex: 1, padding: '4px 8px', fontSize: 11,
            background: '#faf6ee', border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: 6, color: '#3a3028', outline: 'none', fontFamily: 'inherit',
          }} />
        <button onClick={() => { if (custom.trim()) { onSelect(custom.trim()); setOpen(false); setCustom(''); } }} style={{
          padding: '4px 10px', fontSize: 11, borderRadius: 6, cursor: 'pointer',
          background: custom.trim() ? '#3a3028' : 'rgba(0,0,0,0.04)',
          border: '1px solid ' + (custom.trim() ? '#3a3028' : 'rgba(0,0,0,0.08)'),
          color: custom.trim() ? '#f5f1e8' : '#aaa', fontFamily: 'inherit',
        }}>确定</button>
        <button onClick={() => setOpen(false)} style={{
          padding: '4px 8px', fontSize: 11, borderRadius: 6, cursor: 'pointer',
          background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)',
          color: '#8a8070', fontFamily: 'inherit',
        }}>取消</button>
      </div>
    </div>
  );
}

function RelLine({rel,getOther,onSelect,onDelete,onEditTarget,readonly}:{
  rel:Relationship;getOther:(r:Relationship)=>ReturnType<typeof useStore.getState>['words'][0]|undefined;
  onSelect:(id:string|null)=>void;onDelete:(id:string)=>void;
  onEditTarget?:(wordId:string,meaningIdx:number,value:string)=>void;
  readonly?:boolean;
}){
  const [showNotes, setShowNotes] = useState(false);
  const { updateRelationship } = useStore();
  const w = getOther(rel);
  if (!w) return null;
  const midx = rel.sourceId === w.id ? rel.sourceMeaningIndex : rel.targetMeaningIndex;
  const defIdx = midx ?? 0;
  const hasNotes = !!rel.notes;
  return (
    <div>
      <div style={{ display:'flex',alignItems:'center',gap:6,padding:'3px 0' }}>
        <span onClick={()=>onSelect(w.id)} style={{ color:'#4a4038',fontSize:S.relWord,cursor:'pointer',fontWeight:500 }}>{w.word}</span>
        {readonly ? (
          <span style={{ color:'#4a3a28',fontSize:S.relMeaning,flex:1 }}>{w.meanings[0]?.partOfSpeech} {w.meanings[0]?.meaning}</span>
        ) : onEditTarget ? (
          <InlineEdit value={w.meanings[defIdx]?.meaning||''} onSave={v=>onEditTarget(w.id,defIdx,v)} fontSize={S.relMeaning} color='#4a3a28' />
        ) : (
          <span style={{ color:'#4a3a28',fontSize:S.relMeaning,flex:1 }}>{w.meanings[0]?.partOfSpeech} {w.meanings[0]?.meaning}</span>
        )}
        {!readonly && (
          <button onClick={() => setShowNotes(!showNotes)} title={hasNotes ? '点击查看/编辑辨析' : '添加辨析笔记'} style={{
            background: hasNotes ? '#e8e0d0' : 'none',
            border: hasNotes ? '1px solid #c4b898' : 'none',
            color: hasNotes ? '#6a5a38' : '#c0b8a8',
            fontSize: 10, cursor: 'pointer', padding: hasNotes ? '1px 5px' : '2px 3px',
            borderRadius: hasNotes ? 3 : 0, flexShrink: 0,
            fontWeight: hasNotes ? 500 : 400,
          }}>{hasNotes ? '📝 辨析' : '📝'}</button>
        )}
        {!readonly && <button onClick={()=>onDelete(rel.id)} style={{ background:'none',border:'none',color:'#c0b8a8',fontSize:9,cursor:'pointer',padding:'2px 4px',flexShrink:0 }}>✕</button>}
      </div>
      {/* readonly: always show notes if present */}
      {readonly && hasNotes && (
        <div style={{ marginLeft: 6, marginTop: 1, fontSize: 10, color: '#9a8a78', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{rel.notes}</div>
      )}
      {/* collapsed preview */}
      {!readonly && hasNotes && !showNotes && (
        <div style={{ marginLeft: 6, marginTop: 1, fontSize: 10, color: '#b0a088', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 280, cursor: 'pointer' }}
          onClick={() => setShowNotes(true)} title="点击展开辨析">
          {rel.notes}
        </div>
      )}
      {showNotes && (
        <div style={{ marginLeft: 6, marginTop: 4, marginBottom: 4 }}>
          <textarea value={rel.notes} onChange={e => updateRelationship(rel.id, { notes: e.target.value })}
            placeholder="辨析笔记（这两个词有什么区别？用法、语境、侧重点...）"
            rows={2}
            style={{
              width: '100%', padding: '5px 8px', fontSize: 11,
              background: '#faf6ee', border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: 5, color: '#3a3028', outline: 'none',
              boxSizing: 'border-box' as const, resize: 'vertical',
              fontFamily: 'inherit',
            }} />
        </div>
      )}
    </div>
  );
}

function RelGroup({rels,getOther,onSelect,onDelete,onEditTarget,readonly}:{
  rels:Relationship[];getOther:(r:Relationship)=>ReturnType<typeof useStore.getState>['words'][0]|undefined;
  onSelect:(id:string|null)=>void;onDelete:(id:string)=>void;
  onEditTarget?:(wordId:string,meaningIdx:number,value:string)=>void;
  readonly?:boolean;
}){
  if(rels.length===0)return null;
  return <div style={{ marginBottom:2 }}>
    {rels.map(rel=>(
      <RelLine key={rel.id} rel={rel} getOther={getOther} onSelect={onSelect} onDelete={onDelete} onEditTarget={onEditTarget} readonly={readonly} />
    ))}
  </div>;
}

function SubtleAdd({onClick,label}:{onClick:()=>void;label:string}){
  return <button onClick={onClick} style={{
    background:'none',border:'none',color:'#5a4a38',cursor:'pointer',fontSize:S.addBtn,padding:'2px 0',
    opacity:0.6,transition:'opacity 0.2s',
  }} onMouseEnter={e=>{(e.target as HTMLElement).style.opacity='1'}} onMouseLeave={e=>{(e.target as HTMLElement).style.opacity='0.6'}}>
    ＋ {label}
  </button>;
}

function Collapse({title,children,defaultOpen,color,indent}:{title:string;children:React.ReactNode;defaultOpen?:boolean;color?:string;indent?:boolean}){
  const [open,setOpen]=useState(!!defaultOpen);
  return <div style={{ marginBottom:indent?2:10 }}>
    <div onClick={()=>setOpen(!open)} style={{ color:color||'#999',fontSize:12,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:4,marginBottom:open?6:0,padding:'2px 0' }}>
      <span style={{fontSize:10}}>{open?'▼':'▶'}</span> {title}
    </div>
    {open && <div style={{ marginLeft:indent?20:12 }}>{children}</div>}
  </div>;
}

function InlineEdit({value,onSave,fontSize,color,weight,readonly}:{value:string;onSave:(v:string)=>void;fontSize:number;color:string;weight?:number;readonly?:boolean}){
  const [editing,setEditing]=useState(false);const [text,setText]=useState(value);
  if (readonly) return <span style={{fontSize,color,fontWeight:weight,lineHeight:1.4}}>{value||''}</span>;
  if(!editing)return <span onClick={()=>{setEditing(true);setText(value);}} style={{cursor:'text',fontSize,color,fontWeight:weight,lineHeight:1.4}}>{value||'(编辑)'}</span>;
  return <input autoFocus value={text} onChange={e=>setText(e.target.value)}
    onKeyDown={e=>{if(e.key==='Enter'){onSave(text);setEditing(false);}if(e.key==='Escape')setEditing(false);}}
    onBlur={()=>{onSave(text);setEditing(false);}}
    style={{background:'rgba(0,0,0,0.08)',border:'1px solid rgba(0,0,0,0.15)',borderRadius:4,color:'#3a3028',padding:'2px 8px',fontSize,fontWeight:weight,outline:'none',width:'100%'}} />;
}

function InlineRelTags({ synRels, antRels, getOther, onEditTarget, onSelect, onDelete, onAddSyn, onAddAnt, readonly }: {
  synRels: Relationship[]; antRels: Relationship[];
  getOther: (r: Relationship) => ReturnType<typeof useStore.getState>['words'][0] | undefined;
  onEditTarget?: (wordId: string, meaningIdx: number, value: string) => void;
  onSelect: (id: string | null) => void; onDelete: (id: string) => void;
  onAddSyn?: () => void; onAddAnt?: () => void; readonly?: boolean;
}) {
  const [open, setOpen] = useState<'syn' | 'ant' | null>(null);

  const tag = (label: string, count: number, color: string, onAdd?: () => void, relType?: 'syn' | 'ant') => {
    const has = count > 0;
    const isOpen = open === relType;
    const bg = `${color}14`;
    const border = `${color}28`;
    const fg = `${color}88`;
    const base: React.CSSProperties = {
      fontSize: 10, padding: '1px 7px', borderRadius: 9, cursor: 'pointer',
      background: bg, border: `1px solid ${border}`, color: fg,
      fontFamily: 'inherit', lineHeight: '16px',
    };
    const text = has ? `${label} ${count}` : `+ ${label}`;
    const title = has ? undefined : `添加${label}关系`;

    return (
      <button key={label} onClick={() => {
        if (has) setOpen(isOpen ? null : relType!);
        else onAdd?.();
      }} style={base} title={title}>
        {text}
      </button>
    );
  };

  return (
    <div style={{ marginLeft: 6, marginTop: 2 }}>
      <div style={{ display: 'flex', gap: 5 }}>
        {tag('同义', synRels.length, RELATION_COLORS.synonym, onAddSyn, 'syn')}
        {tag('反义', antRels.length, RELATION_COLORS.antonym, onAddAnt, 'ant')}
      </div>
      {open === 'syn' && synRels.length > 0 && (
        <div style={{ marginTop: 4, marginLeft: 2 }}>
          <RelGroup rels={synRels} onEditTarget={onEditTarget} getOther={getOther} onSelect={onSelect} onDelete={onDelete} readonly={readonly} />
        </div>
      )}
      {open === 'ant' && antRels.length > 0 && (
        <div style={{ marginTop: 4, marginLeft: 2 }}>
          <RelGroup rels={antRels} onEditTarget={onEditTarget} getOther={getOther} onSelect={onSelect} onDelete={onDelete} readonly={readonly} />
        </div>
      )}
    </div>
  );
}

function relIdx(rel:Relationship, wordId:string):number|undefined{
  const isSrc=rel.sourceId===wordId;
  return isSrc?rel.sourceMeaningIndex:rel.targetMeaningIndex;
}
