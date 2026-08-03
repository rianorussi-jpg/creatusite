export const metadata = {
  title: 'creatusitio.mx',
  description: 'Crea tu tienda, landing o menú en minutos'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>{children}</body>
    </html>
  );
}
