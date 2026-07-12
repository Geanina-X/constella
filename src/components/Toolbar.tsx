import { useStore } from '../data/store';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';

type ToolbarProps = {
  mode: 'demo';
  onLogin: () => void;
} | {
  mode: 'user';
  userEmail: string;
  onAddWord: () => void;
  onExport: () => void;
  onImport: () => void;
  onClearAll: () => void;
  onResetLayout: () => void;
  onLogout: () => void;
};

export default function Toolbar(props: ToolbarProps) {
  const { words, relationships } = useStore();

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
        <SearchBar />

        {props.mode === 'user' ? (
          <>
            <button onClick={props.onAddWord} className="toolbar-btn" title="添加单词">
              + 新单词
            </button>
            <button onClick={props.onResetLayout} className="toolbar-btn" title="重置布局">
              ⟳ 布局
            </button>
            <button onClick={props.onExport} className="toolbar-btn" title="导出 JSON">
              ↓ 导出
            </button>
            <button onClick={props.onImport} className="toolbar-btn" title="导入 JSON">
              ↑ 导入
            </button>
            <button onClick={props.onClearAll} className="toolbar-btn-danger" title="清空全部数据">
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
