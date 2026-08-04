type Props = { business: any; products: any[] };

export default function Minimalista({ business, products }: Props) {
  const { config, tipo, nombre } = business;
  const color = config?.colorPrimario || '#111111';

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 720, margin: '0 auto', padding: '4rem 1.5rem' }}>
      <header style={{ textAlign: 'center', marginBottom: 48 }}>
        {config?.logoUrl ? (
          <img src={config.logoUrl} alt={nombre} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 12, margin: '0 auto 12px' }} />
        ) : (
          <h1 style={{ fontSize: 32, fontWeight: 500, color, margin: 0 }}>{config?.titulo || nombre}</h1>
        )}
        {config?.descripcion && <p style={{ color: '#666', marginTop: 8 }}>{config.descripcion}</p>}
        {config?.whatsapp && (
          <a
            href={`https://wa.me/${config.whatsapp}`}
            style={{ display: 'inline-block', marginTop: 16, color, textDecoration: 'underline', fontSize: 14 }}
          >
            Escríbenos por WhatsApp
          </a>
        )}
      </header>

      {tipo !== 'landing' && (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
          {products.length === 0 && <p style={{ color: '#999' }}>Aún no hay productos publicados.</p>}
          {products.map((p) => (
            <div key={p.id} style={{ border: '1px solid #eee', borderRadius: 12, overflow: 'hidden' }}>
              {p.imagen_url && <img src={p.imagen_url} alt={p.nombre} style={{ width: '100%', height: 160, objectFit: 'cover' }} />}
              <div style={{ padding: 16 }}>
                <p style={{ fontWeight: 500, margin: 0 }}>{p.nombre}</p>
                {p.descripcion && <p style={{ color: '#777', fontSize: 13, margin: '4px 0' }}>{p.descripcion}</p>}
                <p style={{ color, fontWeight: 500, marginTop: 8 }}>${Number(p.precio).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
