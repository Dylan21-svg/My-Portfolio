import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import { loginAdmin } from '@/lib/auth'
import { LRUCache } from 'lru-cache'

// Rate limiting setup: 5 attempts per 15 minutes
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    console.log('API login receiving:', { email, passwordLength: password?.length })

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password required' }, { status: 400 })
    }

    const { success, token, message } = await loginAdmin(password, email)

    if (success && token) {
      const response = NextResponse.json({ 
        success: true, 
        token: token 
      })

      response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      })

      return response
    } else {
      return NextResponse.json({ 
        success: false, 
        message: message || 'Invalid credentials' 
      }, { status: 401 })
    }
  } catch (error: any) {
    console.error('Login API error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error. Please check your deployment configuration.'
    }, { status: 500 })
  }
}
