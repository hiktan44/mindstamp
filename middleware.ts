import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

export default auth((req) => {
  const token = req.auth
  const pathname = req.nextUrl.pathname
  const isLoggedIn = !!token

  const isAuthRoute = pathname === '/giris' || pathname === '/kayit'
  const isDashboardRoute = pathname.startsWith('/dashboard')

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  }

  if (isDashboardRoute) {
    if (!isLoggedIn) {
      const from = pathname + req.nextUrl.search
      return NextResponse.redirect(new URL(`/giris?callbackUrl=${encodeURIComponent(from)}`, req.url))
    }

    // Super admin check for admin routes
    if (pathname.startsWith('/dashboard/admin')) {
      if ((token as any)?.role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/videos/upload|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
