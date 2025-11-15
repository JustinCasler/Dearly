'use server'

import { supabaseAdmin, createServerClient } from '@/lib/supabase/server'
import { sendEmail, getRecordingDeliveryEmail } from '@/lib/resend'
import { revalidatePath } from 'next/cache'
import { Session, User } from '@/types/database'

export type SessionWithDetails = Session & {
  user: User
  questionnaire: {
    interviewee_name: string
    relationship_to_interviewee: string
    length_minutes: number
    medium: string
  } | null
  interviewer: User | null
}

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
    return { success: false, error: 'Failed to fetch session details' }
  }
}

/**
 * Get all unassigned sessions (status='paid' and no interviewer)
 * Available for interviewers to claim
 */
export async function getUnassignedSessions(): Promise<SessionWithDetails[]> {
  // Use admin client to bypass RLS for fetching unassigned sessions
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select(`
      *,
      user:users!sessions_user_id_fkey(id, name, email, role),
      questionnaire:questionnaires(interviewee_name, relationship_to_interviewee, length_minutes, medium),
      interviewer:users!sessions_interviewer_id_fkey(id, name, email, role)
    `)
    .eq('status', 'paid')
    .is('interviewer_id', null)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error('Failed to fetch unassigned sessions')
  }

  return data.map((session: any) => ({
    ...session,
    user: Array.isArray(session.user) ? session.user[0] : session.user,
    questionnaire: Array.isArray(session.questionnaire)
      ? session.questionnaire[0]
      : session.questionnaire,
    interviewer: Array.isArray(session.interviewer)
      ? session.interviewer[0]
      : session.interviewer,
  }))
}

/**
 * Get sessions assigned to a specific interviewer
 */
export async function getAssignedSessions(interviewerId: string): Promise<SessionWithDetails[]> {
  // Use admin client to bypass RLS for fetching assigned sessions
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select(`
      *,
      user:users!sessions_user_id_fkey(id, name, email, role),
      questionnaire:questionnaires(interviewee_name, relationship_to_interviewee, length_minutes, medium),
      interviewer:users!sessions_interviewer_id_fkey(id, name, email, role)
    `)
    .eq('interviewer_id', interviewerId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch assigned sessions')
  }

  return data.map((session: any) => ({
    ...session,
    user: Array.isArray(session.user) ? session.user[0] : session.user,
    questionnaire: Array.isArray(session.questionnaire)
      ? session.questionnaire[0]
      : session.questionnaire,
    interviewer: Array.isArray(session.interviewer)
      ? session.interviewer[0]
      : session.interviewer,
  }))
}

/**
 * Get all sessions with interviewer info (admin view)
 */
export async function getAllSessionsWithInterviewers(): Promise<SessionWithDetails[]> {
  // Use admin client to bypass RLS for fetching all sessions
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select(`
      *,
      user:users!sessions_user_id_fkey(id, name, email, role),
      questionnaire:questionnaires(interviewee_name, relationship_to_interviewee, length_minutes, medium),
      interviewer:users!sessions_interviewer_id_fkey(id, name, email, role)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getAllSessionsWithInterviewers] Error:', error)
    throw new Error(`Failed to fetch sessions: ${error.message}`)
  }

  console.log('[getAllSessionsWithInterviewers] Success, fetched', data?.length, 'sessions')

  return data.map((session: any) => ({
    ...session,
    user: Array.isArray(session.user) ? session.user[0] : session.user,
    questionnaire: Array.isArray(session.questionnaire)
      ? session.questionnaire[0]
      : session.questionnaire,
    interviewer: Array.isArray(session.interviewer)
      ? session.interviewer[0]
      : session.interviewer,
  }))
}

/**
 * Assign a session to the current user (interviewer self-assignment)
 */
export async function assignSessionToSelf(sessionId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Verify user is interviewer or admin
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single<{ role: 'customer' | 'interviewer' | 'admin' }>()

  if (userError || !userData) {
    return { success: false, error: 'User not found' }
  }

  if (userData.role !== 'interviewer' && userData.role !== 'admin') {
    return { success: false, error: 'Unauthorized: Only interviewers can claim sessions' }
  }

  // Attempt to assign session
  // Use a transaction-like approach: first check if unassigned, then update
  const { data: session, error: fetchError } = await supabase
    .from('sessions')
    .select('interviewer_id, status')
    .eq('id', sessionId)
    .single<{ interviewer_id: string | null; status: 'paid' | 'scheduled' | 'completed' | 'delivered' }>()

  if (fetchError || !session) {
    return { success: false, error: 'Session not found' }
  }

  if (session.interviewer_id !== null) {
    return { success: false, error: 'Session already assigned to another interviewer' }
  }

  if (session.status !== 'paid') {
    return { success: false, error: 'Session must be in paid status to be claimed' }
  }

  // Update session with interviewer
  const { error: updateError } = await (supabase
    .from('sessions')
    .update as any)({
      interviewer_id: user.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId)
    .is('interviewer_id', null) // Double-check to prevent race conditions

  if (updateError) {
    return { success: false, error: 'Failed to assign session. It may have been claimed by another interviewer.' }
  }

  // Revalidate relevant pages
  revalidatePath('/dashboard/interviewer')
  revalidatePath('/dashboard/interviewer/available')
  revalidatePath('/dashboard')

  return { success: true }
}

/**
 * Unassign a session (admin only)
 */
export async function unassignSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Verify user is admin
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single<{ role: 'customer' | 'interviewer' | 'admin' }>()

  if (userError || !userData) {
    return { success: false, error: 'User not found' }
  }

  if (userData.role !== 'admin') {
    return { success: false, error: 'Unauthorized: Only admins can unassign sessions' }
  }

  // Update session to remove interviewer
  const { error: updateError } = await (supabase
    .from('sessions')
    .update as any)({
      interviewer_id: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId)

  if (updateError) {
    return { success: false, error: 'Failed to unassign session' }
  }

  // Revalidate relevant pages
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/sessions/[id]', 'page')

  return { success: true }
}

/**
 * Get a single session with full details including interviewer
 */
export async function getSessionWithInterviewer(sessionId: string): Promise<SessionWithDetails | null> {
  // Use admin client to bypass RLS
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select(`
      *,
      user:users!sessions_user_id_fkey(id, name, email, role),
      questionnaire:questionnaires(interviewee_name, relationship_to_interviewee, length_minutes, medium),
      interviewer:users!sessions_interviewer_id_fkey(id, name, email, role)
    `)
    .eq('id', sessionId)
    .single()

  if (error || !data) {
    return null
  }

  const result: any = data

  return {
    ...(data as any),
    user: Array.isArray(result.user) ? result.user[0] : result.user,
    questionnaire: Array.isArray(result.questionnaire)
      ? result.questionnaire[0]
      : result.questionnaire,
    interviewer: Array.isArray(result.interviewer)
      ? result.interviewer[0]
      : result.interviewer,
  } as SessionWithDetails
}

