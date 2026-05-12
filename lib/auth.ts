import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key-at-least-32-chars'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com'
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || process.env.SECURE_ADMIN_HASH || ''

export async function authenticate(request: NextRequest) {
  const cookieStore = cookies()
  const token = cookieStore.get('admin_token')?.value

  if (!token) {
    return false
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string }
    return decoded.email === ADMIN_EMAIL
  } catch (error) {
    console.error('JWT verification failed:', error)
    return false
  }
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, message: 'Unauthorized access' },
    { status: 401 }
  )
}

export async function loginAdmin(password: string, email: string) {
  // Debug logs for environment variables
  if (process.env.NODE_ENV === 'development') {
    console.log('Login attempt:', { email })
    console.log('Stored Admin Email:', ADMIN_EMAIL)
    console.log('Stored Hash Length:', ADMIN_PASSWORD_HASH?.length)
    console.log('Stored Hash Start:', ADMIN_PASSWORD_HASH?.substring(0, 10))
  }

  if (email !== ADMIN_EMAIL) {
    if (process.env.NODE_ENV === 'development') console.log('Email mismatch')
    return { success: false, message: 'Invalid credentials' }
  }

  try {
    const isMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
    if (!isMatch) {
      if (process.env.NODE_ENV === 'development') console.log('Password hash mismatch')
      return { success: false, message: 'Invalid credentials' }
    }

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' })

    // Set cookie
    cookies().set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600, // 1 hour
      path: '/',
    })

    return { success: true, token }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, message: 'Server error during authentication' }
  }
}

export function logoutAdmin() {
  cookies().set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })
  return { success: true }
}
