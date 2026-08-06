import Link from 'next/link';

const TIPOS = [
  {
    icon: '01',
    nombre: 'Tienda online',
    desc: 'Muestra tus productos, recibe pedidos y lleva a tus clientes directo a WhatsApp.',
    tag: 'Vende'
  },
  {
    icon: '02',
    nombre: 'Menú digital',
    desc: 'Presenta tus platillos, categorías, fotos y opciones de personalización de forma clara.',
    tag: 'Conecta'
  },
  {
    icon: '03',
    nombre: 'Landing page',
    desc: 'Una página enfocada en presentar tu negocio y convertir visitas en clientes.',
    tag: 'Convierte'
  }
];

const PASOS = [
  { n: '01', t: 'Elige qué necesitas', d: 'Tienda, menú o landing. Empieza con la opción que mejor se adapta a tu negocio.' },
  { n: '02', t: 'Personaliza tu página', d: 'Elige una plantilla y agrega tu información, productos, fotos y lo que quieras mostrar.' },
  { n: '03', t: 'Publica y comparte', d: 'Obtén tu propio subdominio y comparte tu página con clientes desde cualquier lugar.' }
];

export default function Home() {
  return (
    <main>
      <div className="announcement">
        <div className="container announcement-inner">
          <span className="announcement-dot" />
          <span>Tu negocio también merece verse increíble en internet.</span>
          <Link href="/crear">Empieza ahora →</Link>
        </div>
      </div>

      <header className="container">
        <nav className="nav-bar">
          <Link href="/" className="brand" aria-label="creatusitio.mx inicio">
            creatusitio<span>.mx</span>
          </Link>

          <div className="nav-actions">
            <Link href="/panel" className="nav-link hide-mobile">Entrar a mi panel</Link>
            <Link href="/crear" className="nav-cta">Crear mi página</Link>
          </div>
        </nav>
      </header>

      <section className="hero container">
        <div className="hero-copy">
          <div className="eyebrow">
            <span>✦</span> Tu negocio, listo para compartir
          </div>

          <h1>
            Haz que tu negocio
            <span> se vea y venda mejor.</span>
          </h1>

          <p className="hero-text">
            Crea una tienda, menú o landing page profesional en minutos.
            Sin empezar desde cero y con tu propio espacio en internet.
          </p>

          <div className="hero-actions">
            <Link href="/crear" className="btn btn-accent btn-large">
              Crear mi página <span>→</span>
            </Link>
            <Link href="/panel" className="btn btn-outline btn-large">
              Ya tengo una
            </Link>
          </div>

          <div className="hero-proof">
            <div className="proof-avatars" aria-hidden="true">
              <span>✓</span>
              <span>✓</span>
              <span>✓</span>
            </div>
            <div>
              <strong>Tu página, tu dirección</strong>
              <small>tunegocio.creatusitio.mx</small>
            </div>
          </div>
        </div>

        <div className="hero-visual" aria-label="Vista previa de una página de negocio">
          <div className="browser-card">
            <div className="browser-top">
              <div className="browser-dots"><i /><i /><i /></div>
              <div className="browser-url">tunegocio.creatusitio.mx</div>
            </div>

            <div className="mock-site">
              <div className="mock-nav">
                <div className="mock-logo">TU<span>NEGOCIO</span></div>
                <div className="mock-nav-lines"><i /><i /><i /></div>
              </div>

              <div className="mock-hero">
                <div className="mock-copy">
                  <span>HECHO PARA TU NEGOCIO</span>
                  <b>Lo que vendes,<br />bien presentado.</b>
                  <small>Productos, información y contacto en un solo lugar.</small>
                  <em>Ver productos →</em>
                </div>
                <div className="mock-product">
                  <div className="mock-product-shape" />
                  <div className="mock-product-lines"><i /><i /></div>
                </div>
              </div>

              <div className="mock-bottom">
                <div><b>12</b><span>productos</span></div>
                <div><b>24/7</b><span>visible online</span></div>
                <div><b>1 link</b><span>para compartir</span></div>
              </div>
            </div>
          </div>

          <div className="floating-card floating-card-top">
            <span className="floating-icon">✓</span>
            <div><strong>Publicado</strong><small>tu página está online</small></div>
          </div>

          <div className="floating-card floating-card-bottom">
            <span>↗</span>
            <div><strong>Comparte tu link</strong><small>en WhatsApp e Instagram</small></div>
          </div>
        </div>
      </section>

      <section className="types-section">
        <div className="container">
          <div className="section-heading centered">
            <div className="eyebrow">Una herramienta, varias posibilidades</div>
            <h2>Elige cómo quieres <span>mostrar tu negocio.</span></h2>
            <p>Empieza con lo que necesitas hoy y dale a tus clientes una mejor forma de encontrarte.</p>
          </div>

          <div className="types-grid">
            {TIPOS.map((t) => (
              <article key={t.nombre} className="type-card">
                <div className="type-top">
                  <span className="type-number">{t.icon}</span>
                  <span className="type-tag">{t.tag}</span>
                </div>
                <h3>{t.nombre}</h3>
                <p>{t.desc}</p>
                <Link href="/crear">Crear esta página <span>↗</span></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="steps-section container">
        <div className="steps-intro">
          <div className="eyebrow">Así de sencillo</div>
          <h2>De una idea a una página que puedes <span>compartir hoy.</span></h2>
          <p>No necesitas saber programar. Solo necesitas saber qué quieres mostrar.</p>
          <Link href="/crear" className="text-link">Quiero empezar <span>→</span></Link>
        </div>

        <div className="steps-list">
          {PASOS.map((p, index) => (
            <div className="step" key={p.n}>
              <div className="step-number">{p.n}</div>
              <div className="step-content">
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </div>
              {index < PASOS.length - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>
      </section>

      <section className="domain-section">
        <div className="container domain-grid">
          <div>
            <div className="eyebrow eyebrow-light">Tu propio espacio</div>
            <h2>Un link que puedes <span>poner en todas partes.</span></h2>
            <p>
              Tu página recibe su propio subdominio de creatusitio.mx para que
              puedas compartirla fácilmente con tus clientes.
            </p>
          </div>

          <div className="domain-demo">
            <span>tu</span>negocio<span>.creatusitio.mx</span>
            <div className="domain-check">✓ Disponible para tu página</div>
          </div>
        </div>
      </section>

      <section className="final-cta container">
        <div className="cta-card">
          <div className="cta-glow" />
          <div className="cta-content">
            <div className="eyebrow">Tu siguiente paso</div>
            <h2>Tu negocio ya existe.<br /><span>Ahora hazlo visible.</span></h2>
            <p>Crea tu página y empieza a compartirla con tus clientes.</p>
            <Link href="/crear" className="btn btn-white btn-large">
              Crear mi página <span>→</span>
            </Link>
          </div>
          <div className="cta-mark">.mx</div>
        </div>
      </section>

      <footer className="container footer">
        <Link href="/" className="brand">creatusitio<span>.mx</span></Link>
        <span>Tu negocio, en internet.</span>
      </footer>
    </main>
  );
}
