import type { Metadata } from 'next';
import Image from 'next/image';
import { db } from '@/lib/db';
import { getAjustes } from '@/lib/ajustes';
import { lineas } from '@/lib/proyectos';

export const metadata: Metadata = { title: 'Información', alternates: { canonical: '/empresa' } };

export default async function Empresa() {
  const [a, equipo, hitos, clientes] = await Promise.all([
    getAjustes(),
    db.integrante.findMany({ where: { activo: true }, orderBy: { orden: 'asc' } }),
    db.hito.findMany({ orderBy: [{ anio: 'asc' }, { orden: 'asc' }] }),
    db.cliente.findMany({ orderBy: { orden: 'asc' } }),
  ]);
  return (
    <>
      <section className="sec">
        <div className="wrap">
          <div className="sec-head"><h1>{a.equipoTitulo}</h1></div>
          <div className="team-intro">
            <p>{a.equipoTexto1}</p>
            <p style={{ color: 'var(--muted)' }}>{a.equipoTexto2}</p>
          </div>
          <div className="team">
            {equipo.map((m) => (
              <div className="person" key={m.id}>
                <div className="foto">{m.foto && <Image src={m.foto} alt={m.nombre} fill sizes="120px" />}</div>
                <div>
                  <h2 style={{ fontSize: 20 }}>{m.nombre}</h2>
                  <p>{m.titulo}{m.celular ? `\nCel.: ${m.celular}` : ''}</p>
                  {m.linkedin && <p><a href={m.linkedin} target="_blank" rel="noopener">LinkedIn</a></p>}
                  {(m.experiencia || m.diplomas) && (
                    <details>
                      <summary>Experiencia</summary>
                      <ul>{lineas(m.experiencia).map((l) => <li key={l}>{l}</li>)}</ul>
                      {m.diplomas && (
                        <>
                          <p style={{ marginTop: 10, fontWeight: 600, color: 'var(--ink)' }}>Diplomas extracurriculares</p>
                          <ul>{lineas(m.diplomas).map((l) => <li key={l}>{l}</li>)}</ul>
                        </>
                      )}
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {hitos.length > 0 && (
        <section className="sec" style={{ background: 'var(--surface)' }}>
          <div className="wrap intro">
            <h2 style={{ fontSize: 'clamp(28px,3.4vw,46px)' }}>Historia</h2>
            <ol className="linea">
              {hitos.map((h) => <li key={h.id}><b>{h.anio}</b><p style={{ fontWeight: 600, marginTop: 4 }}>{h.titulo}</p>{h.texto && <p style={{ color: 'var(--muted)' }}>{h.texto}</p>}</li>)}
            </ol>
          </div>
        </section>
      )}
      {clientes.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <div className="sec-head"><h2>Clientes</h2></div>
            <div className="clientes">
              {clientes.map((c) => c.url
                ? <a key={c.id} href={c.url} target="_blank" rel="noopener">{c.logo ? <img src={c.logo} alt={c.nombre} style={{ maxHeight: 48 }} /> : c.nombre}</a>
                : <div key={c.id}>{c.logo ? <img src={c.logo} alt={c.nombre} style={{ maxHeight: 48 }} /> : c.nombre}</div>)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
