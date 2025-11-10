# Dearly - MVP Application

A professional interview booking and recording platform built with Next.js 15, Supabase, Stripe, and Calendly.

## Features

- **Customer-Facing**
  - Beautiful landing page with service information
  - Interactive questionnaire and checkout flow
  - Stripe payment integration
  - Calendly scheduling integration
  - Automated email notifications

- **Admin Dashboard**
  - Session management with status tracking
  - Customer and questionnaire details
  - Recording upload and delivery
  - Automated email delivery to customers

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe Checkout
- **Scheduling**: Calendly API
- **Email**: Resend
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Stripe account (test mode for development)
- Calendly account with API access
- Resend account for email delivery

## Setup Instructions

### 1. Clone and Install

```bash
cd tell-me-more
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Calendly
CALENDLY_API_TOKEN=your_calendly_token
CALENDLY_WEBHOOK_SIGNING_KEY=your_signing_key
NEXT_PUBLIC_CALENDLY_LINK=https://calendly.com/your-link

# Resend
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
INTERNAL_TEAM_EMAIL=team@dearly.com
```

### 3. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration file: `supabase/migrations/001_initial_schema.sql`
4. Verify all tables are created with proper RLS policies

### 4. Create Admin User

In Supabase:

1. Go to Authentication → Users
2. Create a new user with email/password
3. Go to Table Editor → users table
4. Add a row with:
   - id: (copy from auth.users)
   - name: Your Name
   - email: (same as auth user)
   - role: 'admin'

### 5. Stripe Setup

1. Get your API keys from Stripe Dashboard
2. Install Stripe CLI for webhook testing:
   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
3. Copy the webhook signing secret to `.env.local`

### 6. Calendly Setup

1. Get your API token from Calendly Settings → Integrations
2. Create a webhook subscription pointing to your app:
   ```
   POST https://api.calendly.com/webhook_subscriptions
   ```
3. Subscribe to `invitee.created` and `invitee.canceled` events

### 7. Resend Setup

1. Sign up at resend.com
2. Add and verify your domain
3. Get your API key from API Keys section
4. Update the "from" address in `lib/resend.ts` to match your verified domain

### 8. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
tell-me-more/
├── app/
│   ├── actions/              # Server actions
│   │   └── sessions.ts
│   ├── api/                  # API routes
│   │   ├── calendly/
│   │   │   └── webhook/
│   │   └── stripe/
│   │       ├── checkout/
│   │       └── webhook/
│   ├── checkout/             # Customer checkout page
│   ├── dashboard/            # Admin dashboard
│   │   ├── sessions/[id]/   # Session detail page
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── login/                # Admin login
│   ├── success/              # Payment success page
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Client-side Supabase
│   │   └── server.ts         # Server-side Supabase
│   ├── auth.ts               # Authentication utilities
│   ├── resend.ts             # Email functions
│   ├── stripe.ts             # Stripe configuration
│   └── validations.ts        # Zod schemas
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── types/
│   └── database.ts           # TypeScript types
├── middleware.ts             # Route protection
└── next.config.ts
```

## Usage

### Customer Flow

1. Visit landing page at `/`
2. Click "Book Your Interview"
3. Fill out questionnaire with interview details and questions
4. Complete payment via Stripe Checkout
5. Receive email with Calendly scheduling link
6. Book interview time via Calendly
7. Receive recording link via email after interview

### Admin Flow

1. Login at `/login`
2. View all sessions in dashboard
3. Filter by status (paid, scheduled, completed, delivered)
4. Click session to view details
5. Upload recording URL when ready
6. System automatically emails customer and updates status

## Webhook Endpoints

### Stripe Webhook
- **URL**: `https://your-domain.com/api/stripe/webhook`
- **Events**: `checkout.session.completed`, `payment_intent.payment_failed`

### Calendly Webhook
- **URL**: `https://your-domain.com/api/calendly/webhook`
- **Events**: `invitee.created`, `invitee.canceled`

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy

### Post-Deployment

1. Update webhook URLs in Stripe and Calendly to production URLs
2. Update `NEXT_PUBLIC_APP_URL` to production domain
3. Test payment flow end-to-end
4. Verify email delivery

## Testing

### Test Stripe Locally

```bash
# Terminal 1: Run dev server
npm run dev

# Terminal 2: Forward webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Terminal 3: Trigger test payment
stripe trigger checkout.session.completed
```

### Test Cards

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## Troubleshooting

### Webhook Issues

- Verify webhook signing secrets are correct
- Check webhook endpoint logs in Stripe/Calendly dashboards
- Ensure webhook URLs are publicly accessible

### Authentication Issues

- Verify Supabase user exists in both auth.users and public.users
- Check user role is set to 'admin' or 'interviewer'
- Clear browser cookies and try again

### Email Issues

- Verify Resend domain is verified
- Check API key is correct
- Review Resend dashboard for delivery logs

## Database Schema

### Tables

- **users**: Customer and admin user accounts
- **sessions**: Interview session records
- **payments**: Payment transaction records
- **questionnaires**: Interview questions and details

See `supabase/migrations/001_initial_schema.sql` for full schema.

## Security

- Row Level Security (RLS) enabled on all tables
- Webhook signature verification for Stripe and Calendly
- Protected admin routes with middleware
- Environment variables for sensitive keys
- Service role key only used server-side

## Future Enhancements

- Built-in audio recorder
- Customer account dashboard
- Multiple session packages
- AI-generated transcripts
- Gift purchase flow
- Custom branding options

## Support

For issues or questions, contact: team@dearly.com

## License

Proprietary - All rights reserved
