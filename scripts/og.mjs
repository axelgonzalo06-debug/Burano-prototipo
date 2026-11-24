// Imagen para compartir (1200x630): primera diapositiva de la portada, oscurecida abajo, con el isotipo claro.
import { createRequire } from 'node:module';
const req = createRequire(process.cwd() + '/package.json');
const { PrismaClient } = req('@prisma/client');
const sharp = req('sharp');
const db = new PrismaClient();
const d = await db.diapositiva.findFirst({ where: { activa: true }, orderBy: { orden: 'asc' } });
const foto = Buffer.from(await (await fetch(d.imagen)).arrayBuffer());
const grad = Buffer.from('<svg width="1200" height="630"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0.35" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.72"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/></svg>');
const logo = await sharp('public/isotipo-claro.png').resize({ height: 110 }).toBuffer();
await sharp(foto).resize(1200, 630, { fit: 'cover' }).composite([{ input: grad }, { input: logo, left: 64, top: 630 - 64 - 110 }]).jpeg({ quality: 84, mozjpeg: true }).toFile('public/og.jpg');
console.log(d.imagen); await db.$disconnect();
