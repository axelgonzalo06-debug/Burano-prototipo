/** @type {import('next').NextConfig} */
const nextConfig = {
  // Momento del build: el pie muestra la fecha y hora de la versión publicada.
  env: { FECHA_VERSION: new Date().toISOString() },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: { serverActions: { bodySizeLimit: '25mb' } },
  // Solo en desarrollo: el indicador de Next tapaba el botón "Salir" del administrador.
  devIndicators: { position: 'bottom-right' },
  // No anunciar qué tecnología usa el sitio.
  poweredByHeader: false,
  // Cabeceras de seguridad (protocolo LAB / Mozilla): nadie puede meter el sitio dentro de otro,
  // el navegador no adivina tipos de archivo y no se piden cámara, micrófono ni ubicación.
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }];
  },
  // URLs del sitio en Wix → sitio nuevo (301, para no perder posicionamiento)
  async redirects() {
    return [
      { source: '/informacion', destination: '/empresa', permanent: true },
      { source: '/copia-de-proyectos', destination: '/proyectos?tipo=vivienda', permanent: true },
      { source: '/copia-de-proyectos-1', destination: '/proyectos?tipo=industria', permanent: true },
      { source: '/copia-de-proyectos-2', destination: '/proyectos?tipo=oficinas', permanent: true },
      { source: '/inicio', destination: '/', permanent: true },
      { source: '/blank', destination: '/', permanent: true },
    ];
  },
};
export default nextConfig;
