import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseAdmin
    const body = await request.json()
    const { booking_token } = body

    if (!booking_token) {
      return NextResponse.json(
        { error: 'booking_token is required' },
        { status: 400 }
      )
    }

    // Get the appointment by booking token
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*, sessions!appointments_session_id_fkey(*), users!appointments_user_id_fkey(*)')
      .eq('booking_token', booking_token)
      .single()

    if (appointmentError || !appointment) {
      console.error('Error fetching appointment:', appointmentError)
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Check if appointment is already cancelled
    if ((appointment as any).status === 'cancelled') {
      return NextResponse.json(
        { error: 'Appointment is already cancelled' },
        { status: 400 }
      )
    }

    // Check if appointment is in the past
    if (new Date((appointment as any).start_time) < new Date()) {
      return NextResponse.json(
        { error: 'Cannot cancel a past appointment' },
        { status: 400 }
      )
    }

    // Update appointment status to cancelled
    const { error: updateAppointmentError } = await (supabase as any)
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', (appointment as any).id)

    if (updateAppointmentError) {
      console.error('Error updating appointment:', updateAppointmentError)
      return NextResponse.json(
        { error: 'Failed to cancel appointment' },
        { status: 500 }
      )
    }

    // Free up the availability slot
    if ((appointment as any).availability_slot_id) {
      const { error: updateSlotError } = await (supabase as any)
        .from('availability_slots')
        .update({ is_booked: false })
        .eq('id', (appointment as any).availability_slot_id)

      if (updateSlotError) {
        console.error('Error updating slot:', updateSlotError)
        // Continue even if slot update fails - admin can fix manually
      }
    }

    // Update session status back to paid
    const { error: updateSessionError } = await (supabase as any)
      .from('sessions')
      .update({
        status: 'paid',
        appointment_id: null,
        appointment_start_time: null,
        appointment_end_time: null
      })
      .eq('id', (appointment as any).session_id)

    if (updateSessionError) {
      console.error('Error updating session:', updateSessionError)
    }

    // Send cancellation confirmation email
    if ((appointment as any).users) {
      const cancelledTime = new Date((appointment as any).start_time).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: (appointment as any).timezone || 'America/New_York'
      })

      const cancellationEmail = `
        <h1>Appointment Cancelled</h1>
        <p>Hi ${(appointment as any).users.name},</p>
        <p>Your interview scheduled for ${cancelledTime} has been cancelled.</p>
        <p>You can book a new time anytime by visiting your booking page:</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/booking/${(appointment as any).session_id}">Book a New Time</a></p>
        <p>If you have any questions, please don't hesitate to reach out.</p>
        <p>Best,<br/>The Dearly Team</p>
      `

      await sendEmail({
        to: (appointment as any).users.email,
        subject: 'Appointment Cancelled',
        html: cancellationEmail
      })
    }

    // Notify internal team
    await sendEmail({
      to: process.env.INTERNAL_TEAM_EMAIL || 'team@example.com',
      subject: `Appointment Cancelled: ${(appointment as any).users?.name || 'Unknown'}`,
      html: `<p>The following appointment has been cancelled:</p>
       <p><strong>Customer:</strong> ${(appointment as any).users?.name || 'Unknown'} (${(appointment as any).users?.email || 'Unknown'})</p>
       <p><strong>Original Time:</strong> ${new Date((appointment as any).start_time).toLocaleString()}</p>`
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error in cancel booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
