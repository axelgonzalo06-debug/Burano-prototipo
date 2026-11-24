// Corrige SOLO los errores ortográficos de las dudas de texto aprobadas por Axel/Diego (24/11/2026).
// No toca direcciones (slug), URLs de fotos ni ningún otro texto.
//
// Por defecto solo muestra lo que cambiaría. Para escribir:
//   base local:  node --env-file=.env.local scripts/corregir-ortografia.mjs --aplicar
//   base real:   node --env-file=.env.production.local scripts/corregir-ortografia.mjs --aplicar --base-real
// (la base real solo con el OK de Diego). Se puede correr varias veces: lo ya corregido no cambia.
import { PrismaClient } from '@prisma/client';

const aplicar = process.argv.includes('--aplicar');
const real = process.argv.includes('--base-real');
const url = process.env.DATABASE_URL ?? '';
const esLocal = /@(127\.0\.0\.1|localhost):/.test(url);
if (!esLocal && !real) {
  console.error('La base no es la local. Si es a propósito (con OK de Diego), agregá --base-real.');
  process.exit(1);
}

// [texto con error, texto corregido]
const REEMPLAZOS = [
  ['Azotea edifico "EL Castaño"', 'Azotea edificio "El Castaño"'],
  ['HEA Windham', 'HEA Wyndham'],
  ['cortinas de enrrollar', 'cortinas de enrollar'],
  ['de ls ampliación', 'de la ampliación'],
  ['reestructura de el edificio', 'reestructura del edificio'],
  ['Ac. acúsitco', 'Ac. acústico'],
  ['Informe de diagnostico', 'Informe de diagnóstico'],
  ['Punta del este', 'Punta del Este'],
  ['Instalación den puntos', 'Instalación de puntos'],
  ['pergola', 'pérgola'], // también corrige «pergolas»
];
// Paréntesis sin cerrar en Vivienda Jacarandá (va después de corregir «pérgola»).
const PARENTESIS = [/\(decks, pérgola y parrillero(?!\))/g, '(decks, pérgola y parrillero)'];

// Solo campos de texto visibles; nunca slug, url ni portada.
const CAMPOS = {
  proyecto: ['titulo', 'subtitulo', 'trabajos', 'descripcion', 'situacionPrevia', 'programa'],
  foto: ['pie', 'alt'],
  diapositiva: ['titulo', 'pie'],
  servicio: ['titulo', 'intro', 'items'],
  trabajoCalculo: ['nombre', 'lugar'],
  integrante: ['experiencia', 'diplomas', 'titulo'],
};

function corregir(texto) {
  let t = texto;
  for (const [mal, bien] of REEMPLAZOS) t = t.split(mal).join(bien);
  return t.replace(PARENTESIS[0], PARENTESIS[1]);
}

const db = new PrismaClient();
let total = 0;
for (const [modelo, campos] of Object.entries(CAMPOS)) {
  const filas = await db[modelo].findMany({ select: Object.fromEntries([['id', true], ...campos.map((c) => [c, true])]) });
  for (const fila of filas) {
    const cambios = {};
    for (const c of campos) {
      const v = fila[c];
      if (typeof v === 'string' && corregir(v) !== v) cambios[c] = corregir(v);
    }
    if (!Object.keys(cambios).length) continue;
    total++;
    for (const [c, nuevo] of Object.entries(cambios)) console.log(`${modelo}.${c} [${fila.id}]: «${fila[c]}» → «${nuevo}»`.slice(0, 400));
    if (aplicar) await db[modelo].update({ where: { id: fila.id }, data: cambios });
  }
}
console.log(`\n${total} registros ${aplicar ? 'corregidos' : 'a corregir (no se escribió nada; agregá --aplicar)'}.`);
await db.$disconnect();
