'use client';

import { useState } from 'react';

type Beneficio = { emoji?: string; titulo: string; texto: string };
type Plan = { nombre: string; precio: string; features: string; destacado?: boolean };
type Testimonio = { texto: string; autor: string };

const BENEFICIOS_DEFAULT: Beneficio[] = [
  { emoji: '⚡', titulo: 'Rápido', texto: 'Respuesta ágil y atención inmediata.' },
  { emoji: '📱', titulo: 'Cómodo', texto: 'Pide o consulta desde cualquier dispositivo.' },
  { emoji: '🔒', titulo: 'Confiable', texto: 'Un servicio en el que puedes confiar.' }
];

const PLANES_DEFAULT: Plan[] = [
  { nombre: 'Básico', precio: '$—', features: 'Servicio 1\nServicio 2\nServicio 3' },
  { nombre: 'Popular', precio: '$—', features: 'Todo lo anterior\nServicio 4\nServicio 5', destacado: true },
  { nombre: 'Premium', precio: '$—', features: 'Todo incluido\nAtención prioritaria' }
];

const TESTIMONIOS_DEFAULT: Testimonio[] = [
  { texto: 'Excelente servicio, muy recomendado.', autor: 'Cliente satisfecho' },
  { texto: 'Atención de calidad y buen trato.', autor: 'Cliente satisfecho' }
];

