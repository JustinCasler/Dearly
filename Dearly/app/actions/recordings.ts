'use server'

import { supabaseAdmin, createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import { sendEmail, getRecordingDeliveryEmail } from '@/lib/resend'

export async function uploadAudioFile(
  sessionId: string,
  formData: FormData
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    const supabase = await createServerClient()

    // Verify user is admin or interviewer
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || !['admin', 'interviewer'].includes((userData as any).role)) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get file from form data
    const file = formData.get('audio') as File
    if (!file) {
      return { success: false, error: 'No file provided' }
    }

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      return { success: false, error: 'Invalid file type. Please upload an audio file.' }
    }

    // Validate file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      return { success: false, error: 'File too large. Maximum size is 500MB.' }
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'mp3'
    const filename = `${sessionId}-${Date.now()}.${ext}`
    const filePath = `recordings/${filename}`

    // Convert file to ArrayBuffer for Supabase upload
    const arrayBuffer = await file.arrayBuffer()

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('recordings')
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { success: false, error: 'Failed to upload file' }
    }

    // Update session with audio path
    const { error: updateError } = await (supabaseAdmin as any)
      .from('sessions')
      .update({
        audio_storage_path: filePath,
        processing_status: 'uploading'
      })
      .eq('id', sessionId)

    if (updateError) {
      console.error('Session update error:', updateError)
      return { success: false, error: 'Failed to update session' }
    }

    return { success: true, path: filePath }
  } catch (error) {
    console.error('Upload error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function uploadTranscriptFile(
  sessionId: string,
  formData: FormData
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    const supabase = await createServerClient()

    // Verify user is admin or interviewer
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || !['admin', 'interviewer'].includes((userData as any).role)) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get file from form data
    const file = formData.get('transcript') as File
    if (!file) {
      return { success: false, error: 'No file provided' }
    }

    // Validate file type
    if (!file.type.includes('text') && !file.name.endsWith('.txt') && !file.name.endsWith('.vtt') && !file.name.endsWith('.srt')) {
      return { success: false, error: 'Invalid file type. Please upload a text file.' }
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'File too large. Maximum size is 10MB.' }
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'txt'
    const filename = `${sessionId}-${Date.now()}.${ext}`
    const filePath = `transcripts/${filename}`

    // Convert file to ArrayBuffer for Supabase upload
    const arrayBuffer = await file.arrayBuffer()

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('transcripts')
      .upload(filePath, arrayBuffer, {
        contentType: file.type || 'text/plain',
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { success: false, error: 'Failed to upload file' }
    }

    // Update session with transcript path
    const { error: updateError } = await (supabaseAdmin as any)
      .from('sessions')
      .update({
        transcript_storage_path: filePath
      })
      .eq('id', sessionId)

    if (updateError) {
      console.error('Session update error:', updateError)
      return { success: false, error: 'Failed to update session' }
    }

    // Create transcript record with pending status
    const { error: transcriptError } = await (supabaseAdmin as any)
      .from('transcripts')
      .insert({
        session_id: sessionId,
        storage_path: filePath,
        processing_status: 'pending'
      })

    if (transcriptError) {
      console.error('Transcript record error:', transcriptError)
      return { success: false, error: 'Failed to create transcript record' }
    }

    return { success: true, path: filePath }
  } catch (error) {
    console.error('Upload error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function processRecording(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update session status to processing
    const { error: updateError } = await (supabaseAdmin as any)
      .from('sessions')
      .update({ processing_status: 'processing' })
      .eq('id', sessionId)

    if (updateError) {
      console.error('Status update error:', updateError)
      return { success: false, error: 'Failed to update processing status' }
    }

    // Trigger AI processing via API route
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/recordings/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Processing API error:', error)

      // Mark as failed
      await (supabaseAdmin as any)
        .from('sessions')
        .update({ processing_status: 'failed' })
        .eq('id', sessionId)

      return { success: false, error: 'Failed to start processing' }
    }

    return { success: true }
  } catch (error) {
    console.error('Processing error:', error)

    // Mark as failed
    await (supabaseAdmin as any)
      .from('sessions')
      .update({ processing_status: 'failed' })
      .eq('id', sessionId)

    return { success: false, error: 'Processing error occurred' }
  }
}

export async function generateListeningToken(
  sessionId: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex')

    const { error } = await (supabaseAdmin as any)
      .from('listening_tokens')
      .insert({
        session_id: sessionId,
        token
      })

    if (error) {
      console.error('Token creation error:', error)
      return { success: false, error: 'Failed to create listening link' }
    }

    return { success: true, token }
  } catch (error) {
    console.error('Token generation error:', error)
    return { success: false, error: 'Token generation failed' }
  }
}

export async function deliverRecording(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify processing is complete
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select('*, users(name, email)')
      .eq('id', sessionId)
      .eq('processing_status', 'ready')
      .single()

    if (sessionError || !session) {
      return { success: false, error: 'Session not ready for delivery. Please ensure processing is complete.' }
    }

    // Check if token already exists
    const { data: existingToken } = await (supabaseAdmin as any)
      .from('listening_tokens')
      .select('token')
      .eq('session_id', sessionId)
      .single()

    let token: string

    if (existingToken) {
      token = (existingToken as any).token
    } else {
      // Generate listening token
      const tokenResult = await generateListeningToken(sessionId)

      if (!tokenResult.success || !tokenResult.token) {
        return { success: false, error: tokenResult.error || 'Failed to generate listening link' }
      }

      token = tokenResult.token
    }

    // Send email with listening link
    const user = (session as any).users
    await sendEmail({
      to: user.email,
      subject: 'Your Dearly recording is ready!',
      html: getRecordingDeliveryEmail(user.name, token),
    })

    // Update session status to delivered
    await (supabaseAdmin as any)
      .from('sessions')
      .update({ status: 'delivered' })
      .eq('id', sessionId)

    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/sessions/${sessionId}`)

    return { success: true }
  } catch (error) {
    console.error('Delivery error:', error)
    return { success: false, error: 'Failed to deliver recording' }
  }
}
