'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseClient';

export default function LoginPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setCargando(false);
    if (error) {
      setError('Correo o contraseña incorrectos.');
      return;
    }
    router.replace('/panel');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        padding: 20
      }}
    >
      <form onSubmit={handleSubmit} className="card" style={{ padding: 32, width: '100%', maxWidth: 360 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>creatusitio.mx</div>
        <h1 style={{ fontSize: 22, marginBottom: 24 }}>Entra a tu panel</h1>

        <label style={{ fontSize: 12, color: 'var(--color-ink-soft)', display: 'block', marginBottom: 4 }}>Correo</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', marginBottom: 16, fontSize: 14 }}
        />

        <label style={{ fontSize: 12, color: 'var(--color-ink-soft)', display: 'block', marginBottom: 4 }}>Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', marginBottom: 20, fontSize: 14 }}
        />

        {error && <p style={{ color: '#C0392B', fontSize: 13, marginBottom: 16 }}>{error}</p>}

        <button
          type="submit"
          disabled={cargando}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: 'none',
            background: 'var(--color-accent)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            cursor: cargando ? 'not-allowed' : 'pointer',
            opacity: cargando ? 0.7 : 1
          }}
        >
          {cargando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
