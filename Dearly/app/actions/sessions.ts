'use server'

import { supabaseAdmin } from '@/lib/supabase/server'
import { sendEmail, getRecordingDeliveryEmail } from '@/lib/resend'
import { revalidatePath } from 'next/cache'

export async function updateSessionStatus(sessionId: string, status: 'paid' | 'scheduled' | 'completed' | 'delivered') {
  try {
    const { error } = await (supabaseAdmin
      .from('sessions')
      .update as any)({ status })
      .eq('id', sessionId)

    if (error) throw error

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Error updating session status:', error)
    return { success: false, error: 'Failed to update session status' }
  }
}

export async function uploadRecording(sessionId: string, recordingUrl: string) {
  try {
    // Update session with recording URL and mark as completed
    const { data: session, error: updateError } = await (supabaseAdmin
      .from('sessions')
      .update as any)({ 
        recording_url: recordingUrl,
        status: 'completed'
      })
      .eq('id', sessionId)
      .select('user_id')
      .single()

    if (updateError) throw updateError

    // Get user details
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('name, email')
      .eq('id', (session as any).user_id)
      .single()

    if (userError) throw userError

    // Send delivery email
    await sendEmail({
      to: (user as any).email,
      subject: 'Your Dearly recording is ready!',
      html: getRecordingDeliveryEmail((user as any).name, recordingUrl),
    })

    // Update status to delivered
    await (supabaseAdmin
      .from('sessions')
      .update as any)({ status: 'delivered' })
      .eq('id', sessionId)

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Error uploading recording:', error)
    return { success: false, error: 'Failed to upload recording' }
  }
}

export async function getSessions(statusFilter?: string) {
  try {
    let query = supabaseAdmin
      .from('sessions')
      .select(`
        *,
        users (
          id,
          name,
          email
        ),
        questionnaires (
          interviewee_name,
          length_minutes,
          medium
        )
      `)
      .order('created_at', { ascending: false })

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return { success: false, error: 'Failed to fetch sessions', data: [] }
  }
}

export async function getSessionDetails(sessionId: string) {
  try {
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select(`
        *,
        users (
          id,
          name,
          email,
          stripe_customer_id
        )
      `)
      .eq('id', sessionId)
      .single()

    if (sessionError) throw sessionError

    const { data: questionnaire, error: questionnaireError } = await supabaseAdmin
      .from('questionnaires')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (questionnaireError) throw questionnaireError

    return { 
      success: true, 
      data: {
        session,
        questionnaire
      }
    }
  } catch (error) {
    console.error('Error fetching session details:', error)
    return { success: false, error: 'Failed to fetch session details' }
  }
}

