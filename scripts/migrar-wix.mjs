// Migración del sitio Wix de Burano a la base nueva.
// Uso: FOTOS_WIX="<carpeta fotos de Drive>" node --env-file=.env.local scripts/migrar-wix.mjs [--reset] [--limite=N]
// Los textos se cargan tal cual; solo se normalizan espacios duros y espacios repetidos.
// Las fotos se optimizan (2400 px, WebP 80) y se suben a Vercel Blob (o a public/subidas si no hay token).
import { readFile, mkdir, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { put } from '@vercel/blob';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
const args = process.argv.slice(2);
const RESET = args.includes('--reset');
const LIMITE = Number((args.find((a) => a.startsWith('--limite=')) || '').split('=')[1]) || Infinity;
const FOTOS = process.env.FOTOS_WIX;
if (!FOTOS) throw new Error('Falta FOTOS_WIX con la carpeta de fotos relevadas');
const inv = JSON.parse(await readFile(new URL('./data/inventario-wix.json', import.meta.url), 'utf8'));
const pag = (n) => inv.find((p) => p.pagina === n);
const limpio = (s) => s.replace(/ /g, ' ').replace(/​/g, '').replace(/ {2,}/g, ' ').split('\n').map((l) => l.trim()).join('\n').trim();

async function subirFoto(archivo, carpeta) {
  const buf = await readFile(archivo);
  const out = await sharp(buf, { limitInputPixels: false }).rotate().resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer({ resolveWithObject: true });
  const ruta = `${carpeta}/${path.basename(archivo).replace(/\.[a-z]+$/i, '')}.webp`;
  let url;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    url = (await put(ruta, out.data, { access: 'public', contentType: 'image/webp', addRandomSuffix: true })).url;
  } else {
    const destino = path.join(process.cwd(), 'public', 'subidas', ruta);
    await mkdir(path.dirname(destino), { recursive: true });
    await writeFile(destino, out.data);
    url = `/subidas/${ruta}`;
  }
  return { url, ancho: out.info.width, alto: out.info.height };
}

