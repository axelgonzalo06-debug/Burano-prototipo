// Mide resolución y nitidez de cada imagen publicada (fotos, portadas, diapositivas).
// Nitidez = varianza del laplaciano sobre la imagen llevada a 1200 px de lado mayor, en gris.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const req = createRequire(process.cwd() + '/package.json');
const { PrismaClient } = req('@prisma/client');
const sharp = req('sharp');
const db = new PrismaClient();

const fotos = await db.foto.findMany({ include: { proyecto: { select: { slug: true, titulo: true } } } });
const diapos = await db.diapositiva.findMany();
const items = [
  ...fotos.map(f => ({ id: f.id, tabla: 'foto', proyecto: f.proyecto.slug, url: f.url, w: f.ancho, h: f.alto, previa: f.previa })),
  ...diapos.map(d => ({ id: d.id, tabla: 'diapositiva', proyecto: 'inicio', url: d.imagen, w: d.ancho, h: d.alto })),
];

async function nitidez(buf) {
  const { data, info } = await sharp(buf).resize(1200, 1200, { fit: 'inside' }).grayscale().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  let s = 0, s2 = 0, n = 0;
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x;
    const l = 4 * data[i] - data[i - 1] - data[i + 1] - data[i - W] - data[i + W];
    s += l; s2 += l * l; n++;
  }
  return s2 / n - (s / n) ** 2;
}

const out = [];
let k = 0;
await Promise.all(Array.from({ length: 8 }, async () => {
  while (k < items.length) {
    const it = items[k++];
    try {
      const buf = Buffer.from(await (await fetch(it.url)).arrayBuffer());
      const m = await sharp(buf).metadata();
      out.push({ ...it, w: m.width, h: m.height, nit: Math.round(await nitidez(buf)) });
    } catch (e) { out.push({ ...it, error: String(e) }); }
  }
}));
fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
console.log('medidas', out.length);
await db.$disconnect();
