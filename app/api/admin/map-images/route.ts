import { NextRequest, NextResponse } from 'next/server'
import { executeImageMapping } from '@/lib/image-mapper'

export async function POST(req: NextRequest) {
  try {
    const result = executeImageMapping()
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const result = executeImageMapping()
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
