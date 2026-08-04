'use client';

import { useState } from 'react';

const c = {
  bg: '#f3f4f1', card: '#ffffff', border: '#d9ddd6',
  accent: '#2f6b46', accentS: '#3c8058', text: '#1c1f1c', muted: '#707870', pill: '#eef1ec'
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

function Pasos({ paso }: { paso: number }) {
  const steps = ['Menú', 'Entrega', 'Confirmar'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '8px 0 28px' }}>
      {steps.map((label, i) => {
        const n = i + 1, active = paso === n, done = paso > n;
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, background: active ? c.accent : done ? c.accentS : c.pill, color: active || done ? '#fff' : c.muted }}>
                {done ? '✓' : n}
              </div>
              <span style={{ fontSize: 11, color: active ? c.text : c.muted, fontWeight: active ? 600 : 400 }}>{label}</span>
            </div>
            {i < steps.length - 1 && <div style={{ width: 48, height: 2, background: paso > n ? c.accentS : c.border, margin: '0 8px', marginBottom: 18 }} />}
          </div>
        );
      })}
    </div>
  );
}

// Panel inline para elegir personalizaciones de un producto antes de agregarlo
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
    <div style={{ background: c.card, border: `1.5px solid ${c.accent}`, borderRadius: 14, padding: 14, marginTop: 8 }}>
      {opciones.map((op) => (
        <div key={op.nombre} style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: c.muted, textTransform: 'uppercase', marginBottom: 6 }}>
            {op.nombre} {op.tipo === 'unica' && <span style={{ color: c.accent }}>· elige 1</span>}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {op.valores.map((v) => {
              const activo = (seleccion[op.nombre] || []).includes(v.nombre);
              return (
                <button
                  key={v.nombre}
                  onClick={() => (op.tipo === 'unica' ? elegirUnica(op.nombre, v.nombre) : toggleMultiple(op.nombre, v.nombre))}
                  style={{
                    border: `1.5px solid ${activo ? c.accent : c.border}`, background: activo ? c.accent + '22' : '#fff',
                    borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 600, color: activo ? c.accent : c.text, cursor: 'pointer'
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
        <span style={{ fontWeight: 800, color: c.accent }}>${precioFinal.toFixed(0)}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancelar} style={{ ...btnGhost, marginTop: 0 }}>Cancelar</button>
          <button
            onClick={() => faltan.length === 0 && onConfirmar(precioFinal, detalle)}
            disabled={faltan.length > 0}
            style={{ ...btnPrimario, width: 'auto', padding: '10px 18px', opacity: faltan.length > 0 ? 0.5 : 1 }}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TiendaModerno({ business, products }: { business: any; products: any[] }) {
  const { config, nombre } = business;
  const [paso, setPaso] = useState(1);
  const [carrito, setCarrito] = useState<CartLine[]>([]);
  const [abiertoId, setAbiertoId] = useState<string | null>(null);
  const [tipoEntrega, setTipoEntrega] = useState('domicilio');
  const [direccion, setDireccion] = useState('');
  const [datos, setDatos] = useState({ nombre: '', telefono: '' });

  const grupos = agruparPorCategoria(products);
  const total = carrito.reduce((s, l) => s + l.precioUnitario * l.cantidad, 0);
  const count = carrito.reduce((s, l) => s + l.cantidad, 0);

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

  const enviarWhatsapp = () => {
    const numero = config?.whatsapp || '';
    let msg = `Hola! Quiero pedir en ${nombre}:%0A`;
    carrito.forEach((l) => (msg += `- ${l.cantidad}x ${l.nombre}${l.detalle ? ` (${l.detalle})` : ''} ($${l.precioUnitario} c/u)%0A`));
    msg += `Total: $${total.toFixed(0)}%0A%0A`;
    msg += tipoEntrega === 'domicilio' ? `Entrega a domicilio: ${encodeURIComponent(direccion)}` : 'Recojo en tienda';
    msg += `%0ANombre: ${encodeURIComponent(datos.nombre)} · Tel: ${encodeURIComponent(datos.telefono)}`;
    window.open(`https://wa.me/${numero}?text=${msg}`, '_blank');
    setPaso(4);
  };

  return (
    <div style={{ background: c.bg, minHeight: '100vh', color: c.text, fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ background: c.accent, color: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        {config?.logoUrl && <img src={config.logoUrl} alt={nombre} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />}
        <div>
          {!config?.logoUrl && <div style={{ fontWeight: 800, fontSize: 18 }}>{config?.titulo || nombre}</div>}
          {config?.descripcion && <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>{config.descripcion}</div>}
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px 100px' }}>
        {paso < 4 && <Pasos paso={paso} />}

        {paso === 1 && (
          <div>
            <h2 style={{ fontSize: 22, textAlign: 'center', margin: '0 0 20px' }}>¿Qué se te antoja hoy?</h2>
            {Object.entries(grupos).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: 28 }}>
                <div style={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: c.muted, marginBottom: 12, textAlign: 'center' }}>{cat}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {items.map((p) => {
                    const tieneOpciones = p.opciones?.length > 0;
                    return (
                      <div key={p.id}>
                        <div style={{ background: c.card, border: `1.5px solid ${c.border}`, borderRadius: 18, padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{ width: 56, height: 56, borderRadius: 12, background: c.pill, flexShrink: 0, overflow: 'hidden' }}>
                            {p.imagen_url && <img src={p.imagen_url} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 15 }}>{p.nombre}</div>
                            {p.descripcion && <div style={{ fontSize: 12, color: c.muted, marginTop: 2 }}>{p.descripcion}</div>}
                            <div style={{ fontWeight: 800, color: c.accent, marginTop: 4 }}>${Number(p.precio).toFixed(0)}</div>
                          </div>
                          {tieneOpciones ? (
                            <button onClick={() => setAbiertoId(abiertoId === p.id ? null : p.id)} style={{ ...btnQtyText }}>
                              {abiertoId === p.id ? 'Cerrar' : 'Elegir'}
                            </button>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <button onClick={() => cambiarQty(p.id, -1)} style={btnQty}>−</button>
                              <span style={{ minWidth: 16, textAlign: 'center', fontWeight: 700 }}>{qtySimple(p.id)}</span>
                              <button onClick={() => agregarSimple(p)} style={btnQty}>+</button>
                            </div>
                          )}
                        </div>
                        {tieneOpciones && abiertoId === p.id && (
                          <PanelOpciones producto={p} onCancelar={() => setAbiertoId(null)} onConfirmar={(precio, detalle) => agregarConOpciones(p, precio, detalle)} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {count > 0 && (
              <div onClick={() => setPaso(2)} style={{ position: 'sticky', bottom: 16, background: c.accent, borderRadius: 16, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ color: '#fff', fontWeight: 700 }}>{count} en tu pedido</span>
                <span style={{ color: '#fff', fontWeight: 800 }}>${total.toFixed(0)} →</span>
              </div>
            )}
          </div>
        )}

        {paso === 2 && (
          <div>
            <h2 style={{ fontSize: 22, textAlign: 'center', margin: '0 0 24px' }}>¿Cómo lo recibes?</h2>
            {carrito.map((l) => (
              <div key={l.lineId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${c.border}` }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{l.cantidad}× {l.nombre}</div>
                  {l.detalle && <div style={{ fontSize: 12, color: c.muted }}>{l.detalle}</div>}
                </div>
                <span style={{ fontWeight: 700 }}>${(l.precioUnitario * l.cantidad).toFixed(0)}</span>
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '20px 0' }}>
              {[['domicilio', 'A domicilio'], ['recoger', 'Recoger en tienda']].map(([v, lbl]) => (
                <div key={v} onClick={() => setTipoEntrega(v)} style={{ background: tipoEntrega === v ? c.accent + '22' : c.card, border: `1.5px solid ${tipoEntrega === v ? c.accent : c.border}`, borderRadius: 16, padding: 18, textAlign: 'center', cursor: 'pointer', fontWeight: 600 }}>{lbl}</div>
              ))}
            </div>
            {tipoEntrega === 'domicilio' && (
              <textarea value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Dirección completa" style={{ ...inputStyle, height: 70, marginBottom: 20 }} />
            )}
            <button onClick={() => setPaso(3)} disabled={tipoEntrega === 'domicilio' && !direccion.trim()} style={btnPrimario}>Continuar →</button>
            <button onClick={() => setPaso(1)} style={btnGhost}>← Volver al menú</button>
          </div>
        )}

        {paso === 3 && (
          <div>
            <h2 style={{ fontSize: 22, textAlign: 'center', margin: '0 0 24px' }}>Tus datos</h2>
            <input placeholder="Nombre" value={datos.nombre} onChange={(e) => setDatos({ ...datos, nombre: e.target.value })} style={{ ...inputStyle, marginBottom: 12 }} />
            <input placeholder="Teléfono" value={datos.telefono} onChange={(e) => setDatos({ ...datos, telefono: e.target.value })} style={{ ...inputStyle, marginBottom: 20 }} />
            <button onClick={enviarWhatsapp} disabled={!datos.nombre || !datos.telefono} style={btnPrimario}>Confirmar pedido</button>
            <button onClick={() => setPaso(2)} style={btnGhost}>← Volver</button>
          </div>
        )}

        {paso === 4 && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 22 }}>¡Pedido enviado!</h2>
            <p style={{ color: c.muted }}>Te contactamos en breve para confirmar tu pedido.</p>
            <button onClick={() => { setCarrito([]); setPaso(1); }} style={btnPrimario}>Hacer otro pedido</button>
          </div>
        )}
      </div>
    </div>
  );
}

const btnQty: React.CSSProperties = { width: 26, height: 26, borderRadius: 8, border: 'none', background: c.pill, cursor: 'pointer', fontWeight: 700 };
const btnQtyText: React.CSSProperties = { border: 'none', borderRadius: 8, background: c.pill, cursor: 'pointer', fontWeight: 700, fontSize: 12, padding: '8px 12px' };
const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', border: `1.5px solid ${c.border}`, borderRadius: 14, padding: '13px 16px', fontSize: 15 };
const btnPrimario: React.CSSProperties = { width: '100%', border: 'none', borderRadius: 14, background: c.accent, color: '#fff', fontWeight: 700, fontSize: 15, padding: '14px 0', cursor: 'pointer' };
const btnGhost: React.CSSProperties = { display: 'block', margin: '10px auto 0', background: 'none', border: 'none', color: c.muted, cursor: 'pointer' };
