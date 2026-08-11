'use client';

import { useState } from 'react';

export type LandingPreset = 'impulso' | 'esencia';
export type LandingBlockType = 'hero' | 'features' | 'about' | 'services' | 'pricing' | 'hours' | 'testimonials' | 'contact' | 'cta';

export type LandingBlock = {
  id: string;
  type: LandingBlockType;
  title: string;
  subtitle?: string;
  visible?: boolean;
  showInMenu?: boolean;
  menuLabel?: string;
  variant?: string;
  style?: {
    background?: string;
    textColor?: string;
    accentColor?: string;
    align?: 'left' | 'center';
  };
  content?: any;
};

export type LandingTheme = {
  primary: string;
  background: string;
  surface: string;
  text: string;
  headingFont: string;
  bodyFont: string;
  radius: 'soft' | 'rounded' | 'pill';
  buttonStyle: 'solid' | 'outline' | 'pill';
};

const DEFAULT_THEME: Record<LandingPreset, LandingTheme> = {
  impulso: {
    primary: '#2563eb', background: '#f5f7fb', surface: '#ffffff', text: '#1f2937',
    headingFont: 'Arial, Helvetica, sans-serif', bodyFont: 'Arial, Helvetica, sans-serif', radius: 'rounded', buttonStyle: 'pill'
  },
  esencia: {
    primary: '#0d5c63', background: '#fafafa', surface: '#ffffff', text: '#263238',
    headingFont: 'Georgia, Times, serif', bodyFont: 'Arial, Helvetica, sans-serif', radius: 'soft', buttonStyle: 'solid'
  }
};

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function defaultLandingTheme(preset: LandingPreset): LandingTheme {
  return { ...DEFAULT_THEME[preset] };
}

export function createDefaultBlock(type: LandingBlockType, preset: LandingPreset): LandingBlock {
  const primary = DEFAULT_THEME[preset].primary;
  const base = { id: uid(type), type, visible: true, showInMenu: type !== 'hero' && type !== 'cta', style: { accentColor: primary } } as LandingBlock;
  switch (type) {
    case 'hero': return { ...base, title: 'Haz que tu negocio destaque', subtitle: 'Cuenta en una frase clara qué haces y por qué deberían elegirte.', showInMenu: false, variant: 'split', content: { buttonText: 'Contáctanos', imageUrl: '' } };
    case 'features': return { ...base, title: '¿Por qué elegirnos?', menuLabel: 'Beneficios', variant: 'cards', content: { items: [{ title: 'Rápido', text: 'Respuesta ágil y atención clara.' }, { title: 'Fácil', text: 'Una experiencia sencilla para tus clientes.' }, { title: 'Confiable', text: 'Servicio profesional y cercano.' }] } };
    case 'about': return { ...base, title: 'Nuestra historia', menuLabel: 'Nosotros', variant: 'image-left', content: { text: 'Cuenta aquí quién eres, qué hace diferente a tu negocio y qué pueden esperar tus clientes.', imageUrl: '' } };
    case 'services': return { ...base, title: 'Lo que hacemos', menuLabel: 'Servicios', variant: 'cards', content: { items: [{ title: 'Servicio principal', text: 'Describe tu servicio.' }, { title: 'Otra solución', text: 'Explica qué incluye.' }, { title: 'Atención personalizada', text: 'Cuenta cómo ayudas a tus clientes.' }] } };
    case 'pricing': return { ...base, title: 'Opciones para ti', menuLabel: 'Precios', variant: 'cards', content: { items: [{ name: 'Esencial', price: '$—', features: 'Servicio 1\nServicio 2\nServicio 3' }, { name: 'Recomendado', price: '$—', features: 'Todo lo anterior\nServicio 4\nServicio 5', featured: true }, { name: 'Premium', price: '$—', features: 'Todo incluido\nAtención prioritaria' }] } };
    case 'hours': return { ...base, title: 'Horarios', menuLabel: 'Horarios', variant: 'list', content: { items: [{ day: 'Lunes - Viernes', hours: '9:00 - 18:00' }, { day: 'Sábado', hours: '9:00 - 14:00' }, { day: 'Domingo', hours: 'Cerrado' }] } };
    case 'testimonials': return { ...base, title: 'Lo que dicen de nosotros', menuLabel: 'Opiniones', variant: 'cards', content: { items: [{ text: 'Excelente servicio, muy recomendado.', author: 'Cliente satisfecho' }, { text: 'Atención de calidad y buen trato.', author: 'Cliente satisfecho' }] } };
    case 'contact': return { ...base, title: 'Hablemos', subtitle: 'Déjanos tus datos o escríbenos por WhatsApp.', menuLabel: 'Contacto', variant: 'form', content: { buttonText: 'Enviar mensaje' } };
    case 'cta': return { ...base, title: '¿Listo para empezar?', subtitle: 'Da el siguiente paso hoy.', showInMenu: false, variant: 'banner', content: { buttonText: 'Escríbenos por WhatsApp' } };
  }
}

