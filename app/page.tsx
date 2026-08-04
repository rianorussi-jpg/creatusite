'use client';

import { useMiNegocio } from '@/lib/useMiNegocio';

export default function ResumenPanel() {
  const { negocio, cargando } = useMiNegocio();

  if (cargando) return <p style={{ color: 'var(--color-ink-soft)' }}>Cargando...</p>;
  if (!negocio) return <p style={{ color: 'var(--color-ink-soft)' }}>No encontramos tu negocio. Inicia sesión de nuevo.</p>;

  const url = `https://${negocio.subdominio}.creatusitio.mx`;

  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 6 }}>Resumen</div>
      <h1 style={{ fontSize: 26, marginBottom: 24 }}>{negocio.nombre}</h1>

      <div className="card" style={{ padding: 24, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--color-ink-soft)', marginBottom: 4 }}>Tu página está publicada en</div>
          <a href={url} target="_blank" rel="noreferrer" style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--color-accent)', fontWeight: 500, textDecoration: 'none' }}>
            {negocio.subdominio}.creatusitio.mx ↗
          </a>
        </div>
        <span
          style={{
            fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 999,
            background: negocio.estado === 'activo' ? 'var(--color-green-soft)' : '#F1EADA',
            color: negocio.estado === 'activo' ? 'var(--color-green)' : 'var(--color-ink-soft)'
          }}
        >
          {negocio.estado === 'activo' ? 'Activo' : 'Pausado'}
        </span>
      </div>

      <div className="grid-3">
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--color-ink-soft)', marginBottom: 6 }}>Tipo de página</div>
          <div style={{ fontSize: 16, fontWeight: 600, textTransform: 'capitalize' }}>{negocio.tipo}</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--color-ink-soft)', marginBottom: 6 }}>Plantilla</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{negocio.template_id}</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--color-ink-soft)', marginBottom: 6 }}>WhatsApp de pedidos</div>
          <div style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{negocio.config?.whatsapp || '—'}</div>
        </div>
      </div>
    </div>
  );
}
