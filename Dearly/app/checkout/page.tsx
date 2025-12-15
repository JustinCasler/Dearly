'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { questionnaireSchema, QuestionnaireFormData } from '@/lib/validations'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const FORM_STORAGE_KEY = 'dearly_checkout_form'

const THEME_QUESTIONS = {
  'life-story': [
    'Where and when were you born?',
    'What do you remember most about your childhood home?',
    'Who were the most important people in your early life?',
    'What was school like for you growing up?',
    'What was your first job, and how did you get it?',
    'How did you meet your spouse/partner?',
    'What were some of the biggest challenges you faced in life?',
    'What accomplishments are you most proud of?',
    'What lessons did you learn that you want to pass on?',
    'How would you describe the person you\'ve become?',
  ],
  'life-advice': [
    'What is the most important lesson life has taught you?',
    'What advice would you give to your younger self?',
    'What do you think is the key to a happy life?',
    'How do you handle difficult times or setbacks?',
    'What values have guided your decisions in life?',
    'What do you wish you had known when you were younger?',
    'What does success mean to you?',
    'How do you define a life well-lived?',
    'What would you want future generations to know?',
    'What brings you the most joy and fulfillment?',
  ],
  'family-stories': [
    'What stories did your parents tell you about their lives?',
    'What family traditions were important growing up?',
    'What do you remember about your grandparents?',
    'Are there any family heirlooms or treasured possessions with stories?',
    'What were holidays like in your family?',
    'What are your favorite memories with your siblings?',
    'What family recipes or foods are special to you?',
    'How did your family celebrate important milestones?',
    'What challenges did your family overcome together?',
    'What do you hope your family remembers about you?',
  ],
  'hobbies-interests': [
    'What hobbies or activities do you enjoy most?',
    'How did you first become interested in your hobbies?',
    'What skills have you developed over the years?',
    'What books, movies, or music have been meaningful to you?',
    'Have you traveled anywhere memorable? Tell me about it.',
    'What creative pursuits have you explored?',
    'Are there any sports or physical activities you enjoyed?',
    'What organizations or groups have you been part of?',
    'What would you still like to learn or experience?',
    'How do you like to spend your free time?',
  ],
}

