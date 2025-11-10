import { z } from 'zod'

export const questionnaireSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  relationship_to_interviewee: z.string().min(1, 'Please specify your relationship'),
  interviewee_name: z.string().min(2, 'Interviewee name must be at least 2 characters'),
  length_minutes: z.union([z.literal(30), z.literal(60), z.literal(90)]),
  medium: z.enum(['google_meet', 'zoom', 'phone']),
  questions: z.array(z.object({
    id: z.string(),
    text: z.string().min(5, 'Question must be at least 5 characters'),
  })).min(3, 'Please provide at least 3 questions').max(20, 'Maximum 20 questions allowed'),
  notes: z.string().optional(),
})

export type QuestionnaireFormData = z.infer<typeof questionnaireSchema>

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const recordingUploadSchema = z.object({
  recording_url: z.string().url('Please enter a valid URL'),
})

export type RecordingUploadFormData = z.infer<typeof recordingUploadSchema>

