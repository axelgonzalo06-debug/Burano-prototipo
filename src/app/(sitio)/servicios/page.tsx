import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getAjustes } from '@/lib/ajustes';
import { lineas } from '@/lib/proyectos';
import { metaPagina } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const servicios = await db.servicio.findMany({ orderBy: { orden: 'asc' }, select: { titulo: true } });
  return metaPagina({ titulo: 'Servicios', descripcion: servicios.map((s) => s.titulo).join(' · '), ruta: '/servicios' });
}

export default async function Servicios() {
  const [a, servicios, calculo] = await Promise.all([
    getAjustes(),
    db.servicio.findMany({ orderBy: { orden: 'asc' } }),
    db.trabajoCalculo.findMany({ orderBy: { orden: 'asc' } }),
  ]);
  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head"><h1>{a.serviciosTitulo}</h1></div>
        <div className="serv">
          {servicios.map((s) => {
            const dest = new Set(lineas(s.destacados));
            return (
              <article key={s.id}>
                <h2 style={{ fontSize: 'clamp(32px,3.2vw,44px)', marginBottom: 18 }}>{s.titulo}</h2>
                {s.intro && <p className="intro-serv">{s.intro}</p>}
                <ul>{lineas(s.items).map((l) => <li key={l} className={dest.has(l) ? 'destacado' : ''}>{l}</li>)}</ul>
              </article>
            );
          })}
        </div>
        {calculo.length > 0 && (
          <div className="calc">
            <p className="eyebrow">{a.calculoTitulo}</p>
            <table><tbody>
              {calculo.map((t) => (
                <tr key={t.id}><td>{t.nombre} <span className="loc">/ {t.lugar}</span></td><td>{t.metros}</td></tr>
              ))}
            </tbody></table>
          </div>
        )}
        <div className="btns" style={{ marginTop: 56 }}>
          <Link className="btn primario" href="/contacto">Contacto</Link>
          <Link className="btn" href="/obras">Galería de trabajos</Link>
        </div>
      </div>
    </section>
  );
}
