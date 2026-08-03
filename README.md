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

## Lo que falta para producción completa (siguientes iteraciones)
- Subida de imágenes de producto vía Supabase Storage (por ahora `imagen_url` se llena a mano)
- Confirmación por correo al registrarse (Supabase Auth ya lo soporta, falta configurar el template de correo)
- Botón de "publicar pedido por WhatsApp" en las páginas públicas de tienda/menú
- Panel de pedidos en tiempo real, reutilizando el patrón ya construido en panel.creatusitio.mx
