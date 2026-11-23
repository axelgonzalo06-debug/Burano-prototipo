import type { Metadata } from 'next';
import Listado from '@/components/Listado';
import { getAjustes } from '@/lib/ajustes';
import { metaPagina } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const a = await getAjustes();
  return metaPagina({ titulo: 'Galería de trabajos', descripcion: a.intro, ruta: '/obras' });
}

export default async function Obras(props: { searchParams: Promise<{ estado?: string; zona?: string }> }) {
  const searchParams = await props.searchParams;
  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head"><h1>Galería de trabajos</h1></div>
        <Listado base="/obras" tipos={['OBRA']} filtros={searchParams} />
      </div>
    </section>
  );
}
