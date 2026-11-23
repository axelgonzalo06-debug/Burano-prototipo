import Ficha, { metaFicha } from '@/components/Ficha';

export const generateMetadata = async ({ params }: { params: Promise<{ slug: string }> }) => metaFicha((await params).slug);

export default async function Proyecto({ params }: { params: Promise<{ slug: string }> }) {
  return <Ficha slug={(await params).slug} base="proyectos" />;
}
