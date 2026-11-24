'use server';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { EstadoConsulta, EstadoProyecto, TipoProyecto } from '@prisma/client';
import { db } from '@/lib/db';
import { cerrarSesion, crearSesion, exigirAdmin, exigirUsuario } from '@/lib/auth';
import { AJUSTES_BASE } from '@/lib/ajustes';
import { borrarImagen, guardarImagen } from '@/lib/imagenes';
import { encolarCorreo, enviarPendientes, esc } from '@/lib/correo';

const txt = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();
const num = (fd: FormData, k: string) => (txt(fd, k) === '' ? null : Number(txt(fd, k)));
const refrescarSitio = () => revalidatePath('/', 'layout');

// ——— Sesión ———
export async function ingresar(_: string, fd: FormData) {
  const email = txt(fd, 'email').toLowerCase();
  const clave = txt(fd, 'clave');
  let u = await db.usuario.findUnique({ where: { email } });
  // Primer ingreso: si no hay usuarios, se crea el administrador con ADMIN_EMAIL / ADMIN_PASSWORD de Vercel.
  if (!u && (await db.usuario.count()) === 0 && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD
      && email === process.env.ADMIN_EMAIL.toLowerCase() && clave === process.env.ADMIN_PASSWORD) {
    u = await db.usuario.create({ data: { email, nombre: 'Administrador', hash: await bcrypt.hash(clave, 10), rol: 'ADMIN' } });
  }
  if (!u || !u.activo || !(await bcrypt.compare(clave, u.hash))) return 'Email o contraseña incorrectos.';
  await crearSesion({ id: u.id, nombre: u.nombre, email: u.email, rol: u.rol });
  redirect('/admin');
}

export async function salir() {
  await cerrarSesion();
  redirect('/admin/ingresar');
}

// ——— Proyectos ———
export async function guardarProyecto(fd: FormData) {
  await exigirUsuario();
  const id = txt(fd, 'id');
  const titulo = txt(fd, 'titulo');
  if (!titulo) redirect(`/admin/proyectos/${id || 'nuevo'}?error=titulo`);
  const slugBase = (txt(fd, 'slug') || titulo).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  let slug = slugBase;
  for (let k = 2; await db.proyecto.findFirst({ where: { slug, NOT: { id: id || undefined } } }); k++) slug = `${slugBase}-${k}`;
  const desde = txt(fd, 'publicarDesde');
  const data = {
    titulo, slug,
    subtitulo: txt(fd, 'subtitulo'),
    tipo: txt(fd, 'tipo') as TipoProyecto,
    estado: txt(fd, 'estado') as EstadoProyecto,
    ubicacion: txt(fd, 'ubicacion'), zona: txt(fd, 'zona'), programa: txt(fd, 'programa'),
    superficies: txt(fd, 'superficies'), situacionPrevia: txt(fd, 'situacionPrevia'), trabajos: txt(fd, 'trabajos'), descripcion: txt(fd, 'descripcion'),
    avance: num(fd, 'avance'), entrega: txt(fd, 'entrega'), lat: num(fd, 'lat'), lng: num(fd, 'lng'),
    destacado: fd.get('destacado') === 'on', publicado: fd.get('publicado') === 'on',
    publicarDesde: desde ? new Date(desde) : null, orden: num(fd, 'orden') ?? 0,
  };
  const p = id ? await db.proyecto.update({ where: { id }, data }) : await db.proyecto.create({ data });
  refrescarSitio();
  redirect(`/admin/proyectos/${p.id}?ok=1`);
}

export async function borrarProyecto(fd: FormData) {
  await exigirAdmin();
  const p = await db.proyecto.findUnique({ where: { id: txt(fd, 'id') }, include: { fotos: true, archivos: true } });
  if (p) {
    for (const f of p.fotos) await borrarImagen(f.url);
    for (const a of p.archivos) await borrarImagen(a.url);
    await db.proyecto.delete({ where: { id: p.id } });
  }
  refrescarSitio();
  redirect('/admin/proyectos?ok=borrado');
}

