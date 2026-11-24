import type { Metadata } from 'next';

// Las descripciones salen siempre de textos que ya están en el sitio; acá solo se recortan para buscadores.
export function recorte(texto: string, max = 158) {
  const t = texto.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return t.slice(0, t.lastIndexOf(' ', max)).replace(/[,;:.\s]+$/, '') + '…';
}

export const OG_GENERICA = { url: '/og.jpg', width: 1200, height: 630, alt: 'Burano S.R.L.' };

type Imagen = { url: string; width?: number | null; height?: number | null; alt?: string };

// Next reemplaza openGraph y twitter enteros cuando una página los define, así que cada página los arma completos.
export function metaPagina({ titulo, descripcion, ruta, imagen, tipo = 'website' }: { titulo: string; descripcion: string; ruta: string; imagen?: Imagen; tipo?: 'website' | 'article' }): Metadata {
  const desc = recorte(descripcion);
  const img = imagen ? { url: imagen.url, width: imagen.width ?? undefined, height: imagen.height ?? undefined, alt: imagen.alt || titulo } : OG_GENERICA;
  return {
    title: titulo,
    description: desc,
    alternates: { canonical: ruta },
    openGraph: { title: titulo, description: desc, url: ruta, type: tipo, locale: 'es_UY', siteName: 'Burano S.R.L.', images: [img] },
    twitter: { card: 'summary_large_image', title: titulo, description: desc, images: [img.url] },
  };
}
