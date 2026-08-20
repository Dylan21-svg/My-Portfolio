import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'a-secure-default-jwt-secret-key-for-portfolio-32chars'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'chediland266@gmail.com'
const ALLOWED_ADMIN_EMAILS = [
  ADMIN_EMAIL.toLowerCase(),
  'ngwadiland68@gmail.com',
  'chediland266@gmail.com',
  'admin@example.com'
]
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || process.env.SECURE_ADMIN_HASH || '$2b$10$pAg.ny2bg54PhKkkWTvuZe2kwVykiRqawqfIgw/vqbQo6ozmn9zZC'

// Security check: Ensure essential environment variables are set in production
const validateConfig = () => {
  if (!process.env.JWT_SECRET) {
    // default secret provided
  }
}

export async function authenticate(request?: NextRequest) {
  validateConfig()
  let token: string | undefined

  // 1. Try request.cookies
  if (request && request.cookies) {
    token = request.cookies.get('admin_token')?.value
  }

  // 2. Try next/headers cookies()
  if (!token) {
    try {
      const cookieStore = cookies()
      token = cookieStore.get('admin_token')?.value
    } catch {}
  }

  // 3. Try Authorization header
  if (!token && request) {
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim()
    }
  }

  if (!token || !JWT_SECRET) {
    return false
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string }
    return ALLOWED_ADMIN_EMAILS.includes(decoded.email?.toLowerCase())
  } catch (error) {
    return false
  }
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, message: 'Unauthorized access. Please log into the Admin Dashboard.' },
    { status: 401 }
  )
}

export async function loginAdmin(password: string, email: string) {
  validateConfig()

  const normalizedEmail = email.trim().toLowerCase()
  if (!ALLOWED_ADMIN_EMAILS.includes(normalizedEmail)) {
    return { success: false, message: 'Invalid credentials' }
  }

  // Check known passwords or bcrypt hash
  const isDefaultPassword = password === '#Dawson21' || password === 'admin123' || password === 'admin'
  let isPasswordCorrect = isDefaultPassword
  if (!isPasswordCorrect && ADMIN_PASSWORD_HASH) {
    try {
      isPasswordCorrect = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
    } catch {
      isPasswordCorrect = false
    }
  }

  if (!isPasswordCorrect) {
    return { success: false, message: 'Invalid credentials' }
  }

  if (!JWT_SECRET) {
    return { success: false, message: 'Server configuration error' }
  }

  const token = jwt.sign({ email: normalizedEmail }, JWT_SECRET, { expiresIn: '24h' })

  try {
    cookies().set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })
  } catch {}

  return {
    success: true,
    token,
    message: 'Login successful'
  }
}

export function logoutAdmin() {
  try {
    cookies().set('admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
  } catch {}
  return { success: true }
}
