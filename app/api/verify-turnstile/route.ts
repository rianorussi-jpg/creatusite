import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ success: false, error: 'Falta el token' }, { status: 400 });
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.error('TURNSTILE_SECRET_KEY no está configurada');
    return NextResponse.json({ success: false, error: 'Config del servidor incompleta' }, { status: 500 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || undefined;

  const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: secretKey,
      response: token,
      ...(ip ? { remoteip: ip } : {})
    })
  });

  const data = await verifyRes.json();

  if (!data.success) {
    return NextResponse.json({ success: false, error: 'Verificación fallida', detalles: data['error-codes'] }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