export function legacyBlocks(config: any, preset: LandingPreset): LandingBlock[] {
  if (Array.isArray(config?.blocks) && config.blocks.length) return config.blocks;
  const nombre = config?.titulo || 'Tu negocio';
  const descripcion = config?.descripcion || 'Presenta tu negocio con una página clara, atractiva y enfocada en convertir visitas en clientes.';
  const blocks: LandingBlock[] = [
    { ...createDefaultBlock('hero', preset), id: 'hero', title: nombre, subtitle: descripcion, content: { buttonText: 'Contáctanos', imageUrl: config?.heroImage || '' } }
  ];

  if (preset === 'impulso') {
    blocks.push({ ...createDefaultBlock('features', preset), id: 'beneficios', content: { items: (config?.beneficios || []).map((x: any) => ({ title: x.titulo, text: x.texto })) } });
    blocks.push({ ...createDefaultBlock('about', preset), id: 'nosotros', content: { text: descripcion, imageUrl: config?.aboutImage || '' } });
    blocks.push({ ...createDefaultBlock('pricing', preset), id: 'planes', content: { items: (config?.planes || []).map((x: any) => ({ name: x.nombre, price: x.precio, features: x.features, featured: x.destacado })) } });
  } else {
    blocks.push({ ...createDefaultBlock('services', preset), id: 'especialidades', content: { items: (config?.especialidades || []).map((x: any) => ({ title: x.titulo, text: x.texto })) } });
    blocks.push({ ...createDefaultBlock('about', preset), id: 'nosotros', content: { text: descripcion, imageUrl: config?.aboutImage || '' } });
    blocks.push({ ...createDefaultBlock('features', preset), id: 'beneficios', content: { items: (config?.beneficios || []).map((x: any) => ({ title: x.titulo, text: x.texto })) } });
    blocks.push({ ...createDefaultBlock('hours', preset), id: 'horarios', content: { items: (config?.horarios || []).map((x: any) => ({ day: x.dia, hours: x.horario })) } });
  }
  blocks.push({ ...createDefaultBlock('testimonials', preset), id: 'testimonios', content: { items: (config?.testimonios || []).map((x: any) => ({ text: x.texto, author: x.autor })) } });
  blocks.push({ ...createDefaultBlock('contact', preset), id: 'contacto' });
  return blocks;
}

