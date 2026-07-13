import { useState } from 'react';
import { useStore } from '../data/store';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';

type ToolbarProps = {
  mode: 'demo';
  onLogin: () => void;
} | {
  mode: 'user';
  userEmail: string;
  onAddWord: (initialWord?: string) => void;
  onAddRoot: (initialWord?: string) => void;
  onExport: () => void;
  onImport: () => void;
  onClearAll: () => void;
  onResetLayout: () => void;
  onLogout: () => void;
};

export default function Toolbar(props: ToolbarProps) {
  const { words, relationships } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 20px',
      background: 'linear-gradient(180deg, rgba(245,241,232,0.95) 0%, rgba(245,241,232,0) 100%)',
      pointerEvents: 'none',
    }}>
      <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: '#3a3028', fontSize: '18px', fontWeight: 700, letterSpacing: '0.02em' }}>
          ✦ Constella
        </span>
        <span style={{ color: '#8a8070', fontSize: '11px' }}>
          {words.length}词 · {relationships.length}关系
        </span>
      </div>

      <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <SearchBar
          onCreateWord={props.mode === 'user' ? (w) => props.onAddWord(w) : undefined}
          onCreateRoot={props.mode === 'user' ? (w) => props.onAddRoot(w) : undefined}
        />

        {props.mode === 'user' ? (
          <>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setMenuOpen(!menuOpen)} className="toolbar-btn" title="新建">
                + 新建
              </button>
              {menuOpen && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, marginTop: 4,
                  background: '#faf6ee', border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: 10, boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                  overflow: 'hidden', zIndex: 200, minWidth: 130,
                }}>
                  <MenuItem onClick={() => { props.onAddWord(); setMenuOpen(false); }}>📝 新建单词</MenuItem>
                  <MenuItem onClick={() => { props.onAddRoot(); setMenuOpen(false); }}>🌿 新建词根 / 词缀</MenuItem>
                </div>
              )}
              {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 199 }} />}
            </div>
            <button onClick={props.onResetLayout} className="toolbar-btn" title="重置布局">
              ⟳ 布局
            </button>
            <button onClick={props.onExport} className="toolbar-btn" title="导出 JSON">
              ↓ 导出
            </button>
            <button onClick={props.onImport} className="toolbar-btn" title="导入 JSON">
              ↑ 导入
            </button>
            <button onClick={props.onClearAll} className="toolbar-btn-danger" title="清空全部数据" aria-label="清空全部数据">
              🗑
            </button>
            <UserMenu email={props.userEmail} onLogout={props.onLogout} />
          </>
        ) : (
          <button onClick={props.onLogin} className="toolbar-btn"
            style={{ fontWeight: 600, background: 'rgba(58,48,40,0.08)' }}>
            登录
          </button>
        )}
      </div>
    </div>
  );
}

function MenuItem({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      display: 'block', width: '100%', padding: '10px 16px',
      background: 'transparent', border: 'none',
      color: '#3a3028', fontSize: 13, cursor: 'pointer',
      textAlign: 'left', fontFamily: 'inherit',
      whiteSpace: 'nowrap',
    }}
    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
      {children}
    </button>
  );
}
