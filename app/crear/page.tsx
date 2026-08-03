'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseClient';

type Tipo = 'tienda' | 'landing' | 'menu';
type TemplateId = 'minimalista' | 'sencillo';

export default function Crear() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [paso, setPaso] = useState(1);
  const [tipo, setTipo] = useState<Tipo | null>(null);
  const [template, setTemplate] = useState<TemplateId | null>(null);
  const [nombre, setNombre] = useState('');
  const [subdominio, setSubdominio] = useState('');
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
    if (!tipo || !template || !nombre || !subdominio || !email || !password) {
      setError('Falta completar algún campo.');
      return;
    }
    setCargando(true);

    // 1. Verificar disponibilidad del subdominio
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

    // 2. Crear cuenta del dueño
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

    // 3. Crear el negocio
    const { error: bizError } = await supabase.from('businesses').insert({
      owner_id: authData.user.id,
      nombre,
      tipo,
      subdominio,
      template_id: template,
      config: { titulo: nombre, colorPrimario: '#111111', descripcion: '', whatsapp: '', instagram: '' }
    });

    if (bizError) {
      setError(bizError.message);
      setCargando(false);
      return;
    }

    router.push('/panel');
  }

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '3rem 1.5rem' }}>
      {paso === 1 && (
        <div>
          <p style={{ color: '#888', fontSize: 14 }}>Paso 1 de 3 — ¿qué quieres crear?</p>
          {(['tienda', 'landing', 'menu'] as Tipo[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTipo(t);
                setPaso(2);
              }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: 16,
                marginBottom: 8,
                borderRadius: 8,
                border: '1px solid #ddd',
                background: '#fff',
                cursor: 'pointer'
              }}
            >
              {t === 'tienda' ? 'Tienda — vende productos' : t === 'landing' ? 'Landing page — presenta tu negocio' : 'Menú — pedidos de comida'}
            </button>
          ))}
        </div>
      )}

      {paso === 2 && (
        <div>
          <p style={{ color: '#888', fontSize: 14 }}>Paso 2 de 3 — elige una plantilla</p>
          {(['minimalista', 'sencillo'] as TemplateId[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTemplate(t);
                setPaso(3);
              }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: 16,
                marginBottom: 8,
                borderRadius: 8,
                border: '1px solid #ddd',
                background: '#fff',
                cursor: 'pointer'
              }}
            >
              {t === 'minimalista' ? 'Minimalista — limpio, mucho blanco' : 'Sencillo — directo y llamativo'}
            </button>
          ))}
          <button onClick={() => setPaso(1)} style={{ marginTop: 8, background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
            ← Atrás
          </button>
        </div>
      )}

      {paso === 3 && (
        <div>
          <p style={{ color: '#888', fontSize: 14 }}>Paso 3 de 3 — datos de tu negocio</p>
          <input placeholder="Nombre del negocio" value={nombre} onChange={(e) => setNombre(e.target.value)} style={inputStyle} />
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: 8, marginBottom: 8 }}>
            <input
              placeholder="tunegocio"
              value={subdominio}
              onChange={(e) => setSubdominio(normalizarSubdominio(e.target.value))}
              style={{ ...inputStyle, border: 'none', marginBottom: 0 }}
            />
            <span style={{ paddingRight: 12, color: '#888', fontSize: 14 }}>.creatusitio.mx</span>
          </div>
          <input placeholder="Tu correo" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          <input
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          {error && <p style={{ color: '#c0392b', fontSize: 14 }}>{error}</p>}
          <button
            onClick={crearNegocio}
            disabled={cargando}
            style={{
              width: '100%',
              padding: 14,
              background: '#111',
              color: '#fff',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            {cargando ? 'Creando...' : 'Crear mi página'}
          </button>
          <button onClick={() => setPaso(2)} style={{ marginTop: 8, background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
            ← Atrás
          </button>
        </div>
      )}
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: 12,
  marginBottom: 8,
  borderRadius: 8,
  border: '1px solid #ddd',
  fontSize: 14,
  boxSizing: 'border-box'
};
