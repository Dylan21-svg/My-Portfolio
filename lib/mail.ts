export interface MailPayload {
  template_id: string
  to: string
  variables: Record<string, any>
}

export interface MailData {
  to?: string
  subject?: string // Kept for legacy/convenience, though Mail Console uses templates
  variables: Record<string, any>
  templateId?: string
}

export async function sendMail(data: MailData) {
  const apiKey = process.env.MAIL_CONSOLE_API_KEY
  const defaultTemplateId = process.env.MAIL_CONSOLE_TEMPLATE_ID
  const apiUrl = process.env.MAIL_CONSOLE_API_URL || 'https://api.mailconsole.io/v1/send'
  const isMock = process.env.MAIL_CONSOLE_MOCK === 'true' || !apiKey

  const payload: MailPayload = {
    template_id: data.templateId || defaultTemplateId || 'default',
    to: data.to || process.env.CONTACT_EMAIL || process.env.ADMIN_EMAIL || 'ngwadiland68@gmail.com',
    variables: data.variables
  }

  if (isMock) {
    console.log('📧 [Mock Email Service] Sent payload:', payload)
    return { success: true, status: 'ok', mock: true, data: payload }
  }

  try {
    console.log('Sending email via Mail Console...', {
      to: payload.to,
      templateId: payload.template_id
    })

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Mail Console API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      return {
        success: false,
        error: `Mail Console API error: ${response.status} ${response.statusText}`,
        details: errorText
      }
    }

    const result = await response.json()
    console.log('Email sent successfully via Mail Console:', result)
    return { success: true, status: 'ok', data: result }
  } catch (error) {
    console.error('Failed to send email via Mail Console:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
