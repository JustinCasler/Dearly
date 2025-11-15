import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function DELETE(request: NextRequest) {
  try {
    // Create a Supabase client with cookies to check auth
    const cookieStore = await cookies()
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {},
        },
      }
    )

    // Check authentication and admin status
    const { data: { user } } = await supabaseAuth.auth.getUser()

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

    const searchParams = request.nextUrl.searchParams
    const slotId = searchParams.get('id')

    if (!slotId) {
      return NextResponse.json(
        { error: 'Slot ID is required' },
        { status: 400 }
      )
    }

    // Check if slot is booked using admin client
    const { data: slot, error: fetchError } = await supabaseAdmin
      .from('availability_slots')
      .select('is_booked')
      .eq('id', slotId)
      .single()

    if (fetchError) {
      console.error('Error fetching slot:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch slot' },
        { status: 500 }
      )
    }

    if (!slot) {
      return NextResponse.json(
        { error: 'Slot not found' },
        { status: 404 }
      )
    }

    if ((slot as any).is_booked) {
      return NextResponse.json(
        { error: 'Cannot delete a booked slot' },
        { status: 400 }
      )
    }

    // Delete the slot using admin client
    const { error: deleteError } = await supabaseAdmin
      .from('availability_slots')
      .delete()
      .eq('id', slotId)

    if (deleteError) {
      console.error('Error deleting slot:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete slot' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error in delete availability:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