function waLink(numero: string | undefined, mensaje: string) {
  if (!numero) return '#';
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

export default function LandingFlexible({ business, preset }: { business: any; preset: LandingPreset }) {
  const config = business?.config || {};
  const theme: LandingTheme = { ...DEFAULT_THEME[preset], ...(config.theme || {}), primary: config.theme?.primary || config.colorPrimario || DEFAULT_THEME[preset].primary };
  const blocks = legacyBlocks(config, preset).filter((b) => b.visible !== false);
  const whatsapp: string | undefined = config.whatsapp;
  const instagram: string | undefined = config.instagram;
  const logoUrl: string | undefined = config.logoUrl;
  const siteName = config.siteName || config.titulo || business?.nombre || 'Mi sitio';
  const menuItems = blocks.filter((b) => b.showInMenu !== false && b.type !== 'hero' && b.type !== 'cta');
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', mensaje: '' });
  const [enviado, setEnviado] = useState(false);

  const radius = theme.radius === 'pill' ? 999 : theme.radius === 'rounded' ? 18 : 10;
  const sectionBase = { padding: '76px 0' } as React.CSSProperties;
  const container = { width: '90%', maxWidth: 1160, margin: '0 auto' } as React.CSSProperties;

  const buttonStyle = (accent = theme.primary): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 46, padding: '0 24px',
    borderRadius: theme.buttonStyle === 'pill' ? 999 : radius,
    border: theme.buttonStyle === 'outline' ? `2px solid ${accent}` : 'none',
    background: theme.buttonStyle === 'outline' ? 'transparent' : accent,
    color: theme.buttonStyle === 'outline' ? accent : '#fff', textDecoration: 'none', fontWeight: 800
  });

  function sendForm() {
    const mensaje = `Hola, soy ${form.nombre || '(sin nombre)'}.\n${form.mensaje || ''}\nCorreo: ${form.email || '-'}\nTeléfono: ${form.telefono || '-'}`;
    if (whatsapp) window.open(waLink(whatsapp, mensaje), '_blank');
    setEnviado(true);
  }

  return (
    <div className="flex-landing" style={{ minHeight: '100%', background: theme.background, color: theme.text, fontFamily: theme.bodyFont }}>
      <header style={{ position: config.header?.sticky === false ? 'relative' : 'sticky', top: 0, zIndex: 30, background: 'rgba(255,255,255,.96)', borderBottom: '1px solid rgba(15,23,42,.08)', backdropFilter: 'blur(12px)' }}>
        <div style={{ ...container, minHeight: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          {logoUrl ? <img src={logoUrl} alt={siteName} style={{ maxHeight: 42, maxWidth: 170, objectFit: 'contain' }} /> : <strong style={{ fontFamily: theme.headingFont, fontSize: 22 }}>{siteName}</strong>}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {menuItems.map((block) => <a key={block.id} href={`#${block.id}`} style={{ color: theme.text, textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>{block.menuLabel || block.title}</a>)}
            {whatsapp && <a href={waLink(whatsapp, `Hola, quiero información sobre ${siteName}`)} target="_blank" style={{ ...buttonStyle(theme.primary), minHeight: 38, padding: '0 16px', fontSize: 13 }}>{config.header?.ctaLabel || 'WhatsApp'}</a>}
          </nav>
        </div>
      </header>

      {blocks.map((block) => {
        const accent = block.style?.accentColor || theme.primary;
        const background = block.style?.background || (block.type === 'hero' ? accent : block.type === 'about' || block.type === 'testimonials' ? theme.surface : 'transparent');
        const textColor = block.style?.textColor || (block.type === 'hero' ? '#fff' : theme.text);
        const align = block.style?.align || 'left';
        const content = block.content || {};

        if (block.type === 'hero') return (
          <section key={block.id} id={block.id} style={{ ...sectionBase, background, color: textColor, overflow: 'hidden' }}>
            <div className={`flex-hero-grid ${block.variant === 'centered' ? 'centered' : ''}`} style={{ ...container, display: 'grid', gridTemplateColumns: block.variant === 'centered' ? '1fr' : 'minmax(0,1.1fr) minmax(280px,.9fr)', gap: 42, alignItems: 'center', textAlign: block.variant === 'centered' ? 'center' : align }}>
              <div style={{ maxWidth: block.variant === 'centered' ? 780 : 650, margin: block.variant === 'centered' ? '0 auto' : undefined }}>
                <h1 style={{ fontFamily: theme.headingFont, fontSize: 'clamp(38px,6vw,70px)', lineHeight: 1.02, letterSpacing: '-.04em', margin: 0 }}>{block.title}</h1>
                {block.subtitle && <p style={{ fontSize: 18, lineHeight: 1.65, opacity: .88, margin: '20px 0 28px' }}>{block.subtitle}</p>}
                <a href={waLink(whatsapp, `Hola, quiero más información sobre ${siteName}`)} target="_blank" style={{ ...buttonStyle('#fff'), background: '#fff', color: accent }}>{content.buttonText || 'Contáctanos'}</a>
              </div>
              {block.variant !== 'centered' && <div style={{ minHeight: 330, borderRadius: radius + 8, background: content.imageUrl ? `url(${content.imageUrl}) center/cover` : 'linear-gradient(145deg,rgba(255,255,255,.34),rgba(255,255,255,.08))', border: '1px solid rgba(255,255,255,.25)', boxShadow: '0 30px 80px rgba(0,0,0,.18)' }} />}
            </div>
          </section>
        );

        if (block.type === 'features' || block.type === 'services') {
          const items = content.items || [];
          return <section key={block.id} id={block.id} style={{ ...sectionBase, background, color: textColor }}><div style={container}><SectionTitle block={block} theme={theme} /><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 18 }}>{items.map((item: any, i: number) => <article key={i} style={{ padding: 26, borderRadius: radius, background: theme.surface, color: theme.text, border: '1px solid rgba(15,23,42,.08)', boxShadow: '0 12px 34px rgba(15,23,42,.06)' }}><div style={{ width: 38, height: 38, borderRadius: 12, display: 'grid', placeItems: 'center', background: `${accent}18`, color: accent, fontWeight: 900, marginBottom: 16 }}>{String(i + 1).padStart(2,'0')}</div><h3 style={{ fontFamily: theme.headingFont, fontSize: 20, margin: '0 0 9px' }}>{item.title}</h3><p style={{ margin: 0, opacity: .72, lineHeight: 1.6 }}>{item.text}</p></article>)}</div></div></section>;
        }

        if (block.type === 'about') return <section key={block.id} id={block.id} style={{ ...sectionBase, background, color: textColor }}><div className="flex-about-grid" style={{ ...container, display: 'grid', gridTemplateColumns: block.variant === 'image-right' ? '1fr .9fr' : '.9fr 1fr', gap: 42, alignItems: 'center' }}>{block.variant !== 'image-right' && <div style={{ minHeight: 330, borderRadius: radius + 6, background: content.imageUrl ? `url(${content.imageUrl}) center/cover` : `${accent}16`, border: `1px solid ${accent}24` }} />}<div><SectionTitle block={block} theme={theme} compact /><p style={{ fontSize: 17, lineHeight: 1.75, opacity: .76 }}>{content.text}</p></div>{block.variant === 'image-right' && <div style={{ minHeight: 330, borderRadius: radius + 6, background: content.imageUrl ? `url(${content.imageUrl}) center/cover` : `${accent}16`, border: `1px solid ${accent}24` }} />}</div></section>;

        if (block.type === 'pricing') {
          const items = content.items || [];
          return <section key={block.id} id={block.id} style={{ ...sectionBase, background, color: textColor }}><div style={container}><SectionTitle block={block} theme={theme} /><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(245px,1fr))', gap: 18 }}>{items.map((item: any, i: number) => <article key={i} style={{ padding: 30, borderRadius: radius, background: item.featured ? accent : theme.surface, color: item.featured ? '#fff' : theme.text, border: item.featured ? 'none' : '1px solid rgba(15,23,42,.08)', transform: item.featured ? 'translateY(-8px)' : 'none' }}><strong>{item.name}</strong><div style={{ fontFamily: theme.headingFont, fontSize: 38, margin: '18px 0' }}>{item.price}</div><div style={{ display: 'grid', gap: 10, opacity: .86 }}>{String(item.features || '').split('\n').filter(Boolean).map((x, j) => <span key={j}>✓ {x}</span>)}</div><a href={waLink(whatsapp, `Hola, me interesa ${item.name}`)} target="_blank" style={{ ...buttonStyle(item.featured ? '#fff' : accent), marginTop: 24, ...(item.featured ? { color: accent, background: '#fff' } : {}) }}>Elegir</a></article>)}</div></div></section>;
        }

        if (block.type === 'hours') {
          const items = content.items || [];
          return <section key={block.id} id={block.id} style={{ ...sectionBase, background, color: textColor }}><div style={{ ...container, maxWidth: 760 }}><SectionTitle block={block} theme={theme} /> <div style={{ overflow: 'hidden', borderRadius: radius, background: theme.surface, border: '1px solid rgba(15,23,42,.08)' }}>{items.map((item: any, i: number) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 20, padding: '17px 20px', borderBottom: i === items.length - 1 ? 'none' : '1px solid rgba(15,23,42,.07)' }}><strong>{item.day}</strong><span style={{ opacity: .68 }}>{item.hours}</span></div>)}</div></div></section>;
        }

        if (block.type === 'testimonials') {
          const items = content.items || [];
          return <section key={block.id} id={block.id} style={{ ...sectionBase, background, color: textColor }}><div style={container}><SectionTitle block={block} theme={theme} /><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 18 }}>{items.map((item: any, i: number) => <blockquote key={i} style={{ margin: 0, padding: 26, borderRadius: radius, background: theme.background, color: theme.text, border: '1px solid rgba(15,23,42,.07)' }}><p style={{ fontSize: 17, lineHeight: 1.7, margin: '0 0 18px' }}>“{item.text}”</p><strong style={{ color: accent }}>{item.author}</strong></blockquote>)}</div></div></section>;
        }

        if (block.type === 'cta') return <section key={block.id} id={block.id} style={{ padding: '36px 0', background, color: textColor }}><div style={{ ...container, padding: '42px', borderRadius: radius + 8, background: accent, color: '#fff', textAlign: 'center' }}><h2 style={{ fontFamily: theme.headingFont, fontSize: 38, margin: 0 }}>{block.title}</h2>{block.subtitle && <p style={{ opacity: .84, fontSize: 17 }}>{block.subtitle}</p>}<a href={waLink(whatsapp, `Hola, quiero información sobre ${siteName}`)} target="_blank" style={{ ...buttonStyle('#fff'), background: '#fff', color: accent, marginTop: 10 }}>{content.buttonText || 'Escríbenos'}</a></div></section>;

        if (block.type === 'contact') return <section key={block.id} id={block.id} style={{ ...sectionBase, background, color: textColor }}><div style={{ ...container, maxWidth: 760 }}><SectionTitle block={block} theme={theme} />{enviado ? <div style={{ padding: 28, borderRadius: radius, background: `${accent}12`, color: accent, fontWeight: 800, textAlign: 'center' }}>¡Gracias! Tu mensaje está listo para enviarse por WhatsApp.</div> : <div style={{ display: 'grid', gap: 12 }}><input placeholder="Nombre" value={form.nombre} onChange={(e)=>setForm({...form,nombre:e.target.value})} style={inputStyle(radius)} /><div className="flex-contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}><input placeholder="Correo" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} style={inputStyle(radius)} /><input placeholder="Teléfono" value={form.telefono} onChange={(e)=>setForm({...form,telefono:e.target.value})} style={inputStyle(radius)} /></div><textarea placeholder="¿Cómo podemos ayudarte?" value={form.mensaje} onChange={(e)=>setForm({...form,mensaje:e.target.value})} style={{ ...inputStyle(radius), minHeight: 130, resize: 'vertical' }} /><button onClick={sendForm} style={{ ...buttonStyle(accent), cursor: 'pointer' }}>{content.buttonText || 'Enviar mensaje'}</button></div>}</div></section>;

        return null;
      })}

      <style jsx global>{`@media(max-width:760px){.flex-landing .flex-hero-grid:not(.centered),.flex-landing .flex-about-grid{grid-template-columns:1fr!important}.flex-landing .flex-contact-grid{grid-template-columns:1fr!important}.flex-landing nav{gap:10px!important}.flex-landing header>div{padding:10px 0;min-height:auto!important}.flex-landing section{padding-top:54px!important;padding-bottom:54px!important}}`}</style>
      <footer style={{ background: '#111827', color: '#fff', padding: '38px 0' }}><div style={{ ...container, display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}><strong style={{ fontFamily: theme.headingFont }}>{siteName}</strong><div style={{ opacity: .7, fontSize: 13 }}>© {new Date().getFullYear()} {siteName}</div>{instagram && <a href={`https://instagram.com/${instagram.replace('@','')}`} target="_blank" style={{ color: '#fff' }}>@{instagram.replace('@','')}</a>}</div></footer>
    </div>
  );
}

function SectionTitle({ block, theme, compact = false }: { block: LandingBlock; theme: LandingTheme; compact?: boolean }) {
  return <div style={{ maxWidth: 720, margin: compact ? '0 0 18px' : '0 auto 34px', textAlign: compact ? (block.style?.align || 'left') : 'center' }}><h2 style={{ fontFamily: theme.headingFont, fontSize: compact ? 36 : 40, lineHeight: 1.1, margin: 0 }}>{block.title}</h2>{block.subtitle && <p style={{ margin: '11px 0 0', opacity: .68, lineHeight: 1.65 }}>{block.subtitle}</p>}</div>;
}

function inputStyle(radius: number): React.CSSProperties {
  return { width: '100%', minHeight: 48, padding: '12px 14px', border: '1px solid rgba(15,23,42,.14)', borderRadius: Math.min(radius, 16), background: '#fff', fontSize: 15, boxSizing: 'border-box', outline: 'none' };
}
