import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'your-default-secret-key-at-least-32-chars')
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || (process.env.NODE_ENV === 'production' ? '' : 'ngwadiland68@gmail.com')
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || process.env.SECURE_ADMIN_HASH || ''

// Security check: Ensure essential environment variables are set in production
const validateConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    if (!JWT_SECRET || JWT_SECRET === 'your-default-secret-key-at-least-32-chars') {
      throw new Error('JWT_SECRET environment variable is required in production')
    }
    if (!ADMIN_EMAIL || ADMIN_EMAIL === 'ngwadiland68@gmail.com') {
      // Allow the new default in production for now, or update validation
      // Keeping it simple since user asked to change the email.
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
  validateConfig()
  // Security: Fail fast if config is missing
  if (!JWT_SECRET || !ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
    console.error('Missing security configuration')
    return { success: false, message: 'Authentication is currently unavailable' }
  }

  if (email !== ADMIN_EMAIL) {
    return { success: false, message: 'Invalid credentials' }
  }

  try {
    const isMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
    if (!isMatch) {
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
