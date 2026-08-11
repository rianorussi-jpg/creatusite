'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMiNegocio } from '@/lib/useMiNegocio';
import LandingFlexible, { createDefaultBlock, defaultLandingTheme, legacyBlocks, type LandingBlock, type LandingBlockType, type LandingPreset } from '@/components/templates/LandingFlexible';

const BLOCK_LABELS: Record<LandingBlockType, { name: string; desc: string; icon: string }> = {
  hero: { name: 'Portada', desc: 'Título, mensaje, botón e imagen principal.', icon: '✦' },
  features: { name: 'Beneficios', desc: 'Razones para elegirte en tarjetas.', icon: '✓' },
  about: { name: 'Texto + imagen', desc: 'Cuenta quién eres o presenta tu negocio.', icon: '◫' },
  services: { name: 'Servicios', desc: 'Muestra lo que haces en tarjetas.', icon: '▦' },
  pricing: { name: 'Precios / planes', desc: 'Paquetes, precios y características.', icon: '$' },
  hours: { name: 'Horarios', desc: 'Días y horarios de atención.', icon: '◷' },
  testimonials: { name: 'Testimonios', desc: 'Opiniones de clientes.', icon: '“' },
  contact: { name: 'Contacto', desc: 'Formulario conectado a WhatsApp.', icon: '@' },
  cta: { name: 'Llamado a la acción', desc: 'Un bloque corto para convertir.', icon: '→' }
};

