import { NextRequest, NextResponse } from 'next/server'
import { sendMail } from '@/lib/mail'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('Triggering test email...')

    const result = await sendMail({
      variables: {
        name: 'Test User',
        message: 'This is a test email from the admin portal system verification.'
      }
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        status: 'ok',
        message: 'Test email triggered successfully',
        data: result.data
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to trigger test email',
        error: result.error,
        details: result.details
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in test mail route:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
