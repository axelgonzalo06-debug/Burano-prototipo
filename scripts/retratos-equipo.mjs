// Reemplaza las fotos del equipo por los retratos retocados (Drive / 03_RETRATOS EQUIPO).
// Uso: RETRATOS="<carpeta>" node --env-file=.env.local scripts/retratos-equipo.mjs
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { put } from '@vercel/blob';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
const MAPA = { 'Carolina Cantieri': 'carolina-cantieri', 'Leandro Cantieri': 'leandro-cantieri', 'Marcelo Cantieri': 'marcelo-cantieri' };
const ARCHIVO = { 'Carolina Cantieri': 'carolina-cantieri_ia_v01', 'Leandro Cantieri': 'leandro-cantieri_ia_v01', 'Marcelo Cantieri': 'marcelo-cantieri_ia_v02-sonrisa' };
for (const m of await db.integrante.findMany()) {
  const clave = Object.keys(MAPA).find((k) => m.nombre.includes(k));
  if (!clave) continue;
  const buf = await sharp(await readFile(path.join(process.env.RETRATOS, `BURANO_equipo_${ARCHIVO[clave]}.jpg`))).webp({ quality: 86 }).toBuffer();
  const { url } = await put(`equipo/${MAPA[clave]}.webp`, buf, { access: 'public', contentType: 'image/webp', addRandomSuffix: true });
  await db.integrante.update({ where: { id: m.id }, data: { foto: url } });
  console.log('✓', m.nombre);
}
await db.$disconnect();