export default function DisenoPanel() {
  const { negocio, cargando, supabase, setNegocio } = useMiNegocio();
  const [config, setConfig] = useState<any>(null);
  const [selectedId, setSelectedId] = useState('');
  const [preview, setPreview] = useState<'desktop' | 'mobile'>('desktop');
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);

  const esLanding = negocio?.tipo === 'landing';
  const preset: LandingPreset = negocio?.template_id === 'landing-profesionista' ? 'esencia' : 'impulso';

  useEffect(() => {
    if (!negocio) return;
    if (!esLanding) {
      setConfig({ ...negocio.config });
      return;
    }
    const blocks = legacyBlocks(negocio.config || {}, preset);
    const theme = { ...defaultLandingTheme(preset), ...(negocio.config?.theme || {}), primary: negocio.config?.theme?.primary || negocio.config?.colorPrimario || defaultLandingTheme(preset).primary };
    const next = { ...negocio.config, theme, blocks, siteName: negocio.config?.siteName || negocio.config?.titulo || negocio.nombre, header: { sticky: true, ctaLabel: 'WhatsApp', ...(negocio.config?.header || {}) } };
    setConfig(next);
    setSelectedId(blocks[0]?.id || '');
    setGuardado(false);
  }, [negocio?.id, negocio?.template_id]);

  const blocks: LandingBlock[] = config?.blocks || [];
  const selected = useMemo(() => blocks.find((b) => b.id === selectedId) || blocks[0], [blocks, selectedId]);

  function patchConfig(patch: any) { setConfig((prev: any) => ({ ...prev, ...patch })); setGuardado(false); }
  function patchBlock(id: string, patch: Partial<LandingBlock>) {
    patchConfig({ blocks: blocks.map((b) => b.id === id ? { ...b, ...patch } : b) });
  }
  function patchBlockContent(id: string, patch: any) {
    const block = blocks.find((b) => b.id === id); if (!block) return;
    patchBlock(id, { content: { ...(block.content || {}), ...patch } });
  }
  function patchBlockStyle(id: string, patch: any) {
    const block = blocks.find((b) => b.id === id); if (!block) return;
    patchBlock(id, { style: { ...(block.style || {}), ...patch } });
  }

  function addBlock(type: LandingBlockType) {
    const block = createDefaultBlock(type, preset);
    patchConfig({ blocks: [...blocks, block] });
    setSelectedId(block.id); setPaletteOpen(false);
  }
  function duplicateBlock(block: LandingBlock) {
    const copy = { ...block, id: `${block.type}-${Math.random().toString(36).slice(2,8)}`, title: `${block.title} copia`, content: JSON.parse(JSON.stringify(block.content || {})), style: { ...(block.style || {}) } };
    const idx = blocks.findIndex((b) => b.id === block.id);
    const next = [...blocks]; next.splice(idx + 1, 0, copy); patchConfig({ blocks: next }); setSelectedId(copy.id);
  }
  function removeBlock(id: string) {
    const next = blocks.filter((b) => b.id !== id); patchConfig({ blocks: next }); setSelectedId(next[0]?.id || '');
  }
  function moveBlock(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;
    const from = blocks.findIndex((b) => b.id === sourceId), to = blocks.findIndex((b) => b.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...blocks]; const [item] = next.splice(from, 1); next.splice(to, 0, item); patchConfig({ blocks: next });
  }

  async function uploadImage(file: File, target: 'logo' | 'block', blockId?: string) {
    if (!negocio) return;
    setSubiendo(true);
    const ext = file.name.split('.').pop();
    const path = `${negocio.id}/builder/${target}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('creatusitio-assets').upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from('creatusitio-assets').getPublicUrl(path);
      const url = `${data.publicUrl}?v=${Date.now()}`;
      if (target === 'logo') patchConfig({ logoUrl: url });
      else if (blockId) patchBlockContent(blockId, { imageUrl: url });
    }
    setSubiendo(false);
  }

  async function guardar() {
    if (!negocio || !config) return;
    setGuardando(true); setGuardado(false);
    const nextConfig = { ...config, colorPrimario: config.theme?.primary || config.colorPrimario };
    const { error } = await supabase.from('businesses').update({ config: nextConfig }).eq('id', negocio.id);
    if (!error) { setConfig(nextConfig); setNegocio({ ...negocio, config: nextConfig }); setGuardado(true); window.setTimeout(() => setGuardado(false), 2200); }
    setGuardando(false);
  }

  if (cargando || !negocio || !config) return <div className="panel-card panel-empty">Cargando editor...</div>;
  if (!esLanding) return <StoreEditor negocio={negocio} config={config} setConfig={setConfig} guardar={guardar} guardando={guardando} uploadImage={uploadImage} subiendo={subiendo} />;

  const previewBusiness = { ...negocio, config };

  return (
    <div className="builder-page">
      <div className="builder-top">
        <div><div className="panel-eyebrow">Editor visual</div><h1>Diseña tu landing</h1><p>Arrastra bloques, cambia textos y colores y revisa el resultado al instante.</p></div>
        <div className="builder-actions">
          {guardado && <span className="saved">✓ Guardado</span>}
          <a className="panel-button secondary" href={`https://${negocio.subdominio}.creatusitio.mx`} target="_blank" rel="noreferrer">Ver sitio ↗</a>
          <button className="panel-button" onClick={guardar} disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar y publicar'}</button>
        </div>
      </div>

      <div className="builder-shell">
        <aside className="builder-sidebar panel-card">
          <div className="builder-tabs"><strong>Bloques</strong><button onClick={()=>setPaletteOpen(true)}>＋ Agregar</button></div>
          <div className="block-list">
            {blocks.map((block) => (
              <button
                key={block.id}
                draggable
                onDragStart={()=>setDragId(block.id)}
                onDragOver={(e)=>e.preventDefault()}
                onDrop={()=>{ if (dragId) moveBlock(dragId, block.id); setDragId(null); }}
                onClick={()=>setSelectedId(block.id)}
                className={`block-row ${selected?.id === block.id ? 'active' : ''} ${block.visible === false ? 'hidden-block' : ''}`}
              >
                <span className="drag">⋮⋮</span><span className="block-icon">{BLOCK_LABELS[block.type].icon}</span><span><b>{block.title || BLOCK_LABELS[block.type].name}</b><small>{BLOCK_LABELS[block.type].name}</small></span><i>{block.visible === false ? '○' : '●'}</i>
              </button>
            ))}
          </div>
          <button className="add-block-bottom" onClick={()=>setPaletteOpen(true)}>＋ Agregar sección</button>
        </aside>

        <section className="builder-controls panel-card">
          {selected ? <BlockEditor block={selected} patch={(p: Partial<LandingBlock>)=>patchBlock(selected.id,p)} patchContent={(p: Record<string, any>)=>patchBlockContent(selected.id,p)} patchStyle={(p: Record<string, any>)=>patchBlockStyle(selected.id,p)} duplicate={()=>duplicateBlock(selected)} remove={()=>removeBlock(selected.id)} upload={(file: File)=>uploadImage(file,'block',selected.id)} subiendo={subiendo} /> : <div className="empty-editor">Agrega un bloque para empezar.</div>}
          <GlobalEditor config={config} patchConfig={patchConfig} uploadLogo={(file: File)=>uploadImage(file,'logo')} subiendo={subiendo} />
        </section>

        <section className="preview-column">
          <div className="preview-toolbar panel-card"><div><button className={preview==='desktop'?'active':''} onClick={()=>setPreview('desktop')}>▰ Escritorio</button><button className={preview==='mobile'?'active':''} onClick={()=>setPreview('mobile')}>▯ Móvil</button></div><span>Vista previa en vivo</span></div>
          <div className={`preview-stage ${preview}`}>
            <div className="preview-canvas"><LandingFlexible business={previewBusiness} preset={preset} /></div>
          </div>
        </section>
      </div>

      {paletteOpen && <div className="palette-overlay" onClick={()=>setPaletteOpen(false)}><div className="palette panel-card" onClick={(e)=>e.stopPropagation()}><div className="palette-head"><div><div className="panel-eyebrow">Biblioteca</div><h2>Agregar una sección</h2><p>Elige un bloque y personalízalo después.</p></div><button onClick={()=>setPaletteOpen(false)}>×</button></div><div className="palette-grid">{(Object.keys(BLOCK_LABELS) as LandingBlockType[]).map((type)=><button key={type} onClick={()=>addBlock(type)}><span>{BLOCK_LABELS[type].icon}</span><b>{BLOCK_LABELS[type].name}</b><small>{BLOCK_LABELS[type].desc}</small></button>)}</div></div></div>}

      <style jsx>{`
        .builder-page{max-width:none}.builder-top{display:flex;justify-content:space-between;gap:20px;align-items:flex-end;margin-bottom:20px}.builder-top h1{font-size:30px}.builder-top p{margin-top:6px;color:var(--color-ink-soft);font-size:12px}.builder-actions{display:flex;align-items:center;gap:8px}.saved{padding:7px 9px;border-radius:999px;background:#e7f6ee;color:#177455;font-size:9px;font-weight:800}
        .builder-shell{display:grid;grid-template-columns:225px 320px minmax(430px,1fr);gap:14px;align-items:start}.builder-sidebar,.builder-controls{position:sticky;top:91px;max-height:calc(100vh - 112px);overflow:auto}.builder-sidebar{padding:12px}.builder-tabs{display:flex;align-items:center;justify-content:space-between;padding:5px 4px 11px}.builder-tabs strong{font-size:12px}.builder-tabs button{border:0;background:none;color:var(--color-accent);font-size:10px;font-weight:800;cursor:pointer}.block-list{display:grid;gap:5px}.block-row{width:100%;display:grid;grid-template-columns:16px 31px 1fr auto;gap:7px;align-items:center;padding:9px 7px;border:1px solid transparent;border-radius:9px;background:transparent;text-align:left;color:var(--color-ink);cursor:pointer}.block-row:hover{background:#f7f4ee}.block-row.active{border-color:#f1cfc8;background:#fff3ef}.block-row .drag{color:#b5b0a7;cursor:grab}.block-icon{width:31px;height:31px;display:grid;place-items:center;border-radius:8px;background:#f1eee8;color:#616575;font-size:11px}.block-row.active .block-icon{background:var(--color-accent);color:#fff}.block-row span:nth-child(3){display:grid;gap:2px;min-width:0}.block-row b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px}.block-row small{color:#999ca6;font-size:8px}.block-row i{font-size:7px;color:#2b9a70}.hidden-block{opacity:.48}.hidden-block i{color:#aaa}.add-block-bottom{width:100%;min-height:39px;margin-top:9px;border:1px dashed #ccc5b8;border-radius:9px;background:#faf9f6;font-size:9px;font-weight:800;cursor:pointer}
        .builder-controls{padding:18px}.preview-column{min-width:0}.preview-toolbar{height:48px;display:flex;align-items:center;justify-content:space-between;padding:0 12px;margin-bottom:10px}.preview-toolbar>div{display:flex;gap:4px}.preview-toolbar button{padding:7px 9px;border:0;border-radius:7px;background:transparent;color:#858995;font-size:9px;font-weight:700;cursor:pointer}.preview-toolbar button.active{background:#ede9e1;color:var(--color-ink)}.preview-toolbar span{color:#9a9da6;font-size:8px}.preview-stage{min-height:720px;padding:20px;overflow:auto;border:1px solid #ddd7cb;border-radius:15px;background:#dedbd5}.preview-canvas{width:1180px;min-height:760px;transform-origin:top left;background:#fff;box-shadow:0 24px 60px rgba(29,26,22,.16);overflow:hidden}.preview-stage.desktop .preview-canvas{transform:scale(.58);margin-bottom:-300px}.preview-stage.mobile{display:grid;justify-content:center}.preview-stage.mobile .preview-canvas{width:390px;transform:scale(.88);margin-bottom:-80px}
        .palette-overlay{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:25px;background:rgba(16,19,31,.62)}.palette{width:min(760px,96vw);max-height:85vh;overflow:auto;padding:24px}.palette-head{display:flex;justify-content:space-between;gap:20px;margin-bottom:18px}.palette-head h2{font-size:22px}.palette-head p{margin-top:4px;color:var(--color-ink-soft);font-size:10px}.palette-head>button{width:34px;height:34px;border:0;border-radius:9px;background:#f2efe9;font-size:20px;cursor:pointer}.palette-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.palette-grid button{min-height:125px;display:grid;align-content:start;gap:7px;padding:16px;border:1px solid #e0dbd1;border-radius:12px;background:#fff;text-align:left;cursor:pointer;transition:.15s}.palette-grid button:hover{transform:translateY(-2px);border-color:var(--color-accent);box-shadow:0 10px 25px rgba(30,26,20,.07)}.palette-grid button>span{width:34px;height:34px;display:grid;place-items:center;border-radius:9px;background:#fff0eb;color:var(--color-accent);font-weight:800}.palette-grid b{font-size:11px}.palette-grid small{color:var(--color-ink-soft);font-size:9px;line-height:1.5}
        @media(max-width:1250px){.builder-shell{grid-template-columns:200px 300px minmax(390px,1fr)}.preview-stage.desktop .preview-canvas{transform:scale(.48);margin-bottom:-390px}}@media(max-width:1050px){.builder-shell{grid-template-columns:210px 1fr}.preview-column{grid-column:1/-1}.builder-sidebar,.builder-controls{position:relative;top:auto;max-height:none}.preview-stage.desktop .preview-canvas{transform:scale(.65);margin-bottom:-240px}}@media(max-width:760px){.builder-top{align-items:flex-start;flex-direction:column}.builder-actions{width:100%;flex-wrap:wrap}.builder-shell{grid-template-columns:1fr}.palette-grid{grid-template-columns:1fr 1fr}.preview-stage{padding:10px}.preview-stage.desktop .preview-canvas{transform:scale(.31);margin-bottom:-510px}.preview-stage.mobile .preview-canvas{transform:scale(.72);margin-bottom:-180px}}
      `}</style>
    </div>
  );
}

