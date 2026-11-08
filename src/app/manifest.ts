import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Burano S.R.L.',
    short_name: 'Burano',
    description: 'Arquitectura | Ingeniería | Construcción',
    start_url: '/',
    display: 'browser',
    background_color: '#eeedea',
    theme_color: '#eeedea',
    lang: 'es-UY',
    icons: [
      { src: '/icon.png', sizes: 'any', type: 'image/png' },
      { src: '/icono-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
