'use client';
import Image from 'next/image';
import { useState } from 'react';

export default function AntesDespues({ antes, despues, titulo }: { antes: string; despues: string; titulo: string }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="ad" style={{ ['--pos' as string]: `${pos}%` }}>
      <Image src={despues} alt={`${titulo}, obra terminada`} fill sizes="(max-width: 900px) 100vw, 58vw" priority />
      <Image src={antes} alt={`${titulo}, situación previa`} fill sizes="(max-width: 900px) 100vw, 58vw" className="antes" />
      <span className="lbl l1">Situación previa</span>
      <span className="lbl l2">Terminado</span>
      <span className="bar" aria-hidden="true" />
      <input type="range" min={0} max={100} value={pos} onChange={(e) => setPos(+e.target.value)} aria-label="Comparar situación previa y obra terminada" />
    </div>
  );
}
