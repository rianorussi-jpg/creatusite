'use client';

import { useState } from 'react';

const c = {
  bg: '#f3f4f1', card: '#ffffff', border: '#d9ddd6',
  accent: '#2f6b46', accentS: '#3c8058', text: '#1c1f1c', muted: '#707870', pill: '#eef1ec'
};

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

export default function TiendaModerno({ business, products }: { business: any; products: any[] }) {
  const { config, nombre } = business;
  const [paso, setPaso] = useState(1);
  const [carrito, setCarrito] = useState<Record<string, number>>({});
  const [tipoEntrega, setTipoEntrega] = useState('domicilio');
  const [direccion, setDireccion] = useState('');
  const [datos, setDatos] = useState({ nombre: '', telefono: '' });

  const grupos = agruparPorCategoria(products);
  const entries = Object.entries(carrito).map(([id, qty]) => ({ producto: products.find((p) => p.id === id), qty }));
  const total = entries.reduce((s, e) => s + (e.producto ? e.producto.precio * e.qty : 0), 0);
  const count = entries.reduce((s, e) => s + e.qty, 0);

  const cambiarQty = (id: string, delta: number) => {
    setCarrito((prev) => {
      const nueva = (prev[id] || 0) + delta;
      const copia = { ...prev };
      if (nueva <= 0) delete copia[id];
      else copia[id] = nueva;
      return copia;
    });
  };

  const enviarWhatsapp = () => {
    const numero = config?.whatsapp || '';
    let msg = `Hola! Quiero pedir en ${nombre}:%0A`;
    entries.forEach((e) => (msg += `- ${e.qty}x ${e.producto.nombre} ($${e.producto.precio} c/u)%0A`));
    msg += `Total: $${total.toFixed(0)}%0A%0A`;
    msg += tipoEntrega === 'domicilio' ? `Entrega a domicilio: ${encodeURIComponent(direccion)}` : 'Recojo en tienda';
    msg += `%0ANombre: ${encodeURIComponent(datos.nombre)} · Tel: ${encodeURIComponent(datos.telefono)}`;
    window.open(`https://wa.me/${numero}?text=${msg}`, '_blank');
    setPaso(4);
  };

  return (
    <div style={{ background: c.bg, minHeight: '100vh', color: c.text, fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ background: c.accent, color: '#fff', padding: '16px 20px' }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>{config?.titulo || nombre}</div>
        {config?.descripcion && <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>{config.descripcion}</div>}
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
                  {items.map((p) => (
                    <div key={p.id} style={{ background: c.card, border: `1.5px solid ${c.border}`, borderRadius: 18, padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 56, height: 56, borderRadius: 12, background: c.pill, flexShrink: 0, overflow: 'hidden' }}>
                        {p.imagen_url && <img src={p.imagen_url} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{p.nombre}</div>
                        {p.descripcion && <div style={{ fontSize: 12, color: c.muted, marginTop: 2 }}>{p.descripcion}</div>}
                        <div style={{ fontWeight: 800, color: c.accent, marginTop: 4 }}>${Number(p.precio).toFixed(0)}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={() => cambiarQty(p.id, -1)} style={btnQty}>−</button>
                        <span style={{ minWidth: 16, textAlign: 'center', fontWeight: 700 }}>{carrito[p.id] || 0}</span>
                        <button onClick={() => cambiarQty(p.id, 1)} style={btnQty}>+</button>
                      </div>
                    </div>
                  ))}
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[['domicilio', 'A domicilio'], ['recoger', 'Recoger en tienda']].map(([v, lbl]) => (
                <div key={v} onClick={() => setTipoEntrega(v)} style={{ background: tipoEntrega === v ? c.accent + '22' : c.card, border: `1.5px solid ${tipoEntrega === v ? c.accent : c.border}`, borderRadius: 16, padding: 18, textAlign: 'center', cursor: 'pointer', fontWeight: 600 }}>{lbl}</div>
              ))}
            </div>
            {tipoEntrega === 'domicilio' && (
              <textarea value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Dirección completa" style={{ ...inputStyle, height: 70, marginBottom: 20 }} />
            )}
            <button onClick={() => setPaso(3)} disabled={tipoEntrega === 'domicilio' && !direccion.trim()} style={btnPrimary}>Continuar →</button>
            <button onClick={() => setPaso(1)} style={btnGhost}>← Volver al menú</button>
          </div>
        )}

        {paso === 3 && (
          <div>
            <h2 style={{ fontSize: 22, textAlign: 'center', margin: '0 0 24px' }}>Tus datos</h2>
            <input placeholder="Nombre" value={datos.nombre} onChange={(e) => setDatos({ ...datos, nombre: e.target.value })} style={{ ...inputStyle, marginBottom: 12 }} />
            <input placeholder="Teléfono" value={datos.telefono} onChange={(e) => setDatos({ ...datos, telefono: e.target.value })} style={{ ...inputStyle, marginBottom: 20 }} />
            <button onClick={enviarWhatsapp} disabled={!datos.nombre || !datos.telefono} style={btnPrimary}>Confirmar pedido</button>
            <button onClick={() => setPaso(2)} style={btnGhost}>← Volver</button>
          </div>
        )}

        {paso === 4 && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 22 }}>¡Pedido enviado!</h2>
            <p style={{ color: c.muted }}>Te contactamos en breve para confirmar tu pedido.</p>
            <button onClick={() => { setCarrito({}); setPaso(1); }} style={btnPrimary}>Hacer otro pedido</button>
          </div>
        )}
      </div>
    </div>
  );
}

const btnQty = { width: 26, height: 26, borderRadius: 8, border: 'none', background: c.pill, cursor: 'pointer', fontWeight: 700 };
const inputStyle = { width: '100%', boxSizing: 'border-box' as const, border: `1.5px solid ${c.border}`, borderRadius: 14, padding: '13px 16px', fontSize: 15 };
const btnPrimary = { width: '100%', border: 'none', borderRadius: 14, background: c.accent, color: '#fff', fontWeight: 700, fontSize: 15, padding: '14px 0', cursor: 'pointer' };
const btnGhost = { display: 'block', margin: '10px auto 0', background: 'none', border: 'none', color: c.muted, cursor: 'pointer' };
