'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export type ItemRecorrido = { slug: string; titulo: string; categoria: string; href: string; foto: string; datos: [string, string][] };

const TRAMO = 0.8; // pantallas de scroll por proyecto
const REVELADO = 0.55; // parte del tramo en que se descubre la foto siguiente
const dos = (n: number) => String(n).padStart(2, '0');

// Recorrido fijado: la sección mide varias pantallas y su contenido queda pegado mientras se scrollea.
// Cada foto nueva se descubre de abajo hacia arriba y el panel de datos cambia con un fundido.
export default function Recorrido({ items }: { items: ItemRecorrido[] }) {
  const caja = useRef<HTMLDivElement>(null);
  const fotos = useRef<(HTMLDivElement | null)[]>([]);
  const barras = useRef<HTMLElement[]>([]);
  const [activo, setActivo] = useState(0);
  const N = items.length;

  useEffect(() => {
    const el = caja.current!;
    const html = document.documentElement;
    const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches && !html.classList.contains('motion-full');
    let raf = 0;
    const medir = () => { el.style.height = `${innerHeight * (1 + (N - 1) * TRAMO + 0.35)}px`; };
    const pintar = () => {
      raf = 0;
      const u = Math.max(0, -el.getBoundingClientRect().top) / (innerHeight * TRAMO);
      let act = 0;
      fotos.current.forEach((f, j) => {
        if (!f || j === 0) return;
        const r = Math.min(1, Math.max(0, (u - (j - 1)) / REVELADO));
        if (quieto) { f.style.clipPath = 'none'; f.style.opacity = String(r); }
        else f.style.clipPath = `inset(${((1 - r) * 100).toFixed(2)}% 0 0 0)`;
        if (r >= 0.5) act = j;
      });
      barras.current.forEach((b) => {
        const j = Number(b.dataset.j);
        const r = j === 0 ? 1 : Math.min(1, Math.max(0, (u - (j - 1)) / REVELADO));
        b.style.transform = `scaleX(${r})`;
      });
      setActivo(act);
    };
    const pedir = () => { if (!raf) raf = requestAnimationFrame(pintar); };
    const alCambiar = () => { medir(); pedir(); };
    medir();
    pintar();
    addEventListener('scroll', pedir, { passive: true });
    addEventListener('resize', alCambiar);
    return () => { removeEventListener('scroll', pedir); removeEventListener('resize', alCambiar); cancelAnimationFrame(raf); };
  }, [N]);

  const ir = (j: number) => {
    const top = caja.current!.getBoundingClientRect().top + scrollY;
    const extra = j === 0 ? 0 : (j - 1 + REVELADO) * innerHeight * TRAMO + 2;
    scrollTo({ top: top + extra, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };
  const barra = (j: number) => (el: HTMLElement | null) => { if (el) { el.dataset.j = String(j); if (!barras.current.includes(el)) barras.current.push(el); } };

  return (
    <>
      <div className="reco" ref={caja}>
        <div className="reco-fijo">
          <div className="reco-info">
            <p className="reco-cuenta" aria-hidden="true">{dos(activo + 1)} <i>/ {dos(N)}</i></p>
            <div className="reco-paneles">
              {items.map((p, j) => (
                <div key={p.slug} className={j === activo ? 'reco-panel on' : 'reco-panel'} aria-hidden={j !== activo}>
                  <span className="reco-cat">{p.categoria}</span>
                  <h3>{p.titulo}</h3>
                  <dl>
                    {p.datos.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
                  </dl>
                  <Link className="reco-ver" href={p.href} tabIndex={j === activo ? undefined : -1}>Ver proyecto →</Link>
                </div>
              ))}
            </div>
            <ol className="reco-indice">
              {items.map((p, j) => (
                <li key={p.slug}>
                  <button type="button" className={j === activo ? 'on' : ''} aria-current={j === activo} onClick={() => ir(j)}>
                    <small>{dos(j + 1)}</small>{p.titulo}<i ref={barra(j)} />
                  </button>
                </li>
              ))}
            </ol>
          </div>
          <div className="reco-marco">
            {items.map((p, j) => (
              <div key={p.slug} className="reco-foto" ref={(el) => { fotos.current[j] = el; }} style={j === 0 ? undefined : { clipPath: 'inset(100% 0 0 0)' }}>
                <Image src={p.foto} alt={p.titulo} fill sizes="(max-width: 1023px) 100vw, 66vw" />
              </div>
            ))}
          </div>
          <div className="reco-segmentos" aria-hidden="true">
            {items.map((p, j) => <span key={p.slug}><i ref={barra(j)} /></span>)}
          </div>
        </div>
      </div>
      {/* Pantallas muy bajas (celular apaisado): grilla quieta en lugar del recorrido */}
      <div className="reco-estatico">
        {items.map((p) => (
          <Link key={p.slug} href={p.href} className="reco-ficha">
            <div className="ph"><Image src={p.foto} alt={p.titulo} fill sizes="50vw" /></div>
            <span className="reco-cat">{p.categoria}</span>
            <h3>{p.titulo}</h3>
          </Link>
        ))}
      </div>
    </>
  );
}
