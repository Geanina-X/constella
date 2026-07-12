import { useState, useCallback, useEffect, Component } from 'react';
import { useStore } from './data/store';
import { presetWords, presetRelationships } from './data/presetData';
import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';
import GraphCanvas from './components/GraphCanvas';
import Toolbar from './components/Toolbar';
import WordDetailPanel from './components/WordDetailPanel';
import AddWordModal from './components/AddWordModal';
import AddRelationModal from './components/AddRelationModal';
import AuthPage from './components/AuthPage';
import CosmicBackground from './components/CosmicBackground';
import type { RelationType } from './types';
import './App.css';

class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: any }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ color: 'red', padding: 40, background: '#111', height: '100vh', fontFamily: 'monospace' }}>
          <h1>App Crashed</h1>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 14 }}>{(this.state.error as any)?.message}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, color: '#888', marginTop: 10 }}>{(this.state.error as any)?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainApp({ onLogout }: { onLogout: () => void }) {
  const [showAddWord, setShowAddWord] = useState(false);
  const [showAddRelationFor, setShowAddRelationFor] = useState<{wordId:string;meaningIndex:number;type:RelationType}|null>(null);
  const { importData, exportData, clearAll, loadFromCloud, loading } = useStore();

  useEffect(() => {
    loadFromCloud().then(() => {
      const s = useStore.getState();
      if (s.words.length === 0) {
        importData({ version: 1, words: presetWords, relationships: presetRelationships });
      }
    });
  }, []);

  const handleExport = useCallback(() => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `constella-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  }, [exportData]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);
          if (data.words && data.relationships) importData(data);
          else alert('无效格式');
        } catch { alert('JSON解析失败'); }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [importData]);

  if (loading) {
    return (
      <div style={{
        width: '100vw', height: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#f5f1e8', color: '#8a8070', fontSize: 14,
      }}>
        加载中…
      </div>
    );
  }

  return (
    <div className="app">
      <CosmicBackground />
      <GraphCanvas />
      <Toolbar onAddWord={() => setShowAddWord(true)} onExport={handleExport} onImport={handleImport}
        onClearAll={() => { if (confirm('清空全部？请先导出备份。')) clearAll(); }}
        onResetLayout={() => window.location.reload()}
        onLogout={onLogout} />
      <WordDetailPanel onAddRelation={(wordId, meaningIndex, type) => setShowAddRelationFor({wordId, meaningIndex, type})} />
      {showAddWord && <AddWordModal onClose={() => setShowAddWord(false)} />}
      {showAddRelationFor && <AddRelationModal sourceWordId={showAddRelationFor.wordId} sourceMeaningIndex={showAddRelationFor.meaningIndex} initialType={showAddRelationFor.type} onClose={() => setShowAddRelationFor(null)} />}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  if (checking) {
    return (
      <div style={{
        width: '100vw', height: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#f5f1e8', color: '#8a8070', fontSize: 14,
      }}>
        …
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <ErrorBoundary>
      <MainApp onLogout={handleLogout} />
    </ErrorBoundary>
  );
}
