'use client';

import { useEffect, useRef, useState } from 'react';

const k = {
  red: '#C81620', redDark: '#8F0F17', yellow: '#FFC933', cream: '#FFF7EA',
  ink: '#1B1410', gray: '#7A6B60', line: '#EBDFCF', wa: '#25D366'
};

function agruparPorCategoria(products) {
  const grupos = {};
  for (const p of products) {
    const cat = p.categoria || 'General';
    if (!grupos[cat]) grupos[cat] = [];
    grupos[cat].push(p);
  }
  return grupos;
}

export default function TiendaDirecto({ business, products }) {
  const { config, nombre } = business;
  const grupos = agruparPorCategoria(products);
  const categorias = Object.keys(grupos);

  const [carrito, setCarrito] = useState({});
  const [activeCat, setActiveCat] = useState(categorias[0]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [step, setStep] = useState('cart');
  const [deliveryType, setDeliveryType] = useState(null);
  const [direccion, setDireccion] = useState('');
  const refs = useRef({});

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveCat(e.target.dataset.cat);
        });
      },
      { rootMargin: '-120px 0px -70% 0px' }
    );
    Object.values(refs.current).forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [products]);

  const cambiarQty = (id, delta) => {
    setCarrito((prev) => {
      const nueva = (prev[id] || 0) + delta;
      const copia = { ...prev };
      if (nueva <= 0) delete copia[id];
      else copia[id] = nueva;
      return copia;
    });
  };

  const entries = Object.entries(carrito).map(([id, qty]) => ({ producto: products.find((p) => p.id === id), qty }));
  const total = entries.reduce((s, e) => s + (e.producto ? e.producto.precio * e.qty : 0), 0);
  const count = entries.reduce((s, e) => s + e.qty, 0);

  const enviarWhatsapp = () => {
    const numero = config?.whatsapp || '';
    let msg = `Hola! Quiero pedir en ${nombre}:%0A`;
    entries.forEach((e) => (msg += `- ${e.qty}x ${e.producto.nombre} ($${e.producto.precio} c/u)%0A`));
    msg += `Total: $${total.toFixed(0)}%0A%0A`;
    msg += deliveryType === 'domicilio' ? `Entrega a domicilio: ${encodeURIComponent(direccion)}` : 'Recojo en tienda';
    window.open(`https://wa.me/${numero}?text=${msg}`, '_blank');
  };

  return (
    <div style={{ background: k.cream, minHeight: '100vh', color: k.ink, fontFamily: 'system-ui,sans-serif', paddingBottom: 90 }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 60 }}>
        <div style={{ background: k.red, color: '#fff', padding: '14px 5vw' }}>
          <div style={{ fontWeight: 800, fontSize: 20 }}>{config?.titulo || nombre}</div>
          {config?.descripcion && <div style={{ fontSize: 11, color: k.yellow, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{config.descripcion}</div>}
        </div>
        <div style={{ display: 'flex', gap: 4, padding: '12px 5vw 0', overflowX: 'auto', background: k.cream, borderBottom: `2px solid ${k.line}` }}>
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => refs.current[cat]?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                background: 'none', border: 'none', fontWeight: 800, fontSize: 13.5, textTransform: 'uppercase',
                color: activeCat === cat ? k.red : k.gray, padding: '10px 14px 12px', cursor: 'pointer', whiteSpace: 'nowrap',
                borderBottom: activeCat === cat ? `3px solid ${k.red}` : '3px solid transparent'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '22px 5vw 10px' }}>
        {categorias.map((cat) => (
          <div key={cat} ref={(el) => (refs.current[cat] = el)} data-cat={cat}>
            <div style={{ fontWeight: 800, fontSize: 15, color: k.redDark, margin: '26px 0 12px', textTransform: 'uppercase' }}>{cat}</div>
            {grupos[cat].map((p) => (
              <div key={p.id} style={{ borderBottom: `1px solid ${k.line}`, padding: '16px 0', display: 'flex', gap: 12 }}>
                <div style={{ width: 60, height: 60, borderRadius: 10, background: k.yellow, flexShrink: 0, overflow: 'hidden' }}>
                  {p.imagen_url && <img src={p.imagen_url} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 15.5 }}>{p.nombre}</div>
                  {p.descripcion && <div style={{ fontSize: 13, color: k.gray, lineHeight: 1.5 }}>{p.descripcion}</div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                  <div style={{ background: k.yellow, color: k.redDark, fontWeight: 800, fontSize: 14, padding: '5px 10px', borderRadius: 4 }}>${Number(p.precio).toFixed(0)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => cambiarQty(p.id, -1)} style={btnQty}>−</button>
                    <span style={{ minWidth: 14, textAlign: 'center', fontWeight: 800 }}>{carrito[p.id] || 0}</span>
                    <button onClick={() => cambiarQty(p.id, 1)} style={btnQty}>+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </main>

      {count > 0 && (
        <div
          onClick={() => { setDrawerOpen(true); setStep('cart'); }}
          style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 70, background: k.ink, color: '#fff', padding: '12px 5vw', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
        >
          <div style={{ background: k.red, fontWeight: 800, fontSize: 13, borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>${total.toFixed(0)}</div>
            <div style={{ fontSize: 11, color: '#B8AFA8' }}>Ver pedido</div>
          </div>
          <button style={{ background: k.wa, color: '#04361D', border: 'none', fontWeight: 800, fontSize: 13, padding: '11px 16px', borderRadius: 7 }}>Ver pedido</button>
        </div>
      )}

      {drawerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(27,20,16,0.55)' }} onClick={() => setDrawerOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: k.cream, borderRadius: '18px 18px 0 0', maxHeight: '82vh', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ padding: '16px 20px 12px', display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${k.line}` }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{step === 'cart' ? 'Tu pedido' : '¿Cómo lo quieres?'}</div>
              <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', fontSize: 20, color: k.gray, cursor: 'pointer' }}>✕</button>
            </div>

            {step === 'cart' && (
              <>
                <div style={{ padding: '6px 20px 12px', overflowY: 'auto', flex: 1 }}>
                  {entries.map((e) => (
                    <div key={e.producto.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid ${k.line}` }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 14 }}>{e.producto.nombre}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                          <button onClick={() => cambiarQty(e.producto.id, -1)} style={btnQty}>−</button>
                          <span style={{ fontWeight: 800, fontSize: 13 }}>{e.qty}</span>
                          <button onClick={() => cambiarQty(e.producto.id, 1)} style={btnQty}>+</button>
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 13 }}>${(e.qty * e.producto.precio).toFixed(0)}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '14px 20px 22px', borderTop: `1px solid ${k.line}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 17, marginBottom: 12 }}><span>Total</span><span>${total.toFixed(0)}</span></div>
                  <button onClick={() => setStep('delivery')} style={btnPrimary}>Continuar</button>
                </div>
              </>
            )}

            {step === 'delivery' && (
              <>
                <div style={{ padding: '6px 20px 12px', overflowY: 'auto', flex: 1 }}>
                  <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                    {[['domicilio', 'A domicilio'], ['pickup', 'Pickup']].map(([v, lbl]) => (
                      <div key={v} onClick={() => setDeliveryType(v)} style={{ flex: 1, border: `2px solid ${deliveryType === v ? k.red : k.line}`, background: deliveryType === v ? '#FDECEA' : '#fff', borderRadius: 10, padding: '16px 10px', textAlign: 'center', cursor: 'pointer', fontWeight: 800, fontSize: 13.5 }}>{lbl}</div>
                    ))}
                  </div>
                  {deliveryType === 'domicilio' && (
                    <textarea value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Calle, número, referencias..." style={{ width: '100%', border: `1.5px solid ${k.line}`, borderRadius: 9, padding: '12px 14px', fontSize: 14, marginTop: 14, minHeight: 70, boxSizing: 'border-box' }} />
                  )}
                </div>
                <div style={{ padding: '14px 20px 22px', borderTop: `1px solid ${k.line}` }}>
                  <button onClick={() => setStep('cart')} style={{ background: 'none', border: 'none', color: k.gray, fontWeight: 700, fontSize: 12.5, cursor: 'pointer', marginBottom: 10 }}>← Volver al pedido</button>
                  <button
                    onClick={enviarWhatsapp}
                    disabled={!deliveryType || (deliveryType === 'domicilio' && direccion.trim().length < 5)}
                    style={{ ...btnPrimary, background: k.wa, color: '#04361D' }}
                  >
                    Confirmar pedido
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const btnQty = { width: 24, height: 24, borderRadius: 6, border: `1.5px solid ${k.line}`, background: '#fff', color: k.ink, fontWeight: 800, cursor: 'pointer' };
const btnPrimary = { width: '100%', background: k.red, color: '#fff', border: 'none', padding: 14, borderRadius: 9, fontWeight: 800, fontSize: 14, cursor: 'pointer' };
