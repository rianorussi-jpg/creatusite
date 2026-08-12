'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { supabaseBrowser } from '@/lib/supabaseClient';

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!;

declare global {
  interface Window {
    turnstile: any;
  }
}

type Tipo = 'tienda' | 'landing';
type TemplateId = 'landing-negocio' | 'landing-profesionista' | 'landing-lienzo' | 'tienda-moderno' | 'tienda-directo';

const TEMPLATES_POR_TIPO: Record<Tipo, { id: TemplateId; nombre: string; descripcion: string }[]> = {
  tienda: [
    { id: 'tienda-moderno', nombre: 'Minimalista', descripcion: 'Diseño limpio en tonos verdes con un flujo guiado para comprar paso a paso.' },
    { id: 'tienda-directo', nombre: 'Colores', descripcion: 'Diseño llamativo en rojo y amarillo, con categorías visibles y compra más directa.' }
  ],
  landing: [
    { id: 'landing-negocio', nombre: 'Impulso', descripcion: 'Moderna, dinámica y enfocada en convertir. Después podrás mover, agregar y personalizar todos los bloques.' },
    { id: 'landing-profesionista', nombre: 'Esencia', descripcion: 'Elegante, limpia y editorial. Después podrás transformar cada sección, color y contenido.' },
    { id: 'landing-lienzo', nombre: 'Lienzo', descripcion: 'La opción más libre: una base neutra hecha para agregar, quitar y repetir bloques y crear cientos de combinaciones.' }
  ]
};

const TIPO_LABEL: Record<Tipo, { titulo: string; sub: string }> = {
  tienda: { titulo: 'Tienda', sub: 'Vende productos con carrito y pedido por WhatsApp' },
  landing: { titulo: 'Landing page', sub: 'Presenta tu negocio, servicios y contacto en una sola página' }
};

function PasoIndicador({ paso }: { paso: number }) {
  const nombres = ['Tipo', 'Plantilla', 'Datos'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 36 }}>
      {nombres.map((n, i) => {
        const num = i + 1;
        const activo = paso === num;
        const hecho = paso > num;
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600,
                  background: activo || hecho ? 'var(--color-accent)' : 'transparent',
                  color: activo || hecho ? '#fff' : 'var(--color-ink-soft)',
                  border: activo || hecho ? 'none' : '1.5px solid var(--color-border)'
                }}
              >
                {hecho ? '✓' : num}
              </div>
              <span style={{ fontSize: 11, color: activo ? 'var(--color-ink)' : 'var(--color-ink-soft)', fontWeight: activo ? 600 : 400 }}>{n}</span>
            </div>
            {i < nombres.length - 1 && <div style={{ width: 56, height: 1.5, background: hecho ? 'var(--color-accent)' : 'var(--color-border)', margin: '0 6px 18px' }} />}
          </div>
        );
      })}
    </div>
  );
}


