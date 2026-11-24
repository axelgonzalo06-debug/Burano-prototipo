import type { Metadata } from 'next';
import Listado from '@/components/Listado';
import { TIPOS } from '@/lib/proyectos';
import { getAjustes } from '@/lib/ajustes';
import { metaPagina } from '@/lib/seo';

export async function generateMetadata(props: { searchParams: Promise<{ tipo?: string }> }): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const t = searchParams.tipo?.toUpperCase() as keyof typeof TIPOS | undefined;
  const a = await getAjustes();
  return metaPagina({ titulo: t && TIPOS[t] ? TIPOS[t] : 'Proyectos', descripcion: a.intro, ruta: '/proyectos' });
}

export default async function Proyectos(props: { searchParams: Promise<{ tipo?: string; estado?: string; zona?: string }> }) {
  const searchParams = await props.searchParams;
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
