import { useState } from 'react';
import { useStore } from '../data/store';
import type { Word } from '../types';

export default function AddWordModal({ onClose }: { onClose: () => void }) {
  const addWord = useStore((s) => s.addWord);
  const [word, setWord] = useState('');
  const [pron, setPron] = useState('');
  const [pos, setPos] = useState('v.');
  const [meaning, setMeaning] = useState('');
  const [def, setDef] = useState('');
  const [example, setExample] = useState('');
  const [mnemonic, setMnemonic] = useState('');

  const submit = () => {
    if (!word.trim() || !meaning.trim()) return;
    const w: Word = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      word: word.trim(), pronunciation: pron.trim(), tags: [],
      meanings: [{ partOfSpeech: pos, meaning: meaning.trim(), definition: def.trim(), example: example.trim(), mnemonic: mnemonic.trim() }],
      notes: '',
    };
    addWord(w);
    onClose();
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'rgba(15,15,40,0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: 28, width: 420, maxHeight: '80vh', overflowY: 'auto' }}>
        <h2 style={{ color: '#fff', margin: '0 0 20px', fontSize: 18 }}>⭐ 添加新单词</h2>
        <F label="单词拼写" v={word} onChange={setWord} ph="e.g. retain" af />
        <F label="音标" v={pron} onChange={setPron} ph="e.g. /rɪˈteɪn/" />
        <div style={{ marginBottom: 14 }}>
          <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 4 }}>词性</label>
          <select value={pos} onChange={(e) => setPos(e.target.value)} style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: '#fff', fontSize: 14, outline: 'none' }}>
            <option value="v.">v. 动词</option><option value="n.">n. 名词</option><option value="adj.">adj. 形容词</option><option value="adv.">adv. 副词</option>
          </select>
        </div>
        <F label="中文释义" v={meaning} onChange={setMeaning} ph="e.g. 保留，保持" />
        <F label="英文释义" v={def} onChange={setDef} ph="e.g. to keep or continue to have sth" />
        <F label="例句" v={example} onChange={setExample} ph="e.g. She retained her composure." />
        <F label="记法(词根拆解)" v={mnemonic} onChange={setMnemonic} ph="e.g. re(回)+tain(拿住) → 保留" />
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button onClick={submit} disabled={!word.trim()} style={{ flex: 1, padding: 10, background: word.trim() ? 'rgba(100,200,255,0.2)' : 'rgba(255,255,255,0.06)', border: word.trim() ? '1px solid rgba(100,200,255,0.4)' : '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: word.trim() ? '#fff' : '#555', cursor: word.trim() ? 'pointer' : 'default', fontSize: 14, fontWeight: 600 }}>添加</button>
          <button onClick={onClose} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#888', cursor: 'pointer', fontSize: 14 }}>取消</button>
        </div>
      </div>
    </div>
  );
}

function F({ label, v, onChange, ph, af }: { label: string; v: string; onChange: (s: string) => void; ph: string; af?: boolean }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 4 }}>{label}</label>
      <input autoFocus={af} value={v} onChange={(e) => onChange(e.target.value)} placeholder={ph}
        style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
    </div>
  );
}
