# creatusitio-platform

Fase 1: modelo de datos + templates. Fase 2: registro + subdominios dinámicos (incluida). Dashboard básico (productos, diseño, plantilla) incluido.

## Pasos para poner esto en producción

### 1. Subir el código a GitHub
- Crea un repo nuevo en github.com (ej. `creatusitio-platform`)
- Sube esta carpeta completa arrastrando los archivos en la interfaz web de GitHub, o usando "Add file → Upload files"

### 2. Abrir el proyecto en StackBlitz
- Ve a stackblitz.com → "Import from GitHub" → pega la URL de tu repo
- StackBlitz instalará las dependencias automáticamente

### 3. Crear el proyecto en Supabase
- Ve a supabase.com → New Project
- En el SQL Editor, pega y ejecuta el contenido de `supabase/schema.sql`
- En Project Settings → API, copia la "Project URL" y la "anon public key"

### 4. Variables de entorno
- Copia `.env.example` a `.env.local` (en StackBlitz o en Vercel)
- Pega ahí tu URL y anon key de Supabase

### 5. Desplegar en Vercel
- Conecta el repo de GitHub a un proyecto nuevo en Vercel
- Agrega las mismas variables de entorno en Vercel → Settings → Environment Variables
- Deploy

### 6. Configurar el dominio con subdominios comodín
- En Vercel → tu proyecto → Settings → Domains, agrega:
  - `creatusitio.mx`
  - `*.creatusitio.mx` (wildcard — esto es lo que permite que cualquier subdominio funcione)
- En el proveedor donde compraste el dominio (ej. Namecheap), agrega los registros DNS que Vercel te indique:
  - Un registro `A` o `CNAME` para la raíz
  - Un registro `CNAME` tipo `*` apuntando a `cname.vercel-dns.com` para el wildcard
- Espera a que el DNS se propague (puede tardar hasta unas horas) y Vercel emitirá el certificado SSL automáticamente para todos los subdominios

### 7. Probar el flujo completo
- Entra a `creatusitio.mx/crear`, crea un negocio de prueba con un subdominio de prueba
- Verifica que `tunegocio.creatusitio.mx` cargue el template correcto
- Entra a `creatusitio.mx/panel`, agrega un producto y confirma que aparezca en la página pública

## Actualización: WhatsApp en el registro, imágenes, categorías y personalizaciones

Si ya tenías el proyecto corriendo, necesitas correr en el SQL Editor de Supabase (una sola vez):

```sql
alter table businesses add column if not exists categories text[] not null default '{}';
alter table products add column if not exists opciones jsonb not null default '[]'::jsonb;

insert into storage.buckets (id, name, public)
values ('creatusitio-assets', 'creatusitio-assets', true)
on conflict (id) do nothing;

create policy "Lectura pública de archivos"
  on storage.objects for select
  using (bucket_id = 'creatusitio-assets');

create policy "Usuarios autenticados suben archivos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'creatusitio-assets');

create policy "Usuarios autenticados actualizan sus archivos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'creatusitio-assets');
```

Esto habilita:
- El campo de WhatsApp en `/crear` (paso 3) — se guarda directo en `config.whatsapp`
- Subida de imagen por producto y de logo del negocio (bucket `creatusitio-assets` en Supabase Storage)
- Categorías propias por negocio (`businesses.categories`), con opción de crear una nueva desde el panel de productos
- Personalizaciones por producto (`products.opciones`): opciones de "elige 1" o "elige varias" con costo extra opcional, que aparecen como un panel al momento de pedir en las plantillas de tienda

## Lo que falta para producción completa (siguientes iteraciones)
- Confirmación por correo al registrarse (Supabase Auth ya lo soporta, falta configurar el template de correo)
- Reordenar productos y categorías (arrastrar y soltar)
- Panel de pedidos en tiempo real, reutilizando el patrón ya construido en panel.creatusitio.mx
