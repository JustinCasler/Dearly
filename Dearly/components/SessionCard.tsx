import Link from 'next/link'
import { SessionWithDetails } from '@/app/actions/sessions'
import AssignmentBadge from './AssignmentBadge'
import StatusBadge from './StatusBadge'
import { format } from 'date-fns'

interface SessionCardProps {
  session: SessionWithDetails
  showClaimButton?: boolean
  onClaim?: (sessionId: string) => void
  claiming?: boolean
}

export default function SessionCard({
  session,
  showClaimButton = false,
  onClaim,
  claiming = false
}: SessionCardProps) {
  const handleClaim = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onClaim) {
      onClaim(session.id)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {session.questionnaire?.interviewee_name || 'Unknown Interviewee'}
          </h3>
          <p className="text-sm text-gray-600">
            Customer: {session.user?.name || 'Unknown'}
          </p>
          {session.questionnaire?.relationship_to_interviewee && (
            <p className="text-xs text-gray-500">
              Relationship: {session.questionnaire.relationship_to_interviewee}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={session.status} />
          <AssignmentBadge interviewer={session.interviewer} variant="compact" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Duration</p>
          <p className="text-sm font-medium text-gray-900">
            {session.questionnaire?.length_minutes || 'N/A'} minutes
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Medium</p>
          <p className="text-sm font-medium text-gray-900 capitalize">
            {session.questionnaire?.medium?.replace('_', ' ') || 'N/A'}
          </p>
        </div>
        {session.appointment_start_time && (
          <div className="col-span-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Scheduled For</p>
            <p className="text-sm font-medium text-gray-900">
              {format(new Date(session.appointment_start_time), 'PPP p')}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Purchased {format(new Date(session.created_at), 'PP')}
        </p>
        <div className="flex gap-2">
          {showClaimButton && !session.interviewer_id && (
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {claiming ? 'Claiming...' : 'Claim Session'}
            </button>
          )}
          <Link
            href={`/dashboard/sessions/${session.id}${showClaimButton ? '?returnTo=/dashboard/interviewer/available' : ''}`}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}
