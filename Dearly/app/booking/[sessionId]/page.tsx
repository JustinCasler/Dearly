'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AvailabilitySlot, Session } from '@/types/database'
import { getSessionForBooking, getAvailableSlots } from '@/app/actions/booking'
import CalendarBooking from '@/components/CalendarBooking'

export default function BookingPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.sessionId as string

  const [session, setSession] = useState<Session | null>(null)
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState('')
  const [userTimezone, setUserTimezone] = useState<string>('')

  useEffect(() => {
    // Detect user's timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    setUserTimezone(timezone)
  }, [])

  useEffect(() => {
    validateSessionAndFetchData()
  }, [sessionId])

  const validateSessionAndFetchData = async () => {
    try {
      setLoading(true)
      setError('')

      console.log('Fetching session:', sessionId)

      // Fetch session details using server action (bypasses RLS)
      const sessionResult = await getSessionForBooking(sessionId)

      console.log('Session fetch result:', sessionResult)

      if (!sessionResult.success || !sessionResult.data) {
        console.error('Session not found:', sessionResult.error)
        setError('Session not found or you do not have access to this page.')
        return
      }

      const sessionData = (sessionResult as any).data

      // Check if session is paid or scheduled (for rescheduling)
      if ((sessionData as any).status !== 'paid' && (sessionData as any).status !== 'scheduled') {
        console.error('Session not in valid status:', (sessionData as any).status)
        setError('This session is not eligible for booking.')
        return
      }

      setSession(sessionData)

      // Fetch available slots (future slots only) using server action
      const today = new Date().toISOString()
      const slotsResult = await getAvailableSlots(today)

      if ((slotsResult as any).success) {
        setSlots((slotsResult as any).data || [])
      } else {
        setError('Failed to fetch available time slots')
      }
    } catch (err) {
      setError('An error occurred while loading the booking page')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleBookAppointment = async () => {
    if (!selectedSlot) {
      setError('Please select a time slot')
      return
    }

    setBooking(true)
    setError('')

    try {
      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          slot_id: selectedSlot,
          timezone: userTimezone || 'UTC',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect to confirmation page
        router.push(`/booking/confirmed?token=${data.booking_token}`)
      } else {
        setError(data.error || 'Failed to book appointment')
        // Refresh slots in case the selected one was just booked
        validateSessionAndFetchData()
      }
    } catch (err) {
      setError('An error occurred while booking the appointment')
      console.error(err)
    } finally {
      setBooking(false)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f4f1ea' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#0b4e9d' }}></div>
          <p className="mt-4 opacity-70" style={{ color: '#0b4e9d' }}>Loading booking calendar...</p>
        </div>
      </div>
    )
  }

  if (error && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f4f1ea' }}>
        <div className="max-w-md w-full bg-white shadow-sm rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#0b4e9d' }}>Access Denied</h2>
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#f4f1ea' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: '#0b4e9d' }}>
            Schedule Your Interview
          </h1>
          <p className="text-lg opacity-70" style={{ color: '#0b4e9d' }}>
            Select a time that works best for you. {userTimezone && `All times are shown in your local timezone (${userTimezone}).`}
          </p>
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

        {/* Book Button */}
        {slots.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <button
              onClick={handleBookAppointment}
              disabled={!selectedSlot || booking}
              className="w-full px-6 py-4 text-white text-lg font-semibold rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-1"
              style={{ backgroundColor: selectedSlot && !booking ? '#0b4e9d' : '#9CA3AF' }}
            >
              {booking ? 'Booking...' : selectedSlot ? 'Confirm Booking' : 'Select a Time Slot'}
            </button>
            {selectedSlot && (
              <p className="mt-3 text-center text-sm opacity-70" style={{ color: '#0b4e9d' }}>
                You'll receive a confirmation email with all the details
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
