'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type Slide = { imagen: string; titulo: string; pie: string };

const DURACION = 6000;

export default function Carrusel({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [pausa, setPausa] = useState(false);
  // Un temporizador por foto: al tocar una barra, la cuenta de 6 s arranca de nuevo.
  useEffect(() => {
    if (pausa || slides.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setTimeout(() => setI((v) => (v + 1) % slides.length), DURACION);
    return () => clearTimeout(t);
  }, [i, pausa, slides.length]);
  if (!slides.length) return <div className="hero-media" />;
  return (
    <div className="hero-media" aria-roledescription="carrusel" aria-label="Obras de Burano">
      {slides.map((s, k) => (
        <Image key={s.imagen} src={s.imagen} alt={s.titulo} fill priority={k === 0} loading={k === 0 ? undefined : 'eager'} sizes="100vw" className={k === i ? 'on' : ''} />
      ))}
      <div className="cap">
        <span className="cuenta" aria-hidden="true">{String(i + 1).padStart(2, '0')} <i>/ {String(slides.length).padStart(2, '0')}</i></span>
        <span aria-live="polite">{slides[i].pie || slides[i].titulo}</span>
        <div className={pausa ? 'dots en-pausa' : 'dots'} style={{ '--dur': `${DURACION}ms` } as React.CSSProperties}>
          {slides.map((s, k) => (
            <button key={s.imagen} type="button" className={k === i ? 'on' : k < i ? 'pasada' : ''} aria-label={`Foto ${k + 1} de ${slides.length}`} aria-current={k === i} onClick={() => setI(k)}>
              <i key={k === i ? `on-${i}` : 'off'} />
            </button>
          ))}
          {slides.length > 1 && (
            <button type="button" className="pausa" onClick={() => setPausa(!pausa)} aria-pressed={pausa} aria-label="Pausar el carrusel">{pausa ? '▶' : 'II'}</button>
          )}
        </div>
      </div>
    </div>
  );
}
