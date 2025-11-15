import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey
    })
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

export const supabase = getSupabaseClient()

// Also export a function to create a new client instance
export function createClient() {
  return getSupabaseClient()
}

