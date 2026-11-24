'use client';
import { useEffect, useRef } from 'react';

// Párrafo que se "entinta" palabra por palabra a medida que cruza la pantalla.
// Es solo un cambio de color, así que se mantiene también con movimiento reducido.
export default function ParrafoScroll({ texto }: { texto: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const p = ref.current!;
    const palabras = [...p.querySelectorAll<HTMLElement>('span')];
    let raf = 0;
    const pintar = () => {
      raf = 0;
      const r = p.getBoundingClientRect();
      const vh = innerHeight;
      const avance = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const n = Math.round(avance * palabras.length);
      palabras.forEach((w, k) => w.classList.toggle('tinta', k < n));
    };
    const pedir = () => { if (!raf) raf = requestAnimationFrame(pintar); };
    pintar();
    addEventListener('scroll', pedir, { passive: true });
    addEventListener('resize', pedir);
    return () => { removeEventListener('scroll', pedir); removeEventListener('resize', pedir); cancelAnimationFrame(raf); };
  }, []);
  const palabras = texto.split(/\s+/).filter(Boolean);
  return (
    <p ref={ref} className="tintado">
      {palabras.map((w, k) => <span key={k}>{w}{k < palabras.length - 1 ? ' ' : ''}</span>)}
    </p>
  );
}
