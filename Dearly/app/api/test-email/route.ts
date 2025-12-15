import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, getBookingConfirmationEmail, getInterviewReminderEmail, getRecordingDeliveryEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const { emailType, recipientEmail } = await request.json()

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'recipientEmail is required' },
        { status: 400 }
      )
    }

    let subject = ''
    let html = ''

    // Generate sample email based on type
    switch (emailType) {
      case 'booking_confirmation':
        subject = 'New Interview Scheduled - Dearly'
        html = getBookingConfirmationEmail(
          'Alex Johnson', // interviewer name
          'Sarah Smith', // customer name
          'Grandma Rose', // interviewee name
          'Monday, December 16, 2025 at 2:00 PM EST', // scheduled time
          {
            length_minutes: 60,
            medium: 'zoom',
            relationship_to_interviewee: 'Granddaughter',
            notes: 'She loves talking about her childhood in Italy and her journey to America.',
            questions: [
              { text: 'What was your childhood like growing up?' },
              { text: 'Tell me about your journey to America.' },
              { text: 'What was your first job?' },
              { text: 'How did you meet grandpa?' },
            ]
          }
        )
        break

      case 'reminder':
        subject = 'Your Dearly Interview is Tomorrow!'
        html = getInterviewReminderEmail(
          'Sarah', // customer name
          'Grandma Rose', // interviewee name
          'Tomorrow at 2:00 PM EST', // scheduled time
          'https://dearly.com/booking/manage/sample-token' // manage booking URL
        )
        break

      case 'recording_delivery':
        subject = 'Your Recording is Ready! - Dearly'
        html = getRecordingDeliveryEmail(
          'Sarah', // customer name
          'https://dearly.com/recordings/sample-recording' // recording URL
        )
        break

      default:
        return NextResponse.json(
          { error: 'Invalid emailType. Use: booking_confirmation, reminder, or recording_delivery' },
          { status: 400 }
        )
    }

    // Send the email
    const result = await sendEmail({
      to: recipientEmail,
      subject,
      html,
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `${emailType} email sent to ${recipientEmail}`,
        data: result.data
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
