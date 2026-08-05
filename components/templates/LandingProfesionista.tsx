'use client';

import { useState } from 'react';

type Especialidad = { titulo: string; texto: string };
type Testimonio = { texto: string; autor: string };
type Horario = { dia: string; horario: string };

const ESPECIALIDADES_DEFAULT: Especialidad[] = [
  { titulo: 'Consulta General', texto: 'Evaluación y diagnóstico profesional.' },
  { titulo: 'Tratamientos', texto: 'Opciones adaptadas a cada paciente.' },
  { titulo: 'Seguimiento', texto: 'Control y acompañamiento continuo.' }
];

const BENEFICIOS_DEFAULT: string[] = [
  'Atención personalizada',
  'Tecnología moderna',
  'Años de experiencia',
  'Consultorio certificado'
];

const TESTIMONIOS_DEFAULT: Testimonio[] = [
  { texto: 'Excelente atención y explicación durante toda la consulta.', autor: 'Paciente' },
  { texto: 'El trato fue muy profesional y resolvió todas mis dudas.', autor: 'Paciente' }
];

const HORARIOS_DEFAULT: Horario[] = [
  { dia: 'Lunes - Viernes', horario: '9:00 - 18:00' },
  { dia: 'Sábado', horario: '9:00 - 14:00' },
  { dia: 'Domingo', horario: 'Cerrado' }
];

