import { NextRequest, NextResponse } from 'next/server'
import { authenticate, unauthorizedResponse } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const isAuth = await authenticate(request)
  
  if (isAuth) {
    return NextResponse.json({ success: true, message: 'Authenticated' })
  } else {
    return unauthorizedResponse()
  }
}
