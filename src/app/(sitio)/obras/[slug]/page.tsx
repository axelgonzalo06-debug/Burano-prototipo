import Ficha, { metaFicha } from '@/components/Ficha';

export const generateMetadata = ({ params }: { params: { slug: string } }) => metaFicha(params.slug);

export default function Obra({ params }: { params: { slug: string } }) {
  return <Ficha slug={params.slug} base="obras" />;
}
