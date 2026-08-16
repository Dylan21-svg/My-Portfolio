import { NextRequest, NextResponse } from 'next/server'
import { logoutAdmin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    logoutAdmin()
    return NextResponse.json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error during logout' }, { status: 500 })
  }
}
