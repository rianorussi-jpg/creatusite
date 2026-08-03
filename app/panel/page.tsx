'use client';

import { useMiNegocio } from '@/lib/useMiNegocio';

export default function ResumenPanel() {
  const { negocio, cargando } = useMiNegocio();

  if (cargando) return <p>Cargando...</p>;
  if (!negocio) return <p>No encontramos tu negocio. Inicia sesión de nuevo.</p>;

  const url = `https://${negocio.subdominio}.creatusitio.mx`;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 500 }}>{negocio.nombre}</h1>
      <p style={{ color: '#666' }}>
        Tu página está en{' '}
        <a href={url} target="_blank" rel="noreferrer">
          {url}
        </a>
      </p>
      <p style={{ color: '#666' }}>Tipo: {negocio.tipo} · Plantilla: {negocio.template_id} · Estado: {negocio.estado}</p>
    </div>
  );
}