async function fotosDe(dir) {
  const d = path.join(FOTOS, dir);
  return (await readdir(d)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort().map((f) => path.join(d, f));
}

const esPrevia = (f) => /situaci[oó]n previa/i.test(`${f.desc} ${f.title}`);
const pieUtil = (f) => {
  const t = limpio(f.desc || f.title || '');
  return /^(\d|IMG|DSC|0$)/i.test(t) || /situaci[oó]n previa/i.test(t) ? '' : t;
};
const zonaDe = (u) => (u.includes('/') ? u.split('/').pop().trim() : u.trim());

function parsearObra(texto) {
  const l = limpio(texto).split('\n');
  const titulo = l[0];
  const bloque = (marca) => {
    const i = l.findIndex((x) => x.toLowerCase().startsWith(marca));
    if (i < 0) return '';
    const fin = l.findIndex((x, k) => k > i && /^(ubicación|situación previa|trabajos realizados):?$/i.test(x));
    return l.slice(i + 1, fin < 0 ? undefined : fin).join('\n');
  };
  return { titulo, ubicacion: bloque('ubicación'), situacionPrevia: bloque('situación previa'), trabajos: bloque('trabajos realizados') };
}

function parsearProyecto(texto) {
  const l = limpio(texto).split('\n');
  const r = { titulo: l[0], ubicacion: '', programa: '', superficies: [], descripcion: [] };
  for (const x of l.slice(1)) {
    const m = x.match(/^(Ubicación|Programa|Superficie [^:]+|Espacios exteriores):\s*(.*)$/i);
    if (!m) { r.descripcion.push(x); continue; }
    if (/^ubicación/i.test(m[1])) r.ubicacion = m[2];
    else if (/^programa/i.test(m[1])) r.programa = m[2];
    else r.superficies.push(`${m[1]}: ${m[2]}`);
  }
  return { ...r, superficies: r.superficies.join('\n'), descripcion: r.descripcion.join('\n') };
}

const TIPO = { obras: 'OBRA', vivienda: 'VIVIENDA', industria: 'INDUSTRIA', oficinas: 'OFICINAS' };
const URL_WIX = { obras: '/obras', vivienda: '/copia-de-proyectos', industria: '/copia-de-proyectos-1', oficinas: '/copia-de-proyectos-2' };
const DESTACADOS = ['vivienda-san-francisco', 'silos-puntas-de-valdez', 'oficinas-wework-uruguay', 'vivienda-jacaranda', 'hotel-hea-windham-montevideo', 'galpon-en-mru-s-a'];

if (RESET) {
  await db.foto.deleteMany(); await db.archivo.deleteMany(); await db.proyecto.deleteMany();
  await db.diapositiva.deleteMany(); await db.indicador.deleteMany(); await db.servicio.deleteMany();
  await db.trabajoCalculo.deleteMany(); await db.integrante.deleteMany();
}

// Proyectos y obras
let orden = 0, nFotos = 0;
for (const nombre of ['obras', 'vivienda', 'industria', 'oficinas']) {
  for (const x of pag(nombre).proyectos) {
    orden++;
    let slug = x.slug;
    if (slug === 'sucursal-brou-paso-molino-2') slug = 'sucursal-brou-paso-molino-plataforma';
    if (await db.proyecto.findUnique({ where: { slug } })) { console.log('ya está', slug); continue; }
    const d = nombre === 'obras' ? parsearObra(x.texto) : parsearProyecto(x.texto);
    const archivos = (await fotosDe(`${nombre}/${x.slug}`)).slice(0, LIMITE);
    const fotos = [];
    for (let k = 0; k < archivos.length; k++) {
      const meta = x.fotos[k] || {};
      const f = await subirFoto(archivos[k], `proyectos/${slug}`);
      fotos.push({ ...f, pie: pieUtil(meta), previa: esPrevia(meta), alt: `${d.titulo}${esPrevia(meta) ? ', situación previa' : ''}`, orden: k });
      nFotos++;
    }
    const portada = fotos.find((f) => !f.previa && !/plano/i.test(f.pie)) || fotos[0];
    await db.proyecto.create({
      data: {
        slug, titulo: d.titulo, tipo: TIPO[nombre], estado: 'TERMINADO',
        ubicacion: d.ubicacion, zona: zonaDe(d.ubicacion), programa: d.programa || '', superficies: d.superficies || '',
        situacionPrevia: d.situacionPrevia || '', trabajos: d.trabajos || '', descripcion: d.descripcion || '',
        portada: portada?.url || '', portadaAncho: portada?.ancho, portadaAlto: portada?.alto,
        destacado: DESTACADOS.includes(slug), orden, publicado: true, urlWix: URL_WIX[nombre],
        fotos: { create: fotos.map(({ url, ancho, alto, pie, previa, alt, orden }) => ({ url, ancho, alto, pie, previa, alt, orden })) },
      },
    });
    console.log('✓', slug, fotos.length, 'fotos');
  }
}

// Portada: las 3 fotos del carrusel de Wix + 2 obras de referencia
if (!(await db.diapositiva.count())) {
  const slides = [
    ['inicio/slider/01.jpg', 'Vivienda San Francisco'],
    ['inicio/slider/02.jpg', 'Silos Puntas de Valdez'],
    ['obras/hotel-hea-windham-montevideo/21.jpg', 'Hotel HEA Windham Montevideo'],
    ['inicio/slider/03.jpg', ''],
  ];
  for (const [k, [f, pie]] of slides.entries()) {
    const s = await subirFoto(path.join(FOTOS, f), 'portada');
    await db.diapositiva.create({ data: { imagen: s.url, ancho: s.ancho, alto: s.alto, titulo: pie || 'Obra de Burano', pie, orden: k } });
  }
}

// Indicadores (cifras del texto de Inicio, Servicios e Información)
if (!(await db.indicador.count())) {
  await db.indicador.createMany({ data: [
    { valor: 2014, texto: 'Burano construcciones nace en el año 2014', orden: 0 },
    { valor: 80000, prefijo: '+', sufijo: 'm²', texto: 'de estructuras de hormigón armado calculadas y ejecutadas', orden: 1 },
    { valor: 10000, sufijo: 'm²', texto: 'de estructuras metálicas calculadas y ejecutadas', orden: 2 },
    { valor: 10, prefijo: '+', sufijo: 'años', texto: 'de sólida experiencia del equipo técnico', orden: 3 },
  ] });
}

// Servicios
if (!(await db.servicio.count())) {
  const t = pag('servicios').textos.map(limpio);
  const arq = t.find((x) => x.startsWith('Nuestros servicios')).split('\n');
  const intro = arq.shift();
  const arqItems = arq.flatMap((l) => (l.startsWith('Asesoramientos personalizados Asesoramiento') ? ['Asesoramientos personalizados', 'Asesoramiento inicial SIN COSTO.'] : [l]));
  const cons = t.find((x) => x.startsWith('Obra nueva')).split('\n');
  const calc = t.find((x) => x.startsWith('Amplia experiencia')).split('\n');
  await db.servicio.createMany({ data: [
    { titulo: 'Arquitectura', intro, items: arqItems.join('\n'), destacados: 'Asesoramiento inicial SIN COSTO.', orden: 0 },
    { titulo: 'Construcción', items: cons.join('\n'), destacados: 'Presupuestos SIN COSTO.', orden: 1 },
    { titulo: 'Cálculo de estructuras', items: calc[0], orden: 2 },
  ] });
  const trabajos = calc.slice(2).map((l, k) => {
    const m = l.match(/^(.*?)\s*\/\s*(.*?)\s*\(([^)]+)\)\s*$/);
    return m ? { nombre: m[1].trim(), lugar: m[2].trim(), metros: m[3].trim(), orden: k } : null;
  }).filter(Boolean);
  await db.trabajoCalculo.createMany({ data: trabajos });
}

// Equipo técnico
if (!(await db.integrante.count())) {
  const t = pag('informacion').textos.map(limpio);
  const fichas = [...new Set(t.filter((x) => /^(Arq|Ing)\./.test(x)))];
  const exps = t.filter((x) => x.startsWith('Experiencia'));
  const linkedin = ['https://www.linkedin.com/in/carolina-cantieri-8099b94a/', 'https://www.linkedin.com/in/hugocantieri/', 'https://www.linkedin.com/in/marcelocantieri/'];
  const fotos = ['01.jpg', '02.jpg', '04.jpg'];
  for (const [k, f] of fichas.entries()) {
    const [nombre, titulo, cel] = f.split('\n');
    const ex = (exps[k] || '').split('\n').slice(1);
    const corte = ex.indexOf('Diplomas extracurriculares');
    const foto = await subirFoto(path.join(FOTOS, 'informacion/sueltas', fotos[k]), 'equipo');
    await db.integrante.create({ data: {
      nombre, titulo, celular: (cel || '').replace(/^Cel\.:\s*/, ''), linkedin: linkedin[k], foto: foto.url,
      experiencia: (corte < 0 ? ex : ex.slice(0, corte)).join('\n'), diplomas: corte < 0 ? '' : ex.slice(corte + 1).join('\n'), orden: k,
    } });
  }
}

console.log(`Listo: ${orden} fichas revisadas, ${nFotos} fotos subidas.`);
await db.$disconnect();
