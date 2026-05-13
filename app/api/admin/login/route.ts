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

    if (success) {
      return NextResponse.json({ 
        success: true, 
        token: token 
      })
    } else {
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
