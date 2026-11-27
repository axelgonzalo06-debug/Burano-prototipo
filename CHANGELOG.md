# Historial de cambios

## 0.5.2 — 2026-11-27

- Sitio preparado para el dominio burano.com.uy: queda conectado en Vercel (burano.com.uy lleva a www.burano.com.uy) y Google ya puede indexarlo. Empieza a verse en cuanto se cambien los datos del dominio en Wix. La dirección de prueba burano-web.vercel.app sigue andando, pero Google no la indexa.

## 0.5.1 — 2026-11-27

- Fotos del equipo en el inicio en blanco y negro, como en la página Empresa; toman color al pasar el mouse.
- Foto de Leandro Cantieri: en lugar del retrato hecho con IA, su foto original con mejor calidad y un poco más grande.
- Seguridad: el sitio ahora le indica al navegador que no se puede mostrar dentro de otras páginas, que no adivine tipos de archivo y que no pida cámara, micrófono ni ubicación; y ya no anuncia con qué tecnología está hecho. No cambia nada de lo que se ve.
- Botón de WhatsApp fijo abajo a la derecha en todo el sitio, con el número de Burano (+598 98 073 303) y el mensaje «Hola, quisiera hacer una consulta.». El número se cambia desde el administrador, en Ajustes.
- Corrección de errores de ortografía en los textos: «edificio» y «El Castaño» (azotea), «Wyndham» (hotel), «enrollar», «de la ampliación» (galpón MRU), «del edificio» (Junta de Florida), «acústico» (diplomas de Carolina), «diagnóstico» (servicios), «Punta del Este», «pérgola» con tilde y el paréntesis que faltaba en Vivienda Jacarandá, y «Instalación de puntos» en los pies de foto de Sitiland. No se cambió ningún otro texto ni las direcciones de las páginas.

## 0.5.0 — 2026-11-23

- Motor del sitio actualizado a la versión nueva (Next.js 15.5 y React 19): quedan cerrados todos los problemas de seguridad conocidos. No cambia nada de lo que se ve.
- La tipografía de los títulos queda guardada dentro del sitio, para que se vea igual aunque Google cambie la suya.
- Seguridad: la vista previa del administrador ya no puede usarse para mandar visitas a otros sitios, y las fotos que se suben tienen un tope de tamaño para que no traben el servidor.
- El menú del celular cerrado ya no se puede recorrer con el teclado ni con lectores de pantalla.

## 0.4.10 — 2026-11-23

- Actualización de seguridad del motor del sitio (Next.js 14.2.35). No cambia nada de lo que se ve.

## 0.4.9 — 2026-11-13

- Proyectos: la ficha ya no se monta sobre la lista ni el contador en pantallas de notebook; la foto acompaña el alto de la ficha.

## 0.4.8 — 2026-11-13

- Proyectos: la foto y la ficha cambian solo al tocar cada proyecto de la lista; el scroll ya no las pasa.

## 0.4.7 — 2026-11-13

- Retratos del equipo con el mismo aire sobre la cabeza y el mismo tamaño de cabeza en los tres.

## 0.4.6 — 2026-11-13

- Retratos del equipo con las cabezas del mismo tamaño (antes Carolina se veía más grande).

## 0.4.5 — 2026-11-13

- Se sacó del pie el texto heredado de Wix «© 2018 Burano srl | Diseño web Datatex».

## 0.4.4 — 2026-11-13

- Retratos del equipo encuadrados iguales: los ojos a la misma altura y las caras del mismo tamaño (solo recorte, sin agregar nada).

## 0.4.3 — 2026-11-13

- La cabecera toma fondo oscuro apenas se empieza a bajar, para que el título de la portada no quede por debajo de los links.

## 0.4.2 — 2026-11-13

- Fotos del equipo en el inicio en formato vertical, con la cara completa (antes se cortaba la cabeza).

## 0.4.1 — 2026-11-11

- En el pie, el crédito de desarrollo lleva el logo de LAB.

## 0.4.0 — 2026-11-11

- Inicio en una sola página con anclas: Estudio, Servicios, Proyectos, Cálculo de estructuras, Obras y Contacto. Las páginas de cada sección quedan como "ver todo".
- Cabecera fija nueva: links a los costados, la marca al centro y el botón "Pedir presupuesto". Cambia de tono según la sección y marca con un punto rojo dónde estás.
- Portada sin las rayas rojas, con el título que entra animado y barras de progreso en las fotos (cambian cada 6 segundos).
- Animaciones al scrollear: títulos que suben línea por línea, fotos que se descubren y cifras que cuentan solas. Con movimiento reducido quedan solo fundidos.
- Equipo con foto en la portada, servicios en tres columnas, recorrido fijado de 5 proyectos, barras de los trabajos de cálculo y galería de 6 obras.
- Contacto con la misión, la dirección completa y un formulario corto de presupuesto.
- Menú del celular: el botón "Cerrar" ya no queda tapado en iPhone.
- Se sacaron las flechas que el iPhone mostraba como emoji (la de "Contacto" en el pie y las de los links).
- El pie muestra la versión con fecha y hora, y el crédito de desarrollo de LAB.

## 0.3.0 — 2026-11-08

- SEO completo: descripción propia por página (de los textos existentes), canónicas, Open Graph y tarjeta grande de X en todas las páginas.
- Imagen para compartir 1200×630 (`public/og.jpg`).
- JSON-LD: GeneralContractor ampliado (descripción, lema, coordenadas, área de servicio) y WebSite; las fichas siguen con CreativeWork y BreadcrumbList.
- `manifest.webmanifest`, `apple-icon.png`, sitemap con `lastModified` y robots con `host`.
- Vercel Analytics.
- Fotos repetidas de Wix eliminadas (7).

## 0.2.0 · 2026-11-07
- Tipografía nueva "Obra": Big Shoulders Display en títulos y cifras, Hanken Grotesk en el texto. El logotipo BURANO no cambia.
- Rediseño: portada con la obra a pantalla completa, secciones numeradas, grilla editorial de obras, fotos que aparecen al hacer scroll y pie oscuro con la marca.
- Menú de celular a pantalla completa, con ítems grandes numerados y los datos de contacto abajo.
- Responsive revisado de 320 a 1920 px: nada se sale de la pantalla, el título nunca corta palabras, ficha de obra con título arriba en el celular, botones con área de toque suficiente.

## 0.1.0 · 2026-11-01
- Primera versión del sitio nuevo (ruta estética A · Hormigón).
- Migración desde Wix: 26 fichas de obras y proyectos, 376 fotos y todos los textos tal cual.
- Redirecciones 301 desde las direcciones viejas de Wix.
- Administrador: proyectos y obras con galería ordenable, consultas, portada, indicadores, servicios, equipo, historia, menú, ajustes, usuarios con roles e historial.
- Formulario de contacto que guarda la consulta y avisa por correo (con cola para el cupo de Resend); botón de WhatsApp con mensaje según la obra.
