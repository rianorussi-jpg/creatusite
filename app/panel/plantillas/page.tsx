'use client';

import { useState } from 'react';
import { useMiNegocio } from '@/lib/useMiNegocio';

const OPCIONES_POR_TIPO: Record<string, { id: string; nombre: string; descripcion: string; estilo: string }[]> = {
  tienda: [
    { id: 'tienda-moderno', nombre: 'Paso a paso', descripcion: 'Flujo guiado: menú, entrega y confirmación.', estilo: 'steps' },
    { id: 'tienda-directo', nombre: 'Menú directo', descripcion: 'Catálogo continuo con carrito flotante.', estilo: 'direct' }
  ],
  menu: [
    { id: 'tienda-moderno', nombre: 'Paso a paso', descripcion: 'Flujo guiado: menú, entrega y confirmación.', estilo: 'steps' },
    { id: 'tienda-directo', nombre: 'Menú directo', descripcion: 'Catálogo continuo con carrito flotante.', estilo: 'direct' }
  ],
  landing: [
    { id: 'minimalista', nombre: 'Minimalista', descripcion: 'Mucho espacio, tipografía grande y enfoque limpio.', estilo: 'minimal' },
    { id: 'sencillo', nombre: 'Sencillo', descripcion: 'Directo, llamativo y enfocado en conversión.', estilo: 'bold' }
  ]
};

export default function PlantillaPanel() {
  const { negocio, setNegocio, cargando, supabase } = useMiNegocio();
  const [guardando, setGuardando] = useState('');
  const opciones = negocio ? OPCIONES_POR_TIPO[negocio.tipo] || [] : [];

  async function elegir(id: string) {
    if (!negocio || id === negocio.template_id) return;
    setGuardando(id);
    await supabase.from('businesses').update({ template_id: id }).eq('id', negocio.id);
    setNegocio({ ...negocio, template_id: id });
    setGuardando('');
  }

  if (cargando || !negocio) return <div className="panel-card panel-empty">Cargando plantillas...</div>;

  return (
    <div>
      <div className="panel-page-head">
        <div><div className="panel-eyebrow">Apariencia</div><h1>Plantillas</h1><p>Elige cómo se organiza y presenta la información de tu página.</p></div>
      </div>

      <div className="template-note"><span>✓</span><div><strong>Puedes cambiar cuando quieras</strong><p>Tus productos, textos, colores e imágenes se mantienen.</p></div></div>

      <div className="templates-grid">
        {opciones.map((op) => {
          const activa = negocio.template_id === op.id;
          return (
            <button key={op.id} onClick={() => elegir(op.id)} className={`template-card panel-card ${activa ? 'active' : ''}`}>
              <div className={`template-preview ${op.estilo}`}>
                <div className="preview-nav"><i/><span/><span/></div>
                <div className="preview-body"><div><b/><span/><span/><em/></div><div className="preview-image"/></div>
                <div className="preview-footer"><span/><span/><span/></div>
              </div>
              <div className="template-info">
                <div><strong>{op.nombre}</strong>{activa && <span>Activa</span>}</div>
                <p>{op.descripcion}</p>
                <em>{guardando === op.id ? 'Aplicando...' : activa ? 'Plantilla seleccionada' : 'Usar esta plantilla →'}</em>
              </div>
            </button>
          );
        })}
      </div>

      {opciones.length === 0 && <div className="panel-card panel-empty">No hay plantillas disponibles para este tipo de página.</div>}

      <style jsx>{`
        .template-note{display:flex;align-items:center;gap:11px;margin-bottom:22px;padding:13px 15px;border:1px solid #cfe7dc;border-radius:11px;background:#eef8f3}.template-note>span{width:28px;height:28px;display:grid;place-items:center;border-radius:8px;background:#d9f0e5;color:#16805d;font-weight:800}.template-note strong{font-size:11px}.template-note p{margin-top:2px;color:#63756d;font-size:9px}
        .templates-grid{display:grid;grid-template-columns:repeat(2,minmax(260px,430px));gap:18px}.template-card{overflow:hidden;padding:0;text-align:left;cursor:pointer;transition:.2s ease}.template-card:hover{transform:translateY(-4px);box-shadow:0 17px 38px rgba(37,30,20,.08)}.template-card.active{border:2px solid var(--color-accent)}
        .template-preview{height:220px;padding:18px;background:#f3eee5}.preview-nav{height:28px;display:flex;align-items:center;gap:5px;padding:0 8px;border-radius:6px 6px 0 0;background:#fff}.preview-nav i{width:25px;height:6px;border-radius:99px;background:#252a3e}.preview-nav span{width:18px;height:4px;margin-left:auto;border-radius:99px;background:#d7d2c9}.preview-nav span+span{margin-left:2px}
        .preview-body{height:135px;display:grid;grid-template-columns:1fr .75fr;align-items:center;gap:12px;padding:18px;background:#fff9f2}.preview-body b,.preview-body span,.preview-body em{display:block;border-radius:99px}.preview-body b{width:72%;height:12px;background:#23283b}.preview-body span{width:88%;height:5px;margin-top:8px;background:#d8d2c8}.preview-body span+span{width:62%}.preview-body em{width:45px;height:18px;margin-top:12px;background:var(--color-accent)}.preview-image{height:88px!important;border-radius:10px!important;background:#e7b292!important}.preview-footer{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;padding-top:7px}.preview-footer span{height:22px;border-radius:4px;background:#fff}
        .direct .preview-body{grid-template-columns:1fr 1fr}.direct .preview-image{border-radius:50%!important}.minimal{background:#f6f6f4}.minimal .preview-body{background:#fff}.minimal .preview-body em{background:#252a3e}.bold{background:#252a3e}.bold .preview-body{background:#ff5c3f}.bold .preview-body b{background:#fff}.bold .preview-body span{background:#ffc1b6}.bold .preview-body em{background:#252a3e}
        .template-info{padding:18px}.template-info>div{display:flex;align-items:center;justify-content:space-between}.template-info strong{font-size:15px}.template-info>div span{padding:5px 7px;border-radius:999px;background:#fff0eb;color:var(--color-accent);font-size:8px;font-weight:700}.template-info p{min-height:34px;margin-top:7px;color:var(--color-ink-soft);font-size:10px;line-height:1.5}.template-info em{display:block;margin-top:13px;color:var(--color-accent);font-size:9px;font-style:normal;font-weight:700}
        @media(max-width:760px){.templates-grid{grid-template-columns:1fr}.template-preview{height:195px}}
      `}</style>
    </div>
  );
}
