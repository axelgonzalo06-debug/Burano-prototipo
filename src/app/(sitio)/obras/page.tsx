import type { Metadata } from 'next';
import Listado from '@/components/Listado';

export const metadata: Metadata = { title: 'Galería de trabajos', alternates: { canonical: '/obras' } };

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