function waLink(numero: string | undefined, mensaje: string) {
  if (!numero) return '#';
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

export default function LandingNegocio({ business }: { business: any; products?: any[] }) {
  const config = business?.config || {};
  const nombre: string = config.titulo || business?.nombre || 'Mi Negocio';
  const descripcion: string = config.descripcion || 'Presentamos nuestros productos y servicios de forma clara y directa.';
  const accent: string = config.colorPrimario || '#2563eb';
  const whatsapp: string | undefined = config.whatsapp;
  const instagram: string | undefined = config.instagram;
  const logoUrl: string | undefined = config.logoUrl;
  const menuItems = (config.menuItems?.length ? config.menuItems : [{ label: 'Beneficios', href: '#beneficios', visible: true }, { label: 'Nosotros', href: '#nosotros', visible: true }, { label: 'Planes', href: '#planes', visible: true }, { label: 'Contacto', href: '#contacto', visible: true }]).filter((item: any) => item.visible !== false);

  const beneficios: Beneficio[] = config.beneficios?.length ? config.beneficios : BENEFICIOS_DEFAULT;
  const planes: Plan[] = config.planes?.length ? config.planes : PLANES_DEFAULT;
  const testimonios: Testimonio[] = config.testimonios?.length ? config.testimonios : TESTIMONIOS_DEFAULT;

  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', mensaje: '' });
  const [enviado, setEnviado] = useState(false);

  const enviarFormulario = () => {
    const mensaje = `Hola, soy ${form.nombre || '(sin nombre)'}.\n${form.mensaje || ''}\nMi correo: ${form.email || '-'}\nMi teléfono: ${form.telefono || '-'}`;
    if (whatsapp) {
      window.open(waLink(whatsapp, mensaje), '_blank');
    }
    setEnviado(true);
  };

  const styles = {
    principal: accent,
    fondo: '#f5f7fb',
    texto: '#333',
    gris: '#666'
  };

  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif', color: styles.texto, background: styles.fondo, lineHeight: 1.6 }}>
      {/* HEADER */}
      <header style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,.08)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ width: '90%', maxWidth: 1200, margin: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 70, flexWrap: 'wrap' }}>
          {logoUrl ? (
            <img src={logoUrl} alt={nombre} style={{ height: 40, objectFit: 'contain' }} />
          ) : (
            <div style={{ fontSize: 22, fontWeight: 'bold' }}>{nombre}</div>
          )}
          <nav style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            {menuItems.map((item: any, index: number) => (
              <a key={`${item.href}-${index}`} href={item.href} style={{ textDecoration: 'none', color: '#333' }}>{item.label}</a>
            ))}
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section style={{ background: `linear-gradient(135deg, ${styles.principal}, ${styles.principal}cc)`, color: 'white', padding: '80px 0' }}>
        <div style={{ width: '90%', maxWidth: 1200, margin: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 44, marginBottom: 15 }}>{nombre}</h1>
            <p style={{ color: 'white', margin: '20px 0' }}>{descripcion}</p>
            <a
              href={waLink(whatsapp, `Hola, quiero más información sobre ${nombre}`)}
              target="_blank"
              style={{ display: 'inline-block', background: 'white', color: styles.principal, textDecoration: 'none', padding: '15px 35px', borderRadius: 50, fontWeight: 700 }}
            >
              Solicitar información
            </a>
          </div>
          <div>
            <img src="https://placehold.co/600x450" alt={nombre} style={{ width: '100%', borderRadius: 15 }} />
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section id="beneficios" style={{ padding: '80px 0' }}>
        <div style={{ width: '90%', maxWidth: 1200, margin: 'auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 40 }}>¿Por qué elegirnos?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 25 }}>
            {beneficios.map((b, i) => (
              <div key={i} style={{ background: 'white', padding: 30, borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,.08)' }}>
                <h3 style={{ color: styles.principal, marginBottom: 15 }}>{b.emoji} {b.titulo}</h3>
                <p style={{ color: styles.gris }}>{b.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NOSOTROS */}
      <section id="nosotros" style={{ background: 'white', padding: '80px 0' }}>
        <div style={{ width: '90%', maxWidth: 1200, margin: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
          <img src="https://placehold.co/500x350" alt="Nosotros" style={{ width: '100%', borderRadius: 12 }} />
          <div>
            <h2 style={{ marginBottom: 15 }}>Sobre Nosotros</h2>
            <p style={{ color: styles.gris }}>{descripcion}</p>
          </div>
        </div>
      </section>

      {/* PLANES */}
      <section id="planes" style={{ padding: '80px 0' }}>
        <div style={{ width: '90%', maxWidth: 1200, margin: 'auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 40 }}>Nuestros Planes</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 25 }}>
            {planes.map((p, i) => (
              <div
                key={i}
                style={{
                  background: p.destacado ? styles.principal : 'white',
                  color: p.destacado ? 'white' : styles.texto,
                  borderRadius: 12,
                  padding: 40,
                  textAlign: 'center',
                  boxShadow: '0 10px 30px rgba(0,0,0,.08)',
                  transform: p.destacado ? 'scale(1.05)' : 'none'
                }}
              >
                <h3>{p.nombre}</h3>
                <div style={{ fontSize: 36, margin: '20px 0' }}>{p.precio}</div>
                <ul style={{ listStyle: 'none', margin: '20px 0', padding: 0 }}>
                  {p.features.split('\n').filter(Boolean).map((f, j) => (
                    <li key={j} style={{ margin: '10px 0', color: p.destacado ? 'white' : styles.gris }}>✔ {f}</li>
                  ))}
                </ul>
                <a
                  href={waLink(whatsapp, `Hola, me interesa el plan ${p.nombre} de ${nombre}`)}
                  target="_blank"
                  style={{
                    display: 'inline-block', textDecoration: 'none', padding: '13px 30px', borderRadius: 50, fontWeight: 700,
                    background: p.destacado ? 'white' : styles.principal, color: p.destacado ? styles.principal : 'white'
                  }}
                >
                  Elegir
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section style={{ background: 'white', padding: '80px 0' }}>
        <div style={{ width: '90%', maxWidth: 1200, margin: 'auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 40 }}>Lo que dicen nuestros clientes</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 25 }}>
            {testimonios.map((t, i) => (
              <div key={i} style={{ background: styles.fondo, padding: 30, borderRadius: 12 }}>
                <p style={{ color: styles.gris }}>"{t.texto}"</p>
                <br />
                <strong>{t.autor}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" style={{ background: 'white', padding: '80px 0' }}>
        <div style={{ width: '90%', maxWidth: 700, margin: 'auto' }}>
          <h2 style={{ textAlign: 'center' }}>Contáctanos</h2>
          <p style={{ textAlign: 'center', marginBottom: 40, color: styles.gris }}>Déjanos tus datos y nos comunicaremos contigo.</p>

          {enviado ? (
            <p style={{ textAlign: 'center', color: styles.principal, fontWeight: 700 }}>¡Gracias! Te contactaremos pronto.</p>
          ) : (
            <div>
              <input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} style={inputStyle} />
              <input placeholder="Correo electrónico" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
              <input placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} style={inputStyle} />
              <textarea placeholder="Escribe tu mensaje" value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} style={{ ...inputStyle, minHeight: 150, resize: 'vertical' }} />
              <button
                onClick={enviarFormulario}
                style={{ width: '100%', padding: 15, border: 'none', background: styles.principal, color: 'white', fontSize: 16, borderRadius: 8, cursor: 'pointer' }}
              >
                Enviar Mensaje
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#111827', color: 'white', textAlign: 'center', padding: '40px 0' }}>
        <h3>{nombre}</h3>
        {instagram && (
          <p style={{ color: '#ddd', marginTop: 8 }}>
            <a href={`https://instagram.com/${instagram.replace('@', '')}`} target="_blank" style={{ color: '#ddd' }}>@{instagram.replace('@', '')}</a>
          </p>
        )}
        <p style={{ color: '#ddd', marginTop: 8 }}>© {new Date().getFullYear()} {nombre}. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 15,
  marginBottom: 15,
  border: '1px solid #ddd',
  borderRadius: 8,
  fontSize: 16,
  boxSizing: 'border-box'
};
