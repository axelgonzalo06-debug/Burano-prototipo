import Cabecera from '@/components/Cabecera';
import Pie from '@/components/Pie';
import { getAjustes } from '@/lib/ajustes';

export const revalidate = 60;

export default async function SitioLayout({ children }: { children: React.ReactNode }) {
  const a = await getAjustes();
  const url = process.env.NEXT_PUBLIC_SITIO_URL || 'https://www.burano.com.uy';
  const org = {
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    '@id': `${url}/#empresa`,
    name: a.nombre,
    alternateName: 'Burano',
    description: a.intro,
    slogan: a.lema,
    url,
    logo: `${url}/isotipo.png`,
    image: `${url}/og.jpg`,
    areaServed: { '@type': 'Country', name: 'Uruguay' },
    email: a.email,
    telephone: a.telefono,
    foundingDate: '2014',
    address: { '@type': 'PostalAddress', streetAddress: a.direccion, addressLocality: 'Montevideo', addressCountry: 'UY' },
    ...(a.lat && a.lng ? { geo: { '@type': 'GeoCoordinates', latitude: Number(a.lat), longitude: Number(a.lng) } } : {}),
    sameAs: [a.facebook, a.instagram, a.linkedin].filter(Boolean),
  };
  const sitio = { '@context': 'https://schema.org', '@type': 'WebSite', name: a.nombre, url, inLanguage: 'es-UY', publisher: { '@id': `${url}/#empresa` } };
  return (
    <>
      <Cabecera />
      <main id="contenido">{children}</main>
      <Pie />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(sitio) }} />
    </>
  );
}
