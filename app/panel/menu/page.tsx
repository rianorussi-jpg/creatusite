'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMiNegocio } from '@/lib/useMiNegocio';

export default function MenuPanel() {
  const router = useRouter();
  const { negocio, cargando, supabase, setNegocio } = useMiNegocio();
  const [items, setItems] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!negocio) return;
    if (negocio.tipo !== 'menu') { router.replace('/panel'); return; }
    setCategorias(negocio.categories || []);
    supabase.from('products').select('*').eq('business_id', negocio.id).order('orden', { ascending: true }).then(({ data }) => setItems(data || []));
  }, [negocio?.id]);

  function limpiar() {
    setEditandoId(null); setNombre(''); setPrecio(''); setDescripcion(''); setCategoria(''); setImagenFile(null); setError('');
  }

  async function agregarCategoria() {
    if (!negocio || !nuevaCategoria.trim()) return;
    const nueva = nuevaCategoria.trim();
    if (categorias.includes(nueva)) { setCategoria(nueva); setNuevaCategoria(''); return; }
    const next = [...categorias, nueva];
    const { error } = await supabase.from('businesses').update({ categories: next }).eq('id', negocio.id);
    if (!error) { setCategorias(next); setCategoria(nueva); setNuevaCategoria(''); setNegocio({ ...negocio, categories: next }); }
  }

  async function eliminarCategoria(cat: string) {
    if (!negocio) return;
    const next = categorias.filter((c) => c !== cat);
    await supabase.from('businesses').update({ categories: next }).eq('id', negocio.id);
    await supabase.from('products').update({ categoria: 'General' }).eq('business_id', negocio.id).eq('categoria', cat);
    setCategorias(next);
    setItems((prev) => prev.map((x) => x.categoria === cat ? { ...x, categoria: 'General' } : x));
    setNegocio({ ...negocio, categories: next });
    if (categoria === cat) setCategoria('');
  }

  async function guardarItem() {
    if (!negocio || !nombre.trim()) { setError('Escribe el nombre del elemento.'); return; }
    setGuardando(true); setError('');
    let imagen_url: string | null | undefined = undefined;
    if (imagenFile) {
      const ext = imagenFile.name.split('.').pop() || 'jpg';
      const path = `${negocio.id}/menu/${Date.now()}.${ext}`;
      const { error: upError } = await supabase.storage.from('creatusitio-assets').upload(path, imagenFile);
      if (upError) { setError(`No se pudo subir la imagen: ${upError.message}`); setGuardando(false); return; }
      imagen_url = supabase.storage.from('creatusitio-assets').getPublicUrl(path).data.publicUrl;
    }
    const payload: any = {
      business_id: negocio.id,
      nombre: nombre.trim(),
      precio: precio ? Number(precio) : 0,
      descripcion: descripcion.trim(),
      categoria: categoria || 'General',
      opciones: []
    };
    if (imagen_url !== undefined) payload.imagen_url = imagen_url;

    if (editandoId) {
      const { data, error } = await supabase.from('products').update(payload).eq('id', editandoId).select().single();
      if (error) setError(error.message); else { setItems((prev) => prev.map((x) => x.id === editandoId ? data : x)); limpiar(); }
    } else {
      payload.orden = items.length;
      const { data, error } = await supabase.from('products').insert(payload).select().single();
      if (error) setError(error.message); else { setItems((prev) => [...prev, data]); limpiar(); }
    }
    setGuardando(false);
  }

  function editar(item: any) {
    setEditandoId(item.id); setNombre(item.nombre || ''); setPrecio(Number(item.precio) ? String(item.precio) : ''); setDescripcion(item.descripcion || ''); setCategoria(item.categoria || ''); setImagenFile(null); window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function quitarImagen(item: any) {
    const { error } = await supabase.from('products').update({ imagen_url: null }).eq('id', item.id);
    if (!error) setItems((prev) => prev.map((x) => x.id === item.id ? { ...x, imagen_url: null } : x));
  }

  async function eliminar(id: string) {
    await supabase.from('products').delete().eq('id', id);
    setItems((prev) => prev.filter((x) => x.id !== id));
    if (editandoId === id) limpiar();
  }

  async function toggle(item: any) {
    const disponible = !item.disponible;
    await supabase.from('products').update({ disponible }).eq('id', item.id);
    setItems((prev) => prev.map((x) => x.id === item.id ? { ...x, disponible } : x));
  }

  if (cargando || !negocio || negocio.tipo !== 'menu') return <div className="panel-card panel-empty">Cargando menú...</div>;

  return <div>
    <div className="panel-page-head"><div><div className="panel-eyebrow">Carta digital</div><h1>Tu menú</h1><p>Organiza categorías y agrega platillos, bebidas, servicios o cualquier elemento informativo.</p></div><div className="count">{items.length} elemento{items.length === 1 ? '' : 's'}</div></div>

    <div className="menu-layout">
      <section className="panel-card editor-card">
        <div className="form-title"><span>{editandoId ? '✎' : '＋'}</span><div><h2>{editandoId ? 'Editar elemento' : 'Nuevo elemento'}</h2><p>La imagen y el precio son opcionales.</p></div></div>
        <div className="panel-field"><label>Nombre</label><input className="panel-input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Hamburguesa clásica" /></div>
        <div className="row"><div className="panel-field"><label>Precio <span>Opcional</span></label><input className="panel-input" inputMode="decimal" value={precio} onChange={(e) => setPrecio(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="149.00" /></div><div className="panel-field"><label>Categoría</label><select className="panel-select" value={categoria} onChange={(e) => setCategoria(e.target.value)}><option value="">General</option>{categorias.map((c) => <option key={c}>{c}</option>)}</select></div></div>
        <div className="panel-field"><label>Descripción <span>Opcional</span></label><textarea className="panel-textarea" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ingredientes, presentación o información breve..." /></div>
        <div className="panel-field"><label>Imagen <span>Opcional</span></label>{editandoId && items.find((x) => x.id === editandoId)?.imagen_url && <div className="current-image"><img src={items.find((x) => x.id === editandoId)?.imagen_url} alt="Imagen actual" /><div><b>Imagen actual</b><small>Selecciona otra abajo para reemplazarla.</small><button type="button" onClick={() => quitarImagen(items.find((x) => x.id === editandoId))}>Quitar imagen</button></div></div>}<label className="upload"><input type="file" accept="image/*" onChange={(e) => setImagenFile(e.target.files?.[0] || null)} /><b>{imagenFile ? imagenFile.name : editandoId ? 'Cambiar imagen' : 'Seleccionar imagen'}</b><small>JPG, PNG o WebP</small></label></div>
        {error && <div className="error">{error}</div>}
        <div className="actions"><button className="panel-button" onClick={guardarItem} disabled={guardando}>{guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Agregar al menú'}</button>{editandoId && <button className="panel-button secondary" onClick={limpiar}>Cancelar</button>}</div>
      </section>

      <div>
        <section className="panel-card categories"><div className="section-head"><div><h2>Categorías</h2><p>Sirven para separar tu menú en secciones.</p></div></div><div className="new-cat"><input className="panel-input" value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)} placeholder="Ej. Bebidas" onKeyDown={(e) => e.key === 'Enter' && agregarCategoria()} /><button className="panel-button" onClick={agregarCategoria}>Agregar</button></div><div className="chips">{categorias.length === 0 && <small>Aún no has creado categorías.</small>}{categorias.map((c) => <span key={c}>{c}<button onClick={() => eliminarCategoria(c)}>×</button></span>)}</div></section>

        <section className="panel-card list"><div className="section-head"><div><h2>Elementos del menú</h2><p>Puedes ocultarlos temporalmente o editarlos.</p></div></div>{items.length === 0 ? <div className="panel-empty"><b>Tu menú está vacío</b><p>Agrega tu primer elemento con el formulario.</p></div> : items.map((item) => <article key={item.id} className="item"><div className="thumb">{item.imagen_url ? <img src={item.imagen_url} alt={item.nombre} /> : <span>☰</span>}</div><div className="info"><strong>{item.nombre}</strong><span>{item.categoria || 'General'}{Number(item.precio) > 0 ? ` · $${Number(item.precio).toFixed(2)}` : ''}</span><small>{item.descripcion || 'Sin descripción'}</small></div><div className="item-actions"><button className={`visible ${item.disponible ? 'on' : ''}`} onClick={() => toggle(item)}>{item.disponible ? 'Visible' : 'Oculto'}</button><button onClick={() => editar(item)}>Editar / imagen</button>{item.imagen_url && <button onClick={() => quitarImagen(item)}>Quitar foto</button>}<button className="delete" onClick={() => eliminar(item.id)}>Eliminar</button></div></article>)}</section>
      </div>
    </div>
    <style jsx>{`
      .count{padding:7px 10px;border-radius:999px;background:#eeeae2;color:#737785;font-size:10px;font-weight:700}.menu-layout{display:grid;grid-template-columns:minmax(340px,430px) 1fr;gap:22px;align-items:start}.editor-card,.categories,.list{padding:22px}.form-title{display:flex;gap:11px;align-items:center;margin-bottom:20px}.form-title>span{width:38px;height:38px;display:grid;place-items:center;border-radius:10px;background:#fff0eb;color:var(--color-accent);font-size:18px}.form-title h2,.section-head h2{font-size:17px}.form-title p,.section-head p{margin-top:3px;color:var(--color-ink-soft);font-size:10px}.row{display:grid;grid-template-columns:1fr 1fr;gap:10px}.panel-field label span{font-weight:400;color:#999ca5}.upload{min-height:78px;display:grid!important;place-content:center;justify-items:center;border:1px dashed #cbc4b7;border-radius:10px;background:#faf9f6;cursor:pointer}.upload input{display:none}.upload b{font-size:10px}.upload small{margin-top:3px;color:#999ca5;font-size:8px}.current-image{display:flex;gap:12px;align-items:center;padding:10px;margin-bottom:9px;border:1px solid #e6e0d6;border-radius:11px;background:#fff}.current-image img{width:74px;height:74px;object-fit:cover;border-radius:9px}.current-image>div{display:grid;gap:3px}.current-image b{font-size:10px}.current-image small{font-size:8px;color:var(--color-ink-soft)}.current-image button{width:max-content;border:0;background:none;padding:3px 0;color:#b9412e;font-size:8px;font-weight:700;cursor:pointer}.error{padding:10px;margin:8px 0;border-radius:8px;background:#fff0ed;color:#b9412e;font-size:10px}.actions{display:flex;gap:8px}.categories{margin-bottom:16px}.new-cat{display:flex;gap:8px;margin-top:14px}.chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}.chips>span{display:flex;align-items:center;gap:6px;padding:7px 9px;border-radius:999px;background:#f2eee7;font-size:10px;font-weight:700}.chips button{border:0;background:none;color:#a34b3b;cursor:pointer}.chips small{color:var(--color-ink-soft)}.list{padding:0;overflow:hidden}.section-head{padding:20px 20px 14px}.item{display:grid;grid-template-columns:58px 1fr auto;gap:12px;align-items:center;padding:13px 16px;border-top:1px solid #eee9e1}.thumb{width:58px;height:58px;display:grid;place-items:center;overflow:hidden;border-radius:11px;background:#f0ece4;color:#999}.thumb img{width:100%;height:100%;object-fit:cover}.info{display:grid;gap:3px;min-width:0}.info strong{font-size:12px}.info span,.info small{color:var(--color-ink-soft);font-size:9px}.info small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.item-actions{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end}.item-actions button{border:1px solid #ddd7cc;border-radius:8px;background:#fff;padding:6px 8px;font-size:8px;cursor:pointer}.item-actions .visible.on{background:#e4f3eb;color:#177455;border-color:#d5eadf}.item-actions .delete{color:#b9412e}.actions .panel-button:first-child{background:var(--color-accent)}
      @media(max-width:1000px){.menu-layout{grid-template-columns:1fr}}@media(max-width:560px){.row{grid-template-columns:1fr}.item{grid-template-columns:48px 1fr}.thumb{width:48px;height:48px}.item-actions{grid-column:2;justify-content:flex-start}}
    `}</style>
  </div>;
}
