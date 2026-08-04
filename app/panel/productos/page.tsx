'use client';

import { useEffect, useState } from 'react';
import { useMiNegocio } from '@/lib/useMiNegocio';

type Valor = { nombre: string; precioExtra: number };
type Opcion = { nombre: string; tipo: 'unica' | 'multiple'; valores: Valor[] };

function parseValores(texto: string): Valor[] {
  // Formato: "BBQ, Picante:0, Extra queso:15" -> nombre con precio extra opcional
  return texto
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => {
      const [nombre, precio] = v.split(':').map((x) => x.trim());
      return { nombre, precioExtra: precio ? Number(precio) || 0 : 0 };
    });
}

function valoresATexto(valores: Valor[]): string {
  return valores.map((v) => (v.precioExtra ? `${v.nombre}:${v.precioExtra}` : v.nombre)).join(', ');
}

export default function ProductosPanel() {
  const { negocio, cargando, supabase } = useMiNegocio();
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);

  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [mostrarNuevaCategoria, setMostrarNuevaCategoria] = useState(false);
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [opciones, setOpciones] = useState<Opcion[]>([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!negocio) return;
    setCategorias(negocio.categories || []);
    supabase
      .from('products')
      .select('*')
      .eq('business_id', negocio.id)
      .order('orden', { ascending: true })
      .then(({ data }) => setProductos(data || []));
  }, [negocio]);

  async function agregarCategoria() {
    if (!negocio || !nuevaCategoria.trim()) return;
    const nueva = nuevaCategoria.trim();
    if (categorias.includes(nueva)) {
      setCategoria(nueva);
      setNuevaCategoria('');
      setMostrarNuevaCategoria(false);
      return;
    }
    const actualizadas = [...categorias, nueva];
    await supabase.from('businesses').update({ categories: actualizadas }).eq('id', negocio.id);
    setCategorias(actualizadas);
    setCategoria(nueva);
    setNuevaCategoria('');
    setMostrarNuevaCategoria(false);
  }

  function agregarOpcion() {
    setOpciones([...opciones, { nombre: '', tipo: 'unica', valores: [] }]);
  }
  function actualizarOpcion(i: number, cambios: Partial<Opcion>) {
    setOpciones(opciones.map((o, idx) => (idx === i ? { ...o, ...cambios } : o)));
  }
  function eliminarOpcion(i: number) {
    setOpciones(opciones.filter((_, idx) => idx !== i));
  }

  function resetForm() {
    setNombre('');
    setPrecio('');
    setDescripcion('');
    setCategoria('');
    setImagenFile(null);
    setOpciones([]);
  }

  async function agregarProducto() {
    if (!negocio || !nombre || !precio) return;
    setGuardando(true);

    let imagen_url: string | null = null;
    if (imagenFile) {
      setSubiendoImagen(true);
      const ext = imagenFile.name.split('.').pop();
      const path = `${negocio.id}/products/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('creatusitio-assets').upload(path, imagenFile);
      if (!uploadError) {
        const { data } = supabase.storage.from('creatusitio-assets').getPublicUrl(path);
        imagen_url = data.publicUrl;
      }
      setSubiendoImagen(false);
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        business_id: negocio.id,
        nombre,
        precio: Number(precio),
        descripcion,
        categoria: categoria || 'General',
        imagen_url,
        opciones: opciones.filter((o) => o.nombre && o.valores.length > 0)
      })
      .select()
      .single();

    if (!error && data) {
      setProductos([...productos, data]);
      resetForm();
    }
    setGuardando(false);
  }

  async function eliminarProducto(id: string) {
    await supabase.from('products').delete().eq('id', id);
    setProductos(productos.filter((p) => p.id !== id));
  }

  async function toggleDisponible(p: any) {
    await supabase.from('products').update({ disponible: !p.disponible }).eq('id', p.id);
    setProductos(productos.map((x) => (x.id === p.id ? { ...x, disponible: !x.disponible } : x)));
  }

  if (cargando) return <p>Cargando...</p>;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 16 }}>Productos</h1>

      <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: 10, padding: 16, marginBottom: 24, maxWidth: 480 }}>
        <label style={labelStyle}>Nombre</label>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} style={inputStyle} />

        <label style={labelStyle}>Precio</label>
        <input value={precio} onChange={(e) => setPrecio(e.target.value)} style={inputStyle} />

        <label style={labelStyle}>Descripción (opcional)</label>
        <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} style={inputStyle} />

        <label style={labelStyle}>Categoría</label>
        {!mostrarNuevaCategoria ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
              <option value="">Sin categoría (General)</option>
              {categorias.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button onClick={() => setMostrarNuevaCategoria(true)} style={btnSecundario}>+ Nueva</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <input placeholder="Nombre de la categoría" value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            <button onClick={agregarCategoria} style={btnSecundario}>Agregar</button>
            <button onClick={() => setMostrarNuevaCategoria(false)} style={{ ...btnSecundario, color: '#999' }}>Cancelar</button>
          </div>
        )}

        <label style={labelStyle}>Imagen (opcional)</label>
        <input type="file" accept="image/*" onChange={(e) => setImagenFile(e.target.files?.[0] || null)} style={{ marginBottom: 4 }} />

        <label style={{ ...labelStyle, marginTop: 16 }}>Personalizaciones (opcional)</label>
        <p style={{ fontSize: 12, color: '#999', margin: '0 0 8px' }}>Ej. "Salsa": BBQ, Picante, Extra queso:15 (el número es costo extra)</p>
        {opciones.map((op, i) => (
          <div key={i} style={{ border: '1px solid #eee', borderRadius: 8, padding: 10, marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <input
                placeholder="Nombre de la opción (ej. Salsa)"
                value={op.nombre}
                onChange={(e) => actualizarOpcion(i, { nombre: e.target.value })}
                style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
              />
              <select value={op.tipo} onChange={(e) => actualizarOpcion(i, { tipo: e.target.value as 'unica' | 'multiple' })} style={{ ...inputStyle, marginBottom: 0, width: 140 }}>
                <option value="unica">Elige 1</option>
                <option value="multiple">Elige varias</option>
              </select>
              <button onClick={() => eliminarOpcion(i)} style={{ ...btnSecundario, color: '#c0392b' }}>✕</button>
            </div>
            <input
              placeholder="Valores separados por coma (ej. BBQ, Picante, Extra queso:15)"
              value={valoresATexto(op.valores)}
              onChange={(e) => actualizarOpcion(i, { valores: parseValores(e.target.value) })}
              style={{ ...inputStyle, marginBottom: 0 }}
            />
          </div>
        ))}
        <button onClick={agregarOpcion} style={{ ...btnSecundario, marginBottom: 12 }}>+ Agregar personalización</button>

        <button onClick={agregarProducto} disabled={guardando || subiendoImagen} style={btnPrimario}>
          {subiendoImagen ? 'Subiendo imagen...' : guardando ? 'Guardando...' : 'Agregar producto'}
        </button>
      </div>

      {productos.map((p) => (
        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #eee' }}>
          {p.imagen_url && <img src={p.imagen_url} alt={p.nombre} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />}
          <div style={{ flex: 1 }}>
            <span>{p.nombre}</span>
            <span style={{ color: '#aaa', fontSize: 12, marginLeft: 8 }}>{p.categoria}</span>
            {p.opciones?.length > 0 && <span style={{ color: '#aaa', fontSize: 12, marginLeft: 8 }}>· {p.opciones.length} personalización(es)</span>}
          </div>
          <span style={{ color: '#666' }}>${Number(p.precio).toFixed(2)}</span>
          <button onClick={() => toggleDisponible(p)} style={{ fontSize: 12, cursor: 'pointer' }}>
            {p.disponible ? 'Disponible' : 'Oculto'}
          </button>
          <button onClick={() => eliminarProducto(p.id)} style={{ fontSize: 12, color: '#c0392b', cursor: 'pointer' }}>
            Eliminar
          </button>
        </div>
      ))}
    </div>
  );
}

const inputStyle: React.CSSProperties = { display: 'block', width: '100%', padding: 8, marginBottom: 10, border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, color: '#666', marginBottom: 4, fontWeight: 500 };
const btnPrimario: React.CSSProperties = { padding: '10px 20px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' };
const btnSecundario: React.CSSProperties = { padding: '8px 12px', background: '#fff', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' };
