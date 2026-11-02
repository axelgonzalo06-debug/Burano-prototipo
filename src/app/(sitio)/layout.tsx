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
    name: a.nombre,
    url,
    logo: `${url}/isotipo.png`,
    email: a.email,
    telephone: a.telefono,
    foundingDate: '2014',
    address: { '@type': 'PostalAddress', streetAddress: a.direccion, addressLocality: 'Montevideo', addressCountry: 'UY' },
    sameAs: [a.facebook, a.instagram, a.linkedin].filter(Boolean),
  };
  return (
    <>
      <Cabecera />
      <main id="contenido">{children}</main>
      <Pie />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
    </>
  );
}
