'use client';

import { useEffect, useState } from 'react';
import { useMiNegocio } from '@/lib/useMiNegocio';

export default function DisenoPanel() {
  const { negocio, cargando, supabase } = useMiNegocio();
  const [config, setConfig] = useState<any>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (negocio) setConfig(negocio.config);
  }, [negocio]);

  async function guardar() {
    if (!negocio) return;
    setGuardando(true);
    await supabase.from('businesses').update({ config }).eq('id', negocio.id);
    setGuardando(false);
  }

  if (cargando || !config) return <p>Cargando...</p>;

  return (
    <div style={{ maxWidth: 420 }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 16 }}>Diseño</h1>

      <label style={labelStyle}>Título</label>
      <input value={config.titulo || ''} onChange={(e) => setConfig({ ...config, titulo: e.target.value })} style={inputStyle} />

      <label style={labelStyle}>Descripción</label>
      <textarea value={config.descripcion || ''} onChange={(e) => setConfig({ ...config, descripcion: e.target.value })} style={{ ...inputStyle, height: 70 }} />

      <label style={labelStyle}>Color principal</label>
      <input type="color" value={config.colorPrimario || '#111111'} onChange={(e) => setConfig({ ...config, colorPrimario: e.target.value })} style={{ width: 60, height: 36 }} />

      <label style={labelStyle}>WhatsApp (con lada, sin +)</label>
      <input value={config.whatsapp || ''} onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })} style={inputStyle} placeholder="524421234567" />

      <label style={labelStyle}>Instagram</label>
      <input value={config.instagram || ''} onChange={(e) => setConfig({ ...config, instagram: e.target.value })} style={inputStyle} placeholder="@tunegocio" />

      <button onClick={guardar} disabled={guardando} style={{ marginTop: 16, padding: '10px 20px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
        {guardando ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, color: '#666', marginTop: 12, marginBottom: 4 };
const inputStyle: React.CSSProperties = { display: 'block', width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' };
