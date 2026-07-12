import { useState } from 'react';
import { useStore } from '../data/store';
import { RELATION_LABELS } from '../types';
import { RELATION_COLORS, getNodeColor } from '../utils/graphStyles';
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
  if (!word) return null;

  const isRoot = word.tags.includes('词根节点');
  const isPrefix = word.tags.includes('前缀节点');
  const isSpecial = isRoot || isPrefix;
  const allRels = relationships.filter(r => r.sourceId === word.id || r.targetId === word.id);
  const getOther = (rel: Relationship) => { const oid = rel.sourceId === word.id ? rel.targetId : rel.sourceId; return words.find(w => w.id === oid); };
  const editTarget = (wid:string,midx:number,val:string) => {
    const tw=words.find(w=>w.id===wid);if(!tw)return;
    const ms=[...tw.meanings];ms[midx]={...ms[midx],meaning:val};updateWord(wid,{meanings:ms});
  };
  const addRel = readonly ? undefined : (onAddRelation || (() => {}));

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
                title="播放读音"
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

        {/* ═══ Special: root/prefix ═══ */}
        {isSpecial && <>
          <SectionTitle>词根释义</SectionTitle>
          {word.meanings.map((m,i)=>(
            <MeaningBlock key={i} meaning={m} onChange={upd=>{const ms=[...word.meanings];ms[i]={...ms[i],...upd};updateWord(word.id,{meanings:ms});}} onDelete={()=>updateWord(word.id,{meanings:word.meanings.filter((_,j)=>j!==i)})} readonly={readonly} />
          ))}
          {!readonly && <SubtleAdd onClick={()=>updateWord(word.id,{meanings:[...word.meanings,{partOfSpeech:'root',meaning:'',definition:'',example:'',mnemonic:''}]})} label="添加释义" />}

          <Spacer />
          <SectionTitle>{isRoot?'同词根单词':'同前缀单词'}</SectionTitle>
          <RelGroup rels={allRels.filter(r=>r.type===(isRoot?'root-share':'prefix-share'))} getOther={getOther} onSelect={selectWord} onDelete={deleteRelationship} readonly={readonly} />
          {!readonly && addRel && <SubtleAdd onClick={()=>addRel(word.id,0,isRoot?'root-share':'prefix-share')} label="添加单词" />}
        </>}

        {/* ═══ Regular word ═══ */}
        {!isSpecial && <>
          <Card><SectionTitle>释义</SectionTitle>
          {word.meanings.map((m,i)=>{
            const synRels=allRels.filter(r=>r.type==='synonym'&&relIdx(r,word.id)===i);
            const antRels=allRels.filter(r=>r.type==='antonym'&&relIdx(r,word.id)===i);
            if(i===0){
              synRels.push(...allRels.filter(r=>r.type==='synonym'&&relIdx(r,word.id)==null));
              antRels.push(...allRels.filter(r=>r.type==='antonym'&&relIdx(r,word.id)==null));
            }
            return (
              <div key={i} style={{ marginBottom:12 }}>
                <MeaningBlock meaning={m} onChange={upd=>{const ms=[...word.meanings];ms[i]={...ms[i],...upd};updateWord(word.id,{meanings:ms});}} onDelete={()=>updateWord(word.id,{meanings:word.meanings.filter((_,j)=>j!==i)})} readonly={readonly} />
                <Collapse title={`同义词${synRels.length>0?` (${synRels.length})`:''}`} color={RELATION_COLORS.synonym}
                  defaultOpen={synRels.length>0} indent>
                  <RelGroup rels={synRels} onEditTarget={editTarget} getOther={getOther} onSelect={selectWord} onDelete={deleteRelationship} readonly={readonly} />
                  {!readonly && addRel && <SubtleAdd onClick={()=>addRel(word.id,i,'synonym')} label="添加" />}
                </Collapse>
                <Collapse title={`反义词${antRels.length>0?` (${antRels.length})`:''}`} color={RELATION_COLORS.antonym}
                  defaultOpen={antRels.length>0} indent>
                  <RelGroup rels={antRels} onEditTarget={editTarget} getOther={getOther} onSelect={selectWord} onDelete={deleteRelationship} readonly={readonly} />
                  {!readonly && addRel && <SubtleAdd onClick={()=>addRel(word.id,i,'antonym')} label="添加" />}
                </Collapse>
              </div>
            );
          })}
          {!readonly && <SubtleAdd onClick={()=>updateWord(word.id,{meanings:[...word.meanings,{partOfSpeech:'v.',meaning:'新释义',definition:'',example:'',mnemonic:''}]})} label="添加释义" />}</Card>

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

function MeaningBlock({meaning,onChange,onDelete,readonly}:{meaning:WordMeaning;onChange:(u:Partial<WordMeaning>)=>void;onDelete:()=>void;readonly?:boolean}){
  if (readonly) {
    return (
      <div style={{ display:'flex',gap:8,alignItems:'center' }}>
        <span style={{ width:60,textAlign:'center',color:getNodeColor(meaning.partOfSpeech),fontSize:S.posText,fontWeight:600 }}>{meaning.partOfSpeech}</span>
        <span style={{ fontSize:S.meaningText,color:'#2a1a10',fontWeight:600,lineHeight:1.4 }}>{meaning.meaning}</span>
      </div>
    );
  }
  return (
    <div style={{ display:'flex',gap:8,alignItems:'center' }}>
      <input list="pos-list-detail" value={meaning.partOfSpeech} onChange={e=>onChange({partOfSpeech:e.target.value})}
        style={{ width:60,background:'rgba(0,0,0,0.04)',border:'1px solid rgba(0,0,0,0.08)',borderRadius:4,color:getNodeColor(meaning.partOfSpeech),fontSize:S.posText,fontWeight:600,padding:'3px 4px',outline:'none',textAlign:'center' }} />
      <datalist id="pos-list-detail">
        <option value="v." /><option value="vi." /><option value="vt." />
        <option value="n." /><option value="adj." /><option value="adv." />
        <option value="prep." /><option value="conj." /><option value="pron." />
        <option value="interj." /><option value="art." /><option value="num." />
        <option value="det." /><option value="aux." />
      </datalist>
      <InlineEdit value={meaning.meaning} onSave={v=>onChange({meaning:v})} fontSize={S.meaningText} color='#2a1a10' weight={600} />
      <button onClick={onDelete} style={{ background:'none',border:'none',color:'#c0b8a8',fontSize:10,cursor:'pointer',padding:'2px 4px',flexShrink:0 }}>✕</button>
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
    {rels.map(rel=>{const w=getOther(rel);if(!w)return null;
      const midx=rel.sourceId===w.id?rel.sourceMeaningIndex:rel.targetMeaningIndex;
      const defIdx=midx??0;
      return(
      <div key={rel.id} style={{ display:'flex',alignItems:'center',gap:6,padding:'3px 0' }}>
        <span onClick={()=>onSelect(w.id)} style={{ color:'#4a4038',fontSize:S.relWord,cursor:'pointer',fontWeight:500 }}>{w.word}</span>
        {readonly ? (
          <span style={{ color:'#4a3a28',fontSize:S.relMeaning,flex:1 }}>{w.meanings[0]?.partOfSpeech} {w.meanings[0]?.meaning}</span>
        ) : onEditTarget ? (
          <InlineEdit value={w.meanings[defIdx]?.meaning||''} onSave={v=>onEditTarget(w.id,defIdx,v)} fontSize={S.relMeaning} color='#4a3a28' />
        ) : (
          <span style={{ color:'#4a3a28',fontSize:S.relMeaning,flex:1 }}>{w.meanings[0]?.partOfSpeech} {w.meanings[0]?.meaning}</span>
        )}
        {!readonly && <button onClick={()=>onDelete(rel.id)} style={{ background:'none',border:'none',color:'#c0b8a8',fontSize:9,cursor:'pointer',padding:'2px 4px',flexShrink:0 }}>✕</button>}
      </div>
    );})}
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

function relIdx(rel:Relationship, wordId:string):number|undefined{
  const isSrc=rel.sourceId===wordId;
  return isSrc?rel.sourceMeaningIndex:rel.targetMeaningIndex;
}
