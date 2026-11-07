import type { Metadata, Viewport } from 'next';
import { Archivo, Big_Shoulders_Display, Hanken_Grotesk } from 'next/font/google';
import './globals.css';

// Ruta tipográfica "Obra": condensada industrial para títulos y cifras, grotesca limpia para el texto.
// Archivo ancha queda solo para el logotipo BURANO, que es parte de la marca.
const titulos = Big_Shoulders_Display({ subsets: ['latin'], weight: ['600', '800'], variable: '--f-titulos', display: 'swap' });
const texto = Hanken_Grotesk({ subsets: ['latin'], variable: '--f-texto', display: 'swap' });
const logo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--f-logo', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITIO_URL || 'https://www.burano.com.uy'),
  title: { default: 'Burano S.R.L. · Arquitectura | Ingeniería | Construcción', template: '%s | Burano S.R.L.' },
  description:
    'Burano construcciones nace en el año 2014 como una empresa que brinda servicios de proyecto, dirección y ejecución de obras.',
  openGraph: { locale: 'es_UY', siteName: 'Burano S.R.L.', type: 'website' },
  ...(process.env.NO_INDEXAR === '1' ? { robots: { index: false, follow: false } } : {}),
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#eeedea' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-UY" className={`${titulos.variable} ${texto.variable} ${logo.variable}`} style={{ ['--f-display' as string]: 'var(--f-titulos)', ['--f-body' as string]: 'var(--f-texto)' }}>
      <body>{children}</body>
    </html>
  );
}
