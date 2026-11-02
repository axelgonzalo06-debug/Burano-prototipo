import Link from 'next/link';
import { db } from '@/lib/db';
import Panel from './Panel';

export default async function Inicio({ searchParams }: { searchParams: { error?: string } }) {
  const [proy, pub, fotos, nuevas, total, pendientes, ultimas] = await Promise.all([
    db.proyecto.count(),
    db.proyecto.count({ where: { publicado: true } }),
    db.foto.count(),
    db.consulta.count({ where: { estado: 'NUEVA' } }),
    db.consulta.count(),
    db.correo.count({ where: { estado: 'pendiente' } }),
    db.consulta.findMany({ orderBy: { creado: 'desc' }, take: 5 }),
  ]);
  return (
    <Panel ruta="/admin">
      <h1>Inicio</h1>
      <p className="sub">Resumen del sitio.</p>
      {searchParams.error === 'permiso' && <p className="aviso error">Esa sección es solo para administradores.</p>}
      <div className="kpis">
        <Link href="/admin/consultas?estado=nueva"><b>{nuevas}</b><span>consultas nuevas (de {total})</span></Link>
        <Link href="/admin/proyectos"><b>{pub}</b><span>proyectos publicados (de {proy})</span></Link>
        <Link href="/admin/proyectos"><b>{fotos}</b><span>fotos en galerías</span></Link>
        <Link href="/admin/consultas"><b>{pendientes}</b><span>correos en cola</span></Link>
      </div>
      <div className="tarjeta">
        <h2>Últimas consultas</h2>
        {ultimas.length ? (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {ultimas.map((c) => <li key={c.id}><Link href={`/admin/consultas#c-${c.id}`}>{c.nombre}</Link> · {c.asunto || 'sin asunto'} · {c.creado.toLocaleDateString('es-UY')}</li>)}
          </ul>
        ) : <p className="sub" style={{ margin: 0 }}>Todavía no llegaron consultas desde el sitio.</p>}
      </div>
      <div className="acciones">
        <Link className="b pri" href="/admin/proyectos/nuevo">Nuevo proyecto u obra</Link>
        <Link className="b" href="/admin/portada">Editar portada</Link>
      </div>
    </Panel>
  );
}
