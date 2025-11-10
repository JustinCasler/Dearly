import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/server'
import { sendEmail, getPaymentSuccessEmail } from '@/lib/resend'
import Stripe from 'stripe'

/**
 * Manual endpoint to process a Stripe checkout session
 * Useful for local development when webhooks aren't configured
 * 
 * Usage: POST /api/stripe/process-session
 * Body: { sessionId: "cs_test_..." }
 */
export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
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
    const questionnaire = JSON.parse(metadata.questionnaire)

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
    } as any)

    // Send confirmation email with Calendly link
    const calendlyLink = process.env.NEXT_PUBLIC_CALENDLY_LINK
    
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured! Email will not be sent.')
    }
    
    const emailResult = await sendEmail({
      to: customerEmail,
      subject: 'Thank you for your purchase - Schedule your interview',
      html: getPaymentSuccessEmail(customerName, calendlyLink || 'https://calendly.com'),
    })
    
    if (!emailResult.success) {
      console.error('Failed to send email to:', customerEmail, emailResult.error)
    }

    return NextResponse.json({
      success: true,
      message: 'Session processed successfully',
      sessionId: (sessionRecord as any).id,
      emailSent: emailResult.success,
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

