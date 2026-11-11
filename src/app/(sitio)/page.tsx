import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getAjustes } from '@/lib/ajustes';
import { TIPOS, lineas, rutaProyecto, visibles } from '@/lib/proyectos';
import Carrusel from '@/components/Carrusel';
import Trazo from '@/components/Trazo';
import Contador from '@/components/Contador';
import ParrafoScroll from '@/components/ParrafoScroll';
import Recorrido, { type ItemRecorrido } from '@/components/Recorrido';
import FormPresupuesto from '@/components/FormPresupuesto';
import { superficie } from '@/components/Tarjeta';

// Proyectos del recorrido fijado de #proyectos, en este orden.
const RECORRIDO = ['vivienda-san-francisco', 'vivienda-jacaranda', 'silos-puntas-de-valdez', 'hotel-hea-windham-montevideo', 'oficinas-wework-uruguay'];

function Etiqueta({ n, t }: { n: number; t: string }) {
  return <p className="lbl rv-label"><b>{String(n).padStart(2, '0')}</b><i aria-hidden="true" /><span>{t}</span></p>;
}

// "12.300 m2" → 12300 (se toma solo la cifra antes de "m2")
const metros = (s: string) => Number((s.match(/[\d.]+/)?.[0] || '').replace(/\./g, '')) || 0;

