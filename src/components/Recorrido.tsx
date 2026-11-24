'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export type ItemRecorrido = { slug: string; titulo: string; categoria: string; href: string; foto: string; datos: [string, string][] };

const dos = (n: number) => String(n).padStart(2, '0');

// Proyectos destacados: el proyecto activo cambia solo al tocarlo en el índice (Diego 13/11/2026:
// el scroll no debe pasar las fotos). La foto nueva se descubre de abajo hacia arriba y el panel cambia con fundido.
export default function Recorrido({ items }: { items: ItemRecorrido[] }) {
  const [activo, setActivo] = useState(0);
  const N = items.length;
  return (
    <div className="reco">
      <div className="reco-fijo">
        <div className="reco-info">
          <p className="reco-cuenta" aria-hidden="true">{dos(activo + 1)} <i>/ {dos(N)}</i></p>
          <div className="reco-paneles" aria-live="polite">
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
                <button type="button" className={j === activo ? 'on' : ''} aria-pressed={j === activo} onClick={() => setActivo(j)}>
                  <small>{dos(j + 1)}</small>{p.titulo}<i />
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div className="reco-marco">
          {items.map((p, j) => (
            <div key={p.slug} className={j === activo ? 'reco-foto on' : 'reco-foto'} aria-hidden={j !== activo}>
              <Image src={p.foto} alt={p.titulo} fill loading="eager" sizes="(max-width: 1023px) 100vw, 66vw" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
