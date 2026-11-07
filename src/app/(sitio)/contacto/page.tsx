import type { Metadata } from 'next';
import { getAjustes } from '@/lib/ajustes';
import FormContacto from '@/components/FormContacto';

export const metadata: Metadata = { title: 'Contacto', alternates: { canonical: '/contacto' } };

export default async function Contacto() {
  const a = await getAjustes();
  const mapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${a.direccion}, Montevideo, Uruguay`)}`;
  return (
    <section className="sec">
      <div className="wrap contacto">
        <div>
          <h1 style={{ fontSize: 'clamp(42px,5.6vw,78px)', marginBottom: 26 }}>Contacto</h1>
          <address className="datos" style={{ fontStyle: 'normal' }}>
            <span className="grande">{a.razonSocial}</span>
            <span>{a.direccion}</span>
            <span>{a.ciudad}</span>
            <span>Tel.: <a href={`tel:+598${a.telefono.replace(/\D/g, '')}`}>{a.telefono}</a></span>
            <span><a href={`mailto:${a.email}`}>{a.email}</a></span>
          </address>
          <p className="mapa"><a href={mapa} target="_blank" rel="noopener">Ver en el mapa ↗</a></p>
        </div>
        <div><FormContacto whatsapp={a.whatsapp} /></div>
      </div>
    </section>
  );
}
