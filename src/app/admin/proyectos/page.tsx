import Link from 'next/link';
import type { TipoProyecto } from '@prisma/client';
import { db } from '@/lib/db';
import { ESTADOS, TIPOS, rutaProyecto } from '@/lib/proyectos';
import Panel from '../Panel';

export default async function Proyectos({ searchParams }: { searchParams: { tipo?: string; ok?: string } }) {
  const tipo = searchParams.tipo?.toUpperCase() as TipoProyecto | undefined;
  const lista = await db.proyecto.findMany({
    where: tipo && tipo in TIPOS ? { tipo } : {},
    orderBy: [{ orden: 'asc' }, { creado: 'desc' }],
    include: { _count: { select: { fotos: true, consultas: true } } },
  });
  const ahora = new Date();
  return (
    <Panel ruta="/admin/proyectos">
      <div className="cab-pag">
        <div><h1>Proyectos y obras</h1><p className="sub">{lista.length} fichas. El orden define cómo aparecen en el sitio.</p></div>
        <Link className="b pri" href="/admin/proyectos/nuevo">Nuevo proyecto u obra</Link>
      </div>
      {searchParams.ok === 'borrado' && <p className="aviso">Ficha borrada.</p>}
      <div className="filtros">
        <Link href="/admin/proyectos" aria-current={!tipo}>Todos</Link>
        {Object.entries(TIPOS).map(([k, v]) => <Link key={k} href={`/admin/proyectos?tipo=${k.toLowerCase()}`} aria-current={tipo === k}>{v}</Link>)}
      </div>
      <div className="tabla">
        <table>
          <thead><tr><th></th><th>Título</th><th>Tipo</th><th>Estado</th><th>Fotos</th><th>Publicación</th><th>Orden</th><th></th></tr></thead>
          <tbody>
            {lista.map((p) => {
              const prog = p.publicado && p.publicarDesde && p.publicarDesde > ahora;
              return (
                <tr key={p.id}>
                  <td className="min">{p.portada ? <img className="mini" src={p.portada} alt="" /> : <div className="mini" />}</td>
                  <td><Link href={`/admin/proyectos/${p.id}`} style={{ fontWeight: 600 }}>{p.titulo}</Link>{p.destacado && <span className="pill p-obra" style={{ marginLeft: 8 }}>Portada</span>}<br /><span className="sub" style={{ fontSize: 12.5 }}>{p.ubicacion}</span></td>
                  <td>{TIPOS[p.tipo]}</td>
                  <td>{ESTADOS[p.estado]}{p.avance != null ? ` · ${p.avance} %` : ''}</td>
                  <td>{p._count.fotos}</td>
                  <td>{prog ? <span className="pill p-prog">Programado {p.publicarDesde!.toLocaleDateString('es-UY')}</span> : p.publicado ? <span className="pill p-pub">Publicado</span> : <span className="pill p-borr">Borrador</span>}</td>
                  <td>{p.orden}</td>
                  <td className="min"><a className="b chico" href={`/api/vista-previa?ruta=${encodeURIComponent(rutaProyecto(p))}`} target="_blank">Vista previa</a></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
