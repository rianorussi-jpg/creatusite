type Props = { business: any; products: any[] };

export default function Sencillo({ business, products }: Props) {
  const { config, tipo, nombre } = business;
  const color = config?.colorPrimario || '#D97706';

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ background: color, color: '#fff', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, margin: 0 }}>{config?.titulo || nombre}</h1>
        {config?.descripcion && <p style={{ marginTop: 8, opacity: 0.9 }}>{config.descripcion}</p>}
        {config?.whatsapp && (
          <a
            href={`https://wa.me/${config.whatsapp}`}
            style={{
              display: 'inline-block',
              marginTop: 16,
              background: '#fff',
              color,
              padding: '10px 20px',
              borderRadius: 999,
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            Pedir por WhatsApp
          </a>
        )}
      </header>

      {tipo !== 'landing' && (
        <section style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' }}>
          {products.length === 0 && <p style={{ color: '#999' }}>Aún no hay productos publicados.</p>}
          {products.map((p) => (
            <div
              key={p.id}
              style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: '1px solid #eee', alignItems: 'center' }}
            >
              {p.imagen_url && (
                <img src={p.imagen_url} alt={p.nombre} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 12 }} />
              )}
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, margin: 0 }}>{p.nombre}</p>
                {p.descripcion && <p style={{ color: '#777', fontSize: 13, margin: '4px 0' }}>{p.descripcion}</p>}
              </div>
              <p style={{ color, fontWeight: 700 }}>${Number(p.precio).toFixed(2)}</p>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
