'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseClient';

const ITEMS = [
  { href: '/panel', label: 'Resumen', icon: '⌂', exact: true },
  { href: '/panel/productos', label: 'Productos', icon: '□' },
  { href: '/panel/diseno', label: 'Diseño', icon: '✦' },
  { href: '/panel/plantillas', label: 'Plantillas', icon: '▦' }
];

export default function PanelLayout({ children }: { children: ReactNode }) {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const pathname = usePathname();
  const [verificando, setVerificando] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    let activo = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace('/login');
        return;
      }
      if (activo) setVerificando(false);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') router.replace('/login');
    });

    return () => {
      activo = false;
      listener.subscription.unsubscribe();
    };
  }, [router, supabase]);

  useEffect(() => setMenuAbierto(false), [pathname]);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (verificando) {
    return (
      <div className="panel-loading">
        <div className="panel-spinner" />
        <p>Preparando tu panel...</p>
      </div>
    );
  }

  return (
    <div className="panel-shell">
      <aside className={`panel-sidebar ${menuAbierto ? 'is-open' : ''}`}>
        <div className="panel-sidebar-head">
          <Link href="/panel" className="panel-brand">
            creatusitio<span>.mx</span>
          </Link>
          <button className="panel-close" onClick={() => setMenuAbierto(false)} aria-label="Cerrar menú">×</button>
        </div>

        <div className="panel-nav-label">Tu negocio</div>
        <nav className="panel-nav">
          {ITEMS.map((item) => {
            const activo = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`panel-nav-item ${activo ? 'active' : ''}`}>
                <span className="panel-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {activo && <i />}
              </Link>
            );
          })}
        </nav>

        <div className="panel-sidebar-footer">
          <a href="https://creatusitio.mx" className="panel-site-link">
            <span>↗</span>
            Ver sitio principal
          </a>
          <button onClick={cerrarSesion} className="panel-logout">
            <span>↪</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {menuAbierto && <button className="panel-overlay" onClick={() => setMenuAbierto(false)} aria-label="Cerrar menú" />}

      <div className="panel-main">
        <header className="panel-topbar">
          <button className="panel-menu-button" onClick={() => setMenuAbierto(true)} aria-label="Abrir menú">☰</button>
          <div>
            <strong>Panel de administración</strong>
            <span>Administra tu sitio desde un solo lugar</span>
          </div>
          <Link href="/crear" className="panel-top-action">Crear otro sitio</Link>
        </header>
        <main className="panel-content">{children}</main>
      </div>

      <style jsx global>{`
        .panel-shell{min-height:100vh;display:flex;background:#f7f5f0;color:var(--color-ink)}
        .panel-sidebar{position:fixed;inset:0 auto 0 0;width:245px;z-index:30;display:flex;flex-direction:column;padding:24px 16px;background:#171a2b;color:#fff}
        .panel-sidebar-head{display:flex;align-items:center;justify-content:space-between;padding:0 10px 28px}
        .panel-brand{font-family:var(--font-display);font-size:19px;font-weight:700;text-decoration:none;letter-spacing:-.04em}
        .panel-brand span{color:var(--color-accent)}
        .panel-close{display:none;border:0;background:none;color:#fff;font-size:26px;cursor:pointer}
        .panel-nav-label{padding:0 12px 10px;color:#737991;font:500 10px var(--font-mono);letter-spacing:.12em;text-transform:uppercase}
        .panel-nav{display:grid;gap:4px}
        .panel-nav-item{position:relative;display:flex;align-items:center;gap:11px;min-height:44px;padding:0 13px;border-radius:10px;color:#adb2c7;text-decoration:none;font-size:13px;font-weight:600;transition:.18s ease}
        .panel-nav-item:hover{color:#fff;background:#22273c}
        .panel-nav-item.active{color:#fff;background:#2a3048}
        .panel-nav-item.active i{position:absolute;right:12px;width:6px;height:6px;border-radius:50%;background:var(--color-accent)}
        .panel-nav-icon{width:23px;height:23px;display:grid;place-items:center;border-radius:7px;background:rgba(255,255,255,.06);font-size:12px}
        .panel-nav-item.active .panel-nav-icon{background:var(--color-accent);color:#fff}
        .panel-sidebar-footer{margin-top:auto;display:grid;gap:6px;padding-top:18px;border-top:1px solid #30364d}
        .panel-site-link,.panel-logout{display:flex;align-items:center;gap:9px;width:100%;padding:10px 12px;border:0;border-radius:9px;color:#9298b1;background:none;text-decoration:none;font:500 12px var(--font-body);cursor:pointer}
        .panel-site-link:hover,.panel-logout:hover{color:#fff;background:#22273c}
        .panel-main{width:calc(100% - 245px);margin-left:245px}
        .panel-topbar{height:76px;display:flex;align-items:center;gap:16px;padding:0 34px;border-bottom:1px solid #e3ded4;background:rgba(255,255,255,.76);backdrop-filter:blur(12px)}
        .panel-topbar>div{display:grid}
        .panel-topbar strong{font-size:13px}
        .panel-topbar span{margin-top:2px;color:#8a8d9b;font-size:10px}
        .panel-top-action{margin-left:auto;padding:9px 13px;border:1px solid #d8d2c7;border-radius:9px;background:#fff;color:var(--color-ink);font-size:11px;font-weight:700;text-decoration:none}
        .panel-menu-button{display:none;border:0;background:none;font-size:21px;cursor:pointer}
        .panel-content{max-width:1260px;margin:0 auto;padding:38px}
        .panel-page-head{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:26px}
        .panel-page-head h1{font-size:30px;line-height:1.05}
        .panel-page-head p{margin-top:7px;color:var(--color-ink-soft);font-size:13px;line-height:1.5}
        .panel-eyebrow{margin-bottom:7px;color:var(--color-accent);font:500 10px var(--font-mono);letter-spacing:.12em;text-transform:uppercase}
        .panel-card{border:1px solid #e0dbd0;border-radius:16px;background:#fff;box-shadow:0 8px 28px rgba(39,32,20,.035)}
        .panel-field{display:grid;gap:6px;margin-bottom:15px}
        .panel-field label{color:#4f5365;font-size:11px;font-weight:700}
        .panel-input,.panel-select,.panel-textarea{width:100%;min-height:43px;padding:10px 12px;border:1px solid #dcd7cc;border-radius:9px;background:#fff;color:var(--color-ink);font:400 13px var(--font-body);outline:none;transition:.15s ease}
        .panel-input:focus,.panel-select:focus,.panel-textarea:focus{border-color:var(--color-accent);box-shadow:0 0 0 3px rgba(239,75,47,.09)}
        .panel-textarea{resize:vertical;min-height:85px}
        .panel-button{min-height:42px;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:0 16px;border:0;border-radius:9px;background:var(--color-ink);color:#fff;font-size:12px;font-weight:700;cursor:pointer}
        .panel-button:hover{background:#292f48}
        .panel-button:disabled{opacity:.5;cursor:default}
        .panel-button.secondary{border:1px solid #d9d3c8;background:#fff;color:var(--color-ink)}
        .panel-button.danger{border:1px solid #f0c9c2;background:#fff4f1;color:#c23e28}
        .panel-empty{padding:45px 25px;text-align:center;color:var(--color-ink-soft)}
        .panel-loading{min-height:100vh;display:grid;place-content:center;justify-items:center;gap:12px;background:#f7f5f0;color:var(--color-ink-soft)}
        .panel-spinner{width:28px;height:28px;border:3px solid #ddd7cc;border-top-color:var(--color-accent);border-radius:50%;animation:panel-spin .7s linear infinite}
        @keyframes panel-spin{to{transform:rotate(360deg)}}
        @media(max-width:820px){
          .panel-sidebar{transform:translateX(-100%);transition:.22s ease}
          .panel-sidebar.is-open{transform:translateX(0)}
          .panel-close,.panel-menu-button{display:block}
          .panel-overlay{position:fixed;inset:0;z-index:20;border:0;background:rgba(12,15,26,.48)}
          .panel-main{width:100%;margin-left:0}
          .panel-topbar{height:68px;padding:0 18px}
          .panel-content{padding:26px 18px}
          .panel-top-action{display:none}
          .panel-page-head{align-items:flex-start;flex-direction:column}
        }
      `}</style>
    </div>
  );
}
