import type { Metadata } from 'next';
import Listado from '@/components/Listado';
import { getAjustes } from '@/lib/ajustes';
import { metaPagina } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const a = await getAjustes();
  return metaPagina({ titulo: 'Galería de trabajos', descripcion: a.intro, ruta: '/obras' });
}

export default function Obras({ searchParams }: { searchParams: { estado?: string; zona?: string } }) {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head"><h1>Galería de trabajos</h1></div>
        <Listado base="/obras" tipos={['OBRA']} filtros={searchParams} />
      </div>
    </section>
  );
}
