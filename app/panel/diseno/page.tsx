'use client';

import { useEffect, useState } from 'react';
import { useMiNegocio } from '@/lib/useMiNegocio';

type Beneficio = { titulo: string; texto: string };
type Testimonio = { texto: string; autor: string };
type Especialidad = { titulo: string; texto: string };
type Horario = { dia: string; horario: string };
type Plan = { nombre: string; precio: string; features: string; destacado?: boolean };

export default function DisenoPanel() {
  const { negocio, cargando, supabase } = useMiNegocio();
  const [config, setConfig] = useState<any>(null);
  const [guardando, setGuardando] = useState(false);
  const [subiendoLogo, setSubiendoLogo] = useState(false);

  useEffect(() => {
    if (negocio) setConfig(negocio.config);
  }, [negocio]);

  async function subirLogo(file: File) {
    if (!negocio) return;
    setSubiendoLogo(true);
    const ext = file.name.split('.').pop();
    const path = `${negocio.id}/logo.${ext}`;
    const { error } = await supabase.storage.from('creatusitio-assets').upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from('creatusitio-assets').getPublicUrl(path);
      // cache-busting para que se vea el logo nuevo de inmediato
      setConfig({ ...config, logoUrl: `${data.publicUrl}?v=${Date.now()}` });
    }
    setSubiendoLogo(false);
  }

  async function guardar() {
    if (!negocio) return;
    setGuardando(true);
    await supabase.from('businesses').update({ config }).eq('id', negocio.id);
    setGuardando(false);
  }

  // ---- helpers genéricos para editar arrays dentro de config ----
  function addItem<T>(campo: string, item: T) {
    setConfig({ ...config, [campo]: [...(config[campo] || []), item] });
  }
  function updateItem(campo: string, idx: number, patch: any) {
    const items = [...(config[campo] || [])];
    items[idx] = { ...items[idx], ...patch };
    setConfig({ ...config, [campo]: items });
  }
  function removeItem(campo: string, idx: number) {
    const items = [...(config[campo] || [])];
    items.splice(idx, 1);
    setConfig({ ...config, [campo]: items });
  }

  if (cargando || !config) return <p>Cargando...</p>;

  const templateId: string = negocio?.template_id || '';
  const esLandingNegocio = templateId === 'landing-negocio';
  const esLandingProfesionista = templateId === 'landing-profesionista';
  const esLanding = esLandingNegocio || esLandingProfesionista;

  const beneficios: Beneficio[] = config.beneficios || [];
  const testimonios: Testimonio[] = config.testimonios || [];
  const especialidades: Especialidad[] = config.especialidades || [];
  const horarios: Horario[] = config.horarios || [];
  const planes: Plan[] = config.planes || [];

  return (
    <div>
      <div className="panel-page-head">
        <div><div className="panel-eyebrow">Personalización</div><h1>Diseño y contenido</h1><p>Edita la identidad, información y secciones de tu página.</p></div>
        <button onClick={guardar} disabled={guardando} className="panel-button">{guardando ? 'Guardando...' : 'Guardar cambios'}</button>
      </div>

      <div className="design-layout">
        <aside className="design-index panel-card">
          <strong>Secciones</strong>
          <a href="#identidad">Identidad</a>
          <a href="#contacto">Contacto</a>
          {esLanding && <a href="#beneficios">Beneficios</a>}
          {esLandingNegocio && <a href="#planes">Planes</a>}
          {esLandingProfesionista && <a href="#especialidades">Especialidades</a>}
          {esLandingProfesionista && <a href="#horarios">Horarios</a>}
          {esLanding && <a href="#testimonios">Testimonios</a>}
        </aside>

        <div className="design-sections">
          <section id="identidad" className="panel-card design-card">
            <SectionHead icon="✦" title="Identidad visual" text="Define cómo se presenta tu negocio." />
            <div className="logo-row">
              <div className="logo-preview">{config.logoUrl ? <img src={config.logoUrl} alt="Logo" /> : <span>{(config.titulo || negocio?.nombre || 'N').charAt(0)}</span>}</div>
              <div><label className="panel-button secondary upload-button"><input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && subirLogo(e.target.files[0])} disabled={subiendoLogo} />{subiendoLogo ? 'Subiendo...' : 'Cambiar logo'}</label>{config.logoUrl && <button className="remove-link" onClick={() => setConfig({ ...config, logoUrl: null })}>Quitar logo</button>}<p>Si no subes uno, se mostrará el nombre como texto.</p></div>
            </div>
            <div className="panel-field"><label>Título principal</label><input className="panel-input" value={config.titulo || ''} onChange={(e) => setConfig({ ...config, titulo: e.target.value })} /></div>
            <div className="panel-field"><label>Descripción</label><textarea className="panel-textarea" value={config.descripcion || ''} onChange={(e) => setConfig({ ...config, descripcion: e.target.value })} /></div>
            <div className="panel-field"><label>Color principal</label><div className="color-field"><input type="color" value={config.colorPrimario || '#111111'} onChange={(e) => setConfig({ ...config, colorPrimario: e.target.value })} /><span>{config.colorPrimario || '#111111'}</span></div></div>
          </section>

          <section id="contacto" className="panel-card design-card">
            <SectionHead icon="@" title="Contacto y redes" text="Información con la que tus clientes podrán encontrarte." />
            <div className="two-cols"><div className="panel-field"><label>WhatsApp</label><input className="panel-input" value={config.whatsapp || ''} onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })} placeholder="524421234567" /></div><div className="panel-field"><label>Instagram</label><input className="panel-input" value={config.instagram || ''} onChange={(e) => setConfig({ ...config, instagram: e.target.value })} placeholder="@tunegocio" /></div></div>
            {esLandingProfesionista && <div className="two-cols"><div className="panel-field"><label>Teléfono</label><input className="panel-input" value={config.telefono || ''} onChange={(e) => setConfig({ ...config, telefono: e.target.value })} /></div><div className="panel-field"><label>Horario corto</label><input className="panel-input" value={config.horarioTexto || ''} onChange={(e) => setConfig({ ...config, horarioTexto: e.target.value })} /></div></div>}
          </section>

          {esLanding && <ListSection id="beneficios" title="Beneficios" text="Tarjetas de “¿Por qué elegirnos?”" onAdd={() => addItem('beneficios',{titulo:'',texto:''})} addText="Agregar beneficio">{beneficios.map((b,i)=><EditCard key={i} onRemove={()=>removeItem('beneficios',i)}><input className="panel-input" placeholder="Título" value={b.titulo} onChange={(e)=>updateItem('beneficios',i,{titulo:e.target.value})}/><input className="panel-input" placeholder="Texto" value={b.texto} onChange={(e)=>updateItem('beneficios',i,{texto:e.target.value})}/></EditCard>)}</ListSection>}
          {esLandingNegocio && <ListSection id="planes" title="Planes" text="Precios o paquetes de servicio." onAdd={()=>addItem('planes',{nombre:'',precio:'',features:'',destacado:false})} addText="Agregar plan">{planes.map((p,i)=><EditCard key={i} onRemove={()=>removeItem('planes',i)}><div className="two-cols"><input className="panel-input" placeholder="Nombre" value={p.nombre} onChange={(e)=>updateItem('planes',i,{nombre:e.target.value})}/><input className="panel-input" placeholder="Precio" value={p.precio} onChange={(e)=>updateItem('planes',i,{precio:e.target.value})}/></div><textarea className="panel-textarea" placeholder="Una característica por línea" value={p.features} onChange={(e)=>updateItem('planes',i,{features:e.target.value})}/><label className="check-row"><input type="checkbox" checked={!!p.destacado} onChange={(e)=>updateItem('planes',i,{destacado:e.target.checked})}/> Destacar este plan</label></EditCard>)}</ListSection>}
          {esLandingProfesionista && <ListSection id="especialidades" title="Especialidades" text="Servicios o áreas que atiendes." onAdd={()=>addItem('especialidades',{titulo:'',texto:''})} addText="Agregar especialidad">{especialidades.map((e,i)=><EditCard key={i} onRemove={()=>removeItem('especialidades',i)}><input className="panel-input" placeholder="Título" value={e.titulo} onChange={(ev)=>updateItem('especialidades',i,{titulo:ev.target.value})}/><input className="panel-input" placeholder="Texto" value={e.texto} onChange={(ev)=>updateItem('especialidades',i,{texto:ev.target.value})}/></EditCard>)}</ListSection>}
          {esLandingProfesionista && <ListSection id="horarios" title="Horarios" text="Horarios que aparecerán en tu página." onAdd={()=>addItem('horarios',{dia:'',horario:''})} addText="Agregar horario">{horarios.map((h,i)=><EditCard key={i} onRemove={()=>removeItem('horarios',i)}><div className="two-cols"><input className="panel-input" placeholder="Día" value={h.dia} onChange={(e)=>updateItem('horarios',i,{dia:e.target.value})}/><input className="panel-input" placeholder="Horario" value={h.horario} onChange={(e)=>updateItem('horarios',i,{horario:e.target.value})}/></div></EditCard>)}</ListSection>}
          {esLanding && <ListSection id="testimonios" title="Testimonios" text="Opiniones de clientes o pacientes." onAdd={()=>addItem('testimonios',{texto:'',autor:''})} addText="Agregar testimonio">{testimonios.map((t,i)=><EditCard key={i} onRemove={()=>removeItem('testimonios',i)}><textarea className="panel-textarea" placeholder="Testimonio" value={t.texto} onChange={(e)=>updateItem('testimonios',i,{texto:e.target.value})}/><input className="panel-input" placeholder="Autor" value={t.autor} onChange={(e)=>updateItem('testimonios',i,{autor:e.target.value})}/></EditCard>)}</ListSection>}
        </div>
      </div>

      <style jsx>{`
        .design-layout{display:grid;grid-template-columns:190px minmax(0,720px);gap:22px;align-items:start}.design-index{position:sticky;top:98px;display:grid;padding:15px}.design-index strong{padding:8px;font-size:11px}.design-index a{padding:8px;border-radius:7px;color:var(--color-ink-soft);font-size:10px;text-decoration:none}.design-index a:hover{background:#f4f1eb;color:var(--color-ink)}.design-sections{display:grid;gap:16px}.design-card{padding:24px;scroll-margin-top:95px}.logo-row{display:flex;align-items:center;gap:16px;margin:20px 0}.logo-preview{width:68px;height:68px;display:grid;place-items:center;overflow:hidden;border:1px solid #ded8cd;border-radius:15px;background:#f4f1eb;color:var(--color-accent);font:700 27px var(--font-display)}.logo-preview img{width:100%;height:100%;object-fit:cover}.upload-button input{display:none}.remove-link{margin-left:9px;border:0;background:none;color:#c34a36;font-size:10px;cursor:pointer}.logo-row p{margin-top:7px;color:var(--color-ink-soft);font-size:9px}.two-cols{display:grid;grid-template-columns:1fr 1fr;gap:12px}.color-field{display:flex;align-items:center;gap:10px}.color-field input{width:48px;height:38px;padding:2px;border:1px solid #dcd7cc;border-radius:8px;background:#fff}.color-field span{font:500 11px var(--font-mono)}.check-row{display:flex;align-items:center;gap:7px;color:var(--color-ink-soft);font-size:10px}
        @media(max-width:900px){.design-layout{grid-template-columns:1fr}.design-index{display:none}}@media(max-width:620px){.two-cols{grid-template-columns:1fr}}
      `}</style>
    </div>
  );
}

