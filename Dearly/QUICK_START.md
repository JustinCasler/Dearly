# Quick Start Guide - Dearly MVP

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies (2 minutes)

```bash
cd /Users/justincasler/Projects/TellMeMore/tell-me-more
npm install
```

### Step 2: Set Up Environment (30 minutes)

1. **Copy environment template**:
   ```bash
   cp .env.example .env.local
   ```

2. **Get your API keys** (follow SETUP_GUIDE.md for details):
   - Supabase: Project URL + API keys
   - Stripe: Test mode keys
   - Calendly: API token + scheduling link
   - Resend: API key

3. **Fill in `.env.local`** with your keys

4. **Set up Supabase database**:
   - Create Supabase project
   - Run SQL from `supabase/migrations/001_initial_schema.sql`
   - Create admin user

### Step 3: Run the App (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ✅ What You Get

### Customer-Facing
- 🏠 Landing page at `/`
- 📝 Checkout form at `/checkout`
- ✨ Success page at `/success`

### Admin Dashboard
- 🔐 Login at `/login`
- 📊 Dashboard at `/dashboard`
- 📋 Session details at `/dashboard/sessions/[id]`

### API Endpoints
- 💳 Stripe checkout: `POST /api/stripe/checkout`
- 🔔 Stripe webhook: `POST /api/stripe/webhook`
- 📅 Calendly webhook: `POST /api/calendly/webhook`

---

## 📚 Documentation

| File | Purpose | Time to Read |
|------|---------|--------------|
| **SETUP_GUIDE.md** | Step-by-step setup | 10 min |
| **README.md** | Full documentation | 15 min |
| **DEPLOYMENT.md** | Deploy to production | 10 min |
| **TESTING.md** | Test everything | 15 min |
| **PROJECT_SUMMARY.md** | Technical overview | 10 min |

---

## 🔧 Helpful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Run production build
npm run lint             # Run linter
npm run type-check       # Check TypeScript

# Stripe (requires Stripe CLI)
npm run stripe:listen    # Listen for webhooks
npm run stripe:trigger   # Trigger test payment
```

---

## 🎯 First-Time Setup Checklist

### Supabase (15 min)
- [ ] Create Supabase project
- [ ] Run database migration
- [ ] Create admin user
- [ ] Copy API keys to `.env.local`

### Stripe (10 min)
- [ ] Create Stripe account
- [ ] Enable test mode
- [ ] Copy API keys to `.env.local`
- [ ] Install Stripe CLI for webhooks

### Calendly (10 min)
- [ ] Create Calendly account
- [ ] Create event type
- [ ] Get API token
- [ ] Copy scheduling link to `.env.local`

### Resend (5 min)
- [ ] Create Resend account
- [ ] Get API key
- [ ] Update email "from" address in `lib/resend.ts`

### Local Testing (15 min)
- [ ] Run `npm run dev`
- [ ] Visit landing page
- [ ] Test checkout flow
- [ ] Login to admin dashboard
- [ ] Verify all pages load

---

## 🧪 Quick Test

### Test Customer Flow
1. Go to `http://localhost:3000`
2. Click "Book Your Interview"
3. Fill out form
4. Use test card: `4242 4242 4242 4242`
5. Check email for Calendly link

### Test Admin Flow
1. Go to `http://localhost:3000/login`
2. Login with admin credentials
3. View sessions list
4. Click on a session
5. Upload a recording URL

---

## 🐛 Troubleshooting

### "supabaseUrl is required"
→ Add `NEXT_PUBLIC_SUPABASE_URL` to `.env.local`

### "Invalid API key" (Stripe)
→ Ensure you're using test mode keys (start with `pk_test_` and `sk_test_`)

### Webhook not working
→ Run `npm run stripe:listen` in a separate terminal

### Email not sending
→ Check Resend API key and verify "from" address

### Can't login to dashboard
→ Verify admin user exists in both `auth.users` and `public.users` tables

---

## 📞 Need Help?

1. **Setup issues**: See SETUP_GUIDE.md
2. **Build errors**: See BUILD_NOTES.md
3. **Testing**: See TESTING.md
4. **Deployment**: See DEPLOYMENT.md

---

## 🎉 You're Ready!

Once your environment is configured:
1. ✅ App runs locally
2. ✅ Customer can book sessions
3. ✅ Admin can manage sessions
4. ✅ Webhooks process correctly
5. ✅ Emails deliver successfully

**Next**: Deploy to production (see DEPLOYMENT.md)

---

**Time to Launch**: 3-4 hours total
- Setup: 30-60 min
- Testing: 1-2 hours
- Deployment: 1-2 hours

**Let's build something amazing!** 🚀

