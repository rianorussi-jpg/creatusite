'use client';

import { useState, type CSSProperties, type FocusEvent, type MouseEvent } from 'react';

export type LandingPreset = 'impulso' | 'esencia' | 'lienzo';
export type LandingBlockType = 'hero' | 'features' | 'about' | 'services' | 'gallery' | 'pricing' | 'hours' | 'testimonials' | 'contact' | 'cta';

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
  content?: Record<string, any>;
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

export type LandingInlineEditor = {
  selectedId?: string;
  onSelectBlock?: (id: string) => void;
  onPatchBlock?: (id: string, patch: Partial<LandingBlock>) => void;
  onPatchContent?: (id: string, patch: Record<string, any>) => void;
};

const DEFAULT_THEME: Record<LandingPreset, LandingTheme> = {
  impulso: {
    primary: '#2563eb', background: '#f5f7fb', surface: '#ffffff', text: '#1f2937',
    headingFont: 'Arial, Helvetica, sans-serif', bodyFont: 'Arial, Helvetica, sans-serif', radius: 'rounded', buttonStyle: 'pill'
  },
  esencia: {
    primary: '#0d5c63', background: '#fafafa', surface: '#ffffff', text: '#263238',
    headingFont: 'Georgia, Times, serif', bodyFont: 'Arial, Helvetica, sans-serif', radius: 'soft', buttonStyle: 'solid'
  },
  lienzo: {
    primary: '#7c3aed', background: '#fbfbfe', surface: '#ffffff', text: '#171526',
    headingFont: 'Trebuchet MS, Arial, sans-serif', bodyFont: 'Arial, Helvetica, sans-serif', radius: 'rounded', buttonStyle: 'outline'
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
    case 'hero': return { ...base, title: 'Haz que tu negocio destaque', subtitle: 'Cuenta en una frase clara qué haces y por qué deberían elegirte.', showInMenu: false, variant: preset === 'lienzo' ? 'centered' : 'split', content: { buttonText: 'Contáctanos', imageUrl: '' } };
    case 'features': return { ...base, title: '¿Por qué elegirnos?', menuLabel: 'Beneficios', variant: 'cards', content: { items: [{ title: 'Rápido', text: 'Respuesta ágil y atención clara.' }, { title: 'Fácil', text: 'Una experiencia sencilla para tus clientes.' }, { title: 'Confiable', text: 'Servicio profesional y cercano.' }] } };
    case 'about': return { ...base, title: 'Nuestra historia', menuLabel: 'Nosotros', variant: 'image-left', content: { text: 'Cuenta aquí quién eres, qué hace diferente a tu negocio y qué pueden esperar tus clientes.', imageUrl: '' } };
    case 'services': return { ...base, title: 'Lo que hacemos', menuLabel: 'Servicios', variant: 'cards', content: { items: [{ title: 'Servicio principal', text: 'Describe tu servicio.' }, { title: 'Otra solución', text: 'Explica qué incluye.' }, { title: 'Atención personalizada', text: 'Cuenta cómo ayudas a tus clientes.' }] } };
    case 'gallery': return { ...base, title: 'Galería', menuLabel: 'Galería', variant: 'grid', content: { images: [] } };
    case 'pricing': return { ...base, title: 'Opciones para ti', menuLabel: 'Precios', variant: 'cards', content: { items: [{ name: 'Esencial', price: '$—', features: 'Servicio 1\nServicio 2\nServicio 3' }, { name: 'Recomendado', price: '$—', features: 'Todo lo anterior\nServicio 4\nServicio 5', featured: true }, { name: 'Premium', price: '$—', features: 'Todo incluido\nAtención prioritaria' }] } };
    case 'hours': return { ...base, title: 'Horarios', menuLabel: 'Horarios', variant: 'list', content: { items: [{ day: 'Lunes - Viernes', hours: '9:00 - 18:00' }, { day: 'Sábado', hours: '9:00 - 14:00' }, { day: 'Domingo', hours: 'Cerrado' }] } };
    case 'testimonials': return { ...base, title: 'Lo que dicen de nosotros', menuLabel: 'Opiniones', variant: 'cards', content: { items: [{ text: 'Excelente servicio, muy recomendado.', author: 'Cliente satisfecho' }, { text: 'Atención de calidad y buen trato.', author: 'Cliente satisfecho' }] } };
    case 'contact': return { ...base, title: 'Hablemos', subtitle: 'Déjanos tus datos o escríbenos por WhatsApp.', menuLabel: 'Contacto', variant: 'form', content: { buttonText: 'Enviar mensaje' } };
    case 'cta': return { ...base, title: '¿Listo para empezar?', subtitle: 'Da el siguiente paso hoy.', showInMenu: false, variant: 'banner', content: { buttonText: 'Escríbenos por WhatsApp' } };
  }
}

