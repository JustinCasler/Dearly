import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/resend'
import { getBookingConfirmationEmail } from '@/lib/resend'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseAdmin
    const body = await request.json()
    const { session_id, slot_id } = body

    // Validate input
    if (!session_id || !slot_id) {
      return NextResponse.json(
        { error: 'session_id and slot_id are required' },
        { status: 400 }
      )
    }

    // Get the session to verify it's paid and belongs to a user
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, user_id, status, appointment_id')
      .eq('id', session_id)
      .single()

    if (sessionError || !session) {
      console.error('Error fetching session:', sessionError)
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Verify session is in paid status (not already scheduled)
    if ((session as any).status !== 'paid') {
      return NextResponse.json(
        { error: 'Session is not in paid status or already scheduled' },
        { status: 400 }
      )
    }

    // Check if session already has an appointment
    if ((session as any).appointment_id) {
      return NextResponse.json(
        { error: 'Session already has an appointment' },
        { status: 400 }
      )
    }

    // Get the availability slot
    const { data: slot, error: slotError } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('id', slot_id)
      .single()

    if (slotError || !slot) {
      console.error('Error fetching slot:', slotError)
      return NextResponse.json(
        { error: 'Availability slot not found' },
        { status: 404 }
      )
    }

    // Check if slot is already booked
    if ((slot as any).is_booked) {
      return NextResponse.json(
        { error: 'This time slot is no longer available' },
        { status: 409 }
      )
    }

    // Check if slot is in the past
    if (new Date((slot as any).start_time) < new Date()) {
      return NextResponse.json(
        { error: 'Cannot book a time slot in the past' },
        { status: 400 }
      )
    }

    // Generate unique booking token
    const booking_token = crypto.randomBytes(24).toString('base64url').substring(0, 32)

    // Create the appointment in a transaction
    const { data: appointment, error: appointmentError } = await (supabase as any)
      .from('appointments')
      .insert({
        session_id: (session as any).id,
        user_id: (session as any).user_id,
        availability_slot_id: (slot as any).id,
        start_time: (slot as any).start_time,
        end_time: (slot as any).end_time,
        status: 'scheduled',
        booking_token
      })
      .select()
      .single()

    if (appointmentError) {
      console.error('Error creating appointment:', appointmentError)
      return NextResponse.json(
        { error: 'Failed to create appointment' },
        { status: 500 }
      )
    }

    // Update the availability slot to mark it as booked
    const { error: updateSlotError } = await (supabase as any)
      .from('availability_slots')
      .update({ is_booked: true })
      .eq('id', (slot as any).id)

    if (updateSlotError) {
      console.error('Error updating slot:', updateSlotError)
      // Try to rollback appointment creation
      await (supabase as any).from('appointments').delete().eq('id', (appointment as any).id)
      return NextResponse.json(
        { error: 'Failed to update availability slot' },
        { status: 500 }
      )
    }

    // Update the session with appointment details
    const { error: updateSessionError } = await (supabase as any)
      .from('sessions')
      .update({
        appointment_id: (appointment as any).id,
        appointment_start_time: (slot as any).start_time,
        appointment_end_time: (slot as any).end_time,
        status: 'scheduled'
      })
      .eq('id', (session as any).id)

    if (updateSessionError) {
      console.error('Error updating session:', updateSessionError)
      // Note: We don't rollback here as the appointment is created
      // Admin can manually fix if needed
    }

    // Get user and questionnaire details for email
    const { data: user } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', (session as any).user_id)
      .single()

    const { data: questionnaire } = await supabase
      .from('questionnaires')
      .select('*')
      .eq('session_id', (session as any).id)
      .single()

    // Send confirmation email to customer
    if (user) {
      const customerEmail = `
        <h1>Your Dearly Interview is Scheduled!</h1>
        <p>Hi ${(user as any).name},</p>
        <p>Your interview has been successfully scheduled for:</p>
        <p><strong>${new Date((slot as any).start_time).toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZone: 'America/New_York'
        })} EST</strong></p>
        <p>You will receive a calendar invite and meeting link closer to your scheduled time.</p>
        <p>Need to reschedule? Use this link:<br/>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/booking/manage/${booking_token}">Manage Your Booking</a></p>
        <p>We're looking forward to creating a meaningful keepsake with you.</p>
        <p>Best,<br/>The Dearly Team</p>
      `

      await sendEmail({
        to: (user as any).email,
        subject: 'Your Dearly Interview is Scheduled',
        html: customerEmail
      })
    }

    // Send notification email to internal team
    if (user && questionnaire) {
      const teamEmailContent = getBookingConfirmationEmail(
        'Team',
        (user as any).name,
        (questionnaire as any).interviewee_name,
        new Date((slot as any).start_time).toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZone: 'America/New_York'
        }) + ' EST',
        questionnaire
      )

      await sendEmail({
        to: process.env.INTERNAL_TEAM_EMAIL || 'team@example.com',
        subject: `New Booking: ${(user as any).name} - ${new Date((slot as any).start_time).toLocaleDateString()}`,
        html: teamEmailContent
      })
    }

    return NextResponse.json({
      appointment,
      booking_token
    }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in create booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
