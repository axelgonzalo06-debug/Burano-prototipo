// Cada cambio publicado sube APP_VERSION y suma una entrada arriba de todo en HISTORIAL (y en CHANGELOG.md).
export const APP_VERSION = '0.5.1';

export const HISTORIAL: { version: string; fecha: string; cambios: string[] }[] = [
  {
    version: '0.5.1',
    fecha: '2026-11-24',
    cambios: [
      'Botón de WhatsApp fijo abajo a la derecha en todo el sitio, con el número de Burano (+598 98 073 303) y el mensaje «Hola, quisiera hacer una consulta.». El número se cambia desde el administrador, en Ajustes.',
      'Corrección de errores de ortografía en los textos: «edificio» y «El Castaño» (azotea), «Wyndham» (hotel), «enrollar», «de la ampliación» (galpón MRU), «del edificio» (Junta de Florida), «acústico» (diplomas de Carolina), «diagnóstico» (servicios), «Punta del Este», «pérgola» con tilde y el paréntesis que faltaba en Vivienda Jacarandá, y «Instalación de puntos» en los pies de foto de Sitiland. No se cambió ningún otro texto ni las direcciones de las páginas.',
    ],
  },
  {
    version: '0.5.0',
    fecha: '2026-11-23',
    cambios: [
      'Motor del sitio actualizado a la versión nueva (Next.js 15.5 y React 19): quedan cerrados todos los problemas de seguridad conocidos. No cambia nada de lo que se ve.',
      'La tipografía de los títulos queda guardada dentro del sitio, para que se vea igual aunque Google cambie la suya.',
      'Seguridad: la vista previa del administrador ya no puede usarse para mandar visitas a otros sitios, y las fotos que se suben tienen un tope de tamaño para que no traben el servidor.',
      'El menú del celular cerrado ya no se puede recorrer con el teclado ni con lectores de pantalla.',
    ],
  },
  {
    version: '0.4.10',
    fecha: '2026-11-23',
    cambios: ['Actualización de seguridad del motor del sitio (Next.js 14.2.35). No cambia nada de lo que se ve.'],
  },
  {
    version: '0.4.9',
    fecha: '2026-11-13',
    cambios: ['Proyectos: la ficha ya no se monta sobre la lista ni el contador en pantallas de notebook; la foto acompaña el alto de la ficha.'],
  },
  {
    version: '0.4.8',
    fecha: '2026-11-13',
    cambios: ['Proyectos: la foto y la ficha cambian solo al tocar cada proyecto de la lista; el scroll ya no las pasa.'],
  },
  {
    version: '0.4.7',
    fecha: '2026-11-13',
    cambios: ['Retratos del equipo con el mismo aire sobre la cabeza y el mismo tamaño de cabeza en los tres.'],
  },
  {
    version: '0.4.6',
    fecha: '2026-11-13',
    cambios: ['Retratos del equipo con las cabezas del mismo tamaño (antes Carolina se veía más grande).'],
  },
  {
    version: '0.4.5',
    fecha: '2026-11-13',
    cambios: ['Se sacó del pie el texto heredado de Wix «© 2018 Burano srl | Diseño web Datatex».'],
  },
  {
    version: '0.4.4',
    fecha: '2026-11-13',
    cambios: ['Retratos del equipo encuadrados iguales: los ojos a la misma altura y las caras del mismo tamaño (solo recorte, sin agregar nada).'],
  },
  {
    version: '0.4.3',
    fecha: '2026-11-13',
    cambios: ['La cabecera toma fondo oscuro apenas se empieza a bajar, para que el título de la portada no quede por debajo de los links.'],
  },
  {
    version: '0.4.2',
    fecha: '2026-11-13',
    cambios: ['Fotos del equipo en el inicio en formato vertical, con la cara completa (antes se cortaba la cabeza).'],
  },
  {
    version: '0.4.1',
    fecha: '2026-11-11',
    cambios: ['En el pie, el crédito de desarrollo lleva el logo de LAB.'],
  },
  {
    version: '0.4.0',
    fecha: '2026-11-11',
    cambios: [
      'Inicio en una sola página con anclas: Estudio, Servicios, Proyectos, Cálculo de estructuras, Obras y Contacto. Las páginas de cada sección quedan como "ver todo".',
      'Cabecera fija nueva: links a los costados, la marca al centro y el botón "Pedir presupuesto". Cambia de tono según la sección y marca con un punto rojo dónde estás.',
      'Portada sin las rayas rojas, con el título que entra animado y barras de progreso en las fotos (cambian cada 6 segundos).',
      'Animaciones al scrollear: títulos que suben línea por línea, fotos que se descubren y cifras que cuentan solas. Con movimiento reducido quedan solo fundidos.',
      'Equipo con foto en la portada, servicios en tres columnas, recorrido fijado de 5 proyectos, barras de los trabajos de cálculo y galería de 6 obras.',
      'Contacto con la misión, la dirección completa y un formulario corto de presupuesto.',
      'Menú del celular: el botón "Cerrar" ya no queda tapado en iPhone.',
      'Se sacaron las flechas que el iPhone mostraba como emoji (la de "Contacto" en el pie y las de los links).',
      'El pie muestra la versión con fecha y hora, y el crédito de desarrollo de LAB.',
    ],
  },
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
