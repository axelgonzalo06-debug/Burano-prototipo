import Link from 'next/link';
import { getAjustes, waLink } from '@/lib/ajustes';
import { menu } from './Cabecera';
import { APP_VERSION } from '@/lib/version';

// "11/11/2026 15:00 h", en hora de Montevideo
function fechaVersion() {
  const f = new Date(process.env.FECHA_VERSION || Date.now());
  const z = { timeZone: 'America/Montevideo' } as const;
  return `${f.toLocaleDateString('es-UY', { ...z, day: '2-digit', month: '2-digit', year: 'numeric' })} ${f.toLocaleTimeString('es-UY', { ...z, hour: '2-digit', minute: '2-digit', hour12: false })} h`;
}

const ICONO_WA = (
  <svg viewBox="0 0 32 32" aria-hidden="true" fill="currentColor"><path d="M16 3C9 3 3.3 8.7 3.3 15.6c0 2.4.7 4.7 1.9 6.6L3 29l7-2.2a12.7 12.7 0 0 0 6 1.5c7 0 12.7-5.6 12.7-12.6S23 3 16 3Zm0 23a10.4 10.4 0 0 1-5.4-1.5l-.4-.2-4.1 1.3 1.3-4-.3-.4a10.3 10.3 0 0 1-1.6-5.6C5.5 9.9 10.2 5.3 16 5.3s10.5 4.6 10.5 10.3S21.8 26 16 26Zm5.8-7.7c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8.6 8.6 0 0 1-4.3-3.7c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.5c.2.2 2.4 3.6 5.8 5 2.1.9 3 1 4 .8.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.2-.6-.4Z" /></svg>
);

// Pie oscuro: llamado a contacto grande, datos, el mismo menú de la cabecera y la marca BURANO de fondo.
export default async function Pie() {
  const [a, items] = await Promise.all([getAjustes(), menu()]);
  const wa = waLink(a.whatsapp, 'Hola, quisiera hacer una consulta.');
  const tel = a.telefono.replace(/\D/g, '');
  return (
    <>
      <footer className="pie" data-tone="dark">
        <div className="wrap">
          <div className="pie-top">
            <div>
              <img src="/isotipo-claro.png" alt="" width={64} height={46} style={{ width: 64, marginBottom: 26 }} />
              <h2><Link href="/contacto">Contacto</Link></h2>
            </div>
            <div className="pie-col">
              <p className="idx">{a.nombre}</p>
              {a.direccion && <span>{a.direccion}</span>}
              {a.telefono && <a href={`tel:+598${tel}`}>Tel.: {a.telefono}</a>}
              {a.email && <a href={`mailto:${a.email}`}>{a.email}</a>}
            </div>
            <div className="pie-col">
              <nav aria-label="Secciones">
                {items.map((i) => <Link key={i.href + i.texto} href={i.href}>{i.texto}</Link>)}
              </nav>
            </div>
          </div>
          <div className="pie-marca" aria-hidden="true">Burano</div>
          <div className="pie-base">
            <span>{a.pie}</span>
            <nav aria-label="Redes">
              {a.facebook && <a href={a.facebook} target="_blank" rel="noopener">Facebook</a>}
              {a.instagram && <a href={a.instagram} target="_blank" rel="noopener" style={{ marginLeft: 16 }}>Instagram</a>}
              {a.linkedin && <a href={a.linkedin} target="_blank" rel="noopener" style={{ marginLeft: 16 }}>LinkedIn</a>}
            </nav>
          </div>
          <div className="pie-firma">
            <span className="pie-version">v{APP_VERSION} · {fechaVersion()}</span>
            {/* Logo de LAB recortado del perfil de WhatsApp de HOSTUP (no hay versión vectorial) */}
            <span className="pie-lab">Desarrollo <img src="/lab.png" alt="LAB" width={30} height={35} /></span>
          </div>
        </div>
      </footer>
      {wa && (
        <a className="wa-flot" href={wa} target="_blank" rel="noopener" aria-label="Escribir por WhatsApp">{ICONO_WA}</a>
      )}
    </>
  );
}
