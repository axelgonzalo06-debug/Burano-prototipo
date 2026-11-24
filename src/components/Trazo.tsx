'use client';
import { useEffect, useRef } from 'react';

// Trazo generativo: curvas en el espíritu del isotipo que se dibujan sobre una grilla de plano.
// Cada visita usa otra semilla, así que el dibujo nunca es igual.
export default function Trazo() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext('2d')!;
    let raf = 0;
    const semilla = Math.floor(Math.random() * 100000);
    const css = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
    function dibujar() {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(2, devicePixelRatio || 1);
      cv.width = r.width * dpr;
      cv.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const W = r.width, H = r.height;
      const ink = css('--ink'), acc = css('--accent'), line = css('--line');
      const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
      let s = semilla;
      const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
      const curvas = Array.from({ length: 7 }, (_, k) => ({
        p: [
          [W * (-0.1 + rnd() * 0.2), H * (0.45 + rnd() * 0.4)],
          [W * (0.2 + rnd() * 0.3), H * (0.08 + rnd() * 0.5)],
          [W * (0.5 + rnd() * 0.3), H * (0.02 + rnd() * 0.6)],
          [W * (1 + rnd() * 0.15), H * (0.05 + rnd() * 0.35)],
        ],
        c: k === 2 || k === 5 ? acc : ink,
        w: k === 2 ? 3 : k === 5 ? 2 : 0.8 + rnd() * 1.2,
        a: k === 2 || k === 5 ? 0.5 : 0.16,
      }));
      cancelAnimationFrame(raf);
      const t0 = performance.now();
      const frame = (now: number) => {
        const p = quieto ? 1 : Math.min(1, (now - t0) / 3200);
        ctx.clearRect(0, 0, W, H);
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = line;
        ctx.lineWidth = 1;
        for (let x = 40; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H * p); ctx.stroke(); }
        for (let y = 40; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W * p, y); ctx.stroke(); }
        curvas.forEach((c, k) => {
          const q = Math.max(0, Math.min(1, p * 1.6 - k * 0.08));
          if (!q) return;
          ctx.globalAlpha = c.a;
          ctx.strokeStyle = c.c;
          ctx.lineWidth = c.w;
          ctx.beginPath();
          const [a, b, cc, d] = c.p;
          for (let u = 0; u <= q; u += 0.01) {
            const m = 1 - u;
            const x = m * m * m * a[0] + 3 * m * m * u * b[0] + 3 * m * u * u * cc[0] + u * u * u * d[0];
            const y = m * m * m * a[1] + 3 * m * m * u * b[1] + 3 * m * u * u * cc[1] + u * u * u * d[1];
            if (u) ctx.lineTo(x, y); else ctx.moveTo(x, y);
          }
          ctx.stroke();
        });
        ctx.globalAlpha = 1;
        if (p < 1) raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    }
    dibujar();
    const ro = new ResizeObserver(() => dibujar());
    ro.observe(cv);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={ref} aria-hidden="true" />;
}
