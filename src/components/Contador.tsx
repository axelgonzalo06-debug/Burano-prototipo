'use client';
import { useEffect, useRef, useState } from 'react';

const fmt = (n: number) => n.toLocaleString('es-UY');

// Muestra siempre el valor final; la animación solo arranca cuando el navegador efectivamente dibuja
// (si la pestaña está oculta, nunca queda un número a medio contar).
export default function Contador({ valor }: { valor: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(valor);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ref.current!;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const desde = valor > 1900 && valor < 2100 ? 1990 : 0;
      let t0 = 0;
      const paso = (now: number) => {
        if (!t0) t0 = now;
        const p = Math.max(0, Math.min(1, (now - t0) / 1400));
        setV(Math.round(desde + (valor - desde) * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(paso);
      };
      raf = requestAnimationFrame(paso);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [valor]);
  // Años (1900–2100) sin separador de miles
  return <span ref={ref}>{valor > 1900 && valor < 2100 ? v : fmt(v)}</span>;
}
