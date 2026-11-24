import { Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import type { Metadata } from 'next';
import { metaPagina } from '@/lib/seo';
import { db } from '@/lib/db';
import { getAjustes, waLink } from '@/lib/ajustes';
import { ESTADOS, TIPOS, lineas, proyectoPublico, rutaProyecto, visibles } from '@/lib/proyectos';
import AntesDespues from './AntesDespues';
import Galeria from './Galeria';
import FormContacto from './FormContacto';
import Tarjeta from './Tarjeta';

export async function metaFicha(slug: string): Promise<Metadata> {
  const p = await proyectoPublico(slug, (await draftMode()).isEnabled);
  if (!p) return {};
  const desc = [p.ubicacion, p.trabajos || p.descripcion || p.situacionPrevia].filter(Boolean).join(' · ');
  return metaPagina({ titulo: p.titulo, descripcion: desc, ruta: rutaProyecto(p), tipo: 'article', imagen: p.portada ? { url: p.portada, width: p.portadaAncho, height: p.portadaAlto } : undefined });
}

export default async function Ficha({ slug, base }: { slug: string; base: 'obras' | 'proyectos' }) {
  const borrador = (await draftMode()).isEnabled;
  const p = await proyectoPublico(slug, borrador);
  if (!p || (base === 'obras') !== (p.tipo === 'OBRA')) notFound();
  const a = await getAjustes();
  const previas = p.fotos.filter((f) => f.previa && !f.avance);
  const finales = p.fotos.filter((f) => !f.previa && !f.avance);
  const avance = p.fotos.filter((f) => f.avance);
  const relacionados = await db.proyecto.findMany({ where: { ...visibles(), tipo: p.tipo, NOT: { id: p.id } }, orderBy: { orden: 'asc' }, take: 3 });
  const url = process.env.NEXT_PUBLIC_SITIO_URL || 'https://www.burano.com.uy';
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'CreativeWork', name: p.titulo, about: TIPOS[p.tipo], locationCreated: p.ubicacion ? { '@type': 'Place', name: p.ubicacion, ...(p.lat && p.lng ? { geo: { '@type': 'GeoCoordinates', latitude: p.lat, longitude: p.lng } } : {}) } : undefined, image: p.fotos.slice(0, 6).map((f) => f.url), creator: { '@type': 'GeneralContractor', name: a.nombre, url } },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: url },
        { '@type': 'ListItem', position: 2, name: base === 'obras' ? 'Galería de trabajos' : 'Proyectos', item: `${url}/${base}` },
        { '@type': 'ListItem', position: 3, name: p.titulo, item: `${url}${rutaProyecto(p)}` },
      ] },
    ],
  };
  const wa = waLink(a.whatsapp, `Hola, vi «${p.titulo}» en el sitio de Burano y quisiera consultar.`);
  const datos: [string, string][] = [];
  if (p.ubicacion) datos.push(['Ubicación', p.ubicacion]);
  if (p.programa) datos.push(['Programa', p.programa]);
  for (const l of lineas(p.superficies)) {
    const [k, ...v] = l.split(':');
    datos.push([k.trim(), v.join(':').trim()]);
  }
  if (p.estado !== 'TERMINADO') datos.push(['Estado', ESTADOS[p.estado]]);
  if (p.entrega) datos.push(['Entrega', p.entrega]);
  if (p.situacionPrevia) datos.push(['Situación previa', p.situacionPrevia]);
  if (p.trabajos) datos.push(['Trabajos realizados', p.trabajos]);

  const fotoPrincipal = finales[0] ?? p.fotos[0];
  return (
    <article className="ficha">
      {borrador && <p style={{ background: '#ffe9a8', padding: '8px 20px', fontWeight: 600 }}>Vista previa: {p.publicado ? 'publicado' : 'borrador sin publicar'}. <a href="/api/vista-previa/salir">Salir de la vista previa</a></p>}
      <div className="wrap ficha-top">
        <nav className="migas" aria-label="Ubicación en el sitio">
          <Link href="/">Inicio</Link><span>/</span>
          <Link href={base === 'obras' ? '/obras' : `/proyectos?tipo=${p.tipo.toLowerCase()}`}>{base === 'obras' ? 'Galería de trabajos' : TIPOS[p.tipo]}</Link>
        </nav>
      </div>
      <section className="sec" style={{ paddingTop: 24 }}>
        <div className="wrap ficha-grid">
          <div className="ficha-cab">
            <p className="tag">{TIPOS[p.tipo]}</p>
            <h1>{p.titulo}</h1>
            {p.subtitulo && <p className="meta" style={{ marginTop: 10, fontSize: 16 }}>{p.subtitulo}</p>}
          </div>
          <div className="ficha-media">
            {previas.length > 0 && finales.length > 0 ? (
              <AntesDespues antes={previas[0].url} despues={finales[0].url} titulo={p.titulo} />
            ) : fotoPrincipal ? (
              <div className="principal"><Image src={fotoPrincipal.url} alt={fotoPrincipal.alt || p.titulo} fill priority sizes="(max-width: 900px) 100vw, 58vw" /></div>
            ) : null}
            <Galeria titulo={p.titulo} fotos={[...previas, ...finales].map((f) => ({ url: f.url, alt: f.alt, pie: f.pie, previa: f.previa }))} />
            <p className="meta" style={{ marginTop: 10 }}>{p.fotos.length} fotos{previas.length ? ` · ${previas.length} de la situación previa` : ''}</p>
          </div>
          <div className="ficha-info">
            <dl className="dl">{datos.map(([k, v], i) => <Fragment key={i}><dt>{k}</dt><dd>{v}</dd></Fragment>)}</dl>
            {p.descripcion && <p className="texto-largo" style={{ marginTop: 22 }}>{p.descripcion}</p>}
            {p.avance != null && (
              <div className="avance">
                <p className="eyebrow">Avance de obra · {p.avance} %</p>
                <div className="barra" role="progressbar" aria-valuenow={p.avance} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${p.avance}%` }} /></div>
              </div>
            )}
            {p.archivos.length > 0 && (
              <div className="descargas">
                {p.archivos.map((f) => <a key={f.id} href={f.url} target="_blank" rel="noopener"><span>{f.nombre}</span><span>{f.tipo} ↓</span></a>)}
              </div>
            )}
            {p.lat && p.lng && (
              <p className="mapa"><a href={`https://www.google.com/maps?q=${p.lat},${p.lng}`} target="_blank" rel="noopener">Ver ubicación en el mapa →</a></p>
            )}
            <div className="btns" style={{ marginTop: 28 }}>
              <a className="btn primario" href="#consulta">Consultar por una obra similar</a>
              {wa && <a className="btn wa" href={wa} target="_blank" rel="noopener">WhatsApp</a>}
            </div>
          </div>
        </div>
      </section>
      {avance.length > 0 && (
        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <h2 style={{ fontSize: 38, marginBottom: 16 }}>Avance de obra</h2>
            <Galeria titulo={`${p.titulo}, avance`} fotos={avance.map((f) => ({ url: f.url, alt: f.alt, pie: f.pie, previa: false, fecha: f.fecha ? f.fecha.toLocaleDateString('es-UY') : null }))} />
          </div>
        </section>
      )}
      <section className="sec" id="consulta" style={{ background: 'var(--surface)' }}>
        <div className="wrap contacto">
          <div><h2 style={{ fontSize: 'clamp(36px,4vw,54px)' }}>Contacto</h2><p className="meta" style={{ marginTop: 12, fontSize: 16 }}>Tel.: {a.telefono} · {a.email}</p></div>
          <div><FormContacto proyecto={p.titulo} proyectoId={p.id} whatsapp={a.whatsapp} /></div>
        </div>
      </section>
      {relacionados.length > 0 && (
        <section className="sec relacionados">
          <div className="wrap">
            <div className="sec-head"><h2 style={{ fontSize: 38 }}>Más trabajos</h2></div>
            <div className="grid">{relacionados.map((r) => <Tarjeta key={r.id} p={r} />)}</div>
          </div>
        </section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </article>
  );
}
