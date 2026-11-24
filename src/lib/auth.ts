import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from './db';

const COOKIE = 'burano_sesion';
const clave = () => new TextEncoder().encode(process.env.AUTH_SECRET || 'solo-desarrollo-cambiar-en-vercel');

export type Sesion = { id: string; nombre: string; email: string; rol: 'ADMIN' | 'EDITOR' };

export async function crearSesion(s: Sesion) {
  const token = await new SignJWT(s).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('14d').sign(clave());
  (await cookies()).set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 14 });
}

export async function cerrarSesion() {
  (await cookies()).delete(COOKIE);
}

export async function leerToken(token?: string): Promise<Sesion | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, clave());
    return payload as unknown as Sesion;
  } catch {
    return null;
  }
}

export async function sesion(): Promise<Sesion | null> {
  const s = await leerToken((await cookies()).get(COOKIE)?.value);
  if (!s) return null;
  const u = await db.usuario.findUnique({ where: { id: s.id } });
  if (!u || !u.activo) return null;
  return { id: u.id, nombre: u.nombre, email: u.email, rol: u.rol };
}

export async function exigirUsuario() {
  const s = await sesion();
  if (!s) redirect('/admin/ingresar');
  return s;
}

export async function exigirAdmin() {
  const s = await exigirUsuario();
  if (s.rol !== 'ADMIN') redirect('/admin?error=permiso');
  return s;
}

export const COOKIE_SESION = COOKIE;
