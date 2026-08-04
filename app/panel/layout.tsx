import Link from 'next/link';
import type { ReactNode } from 'react';

const ITEMS = [
  { href: '/panel', label: 'Resumen' },
  { href: '/panel/productos', label: 'Productos' },
  { href: '/panel/diseno', label: 'Diseño' },
  { href: '/panel/plantilla', label: 'Plantilla' }
];

export default function PanelLayout({ children }: { children: ReactNode }) {
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
          <a
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
