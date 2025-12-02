'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { recordingUploadSchema, RecordingUploadFormData } from '@/lib/validations'
import {
  getSessionDetails,
  updateSessionStatus,
  uploadRecording,
  getSessionWithInterviewer,
  unassignSession,
  assignSessionToSelf,
  SessionWithDetails
} from '@/app/actions/sessions'
import Link from 'next/link'
import AssignmentBadge from '@/components/AssignmentBadge'

type SessionDetails = {
  session: {
    id: string
    status: string
    amount: number
    recording_url: string | null
    appointment_id: string | null
    appointment_start_time: string | null
    appointment_end_time: string | null
    created_at: string
    users: {
      name: string
      email: string
      stripe_customer_id: string | null
    }
  }
  questionnaire: {
    relationship_to_interviewee: string
    interviewee_name: string
    questions: Array<{ id: string; text: string }>
    length_minutes: number
    medium: string
    notes: string | null
  }
}

export default function SessionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = params.id as string
  const returnTo = searchParams.get('returnTo') || '/dashboard'

  const [details, setDetails] = useState<SessionDetails | null>(null)
  const [sessionWithInterviewer, setSessionWithInterviewer] = useState<SessionWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [unassigning, setUnassigning] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecordingUploadFormData>({
    resolver: zodResolver(recordingUploadSchema),
  })

  useEffect(() => {
    loadSessionDetails()
  }, [sessionId])

  const loadSessionDetails = async () => {
    setLoading(true)
    const result = await getSessionDetails(sessionId)
    if (result.success && result.data) {
      setDetails(result.data as SessionDetails)
    } else {
      setError('Failed to load session details')
    }

    // Also load session with interviewer info
    const sessionData = await getSessionWithInterviewer(sessionId)
    if (sessionData) {
      setSessionWithInterviewer(sessionData)
    }

    setLoading(false)
  }

  const handleStatusUpdate = async (newStatus: string) => {
    const result = await updateSessionStatus(sessionId, newStatus as any)
    if (result.success) {
      setSuccess('Status updated successfully')
      loadSessionDetails()
      setTimeout(() => setSuccess(null), 3000)
    } else {
      setError('Failed to update status')
    }
  }

  const handleUnassign = async () => {
    if (!confirm('Are you sure you want to unassign this interviewer?')) {
      return
    }

    setUnassigning(true)
    setError(null)
    setSuccess(null)

    const result = await unassignSession(sessionId)

    if (result.success) {
      setSuccess('Interviewer unassigned successfully')
      loadSessionDetails()
      setTimeout(() => setSuccess(null), 3000)
    } else {
      setError(result.error || 'Failed to unassign interviewer')
    }

    setUnassigning(false)
  }

  const handleClaim = async () => {
    setClaiming(true)
    setError(null)
    setSuccess(null)

    const result = await assignSessionToSelf(sessionId)

    if (result.success) {
      setSuccess('Session claimed successfully!')
      loadSessionDetails()
      setTimeout(() => {
        setSuccess(null)
        router.push('/dashboard/interviewer')
      }, 1500)
    } else {
      setError(result.error || 'Failed to claim session')
    }

    setClaiming(false)
  }

  const onSubmitRecording = async (data: RecordingUploadFormData) => {
    setUploading(true)
    setError(null)
    setSuccess(null)

    const result = await uploadRecording(sessionId, data.recording_url)

    if (result.success) {
      setSuccess('Recording uploaded and email sent successfully!')
      loadSessionDetails()
    } else {
      setError(result.error || 'Failed to upload recording')
    }

    setUploading(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatAmount = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!details) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Session not found</p>
        <Link href={returnTo} className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block">
          ← Back
        </Link>
      </div>
    )
  }

  const { session, questionnaire } = details

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <Link href={returnTo} className="text-indigo-600 hover:text-indigo-700">
          ← Back to {returnTo.includes('available') ? 'Available Sessions' : 'Sessions'}
        </Link>
        {!sessionWithInterviewer?.interviewer && returnTo.includes('available') && (
          <button
            onClick={handleClaim}
            disabled={claiming}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {claiming ? 'Claiming...' : 'Claim This Session'}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Name</label>
                <p className="font-medium">{session.users.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="font-medium">{session.users.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Purchase Date</label>
                <p className="font-medium">{formatDate(session.created_at)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Amount Paid</label>
                <p className="font-medium">{formatAmount(session.amount)}</p>
              </div>
            </div>
          </div>

          {/* Interview Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Interview Details</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm text-gray-500">Interviewee</label>
                <p className="font-medium">{questionnaire.interviewee_name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Relationship</label>
                <p className="font-medium">{questionnaire.relationship_to_interviewee}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Duration</label>
                <p className="font-medium">{questionnaire.length_minutes} minutes</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Medium</label>
                <p className="font-medium capitalize">
                  {questionnaire.medium.replace('_', ' ')}
                </p>
              </div>
            </div>

            {questionnaire.notes && (
              <div className="mb-6">
                <label className="text-sm text-gray-500">Additional Notes</label>
                <p className="mt-1 text-gray-700">{questionnaire.notes}</p>
              </div>
            )}

            <div>
              <label className="text-sm text-gray-500 mb-2 block">Interview Questions</label>
              <div className="space-y-2">
                {questionnaire.questions.map((q, index) => (
                  <div key={q.id} className="p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-indigo-600">Q{index + 1}:</span>{' '}
                    {q.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recording Upload */}
          {session.status !== 'delivered' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Upload Recording</h2>
              <form onSubmit={handleSubmit(onSubmitRecording)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recording URL
                  </label>
                  <input
                    type="url"
                    {...register('recording_url')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="https://example.com/recording.mp3"
                  />
                  {errors.recording_url && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.recording_url.message}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    This will automatically send the recording link to the customer
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload & Send to Customer'}
                </button>
              </form>
            </div>
          )}

          {/* Recording Link (if exists) */}
          {session.recording_url && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Recording</h2>
              <a
                href={session.recording_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-700 break-all"
              >
                {session.recording_url}
              </a>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Interviewer Assignment */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold mb-3">Interviewer Assignment</h3>
            {sessionWithInterviewer?.interviewer ? (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Assigned to</p>
                  <p className="font-semibold text-gray-900">
                    {sessionWithInterviewer.interviewer.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {sessionWithInterviewer.interviewer.email}
                  </p>
                </div>
                <button
                  onClick={handleUnassign}
                  disabled={unassigning}
                  className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {unassigning ? 'Unassigning...' : 'Unassign Interviewer'}
                </button>
              </div>
            ) : (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AssignmentBadge interviewer={null} />
                <p className="text-xs text-gray-600 mt-2">
                  This session is waiting to be claimed by an interviewer
                </p>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold mb-3">Status</h3>
            <div className="space-y-2">
              {['paid', 'scheduled', 'completed', 'delivered'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition ${
                    session.status === status
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Appointment Info */}
          {session.appointment_start_time && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold mb-3">Scheduled Appointment</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Start:</strong> {new Date(session.appointment_start_time).toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZone: 'America/New_York'
                  })} EST
                </p>
                <p className="text-sm text-gray-600">
                  <strong>End:</strong> {new Date(session.appointment_end_time!).toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZone: 'America/New_York'
                  })} EST
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