function VistaPreviaPlantilla({ id }: { id: TemplateId }) {
  const shell: React.CSSProperties = {
    height: 210,
    borderRadius: 14,
    overflow: 'hidden',
    border: '1px solid rgba(15, 23, 42, 0.08)',
    boxShadow: '0 10px 26px rgba(15, 23, 42, 0.08)',
    position: 'relative'
  };

  const line = (width: string, background = 'rgba(15, 23, 42, 0.12)'): React.CSSProperties => ({
    width,
    height: 6,
    borderRadius: 999,
    background
  });

  if (id === 'tienda-moderno') {
    return (
      <div style={{ ...shell, background: '#f3f4f1', padding: 12 }}>
        <div style={{ background: '#2f6b46', borderRadius: 10, padding: '11px 12px', color: '#fff', fontSize: 11, fontWeight: 800 }}>Tu tienda</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '12px 0 10px' }}>
          {[1, 2, 3].map((n) => <div key={n} style={{ width: 22, height: 22, borderRadius: '50%', background: n === 1 ? '#2f6b46' : '#eef1ec', color: n === 1 ? '#fff' : '#707870', display: 'grid', placeItems: 'center', fontSize: 9, fontWeight: 800 }}>{n}</div>)}
        </div>
        <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 12, color: '#1c1f1c', marginBottom: 9 }}>¿Qué se te antoja hoy?</div>
        {[['Hamburguesa clásica', '$99'], ['Papas especiales', '$65']].map(([name, price]) => (
          <div key={name} style={{ background: '#fff', border: '1px solid #d9ddd6', borderRadius: 11, padding: 9, display: 'flex', gap: 8, alignItems: 'center', marginBottom: 7 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#eef1ec' }} />
            <div style={{ flex: 1 }}><div style={{ fontSize: 9, fontWeight: 800 }}>{name}</div><div style={{ ...line('58%'), marginTop: 5 }} /></div>
            <div style={{ color: '#2f6b46', fontWeight: 900, fontSize: 10 }}>{price}</div>
          </div>
        ))}
      </div>
    );
  }

  if (id === 'tienda-directo') {
    return (
      <div style={{ ...shell, background: '#FFF7EA' }}>
        <div style={{ background: '#C81620', padding: '12px 14px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 900, fontSize: 12 }}>TU TIENDA</span>
          <span style={{ background: '#FFC933', color: '#1B1410', borderRadius: 999, padding: '4px 8px', fontSize: 8, fontWeight: 900 }}>CARRITO</span>
        </div>
        <div style={{ display: 'flex', gap: 6, padding: '10px 12px 8px', overflow: 'hidden' }}>
          {['Favoritos', 'Combos', 'Bebidas'].map((x, i) => <span key={x} style={{ background: i === 0 ? '#FFC933' : '#fff', border: '1px solid #EBDFCF', borderRadius: 999, padding: '5px 9px', fontSize: 8, fontWeight: 800, whiteSpace: 'nowrap' }}>{x}</span>)}
        </div>
        <div style={{ padding: '0 12px' }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: '#1B1410', margin: '5px 0 8px' }}>Favoritos</div>
          {[['Combo especial', '$129'], ['Tacos', '$89']].map(([name, price]) => (
            <div key={name} style={{ background: '#fff', border: '1px solid #EBDFCF', borderRadius: 9, padding: 8, display: 'flex', gap: 8, alignItems: 'center', marginBottom: 7 }}>
              <div style={{ width: 38, height: 38, borderRadius: 7, background: '#FFC933' }} />
              <div style={{ flex: 1 }}><div style={{ fontSize: 9, fontWeight: 900 }}>{name}</div><div style={{ ...line('62%', '#EBDFCF'), marginTop: 5 }} /></div>
              <span style={{ color: '#C81620', fontSize: 10, fontWeight: 900 }}>{price}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (id === 'landing-lienzo') {
    return (
      <div style={{ ...shell, background: '#fbfbfe', padding: 12 }}>
        <div style={{ height: 31, borderRadius: '9px 9px 0 0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' }}>
          <span style={{ fontSize: 9, fontWeight: 900, color: '#7c3aed' }}>TU MARCA</span>
          <div style={{ display: 'flex', gap: 6 }}>{[1,2,3].map(n => <span key={n} style={{ ...line('20px'), height: 4 }} />)}</div>
        </div>
        <div style={{ padding: '18px 14px 14px', textAlign: 'center', background: 'linear-gradient(145deg,#f6f1ff,#ffffff)' }}>
          <div style={{ width: '72%', height: 14, margin: '0 auto', borderRadius: 999, background: '#171526' }} />
          <div style={{ width: '54%', height: 5, margin: '9px auto 0', borderRadius: 999, background: '#cfc7df' }} />
          <div style={{ width: 66, height: 21, margin: '12px auto 0', borderRadius: 999, border: '2px solid #7c3aed' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7, padding: 10, background: '#fff' }}>{[1,2,3].map(n => <div key={n} style={{ height: 48, borderRadius: 9, background: n === 2 ? '#7c3aed18' : '#f4f1f8', border: '1px solid #e8e1f2' }} />)}</div>
      </div>
    );
  }

  if (id === 'landing-profesionista') {
    return (
      <div style={{ ...shell, background: '#fafafa' }}>
        <div style={{ background: '#0d5c63', height: 20 }} />
        <div style={{ background: '#fff', height: 34, padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 9, fontWeight: 900, color: '#263238' }}>CONSULTORIO</span>
          <div style={{ display: 'flex', gap: 8 }}>{[1,2,3].map(n => <span key={n} style={{ ...line('24px'), height: 4 }} />)}</div>
        </div>
        <div style={{ padding: 14, display: 'grid', gridTemplateColumns: '1.15fr .85fr', gap: 10, alignItems: 'center' }}>
          <div><div style={{ fontSize: 18, fontWeight: 900, color: '#0d5c63', lineHeight: 1.05 }}>Atención profesional para ti</div><div style={{ ...line('88%'), marginTop: 9 }} /><div style={{ ...line('68%'), marginTop: 5 }} /><div style={{ width: 72, height: 22, borderRadius: 999, background: '#0d5c63', marginTop: 11 }} /></div>
          <div style={{ height: 76, borderRadius: 12, background: '#0d5c6314', border: '1px solid #0d5c6320' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7, padding: '0 14px' }}>{['Consulta', 'Tratamientos', 'Seguimiento'].map(x => <div key={x} style={{ background: '#fff', borderRadius: 9, padding: 8, boxShadow: '0 5px 15px rgba(0,0,0,.05)', fontSize: 8, fontWeight: 800, color: '#263238' }}>{x}</div>)}</div>
      </div>
    );
  }

  return (
    <div style={{ ...shell, background: '#f5f7fb' }}>
      <div style={{ background: '#fff', height: 35, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>
        <span style={{ fontSize: 9, fontWeight: 900 }}>MI NEGOCIO</span>
        <div style={{ display: 'flex', gap: 7 }}>{[1,2,3,4].map(n => <span key={n} style={{ ...line('21px'), height: 4 }} />)}</div>
      </div>
      <div style={{ background: 'linear-gradient(135deg, #2563eb, #2563ebcc)', padding: 14, display: 'grid', gridTemplateColumns: '1fr .85fr', gap: 10, alignItems: 'center', color: '#fff' }}>
        <div><div style={{ fontWeight: 900, fontSize: 18, lineHeight: 1.05 }}>Haz crecer tu negocio</div><div style={{ ...line('88%', 'rgba(255,255,255,.55)'), marginTop: 8 }} /><div style={{ ...line('70%', 'rgba(255,255,255,.45)'), marginTop: 5 }} /><div style={{ width: 72, height: 21, borderRadius: 999, background: '#fff', marginTop: 10 }} /></div>
        <div style={{ height: 72, borderRadius: 10, background: 'rgba(255,255,255,.25)', border: '1px solid rgba(255,255,255,.35)' }} />
      </div>
      <div style={{ padding: 12 }}><div style={{ fontSize: 11, fontWeight: 900, textAlign: 'center', marginBottom: 8 }}>¿Por qué elegirnos?</div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7 }}>{['Rápido', 'Cómodo', 'Confiable'].map(x => <div key={x} style={{ background: '#fff', borderRadius: 8, padding: 8, boxShadow: '0 4px 14px rgba(0,0,0,.05)', fontSize: 8, fontWeight: 800, color: '#2563eb' }}>{x}</div>)}</div></div>
    </div>
  );
}

export default function Crear() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [paso, setPaso] = useState(1);
  const [tipo, setTipo] = useState<Tipo | null>(null);
  const [template, setTemplate] = useState<TemplateId | null>(null);
  const [nombre, setNombre] = useState('');
  const [subdominio, setSubdominio] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usuarioSesion, setUsuarioSesion] = useState<any>(null);
  const [revisandoSesion, setRevisandoSesion] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileListo, setTurnstileListo] = useState(false);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);


  useEffect(() => {
    let activo = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!activo) return;
      setUsuarioSesion(data.user || null);
      setRevisandoSesion(false);
    });
    return () => { activo = false; };
  }, []);

  useEffect(() => {
    if (paso === 3 && turnstileListo && turnstileRef.current && !widgetIdRef.current && window.turnstile) {
      widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token: string) => setTurnstileToken(token),
        'expired-callback': () => setTurnstileToken(''),
        'error-callback': () => setTurnstileToken('')
      });
    }
  }, [paso, turnstileListo]);

  const normalizarSubdominio = (valor: string) =>
    valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

  function configInicial(tpl: TemplateId): Record<string, any> {
    const base = { titulo: nombre, siteName: nombre, colorPrimario: '#111111', descripcion: '', whatsapp, instagram: '', header: { sticky: true, ctaLabel: 'WhatsApp' } };

    if (tpl === 'landing-lienzo') {
      return {
        ...base,
        builderPreset: 'lienzo',
        theme: { primary: '#7c3aed', background: '#fbfbfe', surface: '#ffffff', text: '#171526', headingFont: 'Trebuchet MS, Arial, sans-serif', bodyFont: 'Arial, Helvetica, sans-serif', radius: 'rounded', buttonStyle: 'outline' },
        blocks: [
          { id: 'hero', type: 'hero', title: nombre || 'Tu negocio', subtitle: 'Una base flexible para construir una página totalmente a tu manera.', visible: true, showInMenu: false, variant: 'centered', style: { accentColor: '#7c3aed' }, content: { buttonText: 'Contáctanos', imageUrl: '' } },
          { id: 'servicios', type: 'services', title: 'Lo que hacemos', visible: true, showInMenu: true, menuLabel: 'Servicios', variant: 'cards', style: { accentColor: '#7c3aed' }, content: { items: [{ title: 'Servicio principal', text: 'Describe aquí lo que ofreces.' }, { title: 'Otra solución', text: 'Agrega otra forma de ayudar.' }, { title: 'Algo diferente', text: 'Destaca lo que te hace especial.' }] } },
          { id: 'galeria', type: 'gallery', title: 'Galería', visible: true, showInMenu: true, menuLabel: 'Galería', variant: 'grid', style: { accentColor: '#7c3aed' }, content: { images: [] } },
          { id: 'nosotros', type: 'about', title: 'Nuestra historia', visible: true, showInMenu: true, menuLabel: 'Nosotros', variant: 'image-left', style: { accentColor: '#7c3aed' }, content: { text: 'Cuenta aquí quién eres y qué hace especial a tu proyecto.', imageUrl: '' } },
          { id: 'accion', type: 'cta', title: '¿Listo para dar el siguiente paso?', subtitle: 'Convierte esta sección en el mensaje que necesites.', visible: true, showInMenu: false, variant: 'banner', style: { accentColor: '#7c3aed' }, content: { buttonText: 'Escríbenos' } },
          { id: 'contacto', type: 'contact', title: 'Hablemos', subtitle: 'Déjanos tus datos o escríbenos por WhatsApp.', visible: true, showInMenu: true, menuLabel: 'Contacto', variant: 'form', style: { accentColor: '#7c3aed' }, content: { buttonText: 'Enviar mensaje' } }
        ]
      };
    }

    if (tpl === 'landing-negocio') {
      return {
        ...base,
        builderPreset: 'impulso',
        theme: { primary: '#2563eb', background: '#f5f7fb', surface: '#ffffff', text: '#1f2937', headingFont: 'Arial, Helvetica, sans-serif', bodyFont: 'Arial, Helvetica, sans-serif', radius: 'rounded', buttonStyle: 'pill' },
        menuItems: [
          { label: 'Beneficios', href: '#beneficios', visible: true },
          { label: 'Nosotros', href: '#nosotros', visible: true },
          { label: 'Planes', href: '#planes', visible: true },
          { label: 'Contacto', href: '#contacto', visible: true }
        ],
        beneficios: [
          { titulo: 'Rápido', texto: 'Respuesta ágil y atención inmediata.' },
          { titulo: 'Cómodo', texto: 'Pide o consulta desde cualquier dispositivo.' },
          { titulo: 'Confiable', texto: 'Un servicio en el que puedes confiar.' }
        ],
        planes: [
          { nombre: 'Básico', precio: '$—', features: 'Servicio 1\nServicio 2\nServicio 3' },
          { nombre: 'Popular', precio: '$—', features: 'Todo lo anterior\nServicio 4\nServicio 5', destacado: true },
          { nombre: 'Premium', precio: '$—', features: 'Todo incluido\nAtención prioritaria' }
        ],
        testimonios: [
          { texto: 'Excelente servicio, muy recomendado.', autor: 'Cliente satisfecho' },
          { texto: 'Atención de calidad y buen trato.', autor: 'Cliente satisfecho' }
        ]
      };
    }

    if (tpl === 'landing-profesionista') {
      return {
        ...base,
        builderPreset: 'esencia',
        theme: { primary: '#0d5c63', background: '#fafafa', surface: '#ffffff', text: '#263238', headingFont: 'Georgia, Times, serif', bodyFont: 'Arial, Helvetica, sans-serif', radius: 'soft', buttonStyle: 'solid' },
        telefono: '',
        horarioTexto: 'Lunes a Viernes | 9:00 - 18:00',
        menuItems: [
          { label: 'Especialidades', href: '#especialidades', visible: true },
          { label: 'Nosotros', href: '#nosotros', visible: true },
          { label: 'Horarios', href: '#horarios', visible: true },
          { label: 'Contacto', href: '#contacto', visible: true }
        ],
        beneficios: [
          { titulo: 'Atención personalizada', texto: '' },
          { titulo: 'Tecnología moderna', texto: '' },
          { titulo: 'Años de experiencia', texto: '' },
          { titulo: 'Consultorio certificado', texto: '' }
        ],
        especialidades: [
          { titulo: 'Consulta General', texto: 'Evaluación y diagnóstico profesional.' },
          { titulo: 'Tratamientos', texto: 'Opciones adaptadas a cada paciente.' },
          { titulo: 'Seguimiento', texto: 'Control y acompañamiento continuo.' }
        ],
        horarios: [
          { dia: 'Lunes - Viernes', horario: '9:00 - 18:00' },
          { dia: 'Sábado', horario: '9:00 - 14:00' },
          { dia: 'Domingo', horario: 'Cerrado' }
        ],
        testimonios: [
          { texto: 'Excelente atención y explicación durante toda la consulta.', autor: 'Paciente' },
          { texto: 'El trato fue muy profesional y resolvió todas mis dudas.', autor: 'Paciente' }
        ]
      };
    }

    return base;
  }

  async function crearNegocio() {
    setError('');
    if (!tipo || !template || !nombre || !subdominio || !whatsapp) {
      setError('Falta completar algún campo.');
      return;
    }
    if (!usuarioSesion && (!email || !password)) {
      setError('Ingresa tu correo y contraseña para crear tu cuenta.');
      return;
    }
    if (!turnstileToken) {
      setError('Completa la verificación de seguridad.');
      return;
    }
    setCargando(true);

    const verify = await fetch('/api/verify-turnstile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: turnstileToken })
    });
    const verifyData = await verify.json();
    if (!verifyData.success) {
      setError('No se pudo verificar que eres humano. Intenta de nuevo.');
      window.turnstile?.reset(widgetIdRef.current);
      setTurnstileToken('');
      setCargando(false);
      return;
    }

    const { data: existente } = await supabase
      .from('businesses')
      .select('id')
      .eq('subdominio', subdominio)
      .maybeSingle();

    if (existente) {
      setError('Ese subdominio ya está en uso, elige otro.');
      setCargando(false);
      return;
    }

    let ownerId = usuarioSesion?.id as string | undefined;

    if (!ownerId) {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError || !authData.user) {
        setError(authError?.message || 'No se pudo crear la cuenta.');
        setCargando(false);
        return;
      }
      if (!authData.session) {
        setError('Revisa tu correo para confirmar tu cuenta antes de continuar.');
        setCargando(false);
        return;
      }
      ownerId = authData.user.id;
    }

    const { data: nuevoNegocio, error: bizError } = await supabase.from('businesses').insert({
      owner_id: ownerId,
      nombre,
      tipo,
      subdominio,
      template_id: template === 'landing-lienzo' ? 'landing-negocio' : template,
      config: configInicial(template)
    }).select('id').single();

    if (bizError || !nuevoNegocio) {
      setError(bizError?.message || 'No se pudo crear el negocio.');
      setCargando(false);
      return;
    }

    window.localStorage.setItem('creatusitio_negocio_activo', nuevoNegocio.id);
    window.dispatchEvent(new CustomEvent('creatusitio:negocio-activo', { detail: { id: nuevoNegocio.id } }));
    router.push('/panel');
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1.25rem' }}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => setTurnstileListo(true)}
      />
      <div className="card" style={{ width: '100%', maxWidth: paso === 2 ? 760 : 460, padding: '2.5rem 2rem', transition: 'max-width .2s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>
            creatusitio<span style={{ color: 'var(--color-accent)' }}>.mx</span>
          </span>
        </div>

        <PasoIndicador paso={paso} />

        {paso === 1 && (
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 4 }}>¿Qué quieres crear?</h2>
            <p style={{ fontSize: 13, color: 'var(--color-ink-soft)', marginBottom: 20 }}>Elige lo que mejor describe tu negocio</p>
            {(['tienda', 'landing'] as Tipo[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTipo(t);
                  setPaso(2);
                }}
                style={optionBtn}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              >
                <span style={{ fontWeight: 600, fontSize: 15 }}>{TIPO_LABEL[t].titulo}</span>
                <br />
                <span style={{ fontSize: 13, color: 'var(--color-ink-soft)' }}>{TIPO_LABEL[t].sub}</span>
              </button>
            ))}
          </div>
        )}

        {paso === 2 && tipo && (
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 4 }}>Elige tu plantilla</h2>
            <p style={{ fontSize: 13, color: 'var(--color-ink-soft)', marginBottom: 20 }}>Podrás personalizarla después desde tu panel</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 14 }}>
              {TEMPLATES_POR_TIPO[tipo].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTemplate(t.id);
                    setPaso(3);
                  }}
                  style={templateBtn}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <VistaPreviaPlantilla id={t.id} />
                  <div style={{ paddingTop: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                      <span style={{ fontWeight: 700, fontSize: 16 }}>{t.nombre}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-accent)' }}>Elegir →</span>
                    </div>
                    <span style={{ fontSize: 12.5, lineHeight: 1.5, color: 'var(--color-ink-soft)' }}>{t.descripcion}</span>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setPaso(1)} style={backBtn}>← Atrás</button>
          </div>
        )}

        {paso === 3 && (
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 4 }}>Datos de tu negocio</h2>
            <p style={{ fontSize: 13, color: 'var(--color-ink-soft)', marginBottom: 20 }}>Último paso antes de publicar</p>

            <input placeholder="Nombre del negocio" value={nombre} onChange={(e) => setNombre(e.target.value)} style={inputStyle} />

            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--color-border)', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
              <input
                placeholder="tunegocio"
                value={subdominio}
                onChange={(e) => setSubdominio(normalizarSubdominio(e.target.value))}
                style={{ ...inputStyle, border: 'none', marginBottom: 0, borderRadius: 0 }}
              />
              <span style={{ paddingRight: 14, color: 'var(--color-ink-soft)', fontSize: 13, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>.creatusitio.mx</span>
            </div>

            <input
              placeholder="WhatsApp donde recibirás pedidos (ej. 524421234567)"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value.replace(/[^0-9]/g, ''))}
              style={inputStyle}
            />
            {!revisandoSesion && usuarioSesion ? (
              <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: '#eef8f3', color: '#177455', fontSize: 12, lineHeight: 1.5 }}>
                <strong>Se agregará a tu cuenta actual.</strong><br />No necesitas volver a escribir correo ni contraseña.
              </div>
            ) : !revisandoSesion ? (
              <>
                <input placeholder="Tu correo" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
                <input placeholder="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...inputStyle, marginBottom: 16 }} />
              </>
            ) : null}

            {error && <p style={{ color: 'var(--color-accent)', fontSize: 13, marginBottom: 12 }}>{error}</p>}

            <div ref={turnstileRef} style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }} />

            <button onClick={crearNegocio} disabled={cargando || !turnstileToken} className="btn btn-accent btn-full">
              {cargando ? 'Creando...' : 'Crear mi página →'}
            </button>
            <button onClick={() => setPaso(2)} style={backBtn}>← Atrás</button>
          </div>
        )}
      </div>
    </main>
  );
}

const optionBtn: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '16px 18px',
  marginBottom: 10,
  borderRadius: 12,
  border: '1.5px solid var(--color-border)',
  background: '#fff',
  cursor: 'pointer',
  transition: 'border-color 0.15s ease'
};

const backBtn: React.CSSProperties = {
  display: 'block',
  margin: '14px auto 0',
  background: 'none',
  border: 'none',
  color: 'var(--color-ink-soft)',
  cursor: 'pointer',
  fontSize: 13
};

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: 13,
  marginBottom: 10,
  borderRadius: 10,
  border: '1.5px solid var(--color-border)',
  fontSize: 14,
  boxSizing: 'border-box'
};


const templateBtn: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: 12,
  borderRadius: 16,
  border: '1.5px solid var(--color-border)',
  background: '#fff',
  cursor: 'pointer',
  transition: 'border-color .15s ease, transform .15s ease, box-shadow .15s ease',
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)'
};
