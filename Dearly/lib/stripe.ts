import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
})

export const PRICE_30_MIN = 15000 // $150 in cents
export const PRICE_60_MIN = 25000 // $250 in cents
export const PRICE_90_MIN = 35000 // $350 in cents

export function getPriceForLength(minutes: 30 | 60 | 90): number {
  switch (minutes) {
    case 30:
      return PRICE_30_MIN
    case 60:
      return PRICE_60_MIN
    case 90:
      return PRICE_90_MIN
  }
}

