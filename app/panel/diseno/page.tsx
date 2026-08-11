'use client';

import { useEffect, useState } from 'react';
import { useMiNegocio } from '@/lib/useMiNegocio';

type Beneficio = { titulo: string; texto: string };
type Testimonio = { texto: string; autor: string };
type Especialidad = { titulo: string; texto: string };
type Horario = { dia: string; horario: string };
type Plan = { nombre: string; precio: string; features: string; destacado?: boolean };
type MenuItem = { label: string; href: string; visible: boolean };

const MENU_NEGOCIO: MenuItem[] = [
  { label: 'Beneficios', href: '#beneficios', visible: true },
  { label: 'Nosotros', href: '#nosotros', visible: true },
  { label: 'Planes', href: '#planes', visible: true },
  { label: 'Contacto', href: '#contacto', visible: true }
];

const MENU_PROFESIONISTA: MenuItem[] = [
  { label: 'Especialidades', href: '#especialidades', visible: true },
  { label: 'Nosotros', href: '#nosotros', visible: true },
  { label: 'Horarios', href: '#horarios', visible: true },
  { label: 'Contacto', href: '#contacto', visible: true }
];

export default function DisenoPanel() {
  const { negocio, cargando, supabase, setNegocio } = useMiNegocio();
  const [config, setConfig] = useState<any>(null);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [subiendoLogo, setSubiendoLogo] = useState(false);

  useEffect(() => {
    if (!negocio) return;
    const templateId = negocio.template_id || '';
    const esNegocio = templateId === 'landing-negocio';
    const esProfesionista = templateId === 'landing-profesionista';
    const menuDefault = esNegocio ? MENU_NEGOCIO : esProfesionista ? MENU_PROFESIONISTA : [];
    setConfig({ ...negocio.config, menuItems: negocio.config?.menuItems?.length ? negocio.config.menuItems : menuDefault });
    setGuardado(false);
  }, [negocio?.id, negocio?.template_id]);

  async function subirLogo(file: File) {
    if (!negocio || !config) return;
    setSubiendoLogo(true);
    const ext = file.name.split('.').pop();
    const path = `${negocio.id}/logo.${ext}`;
    const { error } = await supabase.storage.from('creatusitio-assets').upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from('creatusitio-assets').getPublicUrl(path);
      setConfig({ ...config, logoUrl: `${data.publicUrl}?v=${Date.now()}` });
    }
    setSubiendoLogo(false);
  }

  async function guardar() {
    if (!negocio || !config) return;
    setGuardando(true);
    setGuardado(false);
    const { error } = await supabase.from('businesses').update({ config }).eq('id', negocio.id);
    if (!error) {
      setNegocio({ ...negocio, config });
      setGuardado(true);
      window.setTimeout(() => setGuardado(false), 2200);
    }
    setGuardando(false);
  }

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

  if (cargando || !negocio || !config) return <div className="panel-card panel-empty">Cargando personalización...</div>;

  const templateId: string = negocio.template_id || '';
  const esLandingNegocio = templateId === 'landing-negocio';
  const esLandingProfesionista = templateId === 'landing-profesionista';
  const esLanding = negocio.tipo === 'landing';
  const beneficios: Beneficio[] = config.beneficios || [];
  const testimonios: Testimonio[] = config.testimonios || [];
  const especialidades: Especialidad[] = config.especialidades || [];
  const horarios: Horario[] = config.horarios || [];
  const planes: Plan[] = config.planes || [];
  const menuItems: MenuItem[] = config.menuItems || [];

  const destinos = esLandingNegocio
    ? [['#beneficios','Beneficios'],['#nosotros','Nosotros'],['#planes','Planes'],['#contacto','Contacto']]
    : [['#especialidades','Especialidades'],['#nosotros','Nosotros'],['#horarios','Horarios'],['#contacto','Contacto']];

  return (
    <div>
      <div className="panel-page-head design-page-head">
        <div>
          <div className="panel-eyebrow">Personalización</div>
          <h1>Diseño y contenido</h1>
          <p>Configura <strong>{negocio.nombre}</strong> por bloques. Los cambios no se publican hasta que presiones guardar.</p>
        </div>
        <div className="save-zone">
          {guardado && <span className="saved-pill">✓ Cambios guardados</span>}
          <button onClick={guardar} disabled={guardando} className="panel-button">{guardando ? 'Guardando...' : 'Guardar cambios'}</button>
        </div>
      </div>

      <div className="design-layout">
        <aside className="design-index panel-card">
          <div className="index-title"><span>✦</span><div><strong>Editar página</strong><small>{esLanding ? 'Landing page' : 'Tienda'}</small></div></div>
          <a href="#identidad"><span>01</span> Identidad</a>
          {esLanding && <a href="#menu"><span>02</span> Menú del sitio</a>}
          <a href="#contacto"><span>{esLanding ? '03' : '02'}</span> Contacto</a>
          {esLanding && <a href="#contenido"><span>04</span> Contenido</a>}
        </aside>

        <div className="design-sections">
          <section id="identidad" className="panel-card design-card">
            <SectionHead icon="✦" title="Identidad visual" text="Lo primero que verán tus clientes al entrar." />
            <div className="helper-box"><b>Consejo</b><span>Usa un título corto, una descripción clara y un color que represente tu marca.</span></div>
            <div className="logo-row">
              <div className="logo-preview">{config.logoUrl ? <img src={config.logoUrl} alt="Logo" /> : <span>{(config.titulo || negocio.nombre || 'N').charAt(0)}</span>}</div>
              <div>
                <label className="panel-button secondary upload-button"><input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && subirLogo(e.target.files[0])} disabled={subiendoLogo} />{subiendoLogo ? 'Subiendo...' : 'Subir / cambiar logo'}</label>
                {config.logoUrl && <button className="remove-link" onClick={() => setConfig({ ...config, logoUrl: null })}>Quitar logo</button>}
                <p>Recomendado: PNG o WebP con fondo transparente.</p>
              </div>
            </div>
            <div className="panel-field"><label>Nombre o título principal</label><input className="panel-input" value={config.titulo || ''} onChange={(e) => setConfig({ ...config, titulo: e.target.value })} placeholder={negocio.nombre} /></div>
            <div className="panel-field"><label>Descripción principal</label><textarea className="panel-textarea" value={config.descripcion || ''} onChange={(e) => setConfig({ ...config, descripcion: e.target.value })} placeholder="Explica en una o dos frases qué haces y por qué elegirte." /></div>
            <div className="panel-field"><label>Color principal</label><div className="color-field"><input type="color" value={config.colorPrimario || '#111111'} onChange={(e) => setConfig({ ...config, colorPrimario: e.target.value })} /><span>{config.colorPrimario || '#111111'}</span><div className="color-sample" style={{ background: config.colorPrimario || '#111111' }}>Botón de ejemplo</div></div></div>
          </section>

          {esLanding && (
            <section id="menu" className="panel-card design-card">
              <SectionHead icon="≡" title="Menú del sitio" text="Decide qué enlaces aparecen arriba de tu landing page." />
              <div className="helper-box"><b>Cómo funciona</b><span>Puedes cambiar el nombre visible, elegir a qué sección lleva y ocultar enlaces que no necesites.</span></div>
              <div className="menu-editor">
                {menuItems.map((item, i) => (
                  <div className="menu-row" key={`${item.href}-${i}`}>
                    <div className="drag-mark">≡</div>
                    <div className="panel-field"><label>Texto del menú</label><input className="panel-input" value={item.label} onChange={(e)=>updateItem('menuItems',i,{label:e.target.value})}/></div>
                    <div className="panel-field"><label>Lleva a</label><select className="panel-select" value={item.href} onChange={(e)=>updateItem('menuItems',i,{href:e.target.value})}>{destinos.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div>
                    <label className="visibility-toggle"><input type="checkbox" checked={item.visible !== false} onChange={(e)=>updateItem('menuItems',i,{visible:e.target.checked})}/><span/><b>{item.visible !== false ? 'Visible' : 'Oculto'}</b></label>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section id="contacto" className="panel-card design-card">
            <SectionHead icon="@" title="Contacto y redes" text="Datos que utilizará tu página para que los clientes puedan contactarte." />
            <div className="two-cols"><div className="panel-field"><label>WhatsApp</label><input className="panel-input" value={config.whatsapp || ''} onChange={(e) => setConfig({ ...config, whatsapp: e.target.value.replace(/[^0-9]/g,'') })} placeholder="524421234567" /><small>Incluye lada y código de país, sin + ni espacios.</small></div><div className="panel-field"><label>Instagram</label><input className="panel-input" value={config.instagram || ''} onChange={(e) => setConfig({ ...config, instagram: e.target.value })} placeholder="@tunegocio" /></div></div>
            {esLandingProfesionista && <div className="two-cols"><div className="panel-field"><label>Teléfono</label><input className="panel-input" value={config.telefono || ''} onChange={(e) => setConfig({ ...config, telefono: e.target.value })} /></div><div className="panel-field"><label>Horario resumido</label><input className="panel-input" value={config.horarioTexto || ''} onChange={(e) => setConfig({ ...config, horarioTexto: e.target.value })} placeholder="Lunes a Viernes | 9:00 - 18:00" /></div></div>}
          </section>

          {esLanding && <div id="contenido" className="content-divider"><span>Contenido de la página</span><p>Edita las tarjetas y secciones que aparecen debajo de tu presentación.</p></div>}
          {esLanding && <ListSection title="Beneficios" text="Razones principales para elegir tu negocio." onAdd={() => addItem('beneficios',{titulo:'',texto:''})} addText="Agregar beneficio">{beneficios.map((b,i)=><EditCard key={i} onRemove={()=>removeItem('beneficios',i)}><div className="two-cols"><div className="panel-field compact"><label>Título</label><input className="panel-input" value={b.titulo} onChange={(e)=>updateItem('beneficios',i,{titulo:e.target.value})}/></div><div className="panel-field compact"><label>Descripción</label><input className="panel-input" value={b.texto} onChange={(e)=>updateItem('beneficios',i,{texto:e.target.value})}/></div></div></EditCard>)}</ListSection>}
          {esLandingNegocio && <ListSection title="Planes" text="Precios, paquetes o niveles de servicio." onAdd={()=>addItem('planes',{nombre:'',precio:'',features:'',destacado:false})} addText="Agregar plan">{planes.map((p,i)=><EditCard key={i} onRemove={()=>removeItem('planes',i)}><div className="two-cols"><div className="panel-field compact"><label>Nombre</label><input className="panel-input" value={p.nombre} onChange={(e)=>updateItem('planes',i,{nombre:e.target.value})}/></div><div className="panel-field compact"><label>Precio</label><input className="panel-input" value={p.precio} onChange={(e)=>updateItem('planes',i,{precio:e.target.value})}/></div></div><div className="panel-field compact"><label>Características (una por línea)</label><textarea className="panel-textarea" value={p.features} onChange={(e)=>updateItem('planes',i,{features:e.target.value})}/></div><label className="check-row"><input type="checkbox" checked={!!p.destacado} onChange={(e)=>updateItem('planes',i,{destacado:e.target.checked})}/> Marcar como plan recomendado</label></EditCard>)}</ListSection>}
          {esLandingProfesionista && <ListSection title="Especialidades" text="Servicios, tratamientos o áreas profesionales." onAdd={()=>addItem('especialidades',{titulo:'',texto:''})} addText="Agregar especialidad">{especialidades.map((item,i)=><EditCard key={i} onRemove={()=>removeItem('especialidades',i)}><div className="two-cols"><div className="panel-field compact"><label>Nombre</label><input className="panel-input" value={item.titulo} onChange={(e)=>updateItem('especialidades',i,{titulo:e.target.value})}/></div><div className="panel-field compact"><label>Descripción</label><input className="panel-input" value={item.texto} onChange={(e)=>updateItem('especialidades',i,{texto:e.target.value})}/></div></div></EditCard>)}</ListSection>}
          {esLandingProfesionista && <ListSection title="Horarios" text="Horarios detallados de atención." onAdd={()=>addItem('horarios',{dia:'',horario:''})} addText="Agregar horario">{horarios.map((h,i)=><EditCard key={i} onRemove={()=>removeItem('horarios',i)}><div className="two-cols"><div className="panel-field compact"><label>Día</label><input className="panel-input" value={h.dia} onChange={(e)=>updateItem('horarios',i,{dia:e.target.value})}/></div><div className="panel-field compact"><label>Horario</label><input className="panel-input" value={h.horario} onChange={(e)=>updateItem('horarios',i,{horario:e.target.value})}/></div></div></EditCard>)}</ListSection>}
          {esLanding && <ListSection title="Testimonios" text="Opiniones de clientes o pacientes." onAdd={()=>addItem('testimonios',{texto:'',autor:''})} addText="Agregar testimonio">{testimonios.map((t,i)=><EditCard key={i} onRemove={()=>removeItem('testimonios',i)}><div className="panel-field compact"><label>Testimonio</label><textarea className="panel-textarea" value={t.texto} onChange={(e)=>updateItem('testimonios',i,{texto:e.target.value})}/></div><div className="panel-field compact"><label>Nombre / autor</label><input className="panel-input" value={t.autor} onChange={(e)=>updateItem('testimonios',i,{autor:e.target.value})}/></div></EditCard>)}</ListSection>}
        </div>
      </div>

      <style jsx>{`
        .design-page-head{align-items:center}.save-zone{display:flex;align-items:center;gap:10px}.saved-pill{padding:7px 10px;border-radius:999px;background:#e4f3eb;color:#177455;font-size:10px;font-weight:700}
        .design-layout{display:grid;grid-template-columns:210px minmax(0,780px);gap:24px;align-items:start}.design-index{position:sticky;top:98px;display:grid;padding:12px}.index-title{display:flex;align-items:center;gap:9px;padding:8px 8px 14px;margin-bottom:5px;border-bottom:1px solid #eee8df}.index-title>span{width:30px;height:30px;display:grid;place-items:center;border-radius:8px;background:#fff0eb;color:var(--color-accent)}.index-title div{display:grid}.index-title strong{font-size:11px}.index-title small{margin-top:2px;color:var(--color-ink-soft);font-size:9px}.design-index a{display:flex;align-items:center;gap:9px;padding:10px 8px;border-radius:8px;color:var(--color-ink-soft);font-size:10px;text-decoration:none}.design-index a span{font:500 8px var(--font-mono);color:#aaa}.design-index a:hover{background:#f4f1eb;color:var(--color-ink)}
        .design-sections{display:grid;gap:16px}.design-card{padding:25px;scroll-margin-top:95px}.helper-box{display:flex;gap:8px;margin:18px 0;padding:11px 12px;border-radius:9px;background:#f8f6f1;color:var(--color-ink-soft);font-size:9px;line-height:1.5}.helper-box b{color:var(--color-ink)}.logo-row{display:flex;align-items:center;gap:16px;margin:18px 0 22px}.logo-preview{width:72px;height:72px;display:grid;place-items:center;overflow:hidden;border:1px solid #ded8cd;border-radius:16px;background:#f4f1eb;color:var(--color-accent);font:700 28px var(--font-display)}.logo-preview img{width:100%;height:100%;object-fit:cover}.upload-button input{display:none}.remove-link{margin-left:9px;border:0;background:none;color:#c34a36;font-size:10px;cursor:pointer}.logo-row p{margin-top:7px;color:var(--color-ink-soft);font-size:9px}.two-cols{display:grid;grid-template-columns:1fr 1fr;gap:12px}.panel-field small{margin-top:-2px;color:var(--color-ink-soft);font-size:8px}.panel-field.compact{margin-bottom:0}.color-field{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.color-field input{width:48px;height:40px;padding:2px;border:1px solid #dcd7cc;border-radius:8px;background:#fff}.color-field>span{font:500 11px var(--font-mono)}.color-sample{margin-left:auto;padding:9px 12px;border-radius:8px;color:#fff;font-size:9px;font-weight:700}
        .menu-editor{display:grid;gap:9px;margin-top:16px}.menu-row{display:grid;grid-template-columns:26px 1fr 1fr 92px;gap:10px;align-items:end;padding:12px;border:1px solid #e7e1d8;border-radius:11px;background:#faf9f6}.drag-mark{align-self:center;color:#aaa}.visibility-toggle{height:43px;display:flex;align-items:center;gap:7px;cursor:pointer}.visibility-toggle input{display:none}.visibility-toggle span{position:relative;width:31px;height:18px;border-radius:99px;background:#d8d4cc}.visibility-toggle span:after{content:'';position:absolute;top:3px;left:3px;width:12px;height:12px;border-radius:50%;background:#fff;transition:.15s}.visibility-toggle input:checked+span{background:#1c9a6d}.visibility-toggle input:checked+span:after{left:16px}.visibility-toggle b{font-size:8px;color:var(--color-ink-soft)}
        .content-divider{padding:18px 4px 2px}.content-divider span{font:700 11px var(--font-mono);letter-spacing:.08em;text-transform:uppercase}.content-divider p{margin-top:5px;color:var(--color-ink-soft);font-size:10px}.check-row{display:flex;align-items:center;gap:7px;color:var(--color-ink-soft);font-size:10px}
        @media(max-width:950px){.design-layout{grid-template-columns:1fr}.design-index{display:none}}@media(max-width:700px){.two-cols,.menu-row{grid-template-columns:1fr}.drag-mark{display:none}.design-card{padding:18px}.save-zone{width:100%;justify-content:space-between}.design-page-head{align-items:flex-start}.color-sample{margin-left:0}}
      `}</style>
    </div>
  );
}

function SectionHead({icon,title,text}:{icon:string;title:string;text:string}){return <div className="section-head"><span>{icon}</span><div><h2>{title}</h2><p>{text}</p></div><style jsx>{`.section-head{display:flex;align-items:center;gap:11px;padding-bottom:17px;border-bottom:1px solid #ebe6dd}.section-head>span{width:36px;height:36px;display:grid;place-items:center;border-radius:9px;background:#fff0eb;color:var(--color-accent);font-weight:700}.section-head h2{font-size:16px}.section-head p{margin-top:3px;color:var(--color-ink-soft);font-size:10px;line-height:1.4}`}</style></div>}

function ListSection({title,text,onAdd,addText,children}:{title:string;text:string;onAdd:()=>void;addText:string;children:React.ReactNode}){return <section className="panel-card list-section"><SectionHead icon="+" title={title} text={text}/><div className="items">{children}</div><button className="add-item" onClick={onAdd}>＋ {addText}</button><style jsx>{`.list-section{padding:24px;scroll-margin-top:95px}.items{display:grid;gap:10px;margin-top:16px}.add-item{width:100%;min-height:42px;margin-top:12px;border:1px dashed #cfc8bb;border-radius:9px;background:#faf9f6;color:var(--color-ink);font-size:10px;font-weight:700;cursor:pointer}.add-item:hover{border-color:var(--color-accent);color:var(--color-accent)}`}</style></section>}

function EditCard({children,onRemove}:{children:React.ReactNode;onRemove:()=>void}){return <div className="edit-card">{children}<button onClick={onRemove}>Eliminar</button><style jsx>{`.edit-card{position:relative;display:grid;gap:8px;padding:14px;border:1px solid #e5e0d7;border-radius:10px;background:#faf9f6}.edit-card>button{justify-self:start;border:0;background:none;color:#bd4634;font-size:9px;cursor:pointer}`}</style></div>}
