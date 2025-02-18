import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Liste des routes qui nécessitent une authentification
const protectedRoutes = [
  '/profile',
  '/settings',
  '/playlists',
  '/playlist/create',
];

// Liste des routes publiques (pas besoin d'authentification)
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/offline',
  '/search',
  '/album',
  '/artist',
  '/jam',
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken');
  const { pathname } = request.nextUrl;

  // Si c'est une route protégée et qu'il n'y a pas de token
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si c'est une route d'auth et qu'il y a un token, rediriger vers la home
  if (pathname.startsWith('/auth/') && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
