'use client';

import { useEffect, useState } from 'react';
import { useMiNegocio } from '@/lib/useMiNegocio';

export default function ProductosPanel() {
  const { negocio, cargando, supabase } = useMiNegocio();
  const [productos, setProductos] = useState<any[]>([]);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    if (!negocio) return;
    supabase
      .from('products')
      .select('*')
      .eq('business_id', negocio.id)
      .order('orden', { ascending: true })
      .then(({ data }) => setProductos(data || []));
  }, [negocio]);

  async function agregarProducto() {
    if (!negocio || !nombre || !precio) return;
    const { data, error } = await supabase
      .from('products')
      .insert({ business_id: negocio.id, nombre, precio: Number(precio), descripcion })
      .select()
      .single();
    if (!error && data) {
      setProductos([...productos, data]);
      setNombre('');
      setPrecio('');
      setDescripcion('');
    }
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

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} style={inputStyle} />
        <input placeholder="Precio" value={precio} onChange={(e) => setPrecio(e.target.value)} style={{ ...inputStyle, width: 100 }} />
        <input placeholder="Descripción (opcional)" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} style={inputStyle} />
        <button onClick={agregarProducto} style={btnStyle}>Agregar</button>
      </div>

      {productos.map((p) => (
        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #eee' }}>
          <span style={{ flex: 1 }}>{p.nombre}</span>
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

const inputStyle: React.CSSProperties = { padding: 8, border: '1px solid #ddd', borderRadius: 6, fontSize: 14 };
const btnStyle: React.CSSProperties = { padding: '8px 14px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' };
