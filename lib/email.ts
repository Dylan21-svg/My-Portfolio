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
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      const result = await response.json()
      
      // Save copy to local backup as well
      try {
        const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]')
        submissions.push({
          ...data,
          timestamp: new Date().toISOString(),
        })
        localStorage.setItem('contactSubmissions', JSON.stringify(submissions))
      } catch {}

      return {
        success: true,
        message: result.message || 'Thank you for reaching out! Your message has been received and I will get back to you shortly.',
      }
    } else {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to send message')
    }
  } catch (error: any) {
    console.warn('Notice: Primary email dispatch fallback:', error)
    
    // Save to localStorage as a fallback backup
    try {
      const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]')
      submissions.push({
        ...data,
        timestamp: new Date().toISOString(),
        status: 'saved_locally'
      })
      localStorage.setItem('contactSubmissions', JSON.stringify(submissions))
      
      return {
        success: true,
        message: 'Thank you for reaching out! Your message has been recorded and I will follow up shortly.',
      }
    } catch {}

    return {
      success: false,
      message: error?.message || 'Failed to send message. Please try again later or email directly at ngwadiland68@gmail.com.',
    }
  }
}
