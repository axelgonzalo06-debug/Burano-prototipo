import { db } from '@/lib/db';
import { getAjustes } from '@/lib/ajustes';
import MenuMovil from './MenuMovil';

export const MENU_BASE = [
  { texto: 'Inicio', href: '/' },
  { texto: 'Información', href: '/empresa' },
  { texto: 'Servicios', href: '/servicios' },
  { texto: 'Galería de trabajos', href: '/obras' },
  { texto: 'Proyectos', href: '/proyectos', hijos: [
    { texto: 'Vivienda', href: '/proyectos?tipo=vivienda' },
    { texto: 'Industria', href: '/proyectos?tipo=industria' },
    { texto: 'Oficinas', href: '/proyectos?tipo=oficinas' },
  ] },
  { texto: 'Contacto', href: '/contacto' },
];

// El menú editable del admin sigue alimentando el pie; la cabecera apunta a las secciones de la home.
export async function menu() {
  const items = await db.itemMenu.findMany({ where: { activo: true }, orderBy: { orden: 'asc' } }).catch(() => []);
  if (!items.length) return MENU_BASE;
  const raiz = items.filter((i) => !i.padre);
  return raiz.map((r) => ({ texto: r.texto, href: r.href, hijos: items.filter((h) => h.padre === r.id).map((h) => ({ texto: h.texto, href: h.href })) }));
}

export const ANCLAS_IZQ = [
  { texto: 'Estudio', id: 'estudio' },
  { texto: 'Servicios', id: 'servicios' },
  { texto: 'Proyectos', id: 'proyectos' },
];
export const ANCLAS_DER = [
  { texto: 'Cálculo', id: 'estructuras' },
  { texto: 'Obras', id: 'obras' },
];

export default async function Cabecera() {
  const a = await getAjustes();
  return <MenuMovil izq={ANCLAS_IZQ} der={ANCLAS_DER} direccion={`${a.direccion}, Montevideo`} />;
}
