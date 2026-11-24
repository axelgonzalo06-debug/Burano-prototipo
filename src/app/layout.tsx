import type { Metadata, Viewport } from 'next';
import { Archivo, Hanken_Grotesk } from 'next/font/google';
import localFont from 'next/font/local';
import { Analytics } from '@vercel/analytics/next';
import { OG_GENERICA } from '@/lib/seo';
import './globals.css';

// Ruta tipográfica "Obra": condensada industrial para títulos y cifras, grotesca limpia para el texto.
// Archivo ancha queda solo para el logotipo BURANO, que es parte de la marca.
// Big Shoulders Display (licencia OFL) guardada en el proyecto: Google la reemplazó por "Big Shoulders",
// que dibuja los títulos un 3 % más anchos. Es el mismo archivo que usaba la v0.4.9.
const titulos = localFont({ src: './fuentes/big-shoulders-display-latin.woff2', weight: '100 900', variable: '--f-titulos', display: 'swap', fallback: ['Arial Narrow', 'Arial'] });
const texto = Hanken_Grotesk({ subsets: ['latin'], variable: '--f-texto', display: 'swap' });
const logo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--f-logo', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITIO_URL || 'https://www.burano.com.uy'),
  title: { default: 'Burano S.R.L. · Arquitectura | Ingeniería | Construcción', template: '%s | Burano S.R.L.' },
  description:
    'Burano construcciones nace en el año 2014 como una empresa que brinda servicios de proyecto, dirección y ejecución de obras.',
  applicationName: 'Burano S.R.L.',
  alternates: { canonical: '/' },
  openGraph: { locale: 'es_UY', siteName: 'Burano S.R.L.', type: 'website', url: '/', images: [OG_GENERICA] },
  twitter: { card: 'summary_large_image', images: [OG_GENERICA.url] },
  formatDetection: { telephone: false },
  ...(process.env.NO_INDEXAR === '1' ? { robots: { index: false, follow: false } } : {}),
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#eeedea' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: el script de abajo suma clases a <html> antes de que cargue React.
    <html lang="es-UY" suppressHydrationWarning className={`${titulos.variable} ${texto.variable} ${logo.variable}`} style={{ ['--f-display' as string]: 'var(--f-titulos)', ['--f-body' as string]: 'var(--f-texto)' }}>
      <body>
        {/* Antes de dibujar: habilita los estados iniciales de las animaciones (sin JS todo queda visible)
            y ?motion=full fuerza las animaciones aunque el sistema pida movimiento reducido. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('rv');if(/[?&]motion=full\\b/.test(location.search))document.documentElement.classList.add('motion-full')" }} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
