import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { rutaProyecto, visibles } from '@/lib/proyectos';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = process.env.NEXT_PUBLIC_SITIO_URL || 'https://www.burano.com.uy';
  const proyectos = await db.proyecto.findMany({ where: visibles(), select: { slug: true, tipo: true, actualizado: true, portada: true } }).catch(() => []);
  // Las páginas fijas toman la fecha de la obra más reciente, que es lo que cambia su contenido.
  const ultima = proyectos.reduce<Date | undefined>((m, p) => (!m || p.actualizado > m ? p.actualizado : m), undefined);
  const fijas = ['', '/empresa', '/servicios', '/obras', '/proyectos', '/contacto'].map((r) => ({ url: `${url}${r}`, lastModified: ultima, changeFrequency: 'weekly' as const, priority: r ? 0.7 : 1 }));
  return [...fijas, ...proyectos.map((p) => ({ url: `${url}${rutaProyecto(p)}`, lastModified: p.actualizado, changeFrequency: 'monthly' as const, images: p.portada ? [p.portada] : undefined, priority: 0.6 }))];
}
