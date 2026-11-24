import Link from 'next/link';
import { db } from '@/lib/db';
import { exigirUsuario } from '@/lib/auth';
import { APP_VERSION } from '@/lib/version';
import { salir } from './acciones';

const SECCIONES: { titulo: string; items: { href: string; texto: string; soloAdmin?: boolean }[] }[] = [
  { titulo: 'Contenido', items: [
    { href: '/admin/proyectos', texto: 'Proyectos y obras' },
    { href: '/admin/portada', texto: 'Portada e indicadores' },
    { href: '/admin/servicios', texto: 'Servicios' },
    { href: '/admin/equipo', texto: 'Equipo' },
    { href: '/admin/historia', texto: 'Historia y clientes' },
  ] },
  { titulo: 'Comercial', items: [{ href: '/admin/consultas', texto: 'Consultas' }] },
  { titulo: 'Sitio', items: [
    { href: '/admin/menu', texto: 'Menú' },
    { href: '/admin/ajustes', texto: 'Ajustes y textos', soloAdmin: true },
    { href: '/admin/usuarios', texto: 'Usuarios', soloAdmin: true },
    { href: '/admin/historial', texto: 'Historial' },
  ] },
];

// Marco común de todas las pantallas del administrador (menú lateral + contenido).
export default async function Panel({ children, ruta }: { children: React.ReactNode; ruta: string }) {
  const s = await exigirUsuario();
  const nuevas = await db.consulta.count({ where: { estado: 'NUEVA' } });
  return (
    <>
      <aside>
        <Link href="/admin" className="marca" style={{ textDecoration: 'none' }}><img src="/isotipo-claro.png" alt="" /> BURANO</Link>
        <Link href="/admin" aria-current={ruta === '/admin' ? 'page' : undefined}>Inicio</Link>
        {SECCIONES.map((sec) => (
          <div key={sec.titulo} style={{ display: 'contents' }}>
            <small>{sec.titulo}</small>
            {sec.items.filter((i) => !i.soloAdmin || s.rol === 'ADMIN').map((i) => (
              <Link key={i.href} href={i.href} aria-current={ruta.startsWith(i.href) ? 'page' : undefined}>
                <span>{i.texto}</span>
                {i.href === '/admin/consultas' && nuevas > 0 && <span className="badge">{nuevas}</span>}
              </Link>
            ))}
          </div>
        ))}
        <div className="pie">
          <span>{s.nombre} · {s.rol === 'ADMIN' ? 'Administrador' : 'Editor'}</span>
          <a href="/" target="_blank">Ver sitio ↗</a>
          <form action={salir}><button className="b chico" type="submit">Salir</button></form>
          <span>Versión {APP_VERSION}</span>
        </div>
      </aside>
      <main>{children}</main>
    </>
  );
}
