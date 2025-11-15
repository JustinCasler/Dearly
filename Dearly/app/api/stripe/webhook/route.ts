import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    console.error('No signature provided in webhook request')
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured!')
      throw new Error('STRIPE_WEBHOOK_SECRET missing')
    }

    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      
      try {
        if (!session.metadata) {
          throw new Error('No metadata found in checkout session')
        }
        
        const metadata = session.metadata
        const customerName = metadata.customer_name
        const customerEmail = metadata.customer_email
        const lengthMinutes = parseInt(metadata.length_minutes)

        // Parse questionnaire - handle both old format and new compressed format
        let questionnaire
        if (metadata.questionnaire) {
          const parsed = JSON.parse(metadata.questionnaire)
          // Check if it's compressed format (has 'r', 'i', 'q' keys)
          if ('r' in parsed && 'i' in parsed && 'q' in parsed) {
            // Decompress
            questionnaire = {
              relationship_to_interviewee: parsed.r,
              interviewee_name: parsed.i,
              questions: parsed.q.map((text: string, index: number) => ({
                id: `q-${index}`,
                text
              })),
              medium: parsed.m,
              notes: parsed.n
            }
          } else {
            // Old format, use as-is
            questionnaire = parsed
          }
        } else {
          throw new Error('No questionnaire data in metadata')
        }

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

        if (sessionError) throw sessionError

        // Create payment record
        await supabaseAdmin.from('payments').insert({
          stripe_payment_intent_id: session.payment_intent as string,
          user_id: userId,
          amount: session.amount_total!,
          status: 'succeeded',
        } as any)

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

        // Payment successful - user will receive email after booking their appointment
        console.log('Payment processed successfully for:', customerEmail)
        console.log('Booking link:', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/booking/${(sessionRecord as any).id}`)
      } catch (error) {
        console.error('Error processing checkout session:', error)
        return NextResponse.json(
          { error: 'Failed to process payment' },
          { status: 500 }
        )
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.error('Payment failed:', paymentIntent.id)
      // Handle payment failure (optional: send notification email)
      break
    }

    default:
      // Unhandled event type
      break
  }

  return NextResponse.json({ received: true })
}

