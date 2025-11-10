import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { sendEmail, getBookingConfirmationEmail } from '@/lib/resend'
import crypto from 'crypto'

// Verify Calendly webhook signature
function verifyCalendlySignature(
  payload: string,
  signature: string,
  signingKey: string
): boolean {
  const hmac = crypto.createHmac('sha256', signingKey)
  hmac.update(payload)
  const expectedSignature = hmac.digest('hex')
  return signature === expectedSignature
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('calendly-webhook-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  // Verify webhook signature
  const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY!
  if (!verifyCalendlySignature(body, signature, signingKey)) {
    console.error('Invalid Calendly webhook signature')
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    )
  }

  const event = JSON.parse(body)

  try {
    switch (event.event) {
      case 'invitee.created': {
        const invitee = event.payload
        const eventUri = invitee.event
        const inviteeEmail = invitee.email
        const inviteeName = invitee.name
        const scheduledTime = invitee.scheduled_event.start_time

        // Find the session by user email
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', inviteeEmail)
          .single()

        if (!user) {
          console.error('User not found for email:', inviteeEmail)
          break
        }

        // Update session with Calendly event details
        const { data: session } = await supabaseAdmin
          .from('sessions')
          .select('id')
          .eq('user_id', (user as any).id)
          .eq('status', 'paid')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (session) {
          await (supabaseAdmin
            .from('sessions')
            .update as any)({
              calendly_event_id: eventUri,
              status: 'scheduled',
            })
            .eq('id', (session as any).id)

          // Get questionnaire for email
          const { data: questionnaire } = await supabaseAdmin
            .from('questionnaires')
            .select('*')
            .eq('session_id', (session as any).id)
            .single()

          // Send confirmation email to internal team
          if (questionnaire) {
            await sendEmail({
              to: process.env.INTERNAL_TEAM_EMAIL!,
              subject: `New Interview Scheduled - ${inviteeName}`,
              html: getBookingConfirmationEmail(
                'Team',
                inviteeName,
                (questionnaire as any).interviewee_name,
                new Date(scheduledTime).toLocaleString(),
                questionnaire
              ),
            })
          }
        }
        break
      }

      case 'invitee.canceled': {
        const invitee = event.payload
        const eventUri = invitee.event

        // Update session status back to paid
        await (supabaseAdmin
          .from('sessions')
          .update as any)({ status: 'paid', calendly_event_id: null })
          .eq('calendly_event_id', eventUri)

        break
      }

      default:
        // Unhandled Calendly event
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing Calendly webhook:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

