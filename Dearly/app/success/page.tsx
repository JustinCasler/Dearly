'use client'

import Link from 'next/link'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const questionnaireEncoded = searchParams.get('q')
  const slotId = searchParams.get('slot_id')
  const timezone = searchParams.get('timezone')
  const [processing, setProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookingSessionId, setBookingSessionId] = useState<string | null>(null)

  useEffect(() => {
    // Clear saved checkout form data since payment was successful
    localStorage.removeItem('dearly_checkout_form')
    // Also clear pending checkout data if coming from booking flow
    localStorage.removeItem('dearly_pending_checkout')
  }, [])

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found in URL')
      setProcessing(false)
      return
    }

    if (!questionnaireEncoded) {
      setError('No questionnaire data found')
      setProcessing(false)
      return
    }

    // Process the session and create booking if slot was selected
    const processSession = async () => {
      try {
        const response = await fetch('/api/stripe/process-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            questionnaireEncoded,
            slotId,
            timezone
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to process session')
        }

        setBookingSessionId(result.sessionId)

        // If booking was created, redirect to confirmation page
        // Otherwise redirect to booking page to select time
        setTimeout(() => {
          if (slotId) {
            window.location.href = `/booking/confirmed?token=${result.token}`
          } else {
            window.location.href = `/booking/${result.sessionId}`
          }
        }, 2000)
      } catch (err: any) {
        console.error('Error processing session:', err)
        setError(err.message || 'Failed to process payment. Please contact support.')
        setProcessing(false)
      }
    }

    processSession()
  }, [sessionId, questionnaireEncoded, slotId, timezone])

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f4f1ea' }}>
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#0b4e9d' }}>
            Payment Successful!
          </h1>
          <p className="text-lg opacity-70" style={{ color: '#0b4e9d' }}>
            Thank you for choosing Dearly
          </p>
        </div>

        {processing && !error && (
          <div className="rounded-2xl p-6 mb-8" style={{ backgroundColor: 'rgba(11, 78, 157, 0.1)' }}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: '#0b4e9d' }}></div>
              <p className="font-medium" style={{ color: '#0b4e9d' }}>
                Processing your payment...
              </p>
            </div>
            {bookingSessionId && (
              <p className="text-sm opacity-70" style={{ color: '#0b4e9d' }}>
                Redirecting you to schedule your interview...
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-2xl p-6 mb-8" style={{ backgroundColor: '#FEE', borderColor: '#FF5E33' }}>
            <h2 className="text-xl font-semibold mb-2" style={{ color: '#991B1B' }}>
              Processing Error
            </h2>
            <p style={{ color: '#991B1B' }}>{error}</p>
            <p className="text-sm mt-4" style={{ color: '#991B1B' }}>
              Don&apos;t worry, your payment was successful. Please contact us at{' '}
              <a href="mailto:team@dearly.com" className="underline">
                team@dearly.com
              </a>{' '}
              with your session ID: <code className="bg-red-100 px-2 py-1 rounded">{sessionId}</code>
            </p>
          </div>
        )}

        {!error && (
          <div className="rounded-2xl p-6 mb-8" style={{ backgroundColor: 'rgba(11, 78, 157, 0.1)' }}>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#0b4e9d' }}>What&apos;s Next?</h2>
            <div className="text-left space-y-3">
              <div className="flex gap-3">
                <span className="font-bold" style={{ color: '#0b4e9d' }}>1.</span>
                <p style={{ color: '#0b4e9d' }}>
                  Select a time that works for you from our available slots
                </p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold" style={{ color: '#0b4e9d' }}>2.</span>
                <p style={{ color: '#0b4e9d' }}>
                  You&apos;ll receive a confirmation email with all the details
                </p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold" style={{ color: '#0b4e9d' }}>3.</span>
                <p style={{ color: '#0b4e9d' }}>
                  We&apos;ll send you the final recording within 5-7 business days after the interview
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1"
              style={{ backgroundColor: '#0b4e9d' }}
            >
              Return to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f4f1ea' }}>
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: '#0b4e9d' }}></div>
            <p style={{ color: '#0b4e9d' }}>Loading...</p>
          </div>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}

