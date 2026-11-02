'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function MenuMovil({ children }: { children: React.ReactNode }) {
  const [abierto, setAbierto] = useState(false);
  const ruta = usePathname();
  useEffect(() => setAbierto(false), [ruta]);
  return (
    <>
      <button className="burger" type="button" aria-expanded={abierto} aria-controls="menu-principal" onClick={() => setAbierto(!abierto)}>
        {abierto ? 'Cerrar' : 'Menú'}
      </button>
      <nav id="menu-principal" aria-label="Principal" className={abierto ? 'abierto' : ''}>
        {children}
      </nav>
    </>
  );
}
