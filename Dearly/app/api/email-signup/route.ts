import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { sendEmail, getEmailSignupConfirmationEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const cleanEmail = email.toLowerCase().trim()

    // Insert email into database
    const { data, error } = await (supabaseAdmin as any)
      .from('email_signups')
      .insert([{ email: cleanEmail }])
      .select()
      .single()

    if (error) {
      // Check if email already exists
      if (error.code === '23505') {
        return NextResponse.json(
          { message: 'Email already registered' },
          { status: 200 }
        )
      }

      console.error('Error inserting email:', error)
      return NextResponse.json(
        { error: 'Failed to save email' },
        { status: 500 }
      )
    }

    // Send confirmation email
    const emailResult = await sendEmail({
      to: cleanEmail,
      subject: 'Welcome to Dearly!',
      html: getEmailSignupConfirmationEmail(),
    })

    if (!emailResult.success) {
      console.error('Failed to send confirmation email:', emailResult.error)
      // Don't fail the request if email fails - the signup was successful
    }

    return NextResponse.json(
      { message: 'Successfully subscribed!', data },
      { status: 201 }
    )
  } catch (error) {
    console.error('Email signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
