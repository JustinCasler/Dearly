'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginFormData } from '@/lib/validations'
import { signIn } from '@/lib/auth'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // Check if user is already logged in
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
          console.log('User already logged in, redirecting to dashboard...')
          window.location.href = '/dashboard'
          return
        }
      } catch (err) {
        console.error('Error checking session:', err)
      } finally {
        setChecking(false)
      }
    }

    checkExistingSession()
  }, [])

  const onSubmit = async (data: LoginFormData) => {
    console.log('Login attempt started for:', data.email)
    setIsSubmitting(true)
    setError(null)

    try {
      console.log('Calling signIn...')
      const result = await signIn(data.email, data.password)
      console.log('signIn result:', result ? 'success' : 'null')

      if (!result || !result.session) {
        console.error('No session in result')
        throw new Error('Login failed: No session created')
      }

      console.log('Session created, verifying...')
      // Verify the session is actually set by checking again
      const { data: { session: verifySession }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('Session verification error:', sessionError)
        throw new Error('Session verification failed: ' + sessionError.message)
      }

      if (!verifySession) {
        console.error('Session was not properly set')
        throw new Error('Session was not properly set. Please try again.')
      }

      console.log('Session verified, redirecting to dashboard...')

      // Small delay to ensure session is written to localStorage
      await new Promise(resolve => setTimeout(resolve, 200))

      // Use window.location for more reliable navigation
      // This ensures a full page load and proper session initialization
      window.location.href = '/dashboard'

    } catch (err: any) {
      console.error('Login error caught:', err)
      const errorMessage = err?.message || err?.error?.message || 'Invalid email or password. Please check your credentials and try again.'
      console.error('Error message to display:', errorMessage)
      setError(errorMessage)
      setIsSubmitting(false)
    }
  }

  // Show loading while checking for existing session
  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            Dearly
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Admin Login</h1>
          <p className="text-gray-600 mt-2">
            Sign in to access the dashboard
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="admin@dearly.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                {...register('password')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-indigo-600 hover:text-indigo-700">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

