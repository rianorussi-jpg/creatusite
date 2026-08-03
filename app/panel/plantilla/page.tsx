'use client';

import { useMiNegocio } from '@/lib/useMiNegocio';

const OPCIONES = [
  { id: 'minimalista', nombre: 'Minimalista', descripcion: 'Limpio, mucho blanco, tipografía grande' },
  { id: 'sencillo', nombre: 'Sencillo', descripcion: 'Directo y llamativo, estilo La Bonelissa' }
];

export default function PlantillaPanel() {
  const { negocio, setNegocio, cargando, supabase } = useMiNegocio();

  async function elegir(id: string) {
    if (!negocio) return;
    await supabase.from('businesses').update({ template_id: id }).eq('id', negocio.id);
    setNegocio({ ...negocio, template_id: id });
  }

  if (cargando || !negocio) return <p>Cargando...</p>;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 16 }}>Plantilla</h1>
      <div style={{ display: 'flex', gap: 16 }}>
        {OPCIONES.map((op) => (
          <button
            key={op.id}
            onClick={() => elegir(op.id)}
            style={{
              width: 200,
              textAlign: 'left',
              padding: 16,
              borderRadius: 8,
              cursor: 'pointer',
              border: negocio.template_id === op.id ? '2px solid #111' : '1px solid #ddd',
              background: '#fff'
            }}
          >
            <p style={{ fontWeight: 500, margin: 0 }}>{op.nombre}</p>
            <p style={{ fontSize: 13, color: '#777', margin: '4px 0 0' }}>{op.descripcion}</p>
          </button>
        ))}
      </div>
      <p style={{ fontSize: 13, color: '#999', marginTop: 16 }}>Tus productos y tu diseño se mantienen al cambiar de plantilla.</p>
    </div>
  );
}
