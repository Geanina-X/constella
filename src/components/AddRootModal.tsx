import { useState, useEffect } from 'react';
import { useStore } from '../data/store';
import type { Word } from '../types';

const TYPES = [
  { key: 'root', label: '词根', tag: '词根节点', pos: 'root' },
  { key: 'prefix', label: '前缀', tag: '前缀节点', pos: 'pref' },
  { key: 'suffix', label: '后缀', tag: '后缀节点', pos: 'suf' },
] as const;

export default function AddRootModal({ onClose, initialWord }: { onClose: () => void; initialWord?: string }) {
  const addWord = useStore((s) => s.addWord);
  const [word, setWord] = useState(initialWord || '');
  const [typeIdx, setTypeIdx] = useState(0);
  const [meaning, setMeaning] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = () => {
    if (!word.trim() || !meaning.trim()) return;
    const t = TYPES[typeIdx];
    const w: Word = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      word: word.trim(), pronunciation: '', tags: [t.tag],
      meanings: [{ partOfSpeech: t.pos, meaning: meaning.trim(), definition: '', example: '', mnemonic: '', notes: notes.trim() }],
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
        <h2 style={{ color: '#3a3028', margin: '0 0 20px', fontSize: 18, fontFamily: "'Georgia','Noto Serif SC',serif" }}>✦ 新建词根 / 词缀</h2>

        <div style={{ marginBottom: 14 }}>
          <label style={{ color: '#6a5a48', fontSize: 12, display: 'block', marginBottom: 4, fontWeight: 500 }}>类型</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {TYPES.map((t, i) => (
              <button key={t.key} onClick={() => setTypeIdx(i)} style={{
                padding: '6px 16px', fontSize: 13, borderRadius: 20, cursor: 'pointer',
                background: typeIdx === i ? '#3a3028' : 'rgba(0,0,0,0.04)',
                border: typeIdx === i ? '1px solid #3a3028' : '1px solid rgba(0,0,0,0.1)',
                color: typeIdx === i ? '#f5f1e8' : '#6a5a48',
                fontFamily: 'inherit', fontWeight: typeIdx === i ? 600 : 400,
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        <F label="拼写" v={word} onChange={setWord} ph="e.g. -spect / re- / -tion" af inputStyle={inputStyle} />
        <F label="中文释义" v={meaning} onChange={setMeaning} ph="e.g. 看，观察" inputStyle={inputStyle} />

        <div style={{ marginBottom: 14 }}>
          <label style={{ color: '#6a5a48', fontSize: 12, display: 'block', marginBottom: 4, fontWeight: 500 }}>备注</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="补充说明..."
            rows={3}
            style={{
              width: '100%', padding: '9px 12px', fontSize: 14,
              background: '#faf6ee', border: '1px solid rgba(0,0,0,0.12)',
              borderRadius: 7, color: '#3a3028', outline: 'none',
              boxSizing: 'border-box' as const, resize: 'vertical',
              fontFamily: 'inherit',
            }} />
        </div>

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
