import type { Metadata } from 'next';
import Listado from '@/components/Listado';
import { TIPOS } from '@/lib/proyectos';

export function generateMetadata({ searchParams }: { searchParams: { tipo?: string } }): Metadata {
  const t = searchParams.tipo?.toUpperCase() as keyof typeof TIPOS | undefined;
  return { title: t && TIPOS[t] ? TIPOS[t] : 'Proyectos', alternates: { canonical: '/proyectos' } };
}

export default function Proyectos({ searchParams }: { searchParams: { tipo?: string; estado?: string; zona?: string } }) {
  const t = searchParams.tipo?.toUpperCase() as keyof typeof TIPOS | undefined;
  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head"><h1>{t && TIPOS[t] ? TIPOS[t] : 'Proyectos'}</h1></div>
        <Listado base="/proyectos" tipos={['VIVIENDA', 'INDUSTRIA', 'OFICINAS']} filtros={searchParams} />
      </div>
    </section>
  );
}
