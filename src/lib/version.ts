// Cada cambio publicado sube APP_VERSION y suma una entrada arriba de todo en HISTORIAL (y en CHANGELOG.md).
export const APP_VERSION = '0.3.0';

export const HISTORIAL: { version: string; fecha: string; cambios: string[] }[] = [
  {
    version: '0.3.0',
    fecha: '2026-11-08',
    cambios: [
      'SEO completo: cada página con su descripción (tomada de los textos del sitio), dirección canónica e imagen para compartir en WhatsApp, Facebook y X.',
      'Imagen para compartir de 1200×630 con la obra de la portada y el isotipo.',
      'Datos estructurados para Google: empresa constructora con dirección, coordenadas y redes; sitio web; y cada obra con su ruta de navegación.',
      'Manifest del sitio, ícono para iPhone, mapa del sitio con fechas y medición de visitas con Vercel Analytics.',
      'Se sacaron 7 fotos repetidas que venían de Wix.',
    ],
  },
  {
    version: '0.2.0',
    fecha: '2026-11-07',
    cambios: [
      'Tipografía nueva "Obra": Big Shoulders Display en títulos y cifras, Hanken Grotesk en el texto. El logotipo BURANO no cambia.',
      'Rediseño: portada con la obra a pantalla completa, secciones numeradas, grilla editorial de obras, fotos que aparecen al hacer scroll y pie oscuro con la marca.',
      'Menú de celular a pantalla completa, con ítems grandes numerados y los datos de contacto abajo.',
      'Responsive revisado de 320 a 1920 px: nada se sale de la pantalla, el título nunca corta palabras, ficha de obra con título arriba en el celular, botones con área de toque suficiente.',
    ],
  },
  {
    version: '0.1.0',
    fecha: '2026-11-01',
    cambios: [
      'Primera versión del sitio nuevo (ruta estética A · Hormigón).',
      'Migración desde Wix: 30 fichas, 376 fotos y todos los textos tal cual.',
      'Redirecciones 301 desde las direcciones viejas de Wix.',
      'Administrador: proyectos y obras con galería ordenable, consultas, portada, indicadores, servicios, equipo, menú, ajustes, usuarios con roles e historial.',
      'Formulario de contacto que guarda la consulta y avisa por correo; botón de WhatsApp con mensaje según la obra.',
    ],
  },
];
