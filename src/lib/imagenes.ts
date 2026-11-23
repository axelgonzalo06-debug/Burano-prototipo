import sharp from 'sharp';
import { put, del } from '@vercel/blob';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Optimiza al subir: gira según EXIF, achica a 2400 px de lado mayor y guarda en WebP calidad 80.
// Con `sinRecortar` nunca se recorta; con `recorte` se aplica antes de achicar.
export async function guardarImagen(
  buf: Buffer,
  nombre: string,
  opciones: { carpeta?: string; max?: number; recorte?: { x: number; y: number; w: number; h: number } } = {},
) {
  const max = opciones.max ?? 2400;
  // Límite de fábrica de sharp (16383 × 16383 px): alcanza para cualquier cámara y frena imágenes "bomba".
  let img = sharp(buf).rotate();
  if (opciones.recorte) {
    const r = opciones.recorte;
    img = img.extract({ left: Math.round(r.x), top: Math.round(r.y), width: Math.round(r.w), height: Math.round(r.h) });
  }
  const out = await img.resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer({ resolveWithObject: true });
  const base = nombre.replace(/\.[a-z0-9]+$/i, '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').slice(0, 60) || 'imagen';
  const ruta = `${opciones.carpeta ?? 'subidas'}/${base}.webp`;
  const url = await subir(ruta, out.data, 'image/webp');
  return { url, ancho: out.info.width, alto: out.info.height };
}

export async function guardarArchivo(buf: Buffer, nombre: string, tipo: string, carpeta = 'archivos') {
  const limpio = nombre.toLowerCase().replace(/[^a-z0-9.-]+/g, '-');
  return subir(`${carpeta}/${limpio}`, buf, tipo);
}

async function subir(ruta: string, data: Buffer, tipo: string) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const r = await put(ruta, data, { access: 'public', contentType: tipo, addRandomSuffix: true });
    return r.url;
  }
  // Desarrollo local sin Blob: se guarda en public/subidas
  const destino = path.join(process.cwd(), 'public', 'subidas', ruta);
  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, data);
  return `/subidas/${ruta}`;
}

export async function borrarImagen(url: string) {
  if (url && process.env.BLOB_READ_WRITE_TOKEN && url.includes('blob.vercel-storage.com')) await del(url).catch(() => {});
}
