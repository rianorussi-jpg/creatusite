import { NextRequest, NextResponse } from 'next/server';

const DOMINIOS_RAIZ = ['creatusitio.mx', 'enla.mx'] as const;

type DominioRaiz = (typeof DOMINIOS_RAIZ)[number];

function detectarDominio(hostname: string): { dominio: DominioRaiz; subdominio: string } | null {
  const host = hostname.toLowerCase();

  for (const dominio of DOMINIOS_RAIZ) {
    const sufijo = `.${dominio}`;

    if (host.endsWith(sufijo)) {
      const subdominio = host.slice(0, -sufijo.length);

      // www.dominio.mx se considera raíz, no un sitio de cliente.
      if (!subdominio || subdominio === 'www') return null;

      return { dominio, subdominio };
    }
  }

  return null;
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get('host') || '';
  const hostSinPuerto = host.split(':')[0].toLowerCase();

  // Desarrollo y URLs de preview de Vercel siguen funcionando sin rewrite.
  if (
    hostSinPuerto === 'localhost' ||
    hostSinPuerto === '127.0.0.1' ||
    hostSinPuerto.endsWith('.localhost') ||
    hostSinPuerto.endsWith('.vercel.app')
  ) {
    return NextResponse.next();
  }

  // Los dos dominios raíz y sus www siguen mostrando la app principal.
  const esDominioRaiz = DOMINIOS_RAIZ.some(
    (dominio) => hostSinPuerto === dominio || hostSinPuerto === `www.${dominio}`
  );

  if (esDominioRaiz) {
    return NextResponse.next();
  }

  const sitio = detectarDominio(hostSinPuerto);

  // Hosts que no pertenecen a nuestros dominios se dejan pasar normalmente.
  if (!sitio) {
    return NextResponse.next();
  }

  // El dominio viaja como query interno. No aparece en la URL visible del visitante.
  url.searchParams.set('__dominio', sitio.dominio);

  // Reescribe internamente a /[subdomain]/... sin cambiar la URL visible.
  url.pathname = `/${sitio.subdominio}${url.pathname}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)']
};
