'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { questionnaireSchema, QuestionnaireFormData } from '@/lib/validations'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<QuestionnaireFormData>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: {
      length_minutes: 60,
      medium: 'zoom',
      questions: [
        { id: '1', text: '' },
        { id: '2', text: '' },
        { id: '3', text: '' },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  })

  const lengthMinutes = watch('length_minutes')

  const onSubmit = async (data: QuestionnaireFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          length_minutes: data.length_minutes,
          questionnaire: {
            relationship_to_interviewee: data.relationship_to_interviewee,
            interviewee_name: data.interviewee_name,
            questions: data.questions,
            medium: data.medium,
            notes: data.notes,
          },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (result.url) {
        window.location.href = result.url
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsSubmitting(false)
    }
  }

  const getPrice = () => {
    switch (lengthMinutes) {
      case 30: return '$150'
      case 60: return '$250'
      case 90: return '$350'
      default: return '$250'
    }
  }

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: '#F2EEE9' }}>
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <Link href="/" className="hover:opacity-70 transition" style={{ color: '#1A0089' }}>
            ← Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-3" style={{ color: '#1A0089' }}>
            Book Your Interview
          </h1>
          <p className="text-lg mb-8 opacity-70" style={{ color: '#1A0089' }}>
            Tell us about the interview you&apos;d like to schedule and provide questions for our interviewer.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-2xl border-2 text-red-700" style={{ backgroundColor: '#FEE', borderColor: '#FF5E33' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Your Information */}
            <div>
              <h2 className="text-2xl font-bold font-serif mb-4" style={{ color: '#1A0089' }}>Your Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1A0089' }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    className="w-full px-4 py-3 border-2 rounded-2xl focus:outline-none focus:border-opacity-100 transition"
                    style={{ borderColor: 'rgba(26, 0, 137, 0.2)', backgroundColor: '#FEFEFE' }}
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm" style={{ color: '#FF5E33' }}>{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1A0089' }}>
                    Your Email *
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full px-4 py-3 border-2 rounded-2xl focus:outline-none focus:border-opacity-100 transition"
                    style={{ borderColor: 'rgba(26, 0, 137, 0.2)', backgroundColor: '#FEFEFE' }}
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm" style={{ color: '#FF5E33' }}>{errors.email.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Interview Details */}
            <div>
              <h2 className="text-2xl font-bold font-serif mb-4" style={{ color: '#1A0089' }}>Interview Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1A0089' }}>
                    Who will be interviewed? *
                  </label>
                  <input
                    type="text"
                    {...register('interviewee_name')}
                    className="w-full px-4 py-3 border-2 rounded-2xl focus:outline-none focus:border-opacity-100 transition"
                    style={{ borderColor: 'rgba(26, 0, 137, 0.2)', backgroundColor: '#FEFEFE' }}
                    placeholder="e.g., Grandma Mary"
                  />
                  {errors.interviewee_name && (
                    <p className="mt-1 text-sm" style={{ color: '#FF5E33' }}>{errors.interviewee_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1A0089' }}>
                    Your relationship to the interviewee *
                  </label>
                  <input
                    type="text"
                    {...register('relationship_to_interviewee')}
                    className="w-full px-4 py-3 border-2 rounded-2xl focus:outline-none focus:border-opacity-100 transition"
                    style={{ borderColor: 'rgba(26, 0, 137, 0.2)', backgroundColor: '#FEFEFE' }}
                    placeholder="e.g., Granddaughter, Son, Friend"
                  />
                  {errors.relationship_to_interviewee && (
                    <p className="mt-1 text-sm" style={{ color: '#FF5E33' }}>{errors.relationship_to_interviewee.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1A0089' }}>
                    Session Length *
                  </label>
                  <select
                    {...register('length_minutes', { valueAsNumber: true })}
                    className="w-full px-4 py-3 border-2 rounded-2xl focus:outline-none focus:border-opacity-100 transition"
                    style={{ borderColor: 'rgba(26, 0, 137, 0.2)', backgroundColor: '#FEFEFE' }}
                  >
                    <option value={30}>30 minutes - $150</option>
                    <option value={60}>60 minutes - $250</option>
                    <option value={90}>90 minutes - $350</option>
                  </select>
                  {errors.length_minutes && (
                    <p className="mt-1 text-sm" style={{ color: '#FF5E33' }}>{errors.length_minutes.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1A0089' }}>
                    Interview Medium *
                  </label>
                  <select
                    {...register('medium')}
                    className="w-full px-4 py-3 border-2 rounded-2xl focus:outline-none focus:border-opacity-100 transition"
                    style={{ borderColor: 'rgba(26, 0, 137, 0.2)', backgroundColor: '#FEFEFE' }}
                  >
                    <option value="zoom">Zoom</option>
                    <option value="google_meet">Google Meet</option>
                    <option value="phone">Phone</option>
                  </select>
                  {errors.medium && (
                    <p className="mt-1 text-sm" style={{ color: '#FF5E33' }}>{errors.medium.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Questions */}
            <div>
              <h2 className="text-2xl font-bold font-serif mb-2" style={{ color: '#1A0089' }}>Interview Questions</h2>
              <p className="text-sm mb-4 opacity-70" style={{ color: '#1A0089' }}>
                Provide 3-20 questions you&apos;d like our interviewer to ask. These will guide the conversation.
              </p>
              
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        {...register(`questions.${index}.text`)}
                        className="w-full px-4 py-3 border-2 rounded-2xl focus:outline-none focus:border-opacity-100 transition"
                        style={{ borderColor: 'rgba(26, 0, 137, 0.2)', backgroundColor: '#FEFEFE' }}
                        placeholder={`Question ${index + 1}`}
                      />
                      {errors.questions?.[index]?.text && (
                        <p className="mt-1 text-sm" style={{ color: '#FF5E33' }}>
                          {errors.questions[index]?.text?.message}
                        </p>
                      )}
                    </div>
                    {fields.length > 3 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="px-3 py-2 rounded-2xl transition hover:opacity-70"
                        style={{ color: '#FF5E33', backgroundColor: 'rgba(255, 94, 51, 0.1)' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {errors.questions && typeof errors.questions.message === 'string' && (
                <p className="mt-2 text-sm" style={{ color: '#FF5E33' }}>{errors.questions.message}</p>
              )}

              {fields.length < 20 && (
                <button
                  type="button"
                  onClick={() => append({ id: Date.now().toString(), text: '' })}
                  className="mt-3 text-sm font-medium hover:opacity-70 transition"
                  style={{ color: '#1A0089' }}
                >
                  + Add Another Question
                </button>
              )}
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1A0089' }}>
                Additional Notes (Optional)
              </label>
              <textarea
                {...register('notes')}
                rows={4}
                className="w-full px-4 py-3 border-2 rounded-2xl focus:outline-none focus:border-opacity-100 transition"
                style={{ borderColor: 'rgba(26, 0, 137, 0.2)', backgroundColor: '#FEFEFE' }}
                placeholder="Any special instructions or context for the interviewer..."
              />
            </div>

            {/* Summary */}
            <div className="p-8 rounded-2xl" style={{ backgroundColor: 'rgba(150, 173, 217, 0.15)' }}>
              <h3 className="font-bold font-serif text-xl mb-3" style={{ color: '#1A0089' }}>Order Summary</h3>
              <div className="flex justify-between items-center">
                <span className="text-lg" style={{ color: '#1A0089' }}>
                  {lengthMinutes}-minute interview session
                </span>
                <span className="text-3xl font-bold font-serif" style={{ color: '#1A0089' }}>{getPrice()}</span>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-white py-4 rounded-full font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              style={{ backgroundColor: '#1A0089' }}
            >
              {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

