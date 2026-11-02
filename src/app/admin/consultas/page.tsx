import Link from 'next/link';
import type { EstadoConsulta } from '@prisma/client';
import { db } from '@/lib/db';
import Panel from '../Panel';
import { estadoConsulta, reintentarCorreos, responderConsulta } from '../acciones';

const ESTADOS: Record<EstadoConsulta, string> = { NUEVA: 'Nueva', RESPONDIDA: 'Respondida', CERRADA: 'Cerrada' };

export default async function Consultas({ searchParams }: { searchParams: { estado?: string; origen?: string; ok?: string; error?: string; enviados?: string; pendientes?: string } }) {
  const estado = searchParams.estado?.toUpperCase() as EstadoConsulta | undefined;
  const [lista, origenes, cola] = await Promise.all([
    db.consulta.findMany({
      where: { ...(estado && estado in ESTADOS ? { estado } : {}), ...(searchParams.origen ? { origen: searchParams.origen } : {}) },
      orderBy: { creado: 'desc' }, take: 200, include: { proyecto: { select: { titulo: true, slug: true } } },
    }),
    db.consulta.groupBy({ by: ['origen'], _count: true }),
    db.correo.findMany({ where: { estado: 'pendiente' }, orderBy: { creado: 'asc' } }),
  ]);
  return (
    <Panel ruta="/admin/consultas">
      <div className="cab-pag">
        <div><h1>Consultas</h1><p className="sub">Lo que llega desde el formulario del sitio y desde cada ficha de obra.</p></div>
        <a className="b" href="/api/admin/consultas-csv">Exportar CSV</a>
      </div>
      {searchParams.ok === 'respondida' && <p className="aviso">Respuesta enviada (o en cola si Resend no tenía cupo).</p>}
      {searchParams.ok === 'cola' && <p className="aviso">Se enviaron {searchParams.enviados} correos. Quedan {searchParams.pendientes} en cola.</p>}
      {searchParams.ok === '1' && <p className="aviso">Guardado.</p>}
      {searchParams.error === 'vacia' && <p className="aviso error">Escribí la respuesta antes de enviar.</p>}
      {cola.length > 0 && (
        <form action={reintentarCorreos} className="tarjeta">
          <h2>{cola.length} correos en cola</h2>
          <p className="sub">Probablemente se agotó el cupo diario de Resend. Último error: {cola[0].error || 'sin detalle (¿falta RESEND_API_KEY?)'}</p>
          <button className="b" type="submit">Reintentar ahora</button>
        </form>
      )}
      <div className="filtros">
        <Link href="/admin/consultas" aria-current={!estado && !searchParams.origen}>Todas</Link>
        {Object.entries(ESTADOS).map(([k, v]) => <Link key={k} href={`/admin/consultas?estado=${k.toLowerCase()}`} aria-current={estado === k}>{v}</Link>)}
        {origenes.map((o) => <Link key={o.origen} href={`/admin/consultas?origen=${encodeURIComponent(o.origen)}`} aria-current={searchParams.origen === o.origen}>{o.origen} ({o._count})</Link>)}
      </div>
      {!lista.length && <p className="tarjeta sub">Todavía no hay consultas con este filtro.</p>}
      <div className="lista-simple">
        {lista.map((c) => (
          <details key={c.id} id={`c-${c.id}`} className="item" open={c.estado === 'NUEVA'}>
            <summary>
              <span>{c.nombre} · {c.asunto || 'sin asunto'}</span>
              <span><span className={`pill p-${c.estado.toLowerCase()}`}>{ESTADOS[c.estado]}</span> <span className="sub" style={{ fontWeight: 400 }}>{c.creado.toLocaleString('es-UY', { dateStyle: 'short', timeStyle: 'short' })}</span></span>
            </summary>
            <div>
              <p style={{ margin: '0 0 6px' }}><a href={`mailto:${c.email}`}>{c.email}</a>{c.telefono && ` · ${c.telefono}`} · origen: {c.origen}{c.proyecto && <> · <Link href={`/admin/proyectos/${c.proyectoId}`}>{c.proyecto.titulo}</Link></>}</p>
              <p style={{ whiteSpace: 'pre-line', background: '#f6f7f9', padding: 12, borderRadius: 8 }}>{c.mensaje || '(sin mensaje)'}</p>
              <form action={responderConsulta} style={{ display: 'grid', gap: 8, marginTop: 10 }}>
                <input type="hidden" name="id" value={c.id} />
                <label>Responder por correo<textarea name="respuesta" rows={4} defaultValue={`Hola ${c.nombre.split(' ')[0]}, gracias por escribirnos.\n\n\n\nSaludos,\nBurano S.R.L.`} /></label>
                <div><button className="b pri" type="submit">Enviar respuesta</button></div>
              </form>
              <form action={estadoConsulta} className="campos" style={{ marginTop: 14 }}>
                <input type="hidden" name="id" value={c.id} />
                <label>Estado<select name="estado" defaultValue={c.estado}>{Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
                <label className="full">Notas internas<textarea name="notas" defaultValue={c.notas} rows={3} /></label>
                <div className="acciones full" style={{ marginTop: 0 }}><button className="b" type="submit">Guardar estado y notas</button></div>
              </form>
            </div>
          </details>
        ))}
      </div>
    </Panel>
  );
}
