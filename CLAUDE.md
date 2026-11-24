# Burano · sitio web — reglas del proyecto

Sitio nuevo de Burano S.R.L. (constructora, Montevideo) que reemplaza al Wix de burano.com.uy.
Cliente gestionado por Diego Covucci (LAB). El estado completo y los pendientes están en el
documento de traspaso en Drive: `Mi unidad/LAB/BURANO/SITIO WEB NUEVO/05_TRASPASO/`.

## Reglas de Diego (no se discuten)
- **Textos tal cual.** Se migran idénticos al Wix. Si algo está mal escrito o desactualizado, se marca y se le pregunta; no se reescribe por cuenta propia. Las descripciones de SEO se arman con textos que ya están en el sitio (`src/lib/seo.ts`).
- **Claves y credenciales las carga Diego.** Se le indica la pantalla y qué pegar; nunca se escriben en archivos, commits ni documentos.
- **Publicar o enviar formularios reales requiere su OK.**
- **Vercel Pro de Diego, tope USD 20/mes:** no sumar add-ons pagos ni integraciones con costo.
- **No es un fork de ALIAMPSI:** el administrador se tomó como referencia de funcionamiento, pero no se copia contenido, marca ni datos.
- **Identidad propia de constructora:** que no se parezca a ALIAMPSI ni "huela a IA". Nada de tipografía monoespaciada. Tipografía "Obra": Big Shoulders Display (títulos y cifras) + Hanken Grotesk (texto); el logotipo BURANO va en Archivo ancha.
- **Fotos:** se restauran, nunca se inventa nada que no exista en la obra.
- **El sitio se aprueba por fuera y recién después se mueve el dominio.** El DNS lo toca Diego; se le dan los pasos.

## Stack
Next.js 14.2 (App Router) · Prisma 5.22 · Neon Postgres (`burano-db`, São Paulo) · Vercel Blob · Resend.
Administrador en `/admin` (sesión JWT en cookie `burano_sesion`, roles administrador/editor).
Producción de prueba: https://burano-web.vercel.app (proyecto Vercel `burano-web`).
En Neon/Vercel hay otro store llamado "radar-opinion": es de otro proyecto, no se toca.

## Variables
Ver `README.md`. Para trabajar con los datos reales: `vercel link` al proyecto `burano-web` y
`vercel env pull .env.production.local --environment=production`. Nunca se suben al repo.
- `NO_INDEXAR=1` está puesto a propósito: Google no indexa mientras el sitio esté en revisión.
- Al migrar el dominio: `NEXT_PUBLIC_SITIO_URL=https://www.burano.com.uy` y se borra `NO_INDEXAR`.

## Versiones
Cada cambio publicado sube `APP_VERSION` en `src/lib/version.ts`, suma una entrada arriba en
`HISTORIAL` y en `CHANGELOG.md` (en castellano, contado para Diego), y se commitea con el número.
Publicar: `vercel --prod`.

## Scripts
- `scripts/migrar-wix.mjs` — carga inicial desde el relevamiento de Wix.
- `scripts/copiar-base.mjs` — copia contenido de una base a otra (no usuarios ni consultas).
- `scripts/retratos-equipo.mjs` — sube los retratos retocados del equipo.
- `scripts/medir.mjs <salida.json>` — resolución y nitidez de cada foto publicada.
- `scripts/duplicados.mjs [umbral] [salida.json]` — fotos repetidas por obra (dHash).
- `scripts/og.mjs` — regenera `public/og.jpg` desde la primera diapositiva.
- `scripts/data/fotos-flojas.json` — las 27 fotos flojas a restaurar (pendiente).
Todos se corren desde la raíz con `node --env-file=.env.production.local scripts/<script>.mjs`.

## Estilo de código
Nombres y comentarios en castellano, comentarios cortos que explican el porqué.
