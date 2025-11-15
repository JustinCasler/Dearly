import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    console.log('Create availability: Starting...')

    // Create a Supabase client with cookies to check auth
    const cookieStore = await cookies()
    console.log('Create availability: Got cookie store')

    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            // No-op for route handlers
          },
        },
      }
    )
    console.log('Create availability: Created auth client')

    // Check authentication and admin status
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()
    console.log('Create availability: Got user', { hasUser: !!user, error: authError?.message })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin/interviewer using admin client
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || ((profile as any).role !== 'admin' && (profile as any).role !== 'interviewer')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { start_time, end_time } = body

    // Validate input
    if (!start_time || !end_time) {
      return NextResponse.json(
        { error: 'start_time and end_time are required' },
        { status: 400 }
      )
    }

    // Validate that start_time is before end_time
    const startDate = new Date(start_time)
    const endDate = new Date(end_time)

    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'start_time must be before end_time' },
        { status: 400 }
      )
    }

    // Generate 1-hour slots between start and end time
    const hourlySlots = []
    let currentSlotStart = new Date(startDate)

    // Round down to the nearest hour
    currentSlotStart.setMinutes(0, 0, 0)

    // If start time has minutes, move to next hour
    if (startDate.getMinutes() > 0) {
      currentSlotStart.setHours(currentSlotStart.getHours() + 1)
    }

    while (currentSlotStart < endDate) {
      const currentSlotEnd = new Date(currentSlotStart)
      currentSlotEnd.setHours(currentSlotEnd.getHours() + 1)

      // Only add slot if it ends at or before the requested end time
      if (currentSlotEnd <= endDate) {
        hourlySlots.push({
          start_time: currentSlotStart.toISOString(),
          end_time: currentSlotEnd.toISOString(),
          is_booked: false,
          created_by: user.id
        })
      }

      currentSlotStart = currentSlotEnd
    }

    if (hourlySlots.length === 0) {
      return NextResponse.json(
        { error: 'Time range must be at least 1 hour to create slots' },
        { status: 400 }
      )
    }

    // Check for overlapping slots for each hourly slot
    for (const slot of hourlySlots) {
      const { data: overlappingSlots } = await supabaseAdmin
        .from('availability_slots')
        .select('*')
        .or(`and(start_time.lte.${slot.start_time},end_time.gt.${slot.start_time}),and(start_time.lt.${slot.end_time},end_time.gte.${slot.end_time}),and(start_time.gte.${slot.start_time},end_time.lte.${slot.end_time})`)

      if (overlappingSlots && overlappingSlots.length > 0) {
        return NextResponse.json(
          { error: `Time slot ${new Date(slot.start_time).toLocaleTimeString()} - ${new Date(slot.end_time).toLocaleTimeString()} overlaps with an existing slot` },
          { status: 409 }
        )
      }
    }

    // Create all hourly slots using admin client
    const { data: newSlots, error: insertError } = await supabaseAdmin
      .from('availability_slots')
      .insert(hourlySlots as any)
      .select()

    if (insertError) {
      console.error('Error creating availability slots:', insertError)
      return NextResponse.json(
        { error: 'Failed to create availability slots' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      slots: newSlots,
      count: newSlots?.length || 0,
      message: `Created ${newSlots?.length || 0} hourly time slot(s)`
    }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in create availability:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
