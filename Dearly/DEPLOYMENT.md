# Deployment Guide

## Vercel Deployment (Recommended)

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- All environment variables ready

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Dearly MVP"
git branch -M main
git remote add origin https://github.com/yourusername/dearly.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `next build`
   - Output Directory: `.next`

### Step 3: Add Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
CALENDLY_API_TOKEN
CALENDLY_WEBHOOK_SIGNING_KEY
NEXT_PUBLIC_CALENDLY_LINK
RESEND_API_KEY
NEXT_PUBLIC_APP_URL (use your Vercel domain)
INTERNAL_TEAM_EMAIL
```

### Step 4: Deploy

Click "Deploy" - Vercel will build and deploy your app.

### Step 5: Update Webhooks

#### Stripe Webhook
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-vercel-domain.vercel.app/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `payment_intent.payment_failed`
4. Copy new signing secret
5. Update `STRIPE_WEBHOOK_SECRET` in Vercel

#### Calendly Webhook
1. Update webhook URL to: `https://your-vercel-domain.vercel.app/api/calendly/webhook`
2. Use Calendly API or dashboard to update
3. Get new signing key if needed

### Step 6: Test Production

1. Visit your Vercel URL
2. Complete a test purchase
3. Verify webhooks are working
4. Check email delivery
5. Test admin dashboard

## Custom Domain Setup

### Step 1: Add Domain in Vercel
1. Go to Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Step 2: Update Environment Variables
1. Update `NEXT_PUBLIC_APP_URL` to your custom domain
2. Redeploy

### Step 3: Update Webhooks
1. Update Stripe webhook URL to use custom domain
2. Update Calendly webhook URL to use custom domain

### Step 4: Update Email Domain
1. Verify your domain in Resend
2. Update `lib/resend.ts` to use your domain
3. Redeploy

## Environment-Specific Configuration

### Development
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Use Stripe test keys
# Use Stripe CLI for webhooks
```

### Staging
```env
NEXT_PUBLIC_APP_URL=https://staging.yourdomain.com
# Use Stripe test keys
# Configure staging webhooks
```

### Production
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
# Use Stripe live keys
# Configure production webhooks
```

## Post-Deployment Checklist

- [ ] All environment variables set
- [ ] Stripe webhooks configured and tested
- [ ] Calendly webhooks configured and tested
- [ ] Email delivery working
- [ ] Admin login working
- [ ] Test payment flow end-to-end
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Error monitoring setup (optional)
- [ ] Analytics configured (optional)

## Monitoring & Maintenance

### Vercel Logs
- View deployment logs in Vercel dashboard
- Check function logs for API routes
- Monitor build times and errors

### Stripe Dashboard
- Monitor payments and refunds
- Check webhook delivery status
- Review failed payments

### Calendly Dashboard
- Monitor scheduled bookings
- Check webhook delivery

### Resend Dashboard
- Monitor email delivery
- Check bounce rates
- Review failed sends

## Troubleshooting

### Deployment Fails
- Check build logs in Vercel
- Verify all dependencies are in package.json
- Ensure TypeScript types are correct

### Webhooks Not Working
- Verify webhook URLs are correct
- Check signing secrets match
- Review function logs in Vercel
- Test webhook endpoints manually

### Email Not Sending
- Verify Resend API key
- Check domain verification
- Review Resend logs
- Ensure "from" address uses verified domain

### Database Connection Issues
- Verify Supabase credentials
- Check RLS policies
- Ensure service role key is correct

## Rollback Procedure

If deployment has issues:

1. Go to Vercel dashboard
2. Navigate to Deployments
3. Find previous working deployment
4. Click "..." → "Promote to Production"

## Scaling Considerations

### Database
- Monitor Supabase usage
- Upgrade plan if needed
- Add database indexes for performance

### API Routes
- Vercel automatically scales
- Monitor function execution times
- Optimize slow queries

### Email
- Monitor Resend usage
- Upgrade plan if needed
- Implement email queuing for high volume

## Security Best Practices

- [ ] Never commit `.env.local` or `.env`
- [ ] Use environment variables for all secrets
- [ ] Enable Vercel's security headers
- [ ] Keep dependencies updated
- [ ] Monitor for security vulnerabilities
- [ ] Use Stripe test mode until ready for production
- [ ] Implement rate limiting (future enhancement)
- [ ] Add CAPTCHA to forms (future enhancement)

## Backup Strategy

### Database Backups
- Supabase automatically backs up daily
- Export data periodically for extra safety
- Test restore procedures

### Code Backups
- GitHub serves as primary backup
- Tag releases for easy rollback
- Document major changes

## Support & Resources

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs
- Calendly API: https://developer.calendly.com
- Resend Docs: https://resend.com/docs

