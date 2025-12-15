'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AvailabilitySlot, Appointment } from '@/types/database'

export default function ManageBooking() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const [appointment, setAppointment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [userTimezone, setUserTimezone] = useState<string>('')

  useEffect(() => {
    // Detect user's timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    setUserTimezone(timezone)
  }, [])

  useEffect(() => {
    fetchAppointment()
  }, [token])

  const fetchAppointment = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`/api/booking/get?token=${token}`)
      const data = await response.json()

      if (response.ok) {
        setAppointment(data.appointment)
      } else {
        setError('Booking not found')
      }
    } catch (err) {
      setError('An error occurred while loading your booking')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your appointment? You can reschedule to a different time instead.')) {
      return
    }

    setProcessing(true)
    setError('')

    try {
      const response = await fetch('/api/booking/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ booking_token: token }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('Your appointment has been cancelled. You can book a new time using your session.')
        router.push(`/booking/${appointment.session_id}`)
      } else {
        setError(data.error || 'Failed to cancel appointment')
      }
    } catch (err) {
      setError('An error occurred while cancelling the appointment')
      console.error(err)
    } finally {
      setProcessing(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: userTimezone || undefined
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const isPast = appointment && new Date(appointment.start_time) < new Date()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f4f1ea' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#0b4e9d' }}></div>
          <p className="mt-4 opacity-70" style={{ color: '#0b4e9d' }}>Loading your booking...</p>
        </div>
      </div>
    )
  }

  if (error && !appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f4f1ea' }}>
        <div className="max-w-md w-full bg-white shadow-sm rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#0b4e9d' }}>Booking Not Found</h2>
          <p className="mb-6 opacity-70" style={{ color: '#0b4e9d' }}>{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 text-white rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            style={{ backgroundColor: '#0b4e9d' }}
          >
            Go to Homepage
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#f4f1ea' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-2xl p-6 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#0b4e9d' }}>Manage Your Booking</h1>
          <p className="opacity-70" style={{ color: '#0b4e9d' }}>View or modify your scheduled interview</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: '#FEE', borderColor: '#FF5E33', color: '#991B1B' }}>
            {error}
          </div>
        )}

        {/* Appointment Details */}
        {appointment && (
          <div className="bg-white shadow-sm rounded-2xl p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-semibold" style={{ color: '#0b4e9d' }}>Appointment Details</h2>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  appointment.status === 'scheduled'
                    ? 'bg-green-100 text-green-800'
                    : appointment.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm opacity-70" style={{ color: '#0b4e9d' }}>Customer</p>
                <p className="text-lg font-medium" style={{ color: '#0b4e9d' }}>{appointment.users?.name || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm opacity-70" style={{ color: '#0b4e9d' }}>Email</p>
                <p className="text-lg" style={{ color: '#0b4e9d' }}>{appointment.users?.email || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm opacity-70" style={{ color: '#0b4e9d' }}>
                  Scheduled Time{userTimezone && ` (${userTimezone})`}
                </p>
                <p className="text-lg font-medium" style={{ color: '#0b4e9d' }}>
                  {formatDateTime(appointment.start_time)}
                </p>
              </div>

              {isPast && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    This appointment is in the past and cannot be modified.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            {appointment.status === 'scheduled' && !isPast && (
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => router.push(`/booking/${appointment.session_id}`)}
                  className="w-full px-6 py-3 text-white rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  style={{ backgroundColor: '#0b4e9d' }}
                >
                  Reschedule Appointment
                </button>
                <button
                  onClick={handleCancel}
                  disabled={processing}
                  className="w-full px-6 py-3 bg-white border-2 rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ color: '#FF5E33', borderColor: '#FF5E33' }}
                >
                  {processing ? 'Cancelling...' : 'Cancel Appointment'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
