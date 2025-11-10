# Tell Me More App — Technical Architecture (MVP)

## 1. Overview
The **Tell Me More** allows customers to book and record a professionally produced interview or podcast with a loved one, preserving their story for generations.  
This document describes the MVP technical architecture for a **web-only app** with both **customer-facing** and **internal interviewer/admin** dashboards.

---

## 2. Core Functionality (MVP Scope)

### Customer Experience
- Visit marketing site, learn about the service
- Purchase interview session via **Stripe Checkout**
- After payment, receive link to schedule interview (via **Calendly**)
- Get confirmation + reminder emails
- Conduct interview (handled manually by internal team for MVP)
- Receive link to final recording when ready

### Admin / Interviewer Dashboard
- View booked sessions and customer details
- Access scheduled interviews (via Calendly integration or export)
- Upload or attach final recording link to customer session
- Trigger delivery email to customer

---

## 3. Tech Stack

| Layer | Technology | Notes |
|-------|-------------|-------|
| Frontend | **Next.js 15 (App Router)** | Deployed on Vercel |
| UI | **Tailwind CSS** | No external component library |
| Form Handling | **React Hook Form + Zod** | For validation on checkout forms and admin upload forms |
| Database | **Supabase (Postgres)** | Simple relational store for users, sessions, and recordings |
| Payments | **Stripe Checkout** | Handles payments, webhooks notify backend |
| Scheduling | **Calendly (Option B)** | Paid users redirected to book via Calendly |
| Auth | **Supabase Auth** | For internal dashboard (email login) |
| Email | **Resend or Supabase email** | For booking confirmations and delivery notifications |
| Deployment | **Vercel** | One-click deploy pipeline |

---

## 4. Data Model (MVP)

**Users**
- id (UUID)
- name
- email
- role (customer, interviewer, admin)
- stripe_customer_id
- created_at	timestamp	
- updated_at	timestamp

**Sessions**
- id (UUID)
- user_id → Users
- status (paid, scheduled, completed, delivered)
- calendly_event_id
- amount
- recording_url
- created_at, updated_at

**Payments**
- id
- stripe_payment_intent_id
- user_id → Users
- amount, status, timestamp

**Questionnaires**
- id	UUID	Primary key
- session_id	UUID → Sessions	One-to-one link to session
- user_id	UUID → Users	Owner (redundant but useful for direct access)
- relationship_to_interviewee	string	e.g. “self”, “daughter”, “friend”
- interviewee_name	string	Name of person being interviewed
- questions	JSON	Array of objects with {id, text}
- length_minutes	integer	30 / 60 / 90
- medium	enum(google_meet, zoom, phone)	Chosen interview medium
- notes	text	Optional freeform info for interviewer
- created_at	timestamp	
- updated_at	timestamp
---

## 5. Integration Flow

### 1. Payment → Booking
- User completes Stripe Checkout → webhook triggers backend
- Backend marks payment as successful → sends Calendly link

### 2. Booking → Interview
- User books through Calendly → webhook (or periodic sync) adds booking details to Supabase

### 3. Interview → Delivery
- Interviewer uploads final recording link in admin dashboard
- Email automatically sent to customer with link to recording

---

## 6. Calendly Integration Notes

**Option B — Paid User Access Only**
- Calendly link sent only after Stripe payment success
- Calendly booking confirmation email goes to both customer & internal interviewer
- Calendly events are periodically synced (or manually viewed in dashboard)
- No need for building internal scheduler in MVP

---

## 7. Email Flow

| Trigger | Email Sent To | Content |
|----------|----------------|----------|
| Payment Success | Customer | Calendly booking link |
| Booking Confirmed | Internal team | Interview prep info |
| Recording Uploaded | Customer | Link to final audio |

---

## 8. Hosting & Environment

- Frontend + API hosted on **Vercel**
- Database: **Supabase Postgres**
- Environment secrets managed via Vercel dashboard
- Stripe + Calendly webhooks handled by Next.js API routes

---

## 9. Future Enhancements (V2+)

- Built-in audio recorder + upload system
- Customer account dashboard to view recordings
- Multiple session packages & gift purchase flow
- AI-assisted summaries / transcript generation
- Custom branded experience for families