export async function actualizarFoto(id: string, cambios: { pie?: string; previa?: boolean; avance?: boolean; fecha?: string | null; alt?: string }) {
  await exigirUsuario();
  const { fecha, ...resto } = cambios;
  await db.foto.update({ where: { id }, data: { ...resto, ...(fecha !== undefined ? { fecha: fecha ? new Date(fecha) : null } : {}) } });
  refrescarSitio();
}

export async function ordenarFotos(ids: string[]) {
  await exigirUsuario();
  await db.$transaction(ids.map((id, orden) => db.foto.update({ where: { id }, data: { orden } })));
  refrescarSitio();
}

export async function usarDePortada(fotoId: string) {
  await exigirUsuario();
  const f = await db.foto.findUniqueOrThrow({ where: { id: fotoId } });
  await db.proyecto.update({ where: { id: f.proyectoId }, data: { portada: f.url, portadaAncho: f.ancho, portadaAlto: f.alto } });
  refrescarSitio();
}

export async function borrarFoto(fotoId: string) {
  await exigirUsuario();
  const f = await db.foto.delete({ where: { id: fotoId } });
  const p = await db.proyecto.findUnique({ where: { id: f.proyectoId } });
  if (p?.portada === f.url) await db.proyecto.update({ where: { id: p.id }, data: { portada: '' } });
  await borrarImagen(f.url);
  refrescarSitio();
}

export async function borrarArchivo(fd: FormData) {
  await exigirUsuario();
  const a = await db.archivo.delete({ where: { id: txt(fd, 'id') } });
  await borrarImagen(a.url);
  refrescarSitio();
  redirect(`/admin/proyectos/${a.proyectoId}?ok=1`);
}

// ——— Consultas ———
export async function estadoConsulta(fd: FormData) {
  await exigirUsuario();
  await db.consulta.update({ where: { id: txt(fd, 'id') }, data: { estado: txt(fd, 'estado') as EstadoConsulta, notas: txt(fd, 'notas') } });
  revalidatePath('/admin/consultas');
  redirect(`/admin/consultas?ok=1#c-${txt(fd, 'id')}`);
}

export async function responderConsulta(fd: FormData) {
  await exigirUsuario();
  const c = await db.consulta.findUniqueOrThrow({ where: { id: txt(fd, 'id') } });
  const cuerpo = txt(fd, 'respuesta');
  if (!cuerpo) redirect(`/admin/consultas?error=vacia#c-${c.id}`);
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5"><p style="white-space:pre-line">${esc(cuerpo)}</p><hr><p style="color:#666;font-size:13px">En respuesta a: ${esc(c.asunto || c.mensaje.slice(0, 80))}</p></div>`;
  await encolarCorreo(c.email, `Re: ${c.asunto || 'Tu consulta a Burano'}`, html);
  await db.consulta.update({ where: { id: c.id }, data: { estado: 'RESPONDIDA', notas: `${c.notas}\n[${new Date().toLocaleString('es-UY')}] Respondida por correo:\n${cuerpo}`.trim() } });
  revalidatePath('/admin/consultas');
  redirect(`/admin/consultas?ok=respondida#c-${c.id}`);
}

export async function reintentarCorreos() {
  await exigirUsuario();
  const r = await enviarPendientes();
  redirect(`/admin/consultas?ok=cola&enviados=${r.enviados}&pendientes=${r.pendientes}`);
}

// ——— Tablas simples (portada, indicadores, servicios, cálculo, equipo, menú, historia, clientes) ———
const CAMPOS = {
  diapositiva: { titulo: 's', pie: 's', enlace: 's', orden: 'n', activa: 'b' },
  indicador: { valor: 'n', prefijo: 's', sufijo: 's', texto: 's', orden: 'n' },
  servicio: { titulo: 's', intro: 's', items: 's', destacados: 's', orden: 'n' },
  trabajoCalculo: { nombre: 's', lugar: 's', metros: 's', orden: 'n' },
  integrante: { nombre: 's', titulo: 's', celular: 's', linkedin: 's', experiencia: 's', diplomas: 's', orden: 'n', activo: 'b' },
  itemMenu: { texto: 's', href: 's', orden: 'n', padre: 's', activo: 'b' },
  hito: { anio: 'n', titulo: 's', texto: 's', orden: 'n' },
  cliente: { nombre: 's', url: 's', orden: 'n' },
} as const;
type Modelo = keyof typeof CAMPOS;
const CON_IMAGEN: Partial<Record<Modelo, string>> = { diapositiva: 'imagen', integrante: 'foto', cliente: 'logo' };

