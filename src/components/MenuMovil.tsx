'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type Ancla = { texto: string; id: string };

// Texto que "rueda": dos copias apiladas, en el hover la segunda sube y ocupa el lugar de la primera.
export function Rueda({ t }: { t: string }) {
  return (
    <span className="rueda">
      <span>{t}</span>
      <span aria-hidden="true">{t}</span>
    </span>
  );
}

// Cabecera fija de 3 columnas. Toma el tono de la sección que tiene debajo (data-tone) y marca con un
// punto rojo la sección visible. Debajo de 1024 px queda el logo y "Menú", que abre una hoja oscura.
export default function MenuMovil({ izq, der, direccion }: { izq: Ancla[]; der: Ancla[]; direccion: string }) {
  const [abierto, setAbierto] = useState(false);
  const [tono, setTono] = useState('light');
  const [visible, setVisible] = useState('');
  const ruta = usePathname();

  useEffect(() => setAbierto(false), [ruta]);
  useEffect(() => {
    document.documentElement.classList.toggle('menu-abierto', abierto);
    if (!abierto) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false);
    addEventListener('keydown', esc);
    return () => removeEventListener('keydown', esc);
  }, [abierto]);

  useEffect(() => {
    let raf = 0;
    const ids = [...izq, ...der].map((x) => x.id);
    const medir = () => {
      raf = 0;
      // El tono se lee a la altura de la mitad de la cabecera; la sección activa, a 40 % de la pantalla.
      let t = 'light';
      for (const el of document.querySelectorAll<HTMLElement>('[data-tone]')) {
        const r = el.getBoundingClientRect();
        if (r.top <= 38 && r.bottom > 38) t = el.dataset.tone!;
      }
      // Transparente solo arriba de todo: al bajar, el título de la portada pasaría por debajo de los links.
      setTono(t === 'hero' && scrollY > 8 ? 'dark' : t);
      const linea = innerHeight * 0.4;
      let v = '';
      for (const id of ids) {
        const r = document.getElementById(id)?.getBoundingClientRect();
        if (r && r.top <= linea && r.bottom > linea) v = id;
      }
      setVisible(v);
    };
    const pedir = () => { if (!raf) raf = requestAnimationFrame(medir); };
    medir();
    addEventListener('scroll', pedir, { passive: true });
    addEventListener('resize', pedir);
    return () => { removeEventListener('scroll', pedir); removeEventListener('resize', pedir); cancelAnimationFrame(raf); };
  }, [ruta, izq, der]);

  const link = (x: Ancla) => (
    <li key={x.id}>
      <a href={`/#${x.id}`} className={visible === x.id ? 'activo' : undefined} aria-current={visible === x.id ? 'location' : undefined}>
        <Rueda t={x.texto} />
      </a>
    </li>
  );

  // La hoja va fuera del <header>: el backdrop-filter de la cabecera encerraría a un hijo fijo en sus 76 px.
  return (
    <>
    <header className="nav" data-tono={abierto ? 'dark' : tono}>
      <a className="saltar" href="#contenido">Saltar al contenido</a>
      <div className="nav-in">
        <ul className="nav-l">{izq.map(link)}</ul>
        <a className="nav-logo" href="/#inicio" aria-label="Burano, inicio" onClick={() => setAbierto(false)}>
          <img className="iso-oscuro" src="/isotipo.png" alt="" width={42} height={30} />
          <img className="iso-claro" src="/isotipo-claro.png" alt="" width={42} height={30} />
          <b>Burano</b>
        </a>
        <div className="nav-r">
          <ul>{der.map(link)}</ul>
          <a className="pildora" href="/#contacto"><Rueda t="Pedir presupuesto +" /></a>
          <button className="nav-menu" type="button" aria-expanded={abierto} aria-controls="hoja-menu" onClick={() => setAbierto(!abierto)}>
            <Rueda t={abierto ? 'Cerrar' : 'Menú'} />
          </button>
        </div>
      </div>
    </header>
      <nav id="hoja-menu" className={abierto ? 'hoja abierta' : 'hoja'} aria-label="Principal" aria-hidden={!abierto} inert={!abierto ? ('' as unknown as boolean) : undefined}>
        <ol>
          {[...izq, ...der].map((x, k) => (
            <li key={x.id} style={{ '--k': k } as React.CSSProperties}>
              <a href={`/#${x.id}`} onClick={() => setAbierto(false)}><small>{String(k + 1).padStart(2, '0')}</small>{x.texto}</a>
            </li>
          ))}
        </ol>
        <div className="hoja-pie">
          <a className="pildora" href="/#contacto" onClick={() => setAbierto(false)}><Rueda t="Pedir presupuesto +" /></a>
          <address>{direccion}</address>
        </div>
      </nav>
    </>
  );
}
