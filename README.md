# Colecta La Obra UC

Aplicación web mobile-first en español para coordinar colectas de alimentos y
artículos de aseo. Sin login: el acceso se controla por URL.

- **Admin**: `/admin?key=TU_CLAVE`
- **Voluntarios**: `/colecta/[event-id]` (el enlace se genera desde el panel admin)

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres + Realtime) — llamadas directas desde el cliente con
  `@supabase/supabase-js` (sin rutas `/api` intermedias, compatible con Render)
- `xlsx` para la exportación a Excel

## Configuración

1. Crea un proyecto en [Supabase](https://supabase.com).
2. En el **SQL Editor** de Supabase, ejecuta el contenido de `supabase-schema.sql`
   para crear las tablas, índices, políticas RLS y habilitar Realtime en `items`.
3. Copia `.env.local.example` a `.env.local` y completa:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ADMIN_KEY` (clave secreta para `/admin?key=...`)
4. Instala dependencias y levanta el entorno de desarrollo:

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Despliegue en Render

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Variables de entorno: las mismas de `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ADMIN_KEY`).

## Logo

Coloca un archivo `public/logo.png` para reemplazar el texto de respaldo
"La Obra UC" que se muestra en el encabezado.
