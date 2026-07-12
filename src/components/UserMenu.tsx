import { useState, useRef, useEffect } from 'react';

export default function UserMenu({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [open]);

  const initial = email.charAt(0).toUpperCase();

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{
        width: 32, height: 32, borderRadius: '50%',
        border: '1px solid rgba(0,0,0,0.1)', background: '#3a3028',
        color: '#f5f1e8', fontSize: 14, fontWeight: 600,
        cursor: 'pointer', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontFamily: 'inherit',
      }}>
        {initial}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 40,
          width: 200, background: '#faf6ee',
          border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10,
          boxShadow: '0 6px 20px rgba(0,0,0,0.08)', overflow: 'hidden',
        }}>
          <div style={{
            padding: '12px 16px', fontSize: 12, color: '#8a8070',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            wordBreak: 'break-all',
          }}>
            {email}
          </div>
          <button onClick={() => { setOpen(false); onLogout(); }} style={{
            width: '100%', padding: '10px 16px', border: 'none',
            background: 'none', color: '#c4554d', fontSize: 13,
            cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
          }}>
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}
