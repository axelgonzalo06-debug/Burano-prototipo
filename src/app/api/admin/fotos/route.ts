import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { sesion } from '@/lib/auth';
import { guardarImagen } from '@/lib/imagenes';

export const maxDuration = 60;

// Sube una foto a la galería de un proyecto. Recorte opcional; sin recorte se guarda la foto completa.
export async function POST(req: Request) {
  if (!(await sesion())) return new NextResponse('Sesión vencida', { status: 401 });
  const fd = await req.formData();
  const archivo = fd.get('archivo');
  const proyectoId = String(fd.get('proyectoId') || '');
  if (!(archivo instanceof File) || !proyectoId) return new NextResponse('Falta el archivo', { status: 400 });
  const p = await db.proyecto.findUnique({ where: { id: proyectoId }, include: { _count: { select: { fotos: true } } } });
  if (!p) return new NextResponse('Proyecto inexistente', { status: 404 });
  const img = await guardarImagen(Buffer.from(await archivo.arrayBuffer()), archivo.name, { carpeta: `proyectos/${p.slug}` });
  const f = await db.foto.create({ data: { proyectoId, url: img.url, ancho: img.ancho, alto: img.alto, alt: p.titulo, orden: p._count.fotos } });
  if (!p.portada) await db.proyecto.update({ where: { id: p.id }, data: { portada: img.url, portadaAncho: img.ancho, portadaAlto: img.alto } });
  revalidatePath('/', 'layout');
  return NextResponse.json({ id: f.id, url: f.url, pie: '', previa: false, avance: false, fecha: '' });
}
