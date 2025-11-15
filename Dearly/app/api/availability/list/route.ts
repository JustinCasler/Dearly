import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseAdmin
    const searchParams = request.nextUrl.searchParams

    // Optional filters
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const onlyAvailable = searchParams.get('onlyAvailable') === 'true'

    let query = supabase
      .from('availability_slots')
      .select('*')
      .order('start_time', { ascending: true })

    // Filter by date range if provided
    if (startDate) {
      query = query.gte('start_time', startDate)
    }
    if (endDate) {
      query = query.lte('end_time', endDate)
    }

    // Filter only available slots (not booked)
    if (onlyAvailable) {
      query = query.eq('is_booked', false)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching availability slots:', error)
      return NextResponse.json(
        { error: 'Failed to fetch availability slots' },
        { status: 500 }
      )
    }

    return NextResponse.json({ slots: data })
  } catch (error) {
    console.error('Unexpected error in availability list:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
