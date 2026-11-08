import type { MetadataRoute } from 'next';

// Mientras el sitio está en revisión (NO_INDEXAR=1) no se indexa, para no competir con el sitio de Wix.
export default function robots(): MetadataRoute.Robots {
  const url = process.env.NEXT_PUBLIC_SITIO_URL || 'https://www.burano.com.uy';
  if (process.env.NO_INDEXAR === '1') return { rules: [{ userAgent: '*', disallow: '/' }] };
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api'] }], sitemap: `${url}/sitemap.xml`, host: url };
}
