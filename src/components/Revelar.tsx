'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export const SELECTOR_RV = '.rv-lines, .rv-words, .rv-label, .rv-up, .rv-img, .rv-bar';

// Envuelve cada palabra en <span class="w"><span>…</span></span> respetando los elementos internos
// (por ejemplo, una palabra en rojo dentro de la misión).
function partir(el: HTMLElement) {
  el.dataset.rv = '1';
  const textos: Text[] = [];
  const recorrer = (n: Node) => n.childNodes.forEach((c) => (c.nodeType === 3 ? textos.push(c as Text) : recorrer(c)));
  recorrer(el);
  for (const t of textos) {
    const frag = document.createDocumentFragment();
    for (const parte of (t.textContent || '').split(/(\s+)/)) {
      if (!parte) continue;
      if (/^\s+$/.test(parte)) { frag.append(' '); continue; }
      const w = document.createElement('span');
      w.className = 'w';
      const i = document.createElement('span');
      i.textContent = parte;
      w.append(i);
      frag.append(w);
    }
    t.replaceWith(frag);
  }
  const palabras = [...el.querySelectorAll<HTMLElement>('.w')];
  if (el.classList.contains('rv-words')) {
    palabras.forEach((w, k) => w.style.setProperty('--i', String(k)));
    return;
  }
  // Agrupa por línea según la posición vertical real, para que suban renglón por renglón.
  let linea = -1, top = -Infinity;
  for (const w of palabras) {
    if (w.offsetTop > top + 4) { linea++; top = w.offsetTop; }
    w.style.setProperty('--i', String(linea));
  }
}

// Revela cada elemento una sola vez al entrar en pantalla. Las fotos se observan por su contenedor:
// un elemento recortado por completo con clip-path nunca dispara el observer.
export default function Revelar() {
  const ruta = usePathname();
  useEffect(() => {
    const html = document.documentElement;
    let io: IntersectionObserver | undefined;
    let vivo = true;
    // Se espera a las fuentes: las líneas de los títulos dependen del ancho real de cada palabra.
    document.fonts.ready.then(() => {
      if (!vivo) return;
      html.classList.add('fuentes');
      document.querySelectorAll<HTMLElement>('.rv-lines:not([data-rv]), .rv-words:not([data-rv])').forEach(partir);
      io = new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('visto');
        io!.unobserve(e.target);
      }), { threshold: 0.2 });
      document.querySelectorAll(SELECTOR_RV).forEach((el) => !el.classList.contains('visto') && io!.observe(el));
    });
    return () => { vivo = false; io?.disconnect(); };
  }, [ruta]);
  return null;
}
