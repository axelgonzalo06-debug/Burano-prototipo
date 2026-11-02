# Burano · sitio web

Next.js 14 (App Router) + Prisma + Neon Postgres + Vercel Blob + Resend. Administrador en `/admin`.

## Variables en Vercel
- `DATABASE_URL`, `DATABASE_URL_UNPOOLED`: las crea la integración de Neon.
- `BLOB_READ_WRITE_TOKEN`: la crea el Blob store conectado al proyecto.
- `AUTH_SECRET`: texto largo al azar para firmar sesiones.
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`: crean el primer administrador en el primer ingreso (solo si no hay usuarios).
- `RESEND_API_KEY`: para avisos de consultas y respuestas.
- `NEXT_PUBLIC_SITIO_URL`: dirección pública del sitio (para SEO).

## Migrar contenido de Wix
`FOTOS_WIX="<carpeta fotos del relevamiento>" node --env-file=.env.production.local scripts/migrar-wix.mjs`

## Local
`npm run db:local` (Postgres en memoria con PGlite en el puerto 5433), `npx prisma db push`, `npm run dev`.

Cada cambio sube `APP_VERSION` en `src/lib/version.ts`, suma una entrada en `HISTORIAL` y en `CHANGELOG.md`.
