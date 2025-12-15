'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AvailabilitySlot } from '@/types/database'
import { getAvailableSlots } from '@/app/actions/booking'
import CalendarBooking from '@/components/CalendarBooking'

export default function BookingSessionPage() {
  const router = useRouter()
  const [checkoutData, setCheckoutData] = useState<any>(null)
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [proceeding, setProceeding] = useState(false)
  const [error, setError] = useState('')
  const [userTimezone, setUserTimezone] = useState<string>('')

  useEffect(() => {
    // Detect user's timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    setUserTimezone(timezone)
  }, [])

  useEffect(() => {
    // Load checkout data from localStorage
    const savedData = localStorage.getItem('dearly_pending_checkout')
    if (!savedData) {
      setError('No checkout data found. Please start from the checkout page.')
      setLoading(false)
      return
    }

    try {
      const data = JSON.parse(savedData)
      setCheckoutData(data)
      fetchAvailableSlots()
    } catch (err) {
      setError('Invalid checkout data. Please start from the checkout page.')
      setLoading(false)
    }
  }, [])

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true)
      setError('')

      // Fetch available slots (future slots only)
      const today = new Date().toISOString()
      const slotsResult = await getAvailableSlots(today)

      if ((slotsResult as any).success) {
        setSlots((slotsResult as any).data || [])
      } else {
        setError('Failed to fetch available time slots')
      }
    } catch (err) {
      setError('An error occurred while loading time slots')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleProceedToPayment = async () => {
    if (!selectedSlot) {
      setError('Please select a time slot')
      return
    }

    if (!checkoutData) {
      setError('Checkout data missing. Please start over.')
      return
    }

    setProceeding(true)
    setError('')

    try {
      console.log('Sending checkout data:', {
        ...checkoutData,
        slot_id: selectedSlot,
        timezone: userTimezone || 'UTC',
      })

      // Call Stripe checkout with both questionnaire and booking data
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...checkoutData,
          slot_id: selectedSlot,
          timezone: userTimezone || 'UTC',
        }),
      })

      const result = await response.json()
      console.log('Stripe checkout response:', result)

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (result.url) {
        console.log('Redirecting to Stripe:', result.url)
        window.location.href = result.url
      } else {
        throw new Error('No checkout URL returned from Stripe')
      }
    } catch (err) {
      console.error('Payment error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      setProceeding(false)
    }
  }

  const handleBackToCheckout = () => {
    router.push('/checkout')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f4f1ea' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#0b4e9d' }}></div>
          <p style={{ color: '#0b4e9d' }}>Loading available times...</p>
        </div>
      </div>
    )
  }

  if (error && !checkoutData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f4f1ea' }}>
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#0b4e9d' }}>Booking Error</h1>
          <p className="mb-6" style={{ color: '#0b4e9d' }}>{error}</p>
          <button
            onClick={handleBackToCheckout}
            className="px-6 py-3 rounded-full text-white font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: '#0b4e9d' }}
          >
            Return to Checkout
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: '#f4f1ea' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <button
            onClick={handleBackToCheckout}
            className="flex items-center gap-2 text-sm mb-4 hover:opacity-70 transition"
            style={{ color: '#0b4e9d' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Checkout
          </button>
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#0b4e9d' }}>
            Select Your Interview Time
          </h1>
        </div>

        {/* Calendar */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2" style={{ color: '#0b4e9d' }}>Available Time Slots</h2>
          <p className="text-sm opacity-70 mb-4" style={{ color: '#0b4e9d' }}>
            All times are shown in your local timezone
          </p>

          {slots.length === 0 ? (
            <div className="text-center py-12">
              <p className="mb-4" style={{ color: '#0b4e9d' }}>No available time slots at the moment.</p>
              <p className="text-sm opacity-70" style={{ color: '#0b4e9d' }}>
                Please check back later or contact us for assistance.
              </p>
            </div>
          ) : (
            <CalendarBooking
              availableSlots={slots}
              selectedSlotId={selectedSlot}
              onSelectSlot={setSelectedSlot}
            />
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            onClick={handleBackToCheckout}
            className="px-6 py-3 rounded-full font-semibold transition-all border-2"
            style={{ borderColor: '#0b4e9d', color: '#0b4e9d' }}
          >
            Back
          </button>
          <button
            onClick={handleProceedToPayment}
            disabled={!selectedSlot || proceeding}
            className="px-8 py-3 rounded-full text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#0b4e9d' }}
          >
            {proceeding ? 'Processing...' : 'Confirm Time & Pay'}
          </button>
        </div>
      </div>
    </div>
  )
}
