// Busca fotos repetidas dentro de cada obra con una huella visual (dHash 16x16, en gris).
// Dos fotos con distancia de Hamming <= UMBRAL se consideran la misma toma.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const req = createRequire(process.cwd() + '/package.json');
const { PrismaClient } = req('@prisma/client');
const sharp = req('sharp');
const db = new PrismaClient();
const UMBRAL = Number(process.argv[2] || 24);

const fotos = await db.foto.findMany({ include: { proyecto: { select: { slug: true, portada: true } } }, orderBy: [{ proyectoId: 'asc' }, { orden: 'asc' }] });
async function huella(url) {
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  const m = await sharp(buf).metadata();
  const { data } = await sharp(buf).resize(17, 16, { fit: 'fill' }).grayscale().raw().toBuffer({ resolveWithObject: true });
  const bits = [];
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) bits.push(data[y * 17 + x] > data[y * 17 + x + 1] ? 1 : 0);
  return { bits, w: m.width, h: m.height };
}
let k = 0;
await Promise.all(Array.from({ length: 8 }, async () => {
  while (k < fotos.length) { const f = fotos[k++]; try { Object.assign(f, await huella(f.url)); } catch (e) { f.err = String(e); } }
}));
const dist = (a, b) => a.bits.reduce((s, v, i) => s + (v !== b.bits[i]), 0);
const porObra = {};
for (const f of fotos) (porObra[f.proyecto.slug] ||= []).push(f);
const grupos = [];
for (const [slug, lista] of Object.entries(porObra)) {
  const usado = new Set();
  for (let i = 0; i < lista.length; i++) {
    if (usado.has(i) || !lista[i].bits) continue;
    const g = [lista[i]];
    for (let j = i + 1; j < lista.length; j++) {
      if (usado.has(j) || !lista[j].bits) continue;
      const d = dist(lista[i], lista[j]);
      if (d <= UMBRAL) { g.push({ ...lista[j], d }); usado.add(j); }
    }
    if (g.length > 1) grupos.push({ slug, portada: lista[0].proyecto.portada, fotos: g.map(f => ({ id: f.id, url: f.url, w: f.w, h: f.h, previa: f.previa, avance: f.avance, orden: f.orden, pie: f.pie, d: f.d ?? 0 })) });
  }
}
fs.writeFileSync(process.argv[3] || 'duplicados.json', JSON.stringify(grupos, null, 1));
console.log('fotos', fotos.length, 'errores', fotos.filter(f => f.err).length, 'grupos', grupos.length);
for (const g of grupos) console.log(g.slug, g.fotos.map(f => `#${f.orden} ${f.w}x${f.h}${f.previa ? ' previa' : ''}${f.avance ? ' avance' : ''} d${f.d}`).join(' | '));
await db.$disconnect();
