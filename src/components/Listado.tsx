import Link from 'next/link';
import type { EstadoProyecto, Prisma, TipoProyecto } from '@prisma/client';
import { db } from '@/lib/db';
import { ESTADOS, TIPOS, visibles } from '@/lib/proyectos';
import Tarjeta from './Tarjeta';

type Filtros = { tipo?: string; estado?: string; zona?: string };

// Listado con filtros por tipo, estado y zona. Los filtros son enlaces: funcionan sin JavaScript y se pueden compartir.
export default async function Listado({ base, tipos, filtros }: { base: string; tipos: TipoProyecto[]; filtros: Filtros }) {
  const tipo = (filtros.tipo?.toUpperCase() as TipoProyecto) || undefined;
  const estado = (filtros.estado?.toUpperCase() as EstadoProyecto) || undefined;
  const where: Prisma.ProyectoWhereInput = {
    ...visibles(),
    tipo: tipo && tipos.includes(tipo) ? tipo : { in: tipos },
    ...(estado && estado in ESTADOS ? { estado } : {}),
    ...(filtros.zona ? { zona: filtros.zona } : {}),
  };
  const [lista, todos] = await Promise.all([
    db.proyecto.findMany({ where, orderBy: [{ orden: 'asc' }, { creado: 'desc' }], include: { _count: { select: { fotos: true } } } }),
    db.proyecto.findMany({ where: { ...visibles(), tipo: { in: tipos } }, select: { zona: true, estado: true } }),
  ]);
  const zonas = [...new Set(todos.map((t) => t.zona).filter(Boolean))].sort();
  const estados = [...new Set(todos.map((t) => t.estado))];
  const url = (cambio: Filtros) => {
    const q = new URLSearchParams(Object.entries({ ...filtros, ...cambio }).filter(([, v]) => v) as [string, string][]);
    const s = q.toString();
    return s ? `${base}?${s}` : base;
  };
  return (
    <>
      <div className="filtros">
        {tipos.length > 1 && (
          <div className="fila"><span>Tipo</span><div className="chips">
            <Link className="chip" aria-current={!tipo} href={url({ tipo: undefined })}>Todos</Link>
            {tipos.map((t) => <Link key={t} className="chip" aria-current={tipo === t} href={url({ tipo: t.toLowerCase() })}>{TIPOS[t]}</Link>)}
          </div></div>
        )}
        {zonas.length > 1 && (
          <div className="fila"><span>Zona</span><div className="chips">
            <Link className="chip" aria-current={!filtros.zona} href={url({ zona: undefined })}>Todas</Link>
            {zonas.map((z) => <Link key={z} className="chip" aria-current={filtros.zona === z} href={url({ zona: z })}>{z}</Link>)}
          </div></div>
        )}
        {estados.length > 1 && (
          <div className="fila"><span>Estado</span><div className="chips">
            <Link className="chip" aria-current={!estado} href={url({ estado: undefined })}>Todos</Link>
            {estados.map((e) => <Link key={e} className="chip" aria-current={estado === e} href={url({ estado: e.toLowerCase() })}>{ESTADOS[e]}</Link>)}
          </div></div>
        )}
      </div>
      {lista.length ? (
        <div className="grid">{lista.map((p) => <Tarjeta key={p.id} p={p} fotos={p._count.fotos} />)}</div>
      ) : (
        <p className="vacio">No hay trabajos con esos filtros. <Link href={base}>Ver todos</Link>.</p>
      )}
    </>
  );
}
