'use client';

import { useEffect, useMemo, useState } from 'react';

function agrupar(products: any[], categories: string[]) {
  const ordenadas = categories.length ? categories : Array.from(new Set(products.map((p) => p.categoria || 'General')));
  const extra = Array.from(new Set(products.map((p) => p.categoria || 'General'))).filter((c) => !ordenadas.includes(c));
  return [...ordenadas, ...extra]
    .map((categoria) => ({ categoria, items: products.filter((p) => (p.categoria || 'General') === categoria) }))
    .filter((g) => g.items.length);
}

export default function MenuInformativo({ business, products }: { business: any; products: any[] }) {
  const config = business.config || {};
  const grupos = useMemo(() => agrupar(products, business.categories || []), [products, business.categories]);
  const [categoria, setCategoria] = useState(grupos[0]?.categoria || '');
  const [imagenActiva, setImagenActiva] = useState<{ url: string; nombre: string } | null>(null);
  const primary = config.colorPrimario || '#8a5c34';
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
    <main style={{ minHeight: '100vh', background: '#fbf8f3', color: '#2d2925', fontFamily: 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
      <header style={{ padding: '34px 20px 26px', textAlign: 'center', background: '#fff', borderBottom: '1px solid #ebe3d8' }}>
        {config.logoUrl && <img src={config.logoUrl} alt={business.nombre} style={{ width: 76, height: 76, objectFit: 'cover', borderRadius: 22, marginBottom: 14 }} />}
        <h1 style={{ margin: 0, fontFamily: 'Georgia,serif', fontSize: 34, letterSpacing: '-.03em' }}>{config.titulo || business.nombre}</h1>
        {config.descripcion && <p style={{ maxWidth: 560, margin: '9px auto 0', color: '#766e66', fontSize: 14, lineHeight: 1.6 }}>{config.descripcion}</p>}
      </header>

      <div style={{ position: 'sticky', top: 0, zIndex: 10, overflowX: 'auto', background: 'rgba(251,248,243,.94)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #ebe3d8' }}>
        <nav style={{ maxWidth: 760, margin: '0 auto', padding: '12px 16px', display: 'flex', gap: 8 }}>
          {grupos.map((g) => {
            const active = g.categoria === categoria;
            return <button key={g.categoria} onClick={() => setCategoria(g.categoria)} style={{ flex: '0 0 auto', border: `1px solid ${active ? primary : '#ddd3c7'}`, background: active ? primary : '#fff', color: active ? '#fff' : '#5f5851', borderRadius: 999, padding: '9px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>{g.categoria}</button>;
          })}
        </nav>
      </div>

      <section style={{ maxWidth: 760, margin: '0 auto', padding: '28px 16px 70px' }}>
        {!grupos.length && <div style={{ padding: 50, textAlign: 'center', color: '#867d74' }}>Este menú estará disponible muy pronto.</div>}
        {visibles.map((g) => (
          <div key={g.categoria}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}><h2 style={{ margin: 0, fontFamily: 'Georgia,serif', fontSize: 26 }}>{g.categoria}</h2><span style={{ height: 1, background: '#ded4c7', flex: 1 }} /></div>
            <div style={{ display: 'grid', gap: 12 }}>
              {g.items.map((p: any) => (
                <article key={p.id} style={{ display: 'grid', gridTemplateColumns: p.imagen_url ? '112px 1fr' : '1fr', gap: 16, padding: 12, border: '1px solid #e8dfd4', borderRadius: 18, background: '#fff', boxShadow: '0 8px 28px rgba(71,54,35,.04)' }}>
                  {p.imagen_url && <button className="menu-photo" onClick={() => setImagenActiva({ url: p.imagen_url, nombre: p.nombre })} aria-label={`Ver imagen de ${p.nombre}`}><img src={p.imagen_url} alt={p.nombre} /></button>}
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', padding: '8px 6px 8px 0' }}>
                    <div><h3 style={{ margin: 0, fontSize: 16 }}>{p.nombre}</h3>{p.descripcion && <p style={{ margin: '7px 0 0', color: '#766e66', fontSize: 13, lineHeight: 1.5 }}>{p.descripcion}</p>}</div>
                    {Number(p.precio) > 0 && <strong style={{ flex: '0 0 auto', color: primary, fontSize: 15 }}>${Number(p.precio).toFixed(2)}</strong>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>
      <footer style={{ padding: '20px', textAlign: 'center', color: '#9a928a', fontSize: 11 }}>Menú digital · Powered by enla.mx</footer>

      {imagenActiva && <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setImagenActiva(null)}><button className="close" onClick={() => setImagenActiva(null)} aria-label="Cerrar">×</button><figure onClick={(e) => e.stopPropagation()}><img src={imagenActiva.url} alt={imagenActiva.nombre} /><figcaption>{imagenActiva.nombre}</figcaption></figure></div>}

      <style jsx>{`
        .menu-photo{width:112px;height:112px;padding:0;border:0;border-radius:13px;overflow:hidden;background:#eee;cursor:zoom-in}.menu-photo img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .2s ease}.menu-photo:hover img{transform:scale(1.04)}.lightbox{position:fixed;inset:0;z-index:100;background:rgba(13,11,9,.92);display:grid;place-items:center;padding:28px;cursor:zoom-out}.lightbox figure{margin:0;max-width:min(1050px,95vw);max-height:90vh;display:grid;gap:12px;justify-items:center;cursor:default}.lightbox figure img{max-width:100%;max-height:82vh;object-fit:contain;border-radius:12px;box-shadow:0 24px 80px rgba(0,0,0,.35)}.lightbox figcaption{color:#fff;font-size:13px;font-weight:700}.close{position:fixed;right:20px;top:18px;width:44px;height:44px;border:1px solid rgba(255,255,255,.25);border-radius:50%;background:rgba(255,255,255,.1);color:#fff;font-size:28px;line-height:1;cursor:pointer}@media(max-width:520px){article{grid-template-columns:88px 1fr!important}.menu-photo{width:88px!important;height:88px!important}}
      `}</style>
    </main>
  );
}
