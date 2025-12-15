'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AvailabilitySlot } from '@/types/database'
import { getAvailableSlots } from '@/app/actions/booking'
import CalendarBooking from '@/components/CalendarBooking'

export default function ReschedulePage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const [appointment, setAppointment] = useState<any>(null)
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [rescheduling, setRescheduling] = useState(false)
  const [error, setError] = useState('')
  const [userTimezone, setUserTimezone] = useState<string>('')

  useEffect(() => {
    // Detect user's timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    setUserTimezone(timezone)
  }, [])

  useEffect(() => {
    fetchAppointmentAndSlots()
  }, [token])

  const fetchAppointmentAndSlots = async () => {
    try {
      setLoading(true)
      setError('')

      // Fetch the appointment details
      const appointmentResponse = await fetch(`/api/booking/get?token=${token}`)
      const appointmentData = await appointmentResponse.json()

      if (!appointmentResponse.ok) {
        setError('Booking not found or you do not have access to this page.')
        return
      }

      const appointmentInfo = appointmentData.appointment

      // Check if appointment can be rescheduled
      if (appointmentInfo.status !== 'scheduled') {
        setError('Only scheduled appointments can be rescheduled.')
        return
      }

      // Check if appointment is in the past
      if (new Date(appointmentInfo.start_time) < new Date()) {
        setError('Past appointments cannot be rescheduled.')
        return
      }

      setAppointment(appointmentInfo)

      // Fetch available slots (future slots only)
      const today = new Date().toISOString()
      const slotsResult = await getAvailableSlots(today)

      if ((slotsResult as any).success) {
        setSlots((slotsResult as any).data || [])
      } else {
        setError('Failed to fetch available time slots')
      }
    } catch (err) {
      setError('An error occurred while loading the rescheduling page')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleReschedule = async () => {
    if (!selectedSlot) {
      setError('Please select a time slot')
      return
    }

    setRescheduling(true)
    setError('')

    try {
      const response = await fetch('/api/booking/reschedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_token: token,
          new_slot_id: selectedSlot,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect to confirmation page
        router.push(`/booking/manage/${token}?rescheduled=true`)
      } else {
        setError(data.error || 'Failed to reschedule appointment')
        // Refresh slots in case the selected one was just booked
        fetchAppointmentAndSlots()
      }
    } catch (err) {
      setError('An error occurred while rescheduling the appointment')
      console.error(err)
    } finally {
      setRescheduling(false)
    }
  }

  const handleBackToManage = () => {
    router.push(`/booking/manage/${token}`)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f4f1ea' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#0b4e9d' }}></div>
          <p className="mt-4 opacity-70" style={{ color: '#0b4e9d' }}>Loading rescheduling options...</p>
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
          <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#0b4e9d' }}>Cannot Reschedule</h2>
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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBackToManage}
            className="flex items-center gap-2 text-sm mb-4 hover:opacity-70 transition"
            style={{ color: '#0b4e9d' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Booking Details
          </button>
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: '#0b4e9d' }}>
            Reschedule Your Interview
          </h1>
          <p className="text-lg opacity-70 mb-4" style={{ color: '#0b4e9d' }}>
            Select a new time for your interview. {userTimezone && `All times are shown in your local timezone (${userTimezone}).`}
          </p>
          {appointment && (
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <p className="text-sm opacity-70" style={{ color: '#0b4e9d' }}>Current appointment time:</p>
              <p className="text-lg font-semibold" style={{ color: '#0b4e9d' }}>
                {formatDateTime(appointment.start_time)}
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl border-2" style={{ backgroundColor: '#FEE', borderColor: '#FF5E33', color: '#991B1B' }}>
            {error}
          </div>
        )}

        {/* Calendar Booking Interface */}
        {slots.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="text-center py-8">
              <svg
                className="w-16 h-16 mx-auto mb-4 opacity-40"
                style={{ color: '#0b4e9d' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="mb-2 font-semibold" style={{ color: '#0b4e9d' }}>No time slots available at the moment</p>
              <p className="text-sm opacity-60" style={{ color: '#0b4e9d' }}>Please check back later or contact us for assistance.</p>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <CalendarBooking
              availableSlots={slots}
              onSelectSlot={setSelectedSlot}
              selectedSlotId={selectedSlot}
            />
          </div>
        )}

        {/* Reschedule Button */}
        {slots.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex gap-4 justify-end">
              <button
                onClick={handleBackToManage}
                className="px-6 py-3 rounded-full font-semibold transition-all border-2"
                style={{ borderColor: '#0b4e9d', color: '#0b4e9d' }}
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={!selectedSlot || rescheduling}
                className="px-8 py-4 text-white text-lg font-semibold rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-1"
                style={{ backgroundColor: selectedSlot && !rescheduling ? '#0b4e9d' : '#9CA3AF' }}
              >
                {rescheduling ? 'Rescheduling...' : selectedSlot ? 'Confirm New Time' : 'Select a Time Slot'}
              </button>
            </div>
            {selectedSlot && (
              <p className="mt-3 text-center text-sm opacity-70" style={{ color: '#0b4e9d' }}>
                You'll receive a confirmation email with the updated details
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
