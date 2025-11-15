# Custom Booking System Implementation

## Overview
This document describes the custom booking calendar system that replaces the Calendly integration in the Dearly application.

## Implementation Date
November 12, 2025

## Features Implemented

### 1. Database Schema (Migration: 002_booking_system.sql)

#### New Tables

**availability_slots**
- Stores admin-managed time slots available for booking
- Fields: id, start_time, end_time, is_booked, created_by, created_at, updated_at
- Includes constraint to prevent overlapping slots
- Supports time range exclusion to avoid double booking

**appointments**
- Stores customer bookings linked to paid sessions
- Fields: id, session_id, user_id, availability_slot_id, start_time, end_time, status, booking_token, notes, created_at, updated_at
- Status values: 'scheduled', 'cancelled', 'completed', 'no_show'
- booking_token: Unique token for managing bookings without authentication

#### Modified Tables

**sessions**
- Added: appointment_id, appointment_start_time, appointment_end_time
- Removed: calendly_event_id (no longer needed)

### 2. API Routes

#### Availability Management
- `GET /api/availability/list` - List available time slots (with optional filters)
- `POST /api/admin/availability/create` - Create new time slot (admin only)
- `DELETE /api/admin/availability/delete` - Delete time slot (admin only)

#### Booking Management
- `POST /api/booking/create` - Book an appointment
- `POST /api/booking/cancel` - Cancel appointment
- `POST /api/booking/reschedule` - Reschedule to different slot
- `GET /api/booking/get` - Get appointment details by token

### 3. User Interfaces

#### Admin Dashboard
**Location:** `/dashboard/availability`
- Create new availability slots with date and time picker
- View all slots grouped by date
- Delete unused slots
- Visual indicators for booked, available, and past slots

#### Customer Booking Calendar
**Location:** `/booking/[sessionId]`
- Protected route - only accessible with valid paid session
- Displays available time slots grouped by date
- Interactive slot selection
- Immediate booking confirmation
- Redirects to confirmation page after successful booking

#### Booking Confirmation
**Location:** `/booking/confirmed`
- Shows booking success message
- Provides manage booking link
- Copy-to-clipboard functionality for sharing
- Next steps information

#### Manage Booking
**Location:** `/booking/manage/[token]`
- Token-based access (no authentication required)
- View current appointment details
- Reschedule to different available slot
- Cancel appointment
- Protections for past appointments

### 4. Updated Payment Flow

#### Stripe Webhook (`/api/stripe/webhook/route.ts`)
- After successful payment, sends email with booking page link
- No longer references Calendly

#### Process Session (`/api/stripe/process-session/route.ts`)
- Updated for local development testing
- Sends booking link instead of Calendly link

#### Success Page (`/app/success/page.tsx`)
- Automatically redirects to booking page after 2 seconds
- Shows processing status during redirect

### 5. Middleware Protection (`middleware.ts`)

#### Protected Routes
- `/dashboard/*` - Admin/interviewer only (requires authentication + role check)
- `/booking/[sessionId]` - Verifies session exists and is in 'paid' status
- `/booking/manage/[token]` - Public (token-based access)
- `/booking/confirmed` - Public (confirmation page)

### 6. Email Notifications

#### Customer Emails
1. **Payment Success Email** - Includes booking page link
2. **Booking Confirmation Email** - Sent after scheduling appointment
3. **Reschedule Confirmation Email** - Shows old and new times
4. **Cancellation Confirmation Email** - Provides rebooking link

#### Internal Team Emails
1. **New Booking Notification** - Includes customer details and questionnaire
2. **Reschedule Notification** - Shows time change details
3. **Cancellation Notification** - Alerts team of cancelled appointment

### 7. Security Features

- Row Level Security (RLS) on all new tables
- Token-based booking management (32-character secure tokens)
- Middleware protection for sensitive routes
- Validation of session status before booking
- Prevention of double-booking through database constraints
- Prevention of booking past time slots

## User Flow

