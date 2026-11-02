import Link from 'next/link';
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

export async function menu() {
  const items = await db.itemMenu.findMany({ where: { activo: true }, orderBy: { orden: 'asc' } }).catch(() => []);
  if (!items.length) return MENU_BASE;
  const raiz = items.filter((i) => !i.padre);
  return raiz.map((r) => ({ texto: r.texto, href: r.href, hijos: items.filter((h) => h.padre === r.id).map((h) => ({ texto: h.texto, href: h.href })) }));
}

export default async function Cabecera() {
  const [items, a] = await Promise.all([menu(), getAjustes()]);
  return (
    <header className="cab">
      <a className="saltar" href="#contenido">Saltar al contenido</a>
      <div className="wrap">
        <Link className="logo" href="/" aria-label="Burano, inicio">
          <img src="/isotipo.png" alt="" width={56} height={40} />
          <span>
            <b>Burano</b>
            <small>{a.lema}</small>
          </span>
        </Link>
        <MenuMovil>
          <ul className="menu">
            {items.map((i) => (
              <li key={i.href + i.texto}>
                <Link href={i.href}>{i.texto}</Link>
                {i.hijos && i.hijos.length > 0 && (
                  <ul>
                    {i.hijos.map((h) => (
                      <li key={h.href}><Link href={h.href}>{h.texto}</Link></li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </MenuMovil>
      </div>
    </header>
  );
}
