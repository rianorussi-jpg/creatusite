import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

type VercelAddDomainResponse = {
  name?: string;
  verified?: boolean;
  verification?: Array<{ type?: string; domain?: string; value?: string; reason?: string }>;
  error?: { code?: string; message?: string };
};

type CloudflareListResponse = {
  success: boolean;
  result?: Array<{
    id: string;
    type: string;
    name: string;
    content: string;
    proxied?: boolean;
  }>;
  errors?: Array<{ code?: number; message?: string }>;
};

type CloudflareCreateResponse = {
  success: boolean;
  result?: {
    id: string;
    type: string;
    name: string;
    content: string;
    proxied?: boolean;
  };
  errors?: Array<{ code?: number; message?: string }>;
};

const BASE_DOMAIN = 'enla.mx';
const DEFAULT_VERCEL_CNAME = 'cname.vercel-dns.com';

function cleanSubdomain(value: unknown) {
  if (typeof value !== 'string') return '';
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function vercelUrl(path: string, teamId?: string) {
  const url = new URL(`https://api.vercel.com${path}`);
  if (teamId) url.searchParams.set('teamId', teamId);
  return url.toString();
}

async function vercelRequest(
  path: string,
  token: string,
  teamId: string | undefined,
  init?: RequestInit
) {
  return fetch(vercelUrl(path, teamId), {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    },
    cache: 'no-store'
  });
}

