import Link from 'next/link';
import { db } from '@/lib/db';
import { getAjustes } from '@/lib/ajustes';
import { visibles } from '@/lib/proyectos';
import Carrusel from '@/components/Carrusel';
import Trazo from '@/components/Trazo';
import Contador from '@/components/Contador';
import Tarjeta from '@/components/Tarjeta';

export default async function Inicio() {
  const [a, slides, stats, destacados] = await Promise.all([
    getAjustes(),
    db.diapositiva.findMany({ where: { activa: true }, orderBy: { orden: 'asc' } }),
    db.indicador.findMany({ orderBy: { orden: 'asc' } }),
    db.proyecto.findMany({ where: { ...visibles(), destacado: true }, orderBy: { orden: 'asc' }, take: 6, include: { _count: { select: { fotos: true } } } }),
  ]);
  const partes = a.lema.split('|').map((s) => s.trim());
  return (
    <>
      <div className="hero">
        <div className="hero-text">
          <Trazo />
          <p className="eyebrow">{a.nombre} · Montevideo</p>
          <h1>
            {partes.map((p, k) => (
              <span key={p}>{k > 0 && <span className="sep" aria-hidden="true" />}{p}</span>
            ))}
          </h1>
          <div className="btns">
            <Link className="btn primario" href="/obras">Galería de trabajos</Link>
            <Link className="btn" href="/servicios">Servicios</Link>
          </div>
        </div>
        <Carrusel slides={slides} />
      </div>

      {stats.length > 0 && (
        <div className="stats" aria-label="Indicadores">
          <div className="wrap">
            {stats.map((s) => (
              <div className="stat" key={s.id}>
                <b><span className="num">{s.prefijo && <em>{s.prefijo}</em>}<Contador valor={s.valor} /></span>{s.sufijo && <small> {s.sufijo}</small>}</b>
                <span>{s.texto}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <section className="sec">
        <div className="wrap">
          <div className="intro">
            <p className="idx"><b>01</b>Quiénes somos</p>
            <p>{a.intro}</p>
          </div>
        </div>
      </section>

      {destacados.length > 0 && (
        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <div><p className="idx" style={{ marginBottom: 14 }}><b>02</b>Obras</p><h2>Galería de trabajos</h2></div>
              <Link className="btn" href="/obras">Ver todas las obras</Link>
            </div>
            <div className="grid editorial">
              {destacados.map((p) => <Tarjeta key={p.id} p={p} fotos={p._count.fotos} />)}
            </div>
          </div>
        </section>
      )}

      <section className="sec mision" style={slides[1] ? ({ '--fondo': `url(${slides[1].imagen})` } as React.CSSProperties) : undefined}>
        <div className="wrap">
          <img src="/isotipo-claro.png" alt="" width={84} height={60} />
          <blockquote>{a.mision}</blockquote>
          <div className="btns" style={{ marginTop: 34 }}>
            <Link className="btn primario" href="/contacto">Contacto</Link>
          </div>
        </div>
      </section>
    </>
  );
}