export default function CheckoutPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<string>('')
  const [currentStep, setCurrentStep] = useState(1)
  const [validationError, setValidationError] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
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

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'questions',
  })

  // Load saved form data on mount
  useEffect(() => {
    const savedData = localStorage.getItem(FORM_STORAGE_KEY)
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        // Restore all form fields
        Object.keys(parsedData).forEach((key) => {
          if (key === 'questions') {
            replace(parsedData[key])
          } else {
            setValue(key as any, parsedData[key])
          }
        })
        // Restore theme selection if it exists
        if (parsedData.selectedTheme) {
          setSelectedTheme(parsedData.selectedTheme)
        }
        // Restore current step
        if (parsedData.currentStep) {
          setCurrentStep(parsedData.currentStep)
        }
      } catch (err) {
        console.error('Failed to restore form data:', err)
      }
    }
  }, [setValue, replace])

  // Save form data to localStorage whenever it changes
  const formValues = watch()
  useEffect(() => {
    const dataToSave = {
      ...formValues,
      selectedTheme,
      currentStep,
    }
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(dataToSave))
  }, [formValues, selectedTheme, currentStep])

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme)
    if (theme && THEME_QUESTIONS[theme as keyof typeof THEME_QUESTIONS]) {
      const themeQuestions = THEME_QUESTIONS[theme as keyof typeof THEME_QUESTIONS]
      const newQuestions = themeQuestions.map((text, index) => ({
        id: `theme-${Date.now()}-${index}`,
        text,
      }))
      replace(newQuestions)
    } else if (theme === '') {
      // Reset to empty questions when "Custom" is selected
      replace([
        { id: '1', text: '' },
        { id: '2', text: '' },
        { id: '3', text: '' },
      ])
    }
  }

  const lengthMinutes = watch('length_minutes')

  const handleNextStep = () => {
    // Validate first page fields before proceeding
    setValidationError(null)

    const name = watch('name')
    const email = watch('email')
    const intervieweeName = watch('interviewee_name')
    const relationship = watch('relationship_to_interviewee')
    const lengthMinutes = watch('length_minutes')
    const medium = watch('medium')

    if (!name || name.trim() === '') {
      setValidationError('Please enter your name')
      return
    }
    if (!email || email.trim() === '') {
      setValidationError('Please enter your email')
      return
    }
    if (!intervieweeName || intervieweeName.trim() === '') {
      setValidationError('Please enter the interviewee\'s name')
      return
    }
    if (!relationship || relationship.trim() === '') {
      setValidationError('Please enter your relationship to the interviewee')
      return
    }
    if (!lengthMinutes) {
      setValidationError('Please select a session length')
      return
    }
    if (!medium) {
      setValidationError('Please select an interview medium')
      return
    }

    setCurrentStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePreviousStep = () => {
    setValidationError(null)
    setCurrentStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackButton = () => {
    if (currentStep === 2) {
      handlePreviousStep()
    } else {
      router.push('/')
    }
  }

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
        // Don't clear localStorage yet - user might come back from Stripe
        window.location.href = result.url
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsSubmitting(false)
    }
  }

  const clearFormData = () => {
    if (confirm('Are you sure you want to clear all form data and start over?')) {
      localStorage.removeItem(FORM_STORAGE_KEY)
      window.location.reload()
    }
  }

  const getPrice = () => {
    switch (lengthMinutes) {
      case 30: return '$99'
      case 60: return '$139'
      case 90: return '$199'
      default: return '$139'
    }
  }

  const getPackageName = () => {
    switch (lengthMinutes) {
      case 30: return 'Essential'
      case 60: return 'Gift'
      case 90: return 'Legacy'
      default: return 'Gift'
    }
  }

  const getPackageDescription = () => {
    switch (lengthMinutes) {
      case 30: return '30-minute professional interview'
      case 60: return '60-minute comprehensive interview with transcript'
      case 90: return '90-minute complete life story with mini biography'
      default: return '60-minute comprehensive interview with transcript'
    }
  }

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: '#f4f1ea' }}>
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8 flex justify-between items-center">
          <button
            onClick={handleBackButton}
            className="hover:opacity-70 transition"
            style={{ color: '#0b4e9d' }}
          >
            ← {currentStep === 2 ? 'Back' : 'Back to Home'}
          </button>
          <button
            onClick={clearFormData}
            className="text-sm hover:opacity-70 transition"
            style={{ color: '#0b4e9d' }}
          >
            Clear Form
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${currentStep >= 1 ? '' : 'opacity-50'}`} style={{ color: '#0b4e9d' }}>
                1. Background Info
              </span>
              <span className={`text-sm font-medium ${currentStep >= 2 ? '' : 'opacity-50'}`} style={{ color: '#0b4e9d' }}>
                2. Interview Questions
              </span>
            </div>
            <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'rgba(26, 0, 137, 0.1)' }}>
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  backgroundColor: '#0b4e9d',
                  width: currentStep === 1 ? '50%' : '100%'
                }}
              />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: '#0b4e9d' }}>
            {currentStep === 1 ? 'Book Your Interview' : 'Interview Questions'}
          </h1>
          <p className="text-lg mb-8 opacity-70" style={{ color: '#0b4e9d' }}>
            {currentStep === 1
              ? 'Tell us about the interview you\'d like to schedule.'
              : 'Choose a theme or create custom questions for the interview.'}
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-2xl border-2 text-red-700" style={{ backgroundColor: '#FEE', borderColor: '#FF5E33' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1: Background Information */}
            {currentStep === 1 && (
              <>
            {/* Your Information */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#0b4e9d' }}>Your Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#0b4e9d' }}>
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
                  <label className="block text-sm font-medium mb-2" style={{ color: '#0b4e9d' }}>
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
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#0b4e9d' }}>Interview Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#0b4e9d' }}>
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
                  <label className="block text-sm font-medium mb-2" style={{ color: '#0b4e9d' }}>
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
                  <label className="block text-sm font-medium mb-2" style={{ color: '#0b4e9d' }}>
                    Select Your Package *
                  </label>
                  <select
                    {...register('length_minutes', { valueAsNumber: true })}
                    className="w-full px-4 py-3 border-2 rounded-2xl focus:outline-none focus:border-opacity-100 transition"
                    style={{ borderColor: 'rgba(26, 0, 137, 0.2)', backgroundColor: '#FEFEFE' }}
                  >
                    <option value={30}>Dearly Essential - $99 - Interview with edited audio</option>
                    <option value={60}>Dearly Gift - $139 - Essential + transcript + mini bio</option>
                    <option value={90}>Dearly Legacy - $199 - Gift + free family interview + e-book access</option>
                  </select>
                  {errors.length_minutes && (
                    <p className="mt-1 text-sm" style={{ color: '#FF5E33' }}>{errors.length_minutes.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#0b4e9d' }}>
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

            {/* Validation Error for Step 1 */}
            {validationError && (
              <div className="text-sm text-red-700 text-center py-2">
                {validationError}
              </div>
            )}

            {/* Next Button for Step 1 */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleNextStep}
                className="px-8 py-4 rounded-full text-white font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 text-lg"
                style={{ backgroundColor: '#0b4e9d' }}
              >
                Continue to Questions →
              </button>
            </div>
            </>
            )}

            {/* Step 2: Questions */}
            {currentStep === 2 && (
              <>
            <div>
              {/* Theme Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3" style={{ color: '#0b4e9d' }}>
                  Select Interview Theme
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleThemeChange('life-story')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 hover:shadow-lg ${
                      selectedTheme === 'life-story' ? 'border-opacity-100 shadow-md' : 'border-opacity-20'
                    }`}
                    style={{
                      borderColor: '#0b4e9d',
                      backgroundColor: selectedTheme === 'life-story' ? 'rgba(26, 0, 137, 0.05)' : '#FEFEFE'
                    }}
                  >
                    <div className="font-semibold mb-1" style={{ color: '#0b4e9d' }}>Life Story</div>
                    <div className="text-xs opacity-70" style={{ color: '#0b4e9d' }}>
                      Comprehensive questions about their life journey
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleThemeChange('life-advice')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 hover:shadow-lg ${
                      selectedTheme === 'life-advice' ? 'border-opacity-100 shadow-md' : 'border-opacity-20'
                    }`}
                    style={{
                      borderColor: '#0b4e9d',
                      backgroundColor: selectedTheme === 'life-advice' ? 'rgba(26, 0, 137, 0.05)' : '#FEFEFE'
                    }}
                  >
                    <div className="font-semibold mb-1" style={{ color: '#0b4e9d' }}>Life Advice</div>
                    <div className="text-xs opacity-70" style={{ color: '#0b4e9d' }}>
                      Wisdom, lessons learned, and guidance for future generations
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleThemeChange('family-stories')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 hover:shadow-lg ${
                      selectedTheme === 'family-stories' ? 'border-opacity-100 shadow-md' : 'border-opacity-20'
                    }`}
                    style={{
                      borderColor: '#0b4e9d',
                      backgroundColor: selectedTheme === 'family-stories' ? 'rgba(26, 0, 137, 0.05)' : '#FEFEFE'
                    }}
                  >
                    <div className="font-semibold mb-1" style={{ color: '#0b4e9d' }}>Family Stories</div>
                    <div className="text-xs opacity-70" style={{ color: '#0b4e9d' }}>
                      Family history, traditions, and memorable moments
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleThemeChange('hobbies-interests')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 hover:shadow-lg ${
                      selectedTheme === 'hobbies-interests' ? 'border-opacity-100 shadow-md' : 'border-opacity-20'
                    }`}
                    style={{
                      borderColor: '#0b4e9d',
                      backgroundColor: selectedTheme === 'hobbies-interests' ? 'rgba(26, 0, 137, 0.05)' : '#FEFEFE'
                    }}
                  >
                    <div className="font-semibold mb-1" style={{ color: '#0b4e9d' }}>Hobbies & Interests</div>
                    <div className="text-xs opacity-70" style={{ color: '#0b4e9d' }}>
                      Passions, skills, and meaningful experiences
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleThemeChange('')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 hover:shadow-lg md:col-span-2 ${
                      selectedTheme === '' ? 'border-opacity-100 shadow-md' : 'border-opacity-20'
                    }`}
                    style={{
                      borderColor: '#0b4e9d',
                      backgroundColor: selectedTheme === '' ? 'rgba(26, 0, 137, 0.05)' : '#FEFEFE'
                    }}
                  >
                    <div className="font-semibold mb-1" style={{ color: '#0b4e9d' }}>Custom Questions</div>
                    <div className="text-xs opacity-70" style={{ color: '#0b4e9d' }}>
                      Create your own personalized questions
                    </div>
                  </button>
                </div>
              </div>

              {selectedTheme && (
                <div className="mb-4 p-4 rounded-2xl" style={{ backgroundColor: 'rgba(183, 207, 63, 0.15)' }}>
                  <p className="text-sm font-medium" style={{ color: '#0b4e9d' }}>
                    ✓ 10 questions loaded. Feel free to edit or add more below!
                  </p>
                </div>
              )}

              {/* Question Limit Indicator */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold" style={{ color: '#0b4e9d' }}>
                  Your Questions
                </h3>
                <span className="text-sm font-medium" style={{
                  color: fields.length > 12 ? '#FF5E33' : '#0b4e9d'
                }}>
                  {fields.length} / 12 questions
                  {fields.length > 12 && (
                    <span className="block text-xs text-red-600 mt-1">
                      Maximum 12 recommended
                    </span>
                  )}
                </span>
              </div>
              <p className="text-sm opacity-70 mb-4" style={{ color: '#0b4e9d' }}>
                Select up to 12 questions for your interview. You can customize or remove any pre-populated questions.
              </p>

              <div className="space-y-3 md:space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id}>
                    {/* Mobile: Label and icon on top */}
                    <div className="flex items-center justify-between mb-2 md:hidden">
                      <label className="block text-sm font-medium" style={{ color: '#0b4e9d' }}>
                        Question {index + 1}
                      </label>
                      {fields.length > 3 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="p-2 transition hover:opacity-70"
                          aria-label="Remove question"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF5E33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Desktop: Horizontal layout */}
                    <div className="hidden md:flex md:items-start md:gap-3">
                      <label className="block text-sm font-medium pt-3" style={{ color: '#0b4e9d' }}>
                        Question {index + 1}
                      </label>
                      <div className="flex-1">
                        <textarea
                          {...register(`questions.${index}.text`)}
                          rows={3}
                          className="w-full px-3 py-2 border-2 rounded-2xl focus:outline-none focus:border-opacity-100 transition resize-y overflow-hidden"
                          style={{ borderColor: 'rgba(26, 0, 137, 0.2)', backgroundColor: '#FEFEFE' }}
                          placeholder={`Enter question ${index + 1}...`}
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
                          className="px-4 py-2 rounded-2xl transition hover:opacity-70"
                          style={{ color: '#FF5E33', backgroundColor: 'rgba(255, 94, 51, 0.1)' }}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {/* Mobile: Full width textarea */}
                    <div className="md:hidden">
                      <textarea
                        {...register(`questions.${index}.text`)}
                        rows={3}
                        className="w-full px-3 py-2 border-2 rounded-2xl focus:outline-none focus:border-opacity-100 transition resize-y overflow-hidden"
                        style={{ borderColor: 'rgba(26, 0, 137, 0.2)', backgroundColor: '#FEFEFE' }}
                        placeholder={`Enter question ${index + 1}...`}
                      />
                      {errors.questions?.[index]?.text && (
                        <p className="mt-1 text-sm" style={{ color: '#FF5E33' }}>
                          {errors.questions[index]?.text?.message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {errors.questions && typeof errors.questions.message === 'string' && (
                <p className="mt-2 text-sm" style={{ color: '#FF5E33' }}>{errors.questions.message}</p>
              )}

              {fields.length < 12 && (
                <button
                  type="button"
                  onClick={() => append({ id: Date.now().toString(), text: '' })}
                  className="mt-3 text-sm font-medium hover:opacity-70 transition"
                  style={{ color: '#0b4e9d' }}
                >
                  + Add Another Question
                </button>
              )}
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#0b4e9d' }}>
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
              <h3 className="font-bold text-xl mb-4" style={{ color: '#0b4e9d' }}>Order Summary</h3>

              {/* Package Info */}
              <div className="mb-4 pb-4 border-b" style={{ borderColor: 'rgba(11, 78, 157, 0.2)' }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-lg" style={{ color: '#0b4e9d' }}>
                      Dearly {getPackageName()}
                    </p>
                    <p className="text-sm opacity-70" style={{ color: '#0b4e9d' }}>
                      {getPackageDescription()}
                    </p>
                  </div>
                  <span className="text-2xl font-bold font-serif flex-shrink-0 ml-4" style={{ color: '#0b4e9d' }}>
                    {getPrice()}
                  </span>
                </div>
              </div>

              {/* Interview Details */}
              <div className="space-y-2">
                <div>
                  <p className="text-xs uppercase tracking-wide opacity-60 mb-1" style={{ color: '#0b4e9d' }}>
                    Interviewee
                  </p>
                  <p className="font-medium" style={{ color: '#0b4e9d' }}>
                    {watch('interviewee_name') || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide opacity-60 mb-1" style={{ color: '#0b4e9d' }}>
                    Relationship
                  </p>
                  <p className="font-medium" style={{ color: '#0b4e9d' }}>
                    {watch('relationship_to_interviewee') || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button for Step 2 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-white py-4 rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              style={{ backgroundColor: '#0b4e9d' }}
            >
              {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
            </button>
            </>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

