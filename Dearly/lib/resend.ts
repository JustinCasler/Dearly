import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  // Check if Resend API key is configured
  if (!process.env.RESEND_API_KEY) {
    const error = new Error('RESEND_API_KEY is not configured in environment variables')
    console.error('Resend API key missing:', error.message)
    return { success: false, error }
  }

  try {
    // For testing: Use onboarding@resend.dev if domain not verified
    // For production: Use your verified domain
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    
    const data = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    })
    
    return { success: true, data }
  } catch (error: any) {
    console.error('Error sending email via Resend:', {
      to,
      subject,
      error: error?.message || error,
      errorCode: error?.code,
    })
    return { 
      success: false, 
      error: error?.message || 'Unknown error',
      errorDetails: error
    }
  }
}

export function getBookingConfirmationEmail(
  interviewerName: string,
  customerName: string,
  intervieweeName: string,
  scheduledTime: string,
  questionnaire: any
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .email-wrapper {
            background-color: #f5f5f5;
            padding: 40px 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
          }
          .logo-section {
            padding: 40px 20px 20px;
            text-align: center;
          }
          .logo {
            max-width: 200px;
            height: auto;
          }
          .content {
            padding: 20px 40px 40px;
          }
          .content p {
            color: #333333;
            margin: 12px 0;
            font-size: 16px;
          }
          .info-box {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .info-box p {
            margin: 8px 0;
            font-size: 15px;
          }
          .questions {
            margin: 25px 0;
          }
          .questions h3 {
            color: #333333;
            font-size: 18px;
            margin-bottom: 15px;
          }
          .question {
            margin: 10px 0;
            padding: 12px;
            background-color: #f9f9f9;
            border-radius: 4px;
            font-size: 14px;
          }
          .footer {
            padding: 20px;
            text-align: center;
            color: #999999;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="container">
            <div class="logo-section">
              <img src="${baseUrl}/dearly-logo.png" alt="Dearly" class="logo" />
            </div>
            <div class="content">
              <p>Hi ${interviewerName},</p>
              <p>New interview scheduled:</p>
              <div class="info-box">
                <p><strong>Customer:</strong> ${customerName}</p>
                <p><strong>Interviewee:</strong> ${intervieweeName}</p>
                <p><strong>Time:</strong> ${scheduledTime}</p>
                <p><strong>Duration:</strong> ${questionnaire.length_minutes} minutes</p>
                <p><strong>Medium:</strong> ${questionnaire.medium.replace('_', ' ')}</p>
                <p><strong>Relationship:</strong> ${questionnaire.relationship_to_interviewee}</p>
              </div>
              ${questionnaire.notes ? `<p><strong>Notes:</strong> ${questionnaire.notes}</p>` : ''}
              <div class="questions">
                <h3>Questions</h3>
                ${questionnaire.questions.map((q: any, i: number) => `
                  <div class="question">
                    <strong>${i + 1}.</strong> ${q.text}
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="footer">
              <p>Dearly - Preserve Your Stories</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}

export function getInterviewReminderEmail(
  name: string,
  intervieweeName: string,
  scheduledTime: string,
  manageBookingUrl: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .email-wrapper {
            background-color: #f5f5f5;
            padding: 40px 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
          }
          .logo-section {
            padding: 40px 20px 20px;
            text-align: center;
          }
          .logo {
            max-width: 200px;
            height: auto;
          }
          .content {
            padding: 20px 40px 40px;
            text-align: center;
          }
          .content p {
            color: #333333;
            margin: 15px 0;
            font-size: 16px;
          }
          .info-box {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .info-box p {
            margin: 8px 0;
            font-size: 15px;
          }
          .button {
            display: inline-block;
            padding: 16px 40px;
            background-color: #0b4e9d;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: 600;
            font-size: 16px;
          }
          .footer {
            padding: 20px;
            text-align: center;
            color: #999999;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="container">
            <div class="logo-section">
              <img src="${baseUrl}/dearly-logo.png" alt="Dearly" class="logo" />
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Your interview with ${intervieweeName} is tomorrow.</p>
              <div class="info-box">
                <p><strong>Time:</strong> ${scheduledTime}</p>
                <p><strong>Interviewee:</strong> ${intervieweeName}</p>
              </div>
              <p style="font-size: 14px; color: #666666;">
                You'll receive the meeting link closer to your scheduled time.
              </p>
              <a href="${manageBookingUrl}" class="button">Manage Booking</a>
            </div>
            <div class="footer">
              <p>Dearly - Preserve Your Stories</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}

export function getEmailSignupConfirmationEmail() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .email-wrapper {
            background-color: #f5f5f5;
            padding: 40px 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
          }
          .logo-section {
            padding: 40px 20px 20px;
            text-align: center;
          }
          .logo {
            max-width: 200px;
            height: auto;
          }
          .content {
            padding: 20px 40px 40px;
            text-align: center;
          }
          .content p {
            color: #333333;
            margin: 15px 0;
            font-size: 16px;
          }
          .button {
            display: inline-block;
            padding: 16px 40px;
            background-color: #0b4e9d;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            margin: 30px 0;
            font-weight: 600;
            font-size: 16px;
          }
          .footer {
            padding: 20px;
            text-align: center;
            color: #999999;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="container">
            <div class="logo-section">
              <img src="${baseUrl}/dearly-logo.png" alt="Dearly" class="logo" />
            </div>
            <div class="content">
              <p style="font-size: 24px; font-weight: 600; color: #0b4e9d;">Thank you for subscribing!</p>
              <p>We'll keep you updated on Dearly's latest features and stories.</p>
              <p style="font-size: 14px; color: #666666; margin-top: 30px;">
                In the meantime, check out our website to learn more about preserving your family's stories.
              </p>
              <a href="${baseUrl}" class="button">Visit Dearly</a>
            </div>
            <div class="footer">
              <p>Dearly - Preserve Your Stories</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}

export function getPaymentConfirmationEmail(name: string, packageName: string, intervieweeName: string, sessionId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const bookingUrl = `${baseUrl}/booking/${sessionId}`

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .email-wrapper {
            background-color: #f5f5f5;
            padding: 40px 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
          }
          .logo-section {
            padding: 40px 20px 20px;
            text-align: center;
          }
          .logo {
            max-width: 200px;
            height: auto;
          }
          .content {
            padding: 20px 40px 40px;
            text-align: center;
          }
          .content p {
            color: #333333;
            margin: 15px 0;
            font-size: 16px;
          }
          .info-box {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            text-align: left;
          }
          .info-box p {
            margin: 8px 0;
            font-size: 15px;
          }
          .button {
            display: inline-block;
            padding: 16px 40px;
            background-color: #0b4e9d;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            margin: 30px 0;
            font-weight: 600;
            font-size: 16px;
          }
          .footer {
            padding: 20px;
            text-align: center;
            color: #999999;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="container">
            <div class="logo-section">
              <img src="${baseUrl}/dearly-logo.png" alt="Dearly" class="logo" />
            </div>
            <div class="content">
              <p style="font-size: 24px; font-weight: 600; color: #0b4e9d;">Payment Confirmed!</p>
              <p>Hi ${name},</p>
              <p>Thank you for your purchase. Your payment has been successfully processed.</p>
              <div class="info-box">
                <p><strong>Package:</strong> Dearly ${packageName}</p>
                <p><strong>Interviewee:</strong> ${intervieweeName}</p>
              </div>
              <p style="font-size: 15px; color: #666666;">
                Next step: Schedule your interview by clicking the button below.
              </p>
              <a href="${bookingUrl}" class="button">Schedule Interview</a>
              <p style="font-size: 13px; color: #999999; margin-top: 30px;">
                Questions? Reply to this email and we'll be happy to help.
              </p>
            </div>
            <div class="footer">
              <p>Dearly - Preserve Your Stories</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}

export function getRecordingDeliveryEmail(name: string, listeningToken: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const listeningUrl = `${baseUrl}/listen/${listeningToken}`

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .email-wrapper {
            background-color: #f5f5f5;
            padding: 40px 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
          }
          .logo-section {
            padding: 40px 20px 20px;
            text-align: center;
          }
          .logo {
            max-width: 200px;
            height: auto;
          }
          .content {
            padding: 20px 40px 40px;
            text-align: center;
          }
          .content p {
            color: #333333;
            margin: 15px 0;
            font-size: 16px;
          }
          .button {
            display: inline-block;
            padding: 16px 40px;
            background-color: #0b4e9d;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            margin: 30px 0;
            font-weight: 600;
            font-size: 16px;
          }
          .footer {
            padding: 20px;
            text-align: center;
            color: #999999;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="container">
            <div class="logo-section">
              <img src="${baseUrl}/dearly-logo.png" alt="Dearly" class="logo" />
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Your recording is ready to listen and share.</p>
              <a href="${listeningUrl}" class="button">Listen Now</a>
              <p style="font-size: 14px; color: #999999; margin-top: 30px;">
                Share this link with family:<br>
                <a href="${listeningUrl}" style="color: #0b4e9d; word-break: break-all;">
                  ${listeningUrl}
                </a>
              </p>
            </div>
            <div class="footer">
              <p>Dearly - Preserve Your Stories</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}

