import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'your-default-secret-key-at-least-32-chars')
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || (process.env.NODE_ENV === 'production' ? '' : 'admin@example.com')
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || process.env.SECURE_ADMIN_HASH || ''

// Security check: Ensure essential environment variables are set in production
const validateConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    if (!JWT_SECRET || JWT_SECRET === 'your-default-secret-key-at-least-32-chars') {
      throw new Error('JWT_SECRET environment variable is required in production')
    }
    if (!ADMIN_EMAIL || ADMIN_EMAIL === 'admin@example.com') {
      throw new Error('ADMIN_EMAIL environment variable is required in production')
    }
    if (!ADMIN_PASSWORD_HASH) {
      throw new Error('ADMIN_PASSWORD_HASH environment variable is required in production')
    }
  }
}

export async function authenticate(request: NextRequest) {
  validateConfig()
  const cookieStore = cookies()
  const token = cookieStore.get('admin_token')?.value

  if (!token || !JWT_SECRET) {
    return false
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string }
    return decoded.email === ADMIN_EMAIL
  } catch (error) {
    // Don't leak error details in logs in production
    if (process.env.NODE_ENV !== 'production') {
      console.error('JWT verification failed:', error)
    }
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
  return {
    success: false,
    token: undefined as string | undefined,
    message: 'Admin login is currently disabled for security reasons.'
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
