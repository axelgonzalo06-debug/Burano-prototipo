import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { sesion } from '@/lib/auth';
import { guardarArchivo } from '@/lib/imagenes';

export async function POST(req: Request) {
  if (!(await sesion())) return new NextResponse('Sesión vencida', { status: 401 });
  const fd = await req.formData();
  const archivo = fd.get('archivo');
  const proyectoId = String(fd.get('proyectoId') || '');
  if (!(archivo instanceof File) || !proyectoId) return new NextResponse('Falta el archivo', { status: 400 });
  const p = await db.proyecto.findUnique({ where: { id: proyectoId }, include: { _count: { select: { archivos: true } } } });
  if (!p) return new NextResponse('Proyecto inexistente', { status: 404 });
  const url = await guardarArchivo(Buffer.from(await archivo.arrayBuffer()), archivo.name, archivo.type || 'application/octet-stream', `archivos/${p.slug}`);
  await db.archivo.create({ data: { proyectoId, url, nombre: String(fd.get('nombre') || archivo.name), tipo: String(fd.get('tipo') || 'Plano'), orden: p._count.archivos } });
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
