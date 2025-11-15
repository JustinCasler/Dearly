import { createServerClient, supabaseAdmin } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAssignedSessions } from '@/app/actions/sessions'
import SessionCard from '@/components/SessionCard'

export default async function InterviewerDashboard() {
  const supabase = await createServerClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // Verify user is interviewer or admin (using admin client to bypass RLS)
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null, error: any }

  if (userError || !userData || (userData.role !== 'interviewer' && userData.role !== 'admin')) {
    redirect('/dashboard')
  }

  // Get assigned sessions
  const sessions = await getAssignedSessions(user.id)

  // Separate upcoming and past sessions
  const now = new Date()
  const upcomingSessions = sessions.filter(s =>
    s.status === 'paid' || s.status === 'scheduled' ||
    (s.appointment_start_time && new Date(s.appointment_start_time) > now)
  )
  const pastSessions = sessions.filter(s =>
    s.status === 'completed' || s.status === 'delivered' ||
    (s.appointment_start_time && new Date(s.appointment_start_time) <= now && s.status !== 'scheduled')
  )

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Sessions</h1>
        <p className="text-gray-600">Sessions assigned to you</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Total Assigned</p>
          <p className="text-3xl font-bold text-indigo-600">{sessions.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Upcoming</p>
          <p className="text-3xl font-bold text-green-600">{upcomingSessions.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Completed</p>
          <p className="text-3xl font-bold text-gray-600">{pastSessions.length}</p>
        </div>
      </div>

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Sessions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcomingSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}

      {/* Past Sessions */}
      {pastSessions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Sessions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pastSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {sessions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions assigned yet</h3>
          <p className="text-gray-600 mb-4">
            Check the Available Sessions page to claim sessions
          </p>
          <a
            href="/dashboard/interviewer/available"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            View Available Sessions
          </a>
        </div>
      )}
    </div>
  )
}