type BlockEditorProps = {
  block: LandingBlock;
  patch: (patch: Partial<LandingBlock>) => void;
  patchContent: (patch: Record<string, any>) => void;
  patchStyle: (patch: Record<string, any>) => void;
  duplicate: () => void;
  remove: () => void;
  upload: (file: File) => void;
  subiendo: boolean;
};

function BlockEditor({ block, patch, patchContent, patchStyle, duplicate, remove, upload, subiendo }: BlockEditorProps) {
  const items = block.content?.items || [];
  const setItem = (i: number, p: any) => { const next = [...items]; next[i] = { ...next[i], ...p }; patchContent({ items: next }); };
  const removeItem = (i: number) => patchContent({ items: items.filter((_: any, idx: number)=>idx!==i) });
  const addItem = () => {
    if (block.type === 'pricing') patchContent({ items: [...items, { name: 'Nuevo plan', price: '$—', features: 'Característica 1\nCaracterística 2' }] });
    else if (block.type === 'hours') patchContent({ items: [...items, { day: 'Nuevo día', hours: '9:00 - 18:00' }] });
    else if (block.type === 'testimonials') patchContent({ items: [...items, { text: 'Escribe aquí la opinión.', author: 'Cliente' }] });
    else patchContent({ items: [...items, { title: 'Nuevo elemento', text: 'Descripción del elemento.' }] });
  };
  return <div className="editor-block">
    <div className="editor-head"><div><span>{BLOCK_LABELS[block.type].icon}</span><div><b>{BLOCK_LABELS[block.type].name}</b><small>Editando esta sección</small></div></div><label className="switch"><input type="checkbox" checked={block.visible!==false} onChange={(e)=>patch({visible:e.target.checked})}/><i/></label></div>
    <Field label="Título de la sección"><input className="panel-input" value={block.title||''} onChange={(e)=>patch({title:e.target.value})}/></Field>
    {'subtitle' in block && <Field label="Texto secundario"><textarea className="panel-textarea" value={block.subtitle||''} onChange={(e)=>patch({subtitle:e.target.value})}/></Field>}
    {block.type !== 'hero' && block.type !== 'cta' && <div className="menu-box"><label className="check"><input type="checkbox" checked={block.showInMenu!==false} onChange={(e)=>patch({showInMenu:e.target.checked})}/> Mostrar en el menú</label>{block.showInMenu!==false && <input className="panel-input" value={block.menuLabel||''} onChange={(e)=>patch({menuLabel:e.target.value})} placeholder="Texto del menú"/>}</div>}

    {(block.type==='hero'||block.type==='about') && <><Field label="Imagen"><label className="upload-mini"><input type="file" accept="image/*" onChange={(e)=>e.target.files?.[0]&&upload(e.target.files[0])}/><span>{subiendo?'Subiendo...':'↑ Subir imagen'}</span></label>{block.content?.imageUrl && <input className="panel-input" value={block.content.imageUrl} onChange={(e)=>patchContent({imageUrl:e.target.value})}/>}</Field>{block.type==='hero' && <><Field label="Texto del botón"><input className="panel-input" value={block.content?.buttonText||''} onChange={(e)=>patchContent({buttonText:e.target.value})}/></Field><Field label="Diseño"><select className="panel-select" value={block.variant||'split'} onChange={(e)=>patch({variant:e.target.value})}><option value="split">Texto + imagen</option><option value="centered">Centrado</option></select></Field></>}{block.type==='about' && <><Field label="Contenido"><textarea className="panel-textarea" value={block.content?.text||''} onChange={(e)=>patchContent({text:e.target.value})}/></Field><Field label="Diseño"><select className="panel-select" value={block.variant||'image-left'} onChange={(e)=>patch({variant:e.target.value})}><option value="image-left">Imagen izquierda</option><option value="image-right">Imagen derecha</option></select></Field></>}</>}

    {(block.type==='features'||block.type==='services') && <ItemEditor items={items} onSet={setItem} onRemove={removeItem} onAdd={addItem} fields="cards" />}
    {block.type==='pricing' && <ItemEditor items={items} onSet={setItem} onRemove={removeItem} onAdd={addItem} fields="pricing" />}
    {block.type==='hours' && <ItemEditor items={items} onSet={setItem} onRemove={removeItem} onAdd={addItem} fields="hours" />}
    {block.type==='testimonials' && <ItemEditor items={items} onSet={setItem} onRemove={removeItem} onAdd={addItem} fields="testimonials" />}
    {(block.type==='contact'||block.type==='cta') && <Field label="Texto del botón"><input className="panel-input" value={block.content?.buttonText||''} onChange={(e)=>patchContent({buttonText:e.target.value})}/></Field>}

    <div className="style-box"><b>Estilo de este bloque</b><Field label="Alineación"><select className="panel-select" value={block.style?.align||'left'} onChange={(e)=>patchStyle({align:e.target.value})}><option value="left">Izquierda</option><option value="center">Centro</option></select></Field><div className="color-grid"><Field label="Fondo"><input type="color" value={block.style?.background||'#ffffff'} onChange={(e)=>patchStyle({background:e.target.value})}/></Field><Field label="Texto"><input type="color" value={block.style?.textColor||'#1f2937'} onChange={(e)=>patchStyle({textColor:e.target.value})}/></Field><Field label="Acento"><input type="color" value={block.style?.accentColor||'#2563eb'} onChange={(e)=>patchStyle({accentColor:e.target.value})}/></Field></div></div>
    <div className="editor-actions"><button onClick={duplicate}>Duplicar</button><button className="danger" onClick={remove}>Eliminar</button></div>
    <style jsx>{`
      .editor-block{padding-bottom:18px;border-bottom:1px solid #ece7de}.editor-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}.editor-head>div{display:flex;align-items:center;gap:9px}.editor-head>div>span{width:34px;height:34px;display:grid;place-items:center;border-radius:9px;background:#fff0eb;color:var(--color-accent);font-weight:800}.editor-head>div>div{display:grid;gap:2px}.editor-head b{font-size:12px}.editor-head small{color:#999ca5;font-size:8px}.switch input{display:none}.switch i{display:block;width:34px;height:19px;border-radius:99px;background:#ccc;position:relative;cursor:pointer}.switch i:after{content:'';position:absolute;top:3px;left:3px;width:13px;height:13px;border-radius:50%;background:#fff;transition:.15s}.switch input:checked+i{background:#1f9b70}.switch input:checked+i:after{left:18px}.menu-box{display:grid;gap:8px;padding:11px;margin-bottom:14px;border-radius:9px;background:#f7f4ee}.check{display:flex;gap:7px;align-items:center;font-size:9px;font-weight:700}.upload-mini{display:block}.upload-mini input{display:none}.upload-mini span{display:grid;place-items:center;min-height:41px;border:1px dashed #c9c2b6;border-radius:8px;background:#faf9f6;font-size:9px;font-weight:800;cursor:pointer}.style-box{margin-top:16px;padding-top:14px;border-top:1px solid #ece7de}.style-box>b{font-size:10px}.color-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}.color-grid input{width:100%;height:36px;padding:2px;border:1px solid #ddd7cd;border-radius:8px;background:#fff}.editor-actions{display:flex;gap:7px;margin-top:15px}.editor-actions button{padding:7px 9px;border:1px solid #d8d2c7;border-radius:7px;background:#fff;font-size:8px;font-weight:800;cursor:pointer}.editor-actions .danger{color:#bd4634;background:#fff5f2;border-color:#efd0c9}
    `}</style>
  </div>;
}

