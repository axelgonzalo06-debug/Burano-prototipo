import type { EstadoProyecto, TipoProyecto, Prisma } from '@prisma/client';
import { db } from './db';

export const TIPOS: Record<TipoProyecto, string> = { VIVIENDA: 'Vivienda', INDUSTRIA: 'Industria', OFICINAS: 'Oficinas', OBRA: 'Obras' };
export const ESTADOS: Record<EstadoProyecto, string> = { TERMINADO: 'Terminado', EN_OBRA: 'En obra', EN_VENTA: 'En venta', EN_POZO: 'En pozo' };

export const visibles = (): Prisma.ProyectoWhereInput => ({
  publicado: true,
  OR: [{ publicarDesde: null }, { publicarDesde: { lte: new Date() } }],
});

// Obras (servicios sobre edificios existentes) viven en /obras; los proyectos de arquitectura en /proyectos.
export const rutaProyecto = (p: { tipo: TipoProyecto; slug: string }) => (p.tipo === 'OBRA' ? `/obras/${p.slug}` : `/proyectos/${p.slug}`);

export async function proyectoPublico(slug: string, borrador = false) {
  return db.proyecto.findFirst({
    where: { slug, ...(borrador ? {} : visibles()) },
    include: { fotos: { orderBy: { orden: 'asc' } }, archivos: { orderBy: { orden: 'asc' } } },
  });
}

export function lineas(s: string) {
  return s.split('\n').map((l) => l.trim()).filter(Boolean);
}