async function cloudflareRequest(
  path: string,
  token: string,
  init?: RequestInit
) {
  return fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    },
    cache: 'no-store'
  });
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const accessToken = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : '';

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Sesión requerida.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    const businessId = typeof body?.businessId === 'string' ? body.businessId : '';

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'Falta businessId.' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
    const user = authData?.user;

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'La sesión no es válida.' },
        { status: 401 }
      );
    }

    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, owner_id, subdominio, dominio_base')
      .eq('id', businessId)
      .eq('owner_id', user.id)
      .maybeSingle();

    if (businessError) {
      console.error('Error leyendo negocio para provisioning:', businessError);
      return NextResponse.json(
        { success: false, error: 'No se pudo validar el negocio.' },
        { status: 500 }
      );
    }

    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Negocio no encontrado o sin permisos.' },
        { status: 404 }
      );
    }

    if (business.dominio_base !== BASE_DOMAIN) {
      return NextResponse.json(
        { success: true, skipped: true, reason: 'No usa enla.mx.' }
      );
    }

    const subdomain = cleanSubdomain(business.subdominio);
    if (!subdomain || subdomain !== business.subdominio) {
      return NextResponse.json(
        { success: false, error: 'Subdominio inválido.' },
        { status: 400 }
      );
    }

    const fullDomain = `${subdomain}.${BASE_DOMAIN}`;

    const vercelToken = process.env.VERCEL_API_TOKEN;
    const vercelProject = process.env.VERCEL_PROJECT_ID || process.env.VERCEL_PROJECT_NAME;
    const vercelTeamId = process.env.VERCEL_TEAM_ID || undefined;
    const cloudflareToken = process.env.CLOUDFLARE_API_TOKEN;
    const cloudflareZoneId = process.env.CLOUDFLARE_ZONE_ID_ENLA;

    if (!vercelToken || !vercelProject || !cloudflareToken || !cloudflareZoneId) {
      console.error('Faltan variables para provisioning de enla.mx');
      return NextResponse.json(
        { success: false, error: 'Configuración de dominio incompleta en el servidor.' },
        { status: 500 }
      );
    }

    // 1) Registrar el subdominio concreto en el proyecto de Vercel.
    const addDomainRes = await vercelRequest(
      `/v10/projects/${encodeURIComponent(vercelProject)}/domains`,
      vercelToken,
      vercelTeamId,
      {
        method: 'POST',
        body: JSON.stringify({ name: fullDomain })
      }
    );

    const addDomainData = (await addDomainRes.json().catch(() => ({}))) as VercelAddDomainResponse;

    // "domain_already_in_use" / conflictos equivalentes se aceptan solo si el dominio
    // ya está ligado a este mismo proyecto; lo comprobamos abajo consultando el dominio.
    if (!addDomainRes.ok) {
      const code = addDomainData?.error?.code || '';
      const msg = addDomainData?.error?.message || '';

      const pareceDuplicado =
        addDomainRes.status === 409 ||
        code.includes('already') ||
        msg.toLowerCase().includes('already');

      if (!pareceDuplicado) {
        console.error('Vercel add-domain falló:', addDomainData);
        return NextResponse.json(
          {
            success: false,
            error: 'Vercel no pudo registrar el subdominio.',
            detalle: msg || code || `HTTP ${addDomainRes.status}`
          },
          { status: 502 }
        );
      }
    }

    // 2) Crear / verificar el CNAME en Cloudflare.
    // Para subdominios Vercel documenta CNAME hacia Vercel DNS.
    // Puedes sobrescribir el target con VERCEL_CNAME_TARGET si tu proyecto muestra uno específico.
    const cnameTarget = process.env.VERCEL_CNAME_TARGET || DEFAULT_VERCEL_CNAME;

    const cfListUrl =
      `/zones/${encodeURIComponent(cloudflareZoneId)}/dns_records` +
      `?type=CNAME&name=${encodeURIComponent(fullDomain)}`;

    const cfListRes = await cloudflareRequest(cfListUrl, cloudflareToken);
    const cfListData = (await cfListRes.json().catch(() => ({}))) as CloudflareListResponse;

    if (!cfListRes.ok || !cfListData.success) {
      console.error('Cloudflare list DNS falló:', cfListData);
      return NextResponse.json(
        { success: false, error: 'No se pudo revisar el DNS en Cloudflare.' },
        { status: 502 }
      );
    }

    const existing = cfListData.result?.[0];

    if (existing) {
      const existingContent = (existing.content || '').replace(/\.$/, '').toLowerCase();
      const wantedContent = cnameTarget.replace(/\.$/, '').toLowerCase();

      if (existingContent !== wantedContent) {
        return NextResponse.json(
          {
            success: false,
            error: `Ya existe un CNAME para ${fullDomain}, pero apunta a otro destino.`,
            actual: existing.content,
            esperado: cnameTarget
          },
          { status: 409 }
        );
      }
    } else {
      const cfCreateRes = await cloudflareRequest(
        `/zones/${encodeURIComponent(cloudflareZoneId)}/dns_records`,
        cloudflareToken,
        {
          method: 'POST',
          body: JSON.stringify({
            type: 'CNAME',
            name: fullDomain,
            content: cnameTarget,
            ttl: 1,
            proxied: false,
            comment: 'Creado automáticamente por CreaTuSitio'
          })
        }
      );

      const cfCreateData = (await cfCreateRes.json().catch(() => ({}))) as CloudflareCreateResponse;

      if (!cfCreateRes.ok || !cfCreateData.success) {
        console.error('Cloudflare create DNS falló:', cfCreateData);
        return NextResponse.json(
          {
            success: false,
            error: 'No se pudo crear el CNAME en Cloudflare.',
            detalle: cfCreateData.errors?.[0]?.message
          },
          { status: 502 }
        );
      }
    }

    // 3) Consultar configuración en Vercel. Esto no bloquea el alta porque el DNS
    // puede tardar unos segundos/minutos en propagarse.
    const configRes = await vercelRequest(
      `/v6/domains/${encodeURIComponent(fullDomain)}/config`,
      vercelToken,
      vercelTeamId,
      { method: 'GET' }
    );

    const configData = await configRes.json().catch(() => ({}));

    return NextResponse.json({
      success: true,
      domain: fullDomain,
      dnsCreated: !existing,
      vercel: {
        registered: true,
        misconfigured:
          typeof configData?.misconfigured === 'boolean'
            ? configData.misconfigured
            : undefined
      }
    });
  } catch (error: any) {
    console.error('Provision enla.mx error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Ocurrió un error al configurar el subdominio.',
        detalle: error?.message || 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
