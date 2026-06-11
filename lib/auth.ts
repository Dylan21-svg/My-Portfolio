import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'your-default-secret-key-at-least-32-chars')
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || (process.env.NODE_ENV === 'production' ? 'ngwadiland68@gmail.com' : 'ngwadiland68@gmail.com')
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || process.env.SECURE_ADMIN_HASH || '$2b$10$pAg.ny2bg54PhKkkWTvuZe2kwVykiRqawqfIgw/vqbQo6ozmn9zZC'

// Security check: Ensure essential environment variables are set in production
const validateConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    const missingVars = []
    if (!JWT_SECRET || JWT_SECRET === 'your-default-secret-key-at-least-32-chars') {
      missingVars.push('JWT_SECRET')
    }
    if (!ADMIN_EMAIL || ADMIN_EMAIL === 'admin@example.com') {
      missingVars.push('ADMIN_EMAIL')
    }
    if (!ADMIN_PASSWORD_HASH) {
      missingVars.push('ADMIN_PASSWORD_HASH')
    }

    if (missingVars.length > 0) {
      const errorMsg = `Production configuration error: Missing or invalid environment variables: ${missingVars.join(', ')}. Please set these in Vercel project settings.`
      console.error(errorMsg)
      throw new Error(errorMsg)
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

  if (email !== ADMIN_EMAIL) {
    return { success: false, message: 'Invalid credentials' }
  }

  const isPasswordCorrect = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)

  if (!isPasswordCorrect) {
    return { success: false, message: 'Invalid credentials' }
  }

  if (!JWT_SECRET) {
    return { success: false, message: 'Server configuration error' }
  }

  const token = jwt.sign({ email: ADMIN_EMAIL }, JWT_SECRET, { expiresIn: '24h' })

  cookies().set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })

  return {
    success: true,
    token,
    message: 'Login successful'
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
