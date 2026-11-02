import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { sesion } from '@/lib/auth';

// Vista previa de borradores: solo para usuarios del administrador.
export async function GET(req: Request) {
  const s = await sesion();
  if (!s) return new Response('Ingresá al administrador para ver la vista previa.', { status: 401 });
  const ruta = new URL(req.url).searchParams.get('ruta') || '/';
  draftMode().enable();
  redirect(ruta.startsWith('/') ? ruta : '/');
}
