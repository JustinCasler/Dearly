import { supabaseAdmin } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AudioPlayer from '@/components/AudioPlayer'

interface ListenPageProps {
  params: {
    token: string
  }
}

export default async function ListenPage({ params }: ListenPageProps) {
  const { token } = params

  // Validate token and get session data
  const { data: tokenData, error: tokenError } = await supabaseAdmin
    .from('listening_tokens')
    .select(`
      session_id,
      view_count,
      sessions (
        id,
        audio_storage_path,
        questionnaires (
          interviewee_name,
          relationship_to_interviewee,
          questions
        ),
        transcripts (
          id,
          transcript_segments (
            id,
            question_id,
            start_time,
            end_time,
            text,
            sequence_order
          )
        )
      )
    `)
    .eq('token', token)
    .single()

  if (tokenError || !tokenData) {
    console.error('Token validation error:', tokenError)
    notFound()
  }

  // Increment view count
  await (supabaseAdmin as any)
    .from('listening_tokens')
    .update({ view_count: ((tokenData as any).view_count || 0) + 1 })
    .eq('token', token)

  // @ts-ignore - nested select types
  const session = tokenData.sessions
  if (!session || !session.audio_storage_path) {
    console.error('Session or audio not found')
    notFound()
  }

  // Get public URL for audio
  const { data: audioUrlData } = supabaseAdmin.storage
    .from('recordings')
    .getPublicUrl(session.audio_storage_path)

  if (!audioUrlData.publicUrl) {
    console.error('Failed to generate audio URL')
    notFound()
  }

  const questionnaire = session.questionnaires?.[0]
  if (!questionnaire) {
    console.error('Questionnaire not found')
    notFound()
  }

  const transcript = session.transcripts?.[0]
  const segments = transcript?.transcript_segments || []

  // Sort segments by sequence order
  const sortedSegments = segments.sort((a: any, b: any) => a.sequence_order - b.sequence_order)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f1ea' }}>
      {/* Header */}
      <header className="py-12 text-center shadow-sm" style={{ backgroundColor: '#0b4e9d' }}>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: 'inherit' }}>
          DEARLY
        </h1>
        <p className="text-white text-lg md:text-xl opacity-90 mt-2">
          {questionnaire.interviewee_name}'s Story
        </p>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <AudioPlayer
          audioUrl={audioUrlData.publicUrl}
          intervieweeName={questionnaire.interviewee_name}
          relationship={questionnaire.relationship_to_interviewee}
          questions={questionnaire.questions as Array<{ id: string; text: string }>}
          segments={sortedSegments}
        />
      </main>

      {/* Footer */}
      <footer className="py-12 text-center border-t" style={{ color: '#0b4e9d', borderColor: '#0b4e9d33' }}>
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-sm opacity-75 mb-3">
            Preserve your family's stories with Dearly
          </p>
          <a
            href="https://dearly.com"
            className="text-sm font-semibold hover:underline inline-block transition-all"
            style={{ color: '#B7CF3F' }}
          >
            Book Your Interview →
          </a>
        </div>
      </footer>
    </div>
  )
}

// Generate metadata for the page
export async function generateMetadata({ params }: ListenPageProps) {
  const { token } = params

  const { data: tokenData } = await supabaseAdmin
    .from('listening_tokens')
    .select(`
      sessions (
        questionnaires (
          interviewee_name
        )
      )
    `)
    .eq('token', token)
    .single()

  // @ts-ignore
  const intervieweeName = tokenData?.sessions?.questionnaires?.[0]?.interviewee_name || 'Family Story'

  return {
    title: `${intervieweeName}'s Story | Dearly`,
    description: `Listen to ${intervieweeName}'s interview recording with synchronized transcript and questions.`,
  }
}
