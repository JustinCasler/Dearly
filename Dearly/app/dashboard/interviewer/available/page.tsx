'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUnassignedSessions, assignSessionToSelf, SessionWithDetails } from '@/app/actions/sessions'
import SessionCard from '@/components/SessionCard'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function AvailableSessionsPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<SessionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getUnassignedSessions()
      setSessions(data)
    } catch (err) {
      setError('Failed to load available sessions')
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async (sessionId: string) => {
    try {
      setClaiming(sessionId)
      setError(null)

      const result = await assignSessionToSelf(sessionId)

      if (result.success) {
        // Remove session from list
        setSessions(prev => prev.filter(s => s.id !== sessionId))

        // Show success message briefly then redirect
        setTimeout(() => {
          router.push('/dashboard/interviewer')
        }, 500)
      } else {
        setError(result.error || 'Failed to claim session')
        // Reload sessions in case someone else claimed it
        await loadSessions()
      }
    } catch (err) {
      setError('An unexpected error occurred')
      await loadSessions()
    } finally {
      setClaiming(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Sessions</h1>
        <p className="text-gray-600">
          Sessions waiting to be claimed by an interviewer
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-400 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Sessions Count */}
      {sessions.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{sessions.length}</span>{' '}
            session{sessions.length !== 1 ? 's' : ''} available to claim
          </p>
        </div>
      )}

      {/* Sessions Grid */}
      {sessions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              showClaimButton
              onClaim={handleClaim}
              claiming={claiming === session.id}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No available sessions
          </h3>
          <p className="text-gray-600 mb-4">
            All sessions have been assigned. Check back later for new sessions.
          </p>
          <button
            onClick={loadSessions}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  )
}