export async function guardarFila(fd: FormData) {
  await exigirUsuario();
  const modelo = txt(fd, '_modelo') as Modelo;
  const volver = txt(fd, '_volver') || '/admin';
  const campos = CAMPOS[modelo];
  if (!campos) throw new Error('Modelo no permitido');
  const data: Record<string, unknown> = {};
  for (const [k, t] of Object.entries(campos)) {
    if (t === 'b') data[k] = fd.get(k) === 'on';
    else if (t === 'n') data[k] = num(fd, k) ?? 0;
    else data[k] = k === 'padre' ? txt(fd, k) || null : txt(fd, k);
  }
  const archivo = fd.get('_imagen');
  const campoImg = CON_IMAGEN[modelo];
  if (campoImg && archivo instanceof File && archivo.size > 0) {
    const img = await guardarImagen(Buffer.from(await archivo.arrayBuffer()), archivo.name, { carpeta: modelo, max: modelo === 'diapositiva' ? 2600 : 1200 });
    data[campoImg] = img.url;
    if (modelo === 'diapositiva') Object.assign(data, { ancho: img.ancho, alto: img.alto });
  }
  const id = txt(fd, '_id');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tabla = (db as any)[modelo];
  if (id) await tabla.update({ where: { id }, data });
  else {
    if (modelo === 'diapositiva' && !data.imagen) redirect(`${volver}?error=imagen`);
    await tabla.create({ data });
  }
  refrescarSitio();
  redirect(`${volver}?ok=1`);
}

export async function borrarFila(fd: FormData) {
  await exigirUsuario();
  const modelo = txt(fd, '_modelo') as Modelo;
  if (!CAMPOS[modelo]) throw new Error('Modelo no permitido');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fila = await (db as any)[modelo].delete({ where: { id: txt(fd, '_id') } });
  const campoImg = CON_IMAGEN[modelo];
  if (campoImg && fila[campoImg]) await borrarImagen(fila[campoImg]);
  refrescarSitio();
  redirect(`${txt(fd, '_volver') || '/admin'}?ok=borrado`);
}

// ——— Ajustes (solo administrador) ———
export async function guardarAjustes(fd: FormData) {
  await exigirAdmin();
  const claves = Object.keys(AJUSTES_BASE);
  await db.$transaction(claves.filter((k) => fd.has(k)).map((clave) => db.ajuste.upsert({ where: { clave }, create: { clave, valor: txt(fd, clave) }, update: { valor: txt(fd, clave) } })));
  refrescarSitio();
  redirect('/admin/ajustes?ok=1');
}

// ——— Usuarios (solo administrador) ———
export async function guardarUsuario(fd: FormData) {
  const yo = await exigirAdmin();
  const id = txt(fd, 'id');
  const clave = txt(fd, 'clave');
  const data = { nombre: txt(fd, 'nombre'), email: txt(fd, 'email').toLowerCase(), rol: (txt(fd, 'rol') === 'ADMIN' ? 'ADMIN' : 'EDITOR') as 'ADMIN' | 'EDITOR', activo: fd.get('activo') === 'on' };
  if (id === yo.id) Object.assign(data, { rol: 'ADMIN', activo: true }); // nadie se quita el acceso a sí mismo
  if (!data.email || !data.nombre) redirect('/admin/usuarios?error=datos');
  if (clave && clave.length < 10) redirect('/admin/usuarios?error=clave');
  if (id) await db.usuario.update({ where: { id }, data: { ...data, ...(clave ? { hash: await bcrypt.hash(clave, 10) } : {}) } });
  else {
    if (!clave) redirect('/admin/usuarios?error=clave');
    await db.usuario.create({ data: { ...data, hash: await bcrypt.hash(clave, 10) } });
  }
  redirect('/admin/usuarios?ok=1');
}
