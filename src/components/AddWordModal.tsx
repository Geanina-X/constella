import { useState } from 'react';
import { useStore } from '../data/store';
import type { Word } from '../types';

export default function AddWordModal({ onClose }: { onClose: () => void }) {
  const addWord = useStore((s) => s.addWord);
  const [word, setWord] = useState('');
  const [pos, setPos] = useState('v.');
  const [meaning, setMeaning] = useState('');
  const [def, setDef] = useState('');
  const [example, setExample] = useState('');
  const [mnemonic, setMnemonic] = useState('');

  const submit = () => {
    if (!word.trim() || !meaning.trim()) return;
    const w: Word = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      word: word.trim(), pronunciation: '', tags: [],
      meanings: [{ partOfSpeech: pos, meaning: meaning.trim(), definition: def.trim(), example: example.trim(), mnemonic: mnemonic.trim() }],
      notes: '',
    };
    addWord(w);
    onClose();
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px', fontSize: 14,
    background: '#faf6ee', border: '1px solid rgba(0,0,0,0.12)',
    borderRadius: 7, color: '#3a3028', outline: 'none', boxSizing: 'border-box' as const,
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#faf6ee', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: 28, width: 420, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}>
        <h2 style={{ color: '#3a3028', margin: '0 0 20px', fontSize: 18, fontFamily: "'Georgia','Noto Serif SC',serif" }}>✦ 添加新单词</h2>
        <F label="单词拼写" v={word} onChange={setWord} ph="e.g. retain" af inputStyle={inputStyle} />
        <div style={{ marginBottom: 14 }}>
          <label style={{ color: '#6a5a48', fontSize: 12, display: 'block', marginBottom: 4, fontWeight: 500 }}>词性</label>
          <input list="pos-list" value={pos} onChange={(e) => setPos(e.target.value)} placeholder="e.g. v. / n. / adj. ..." style={inputStyle} />
          <datalist id="pos-list">
            <option value="v." /><option value="vi." /><option value="vt." />
            <option value="n." /><option value="adj." /><option value="adv." />
            <option value="prep." /><option value="conj." /><option value="pron." />
            <option value="interj." /><option value="art." /><option value="num." />
            <option value="det." /><option value="aux." />
          </datalist>
        </div>
        <F label="中文释义" v={meaning} onChange={setMeaning} ph="e.g. 保留，保持" inputStyle={inputStyle} />
        <F label="英文释义（可选）" v={def} onChange={setDef} ph="e.g. to keep or continue to have sth" inputStyle={inputStyle} />
        <F label="例句（可选）" v={example} onChange={setExample} ph="e.g. She retained her composure." inputStyle={inputStyle} />
        <F label="记法 / 词根拆解（可选）" v={mnemonic} onChange={setMnemonic} ph="e.g. re(回)+tain(拿住) → 保留" inputStyle={inputStyle} />
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button onClick={submit} disabled={!word.trim()} style={{ flex: 1, padding: 10, background: word.trim() ? '#3a3028' : 'rgba(0,0,0,0.06)', border: word.trim() ? '1px solid #3a3028' : '1px solid rgba(0,0,0,0.08)', borderRadius: 8, color: word.trim() ? '#f5f1e8' : '#aaa', cursor: word.trim() ? 'pointer' : 'default', fontSize: 14, fontWeight: 600, fontFamily: 'inherit' }}>添加</button>
          <button onClick={onClose} style={{ padding: '10px 20px', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, color: '#6a5a48', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>取消</button>
        </div>
      </div>
    </div>
  );
}

function F({ label, v, onChange, ph, af, inputStyle }: { label: string; v: string; onChange: (s: string) => void; ph: string; af?: boolean; inputStyle: any }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ color: '#6a5a48', fontSize: 12, display: 'block', marginBottom: 4, fontWeight: 500 }}>{label}</label>
      <input autoFocus={af} value={v} onChange={(e) => onChange(e.target.value)} placeholder={ph} style={inputStyle} />
    </div>
  );
}