function waLink(numero: string | undefined, mensaje: string) {
  if (!numero) return '#';
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

export default function LandingProfesionista({ business }: { business: any; products?: any[] }) {
  const config = business?.config || {};
  const nombre: string = config.titulo || business?.nombre || 'Consultorio';
  const descripcion: string = config.descripcion || 'Atención profesional y personalizada, comprometidos con la calidad en cada consulta.';
  const primary: string = config.colorPrimario || '#0d5c63';
  const secondary = `${primary}14`;
  const whatsapp: string | undefined = config.whatsapp;
  const telefono: string | undefined = config.telefono;
  const horarioTexto: string = config.horarioTexto || 'Lunes a Viernes | 9:00 - 18:00';
  const logoUrl: string | undefined = config.logoUrl;

  const especialidades: Especialidad[] = config.especialidades?.length ? config.especialidades : ESPECIALIDADES_DEFAULT;
  const beneficios: string[] = config.beneficios?.length ? config.beneficios : BENEFICIOS_DEFAULT;
  const testimonios: Testimonio[] = config.testimonios?.length ? config.testimonios : TESTIMONIOS_DEFAULT;
  const horarios: Horario[] = config.horarios?.length ? config.horarios : HORARIOS_DEFAULT;

  const [form, setForm] = useState({ nombre: '', correo: '', telefono: '', caso: '' });
  const [enviado, setEnviado] = useState(false);

  const enviarFormulario = () => {
    const mensaje = `Hola, quiero agendar una consulta.\nNombre: ${form.nombre || '-'}\nCorreo: ${form.correo || '-'}\nTeléfono: ${form.telefono || '-'}\nCaso: ${form.caso || '-'}`;
    if (whatsapp) window.open(waLink(whatsapp, mensaje), '_blank');
    setEnviado(true);
  };

  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif', color: '#263238', background: '#fafafa' }}>
      {/* TOPBAR */}
      {(telefono || horarioTexto) && (
        <div style={{ background: primary, color: 'white', padding: 10, fontSize: 14 }}>
          <div style={{ width: '90%', maxWidth: 1150, margin: 'auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
            <div>{telefono ? `📞 ${telefono}` : ''}</div>
            <div>{horarioTexto}</div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ background: 'white', boxShadow: '0 3px 10px rgba(0,0,0,.06)' }}>
        <div style={{ width: '90%', maxWidth: 1150, margin: 'auto', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {logoUrl ? (
            <img src={logoUrl} alt={nombre} style={{ height: 44, objectFit: 'contain' }} />
          ) : (
            <div style={{ fontSize: 26, fontWeight: 'bold', color: primary }}>{nombre}</div>
          )}
          <nav style={{ display: 'flex', gap: 25 }}>
            <a href="#especialidades" style={{ textDecoration: 'none', color: '#333' }}>Especialidades</a>
            <a href="#nosotros" style={{ textDecoration: 'none', color: '#333' }}>Nosotros</a>
            <a href="#horarios" style={{ textDecoration: 'none', color: '#333' }}>Horarios</a>
            <a href="#contacto" style={{ textDecoration: 'none', color: '#333' }}>Contacto</a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section style={{ background: secondary, padding: '80px 0' }}>
        <div style={{ width: '90%', maxWidth: 1150, margin: 'auto', display: 'grid', gridTemplateColumns: '1.2fr .8fr', gap: 50, alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 44, marginBottom: 15 }}>{nombre}</h1>
            <p style={{ color: '#6b7280', lineHeight: 1.8 }}>{descripcion}</p>
            <br />
            <a
              href={waLink(whatsapp, `Hola, quiero agendar una cita con ${nombre}`)}
              target="_blank"
              style={{ display: 'inline-block', padding: '15px 35px', background: primary, color: 'white', textDecoration: 'none', borderRadius: 50, fontWeight: 700 }}
            >
              Agendar cita
            </a>
          </div>
          <div>
            <img src="https://placehold.co/500x600" style={{ width: '100%', borderRadius: 20 }} />
          </div>
        </div>
      </section>

      {/* NOSOTROS */}
      <section id="nosotros" style={{ padding: '80px 0' }}>
        <div style={{ width: '90%', maxWidth: 1150, margin: 'auto', display: 'grid', gridTemplateColumns: '.8fr 1.2fr', gap: 50, alignItems: 'center' }}>
          <img src="https://placehold.co/500x400" style={{ width: '100%', borderRadius: 15 }} />
          <div>
            <h2 style={{ marginBottom: 15 }}>Conoce a {nombre}</h2>
            <p style={{ color: '#6b7280', lineHeight: 1.8 }}>{descripcion}</p>
          </div>
        </div>
      </section>

      {/* ESPECIALIDADES */}
      <section id="especialidades" style={{ background: '#f7f7f7', padding: '80px 0' }}>
        <div style={{ width: '90%', maxWidth: 1150, margin: 'auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 40 }}>Especialidades</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 25 }}>
            {especialidades.map((e, i) => (
              <div key={i} style={{ background: 'white', padding: 35, borderRadius: 15, borderTop: `5px solid ${primary}`, boxShadow: '0 5px 20px rgba(0,0,0,.05)' }}>
                <h3 style={{ marginBottom: 10 }}>{e.titulo}</h3>
                <p style={{ color: '#6b7280', lineHeight: 1.8 }}>{e.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section style={{ padding: '80px 0' }}>
        <div style={{ width: '90%', maxWidth: 1150, margin: 'auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 40 }}>¿Por qué elegirnos?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {beneficios.map((b, i) => (
              <div key={i} style={{ background: 'white', padding: 25, borderRadius: 15 }}>✔ {b}</div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section style={{ background: '#f7f7f7', padding: '80px 0' }}>
        <div style={{ width: '90%', maxWidth: 1150, margin: 'auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 40 }}>Opiniones de pacientes</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {testimonios.map((t, i) => (
              <div key={i} style={{ background: 'white', padding: 30, borderRadius: 15 }}>
                "{t.texto}"
                <br />
                <br />
                <b>{t.autor}</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HORARIOS */}
      <section id="horarios" style={{ padding: '80px 0' }}>
        <div style={{ width: '90%', maxWidth: 1150, margin: 'auto' }}>
          <div style={{ background: secondary, borderRadius: 20, padding: 50, textAlign: 'center' }}>
            <h2>Horarios de Atención</h2>
            <table style={{ width: '100%', marginTop: 30, borderCollapse: 'collapse' }}>
              <tbody>
                {horarios.map((h, i) => (
                  <tr key={i}>
                    <td style={{ padding: 15, borderBottom: '1px solid #ddd', textAlign: 'left' }}>{h.dia}</td>
                    <td style={{ padding: 15, borderBottom: '1px solid #ddd', textAlign: 'right' }}>{h.horario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" style={{ padding: '80px 0' }}>
        <div style={{ width: '90%', maxWidth: 1150, margin: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
          <div>
            <h2 style={{ marginBottom: 15 }}>Agenda una consulta</h2>
            <p style={{ color: '#6b7280', lineHeight: 1.8 }}>Déjanos tus datos y nos pondremos en contacto contigo lo antes posible.</p>
          </div>
          <div style={{ background: 'white', padding: 35, borderRadius: 15 }}>
            {enviado ? (
              <p style={{ color: primary, fontWeight: 700, textAlign: 'center' }}>¡Gracias! Te contactaremos pronto.</p>
            ) : (
              <>
                <input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} style={inputStyle} />
                <input placeholder="Correo" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} style={inputStyle} />
                <input placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} style={inputStyle} />
                <textarea placeholder="Cuéntanos tu caso" value={form.caso} onChange={(e) => setForm({ ...form, caso: e.target.value })} style={{ ...inputStyle, height: 150 }} />
                <button
                  onClick={enviarFormulario}
                  style={{ width: '100%', padding: 15, background: primary, color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15 }}
                >
                  Solicitar cita
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      <footer style={{ background: primary, color: 'white', padding: 40, textAlign: 'center', marginTop: 20 }}>
        © {new Date().getFullYear()} {nombre}
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
  boxSizing: 'border-box'
};
