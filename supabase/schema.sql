-- Ejecutar esto en el SQL Editor de tu proyecto Supabase (Fase 1)

create extension if not exists "uuid-ossp";

create table if not exists businesses (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) not null,
  nombre text not null,
  tipo text not null check (tipo in ('tienda', 'landing', 'menu')),
  subdominio text unique not null,
  template_id text not null default 'minimalista' check (template_id in ('minimalista', 'sencillo', 'tienda-moderno', 'tienda-directo')),
  estado text not null default 'activo' check (estado in ('activo', 'pausado')),
  config jsonb not null default '{
    "colorPrimario": "#111111",
    "logoUrl": null,
    "titulo": "",
    "descripcion": "",
    "whatsapp": "",
    "instagram": ""
  }'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade not null,
  nombre text not null,
  descripcion text,
  precio numeric(10,2) not null default 0,
  imagen_url text,
  categoria text default 'General',
  disponible boolean not null default true,
  orden int not null default 0,
  created_at timestamptz not null default now()
);

-- RLS: cada dueño solo ve/edita sus propios negocios y productos.
-- La página pública (por subdominio) lee sin auth vía función/policy de solo lectura.

alter table businesses enable row level security;
alter table products enable row level security;

create policy "Dueño administra su negocio"
  on businesses for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Lectura pública de negocios activos"
  on businesses for select
  using (estado = 'activo');

create policy "Dueño administra sus productos"
  on products for all
  using (
    exists (select 1 from businesses b where b.id = business_id and b.owner_id = auth.uid())
  )
  with check (
    exists (select 1 from businesses b where b.id = business_id and b.owner_id = auth.uid())
  );

create policy "Lectura pública de productos disponibles"
  on products for select
  using (disponible = true);

create index if not exists idx_businesses_subdominio on businesses (subdominio);
create index if not exists idx_products_business on products (business_id);

-- Si ya habías corrido este schema antes (proyecto existente) y solo quieres
-- agregar los nuevos templates de tienda, corre nada más esto:
-- alter table businesses drop constraint businesses_template_id_check;
-- alter table businesses add constraint businesses_template_id_check
--   check (template_id in ('minimalista', 'sencillo', 'tienda-moderno', 'tienda-directo'));
