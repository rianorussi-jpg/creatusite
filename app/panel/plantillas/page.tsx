'use client';

import { useState } from 'react';
import { useMiNegocio } from '@/lib/useMiNegocio';
import { createPresetBlocks, defaultLandingTheme, legacyBlocks, type LandingPreset } from '@/components/templates/LandingFlexible';

type TemplateOption = { id: string; nombre: string; descripcion: string; estilo: string; virtualPreset?: LandingPreset };

const OPCIONES_POR_TIPO: Record<string, TemplateOption[]> = {
  tienda: [
    { id: 'tienda-moderno', nombre: 'Minimalista', descripcion: 'Diseño limpio en tonos verdes con compra guiada paso a paso.', estilo: 'steps' },
    { id: 'tienda-directo', nombre: 'Colores', descripcion: 'Diseño llamativo en rojo y amarillo con catálogo más directo.', estilo: 'direct' }
  ],
  landing: [
    { id: 'landing-negocio', nombre: 'Impulso', descripcion: 'Moderna, dinámica y comercial. Empieza con una estructura enfocada en conversión y luego personaliza todos sus bloques.', estilo: 'negocio', virtualPreset: 'impulso' },
    { id: 'landing-profesionista', nombre: 'Esencia', descripcion: 'Elegante, limpia y editorial. Una base sobria que después puedes transformar completamente.', estilo: 'profesionista', virtualPreset: 'esencia' },
    { id: 'landing-lienzo', nombre: 'Lienzo', descripcion: 'La opción más libre: una base neutra con servicios, galería, texto, CTA y contacto para crear cientos de combinaciones.', estilo: 'lienzo', virtualPreset: 'lienzo' }
  ]
};

