export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'customer' | 'interviewer' | 'admin'
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role: 'customer' | 'interviewer' | 'admin'
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'customer' | 'interviewer' | 'admin'
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          status: 'paid' | 'scheduled' | 'completed' | 'delivered'
          appointment_id: string | null
          appointment_start_time: string | null
          appointment_end_time: string | null
          interviewer_id: string | null
          amount: number
          recording_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status: 'paid' | 'scheduled' | 'completed' | 'delivered'
          appointment_id?: string | null
          appointment_start_time?: string | null
          appointment_end_time?: string | null
          interviewer_id?: string | null
          amount: number
          recording_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: 'paid' | 'scheduled' | 'completed' | 'delivered'
          appointment_id?: string | null
          appointment_start_time?: string | null
          appointment_end_time?: string | null
          interviewer_id?: string | null
          amount?: number
          recording_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      availability_slots: {
        Row: {
          id: string
          start_time: string
          end_time: string
          is_booked: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          start_time: string
          end_time: string
          is_booked?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          start_time?: string
          end_time?: string
          is_booked?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          session_id: string
          user_id: string
          availability_slot_id: string | null
          interviewer_id: string | null
          start_time: string
          end_time: string
          status: 'scheduled' | 'cancelled' | 'completed' | 'no_show'
          booking_token: string
          notes: string | null
          meeting_url: string | null
          meeting_password: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          availability_slot_id?: string | null
          interviewer_id?: string | null
          start_time: string
          end_time: string
          status?: 'scheduled' | 'cancelled' | 'completed' | 'no_show'
          booking_token: string
          notes?: string | null
          meeting_url?: string | null
          meeting_password?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          availability_slot_id?: string | null
          interviewer_id?: string | null
          start_time?: string
          end_time?: string
          status?: 'scheduled' | 'cancelled' | 'completed' | 'no_show'
          booking_token?: string
          notes?: string | null
          meeting_url?: string | null
          meeting_password?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          stripe_payment_intent_id: string
          user_id: string
          amount: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          stripe_payment_intent_id: string
          user_id: string
          amount: number
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          stripe_payment_intent_id?: string
          user_id?: string
          amount?: number
          status?: string
          created_at?: string
        }
      }
      questionnaires: {
        Row: {
          id: string
          session_id: string
          user_id: string
          relationship_to_interviewee: string
          interviewee_name: string
          questions: Json
          length_minutes: 30 | 60 | 90
          medium: 'google_meet' | 'zoom' | 'phone'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          relationship_to_interviewee: string
          interviewee_name: string
          questions: Json
          length_minutes: 30 | 60 | 90
          medium: 'google_meet' | 'zoom' | 'phone'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          relationship_to_interviewee?: string
          interviewee_name?: string
          questions?: Json
          length_minutes?: 30 | 60 | 90
          medium?: 'google_meet' | 'zoom' | 'phone'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type User = Database['public']['Tables']['users']['Row']
export type Session = Database['public']['Tables']['sessions']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type Questionnaire = Database['public']['Tables']['questionnaires']['Row']
export type AvailabilitySlot = Database['public']['Tables']['availability_slots']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']

