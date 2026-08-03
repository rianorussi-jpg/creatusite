import Link from 'next/link';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ width: 180, borderRight: '1px solid #eee', padding: '1.5rem 1rem' }}>
        <p style={{ fontWeight: 600, marginBottom: 24 }}>creatusitio</p>
        <Link href="/panel" style={navLink}>Resumen</Link>
        <Link href="/panel/productos" style={navLink}>Productos</Link>
        <Link href="/panel/diseno" style={navLink}>Diseño</Link>
        <Link href="/panel/plantilla" style={navLink}>Plantilla</Link>
      </nav>
      <main style={{ flex: 1, padding: '2rem' }}>{children}</main>
    </div>
  );
}

const navLink: React.CSSProperties = {
  display: 'block',
  padding: '8px 0',
  color: '#444',
  textDecoration: 'none',
  fontSize: 14
};
