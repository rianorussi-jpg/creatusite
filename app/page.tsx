import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: 32, fontWeight: 600 }}>creatusitio.mx</h1>
      <p style={{ color: '#555', fontSize: 16, lineHeight: 1.6 }}>
        Crea la página de tu negocio — tienda, landing o menú — con tu propio subdominio.
      </p>
      <Link
        href="/crear"
        style={{
          display: 'inline-block',
          marginTop: 24,
          padding: '12px 24px',
          background: '#111',
          color: '#fff',
          borderRadius: 8,
          textDecoration: 'none',
          fontWeight: 500
        }}
      >
        Crear mi página
      </Link>
    </main>
  );
}
