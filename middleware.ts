import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'a-secure-default-jwt-secret-key-for-portfolio-32chars'

export async function middleware(request: NextRequest) {
  const isApiAdminRoute = request.nextUrl.pathname.startsWith('/api/admin')
  const isAdminPageRoute = request.nextUrl.pathname.startsWith('/admin')
  const isLoginRoute = request.nextUrl.pathname === '/admin/login' || request.nextUrl.pathname === '/api/admin/login'

  // Skip middleware for login routes
  if (isLoginRoute) {
    return NextResponse.next()
  }

  // Protect admin API and page routes
  if (isApiAdminRoute || isAdminPageRoute) {
    const token = request.cookies.get('admin_token')?.value

    if (!token || !JWT_SECRET) {
      if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
        console.error('CRITICAL: JWT_SECRET is not configured in production environment')
      }
      if (isAdminPageRoute) {
        const loginUrl = new URL('/admin/login', request.url)
        return NextResponse.redirect(loginUrl)
      }
      return NextResponse.json({
        success: false,
        message: !JWT_SECRET ? 'Server configuration error' : 'Unauthorized'
      }, { status: 401 })
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET)
      await jwtVerify(token, secret)
      return NextResponse.next()
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Middleware JWT verification failed:', error)
      }
      if (isAdminPageRoute) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
      return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 })
    }
  }

  return NextResponse.next()
}


// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