### Admin Creates Availability
1. Admin logs into dashboard
2. Navigates to `/dashboard/availability`
3. Creates time slots with date/time picker
4. Slots become available for customer booking

### Customer Books Appointment
1. Customer completes payment on checkout page
2. Stripe processes payment successfully
3. Success page redirects to `/booking/[sessionId]`
4. Customer selects available time slot
5. Booking confirmed, emails sent
6. Customer receives booking token for management

### Customer Manages Booking
1. Customer uses token link from email
2. Views current appointment details
3. Can reschedule or cancel
4. System updates availability accordingly
5. Confirmation emails sent

## Technical Details

### Timezone Handling
- All times stored in database as TIMESTAMPTZ (UTC)
- Display times converted to EST for consistency
- User requirement: Single timezone (EST) for all bookings

### Availability Management
- Admin-configured time slots
- No calendar integration required
- Simple create/delete operations
- Visual status indicators

### Data Integrity
- Foreign key constraints ensure referential integrity
- Automatic timestamp updates via triggers
- Status transitions tracked in appointment records
- Slot booking state synchronized with appointments

## Environment Variables Required

```
NEXT_PUBLIC_APP_URL - Base URL for booking links (e.g., https://dearly.com or http://localhost:3000)
INTERNAL_TEAM_EMAIL - Email for internal notifications
RESEND_API_KEY - For sending emails
NEXT_PUBLIC_SUPABASE_URL - Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY - Supabase anonymous key
```

## Migration Instructions

### 1. Run Database Migration
```bash
# Apply the migration to your Supabase database
# Navigate to Supabase Dashboard > SQL Editor
# Run the contents of: supabase/migrations/002_booking_system.sql
```

### 2. Update Environment Variables
Ensure `NEXT_PUBLIC_APP_URL` is set in your environment (already exists in your .env.local)

### 3. Deploy Application
Deploy the updated application code to your hosting environment

### 4. Create Initial Availability
1. Log in as admin
2. Visit `/dashboard/availability`
3. Create time slots for customer booking

### 5. Test the Flow
1. Complete a test purchase
2. Verify redirect to booking page
3. Book an appointment
4. Test reschedule/cancel functionality

## Removed Components

- `/app/api/calendly/webhook/route.ts` - Deleted (no longer needed)
- Calendly environment variables - No longer required
- `getPaymentSuccessEmail()` function - Replaced with inline templates

## Updated Components

- `/types/database.ts` - Added AvailabilitySlot and Appointment types
- `/app/dashboard/sessions/[id]/page.tsx` - Shows appointment times instead of Calendly event
- `/middleware.ts` - Added booking route protection
- `/app/success/page.tsx` - Redirects to booking instead of showing Calendly instructions

## Benefits of Custom System

1. **Full Control** - Complete ownership of booking logic and UI
2. **Cost Savings** - No Calendly subscription required
3. **Integrated Experience** - Seamless flow from payment to booking
4. **Customization** - Tailor booking experience to specific needs
5. **Data Ownership** - All booking data in your database
6. **Better UX** - Single-page booking vs external Calendly site
7. **Flexibility** - Easy to add features like SMS notifications, calendar integrations, etc.

## Future Enhancement Opportunities

1. Calendar integration (Google Calendar, Outlook)
2. SMS notifications via Twilio
3. Automatic reminder emails
4. Recurring availability patterns
5. Multiple interviewers with separate calendars
6. Buffer time between appointments
7. Custom booking rules (minimum advance notice, etc.)
8. Analytics and reporting dashboard

## Support

For questions or issues with the booking system, refer to:
- Database schema: `supabase/migrations/002_booking_system.sql`
- Type definitions: `types/database.ts`
- API documentation: This file

## Changelog

### v1.0.0 (2025-11-12)
- Initial implementation of custom booking system
- Replaced Calendly integration
- Added admin availability management
- Implemented customer booking flow
- Added reschedule/cancel functionality
- Integrated email notifications
- Protected routes with middleware
