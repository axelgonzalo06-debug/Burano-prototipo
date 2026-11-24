'use client';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

type Foto = { url: string; alt: string; pie: string; previa: boolean; fecha?: string | null };

export default function Galeria({ fotos, titulo }: { fotos: Foto[]; titulo: string }) {
  const [abierta, setAbierta] = useState<number | null>(null);
  const mover = useCallback((d: number) => setAbierta((v) => (v === null ? v : (v + d + fotos.length) % fotos.length)), [fotos.length]);
  useEffect(() => {
    if (abierta === null) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierta(null);
      if (e.key === 'ArrowRight') mover(1);
      if (e.key === 'ArrowLeft') mover(-1);
    };
    addEventListener('keydown', tecla);
    document.body.style.overflow = 'hidden';
    return () => { removeEventListener('keydown', tecla); document.body.style.overflow = ''; };
  }, [abierta, mover]);
  if (!fotos.length) return null;
  const f = abierta !== null ? fotos[abierta] : null;
  return (
    <>
      <div className="galeria">
        {fotos.map((x, k) => (
          <button key={x.url} type="button" className={x.previa ? 'previa' : ''} onClick={() => setAbierta(k)} aria-label={`Ampliar foto ${k + 1} de ${fotos.length}${x.pie ? `: ${x.pie}` : ''}`}>
            <Image src={x.url} alt="" fill sizes="160px" loading="lazy" />
          </button>
        ))}
      </div>
      {f && (
        <div className="caja" role="dialog" aria-modal="true" aria-label={`${titulo}, foto ${abierta! + 1}`}>
          <div className="barra">
            <span>{abierta! + 1} / {fotos.length}{f.previa ? ' · Situación previa' : ''}{f.pie && !/^\d|^IMG|^DSC/.test(f.pie) && f.pie.toLowerCase() !== 'situación previa' ? ` · ${f.pie}` : ''}{f.fecha ? ` · ${f.fecha}` : ''}</span>
            <button type="button" onClick={() => setAbierta(null)} autoFocus>Cerrar ✕</button>
          </div>
          <div className="img" onClick={() => setAbierta(null)}>
            <Image src={f.url} alt={f.alt || titulo} fill sizes="100vw" />
          </div>
          <div className="nav">
            <button type="button" onClick={() => mover(-1)}>← Anterior</button>
            <button type="button" onClick={() => mover(1)}>Siguiente →</button>
          </div>
        </div>
      )}
    </>
  );
}
