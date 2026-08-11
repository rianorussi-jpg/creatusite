'use client';

import { useEffect, useRef, useState } from 'react';

const k = {
  red: '#C81620', redDark: '#8F0F17', yellow: '#FFC933', cream: '#FFF7EA',
  ink: '#1B1410', gray: '#7A6B60', line: '#EBDFCF', wa: '#25D366'
};

type Valor = { nombre: string; precioExtra: number };
type Opcion = { nombre: string; tipo: 'unica' | 'multiple'; valores: Valor[] };
type CartLine = { lineId: string; productId: string; nombre: string; cantidad: number; precioUnitario: number; detalle: string };

function agruparPorCategoria(products: any[]) {
  const grupos: Record<string, any[]> = {};
  for (const p of products) {
    const cat = p.categoria || 'General';
    if (!grupos[cat]) grupos[cat] = [];
    grupos[cat].push(p);
  }
  return grupos;
}

function PanelOpciones({ producto, onConfirmar, onCancelar }: { producto: any; onConfirmar: (precio: number, detalle: string) => void; onCancelar: () => void }) {
  const opciones: Opcion[] = producto.opciones || [];
  const [seleccion, setSeleccion] = useState<Record<string, string[]>>({});

  const elegirUnica = (opNombre: string, valor: string) => setSeleccion({ ...seleccion, [opNombre]: [valor] });
  const toggleMultiple = (opNombre: string, valor: string) => {
    const actuales = seleccion[opNombre] || [];
    const nuevos = actuales.includes(valor) ? actuales.filter((v) => v !== valor) : [...actuales, valor];
    setSeleccion({ ...seleccion, [opNombre]: nuevos });
  };

  const faltan = opciones.filter((op) => op.tipo === 'unica' && !(seleccion[op.nombre]?.length));
  const extra = opciones.reduce((s, op) => {
    const elegidos = seleccion[op.nombre] || [];
    return s + elegidos.reduce((s2, v) => s2 + (op.valores.find((x) => x.nombre === v)?.precioExtra || 0), 0);
  }, 0);
  const precioFinal = Number(producto.precio) + extra;
  const detalle = opciones
    .map((op) => (seleccion[op.nombre]?.length ? `${op.nombre}: ${seleccion[op.nombre].join(', ')}` : null))
    .filter(Boolean)
    .join(' · ');

  return (
    <div style={{ background: '#fff', border: `1.5px solid ${k.red}`, borderRadius: 12, padding: 14, marginTop: 8, marginBottom: 8 }}>
      {opciones.map((op) => (
        <div key={op.nombre} style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: k.gray, textTransform: 'uppercase', marginBottom: 6 }}>
            {op.nombre} {op.tipo === 'unica' && <span style={{ color: k.red }}>· elige 1</span>}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {op.valores.map((v) => {
              const activo = (seleccion[op.nombre] || []).includes(v.nombre);
              return (
                <button
                  key={v.nombre}
                  onClick={() => (op.tipo === 'unica' ? elegirUnica(op.nombre, v.nombre) : toggleMultiple(op.nombre, v.nombre))}
                  style={{
                    border: `1.5px solid ${activo ? k.red : k.line}`, background: activo ? '#FDECEA' : k.cream,
                    borderRadius: 7, padding: '7px 12px', fontSize: 12.5, fontWeight: 700, color: activo ? k.red : k.ink, cursor: 'pointer'
                  }}
                >
                  {v.nombre}{v.precioExtra ? ` +$${v.precioExtra}` : ''}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <span style={{ fontWeight: 800, color: k.red }}>${precioFinal.toFixed(0)}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancelar} style={{ background: 'none', border: 'none', color: k.gray, fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>Cancelar</button>
          <button
            onClick={() => faltan.length === 0 && onConfirmar(precioFinal, detalle)}
            disabled={faltan.length > 0}
            style={{ background: k.red, color: '#fff', border: 'none', borderRadius: 7, padding: '9px 16px', fontWeight: 800, fontSize: 12.5, cursor: 'pointer', opacity: faltan.length > 0 ? 0.5 : 1 }}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TiendaDirecto({ business, products }: { business: any; products: any[] }) {
  const { config, nombre } = business;
  const grupos = agruparPorCategoria(products);
  const categorias = Object.keys(grupos);

  const [carrito, setCarrito] = useState<CartLine[]>([]);
  const [abiertoId, setAbiertoId] = useState<string | null>(null);
  const [activeCat, setActiveCat] = useState(categorias[0]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [step, setStep] = useState('cart');
  const [deliveryType, setDeliveryType] = useState<string | null>(null);
  const [direccion, setDireccion] = useState('');
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const cat = (e.target as HTMLElement).dataset.cat;
          if (e.isIntersecting && cat) setActiveCat(cat);
        });
      },
      { rootMargin: '-120px 0px -70% 0px' }
    );
    Object.values(refs.current).forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [products]);

  const agregarSimple = (p: any) => {
    setCarrito((prev) => {
      const ex = prev.find((l) => l.productId === p.id && !l.detalle);
      if (ex) return prev.map((l) => (l === ex ? { ...l, cantidad: l.cantidad + 1 } : l));
      return [...prev, { lineId: p.id, productId: p.id, nombre: p.nombre, cantidad: 1, precioUnitario: Number(p.precio), detalle: '' }];
    });
  };
  const agregarConOpciones = (p: any, precio: number, detalle: string) => {
    setCarrito((prev) => [...prev, { lineId: `${p.id}-${Date.now()}`, productId: p.id, nombre: p.nombre, cantidad: 1, precioUnitario: precio, detalle }]);
    setAbiertoId(null);
  };
  const cambiarQty = (lineId: string, delta: number) => {
    setCarrito((prev) => {
      const linea = prev.find((l) => l.lineId === lineId);
      if (!linea) return prev;
      const nueva = linea.cantidad + delta;
      if (nueva <= 0) return prev.filter((l) => l.lineId !== lineId);
      return prev.map((l) => (l.lineId === lineId ? { ...l, cantidad: nueva } : l));
    });
  };
  const qtySimple = (productId: string) => carrito.find((l) => l.productId === productId && !l.detalle)?.cantidad || 0;

  const total = carrito.reduce((s, l) => s + l.precioUnitario * l.cantidad, 0);
  const count = carrito.reduce((s, l) => s + l.cantidad, 0);

  const enviarWhatsapp = () => {
    const numero = config?.whatsapp || '';
    let msg = `Hola! Quiero pedir en ${nombre}:%0A`;
    carrito.forEach((l) => (msg += `- ${l.cantidad}x ${l.nombre}${l.detalle ? ` (${l.detalle})` : ''} ($${l.precioUnitario} c/u)%0A`));
    msg += `Total: $${total.toFixed(0)}%0A%0A`;
    msg += deliveryType === 'domicilio' ? `Entrega a domicilio: ${encodeURIComponent(direccion)}` : 'Recojo en tienda';
    window.open(`https://wa.me/${numero}?text=${msg}`, '_blank');
  };

  return (
    <div style={{ background: k.cream, minHeight: '100vh', color: k.ink, fontFamily: 'system-ui,sans-serif', paddingBottom: 90 }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 60 }}>
        <div style={{ background: k.red, color: '#fff', padding: '14px 5vw', display: 'flex', alignItems: 'center', gap: 12 }}>
          {config?.logoUrl && <img src={config.logoUrl} alt={nombre} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '2px solid #fff' }} />}
          <div>
            {!config?.logoUrl && <div style={{ fontWeight: 800, fontSize: 20 }}>{config?.titulo || nombre}</div>}
            {config?.descripcion && <div style={{ fontSize: 11, color: k.yellow, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{config.descripcion}</div>}
          </div>
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
          <div key={cat} ref={(el) => { refs.current[cat] = el; }} data-cat={cat}>
            <div style={{ fontWeight: 800, fontSize: 15, color: k.redDark, margin: '26px 0 12px', textTransform: 'uppercase' }}>{cat}</div>
            {grupos[cat].map((p) => {
              const tieneOpciones = p.opciones?.length > 0;
              return (
                <div key={p.id}>
                  <div style={{ borderBottom: abiertoId === p.id ? 'none' : `1px solid ${k.line}`, padding: '16px 0', display: 'flex', gap: 12 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 10, background: k.yellow, flexShrink: 0, overflow: 'hidden' }}>
                      {p.imagen_url && <img src={p.imagen_url} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 15.5 }}>{p.nombre}</div>
                      {p.descripcion && <div style={{ fontSize: 13, color: k.gray, lineHeight: 1.5 }}>{p.descripcion}</div>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                      <div style={{ background: k.yellow, color: k.redDark, fontWeight: 800, fontSize: 14, padding: '5px 10px', borderRadius: 4 }}>${Number(p.precio).toFixed(0)}</div>
                      {tieneOpciones ? (
                        <button onClick={() => setAbiertoId(abiertoId === p.id ? null : p.id)} style={{ background: k.ink, color: '#fff', border: 'none', fontWeight: 800, fontSize: 12, padding: '7px 12px', borderRadius: 6, cursor: 'pointer' }}>
                          {abiertoId === p.id ? 'Cerrar' : 'Elegir'}
                        </button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button onClick={() => cambiarQty(p.id, -1)} style={btnQty}>−</button>
                          <span style={{ minWidth: 14, textAlign: 'center', fontWeight: 800 }}>{qtySimple(p.id)}</span>
                          <button onClick={() => agregarSimple(p)} style={btnQty}>+</button>
                        </div>
                      )}
                    </div>
                  </div>
                  {tieneOpciones && abiertoId === p.id && (
                    <PanelOpciones producto={p} onCancelar={() => setAbiertoId(null)} onConfirmar={(precio, detalle) => agregarConOpciones(p, precio, detalle)} />
                  )}
                </div>
              );
            })}
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
                  {carrito.map((l) => (
                    <div key={l.lineId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid ${k.line}` }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 14 }}>{l.nombre}</div>
                        {l.detalle && <div style={{ fontSize: 12, color: k.gray, marginTop: 2 }}>{l.detalle}</div>}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                          <button onClick={() => cambiarQty(l.lineId, -1)} style={btnQty}>−</button>
                          <span style={{ fontWeight: 800, fontSize: 13 }}>{l.cantidad}</span>
                          <button onClick={() => cambiarQty(l.lineId, 1)} style={btnQty}>+</button>
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 13 }}>${(l.cantidad * l.precioUnitario).toFixed(0)}</div>
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

const btnQty: React.CSSProperties = { width: 24, height: 24, borderRadius: 6, border: `1.5px solid ${k.line}`, background: '#fff', color: k.ink, fontWeight: 800, cursor: 'pointer' };
const btnPrimary: React.CSSProperties = { width: '100%', background: k.red, color: '#fff', border: 'none', padding: 14, borderRadius: 9, fontWeight: 800, fontSize: 14, cursor: 'pointer' };
