'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [processing, setProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processed, setProcessed] = useState(false)

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found in URL')
      setProcessing(false)
      return
    }

    // Process the session
    const processSession = async () => {
      try {
        const response = await fetch('/api/stripe/process-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to process session')
        }

        setProcessed(true)
        setProcessing(false)
      } catch (err: any) {
        console.error('Error processing session:', err)
        setError(err.message || 'Failed to process payment. Please contact support.')
        setProcessing(false)
      }
    }

    processSession()
  }, [sessionId])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for choosing Dearly
          </p>
        </div>

        {processing && (
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-blue-700 font-medium">
                Processing your payment...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-red-900 mb-2">
              Processing Error
            </h2>
            <p className="text-red-700">{error}</p>
            <p className="text-sm text-red-600 mt-4">
              Don&apos;t worry, your payment was successful. Please contact us at{' '}
              <a href="mailto:team@dearly.com" className="underline">
                team@dearly.com
              </a>{' '}
              with your session ID: <code className="bg-red-100 px-2 py-1 rounded">{sessionId}</code>
            </p>
          </div>
        )}

        {processed && !error && (
          <div className="bg-green-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-green-900 mb-2">
              ✅ All Set!
            </h2>
            <p className="text-green-700 mb-4">
              Your payment has been processed and you should receive an email shortly with your scheduling link.
            </p>
          </div>
        )}

        <div className="bg-indigo-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-3">What&apos;s Next?</h2>
          <div className="text-left space-y-3">
            <div className="flex gap-3">
              <span className="text-indigo-600 font-bold">1.</span>
              <p className="text-gray-700">
                Check your email for a confirmation and scheduling link
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-indigo-600 font-bold">2.</span>
              <p className="text-gray-700">
                Use the Calendly link to book a time that works for you
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-indigo-600 font-bold">3.</span>
              <p className="text-gray-700">
                We&apos;ll send you the final recording within 5-7 business days after the interview
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">
            If you have any questions, please contact us at{' '}
            <a
              href="mailto:team@dearly.com"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              team@dearly.com
            </a>
          </p>
          
          <Link
            href="/"
            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

