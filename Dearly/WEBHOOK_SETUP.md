# Stripe Webhook Setup Guide

## Problem: Webhooks Don't Work in Local Development

Stripe webhooks can't reach `localhost:3000` directly. This means when you complete a payment locally, the webhook that processes the payment and sends the email never fires.

## Solution 1: Manual Processing (Current Implementation)

The success page now automatically processes your session when you land on it. This means:

1. ✅ Complete checkout on Stripe
2. ✅ Get redirected to `/success?session_id=cs_test_...`
3. ✅ The page automatically calls `/api/stripe/process-session`
4. ✅ Your data is saved to Supabase
5. ✅ Email is sent (if Resend is configured)

**This works immediately - no setup needed!**

### For Your Existing Session

If you already completed checkout but nothing was saved, just visit:
```
http://localhost:3000/success?session_id=cs_test_a19pNkrjEbuAVKmqasSoUvuzgq7R8rUx1ZVMt7HHzwysJ2BLPW6QrWxG1e
```

The page will automatically process it now.

## Solution 2: Stripe CLI (For Production-Like Testing)

For production-like testing with real webhooks, use Stripe CLI:

### Install Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

### Login to Stripe CLI

```bash
stripe login
```

This will open your browser to authorize the CLI.

### Forward Webhooks to Local Server

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will:
1. Give you a webhook signing secret (starts with `whsec_`)
2. Forward all Stripe events to your local server
3. Show you all webhook events in real-time

### Update Your .env.local

Add the webhook secret from Stripe CLI:
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Test It

1. Start your dev server: `npm run dev`
2. In another terminal, run: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Complete a checkout
4. Watch the Stripe CLI terminal - you should see the webhook event
5. Check your server logs - you should see the webhook being processed

## Solution 3: Production Webhooks (Vercel)

When deployed to Vercel:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Developers → Webhooks
2. Click "Add endpoint"
3. Enter your Vercel URL: `https://your-app.vercel.app/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.payment_failed` (optional)
5. Copy the webhook signing secret
6. Add to Vercel environment variables: `STRIPE_WEBHOOK_SECRET`

## Debugging Webhooks

### Check Webhook Logs

**Local Development:**
- Check your terminal where `npm run dev` is running
- Look for logs starting with: `🔔 Webhook received`

**Production (Vercel):**
- Go to Vercel Dashboard → Your Project → Functions
- Click on `/api/stripe/webhook`
- View the logs

### Check Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Developers → Webhooks
2. Click on your webhook endpoint
3. View recent events
4. Click on an event to see:
   - Request payload
   - Response from your server
   - Any errors

### Common Issues

**"No signature provided"**
- Webhook isn't being called by Stripe
- Check if Stripe CLI is running (for local)
- Check if webhook endpoint is configured in Stripe Dashboard (for production)

**"Invalid signature"**
- `STRIPE_WEBHOOK_SECRET` is wrong
- For local: Use the secret from `stripe listen`
- For production: Use the secret from Stripe Dashboard

**"No metadata found"**
- Checkout session was created without metadata
- Check `/api/stripe/checkout` route to ensure metadata is being set

**Email not sent**
- Check if `RESEND_API_KEY` is configured
- Check webhook logs for email errors
- See `EMAIL_TROUBLESHOOTING.md`

## Current Status

✅ **Manual processing is enabled** - Works immediately for local testing
✅ **Webhook logging improved** - Better visibility into what's happening
⚠️ **Stripe CLI** - Optional, for production-like testing
⚠️ **Production webhooks** - Need to configure when deploying

## Next Steps

1. **For now**: Use the manual processing (already working)
2. **For testing**: Set up Stripe CLI if you want to test webhooks locally
3. **For production**: Configure webhooks in Stripe Dashboard when deploying

