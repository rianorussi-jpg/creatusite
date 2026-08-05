'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseClient';
import type { ReactNode } from 'react';

const ITEMS = [
  { href: '/panel', label: 'Resumen' },
  { href: '/panel/productos', label: 'Productos' },
  { href: '/panel/diseno', label: 'Diseño' },
  { href: '/panel/plantilla', label: 'Plantilla' }
];

export default function PanelLayout({ children }: { children: ReactNode }) {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    let activo = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace('/login');
        return;
      }
      if (activo) setVerificando(false);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/login');
      }
    });

    return () => {
      activo = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (verificando) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg)'
        }}
      >
        <p style={{ color: 'var(--color-ink-soft)' }}>Verificando sesión...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav
        style={{
          width: 200,
          flexShrink: 0,
          background: 'var(--color-ink)',
          color: '#fff',
          padding: '28px 18px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 32, padding: '0 10px' }}>
          creatusitio<span style={{ color: 'var(--color-accent)' }}>.mx</span>
        </span>
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'block',
              padding: '10px 12px',
              borderRadius: 8,
              color: '#C7CAE0',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
              marginBottom: 2
            }}
          >
            {item.label}
          </Link>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid #333A5C' }}>
          <button
            onClick={cerrarSesion}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '10px 12px',
              borderRadius: 8,
              color: '#C7CAE0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              marginBottom: 8
            }}
          >
            Cerrar sesión
          </button>
          
            href="https://creatusitio.mx"
            style={{ fontSize: 12, color: '#8489A8', textDecoration: 'none' }}
          >
            ← Volver al sitio
          </a>
        </div>
      </nav>
      <main style={{ flex: 1, padding: '2.5rem', background: 'var(--color-bg)' }}>{children}</main>
    </div>
  );
}
