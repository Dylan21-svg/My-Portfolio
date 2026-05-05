import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { name, email, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // TODO: Implement actual email sending service here
    // Examples:
    // - SendGrid: https://sendgrid.com
    // - Resend: https://resend.com
    // - EmailJS: https://www.emailjs.com
    // - Nodemailer with SMTP

    console.log('Contact form submission:', {
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString(),
    })

    // Return success response
    return NextResponse.json(
      { success: true, message: 'Email sent successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error processing contact form:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
