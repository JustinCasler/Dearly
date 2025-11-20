import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseAdmin
    const searchParams = request.nextUrl.searchParams
    const booking_token = searchParams.get('token')

    if (!booking_token) {
      return NextResponse.json(
        { error: 'booking_token is required' },
        { status: 400 }
      )
    }

    // Get the appointment by booking token
    console.log('Looking for booking with token:', booking_token)

    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *,
        sessions!appointments_session_id_fkey(*),
        users!appointments_user_id_fkey(*),
        availability_slots(*)
      `)
      .eq('booking_token', booking_token)
      .single()

    console.log('Appointment query result:', { appointment, error: appointmentError })

    if (appointmentError || !appointment) {
      console.error('Error fetching appointment:', {
        error: appointmentError,
        token: booking_token,
        errorCode: appointmentError?.code,
        errorMessage: appointmentError?.message,
        errorDetails: appointmentError?.details
      })
      return NextResponse.json(
        {
          error: 'Appointment not found',
          debug: process.env.NODE_ENV === 'development' ? {
            errorCode: appointmentError?.code,
            errorMessage: appointmentError?.message
          } : undefined
        },
        { status: 404 }
      )
    }

    return NextResponse.json({ appointment })
  } catch (error) {
    console.error('Unexpected error in get booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
