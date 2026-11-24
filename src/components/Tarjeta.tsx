import Image from 'next/image';
import Link from 'next/link';
import type { Proyecto } from '@prisma/client';
import { ESTADOS, TIPOS, rutaProyecto } from '@/lib/proyectos';

export function superficie(p: Pick<Proyecto, 'superficies'>) {
  const l = p.superficies.split('\n').find((x) => /superficie/i.test(x));
  return l ? l.split(':').slice(1).join(':').trim() : '';
}

export default function Tarjeta({ p, fotos }: { p: Proyecto; fotos?: number }) {
  const m2 = superficie(p);
  return (
    <Link className="card" href={rutaProyecto(p)}>
      <div className="ph">
        {p.portada && <Image src={p.portada} alt={p.titulo} fill sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 400px" />}
        {p.estado !== 'TERMINADO' && <span className="estado">{ESTADOS[p.estado]}</span>}
      </div>
      <span className="tag">{TIPOS[p.tipo]}</span>
      <h3>{p.titulo}</h3>
      <div className="meta">
        {p.subtitulo && <span>{p.subtitulo}</span>}
        {p.ubicacion && <span>{p.ubicacion}</span>}
        {m2 && <span>{m2}</span>}
        {fotos ? <span>{fotos} fotos</span> : null}
      </div>
    </Link>
  );
}
