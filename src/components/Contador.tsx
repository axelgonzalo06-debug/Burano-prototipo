'use client';
import { useEffect, useRef, useState } from 'react';

const fmt = (n: number) => n.toLocaleString('es-UY');
const esAnio = (n: number) => n > 1900 && n < 2100;

// Muestra siempre el valor final; la cuenta solo arranca cuando el navegador efectivamente dibuja
// (si la pestaña está oculta, nunca queda un número a medio contar).
// `anio` se deduce del valor (1900–2100) salvo que se indique: 2.000 m² no es un año.
export default function Contador({ valor, anio = esAnio(valor) }: { valor: number; anio?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(valor);
  useEffect(() => {
    const html = document.documentElement;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches && !html.classList.contains('motion-full')) return;
    const el = ref.current!;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const desde = anio ? 1990 : 0;
      let t0 = 0;
      const paso = (now: number) => {
        if (!t0) t0 = now;
        const p = Math.max(0, Math.min(1, (now - t0) / 1800));
        setV(Math.round(desde + (valor - desde) * (1 - Math.pow(1 - p, 4))));
        if (p < 1) raf = requestAnimationFrame(paso);
      };
      raf = requestAnimationFrame(paso);
    }, { threshold: 0.2 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [valor, anio]);
  // Años sin separador de miles
  return <span ref={ref}>{anio ? v : fmt(v)}</span>;
}
