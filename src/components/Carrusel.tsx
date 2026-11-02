'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type Slide = { imagen: string; titulo: string; pie: string };

export default function Carrusel({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [pausa, setPausa] = useState(false);
  useEffect(() => {
    if (pausa || slides.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [pausa, slides.length]);
  if (!slides.length) return <div className="hero-media" />;
  return (
    <div className="hero-media" aria-roledescription="carrusel" aria-label="Obras de Burano">
      {slides.map((s, k) => (
        <Image key={s.imagen} src={s.imagen} alt={s.titulo} fill priority={k === 0} loading={k === 0 ? undefined : 'eager'} sizes="(max-width: 900px) 100vw, 60vw" className={k === i ? 'on' : ''} />
      ))}
      <div className="cap">
        <span aria-live="polite">{slides[i].pie || slides[i].titulo}</span>
        <div className="dots">
          {slides.map((s, k) => (
            <button key={s.imagen} type="button" className={k === i ? 'on' : ''} aria-label={`Foto ${k + 1} de ${slides.length}`} onClick={() => setI(k)} />
          ))}
          {slides.length > 1 && (
            <button type="button" className="pausa" onClick={() => setPausa(!pausa)} aria-pressed={pausa}>{pausa ? '▶' : 'II'}</button>
          )}
        </div>
      </div>
    </div>
  );
}
