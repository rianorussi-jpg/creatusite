'use client';

import { useEffect, useMemo, useState } from 'react';

function agrupar(products: any[], categories: string[]) {
  const presentes = Array.from(new Set(products.map((p) => p.categoria || 'General')));
  const ordenadas = categories.length ? categories : presentes;
  const extra = presentes.filter((c) => !ordenadas.includes(c));
  return [...ordenadas, ...extra]
    .map((categoria) => ({ categoria, items: products.filter((p) => (p.categoria || 'General') === categoria) }))
    .filter((g) => g.items.length);
}

export default function MenuGaleria({ business, products }: { business: any; products: any[] }) {
  const config = business.config || {};
  const grupos = useMemo(() => agrupar(products, business.categories || []), [products, business.categories]);
  const [categoria, setCategoria] = useState(grupos[0]?.categoria || '');
  const [imagenActiva, setImagenActiva] = useState<{ url: string; nombre: string } | null>(null);
  const primary = config.colorPrimario || '#111111';
  const visibles = categoria ? grupos.filter((g) => g.categoria === categoria) : grupos;

  useEffect(() => {
    if (!imagenActiva) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setImagenActiva(null);
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [imagenActiva]);

  return (
    <main className="gallery-menu">
      <header className={`hero ${config.portadaUrl ? 'with-cover' : ''}`} style={config.portadaUrl ? { backgroundImage: `linear-gradient(180deg,rgba(0,0,0,.18),rgba(0,0,0,.66)),url(${config.portadaUrl})` } : undefined}>
        <div className="hero-inner">
          {config.logoUrl && <img className="logo" src={config.logoUrl} alt={business.nombre} />}
          <span className="kicker">MENÚ</span>
          <h1>{config.titulo || business.nombre}</h1>
          {config.descripcion && <p>{config.descripcion}</p>}
        </div>
      </header>

      <nav className="category-bar">
        <div className="category-inner">
          {grupos.map((g) => {
            const active = g.categoria === categoria;
            return <button key={g.categoria} className={active ? 'active' : ''} style={active ? { background: primary, borderColor: primary } : undefined} onClick={() => setCategoria(g.categoria)}>{g.categoria}</button>;
          })}
        </div>
      </nav>

      <section className="content">
        {!grupos.length && <div className="empty">Este menú estará disponible muy pronto.</div>}
        {visibles.map((g) => (
          <section key={g.categoria} className="category-section">
            <div className="section-title"><span>{g.categoria}</span><small>{g.items.length} {g.items.length === 1 ? 'opción' : 'opciones'}</small></div>
            <div className="masonry-grid">
              {g.items.map((p: any, index: number) => (
                <article key={p.id} className={`dish ${index % 5 === 0 ? 'featured' : ''}`}>
                  {p.imagen_url ? (
                    <button className="photo-button" onClick={() => setImagenActiva({ url: p.imagen_url, nombre: p.nombre })} aria-label={`Ver imagen de ${p.nombre}`}>
                      <img src={p.imagen_url} alt={p.nombre} />
                      <span className="zoom">↗</span>
                    </button>
                  ) : <div className="photo-placeholder"><span>{p.nombre?.slice(0, 1)?.toUpperCase() || 'M'}</span></div>}
                  <div className="dish-info">
                    <div className="dish-heading"><h2>{p.nombre}</h2>{Number(p.precio) > 0 && <strong style={{ color: primary }}>${Number(p.precio).toFixed(2)}</strong>}</div>
                    {p.descripcion && <p>{p.descripcion}</p>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </section>

      <footer>Menú digital · Powered by enla.mx</footer>

      {imagenActiva && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setImagenActiva(null)}>
          <button className="close" onClick={() => setImagenActiva(null)} aria-label="Cerrar">×</button>
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={imagenActiva.url} alt={imagenActiva.nombre} />
            <figcaption>{imagenActiva.nombre}</figcaption>
          </figure>
        </div>
      )}

      <style jsx>{`
        .gallery-menu{min-height:100vh;background:#f1f0ec;color:#171717;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.hero{min-height:300px;display:flex;align-items:flex-end;background:#181818;color:#fff;padding:52px 24px 38px}.hero.with-cover{min-height:410px;background-size:cover;background-position:center}.hero-inner{width:min(1120px,100%);margin:0 auto}.logo{width:72px;height:72px;object-fit:cover;border-radius:50%;border:3px solid rgba(255,255,255,.8);margin-bottom:20px}.kicker{display:block;font-size:11px;letter-spacing:.22em;font-weight:900;opacity:.72;margin-bottom:8px}.hero h1{font-size:clamp(42px,8vw,82px);line-height:.92;letter-spacing:-.055em;margin:0;max-width:850px}.hero p{font-size:15px;line-height:1.65;max-width:590px;margin:18px 0 0;color:rgba(255,255,255,.78)}.category-bar{position:sticky;top:0;z-index:20;background:rgba(241,240,236,.93);backdrop-filter:blur(18px);border-bottom:1px solid rgba(0,0,0,.08)}.category-inner{width:min(1120px,100%);margin:0 auto;display:flex;gap:8px;overflow-x:auto;padding:13px 18px;scrollbar-width:none}.category-inner::-webkit-scrollbar{display:none}.category-inner button{flex:0 0 auto;border:1px solid #c9c6bf;background:#fff;border-radius:999px;padding:9px 15px;font-size:12px;font-weight:800;cursor:pointer}.category-inner button.active{color:#fff}.content{width:min(1120px,100%);margin:0 auto;padding:38px 18px 80px}.category-section+.category-section{margin-top:62px}.section-title{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:18px}.section-title span{font-size:28px;font-weight:900;letter-spacing:-.035em}.section-title small{font-size:11px;color:#777}.masonry-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:14px}.dish{grid-column:span 4;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 12px 35px rgba(0,0,0,.055)}.dish.featured{grid-column:span 8}.photo-button{display:block;position:relative;width:100%;height:300px;padding:0;border:0;background:#ddd;cursor:zoom-in;overflow:hidden}.featured .photo-button{height:430px}.photo-button img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .35s ease}.photo-button:hover img{transform:scale(1.025)}.zoom{position:absolute;right:12px;top:12px;width:34px;height:34px;display:grid;place-items:center;border-radius:50%;background:rgba(255,255,255,.9);color:#111;font-size:15px;box-shadow:0 5px 18px rgba(0,0,0,.12)}.photo-placeholder{height:260px;display:grid;place-items:center;background:linear-gradient(145deg,#e0ded8,#c9c6be)}.photo-placeholder span{font-size:72px;font-weight:900;color:rgba(255,255,255,.8)}.dish-info{padding:18px 18px 20px}.dish-heading{display:flex;gap:16px;justify-content:space-between;align-items:flex-start}.dish h2{margin:0;font-size:18px;line-height:1.15;letter-spacing:-.025em}.dish strong{font-size:16px;white-space:nowrap}.dish p{margin:9px 0 0;color:#6a6863;font-size:13px;line-height:1.5}.empty{text-align:center;padding:70px 20px;color:#777}footer{text-align:center;padding:24px;color:#888;font-size:11px}.lightbox{position:fixed;inset:0;z-index:100;background:rgba(8,8,8,.92);display:grid;place-items:center;padding:28px;cursor:zoom-out}.lightbox figure{margin:0;max-width:min(1100px,95vw);max-height:90vh;display:grid;gap:12px;justify-items:center;cursor:default}.lightbox img{display:block;max-width:100%;max-height:82vh;object-fit:contain;border-radius:12px;box-shadow:0 24px 80px rgba(0,0,0,.35)}.lightbox figcaption{color:#fff;font-size:13px;font-weight:700}.close{position:fixed;right:20px;top:18px;width:44px;height:44px;border:1px solid rgba(255,255,255,.25);border-radius:50%;background:rgba(255,255,255,.1);color:#fff;font-size:28px;line-height:1;cursor:pointer}
        @media(max-width:850px){.dish,.dish.featured{grid-column:span 6}.featured .photo-button,.photo-button{height:300px}.hero.with-cover{min-height:350px}}
        @media(max-width:560px){.hero{min-height:250px;padding:42px 18px 28px}.hero.with-cover{min-height:310px}.hero h1{font-size:46px}.content{padding:28px 12px 60px}.masonry-grid{gap:10px}.dish,.dish.featured{grid-column:span 6;border-radius:14px}.photo-button,.featured .photo-button{height:190px}.dish-info{padding:12px}.dish-heading{display:block}.dish h2{font-size:14px}.dish strong{display:block;margin-top:6px;font-size:13px}.dish p{font-size:11px;margin-top:7px}.section-title span{font-size:23px}.lightbox{padding:16px}.close{right:12px;top:12px}}
      `}</style>
    </main>
  );
}
