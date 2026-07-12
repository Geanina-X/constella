import { useState } from 'react';
import { supabase } from '../supabase';

export default function AuthPage({ onBack }: { onBack?: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRegisteredEmail('');
    setLoading(true);

    if (isRegister) {
      const { data, error: authError } = await supabase.auth.signUp({ email, password });

      if (authError) {
        setError(authError.message);
      } else if (data.user?.identities?.length === 0) {
        setError('该邮箱已注册，请直接登录');
      } else {
        setRegisteredEmail(email);
      }
    } else {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        if (authError.message.includes('Email not confirmed')) {
          setError('邮箱未验证，请检查收件箱（含垃圾邮件）点击确认链接');
        } else if (authError.message === 'Invalid login credentials') {
          setError('邮箱或密码错误');
        } else {
          setError(authError.message);
        }
      }
    }
    setLoading(false);
  };

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f5f1e8',
      fontFamily: "'Georgia', 'Noto Serif SC', serif",
    }}>
      <div style={{
        width: 380, padding: '40px 36px',
        background: 'rgba(255,255,255,0.6)',
        borderRadius: 12,
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        position: 'relative',
      }}>
        {/* Back button */}
        {onBack && (
          <button onClick={onBack} style={{
            position: 'absolute', top: 12, left: 14,
            background: 'none', border: 'none', color: '#8a8070',
            fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            ← 返回
          </button>
        )}

        <h1 style={{
          textAlign: 'center', fontSize: 28, fontWeight: 400,
          color: '#3a3028', marginBottom: 4,
        }}>
          ✦ Constella
        </h1>
        <p style={{
          textAlign: 'center', fontSize: 13, color: '#8a8070', marginBottom: 28,
        }}>
          考研词汇星系
        </p>

        {registeredEmail ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 14, color: '#3a3028', marginBottom: 12, lineHeight: 1.8,
            }}>
              确认邮件已发送至<br/>
              <strong>{registeredEmail}</strong><br/>
              请点击邮件中的链接完成验证，然后登录。
            </div>
            <p style={{ fontSize: 12, color: '#a09080', marginBottom: 20 }}>
              没收到？检查垃圾邮件或换一个邮箱试试
            </p>
            <button onClick={() => {
              setRegisteredEmail('');
              setIsRegister(false);
              setEmail('');
              setPassword('');
            }} style={{
              background: 'none', border: 'none', color: '#8a8070',
              fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
              textDecoration: 'underline',
            }}>
              返回登录
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="邮箱"
              required
              style={{
                width: '100%', padding: '10px 14px', fontSize: 14,
                border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8,
                background: '#faf6ee', color: '#3a3028', marginBottom: 12,
                outline: 'none', boxSizing: 'border-box',
              }}
            />
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="密码（至少6位）"
              required minLength={6}
              style={{
                width: '100%', padding: '10px 14px', fontSize: 14,
                border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8,
                background: '#faf6ee', color: '#3a3028', marginBottom: 16,
                outline: 'none', boxSizing: 'border-box',
              }}
            />

            {error && (
              <div style={{
                color: '#c4554d', fontSize: 12, marginBottom: 12,
                textAlign: 'center', lineHeight: 1.6,
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '10px 0', fontSize: 15,
              background: '#3a3028', color: '#f5f1e8',
              border: 'none', borderRadius: 8, cursor: 'pointer',
              fontFamily: 'inherit', fontWeight: 500,
              opacity: loading ? 0.6 : 1,
            }}>
              {loading ? '…' : isRegister ? '注册' : '登录'}
            </button>
          </form>
        )}

        {!registeredEmail && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button onClick={() => { setIsRegister(!isRegister); setError(''); }}
              style={{
                background: 'none', border: 'none', color: '#8a8070',
                fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                textDecoration: 'underline',
              }}>
              {isRegister ? '已有账号？登录' : '没有账号？注册'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
