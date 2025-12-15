'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function BookingConfirmedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingToken = searchParams.get('token')
  const [copied, setCopied] = useState(false)
  const [manageUrl, setManageUrl] = useState('')

  useEffect(() => {
    if (!bookingToken) {
      router.push('/')
    } else {
      // Set manage URL on client side only
      setManageUrl(`${window.location.origin}/booking/manage/${bookingToken}`)
    }
  }, [bookingToken, router])

  const copyToClipboard = () => {
    if (manageUrl) {
      navigator.clipboard.writeText(manageUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f4f1ea' }}>
      <div className="max-w-2xl w-full bg-white shadow-sm rounded-2xl p-8">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#0b4e9d' }}>
            Your Interview is Scheduled!
          </h1>
          <p className="text-lg mb-6 opacity-70" style={{ color: '#0b4e9d' }}>
            We've sent a confirmation email with all the details.
          </p>

          <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: 'rgba(11, 78, 157, 0.1)' }}>
            <h2 className="text-lg font-semibold mb-2" style={{ color: '#0b4e9d' }}>What's Next?</h2>
            <ul className="text-left space-y-2" style={{ color: '#0b4e9d' }}>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5" style={{ color: '#0b4e9d' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                You'll receive a calendar invite closer to your scheduled time
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5" style={{ color: '#0b4e9d' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                We'll send you the meeting link via email before the interview
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5" style={{ color: '#0b4e9d' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                After the interview, we'll edit and deliver your video recording
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/booking/manage/${bookingToken}`}
              className="px-6 py-3 text-white rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              style={{ backgroundColor: '#0b4e9d' }}
            >
              Manage Booking
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-white rounded-full font-semibold border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              style={{ color: '#0b4e9d', borderColor: '#0b4e9d' }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BookingConfirmed() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f4f1ea' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#0b4e9d' }}></div>
          <p className="mt-4 opacity-70" style={{ color: '#0b4e9d' }}>Loading...</p>
        </div>
      </div>
    }>
      <BookingConfirmedContent />
    </Suspense>
  )
}
