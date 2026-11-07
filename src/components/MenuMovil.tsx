'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type Contacto = { telefono: string; email: string; direccion: string; wa: string; facebook: string };

// En escritorio el <nav> es la barra de siempre. En celular se vuelve una pantalla completa oscura
// con los ítems grandes y numerados, y los datos de contacto abajo, al alcance del pulgar.
export default function MenuMovil({ children, contacto }: { children: React.ReactNode; contacto: Contacto }) {
  const [abierto, setAbierto] = useState(false);
  const ruta = usePathname();
  useEffect(() => setAbierto(false), [ruta]);
  useEffect(() => {
    document.documentElement.classList.toggle('menu-abierto', abierto);
    if (!abierto) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false);
    addEventListener('keydown', esc);
    return () => removeEventListener('keydown', esc);
  }, [abierto]);
  const tel = contacto.telefono.replace(/\D/g, '');
  return (
    <>
      <button className="burger" type="button" aria-expanded={abierto} aria-controls="menu-principal" aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setAbierto(!abierto)}>
        <span className="burger-txt" aria-hidden="true">{abierto ? 'Cerrar' : 'Menú'}</span>
        <span className="burger-ico" aria-hidden="true"><i /><i /></span>
      </button>
      <nav id="menu-principal" aria-label="Principal" className={abierto ? 'abierto' : ''}>
        {children}
        <div className="menu-pie">
          {contacto.telefono && <a href={`tel:+598${tel}`}>Tel. {contacto.telefono}</a>}
          {contacto.email && <a href={`mailto:${contacto.email}`}>{contacto.email}</a>}
          {contacto.direccion && <span>{contacto.direccion}</span>}
          <div className="menu-acciones">
            {contacto.wa && <a className="btn wa" href={contacto.wa} target="_blank" rel="noopener">WhatsApp</a>}
            {contacto.facebook && <a className="btn" href={contacto.facebook} target="_blank" rel="noopener">Facebook</a>}
          </div>
        </div>
      </nav>
    </>
  );
}
