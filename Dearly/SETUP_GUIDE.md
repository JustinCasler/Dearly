# Dearly - Quick Setup Guide

## Step-by-Step Setup

### 1. Supabase Setup (15 minutes)

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Save your project URL and keys

2. **Run Database Migration**
   - Go to SQL Editor in Supabase dashboard
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and run the SQL
   - Verify tables are created in Table Editor

3. **Create Admin User**
   - Go to Authentication → Users
   - Click "Add user" → Create new user
   - Use email: `admin@dearly.com` (or your email)
   - Set a password
   - Copy the user ID
   - Go to Table Editor → users table
   - Insert new row:
     ```
     id: [paste user ID]
     name: Admin User
     email: admin@dearly.com
     role: admin
     ```

4. **Get API Keys**
   - Go to Settings → API
   - Copy:
     - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
     - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### 2. Stripe Setup (10 minutes)

1. **Get API Keys**
   - Go to [stripe.com/dashboard](https://dashboard.stripe.com)
   - Enable Test Mode (toggle in top right)
   - Go to Developers → API keys
   - Copy:
     - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - Secret key → `STRIPE_SECRET_KEY`

2. **Setup Webhook (for local development)**
   - Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
   - Login: `stripe login`
   - Forward webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
   - Copy webhook signing secret → `STRIPE_WEBHOOK_SECRET`

3. **Setup Webhook (for production)**
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `payment_intent.payment_failed`
   - Copy signing secret → `STRIPE_WEBHOOK_SECRET`

### 3. Calendly Setup (10 minutes)

1. **Get API Token**
   - Go to [calendly.com](https://calendly.com)
   - Settings → Integrations → API & Webhooks
   - Generate Personal Access Token
   - Copy token → `CALENDLY_API_TOKEN`

2. **Get Scheduling Link**
   - Create an event type (e.g., "Dearly Interview")
   - Copy the scheduling link
   - Add to env → `NEXT_PUBLIC_CALENDLY_LINK`

3. **Setup Webhook**
   - Use Calendly API or their dashboard to create webhook
   - Webhook URL: `https://your-domain.com/api/calendly/webhook`
   - Events: `invitee.created`, `invitee.canceled`
   - Copy signing key → `CALENDLY_WEBHOOK_SIGNING_KEY`

   Example API call:
   ```bash
   curl -X POST https://api.calendly.com/webhook_subscriptions \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://your-domain.com/api/calendly/webhook",
       "events": ["invitee.created", "invitee.canceled"],
       "organization": "YOUR_ORG_URI",
       "scope": "organization"
     }'
   ```

### 4. Resend Setup (5 minutes)

1. **Create Account**
   - Go to [resend.com](https://resend.com)
   - Sign up for free account

2. **Add Domain (recommended for production)**
   - Go to Domains → Add Domain
   - Follow DNS setup instructions
   - Verify domain

3. **Get API Key**
   - Go to API Keys
   - Create new key
   - Copy key → `RESEND_API_KEY`

4. **Update Email Address**
   - Edit `lib/resend.ts`
   - Change `from: 'Dearly <noreply@dearly.com>'`
   - Use your verified domain: `from: 'Dearly <noreply@yourdomain.com>'`

### 5. Environment Variables

Create `.env.local` file in project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Calendly
CALENDLY_API_TOKEN=eyJraWQiOiIxY2UxZTEzNjE3ZGNm...
CALENDLY_WEBHOOK_SIGNING_KEY=your_signing_key
NEXT_PUBLIC_CALENDLY_LINK=https://calendly.com/your-name/interview

# Resend
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
INTERNAL_TEAM_EMAIL=team@dearly.com
```

### 6. Run the App

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 7. Test the Flow

1. **Test Customer Flow**
   - Visit homepage
   - Click "Book Your Interview"
   - Fill out questionnaire
   - Use test card: `4242 4242 4242 4242`
   - Check email for Calendly link

2. **Test Admin Flow**
   - Go to `/login`
   - Login with admin credentials
   - View session in dashboard
   - Upload recording URL
   - Verify customer receives email

## Common Issues

### "Invalid API key" errors
- Double-check all keys are copied correctly
- Ensure no extra spaces or line breaks
- Verify you're using test mode keys for development

### Webhook not receiving events
- For local dev: Ensure Stripe CLI is running
- Check webhook signing secrets match
- Verify webhook URLs are correct

### Authentication issues
- Verify admin user exists in both `auth.users` and `public.users` tables
- Check role is set to 'admin' or 'interviewer'
- Clear cookies and try again

### Email not sending
- Verify Resend API key is correct
- Check domain is verified (for production)
- Review Resend dashboard logs

## Production Deployment

1. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Add Environment Variables**
   - Go to Vercel dashboard → Settings → Environment Variables
   - Add all variables from `.env.local`
   - Update `NEXT_PUBLIC_APP_URL` to production domain

3. **Update Webhooks**
   - Update Stripe webhook URL to production
   - Update Calendly webhook URL to production
   - Get new webhook signing secrets

4. **Test Production**
   - Run test payment
   - Verify webhooks are working
   - Check email delivery

## Next Steps

- Customize branding and colors
- Add your own interview questions
- Set up custom domain
- Configure production email domain
- Add analytics tracking
- Set up error monitoring (e.g., Sentry)

## Support

Need help? Check the main README.md or contact team@dearly.com

