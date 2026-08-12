'use client';

import Link from 'next/link';
import { useMiNegocio } from '@/lib/useMiNegocio';

const TEMPLATE_LABELS: Record<string,string> = { 'landing-negocio': 'Impulso', 'landing-profesionista': 'Esencia', 'tienda-moderno': 'Minimalista', 'tienda-directo': 'Colores' };

export default function ResumenPanel() {
  const { negocio, cargando } = useMiNegocio();

  if (cargando) return <div className="panel-card panel-empty">Cargando información...</div>;
  if (!negocio) return <div className="panel-card panel-empty">No encontramos tu negocio. Inicia sesión de nuevo.</div>;

  const dominioBase = negocio.dominio_base || 'creatusitio.mx';
  const url = `https://${negocio.subdominio}.${dominioBase}`;
  const activo = negocio.estado === 'activo';

  return (
    <div>
      <div className="panel-page-head">
        <div>
          <div className="panel-eyebrow">Resumen general</div>
          <h1>Hola, {negocio.nombre}</h1>
          <p>Revisa el estado de tu sitio y continúa configurándolo.</p>
        </div>
        <a href={url} target="_blank" rel="noreferrer" className="panel-button">
          Ver mi página ↗
        </a>
      </div>

      <section className="summary-hero panel-card">
        <div>
          <span className={`status-pill ${activo ? 'active' : ''}`}>
            <i /> {activo ? 'Sitio publicado' : 'Sitio pausado'}
          </span>
          <h2>Tu página está lista para recibir visitas.</h2>
          <p>Comparte este enlace con tus clientes en WhatsApp, Instagram o donde prefieras.</p>
          <a href={url} target="_blank" rel="noreferrer" className="site-url">
            {negocio.subdominio}.{dominioBase} <span>↗</span>
          </a>
        </div>
        <div className="summary-illustration">
          <div className="mini-browser">
            <div className="mini-browser-top"><i/><i/><i/></div>
            <div className="mini-site"><b>{negocio.nombre}</b><span/><span/><em/></div>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <div className="panel-card stat-card">
          <span>Tipo de página</span>
          <strong>{negocio.tipo}</strong>
          <small>Formato actual de tu sitio</small>
        </div>
        <div className="panel-card stat-card">
          <span>Plantilla activa</span>
          <strong>{negocio.tipo === 'landing' && negocio.config?.builderPreset === 'lienzo' ? 'Lienzo' : TEMPLATE_LABELS[negocio.template_id] || negocio.template_id || 'Sin elegir'}</strong>
          <small>Puedes cambiarla sin perder contenido</small>
        </div>
        <div className="panel-card stat-card">
          <span>WhatsApp</span>
          <strong className="mono">{negocio.config?.whatsapp || 'Sin configurar'}</strong>
          <small>Canal principal de contacto</small>
        </div>
      </section>

      <section className="quick-section">
        <div className="section-title">
          <div>
            <h2>Continúa configurando</h2>
            <p>Completa estos pasos para que tu página se vea mejor.</p>
          </div>
        </div>
        <div className="quick-grid">
          {negocio.tipo === 'tienda' && (
            <Link href="/panel/productos" className="quick-card panel-card">
              <span className="quick-icon">□</span>
              <div><strong>Administra productos</strong><small>Agrega precios, fotos y categorías.</small></div>
              <b>→</b>
            </Link>
          )}
          <Link href="/panel/diseno" className="quick-card panel-card">
            <span className="quick-icon">✦</span>
            <div><strong>Personaliza el diseño</strong><small>Edita colores, logo y contenido.</small></div>
            <b>→</b>
          </Link>
          <Link href="/panel/plantillas" className="quick-card panel-card">
            <span className="quick-icon">▦</span>
            <div><strong>Cambia la plantilla</strong><small>Prueba otra presentación sin perder datos.</small></div>
            <b>→</b>
          </Link>
        </div>
      </section>

      <style jsx>{`
        .summary-hero{position:relative;overflow:hidden;min-height:260px;display:grid;grid-template-columns:1.15fr .85fr;align-items:center;padding:34px;background:linear-gradient(135deg,#fff 0%,#fff8f5 100%)}
        .summary-hero h2{max-width:520px;margin-top:16px;font-size:30px}
        .summary-hero p{max-width:520px;margin-top:10px;color:var(--color-ink-soft);font-size:13px;line-height:1.6}
        .status-pill{display:inline-flex;align-items:center;gap:7px;padding:6px 9px;border-radius:999px;background:#f1eee7;color:#777b88;font-size:10px;font-weight:700}
        .status-pill i{width:6px;height:6px;border-radius:50%;background:#9b9eaa}
        .status-pill.active{background:#e4f3eb;color:#177455}.status-pill.active i{background:#1c9a6d}
        .site-url{display:inline-flex;gap:7px;margin-top:22px;color:var(--color-accent);font:600 13px var(--font-mono);text-decoration:none}
        .summary-illustration{display:grid;place-items:center}
        .mini-browser{width:240px;padding:7px;border:1px solid #ddd6ca;border-radius:13px;background:#fff;box-shadow:0 20px 45px rgba(31,26,19,.1);transform:rotate(3deg)}
        .mini-browser-top{height:24px;display:flex;align-items:center;gap:4px;padding:0 5px}
        .mini-browser-top i{width:5px;height:5px;border-radius:50%;background:#d8d3ca}
        .mini-site{height:145px;padding:25px;border-radius:8px;background:#f6eee3}.mini-site b{display:block;font:700 19px var(--font-display)}
        .mini-site span{display:block;width:75%;height:6px;margin-top:9px;border-radius:99px;background:#dcd3c6}.mini-site span+span{width:55%}
        .mini-site em{display:block;width:65px;height:23px;margin-top:20px;border-radius:5px;background:var(--color-accent)}
        .stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-top:16px}
        .stat-card{padding:22px}.stat-card span,.stat-card small{display:block;color:var(--color-ink-soft);font-size:10px}.stat-card strong{display:block;margin:9px 0 6px;font-size:17px;text-transform:capitalize}.stat-card .mono{font:600 13px var(--font-mono);text-transform:none}
        .quick-section{margin-top:35px}.section-title h2{font-size:20px}.section-title p{margin-top:4px;color:var(--color-ink-soft);font-size:12px}
        .quick-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-top:15px}
        .quick-card{display:flex;align-items:center;gap:12px;padding:18px;text-decoration:none;transition:.18s ease}.quick-card:hover{transform:translateY(-3px);box-shadow:0 14px 35px rgba(35,29,20,.07)}
        .quick-icon{width:38px;height:38px;display:grid;place-items:center;flex:none;border-radius:10px;background:#fff0eb;color:var(--color-accent)}
        .quick-card div{display:grid;gap:3px}.quick-card strong{font-size:12px}.quick-card small{color:var(--color-ink-soft);font-size:10px;line-height:1.4}.quick-card>b{margin-left:auto;color:var(--color-accent)}
        @media(max-width:900px){.summary-hero{grid-template-columns:1fr}.summary-illustration{display:none}.stats-grid,.quick-grid{grid-template-columns:1fr}}
      `}</style>
    </div>
  );
}