export function createPresetBlocks(preset: LandingPreset, config: any = {}): LandingBlock[] {
  const nombre = config?.titulo || config?.siteName || 'Tu negocio';
  const descripcion = config?.descripcion || 'Presenta tu negocio con una página clara, atractiva y enfocada en convertir visitas en clientes.';
  const hero = { ...createDefaultBlock('hero', preset), id: 'hero', title: nombre, subtitle: descripcion, content: { buttonText: 'Contáctanos', imageUrl: config?.heroImage || '' } } as LandingBlock;

  if (preset === 'lienzo') {
    return [
      hero,
      { ...createDefaultBlock('services', preset), id: 'servicios' },
      { ...createDefaultBlock('gallery', preset), id: 'galeria' },
      { ...createDefaultBlock('about', preset), id: 'nosotros', content: { text: descripcion, imageUrl: config?.aboutImage || '' } },
      { ...createDefaultBlock('cta', preset), id: 'accion' },
      { ...createDefaultBlock('contact', preset), id: 'contacto' }
    ];
  }

  const blocks: LandingBlock[] = [hero];
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

export function legacyBlocks(config: any, preset: LandingPreset): LandingBlock[] {
  if (Array.isArray(config?.blocks) && config.blocks.length) return config.blocks;
  return createPresetBlocks(preset, config);
}

function waLink(numero: string | undefined, mensaje: string) {
  if (!numero) return '#';
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

function editableTextProps(
  editor: LandingInlineEditor | undefined,
  blockId: string,
  onCommit: (value: string) => void
) {
  if (!editor) return {};
  return {
    contentEditable: true,
    suppressContentEditableWarning: true,
    onClick: (e: MouseEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      editor.onSelectBlock?.(blockId);
    },
    onBlur: (e: FocusEvent<HTMLElement>) => onCommit(e.currentTarget.innerText.trim())
  };
}

export default function LandingFlexible({
  business,
  preset,
  editor,
  previewMode = 'desktop'
}: {
  business: any;
  preset: LandingPreset;
  editor?: LandingInlineEditor;
  previewMode?: 'desktop' | 'mobile';
}) {
  const config = business?.config || {};
  const effectivePreset: LandingPreset = config.builderPreset === 'lienzo' ? 'lienzo' : preset;
  const theme: LandingTheme = { ...DEFAULT_THEME[effectivePreset], ...(config.theme || {}), primary: config.theme?.primary || config.colorPrimario || DEFAULT_THEME[effectivePreset].primary };
  const blocks = legacyBlocks(config, effectivePreset).filter((b) => b.visible !== false);
  const whatsapp: string | undefined = config.whatsapp;
  const instagram: string | undefined = config.instagram;
  const logoUrl: string | undefined = config.logoUrl;
  const siteName = config.siteName || config.titulo || business?.nombre || 'Mi sitio';
  const menuItems = blocks.filter((b) => b.showInMenu !== false && b.type !== 'hero' && b.type !== 'cta');
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', mensaje: '' });
  const [enviado, setEnviado] = useState(false);
  const forceMobile = previewMode === 'mobile';

  const radius = theme.radius === 'pill' ? 999 : theme.radius === 'rounded' ? 18 : 10;
  const sectionBase = { padding: forceMobile ? '48px 0' : '76px 0' } as CSSProperties;
  const container = { width: forceMobile ? 'calc(100% - 32px)' : '90%', maxWidth: 1160, margin: '0 auto' } as CSSProperties;

  const buttonStyle = (accent = theme.primary): CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 46, padding: '0 24px',
    borderRadius: theme.buttonStyle === 'pill' ? 999 : radius,
    border: theme.buttonStyle === 'outline' ? `2px solid ${accent}` : 'none',
    background: theme.buttonStyle === 'outline' ? 'transparent' : accent,
    color: theme.buttonStyle === 'outline' ? accent : '#fff', textDecoration: 'none', fontWeight: 800
  });

  function sendForm() {
    if (editor) return;
    const mensaje = `Hola, soy ${form.nombre || '(sin nombre)'}.\n${form.mensaje || ''}\nCorreo: ${form.email || '-'}\nTeléfono: ${form.telefono || '-'}`;
    if (whatsapp) window.open(waLink(whatsapp, mensaje), '_blank');
    setEnviado(true);
  }

  const preventPreviewNav = (e: MouseEvent<HTMLAnchorElement>) => {
    if (editor) e.preventDefault();
  };

  const blockFrame = (block: LandingBlock): CSSProperties => editor ? {
    position: 'relative',
    outline: editor.selectedId === block.id ? `2px solid ${theme.primary}` : '2px solid transparent',
    outlineOffset: '-2px',
    cursor: 'default'
  } : {};

  const selectBlock = (block: LandingBlock) => editor?.onSelectBlock?.(block.id);

  return (
    <div className={`flex-landing ${forceMobile ? 'force-mobile' : ''} ${editor ? 'is-editor-preview' : ''}`} style={{ minHeight: '100%', background: theme.background, color: theme.text, fontFamily: theme.bodyFont }}>
      <header className="flex-header" style={{ position: config.header?.sticky === false ? 'relative' : 'sticky', top: 0, zIndex: 30, background: 'rgba(255,255,255,.96)', borderBottom: '1px solid rgba(15,23,42,.08)', backdropFilter: 'blur(12px)' }}>
        <div style={{ ...container, minHeight: forceMobile ? 62 : 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          {logoUrl ? <img src={logoUrl} alt={siteName} style={{ maxHeight: forceMobile ? 34 : 42, maxWidth: forceMobile ? 135 : 170, objectFit: 'contain' }} /> : <strong style={{ fontFamily: theme.headingFont, fontSize: forceMobile ? 18 : 22 }}>{siteName}</strong>}
          <nav className="flex-nav" style={{ display: forceMobile ? 'none' : 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {menuItems.map((block) => <a key={block.id} href={`#${block.id}`} onClick={preventPreviewNav} style={{ color: theme.text, textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>{block.menuLabel || block.title}</a>)}
            {whatsapp && <a href={waLink(whatsapp, `Hola, quiero información sobre ${siteName}`)} onClick={preventPreviewNav} target="_blank" style={buttonStyle(theme.primary)}>{config.header?.ctaLabel || 'WhatsApp'}</a>}
          </nav>
          {forceMobile && <span className="fake-mobile-menu" aria-hidden>☰</span>}
        </div>
      </header>

      {blocks.map((block) => {
        const content = block.content || {};
        const background = block.style?.background || (block.type === 'hero' ? theme.primary : block.type === 'testimonials' ? theme.surface : theme.background);
        const textColor = block.style?.textColor || (block.type === 'hero' ? '#fff' : theme.text);
        const accent = block.style?.accentColor || theme.primary;
        const align = block.style?.align || 'left';
        const frame = blockFrame(block);

        if (block.type === 'hero') {
          const centered = block.variant === 'centered';
          return (
            <section key={block.id} id={block.id} onClick={() => selectBlock(block)} style={{ ...sectionBase, ...frame, padding: forceMobile ? '58px 0' : '92px 0', background, color: textColor, overflow: 'hidden' }}>
              <div className={`flex-hero-grid ${centered ? 'centered' : ''}`} style={{ ...container, display: 'grid', gridTemplateColumns: forceMobile || centered ? '1fr' : 'minmax(0,1.1fr) minmax(280px,.9fr)', gap: forceMobile ? 24 : 42, alignItems: 'center', textAlign: forceMobile && !centered ? 'left' : centered ? 'center' : align }}>
                <div style={{ maxWidth: centered ? 780 : 650, margin: centered ? '0 auto' : undefined }}>
                  <h1 {...editableTextProps(editor, block.id, (value) => editor?.onPatchBlock?.(block.id, { title: value }))} style={{ fontFamily: theme.headingFont, fontSize: forceMobile ? 38 : 'clamp(38px,6vw,70px)', lineHeight: 1.02, letterSpacing: '-.04em', margin: 0 }}>{block.title}</h1>
                  {block.subtitle && <p {...editableTextProps(editor, block.id, (value) => editor?.onPatchBlock?.(block.id, { subtitle: value }))} style={{ fontSize: forceMobile ? 16 : 18, lineHeight: 1.65, opacity: .88, margin: '20px 0 28px' }}>{block.subtitle}</p>}
                  <a href={waLink(whatsapp, `Hola, quiero más información sobre ${siteName}`)} onClick={preventPreviewNav} target="_blank" style={{ ...buttonStyle('#fff'), background: '#fff', color: accent }}>{content.buttonText || 'Contáctanos'}</a>
                </div>
                {!centered && <div style={{ minHeight: forceMobile ? 220 : 330, borderRadius: radius + 8, background: content.imageUrl ? `url(${content.imageUrl}) center/cover` : 'linear-gradient(145deg,rgba(255,255,255,.34),rgba(255,255,255,.08))', border: '1px solid rgba(255,255,255,.25)', boxShadow: '0 30px 80px rgba(0,0,0,.18)' }} />}
              </div>
            </section>
          );
        }

        if (block.type === 'features' || block.type === 'services') {
          const items = content.items || [];
          return <section key={block.id} id={block.id} onClick={() => selectBlock(block)} style={{ ...sectionBase, ...frame, background, color: textColor }}><div style={container}><SectionTitle block={block} theme={theme} forceMobile={forceMobile} editor={editor} /><div style={{ display: 'grid', gridTemplateColumns: forceMobile ? '1fr' : 'repeat(auto-fit,minmax(220px,1fr))', gap: 18 }}>{items.map((item: any, i: number) => <article key={i} style={{ padding: forceMobile ? 20 : 26, borderRadius: radius, background: theme.surface, color: theme.text, border: '1px solid rgba(15,23,42,.08)', boxShadow: '0 12px 34px rgba(15,23,42,.06)' }}><div style={{ width: 38, height: 38, borderRadius: 12, display: 'grid', placeItems: 'center', background: `${accent}18`, color: accent, fontWeight: 900, marginBottom: 16 }}>{String(i + 1).padStart(2,'0')}</div><h3 {...editableTextProps(editor, block.id, (value) => editor?.onPatchContent?.(block.id, { items: items.map((x: any, idx: number) => idx === i ? { ...x, title: value } : x) }))} style={{ fontFamily: theme.headingFont, fontSize: 20, margin: '0 0 9px' }}>{item.title}</h3><p {...editableTextProps(editor, block.id, (value) => editor?.onPatchContent?.(block.id, { items: items.map((x: any, idx: number) => idx === i ? { ...x, text: value } : x) }))} style={{ margin: 0, opacity: .72, lineHeight: 1.6 }}>{item.text}</p></article>)}</div></div></section>;
        }

        if (block.type === 'about') return <section key={block.id} id={block.id} onClick={() => selectBlock(block)} style={{ ...sectionBase, ...frame, background, color: textColor }}><div className="flex-about-grid" style={{ ...container, display: 'grid', gridTemplateColumns: forceMobile ? '1fr' : block.variant === 'image-right' ? '1fr .9fr' : '.9fr 1fr', gap: forceMobile ? 24 : 42, alignItems: 'center' }}>{block.variant !== 'image-right' && <div style={{ minHeight: forceMobile ? 220 : 330, borderRadius: radius + 6, background: content.imageUrl ? `url(${content.imageUrl}) center/cover` : `${accent}16`, border: `1px solid ${accent}24` }} />}<div><SectionTitle block={block} theme={theme} compact forceMobile={forceMobile} editor={editor} /><p {...editableTextProps(editor, block.id, (value) => editor?.onPatchContent?.(block.id, { text: value }))} style={{ fontSize: forceMobile ? 16 : 17, lineHeight: 1.75, opacity: .76 }}>{content.text}</p></div>{block.variant === 'image-right' && <div style={{ minHeight: forceMobile ? 220 : 330, borderRadius: radius + 6, background: content.imageUrl ? `url(${content.imageUrl}) center/cover` : `${accent}16`, border: `1px solid ${accent}24` }} />}</div></section>;

        if (block.type === 'gallery') {
          const images = content.images || [];
          return <section key={block.id} id={block.id} onClick={() => selectBlock(block)} style={{ ...sectionBase, ...frame, background, color: textColor }}><div style={container}><SectionTitle block={block} theme={theme} forceMobile={forceMobile} editor={editor} />{images.length ? <div style={{ display: 'grid', gridTemplateColumns: forceMobile ? '1fr 1fr' : block.variant === 'masonry' ? 'repeat(3,1fr)' : 'repeat(auto-fit,minmax(210px,1fr))', gap: forceMobile ? 10 : 14 }}>{images.map((image: any, i: number) => <figure key={`${image.url}-${i}`} style={{ margin: 0, overflow: 'hidden', borderRadius: radius, background: theme.surface, border: '1px solid rgba(15,23,42,.08)' }}><img src={image.url} alt={image.alt || image.caption || `Imagen ${i + 1}`} style={{ width: '100%', aspectRatio: block.variant === 'masonry' ? (i % 3 === 0 ? '1/1.25' : '1/1') : '1/1', display: 'block', objectFit: 'cover' }} />{image.caption && <figcaption style={{ padding: '10px 12px', fontSize: 13, opacity: .72 }}>{image.caption}</figcaption>}</figure>)}</div> : <div style={{ minHeight: 180, display: 'grid', placeItems: 'center', border: `1px dashed ${accent}55`, borderRadius: radius, color: accent, background: `${accent}08`, textAlign: 'center', padding: 20 }}><span>Agrega imágenes desde el editor de este bloque.</span></div>}</div></section>;
        }

        if (block.type === 'pricing') {
          const items = content.items || [];
          return <section key={block.id} id={block.id} onClick={() => selectBlock(block)} style={{ ...sectionBase, ...frame, background, color: textColor }}><div style={container}><SectionTitle block={block} theme={theme} forceMobile={forceMobile} editor={editor} /><div style={{ display: 'grid', gridTemplateColumns: forceMobile ? '1fr' : 'repeat(auto-fit,minmax(245px,1fr))', gap: 18 }}>{items.map((item: any, i: number) => <article key={i} style={{ padding: forceMobile ? 24 : 30, borderRadius: radius, background: item.featured ? accent : theme.surface, color: item.featured ? '#fff' : theme.text, border: item.featured ? 'none' : '1px solid rgba(15,23,42,.08)', transform: forceMobile ? 'none' : item.featured ? 'translateY(-8px)' : 'none' }}><strong {...editableTextProps(editor, block.id, (value) => editor?.onPatchContent?.(block.id, { items: items.map((x: any, idx: number) => idx === i ? { ...x, name: value } : x) }))}>{item.name}</strong><div {...editableTextProps(editor, block.id, (value) => editor?.onPatchContent?.(block.id, { items: items.map((x: any, idx: number) => idx === i ? { ...x, price: value } : x) }))} style={{ fontFamily: theme.headingFont, fontSize: 38, margin: '18px 0' }}>{item.price}</div><div style={{ display: 'grid', gap: 10, opacity: .86 }}>{String(item.features || '').split('\n').filter(Boolean).map((x, j) => <span key={j}>✓ {x}</span>)}</div><a href={waLink(whatsapp, `Hola, me interesa ${item.name}`)} onClick={preventPreviewNav} target="_blank" style={{ ...buttonStyle(item.featured ? '#fff' : accent), marginTop: 24, ...(item.featured ? { color: accent, background: '#fff' } : {}) }}>Elegir</a></article>)}</div></div></section>;
        }

        if (block.type === 'hours') {
          const items = content.items || [];
          return <section key={block.id} id={block.id} onClick={() => selectBlock(block)} style={{ ...sectionBase, ...frame, background, color: textColor }}><div style={{ ...container, maxWidth: 760 }}><SectionTitle block={block} theme={theme} forceMobile={forceMobile} editor={editor} /><div style={{ overflow: 'hidden', borderRadius: radius, background: theme.surface, border: '1px solid rgba(15,23,42,.08)' }}>{items.map((item: any, i: number) => <div key={i} style={{ display: 'flex', flexDirection: forceMobile ? 'column' : 'row', justifyContent: 'space-between', gap: forceMobile ? 4 : 20, padding: '17px 20px', borderBottom: i === items.length - 1 ? 'none' : '1px solid rgba(15,23,42,.07)' }}><strong {...editableTextProps(editor, block.id, (value) => editor?.onPatchContent?.(block.id, { items: items.map((x: any, idx: number) => idx === i ? { ...x, day: value } : x) }))}>{item.day}</strong><span {...editableTextProps(editor, block.id, (value) => editor?.onPatchContent?.(block.id, { items: items.map((x: any, idx: number) => idx === i ? { ...x, hours: value } : x) }))} style={{ opacity: .68 }}>{item.hours}</span></div>)}</div></div></section>;
        }

        if (block.type === 'testimonials') {
          const items = content.items || [];
          return <section key={block.id} id={block.id} onClick={() => selectBlock(block)} style={{ ...sectionBase, ...frame, background, color: textColor }}><div style={container}><SectionTitle block={block} theme={theme} forceMobile={forceMobile} editor={editor} /><div style={{ display: 'grid', gridTemplateColumns: forceMobile ? '1fr' : 'repeat(auto-fit,minmax(260px,1fr))', gap: 18 }}>{items.map((item: any, i: number) => <blockquote key={i} style={{ margin: 0, padding: 26, borderRadius: radius, background: theme.background, color: theme.text, border: '1px solid rgba(15,23,42,.07)' }}><p {...editableTextProps(editor, block.id, (value) => editor?.onPatchContent?.(block.id, { items: items.map((x: any, idx: number) => idx === i ? { ...x, text: value.replace(/^“|”$/g, '') } : x) }))} style={{ fontSize: 17, lineHeight: 1.7, margin: '0 0 18px' }}>“{item.text}”</p><strong {...editableTextProps(editor, block.id, (value) => editor?.onPatchContent?.(block.id, { items: items.map((x: any, idx: number) => idx === i ? { ...x, author: value } : x) }))} style={{ color: accent }}>{item.author}</strong></blockquote>)}</div></div></section>;
        }

        if (block.type === 'cta') return <section key={block.id} id={block.id} onClick={() => selectBlock(block)} style={{ ...frame, padding: forceMobile ? '28px 0' : '36px 0', background, color: textColor }}><div style={{ ...container, padding: forceMobile ? '30px 22px' : '42px', borderRadius: radius + 8, background: accent, color: '#fff', textAlign: 'center' }}><h2 {...editableTextProps(editor, block.id, (value) => editor?.onPatchBlock?.(block.id, { title: value }))} style={{ fontFamily: theme.headingFont, fontSize: forceMobile ? 30 : 38, margin: 0 }}>{block.title}</h2>{block.subtitle && <p {...editableTextProps(editor, block.id, (value) => editor?.onPatchBlock?.(block.id, { subtitle: value }))} style={{ opacity: .84, fontSize: 17 }}>{block.subtitle}</p>}<a href={waLink(whatsapp, `Hola, quiero información sobre ${siteName}`)} onClick={preventPreviewNav} target="_blank" style={{ ...buttonStyle('#fff'), background: '#fff', color: accent, marginTop: 10 }}>{content.buttonText || 'Escríbenos'}</a></div></section>;

        if (block.type === 'contact') return <section key={block.id} id={block.id} onClick={() => selectBlock(block)} style={{ ...sectionBase, ...frame, background, color: textColor }}><div style={{ ...container, maxWidth: 760 }}><SectionTitle block={block} theme={theme} forceMobile={forceMobile} editor={editor} />{enviado ? <div style={{ padding: 28, borderRadius: radius, background: `${accent}12`, color: accent, fontWeight: 800, textAlign: 'center' }}>¡Gracias! Tu mensaje está listo para enviarse por WhatsApp.</div> : <div style={{ display: 'grid', gap: 12 }}><input placeholder="Nombre" value={form.nombre} onChange={(e)=>setForm({...form,nombre:e.target.value})} disabled={!!editor} style={inputStyle(radius)} /><div className="flex-contact-grid" style={{ display: 'grid', gridTemplateColumns: forceMobile ? '1fr' : '1fr 1fr', gap: 12 }}><input placeholder="Correo" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} disabled={!!editor} style={inputStyle(radius)} /><input placeholder="Teléfono" value={form.telefono} onChange={(e)=>setForm({...form,telefono:e.target.value})} disabled={!!editor} style={inputStyle(radius)} /></div><textarea placeholder="¿Cómo podemos ayudarte?" value={form.mensaje} onChange={(e)=>setForm({...form,mensaje:e.target.value})} disabled={!!editor} style={{ ...inputStyle(radius), minHeight: 130, resize: 'vertical' }} /><button onClick={sendForm} style={{ ...buttonStyle(accent), cursor: editor ? 'default' : 'pointer' }}>{content.buttonText || 'Enviar mensaje'}</button></div>}</div></section>;

        return null;
      })}

      <footer style={{ background: '#111827', color: '#fff', padding: forceMobile ? '28px 0' : '38px 0' }}><div style={{ ...container, display: 'flex', flexDirection: forceMobile ? 'column' : 'row', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: forceMobile ? 'flex-start' : 'center' }}><strong style={{ fontFamily: theme.headingFont }}>{siteName}</strong><div style={{ opacity: .7, fontSize: 13 }}>© {new Date().getFullYear()} {siteName}</div>{instagram && <a href={`https://instagram.com/${instagram.replace('@','')}`} onClick={preventPreviewNav} target="_blank" style={{ color: '#fff' }}>@{instagram.replace('@','')}</a>}</div></footer>

      <style jsx global>{`
        .is-editor-preview [contenteditable="true"]{outline:none;border-radius:4px;transition:box-shadow .15s ease,background .15s ease}
        .is-editor-preview [contenteditable="true"]:hover{box-shadow:0 0 0 2px rgba(124,58,237,.2);background:rgba(255,255,255,.08)}
        .is-editor-preview [contenteditable="true"]:focus{box-shadow:0 0 0 2px rgba(124,58,237,.5);background:rgba(255,255,255,.12)}
        .fake-mobile-menu{font-size:22px;font-weight:800;line-height:1}
        @media(max-width:760px){
          .flex-landing:not(.force-mobile) .flex-hero-grid:not(.centered),.flex-landing:not(.force-mobile) .flex-about-grid{grid-template-columns:1fr!important}
          .flex-landing:not(.force-mobile) .flex-contact-grid{grid-template-columns:1fr!important}
          .flex-landing:not(.force-mobile) .flex-nav{display:none!important}
          .flex-landing:not(.force-mobile) .flex-header>div{min-height:62px!important}
          .flex-landing:not(.force-mobile) section{padding-top:48px!important;padding-bottom:48px!important}
        }
      `}</style>
    </div>
  );
}

function SectionTitle({ block, theme, compact = false, forceMobile = false, editor }: { block: LandingBlock; theme: LandingTheme; compact?: boolean; forceMobile?: boolean; editor?: LandingInlineEditor }) {
  return <div style={{ maxWidth: 720, margin: compact ? '0 0 18px' : '0 auto 34px', textAlign: compact ? (block.style?.align || 'left') : 'center' }}><h2 {...editableTextProps(editor, block.id, (value) => editor?.onPatchBlock?.(block.id, { title: value }))} style={{ fontFamily: theme.headingFont, fontSize: forceMobile ? 30 : compact ? 36 : 40, lineHeight: 1.1, margin: 0 }}>{block.title}</h2>{block.subtitle && <p {...editableTextProps(editor, block.id, (value) => editor?.onPatchBlock?.(block.id, { subtitle: value }))} style={{ margin: '11px 0 0', opacity: .68, lineHeight: 1.65 }}>{block.subtitle}</p>}</div>;
}

function inputStyle(radius: number): CSSProperties {
  return { width: '100%', minHeight: 48, padding: '12px 14px', border: '1px solid rgba(15,23,42,.14)', borderRadius: Math.min(radius, 16), background: '#fff', fontSize: 15, boxSizing: 'border-box', outline: 'none' };
}
