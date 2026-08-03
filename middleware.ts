import { NextRequest, NextResponse } from 'next/server';

const DOMINIO_RAIZ = 'creatusitio.mx';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const host = req.headers.get('host') || '';
  const hostSinPuerto = host.split(':')[0];

  // Sin subdominio (creatusitio.mx, www.creatusitio.mx, o localhost en dev) -> sigue normal
  const esRaiz =
    hostSinPuerto === DOMINIO_RAIZ ||
    hostSinPuerto === `www.${DOMINIO_RAIZ}` ||
    hostSinPuerto.includes('localhost') ||
    hostSinPuerto.endsWith('.vercel.app');

  if (esRaiz) {
    return NextResponse.next();
  }

  const subdominio = hostSinPuerto.replace(`.${DOMINIO_RAIZ}`, '');

  // Reescribe internamente a /[subdomain]/... sin cambiar la URL visible del usuario
  url.pathname = `/${subdominio}${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)']
};
