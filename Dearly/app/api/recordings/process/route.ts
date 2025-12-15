import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  // Lazy instantiate OpenAI client to avoid build-time errors
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!
  })
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Get session with questionnaire
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select(`
        id,
        questionnaires (
          id,
          questions
        )
      `)
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      console.error('Session error:', sessionError)
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get transcript record
    const { data: transcriptRecord, error: transcriptError } = await (supabaseAdmin as any)
      .from('transcripts')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (transcriptError || !transcriptRecord) {
      console.error('Transcript error:', transcriptError)
      return NextResponse.json({ error: 'Transcript not found' }, { status: 404 })
    }

    // Download transcript file from storage
    const { data: transcriptData, error: downloadError } = await supabaseAdmin.storage
      .from('transcripts')
      .download((transcriptRecord as any).storage_path)

    if (downloadError || !transcriptData) {
      console.error('Download error:', downloadError)

      await (supabaseAdmin as any)
        .from('transcripts')
        .update({
          processing_status: 'failed',
          error_message: 'Failed to download transcript file'
        })
        .eq('id', transcriptRecord.id)

      return NextResponse.json({ error: 'Transcript file not found' }, { status: 404 })
    }

    // Convert blob to text
    const transcriptText = await transcriptData.text()

    // @ts-ignore - questionnaires is included in the select
    const questionnaire = session.questionnaires[0]
    if (!questionnaire || !questionnaire.questions) {
      return NextResponse.json({ error: 'Questionnaire not found' }, { status: 404 })
    }

    const questions = questionnaire.questions as Array<{ id: string; text: string }>

    // Update transcript status to processing
    await (supabaseAdmin as any)
      .from('transcripts')
      .update({ processing_status: 'processing' })
      .eq('id', (transcriptRecord as any).id)

    // Use OpenAI to analyze transcript and detect timestamps
    console.log('Analyzing transcript with OpenAI...')

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a transcript analyzer for interview recordings. You will be given a transcript and a list of questions.
Your task is to identify which parts of the transcript correspond to which questions, estimate timestamps, and extract the relevant text segments.

Return your analysis as a JSON object with a "segments" array. Each segment should have:
- question_id: the ID of the question being answered
- start_time: estimated start time in seconds (decimal format, e.g., 0, 125.5, 347.25)
- end_time: estimated end time in seconds
- text: the exact transcript text for this segment (can be multiple sentences/paragraphs)
- sequence_order: the order this appears in the interview (0-indexed)

Guidelines:
- Estimate timestamps based on the transcript length and typical speech patterns (about 150 words per minute)
- Each question's answer should be a continuous segment
- Segments should not overlap
- If a question isn't clearly answered in the transcript, skip it
- Text should be the actual transcript content, not a summary`
        },
        {
          role: 'user',
          content: `Transcript (approximately ${transcriptText.length} characters):

${transcriptText}

Questions to identify:
${questions.map((q, i) => `${i + 1}. [ID: ${q.id}] ${q.text}`).join('\n')}

Analyze this transcript and return a JSON object with the "segments" array as described.`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    })

    const analysisText = completion.choices[0].message.content
    if (!analysisText) {
      throw new Error('No response from OpenAI')
    }

    const analysis = JSON.parse(analysisText)
    console.log('Analysis complete:', analysis)

    if (!analysis.segments || !Array.isArray(analysis.segments)) {
      throw new Error('Invalid analysis format from OpenAI')
    }

    // Update transcript status to completed
    await (supabaseAdmin as any)
      .from('transcripts')
      .update({ processing_status: 'completed' })
      .eq('id', (transcriptRecord as any).id)

    // Insert transcript segments
    if (analysis.segments.length > 0) {
      const segments = analysis.segments.map((seg: any) => ({
        transcript_id: (transcriptRecord as any).id,
        question_id: seg.question_id,
        start_time: parseFloat(seg.start_time) || 0,
        end_time: parseFloat(seg.end_time) || 0,
        text: seg.text || '',
        sequence_order: typeof seg.sequence_order === 'number' ? seg.sequence_order : 0
      }))

      const { error: segmentsError } = await (supabaseAdmin as any)
        .from('transcript_segments')
        .insert(segments)

      if (segmentsError) {
        console.error('Segments insert error:', segmentsError)
        throw new Error('Failed to insert transcript segments')
      }
    }

    // Update session status to ready
    await (supabaseAdmin as any)
      .from('sessions')
      .update({ processing_status: 'ready' })
      .eq('id', sessionId)

    return NextResponse.json({
      success: true,
      segmentsCount: analysis.segments.length
    })

  } catch (error) {
    console.error('Processing error:', error)

    // Mark as failed
    try {
      const { sessionId } = await request.json()

      await (supabaseAdmin as any)
        .from('sessions')
        .update({ processing_status: 'failed' })
        .eq('id', sessionId)

      await (supabaseAdmin as any)
        .from('transcripts')
        .update({
          processing_status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('session_id', sessionId)
    } catch (updateError) {
      console.error('Failed to update error status:', updateError)
    }

    return NextResponse.json(
      {
        error: 'Processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