export default async function Inicio() {
  const [a, slides, stats, servicios, calculo, equipo, reco, obras, totalObras] = await Promise.all([
    getAjustes(),
    db.diapositiva.findMany({ where: { activa: true }, orderBy: { orden: 'asc' } }),
    db.indicador.findMany({ orderBy: { orden: 'asc' } }),
    db.servicio.findMany({ orderBy: { orden: 'asc' } }),
    db.trabajoCalculo.findMany({ orderBy: { orden: 'asc' } }),
    db.integrante.findMany({ where: { activo: true }, orderBy: { orden: 'asc' } }),
    db.proyecto.findMany({ where: { ...visibles(), slug: { in: RECORRIDO } }, include: { _count: { select: { fotos: true } } } }),
    db.proyecto.findMany({ where: { ...visibles(), tipo: 'OBRA', slug: { notIn: RECORRIDO } }, orderBy: [{ orden: 'asc' }, { creado: 'desc' }], take: 12 }),
    db.proyecto.count({ where: { ...visibles(), tipo: 'OBRA' } }),
  ]);
  const lineasHero = a.lema.split('|').map((s) => s.trim());

  const items: ItemRecorrido[] = RECORRIDO.map((s) => reco.find((p) => p.slug === s)).filter((p) => !!p).map((p) => {
    const m2 = superficie(p);
    return {
      slug: p.slug,
      titulo: p.titulo,
      categoria: TIPOS[p.tipo],
      href: rutaProyecto(p),
      foto: p.portada,
      datos: [
        ['Ubicación', p.ubicacion],
        m2 ? ['Superficie', m2] : ['Tipo', p.programa || TIPOS[p.tipo]],
        ['Registro', `${p._count.fotos} fotos`],
      ].filter(([, v]) => v) as [string, string][],
    };
  });

  // Seis obras distintas (Wix tiene dos fichas con el mismo nombre)
  const vistos = new Set<string>();
  const seis = obras.filter((o) => !vistos.has(o.titulo) && vistos.add(o.titulo)).slice(0, 6);

  const mayor = Math.max(...calculo.map((c) => metros(c.metros)), 1);
  const estructuras = stats.find((s) => s.sufijo === 'm²' && s.valor >= 50000);
  const fotoServicios = slides[3]?.imagen || slides[0]?.imagen;
  const fotoContacto = slides[1]?.imagen;
  const mision = a.mision.split(/(cordial)/);

  return (
    <div className="landing">
      <section id="inicio" className="hero" data-tone="hero">
        <div className="hero-text">
          <Trazo />
          <p className="eyebrow hero-in">{a.nombre} · Montevideo</p>
          <h1 aria-label={lineasHero.join(', ')}>
            {lineasHero.map((p, k) => (
              <span className="l" key={p} style={{ '--k': k } as React.CSSProperties} aria-hidden="true"><span>{p}</span></span>
            ))}
          </h1>
          <div className="btns hero-in">
            <a className="btn primario" href="#obras">Galería de trabajos</a>
            <a className="btn" href="#servicios">Servicios</a>
          </div>
        </div>
        <Carrusel slides={slides} />
      </section>

      <section id="estudio" className="sec" data-tone="light">
        <div className="wrap">
          <Etiqueta n={1} t="Estudio" />
          <h2 className="rv-lines">Quiénes somos</h2>
          <div className="estudio-texto"><ParrafoScroll texto={a.intro} /></div>
          {stats.length > 0 && (
            <div className="cifras" aria-label="Indicadores">
              {stats.map((s) => (
                <div className="cifra rv-up" key={s.id}>
                  <b>{s.prefijo}<Contador valor={s.valor} />{s.sufijo && <> <small>{s.sufijo}</small></>}</b>
                  <span>{s.texto}</span>
                </div>
              ))}
            </div>
          )}
          {equipo.length > 0 && (
            <div className="equipo">
              {equipo.map((m) => {
                const anio = m.titulo.match(/^\d{4}/)?.[0] || '';
                const rol = m.titulo.replace(/^\d{4}\s*/, '');
                const exp = lineas(m.experiencia);
                return (
                  <article className="miembro rv-up" key={m.id}>
                    <div className="miembro-foto">
                      {m.foto && <Image src={m.foto} alt={`Retrato de ${m.nombre}, ${rol}`} fill sizes="(max-width: 640px) 100vw, 33vw" />}
                    </div>
                    <div className="miembro-txt">
                      <p className="miembro-rol">{rol}{anio && <> · <span>{anio}</span></>}</p>
                      <h3>{m.nombre}</h3>
                      {exp.length > 0 && <p className="miembro-exp">{exp[1] || exp[0]}</p>}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          <p className="ver-todo rv-up"><Link href="/empresa">Ver todo el equipo →</Link></p>
        </div>
      </section>

      <section id="servicios" className="sec" data-tone="light">
        <div className="wrap">
          <Etiqueta n={2} t="Servicios" />
          <h2 className="rv-lines">Del plano a la obra con un solo equipo</h2>
          {fotoServicios && (
            <div className="rv-img foto-ancha"><div className="rv-img-in"><Image src={fotoServicios} alt="Obra de Burano" fill sizes="100vw" /></div></div>
          )}
          <div className="servicios3">
            {servicios.map((s) => {
              const dest = new Set(lineas(s.destacados));
              return (
                <article key={s.id} className="rv-up">
                  <h3>{s.titulo}</h3>
                  {s.intro && <p className="intro-serv">{s.intro}</p>}
                  <ul>{lineas(s.items).filter((l) => !dest.has(l)).map((l) => <li key={l}>{l}</li>)}</ul>
                </article>
              );
            })}
          </div>
          <div className="serv-pie rv-up">
            {servicios.flatMap((s) => lineas(s.destacados)).map((d) => <span key={d}>{d}</span>)}
            <a href="#estructuras">Cálculo de estructuras →</a>
            <Link href="/servicios">Ver todo →</Link>
          </div>
        </div>
      </section>

      {items.length > 0 && (
        <section id="proyectos" className="oscura" data-tone="dark">
          <div className="wrap reco-cab">
            <Etiqueta n={3} t="Proyectos" />
            <div className="cab-fila">
              <h2 className="rv-lines">Proyectos</h2>
              <Link className="ver-todo" href="/proyectos">Ver todos →</Link>
            </div>
          </div>
          <Recorrido items={items} />
        </section>
      )}

      {calculo.length > 0 && (
        <section id="estructuras" className="sec" data-tone="light">
          <div className="wrap">
            <Etiqueta n={4} t="Cálculo de estructuras" />
            <h2 className="rv-lines">Torres y edificios que calculamos</h2>
            <div className="estr">
              {estructuras && (
                <div className="estr-total rv-up">
                  <b>{estructuras.prefijo}<Contador valor={estructuras.valor} /> <small>{estructuras.sufijo}</small></b>
                  <span>{estructuras.texto}</span>
                </div>
              )}
              <div>
                <p className="eyebrow">{a.calculoTitulo}</p>
                <ul className="estr-lista">
                  {calculo.map((c) => (
                    <li key={c.id} className="rv-bar">
                      <span className="estr-nom">{c.nombre} <span>/ {c.lugar}</span></span>
                      <b><Contador valor={metros(c.metros)} anio={false} /> m²</b>
                      <i style={{ '--w': metros(c.metros) / mayor } as React.CSSProperties} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {seis.length > 0 && (
        <section id="obras" className="sec" data-tone="light">
          <div className="wrap">
            <Etiqueta n={5} t="Obras" />
            <h2 className="rv-lines">Galería de trabajos</h2>
            <div className="obras3">
              {seis.map((o) => (
                <Link key={o.id} href={rutaProyecto(o)} className="obra rv-up">
                  <div className="rv-img"><div className="rv-img-in">{o.portada && <Image src={o.portada} alt={o.titulo} fill sizes="(max-width: 640px) 100vw, (max-width: 1023px) 50vw, 33vw" />}</div></div>
                  <h3><span>{o.titulo}</span></h3>
                  {o.zona && <p>{o.zona}</p>}
                </Link>
              ))}
            </div>
            <p className="ver-todo rv-up"><Link href="/obras">Ver las {totalObras} obras →</Link></p>
          </div>
        </section>
      )}

      <section id="contacto" className="sec oscura contacto-sec" data-tone="dark" style={fotoContacto ? ({ '--fondo': `url(${fotoContacto})` } as React.CSSProperties) : undefined}>
        <div className="wrap">
          <Etiqueta n={6} t="Contacto" />
          <h2 className="mision-h rv-words">{mision.map((m, k) => (m === 'cordial' ? <em key={k}>{m}</em> : m))}</h2>
          <div className="contacto-grid">
            <dl className="contacto-datos rv-up">
              <div><dt>Oficina</dt><dd>{a.direccion}, Montevideo</dd></div>
              <div><dt>Correo</dt><dd><a href={`mailto:${a.email}`}>{a.email}</a></dd></div>
              {a.facebook && <div><dt>Facebook</dt><dd><a href={a.facebook} target="_blank" rel="noopener">BuranoSRL →</a></dd></div>}
            </dl>
            <div className="rv-up"><FormPresupuesto /></div>
          </div>
        </div>
      </section>
    </div>
  );
}
