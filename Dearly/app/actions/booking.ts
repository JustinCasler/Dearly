'use server'

import { supabaseAdmin } from '@/lib/supabase/server'

export async function getSessionForBooking(sessionId: string) {
  try {
    const { data: session, error } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (error) {
      console.error('Error fetching session for booking:', error)
      return { success: false, error: error.message }
    }

    if (!session) {
      return { success: false, error: 'Session not found' }
    }

    return { success: true, data: session }
  } catch (error: any) {
    console.error('Unexpected error fetching session:', error)
    return { success: false, error: error.message || 'Failed to fetch session' }
  }
}

export async function getAvailableSlots(startDate?: string) {
  try {
    let query = supabaseAdmin
      .from('availability_slots')
      .select('*')
      .eq('is_booked', false)
      .order('start_time', { ascending: true })

    if (startDate) {
      query = query.gte('start_time', startDate)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching availability slots:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error: any) {
    console.error('Unexpected error fetching slots:', error)
    return { success: false, error: error.message || 'Failed to fetch slots' }
  }
}
