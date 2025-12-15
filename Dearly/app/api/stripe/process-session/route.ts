import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/server'
import Stripe from 'stripe'
import crypto from 'crypto'

/**
 * Manual endpoint to process a Stripe checkout session
 * Useful for local development when webhooks aren't configured
 * 
 * Usage: POST /api/stripe/process-session
 * Body: { sessionId: "cs_test_..." }
 */
export async function POST(req: NextRequest) {
  try {
    const { sessionId, questionnaireEncoded, slotId, timezone } = await req.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    if (!questionnaireEncoded) {
      return NextResponse.json(
        { error: 'questionnaireEncoded is required' },
        { status: 400 }
      )
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    })

    // Only process if payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: `Payment status is ${session.payment_status}, not paid` },
        { status: 400 }
      )
    }

    // Check if already processed (look for existing payment with this payment intent)
    const paymentIntentId = typeof session.payment_intent === 'string' 
      ? session.payment_intent 
      : (session.payment_intent as Stripe.PaymentIntent)?.id

    if (paymentIntentId) {
      const { data: existingPayment } = await supabaseAdmin
        .from('payments')
        .select('id, user_id')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .single()

      if (existingPayment) {
        // Get the session for this payment
        const { data: sessions } = await supabaseAdmin
          .from('sessions')
          .select('id')
          .eq('user_id', (existingPayment as any).user_id)
          .eq('status', 'paid')
          .order('created_at', { ascending: false })
          .limit(1)
        
        const existingSession = sessions && sessions.length > 0 ? sessions[0] : null

        return NextResponse.json({
          success: true,
          message: 'Session already processed',
          sessionId: existingSession?.id,
        })
      }
    }

    if (!session.metadata) {
      throw new Error('No metadata found in checkout session')
    }

    const metadata = session.metadata
    const customerName = metadata.customer_name
    const customerEmail = metadata.customer_email
    const lengthMinutes = parseInt(metadata.length_minutes)

    // Decode questionnaire from URL parameter
    const questionnaire = JSON.parse(
      Buffer.from(questionnaireEncoded, 'base64url').toString('utf-8')
    )

    // Create or get user
    let { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', customerEmail)
      .single()

    let userId: string

    if (existingUser) {
      userId = (existingUser as any).id
      // Update stripe_customer_id if needed
      if (session.customer && !(existingUser as any).stripe_customer_id) {
        await (supabaseAdmin
          .from('users')
          .update as any)({ stripe_customer_id: session.customer as string })
          .eq('id', userId)
      }
    } else {
      const { data: newUser, error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          name: customerName,
          email: customerEmail,
          role: 'customer',
          stripe_customer_id: session.customer as string,
        } as any)
        .select()
        .single()

      if (userError) throw userError
      userId = (newUser as any).id
    }

    // Create session record
    const { data: sessionRecord, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .insert({
        user_id: userId,
        status: 'paid',
        amount: session.amount_total!,
      } as any)
      .select()
      .single()

    if (sessionError) {
      console.error('Error creating session:', sessionError)
      throw sessionError
    }

    // Create payment record (reuse paymentIntentId from earlier)
    if (paymentIntentId) {
      await supabaseAdmin.from('payments').insert({
        stripe_payment_intent_id: paymentIntentId,
        user_id: userId,
        amount: session.amount_total!,
        status: 'succeeded',
      } as any)
    }

    // Determine package name based on length
    const packageName = lengthMinutes === 30 ? 'Essential' : lengthMinutes === 90 ? 'Legacy' : 'Gift'

    // Create questionnaire record
    await supabaseAdmin.from('questionnaires').insert({
      session_id: (sessionRecord as any).id,
      user_id: userId,
      relationship_to_interviewee: questionnaire.relationship_to_interviewee,
      interviewee_name: questionnaire.interviewee_name,
      questions: questionnaire.questions,
      length_minutes: lengthMinutes,
      medium: questionnaire.medium,
      notes: questionnaire.notes || null,
      package_name: packageName,
    } as any)

    // If slot was selected, create the appointment and generate tokens
    let managementToken = null
    let bookingToken = null

    if (slotId) {
      // Get the availability slot details to get start_time and end_time
      const { data: slot, error: slotError } = await supabaseAdmin
        .from('availability_slots')
        .select('start_time, end_time')
        .eq('id', slotId)
        .single()

      if (slotError || !slot) {
        console.error('Error fetching availability slot:', slotError)
        throw new Error('Availability slot not found')
      }

      // Generate booking token for appointment management
      bookingToken = crypto.randomBytes(32).toString('hex')

      // Create appointment
      const { data: appointment, error: appointmentError } = await supabaseAdmin
        .from('appointments')
        .insert({
          session_id: (sessionRecord as any).id,
          user_id: userId,
          availability_slot_id: slotId,
          start_time: (slot as any).start_time,
          end_time: (slot as any).end_time,
          status: 'scheduled',
          timezone: timezone || 'UTC',
          booking_token: bookingToken,
        } as any)
        .select()
        .single()

      if (appointmentError) {
        console.error('Error creating appointment:', appointmentError)
        throw appointmentError
      }

      // Update session status to scheduled
      await (supabaseAdmin.from('sessions').update as any)({
        status: 'scheduled',
      })
        .eq('id', (sessionRecord as any).id)

      // Mark availability slot as booked
      await (supabaseAdmin.from('availability_slots').update as any)({
        is_available: false,
      })
        .eq('id', slotId)

      // Generate listening token for management
      managementToken = crypto.randomBytes(32).toString('hex')

      await (supabaseAdmin as any)
        .from('listening_tokens')
        .insert({
          session_id: (sessionRecord as any).id,
          token: managementToken,
        })

      console.log('Appointment created successfully')
    }

    // Payment successful - user will be redirected to booking page or confirmation
    console.log('Payment processed successfully for:', customerEmail)
    if (!slotId) {
      console.log('Booking link:', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/booking/${(sessionRecord as any).id}`)
    } else {
      console.log('Appointment confirmed')
    }

    return NextResponse.json({
      success: true,
      message: 'Session processed successfully',
      sessionId: (sessionRecord as any).id,
      token: bookingToken || managementToken,
    })
  } catch (error: any) {
    console.error('Error processing session:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process session',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

