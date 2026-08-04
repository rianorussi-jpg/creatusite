'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseClient';

type Tipo = 'tienda' | 'landing' | 'menu';
type TemplateId = 'minimalista' | 'sencillo' | 'tienda-moderno' | 'tienda-directo';

const TEMPLATES_POR_TIPO: Record<Tipo, { id: TemplateId; nombre: string; descripcion: string }[]> = {
  tienda: [
    { id: 'tienda-moderno', nombre: 'Paso a paso', descripcion: 'Flujo por pasos: menú → entrega → confirmar. Verde, limpio.' },
    { id: 'tienda-directo', nombre: 'Menú directo', descripcion: 'Scroll continuo con categorías y carrito flotante. Rojo/amarillo, directo.' }
  ],
  menu: [
    { id: 'tienda-moderno', nombre: 'Paso a paso', descripcion: 'Flujo por pasos: menú → entrega → confirmar. Verde, limpio.' },
    { id: 'tienda-directo', nombre: 'Menú directo', descripcion: 'Scroll continuo con categorías y carrito flotante. Rojo/amarillo, directo.' }
  ],
  landing: [
    { id: 'minimalista', nombre: 'Minimalista', descripcion: 'Limpio, mucho blanco, tipografía grande' },
    { id: 'sencillo', nombre: 'Sencillo', descripcion: 'Directo y llamativo' }
  ]
};

const TIPO_LABEL: Record<Tipo, { titulo: string; sub: string }> = {
  tienda: { titulo: 'Tienda', sub: 'Vende productos con carrito y pedido por WhatsApp' },
  landing: { titulo: 'Landing page', sub: 'Presenta tu negocio en una sola página' },
  menu: { titulo: 'Menú', sub: 'Categorías, fotos y pedidos de comida' }
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
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const normalizarSubdominio = (valor: string) =>
    valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

  async function crearNegocio() {
    setError('');
    if (!tipo || !template || !nombre || !subdominio || !whatsapp || !email || !password) {
      setError('Falta completar algún campo.');
      return;
    }
    setCargando(true);

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

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });
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

    const { error: bizError } = await supabase.from('businesses').insert({
      owner_id: authData.user.id,
      nombre,
      tipo,
      subdominio,
      template_id: template,
      config: { titulo: nombre, colorPrimario: '#111111', descripcion: '', whatsapp, instagram: '' }
    });

    if (bizError) {
      setError(bizError.message);
      setCargando(false);
      return;
    }

    router.push('/panel');
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1.25rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: 460, padding: '2.5rem 2rem' }}>
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
            {(['tienda', 'landing', 'menu'] as Tipo[]).map((t) => (
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
            {TEMPLATES_POR_TIPO[tipo].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTemplate(t.id);
                  setPaso(3);
                }}
                style={optionBtn}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              >
                <span style={{ fontWeight: 600, fontSize: 15 }}>{t.nombre}</span>
                <br />
                <span style={{ fontSize: 13, color: 'var(--color-ink-soft)' }}>{t.descripcion}</span>
              </button>
            ))}
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
            <input placeholder="Tu correo" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            <input
              placeholder="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...inputStyle, marginBottom: 16 }}
            />

            {error && <p style={{ color: 'var(--color-accent)', fontSize: 13, marginBottom: 12 }}>{error}</p>}

            <button onClick={crearNegocio} disabled={cargando} className="btn btn-accent btn-full">
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