function SectionHead({icon,title,text}:{icon:string;title:string;text:string}){return <div className="section-head"><span>{icon}</span><div><h2>{title}</h2><p>{text}</p></div><style jsx>{`.section-head{display:flex;align-items:center;gap:11px;padding-bottom:17px;border-bottom:1px solid #ebe6dd}.section-head>span{width:35px;height:35px;display:grid;place-items:center;border-radius:9px;background:#fff0eb;color:var(--color-accent);font-weight:700}.section-head h2{font-size:16px}.section-head p{margin-top:3px;color:var(--color-ink-soft);font-size:10px}`}</style></div>}

function ListSection({id,title,text,onAdd,addText,children}:{id:string;title:string;text:string;onAdd:()=>void;addText:string;children:React.ReactNode}){return <section id={id} className="panel-card list-section"><SectionHead icon="+" title={title} text={text}/><div className="items">{children}</div><button className="add-item" onClick={onAdd}>＋ {addText}</button><style jsx>{`.list-section{padding:24px;scroll-margin-top:95px}.items{display:grid;gap:10px;margin-top:16px}.add-item{width:100%;min-height:42px;margin-top:12px;border:1px dashed #cfc8bb;border-radius:9px;background:#faf9f6;color:var(--color-ink);font-size:10px;font-weight:700;cursor:pointer}`}</style></section>}

function EditCard({children,onRemove}:{children:React.ReactNode;onRemove:()=>void}){return <div className="edit-card">{children}<button onClick={onRemove}>Eliminar</button><style jsx>{`.edit-card{position:relative;display:grid;gap:8px;padding:14px;border:1px solid #e5e0d7;border-radius:10px;background:#faf9f6}.edit-card>button{justify-self:start;border:0;background:none;color:#bd4634;font-size:9px;cursor:pointer}`}</style></div>}
