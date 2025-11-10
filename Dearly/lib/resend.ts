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

export function getPaymentSuccessEmail(name: string, calendlyLink: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Thank You for Your Purchase!</h1>
          <p>Hi ${name},</p>
          <p>Thank you for choosing Dearly to preserve your loved one's story. Your payment has been successfully processed.</p>
          <p>The next step is to schedule your interview session. Please click the button below to choose a time that works best for you:</p>
          <a href="${calendlyLink}" class="button">Schedule Your Interview</a>
          <p>You'll receive a confirmation email once your session is booked. If you have any questions, please don't hesitate to reach out.</p>
          <p>We look forward to helping you capture these precious memories!</p>
          <p>Best regards,<br>The Dearly Team</p>
          <div class="footer">
            <p>This email was sent by Dearly. If you have any questions, please contact us at ${process.env.INTERNAL_TEAM_EMAIL}</p>
          </div>
        </div>
      </body>
    </html>
  `
}

export function getBookingConfirmationEmail(
  interviewerName: string,
  customerName: string,
  intervieweeName: string,
  scheduledTime: string,
  questionnaire: any
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .info-box { background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .questions { margin: 20px 0; }
          .question { margin: 10px 0; padding: 10px; background-color: #f9fafb; border-left: 3px solid #4F46E5; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>New Interview Scheduled</h1>
          <p>Hi ${interviewerName},</p>
          <p>A new interview session has been scheduled:</p>
          <div class="info-box">
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Interviewee:</strong> ${intervieweeName}</p>
            <p><strong>Scheduled Time:</strong> ${scheduledTime}</p>
            <p><strong>Duration:</strong> ${questionnaire.length_minutes} minutes</p>
            <p><strong>Medium:</strong> ${questionnaire.medium.replace('_', ' ').toUpperCase()}</p>
            <p><strong>Relationship:</strong> ${questionnaire.relationship_to_interviewee}</p>
          </div>
          ${questionnaire.notes ? `<p><strong>Additional Notes:</strong><br>${questionnaire.notes}</p>` : ''}
          <div class="questions">
            <h3>Interview Questions:</h3>
            ${questionnaire.questions.map((q: any, i: number) => `
              <div class="question">
                <strong>Q${i + 1}:</strong> ${q.text}
              </div>
            `).join('')}
          </div>
          <p>Please review the questions and prepare for the interview. Good luck!</p>
        </div>
      </body>
    </html>
  `
}

export function getRecordingDeliveryEmail(name: string, recordingUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Your Recording is Ready!</h1>
          <p>Hi ${name},</p>
          <p>Great news! Your Dearly interview recording is now ready to view and download.</p>
          <p>This recording captures precious memories and stories that will be treasured for generations to come.</p>
          <a href="${recordingUrl}" class="button">Access Your Recording</a>
          <p>We recommend downloading a copy for safekeeping. If you have any questions or need assistance, please don't hesitate to reach out.</p>
          <p>Thank you for choosing Dearly to preserve these important stories.</p>
          <p>Best regards,<br>The Dearly Team</p>
          <div class="footer">
            <p>This email was sent by Dearly. If you have any questions, please contact us at ${process.env.INTERNAL_TEAM_EMAIL}</p>
          </div>
        </div>
      </body>
    </html>
  `
}

