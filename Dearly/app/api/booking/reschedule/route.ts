import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseAdmin
    const body = await request.json()
    const { booking_token, new_slot_id } = body

    if (!booking_token || !new_slot_id) {
      return NextResponse.json(
        { error: 'booking_token and new_slot_id are required' },
        { status: 400 }
      )
    }

    // Get the current appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*, sessions!appointments_session_id_fkey(*), users(*)')
      .eq('booking_token', booking_token)
      .single()

    if (appointmentError || !appointment) {
      console.error('Error fetching appointment:', appointmentError)
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Check if appointment is active
    if ((appointment as any).status !== 'scheduled') {
      return NextResponse.json(
        { error: 'Only scheduled appointments can be rescheduled' },
        { status: 400 }
      )
    }

    // Get the new availability slot
    const { data: newSlot, error: newSlotError } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('id', new_slot_id)
      .single()

    if (newSlotError || !newSlot) {
      console.error('Error fetching new slot:', newSlotError)
      return NextResponse.json(
        { error: 'New availability slot not found' },
        { status: 404 }
      )
    }

    // Check if new slot is available
    if ((newSlot as any).is_booked) {
      return NextResponse.json(
        { error: 'The selected time slot is no longer available' },
        { status: 409 }
      )
    }

    // Check if new slot is in the future
    if (new Date((newSlot as any).start_time) < new Date()) {
      return NextResponse.json(
        { error: 'Cannot reschedule to a time in the past' },
        { status: 400 }
      )
    }

    // Free up the old slot
    if ((appointment as any).availability_slot_id) {
      const { error: freeOldSlotError } = await (supabase as any)
        .from('availability_slots')
        .update({ is_booked: false })
        .eq('id', (appointment as any).availability_slot_id)

      if (freeOldSlotError) {
        console.error('Error freeing old slot:', freeOldSlotError)
        // Continue anyway - admin can fix manually
      }
    }

    // Book the new slot
    const { error: bookNewSlotError } = await (supabase as any)
      .from('availability_slots')
      .update({ is_booked: true })
      .eq('id', (newSlot as any).id)

    if (bookNewSlotError) {
      console.error('Error booking new slot:', bookNewSlotError)
      return NextResponse.json(
        { error: 'Failed to book new time slot' },
        { status: 500 }
      )
    }

    // Update the appointment with new times
    const { error: updateAppointmentError } = await (supabase as any)
      .from('appointments')
      .update({
        availability_slot_id: (newSlot as any).id,
        start_time: (newSlot as any).start_time,
        end_time: (newSlot as any).end_time
      })
      .eq('id', (appointment as any).id)

    if (updateAppointmentError) {
      console.error('Error updating appointment:', updateAppointmentError)
      // Try to rollback the slot booking
      await (supabase as any)
        .from('availability_slots')
        .update({ is_booked: false })
        .eq('id', (newSlot as any).id)
      return NextResponse.json(
        { error: 'Failed to reschedule appointment' },
        { status: 500 }
      )
    }

    // Update the session with new appointment times
    const { error: updateSessionError } = await (supabase as any)
      .from('sessions')
      .update({
        appointment_start_time: (newSlot as any).start_time,
        appointment_end_time: (newSlot as any).end_time
      })
      .eq('id', (appointment as any).session_id)

    if (updateSessionError) {
      console.error('Error updating session:', updateSessionError)
    }

    // Send reschedule confirmation email
    if ((appointment as any).users) {
      const rescheduleEmail = `
        <h1>Appointment Rescheduled</h1>
        <p>Hi ${(appointment as any).users.name},</p>
        <p>Your interview has been successfully rescheduled!</p>
        <p><strong>New Date & Time:</strong><br/>
        ${new Date((newSlot as any).start_time).toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZone: 'America/New_York'
        })} EST</p>
        <p><strong>Previous Date & Time:</strong><br/>
        ${new Date((appointment as any).start_time).toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZone: 'America/New_York'
        })} EST</p>
        <p>You will receive a calendar invite and meeting link closer to your scheduled time.</p>
        <p>Need to make another change? Use this link:<br/>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/booking/manage/${booking_token}">Manage Your Booking</a></p>
        <p>Best,<br/>The Dearly Team</p>
      `

      await sendEmail({
        to: (appointment as any).users.email,
        subject: 'Appointment Rescheduled',
        html: rescheduleEmail
      })
    }

    // Notify internal team
    await sendEmail({
      to: process.env.INTERNAL_TEAM_EMAIL || 'team@example.com',
      subject: `Appointment Rescheduled: ${(appointment as any).users?.name || 'Unknown'}`,
      html: `<p>The following appointment has been rescheduled:</p>
       <p><strong>Customer:</strong> ${(appointment as any).users?.name || 'Unknown'} (${(appointment as any).users?.email || 'Unknown'})</p>
       <p><strong>Old Time:</strong> ${new Date((appointment as any).start_time).toLocaleString()}</p>
       <p><strong>New Time:</strong> ${new Date((newSlot as any).start_time).toLocaleString()}</p>`
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error in reschedule booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
