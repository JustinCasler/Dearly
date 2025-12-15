import { NextRequest, NextResponse } from 'next/server'
import { stripe, getPriceForLength } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name,
      email,
      length_minutes,
      questionnaire
    } = body

    if (!name || !email || !length_minutes || !questionnaire) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const amount = getPriceForLength(length_minutes as 30 | 60 | 90)

    // Encode the full questionnaire as base64 to pass in URL
    const questionnaireEncoded = Buffer.from(JSON.stringify(questionnaire)).toString('base64url')

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Dearly Interview - ${length_minutes} minutes`,
              description: `Professional interview session with ${questionnaire.interviewee_name}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}&q=${questionnaireEncoded}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
      customer_email: email,
      metadata: {
        customer_name: name,
        customer_email: email,
        length_minutes: length_minutes.toString(),
        interviewee_name: questionnaire.interviewee_name,
      },
      // Customize the checkout page appearance
      custom_text: {
        submit: {
          message: 'Secure your family legacy today',
        },
      },
      // Add billing address collection
      billing_address_collection: 'auto',
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

