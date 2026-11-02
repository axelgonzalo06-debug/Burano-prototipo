import type { Metadata, Viewport } from 'next';
import { Archivo } from 'next/font/google';
import './globals.css';

const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--f-archivo', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITIO_URL || 'https://www.burano.com.uy'),
  title: { default: 'Burano S.R.L. · Arquitectura | Ingeniería | Construcción', template: '%s | Burano S.R.L.' },
  description:
    'Burano construcciones nace en el año 2014 como una empresa que brinda servicios de proyecto, dirección y ejecución de obras.',
  openGraph: { locale: 'es_UY', siteName: 'Burano S.R.L.', type: 'website' },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#eeedea' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-UY" className={archivo.variable} style={{ ['--f-display' as string]: 'var(--f-archivo)', ['--f-body' as string]: 'var(--f-archivo)' }}>
      <body>{children}</body>
    </html>
  );
}
