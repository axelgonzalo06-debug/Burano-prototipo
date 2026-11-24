import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Primer filtro del administrador: sin sesión válida se va a /admin/ingresar.
// Cada página vuelve a validar el usuario y su rol contra la base.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/admin/ingresar')) return NextResponse.next();
  const token = req.cookies.get('burano_sesion')?.value;
  const ok = token && (await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET || 'solo-desarrollo-cambiar-en-vercel')).then(() => true, () => false));
  if (!ok) {
    if (pathname.startsWith('/api/')) return new NextResponse('Sesión vencida', { status: 401 });
    return NextResponse.redirect(new URL('/admin/ingresar', req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
