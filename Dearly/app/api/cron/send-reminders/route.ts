import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { sendEmail, getInterviewReminderEmail } from '@/lib/resend'

/**
 * Cron job to send reminder emails for interviews happening tomorrow
 * Runs daily at 9:00 AM EST
 *
 * Vercel Cron: 0 14 * * * (9 AM EST = 2 PM UTC)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate tomorrow's date range (in EST)
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Start of tomorrow (00:00:00)
    const tomorrowStart = new Date(tomorrow)
    tomorrowStart.setHours(0, 0, 0, 0)

    // End of tomorrow (23:59:59)
    const tomorrowEnd = new Date(tomorrow)
    tomorrowEnd.setHours(23, 59, 59, 999)

    // Get all appointments scheduled for tomorrow
    const { data: appointments, error: appointmentsError } = await supabaseAdmin
      .from('appointments')
      .select(`
        id,
        start_time,
        booking_token,
        session:session_id (
          id,
          user_id
        )
      `)
      .eq('status', 'scheduled')
      .gte('start_time', tomorrowStart.toISOString())
      .lte('start_time', tomorrowEnd.toISOString())

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError)
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      )
    }

    if (!appointments || appointments.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No appointments scheduled for tomorrow',
        count: 0
      })
    }

    const emailResults = []

    // Send reminder email for each appointment
    for (const appointment of appointments) {
      try {
        const session = (appointment as any).session
        if (!session) continue

        // Get user details
        const { data: user, error: userError } = await supabaseAdmin
          .from('users')
          .select('name, email')
          .eq('id', session.user_id)
          .single()

        if (userError || !user) {
          console.error(`Error fetching user for session ${session.id}:`, userError)
          continue
        }

        // Get questionnaire details
        const { data: questionnaire, error: questionnaireError } = await supabaseAdmin
          .from('questionnaires')
          .select('interviewee_name')
          .eq('session_id', session.id)
          .single()

        if (questionnaireError || !questionnaire) {
          console.error(`Error fetching questionnaire for session ${session.id}:`, questionnaireError)
          continue
        }

        // Format the scheduled time
        const scheduledTime = new Date((appointment as any).start_time).toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZone: 'America/New_York'
        }) + ' EST'

        // Generate manage booking URL
        const manageBookingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/booking/manage/${(appointment as any).booking_token}`

        // Send reminder email
        const emailHtml = getInterviewReminderEmail(
          (user as any).name,
          (questionnaire as any).interviewee_name,
          scheduledTime,
          manageBookingUrl
        )

        const result = await sendEmail({
          to: (user as any).email,
          subject: 'Reminder: Your Dearly Interview is Tomorrow',
          html: emailHtml
        })

        emailResults.push({
          appointmentId: (appointment as any).id,
          userEmail: (user as any).email,
          success: result.success,
          error: result.error || null
        })

        if (result.success) {
          console.log(`Reminder email sent to ${(user as any).email} for appointment ${(appointment as any).id}`)
        } else {
          console.error(`Failed to send reminder email to ${(user as any).email}:`, result.error)
        }
      } catch (error) {
        console.error('Error processing appointment:', error)
        emailResults.push({
          appointmentId: (appointment as any).id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const successCount = emailResults.filter(r => r.success).length
    const failureCount = emailResults.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      message: `Processed ${appointments.length} appointments`,
      stats: {
        total: appointments.length,
        emailsSent: successCount,
        emailsFailed: failureCount
      },
      details: emailResults
    })
  } catch (error) {
    console.error('Error in send-reminders cron job:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
