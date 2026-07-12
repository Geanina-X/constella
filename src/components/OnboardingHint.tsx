import { useState, useEffect } from 'react';

export default function OnboardingHint({ word }: { word: string }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  if (dismissed) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%',
      zIndex: 200, transition: 'opacity 0.6s, transform 0.6s',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(8px)',
    }}>
      <div style={{
        background: 'rgba(58,48,40,0.94)', color: '#f5f1e8',
        padding: '20px 28px', borderRadius: 14,
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        fontFamily: "'Georgia', 'Noto Serif SC', serif",
        maxWidth: 400, lineHeight: 1.8,
      }}>
        <div style={{ fontSize: 18, marginBottom: 8, fontWeight: 600 }}>
          ✦ 欢迎来到你的词汇宇宙
        </div>
        <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 14 }}>
          <strong>{word}</strong> 是你目前唯一的词。试试这些操作：
        </div>

        <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 4 }}>
          ❶ <strong>点击这颗星</strong> — 看的它的释义面板
        </div>
        <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 4 }}>
          ❷ <strong>再点一次</strong> — 打开编辑面板，添加同义词、反义词
        </div>
        <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 4 }}>
          ❸ <strong>点 + 新单词</strong> — 从词根或词缀出发，扩建星系
        </div>
        <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 14 }}>
          ❹ <strong>从 -stell- 开始</strong> — 想想包含这个词根的词：stellar, interstellar, constellation...
        </div>

        <button onClick={() => setDismissed(true)} style={{
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          color: '#f5f1e8', padding: '6px 20px', borderRadius: 6,
          cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
        }}>
          知道了
        </button>
      </div>
    </div>
  );
}
