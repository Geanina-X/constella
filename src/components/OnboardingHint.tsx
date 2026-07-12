import { useState, useEffect } from 'react';

export default function OnboardingHint({ word }: { word: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Delay entrance for visual impact
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      position: 'fixed', bottom: 40, left: '50%',
      zIndex: 200, transition: 'opacity 0.6s, transform 0.6s',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(12px)',
    }}>
      <div style={{
        background: 'rgba(58,48,40,0.92)', color: '#f5f1e8',
        padding: '16px 24px', borderRadius: 12,
        fontSize: 14, lineHeight: 1.7, textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        fontFamily: "'Georgia', 'Noto Serif SC', serif",
        maxWidth: 360,
      }}>
        <div style={{ marginBottom: 4 }}>
          ✦ <strong>{word}</strong> 是你的第一颗星
        </div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          点击它，添加同义词、反义词、词根关联……<br/>你的词汇宇宙将从这里生长。
        </div>
      </div>
    </div>
  );
}