export default function PlantillaPanel() {
  const { negocio, setNegocio, cargando, supabase } = useMiNegocio();
  const [guardando, setGuardando] = useState('');
  const opciones = negocio ? OPCIONES_POR_TIPO[negocio.tipo] || [] : [];

  const presetActual: LandingPreset = negocio?.config?.builderPreset === 'lienzo'
    ? 'lienzo'
    : negocio?.template_id === 'landing-profesionista'
      ? 'esencia'
      : 'impulso';

  function opcionActiva(op: TemplateOption) {
    if (!negocio) return false;
    if (op.virtualPreset === 'lienzo') return negocio.tipo === 'landing' && negocio.config?.builderPreset === 'lienzo';
    if (op.virtualPreset === 'impulso') return negocio.template_id === 'landing-negocio' && negocio.config?.builderPreset !== 'lienzo';
    if (op.virtualPreset === 'esencia') return negocio.template_id === 'landing-profesionista';
    return negocio.template_id === op.id;
  }

  async function elegir(op: TemplateOption) {
    if (!negocio || opcionActiva(op)) return;
    setGuardando(op.id);

    if (negocio.tipo === 'landing' && op.virtualPreset) {
      const targetPreset = op.virtualPreset;
      const currentBlocks = legacyBlocks(negocio.config || {}, presetActual);
      const hasCustomBlocks = Array.isArray(negocio.config?.blocks) && negocio.config.blocks.length > 0;
      const blocks = targetPreset === 'lienzo' && !hasCustomBlocks
        ? createPresetBlocks('lienzo', negocio.config || {})
        : currentBlocks;
      const siguienteConfig = {
        ...(negocio.config || {}),
        builderPreset: targetPreset,
        blocks,
        theme: defaultLandingTheme(targetPreset)
      };
      const templateId = targetPreset === 'esencia' ? 'landing-profesionista' : 'landing-negocio';
      const { error } = await supabase.from('businesses').update({ template_id: templateId, config: siguienteConfig }).eq('id', negocio.id);
      if (!error) setNegocio({ ...negocio, template_id: templateId, config: siguienteConfig });
      setGuardando('');
      return;
    }

    const { error } = await supabase.from('businesses').update({ template_id: op.id }).eq('id', negocio.id);
    if (!error) setNegocio({ ...negocio, template_id: op.id });
    setGuardando('');
  }

  if (cargando || !negocio) return <div className="panel-card panel-empty">Cargando plantillas...</div>;

  return (
    <div>
      <div className="panel-page-head">
        <div><div className="panel-eyebrow">Punto de partida</div><h1>Plantillas</h1><p>Elige una base visual para <strong>{negocio.nombre}</strong>. En las landing, cualquier opción se puede transformar por completo desde el editor.</p></div>
      </div>

      <div className="template-note"><span>✦</span><div><strong>Las plantillas ya no te limitan</strong><p>Son un punto de partida. Puedes agregar, repetir, mover, ocultar o eliminar cualquier bloque.</p></div></div>

      <div className="templates-grid">
        {opciones.map((op) => {
          const activa = opcionActiva(op);
          return (
            <button key={op.id} onClick={() => elegir(op)} className={`template-card panel-card ${activa ? 'active' : ''}`}>
              <div className={`template-preview ${op.estilo}`}>
                <div className="preview-nav"><i/><span/><span/><span/></div>
                <div className="preview-body"><div><b/><span/><span/><em/></div><div className="preview-image"/></div>
                <div className="preview-footer"><span/><span/><span/></div>
              </div>
              <div className="template-info">
                <div><strong>{op.nombre}</strong>{activa && <span>Activa</span>}</div>
                <p>{op.descripcion}</p>
                <em>{guardando === op.id ? 'Aplicando...' : activa ? 'Plantilla seleccionada' : 'Usar como punto de partida →'}</em>
              </div>
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .template-note{display:flex;align-items:center;gap:11px;margin-bottom:22px;padding:13px 15px;border:1px solid #ddd4f7;border-radius:11px;background:#f7f4ff}.template-note>span{width:28px;height:28px;display:grid;place-items:center;border-radius:8px;background:#e9e1ff;color:#7042cf;font-weight:800}.template-note strong{font-size:11px}.template-note p{margin-top:2px;color:#6f6b7c;font-size:9px}
        .templates-grid{display:grid;grid-template-columns:repeat(3,minmax(240px,1fr));gap:18px}.template-card{overflow:hidden;padding:0;text-align:left;cursor:pointer;transition:.2s ease}.template-card:hover{transform:translateY(-4px);box-shadow:0 17px 38px rgba(37,30,20,.08)}.template-card.active{border:2px solid var(--color-accent)}
        .template-preview{height:205px;padding:16px;background:#eef1ec}.preview-nav{height:28px;display:flex;align-items:center;gap:5px;padding:0 8px;border-radius:6px 6px 0 0;background:#fff}.preview-nav i{width:34px;height:6px;border-radius:99px;background:#252a3e}.preview-nav span{width:18px;height:4px;margin-left:auto;border-radius:99px;background:#d7d2c9}.preview-nav span+span{margin-left:2px}.preview-body{height:122px;display:grid;grid-template-columns:1fr .75fr;align-items:center;gap:12px;padding:16px;background:#fff}.preview-body b,.preview-body span,.preview-body em{display:block;border-radius:99px}.preview-body b{width:72%;height:12px;background:#23283b}.preview-body span{width:88%;height:5px;margin-top:8px;background:#d8d2c8}.preview-body span+span{width:62%}.preview-body em{width:45px;height:18px;margin-top:12px;background:#2f6b46}.preview-image{height:82px!important;border-radius:10px!important;background:#dce8df!important}.preview-footer{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;padding-top:7px}.preview-footer span{height:20px;border-radius:4px;background:#fff}
        .direct{background:#fff0dd}.direct .preview-nav{background:#c81620}.direct .preview-nav i{background:#fff}.direct .preview-nav span{background:#ffc933}.direct .preview-body{background:#fff7ea}.direct .preview-body em,.direct .preview-image{background:#ffc933!important}.direct .preview-body b{background:#c81620}.negocio{background:#edf3ff}.negocio .preview-body{background:#2563eb}.negocio .preview-body b{background:#fff}.negocio .preview-body span{background:#a9c3ff}.negocio .preview-body em{background:#fff}.negocio .preview-image{background:#ffffff35!important}.profesionista{background:#eef7f6}.profesionista .preview-body{background:#f1f8f7}.profesionista .preview-body b{background:#0d5c63}.profesionista .preview-body em{background:#0d5c63}.profesionista .preview-image{background:#0d5c631c!important}.lienzo{background:#f5f1ff}.lienzo .preview-nav{background:#fff}.lienzo .preview-nav i{background:#7c3aed}.lienzo .preview-body{grid-template-columns:1fr;background:#fbfbfe;text-align:center}.lienzo .preview-body>div:first-child{display:grid;justify-items:center}.lienzo .preview-body b{width:56%;background:#171526}.lienzo .preview-body span{width:70%;background:#d8d2e8}.lienzo .preview-body em{background:#7c3aed}.lienzo .preview-image{display:none}
        .template-info{padding:18px}.template-info>div{display:flex;align-items:center;justify-content:space-between}.template-info strong{font-size:15px}.template-info>div span{padding:5px 7px;border-radius:999px;background:#fff0eb;color:var(--color-accent);font-size:8px;font-weight:700}.template-info p{min-height:48px;margin-top:7px;color:var(--color-ink-soft);font-size:10px;line-height:1.5}.template-info em{display:block;margin-top:13px;color:var(--color-accent);font-size:9px;font-style:normal;font-weight:700}
        @media(max-width:1050px){.templates-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:700px){.templates-grid{grid-template-columns:1fr}.template-preview{height:195px}}
      `}</style>
    </div>
  );
}
