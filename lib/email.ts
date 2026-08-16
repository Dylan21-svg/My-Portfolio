/**
 * Email service utility for handling contact form submissions
 * In production, replace this with a real email service like SendGrid, Resend, or EmailJS
 */

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export async function sendContactEmail(data: ContactFormData): Promise<{ success: boolean; message: string }> {
  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // In production, you would call your actual email API here:
    // const response = await fetch('/api/send-email', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // })

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Contact form submission:', data)
    }

    // Save to localStorage as a fallback
    const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]')
    submissions.push({
      ...data,
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem('contactSubmissions', JSON.stringify(submissions))

    return {
      success: true,
      message: 'Thank you for reaching out! I will get back to you soon.',
    }
  } catch (error) {
    console.error('Error sending email:', error)
    return {
      success: false,
      message: 'Failed to send message. Please try again later.',
    }
  }
}
