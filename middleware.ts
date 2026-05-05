import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key-at-least-32-chars'

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

    if (!token) {
      if (isAdminPageRoute) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET)
      await jose.jwtVerify(token, secret)
      return NextResponse.next()
    } catch (error) {
      console.error('Middleware JWT verification failed:', error)
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
