'use client';

import { useEffect, useState } from 'react';
import { useMiNegocio } from '@/lib/useMiNegocio';

type Beneficio = { titulo: string; texto: string };
type Testimonio = { texto: string; autor: string };
type Especialidad = { titulo: string; texto: string };
type Horario = { dia: string; horario: string };
type Plan = { nombre: string; precio: string; features: string; destacado?: boolean };

export default function DisenoPanel() {
  const { negocio, cargando, supabase } = useMiNegocio();
  const [config, setConfig] = useState<any>(null);
  const [guardando, setGuardando] = useState(false);
  const [subiendoLogo, setSubiendoLogo] = useState(false);

  useEffect(() => {
    if (negocio) setConfig(negocio.config);
  }, [negocio]);

  async function subirLogo(file: File) {
    if (!negocio) return;
    setSubiendoLogo(true);
    const ext = file.name.split('.').pop();
    const path = `${negocio.id}/logo.${ext}`;
    const { error } = await supabase.storage.from('creatusitio-assets').upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from('creatusitio-assets').getPublicUrl(path);
      // cache-busting para que se vea el logo nuevo de inmediato
      setConfig({ ...config, logoUrl: `${data.publicUrl}?v=${Date.now()}` });
    }
    setSubiendoLogo(false);
  }

  async function guardar() {
    if (!negocio) return;
    setGuardando(true);
    await supabase.from('businesses').update({ config }).eq('id', negocio.id);
    setGuardando(false);
  }

  // ---- helpers genéricos para editar arrays dentro de config ----
  function addItem<T>(campo: string, item: T) {
    setConfig({ ...config, [campo]: [...(config[campo] || []), item] });
  }
  function updateItem(campo: string, idx: number, patch: any) {
    const items = [...(config[campo] || [])];
    items[idx] = { ...items[idx], ...patch };
    setConfig({ ...config, [campo]: items });
  }
  function removeItem(campo: string, idx: number) {
    const items = [...(config[campo] || [])];
    items.splice(idx, 1);
    setConfig({ ...config, [campo]: items });
  }

  if (cargando || !config) return <p>Cargando...</p>;

  const templateId: string = negocio?.template_id || '';
  const esLandingNegocio = templateId === 'landing-negocio';
  const esLandingProfesionista = templateId === 'landing-profesionista';
  const esLanding = esLandingNegocio || esLandingProfesionista;

  const beneficios: Beneficio[] = config.beneficios || [];
  const testimonios: Testimonio[] = config.testimonios || [];
  const especialidades: Especialidad[] = config.especialidades || [];
  const horarios: Horario[] = config.horarios || [];
  const planes: Plan[] = config.planes || [];

  return (
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 16 }}>Diseño</h1>

      <label style={labelStyle}>Logo (opcional — si no subes uno, se muestra el título como texto)</label>
      {config.logoUrl && <img src={config.logoUrl} alt="Logo" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, marginBottom: 8, display: 'block' }} />}
      <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && subirLogo(e.target.files[0])} disabled={subiendoLogo} />
      {subiendoLogo && <p style={{ fontSize: 12, color: '#999' }}>Subiendo logo...</p>}
      {config.logoUrl && (
        <button onClick={() => setConfig({ ...config, logoUrl: null })} style={{ display: 'block', marginTop: 6, fontSize: 12, color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer' }}>
          Quitar logo y usar solo texto
        </button>
      )}

      <label style={{ ...labelStyle, marginTop: 20 }}>Título</label>
      <input value={config.titulo || ''} onChange={(e) => setConfig({ ...config, titulo: e.target.value })} style={inputStyle} />

      <label style={labelStyle}>Descripción</label>
      <textarea value={config.descripcion || ''} onChange={(e) => setConfig({ ...config, descripcion: e.target.value })} style={{ ...inputStyle, height: 70 }} />

      <label style={labelStyle}>Color principal</label>
      <input type="color" value={config.colorPrimario || '#111111'} onChange={(e) => setConfig({ ...config, colorPrimario: e.target.value })} style={{ width: 60, height: 36 }} />

      <label style={labelStyle}>WhatsApp (con lada, sin +)</label>
      <input value={config.whatsapp || ''} onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })} style={inputStyle} placeholder="524421234567" />

      <label style={labelStyle}>Instagram</label>
      <input value={config.instagram || ''} onChange={(e) => setConfig({ ...config, instagram: e.target.value })} style={inputStyle} placeholder="@tunegocio" />

      {esLandingProfesionista && (
        <>
          <label style={labelStyle}>Teléfono (se muestra en la barra superior)</label>
          <input value={config.telefono || ''} onChange={(e) => setConfig({ ...config, telefono: e.target.value })} style={inputStyle} placeholder="(555) 123-4567" />

          <label style={labelStyle}>Horario corto (barra superior)</label>
          <input value={config.horarioTexto || ''} onChange={(e) => setConfig({ ...config, horarioTexto: e.target.value })} style={inputStyle} placeholder="Lunes a Viernes | 9:00 - 18:00" />
        </>
      )}

      {/* ---------------- BENEFICIOS (ambas landing) ---------------- */}
      {esLanding && (
        <SeccionLista
          titulo="Beneficios"
          ayuda="Las tarjetas de '¿Por qué elegirnos?'"
        >
          {beneficios.map((b, i) => (
            <ItemCard key={i} onQuitar={() => removeItem('beneficios', i)}>
              <input placeholder="Título" value={b.titulo} onChange={(e) => updateItem('beneficios', i, { titulo: e.target.value })} style={inputStyle} />
              <input placeholder="Texto" value={b.texto} onChange={(e) => updateItem('beneficios', i, { texto: e.target.value })} style={inputStyle} />
            </ItemCard>
          ))}
          <BotonAgregar onClick={() => addItem('beneficios', { titulo: '', texto: '' })} texto="+ Agregar beneficio" />
        </SeccionLista>
      )}

      {/* ---------------- PLANES (solo landing-negocio) ---------------- */}
      {esLandingNegocio && (
        <SeccionLista titulo="Planes" ayuda="Precios o paquetes de servicio">
          {planes.map((p, i) => (
            <ItemCard key={i} onQuitar={() => removeItem('planes', i)}>
              <input placeholder="Nombre del plan" value={p.nombre} onChange={(e) => updateItem('planes', i, { nombre: e.target.value })} style={inputStyle} />
              <input placeholder="Precio (ej. $299)" value={p.precio} onChange={(e) => updateItem('planes', i, { precio: e.target.value })} style={inputStyle} />
              <textarea
                placeholder="Incluye (una línea por cada cosa)"
                value={p.features}
                onChange={(e) => updateItem('planes', i, { features: e.target.value })}
                style={{ ...inputStyle, height: 60 }}
              />
              <label style={{ fontSize: 12, color: '#666', display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={!!p.destacado} onChange={(e) => updateItem('planes', i, { destacado: e.target.checked })} />
                Destacar este plan
              </label>
            </ItemCard>
          ))}
          <BotonAgregar onClick={() => addItem('planes', { nombre: '', precio: '', features: '', destacado: false })} texto="+ Agregar plan" />
        </SeccionLista>
      )}

      {/* ---------------- ESPECIALIDADES (solo landing-profesionista) ---------------- */}
      {esLandingProfesionista && (
        <SeccionLista titulo="Especialidades" ayuda="Servicios o áreas que atiendes">
          {especialidades.map((e, i) => (
            <ItemCard key={i} onQuitar={() => removeItem('especialidades', i)}>
              <input placeholder="Título" value={e.titulo} onChange={(ev) => updateItem('especialidades', i, { titulo: ev.target.value })} style={inputStyle} />
              <input placeholder="Texto" value={e.texto} onChange={(ev) => updateItem('especialidades', i, { texto: ev.target.value })} style={inputStyle} />
            </ItemCard>
          ))}
          <BotonAgregar onClick={() => addItem('especialidades', { titulo: '', texto: '' })} texto="+ Agregar especialidad" />
        </SeccionLista>
      )}

      {/* ---------------- HORARIOS (solo landing-profesionista) ---------------- */}
      {esLandingProfesionista && (
        <SeccionLista titulo="Horarios de atención" ayuda="Tabla que se muestra en la página">
          {horarios.map((h, i) => (
            <ItemCard key={i} onQuitar={() => removeItem('horarios', i)}>
              <input placeholder="Día (ej. Lunes - Viernes)" value={h.dia} onChange={(e) => updateItem('horarios', i, { dia: e.target.value })} style={inputStyle} />
              <input placeholder="Horario (ej. 9:00 - 18:00)" value={h.horario} onChange={(e) => updateItem('horarios', i, { horario: e.target.value })} style={inputStyle} />
            </ItemCard>
          ))}
          <BotonAgregar onClick={() => addItem('horarios', { dia: '', horario: '' })} texto="+ Agregar horario" />
        </SeccionLista>
      )}

      {/* ---------------- TESTIMONIOS (ambas landing) ---------------- */}
      {esLanding && (
        <SeccionLista titulo="Testimonios" ayuda="Opiniones de tus clientes o pacientes">
          {testimonios.map((t, i) => (
            <ItemCard key={i} onQuitar={() => removeItem('testimonios', i)}>
              <textarea placeholder="Texto del testimonio" value={t.texto} onChange={(e) => updateItem('testimonios', i, { texto: e.target.value })} style={{ ...inputStyle, height: 60 }} />
              <input placeholder="Autor (ej. Juan Pérez)" value={t.autor} onChange={(e) => updateItem('testimonios', i, { autor: e.target.value })} style={inputStyle} />
            </ItemCard>
          ))}
          <BotonAgregar onClick={() => addItem('testimonios', { texto: '', autor: '' })} texto="+ Agregar testimonio" />
        </SeccionLista>
      )}

      <button onClick={guardar} disabled={guardando} style={{ marginTop: 24, padding: '10px 20px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
        {guardando ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </div>
  );
}

function SeccionLista({ titulo, ayuda, children }: { titulo: string; ayuda: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 28, paddingTop: 16, borderTop: '1px solid #eee' }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>{titulo}</h2>
      <p style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>{ayuda}</p>
      {children}
    </div>
  );
}

function ItemCard({ children, onQuitar }: { children: React.ReactNode; onQuitar: () => void }) {
  return (
    <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 10, position: 'relative' }}>
      {children}
      <button onClick={onQuitar} style={{ marginTop: 4, fontSize: 12, color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer' }}>
        Quitar
      </button>
    </div>
  );
}

function BotonAgregar({ onClick, texto }: { onClick: () => void; texto: string }) {
  return (
    <button onClick={onClick} style={{ fontSize: 13, color: '#111', background: '#f5f5f5', border: '1px dashed #ccc', borderRadius: 6, padding: '8px 12px', cursor: 'pointer', width: '100%' }}>
      {texto}
    </button>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, color: '#666', marginTop: 12, marginBottom: 4 };
const inputStyle: React.CSSProperties = { display: 'block', width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', marginBottom: 8 };