function ItemEditor({ items, onSet, onRemove, onAdd, fields }: any) {
  return <div className="items-editor"><div className="items-title"><b>Elementos</b><button onClick={onAdd}>＋ Agregar</button></div>{items.map((item:any,i:number)=><div className="item-card" key={i}><div className="item-top"><span>#{i+1}</span><button onClick={()=>onRemove(i)}>×</button></div>{fields==='cards'&&<><input className="panel-input" value={item.title||''} onChange={(e)=>onSet(i,{title:e.target.value})} placeholder="Título"/><textarea className="panel-textarea" value={item.text||''} onChange={(e)=>onSet(i,{text:e.target.value})} placeholder="Descripción"/></>}{fields==='pricing'&&<><div className="two"><input className="panel-input" value={item.name||''} onChange={(e)=>onSet(i,{name:e.target.value})} placeholder="Nombre"/><input className="panel-input" value={item.price||''} onChange={(e)=>onSet(i,{price:e.target.value})} placeholder="$0"/></div><textarea className="panel-textarea" value={item.features||''} onChange={(e)=>onSet(i,{features:e.target.value})} placeholder="Una característica por línea"/><label className="featured"><input type="checkbox" checked={!!item.featured} onChange={(e)=>onSet(i,{featured:e.target.checked})}/> Destacar</label></>}{fields==='hours'&&<div className="two"><input className="panel-input" value={item.day||''} onChange={(e)=>onSet(i,{day:e.target.value})} placeholder="Día"/><input className="panel-input" value={item.hours||''} onChange={(e)=>onSet(i,{hours:e.target.value})} placeholder="Horario"/></div>}{fields==='testimonials'&&<><textarea className="panel-textarea" value={item.text||''} onChange={(e)=>onSet(i,{text:e.target.value})} placeholder="Testimonio"/><input className="panel-input" value={item.author||''} onChange={(e)=>onSet(i,{author:e.target.value})} placeholder="Autor"/></>}</div>)}<style jsx>{`.items-editor{margin-top:14px}.items-title{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}.items-title b{font-size:10px}.items-title button{border:0;background:none;color:var(--color-accent);font-size:8px;font-weight:800;cursor:pointer}.item-card{display:grid;gap:6px;padding:10px;margin-bottom:7px;border:1px solid #e7e1d8;border-radius:9px;background:#faf9f6}.item-top{display:flex;justify-content:space-between}.item-top span{color:#a0a2aa;font-size:8px}.item-top button{border:0;background:none;color:#c24835;cursor:pointer}.two{display:grid;grid-template-columns:1fr 1fr;gap:6px}.featured{display:flex;gap:6px;align-items:center;font-size:8px}`}</style></div>;
}

type GlobalEditorProps = {
  config: any;
  patchConfig: (patch: Record<string, any>) => void;
  uploadLogo: (file: File) => void;
  subiendo: boolean;
};

function GlobalEditor({ config, patchConfig, uploadLogo, subiendo }: GlobalEditorProps) {
  const theme = config.theme || {};
  const patchTheme = (p:any)=>patchConfig({theme:{...theme,...p}});
  return <div className="global-editor"><div className="global-title"><span>◉</span><div><b>Diseño global</b><small>Se aplica a toda la página</small></div></div><Field label="Nombre del sitio"><input className="panel-input" value={config.siteName||''} onChange={(e)=>patchConfig({siteName:e.target.value})}/></Field><Field label="Logo"><label className="upload-logo"><input type="file" accept="image/*" onChange={(e)=>e.target.files?.[0]&&uploadLogo(e.target.files[0])}/><span>{subiendo?'Subiendo...':'↑ Subir logo'}</span></label></Field><div className="theme-colors"><Field label="Principal"><input type="color" value={theme.primary||'#2563eb'} onChange={(e)=>patchTheme({primary:e.target.value})}/></Field><Field label="Fondo"><input type="color" value={theme.background||'#f5f7fb'} onChange={(e)=>patchTheme({background:e.target.value})}/></Field><Field label="Texto"><input type="color" value={theme.text||'#1f2937'} onChange={(e)=>patchTheme({text:e.target.value})}/></Field></div><Field label="Estilo de esquinas"><select className="panel-select" value={theme.radius||'rounded'} onChange={(e)=>patchTheme({radius:e.target.value})}><option value="soft">Suaves</option><option value="rounded">Redondeadas</option><option value="pill">Muy redondeadas</option></select></Field><Field label="Tipografía de títulos"><select className="panel-select" value={theme.headingFont||'Arial, Helvetica, sans-serif'} onChange={(e)=>patchTheme({headingFont:e.target.value})}><option value="Arial, Helvetica, sans-serif">Moderna</option><option value="Georgia, Times, serif">Editorial</option><option value="Trebuchet MS, Arial, sans-serif">Amigable</option><option value="Courier New, monospace">Monoespaciada</option></select></Field><Field label="Tipografía de texto"><select className="panel-select" value={theme.bodyFont||'Arial, Helvetica, sans-serif'} onChange={(e)=>patchTheme({bodyFont:e.target.value})}><option value="Arial, Helvetica, sans-serif">Arial</option><option value="Georgia, Times, serif">Georgia</option><option value="Trebuchet MS, Arial, sans-serif">Trebuchet</option><option value="Courier New, monospace">Courier</option></select></Field><Field label="Botones"><select className="panel-select" value={theme.buttonStyle||'pill'} onChange={(e)=>patchTheme({buttonStyle:e.target.value})}><option value="solid">Sólidos</option><option value="outline">Contorno</option><option value="pill">Píldora</option></select></Field><Field label="Texto del botón del menú"><input className="panel-input" value={config.header?.ctaLabel||'WhatsApp'} onChange={(e)=>patchConfig({header:{...(config.header||{}),ctaLabel:e.target.value}})}/></Field><style jsx>{`.global-editor{margin-top:18px;padding-top:18px;border-top:1px solid #e7e1d8}.global-title{display:flex;align-items:center;gap:9px;margin-bottom:15px}.global-title>span{width:34px;height:34px;display:grid;place-items:center;border-radius:9px;background:#edf0f8}.global-title>div{display:grid;gap:2px}.global-title b{font-size:11px}.global-title small{color:#999ca5;font-size:8px}.upload-logo input{display:none}.upload-logo span{display:grid;place-items:center;min-height:40px;border:1px dashed #ccc5ba;border-radius:8px;background:#faf9f6;font-size:8px;font-weight:800;cursor:pointer}.theme-colors{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.theme-colors input{width:100%;height:35px;padding:2px;border:1px solid #ddd8ce;border-radius:7px;background:#fff}`}</style></div>;
}

function Field({label,children}:{label:string;children:React.ReactNode}) { return <label className="editor-field"><span>{label}</span>{children}<style jsx>{`.editor-field{display:grid;gap:5px;margin-bottom:11px}.editor-field>span{color:#555968;font-size:8px;font-weight:800}`}</style></label>; }

function StoreEditor({ negocio, config, setConfig, guardar, guardando, uploadImage, subiendo }: any) {
  return <div><div className="panel-page-head"><div><div className="panel-eyebrow">Personalización</div><h1>Diseño de tu tienda</h1><p>Edita la identidad y datos principales de {negocio.nombre}.</p></div><button className="panel-button" onClick={guardar} disabled={guardando}>{guardando?'Guardando...':'Guardar cambios'}</button></div><div className="panel-card" style={{maxWidth:720,padding:24}}><Field label="Nombre visible"><input className="panel-input" value={config.titulo||''} onChange={(e)=>setConfig({...config,titulo:e.target.value})}/></Field><Field label="Descripción"><textarea className="panel-textarea" value={config.descripcion||''} onChange={(e)=>setConfig({...config,descripcion:e.target.value})}/></Field><Field label="Color principal"><input type="color" value={config.colorPrimario||'#111111'} onChange={(e)=>setConfig({...config,colorPrimario:e.target.value})} style={{width:70,height:42}}/></Field><Field label="WhatsApp"><input className="panel-input" value={config.whatsapp||''} onChange={(e)=>setConfig({...config,whatsapp:e.target.value.replace(/[^0-9]/g,'')})}/></Field><Field label="Logo"><label style={{display:'inline-flex'}} className="panel-button secondary"><input style={{display:'none'}} type="file" accept="image/*" onChange={(e)=>e.target.files?.[0]&&uploadImage(e.target.files[0],'logo')}/>{subiendo?'Subiendo...':'Subir logo'}</label></Field></div></div>;
}
