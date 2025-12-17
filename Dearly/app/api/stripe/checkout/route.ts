import { NextRequest, NextResponse } from 'next/server'
import { stripe, getPriceForLength } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name,
      email,
      length_minutes,
      questionnaire,
      slot_id,
      timezone
    } = body

    if (!name || !email || !length_minutes || !questionnaire) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const amount = getPriceForLength(length_minutes as 30 | 60 | 90)

    // Get package details based on length
    const getPackageDetails = (minutes: number) => {
      switch (minutes) {
        case 30:
          return {
            name: 'Dearly Essential',
            description: '30-minute guided audio interview with professional editing and music'
          }
        case 60:
          return {
            name: 'Dearly Gift',
            description: '60-minute guided audio interview with professional editing, music, full polished transcript, and mini biography'
          }
        case 90:
          return {
            name: 'Dearly Legacy',
            description: '90-minute guided audio interview with professional editing, music, full polished transcript, mini biography, plus a free interview for another family member'
          }
        default:
          return {
            name: 'Dearly Interview',
            description: 'Professional interview session'
          }
      }
    }

    const packageDetails = getPackageDetails(length_minutes)

    // Encode the full questionnaire as base64 to pass in URL
    const questionnaireEncoded = Buffer.from(JSON.stringify(questionnaire)).toString('base64url')

    // Build success URL with optional booking parameters
    let successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}&q=${questionnaireEncoded}`

    if (slot_id) {
      successUrl += `&slot_id=${slot_id}`
    }

    if (timezone) {
      successUrl += `&timezone=${encodeURIComponent(timezone)}`
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${packageDetails.name} - Interview with ${questionnaire.interviewee_name}`,
              description: packageDetails.description,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: slot_id
        ? `${process.env.NEXT_PUBLIC_APP_URL}/booking/session`
        : `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
      customer_email: email,
      metadata: {
        customer_name: name,
        customer_email: email,
        length_minutes: length_minutes.toString(),
        interviewee_name: questionnaire.interviewee_name,
        ...(slot_id && { slot_id }),
        ...(timezone && { timezone }),
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

