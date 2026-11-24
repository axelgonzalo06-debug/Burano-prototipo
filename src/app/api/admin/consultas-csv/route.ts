import { db } from '@/lib/db';
import { sesion } from '@/lib/auth';

const celda = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export async function GET() {
  if (!(await sesion())) return new Response('Sesión vencida', { status: 401 });
  const filas = await db.consulta.findMany({ orderBy: { creado: 'desc' }, include: { proyecto: { select: { titulo: true } } } });
  const enc = ['Fecha', 'Estado', 'Origen', 'Nombre', 'Email', 'Teléfono', 'Asunto', 'Mensaje', 'Proyecto', 'Notas'];
  const csv = [enc, ...filas.map((c) => [c.creado.toISOString(), c.estado, c.origen, c.nombre, c.email, c.telefono, c.asunto, c.mensaje, c.proyecto?.titulo ?? '', c.notas])]
    .map((f) => f.map(celda).join(';')).join('\r\n');
  return new Response('﻿' + csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="consultas-burano-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
