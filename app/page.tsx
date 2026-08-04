import Link from 'next/link';

const TIPOS = [
  { nombre: 'Tienda', desc: 'Vende productos, con carrito y pedido directo por WhatsApp.', color: 'var(--color-accent)' },
  { nombre: 'Menú', desc: 'Categorías, fotos por platillo y personalizaciones como salsa o tamaño.', color: 'var(--color-green)' },
  { nombre: 'Landing', desc: 'Presenta tu negocio con una sola página clara y directa.', color: 'var(--color-ink)' }
];

const PASOS = [
  { n: '01', t: 'Elige qué crear', d: 'Tienda, menú o landing — según lo que vende tu negocio.' },
  { n: '02', t: 'Escoge tu plantilla', d: 'Un diseño ya probado, listo para llenar con lo tuyo.' },
  { n: '03', t: 'Recibe tu subdominio', d: 'tunegocio.creatusitio.mx, publicado al instante.' }
];

export default function Home() {
  return (
    <main>
      <div className="container">
        <nav className="nav-bar">
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19 }}>creatusitio<span style={{ color: 'var(--color-accent)' }}>.mx</span></span>
          <Link href="/panel" className="hide-mobile" style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink-soft)', textDecoration: 'none' }}>Entrar a mi panel</Link>
        </nav>
      </div>

      <section className="container" style={{ padding: '48px 24px 80px', display: 'flex', alignItems: 'center', gap: 48, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 420px' }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Páginas de negocio, listas hoy</div>
          <h1 style={{ fontSize: 'clamp(34px, 5vw, 56px)', lineHeight: 1.05, marginBottom: 20 }}>
            Tu negocio, con su propio<br />rincón de internet.
          </h1>
          <p style={{ fontSize: 17, color: 'var(--color-ink-soft)', lineHeight: 1.6, maxWidth: 480, marginBottom: 28 }}>
            Crea la tienda, el menú o la landing de tu negocio en minutos. Eliges un diseño, subes tus productos, y queda publicado en tu propio subdominio de creatusitio.mx.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/crear" className="btn btn-accent">Crear mi página →</Link>
            <Link href="/panel" className="btn btn-outline">Ya tengo una</Link>
          </div>
        </div>

        <div
          className="stamp hide-mobile"
          style={{ width: 260, height: 260, fontSize: 13, padding: 24, lineHeight: 1.5 }}
        >
          <div>
            tunegocio
            <br />
            <span style={{ fontSize: 20, fontWeight: 700 }}>.creatusitio.mx</span>
            <br />
            publicado hoy
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--color-bg-alt)', borderTop: '1.5px solid var(--color-border)', borderBottom: '1.5px solid var(--color-border)', padding: '64px 0' }}>
        <div className="container">
          <div className="eyebrow" style={{ marginBottom: 8 }}>Elige tu tipo de página</div>
          <h2 style={{ fontSize: 28, marginBottom: 32 }}>Tres formas de vender en línea</h2>
          <div className="grid-3">
            {TIPOS.map((t) => (
              <div key={t.nombre} className="card" style={{ padding: 24 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.color, marginBottom: 16 }} />
                <h3 style={{ fontSize: 19, marginBottom: 8 }}>{t.nombre}</h3>
                <p style={{ fontSize: 14, color: 'var(--color-ink-soft)', lineHeight: 1.5, margin: 0 }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: '72px 24px' }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Cómo funciona</div>
        <h2 style={{ fontSize: 28, marginBottom: 40 }}>De la idea a publicado, en tres pasos</h2>
        <div className="grid-3">
          {PASOS.map((p) => (
            <div key={p.n}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-accent)', marginBottom: 10 }}>{p.n}</div>
              <h3 style={{ fontSize: 18, marginBottom: 8 }}>{p.t}</h3>
              <p style={{ fontSize: 14, color: 'var(--color-ink-soft)', lineHeight: 1.5, margin: 0 }}>{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: 'var(--color-ink)', color: 'var(--color-white)', padding: '64px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <h2 style={{ fontSize: 26, marginBottom: 8, color: 'var(--color-white)' }}>¿Listo para publicar tu negocio?</h2>
            <p style={{ fontSize: 15, color: '#B8BCD1', margin: 0 }}>Sin costo de arranque, sin código, sin complicaciones.</p>
          </div>
          <Link href="/crear" className="btn btn-accent">Crear mi página →</Link>
        </div>
      </section>
    </main>
  );
}
