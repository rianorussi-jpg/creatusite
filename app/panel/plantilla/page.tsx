'use client';

import { useMiNegocio } from '@/lib/useMiNegocio';

const OPCIONES_POR_TIPO: Record<string, { id: string; nombre: string; descripcion: string; preview: string }[]> = {
  tienda: [
    { id: 'tienda-moderno', nombre: 'Paso a paso', descripcion: 'Flujo guiado para comprar paso a paso.', preview: 'store-clean' },
    { id: 'tienda-directo', nombre: 'Menú directo', descripcion: 'Scroll continuo con carrito flotante.', preview: 'store-color' }
  ],
  menu: [
    { id: 'menu-informativo', nombre: 'Carta visual', descripcion: 'Tarjetas limpias con foto, descripción y precio.', preview: 'menu-list' },
    { id: 'menu-galeria', nombre: 'Galería', descripcion: 'Imágenes grandes y protagonistas en una cuadrícula editorial.', preview: 'menu-gallery' }
  ],
  landing: [
    { id: 'landing-negocio', nombre: 'Impulso', descripcion: 'Moderna, dinámica y enfocada en convertir.', preview: 'landing-one' },
    { id: 'landing-profesionista', nombre: 'Esencia', descripcion: 'Elegante, limpia y editorial.', preview: 'landing-two' }
  ]
};

function Preview({ type }: { type: string }) {
  if (type === 'menu-gallery') return <div className="pv gallery"><div className="gallery-hero"><small>MENÚ</small><b>TU MARCA</b></div><div className="pills"><i/><i/><i/></div><div className="tiles"><span className="big"/><span/><span/></div></div>;
  if (type === 'menu-list') return <div className="pv list"><div className="list-head"><b>TU MENÚ</b><i/></div><div className="pills"><i/><i/><i/></div><div className="rows"><span/><span/></div></div>;
  if (type === 'store-color') return <div className="pv store color"><header/><div className="pills"><i/><i/><i/></div><div className="rows"><span/><span/></div></div>;
  if (type === 'store-clean') return <div className="pv store"><header/><div className="rows"><span/><span/></div></div>;
  return <div className="pv landing"><header/><div className="landing-copy"><b/><i/><button/></div><div className="landing-cards"><span/><span/><span/></div></div>;
}

export default function PlantillaPanel() {
  const { negocio, setNegocio, cargando, supabase } = useMiNegocio();
  const OPCIONES = negocio ? OPCIONES_POR_TIPO[negocio.tipo] || [] : [];

  async function elegir(id: string) {
    if (!negocio) return;
    await supabase.from('businesses').update({ template_id: id }).eq('id', negocio.id);
    setNegocio({ ...negocio, template_id: id });
  }

  if (cargando || !negocio) return <p>Cargando...</p>;
  const currentId = negocio.tipo === 'menu' && !['menu-informativo','menu-galeria'].includes(negocio.template_id) ? 'menu-informativo' : negocio.template_id;

  return (
    <div>
      <div className="panel-page-head"><div><div className="panel-eyebrow">Apariencia</div><h1>Plantilla</h1><p>Elige cómo se presenta tu contenido. Tus datos e imágenes se conservan al cambiar.</p></div></div>
      <div className="templates">
        {OPCIONES.map((op) => {
          const active = currentId === op.id;
          return <button key={op.id} onClick={() => elegir(op.id)} className={`template-card ${active ? 'active' : ''}`}><Preview type={op.preview}/><div className="copy"><div><strong>{op.nombre}</strong>{active && <span>Activa</span>}</div><p>{op.descripcion}</p></div></button>;
        })}
      </div>
      <style jsx>{`
        .templates{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,360px));gap:18px}.template-card{padding:0;border:1px solid #ded9d0;border-radius:16px;overflow:hidden;background:#fff;text-align:left;cursor:pointer;transition:.2s ease;box-shadow:0 8px 25px rgba(20,20,20,.035)}.template-card:hover{transform:translateY(-2px);border-color:#bdb5a9}.template-card.active{border:2px solid var(--color-accent);box-shadow:0 12px 30px rgba(20,20,20,.08)}.copy{padding:15px 16px 17px}.copy>div{display:flex;justify-content:space-between;align-items:center;gap:10px}.copy strong{font-size:13px}.copy span{padding:4px 7px;border-radius:999px;background:#e6f5ed;color:#167652;font-size:8px;font-weight:800}.copy p{margin:5px 0 0;color:var(--color-ink-soft);font-size:10px;line-height:1.45}.pv{height:205px;padding:13px;background:#f3f2ee}.gallery{background:#ebeae5}.gallery-hero{height:72px;padding:10px;border-radius:10px;background:linear-gradient(135deg,#222,#666);color:#fff;display:flex;flex-direction:column;justify-content:flex-end}.gallery-hero small{font-size:6px;letter-spacing:2px}.gallery-hero b{font-size:16px;line-height:1}.pills{display:flex;gap:5px;margin:9px 0}.pills i{width:43px;height:13px;border-radius:999px;background:#fff;border:1px solid #ddd}.pills i:first-child{background:#222}.tiles{display:grid;grid-template-columns:1.25fr 1fr;grid-template-rows:45px 45px;gap:6px}.tiles span{display:block;border-radius:8px;background:#c7b8aa}.tiles .big{grid-row:span 2;background:#b49d87}.list-head{height:48px;border-radius:9px;background:#fff;display:grid;place-content:center;justify-items:center;gap:5px}.list-head b{font-size:10px}.list-head i{width:60px;height:4px;border-radius:99px;background:#ddd}.rows{display:grid;gap:7px}.rows span{height:47px;border-radius:9px;background:#fff;border:1px solid #ddd}.store header{height:47px;border-radius:9px;background:#37694c;margin-bottom:10px}.store.color header{background:#c52429}.landing header{height:28px;background:#fff;border-radius:8px}.landing-copy{height:90px;display:grid;place-content:center;justify-items:center;gap:7px}.landing-copy b{width:110px;height:10px;border-radius:99px;background:#222}.landing-copy i{width:75px;height:5px;border-radius:99px;background:#ccc}.landing-copy button{width:48px;height:16px;border:0;border-radius:99px;background:#555}.landing-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.landing-cards span{height:44px;background:#fff;border-radius:8px}
      `}</style>
    </div>
  );
}
