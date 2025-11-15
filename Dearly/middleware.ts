import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
  // Create response object that we'll modify
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          // Update both request and response cookies
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          // Update both request and response cookies
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // IMPORTANT: Call getUser() to trigger the cookie refresh
  // This ensures the session is properly validated
  const { data: { user }, error } = await supabase.auth.getUser()

  // Protect admin routes (dashboard)
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (error || !user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Use admin client to bypass RLS and avoid infinite recursion
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Check if user has admin or interviewer role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (profile.role !== 'admin' && profile.role !== 'interviewer') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protect booking routes - verify session exists and is paid
  // Note: /booking/manage/[token] and /booking/confirmed are public
  if (request.nextUrl.pathname.match(/^\/booking\/[a-f0-9-]{36}$/)) {
    const sessionId = request.nextUrl.pathname.split('/')[2]

    // Verify the session exists and is in 'paid' status
    const { data: session, error } = await supabase
      .from('sessions')
      .select('id, status')
      .eq('id', sessionId)
      .single()

    // Only redirect if we're sure the session doesn't exist or isn't paid
    // Don't redirect on database errors (let the page handle it)
    if (!error && (!session || session.status !== 'paid')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  // Only protect /dashboard routes and specific /booking/[uuid] routes
  // Exclude /booking/manage and /booking/confirmed (they're public)
  matcher: [
    '/dashboard/:path*',
    '/booking/:id([a-f0-9-]{36})'
  ]
}

