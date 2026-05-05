import { NextRequest, NextResponse } from 'next/server'
import { loginAdmin } from '@/lib/auth'
import { LRUCache } from 'lru-cache'

// Rate limiting setup: 5 attempts per 15 minutes
const loginRateLimit = new LRUCache<string, number>({
  max: 500,
  ttl: 15 * 60 * 1000,
})

export async function POST(request: NextRequest) {
  try {
    const ip = request.ip || 'anonymous'
    const attempts = loginRateLimit.get(ip) || 0
    console.log('Rate limit check:', { attempts, ip })

    if (attempts >= 5) {
      return NextResponse.json({ 
        success: false, 
        message: 'Too many login attempts. Please try again in 15 minutes.' 
      }, { status: 429 })
    }

    const { email, password } = await request.json()
    console.log('API login receiving:', { email, passwordLength: password?.length })

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password required' }, { status: 400 })
    }

    const { success, token, message } = await loginAdmin(password, email)

    if (success) {
      loginRateLimit.delete(ip) // Reset on success
      return NextResponse.json({ 
        success: true, 
        token: token 
      })
    } else {
      loginRateLimit.set(ip, attempts + 1)
      return NextResponse.json({ 
        success: false, 
        message: message || 'Invalid credentials' 
      }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Server error' 
    }, { status: 500 })
  }
}
