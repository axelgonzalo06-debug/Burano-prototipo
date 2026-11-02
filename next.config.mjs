/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: { serverActions: { bodySizeLimit: '25mb' } },
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
