'use client';

import { useEffect, useState } from 'react';
import { useMiNegocio } from '@/lib/useMiNegocio';

type Valor = { nombre: string; precioExtra: number };
type Opcion = { nombre: string; tipo: 'unica' | 'multiple'; valores: Valor[] };

function parseValores(texto: string): Valor[] {
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
  const [error, setError] = useState('');

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
    setError('');

    try {
      let imagen_url: string | null = null;
      if (imagenFile) {
        setSubiendoImagen(true);
        const ext = imagenFile.name.split('.').pop();
        const path = `${negocio.id}/products/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('creatusitio-assets').upload(path, imagenFile);
        setSubiendoImagen(false);
        if (uploadError) {
          setError(`No se pudo subir la imagen: ${uploadError.message}. ¿Ya creaste el bucket "creatusitio-assets" en Supabase Storage?`);
          setGuardando(false);
          return;
        }
        const { data } = supabase.storage.from('creatusitio-assets').getPublicUrl(path);
        imagen_url = data.publicUrl;
      }

      const { data, error: insertError } = await supabase
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

      if (insertError) {
        setError(`No se pudo guardar el producto: ${insertError.message}. ¿Ya corriste el SQL que agrega las columnas "categories" y "opciones"?`);
        return;
      }

      setProductos([...productos, data]);
      resetForm();
    } catch (err: any) {
      setError(err?.message || 'Ocurrió un error inesperado.');
    } finally {
      setGuardando(false);
      setSubiendoImagen(false);
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
      <div className="panel-page-head">
        <div>
          <div className="panel-eyebrow">Catálogo</div>
          <h1>Productos</h1>
          <p>Agrega, organiza y controla lo que aparece en tu tienda o menú.</p>
        </div>
        <div className="product-count">{productos.length} producto{productos.length === 1 ? '' : 's'}</div>
      </div>

      <div className="products-layout">
        <section className="panel-card product-form">
          <div className="form-heading">
            <span>＋</span>
            <div><h2>Nuevo producto</h2><p>Completa la información principal.</p></div>
          </div>

          <div className="panel-field"><label>Nombre del producto</label><input className="panel-input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Hamburguesa clásica" /></div>
          <div className="form-row">
            <div className="panel-field"><label>Precio</label><input className="panel-input" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="0.00" /></div>
            <div className="panel-field"><label>Categoría</label>
              {!mostrarNuevaCategoria ? (
                <div className="field-action"><select className="panel-select" value={categoria} onChange={(e) => setCategoria(e.target.value)}><option value="">General</option>{categorias.map((c) => <option key={c} value={c}>{c}</option>)}</select><button className="mini-button" onClick={() => setMostrarNuevaCategoria(true)}>＋</button></div>
              ) : (
                <div className="new-category"><input className="panel-input" placeholder="Nueva categoría" value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)} /><button className="mini-button save" onClick={agregarCategoria}>✓</button><button className="mini-button" onClick={() => setMostrarNuevaCategoria(false)}>×</button></div>
              )}
            </div>
          </div>
          <div className="panel-field"><label>Descripción <span>Opcional</span></label><textarea className="panel-textarea" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Describe brevemente el producto..." /></div>
          <div className="panel-field"><label>Imagen <span>Opcional</span></label><label className="upload-box"><input type="file" accept="image/*" onChange={(e) => setImagenFile(e.target.files?.[0] || null)} /><b>Subir imagen</b><small>{imagenFile ? imagenFile.name : 'JPG, PNG o WebP'}</small></label></div>

          <div className="options-block">
            <div className="options-head"><div><h3>Personalizaciones</h3><p>Ej. tamaño, salsa o extras.</p></div><button className="panel-button secondary" onClick={agregarOpcion}>＋ Agregar</button></div>
            {opciones.map((op, i) => (
              <div className="option-card" key={i}>
                <div className="option-row">
                  <input className="panel-input" placeholder="Nombre (ej. Salsa)" value={op.nombre} onChange={(e) => actualizarOpcion(i, { nombre: e.target.value })} />
                  <select className="panel-select" value={op.tipo} onChange={(e) => actualizarOpcion(i, { tipo: e.target.value as 'unica' | 'multiple' })}><option value="unica">Elegir una</option><option value="multiple">Elegir varias</option></select>
                  <button className="remove-option" onClick={() => eliminarOpcion(i)}>×</button>
                </div>
                <input className="panel-input" placeholder="BBQ, Picante, Extra queso:15" value={valoresATexto(op.valores)} onChange={(e) => actualizarOpcion(i, { valores: parseValores(e.target.value) })} />
              </div>
            ))}
          </div>

          {error && <div className="form-error">{error}</div>}
          <button className="panel-button save-product" onClick={agregarProducto} disabled={guardando || subiendoImagen}>
            {subiendoImagen ? 'Subiendo imagen...' : guardando ? 'Guardando...' : 'Guardar producto'}
          </button>
        </section>

        <section>
          <div className="list-heading"><div><h2>Tu catálogo</h2><p>Administra visibilidad y elimina productos.</p></div></div>
          <div className="product-list panel-card">
            {productos.length === 0 ? <div className="panel-empty"><b>Aún no tienes productos</b><p>Agrega el primero usando el formulario.</p></div> :
            productos.map((p) => (
              <article className="product-item" key={p.id}>
                <div className="product-image">{p.imagen_url ? <img src={p.imagen_url} alt={p.nombre} /> : <span>□</span>}</div>
                <div className="product-info"><strong>{p.nombre}</strong><span>{p.categoria || 'General'}{p.opciones?.length > 0 ? ` · ${p.opciones.length} personalización(es)` : ''}</span></div>
                <div className="product-price">${Number(p.precio).toFixed(2)}</div>
                <button className={`availability ${p.disponible ? 'on' : ''}`} onClick={() => toggleDisponible(p)}><i />{p.disponible ? 'Visible' : 'Oculto'}</button>
                <button className="delete-product" onClick={() => eliminarProducto(p.id)}>Eliminar</button>
              </article>
            ))}
          </div>
        </section>
      </div>

      <style jsx>{`
        .product-count{padding:7px 10px;border-radius:999px;background:#eeeae2;color:#737785;font-size:10px;font-weight:700}
        .products-layout{display:grid;grid-template-columns:minmax(360px,470px) 1fr;gap:22px;align-items:start}
        .product-form{padding:24px}.form-heading{display:flex;align-items:center;gap:12px;margin-bottom:22px}.form-heading>span{width:38px;height:38px;display:grid;place-items:center;border-radius:10px;background:#fff0eb;color:var(--color-accent);font-size:20px}.form-heading h2,.list-heading h2{font-size:18px}.form-heading p,.list-heading p,.options-head p{margin-top:3px;color:var(--color-ink-soft);font-size:10px}
        .form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}.panel-field label span{color:#a3a5ae;font-weight:400}.field-action,.new-category{display:flex;gap:6px}.mini-button{width:43px;flex:none;border:1px solid #dcd7cc;border-radius:9px;background:#fff;cursor:pointer}.mini-button.save{background:var(--color-ink);color:#fff}
        .upload-box{min-height:76px;display:grid!important;place-content:center;justify-items:center;border:1px dashed #cbc4b7;border-radius:10px;background:#faf9f6;cursor:pointer}.upload-box input{display:none}.upload-box b{font-size:11px}.upload-box small{margin-top:3px;color:#9a9ca5;font-size:9px}
        .options-block{margin-top:22px;padding-top:20px;border-top:1px solid #e8e3da}.options-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.options-head h3{font-size:14px}.option-card{padding:11px;margin-bottom:9px;border:1px solid #e5e0d7;border-radius:10px;background:#faf9f6}.option-row{display:grid;grid-template-columns:1fr 125px 35px;gap:6px;margin-bottom:7px}.remove-option{border:0;border-radius:8px;background:#fff0ed;color:#c84732;cursor:pointer}.form-error{margin:14px 0;padding:10px;border-radius:8px;background:#fff0ed;color:#b9412e;font-size:10px;line-height:1.45}.save-product{width:100%;margin-top:8px;background:var(--color-accent)}.save-product:hover{background:var(--color-accent-dark)}
        .list-heading{margin:3px 0 12px}.product-list{overflow:hidden}.product-item{display:grid;grid-template-columns:48px 1fr auto auto auto;align-items:center;gap:12px;padding:13px 15px;border-bottom:1px solid #eee9e1}.product-item:last-child{border-bottom:0}.product-image{width:48px;height:48px;display:grid;place-items:center;overflow:hidden;border-radius:10px;background:#f0ece4;color:#999}.product-image img{width:100%;height:100%;object-fit:cover}.product-info{display:grid;gap:4px}.product-info strong{font-size:12px}.product-info span{color:var(--color-ink-soft);font-size:9px}.product-price{font:600 11px var(--font-mono)}.availability{display:flex;align-items:center;gap:5px;padding:6px 8px;border:0;border-radius:999px;background:#eeeae3;color:#777b87;font-size:9px;cursor:pointer}.availability i{width:5px;height:5px;border-radius:50%;background:#92959f}.availability.on{background:#e4f3eb;color:#177455}.availability.on i{background:#1c9a6d}.delete-product{border:0;background:none;color:#bf4936;font-size:9px;cursor:pointer}
        @media(max-width:1080px){.products-layout{grid-template-columns:1fr}.product-form{max-width:none}}
        @media(max-width:620px){.form-row{grid-template-columns:1fr}.product-item{grid-template-columns:44px 1fr auto}.availability,.delete-product{grid-row:2}.availability{grid-column:2}.delete-product{grid-column:3}.product-price{grid-column:3;grid-row:1}.option-row{grid-template-columns:1fr}.remove-option{min-height:35px}}
      `}</style>
    </div>
  );
}
