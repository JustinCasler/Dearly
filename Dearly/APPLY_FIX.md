# Quick Fix for Available Sessions & Claiming

## Problem
1. Scheduled sessions don't show up in `/dashboard/interviewer/available`
2. Can't claim sessions even when they appear

## Root Cause
- When you book an appointment, the session status changes from `'paid'` to `'scheduled'`
- The RLS policies only allow viewing/claiming sessions with status = `'paid'`
- So scheduled sessions become invisible to interviewers!

## Fix

### Option 1: Apply Migration (Recommended)

Go to your Supabase dashboard and run this SQL:

1. Open https://supabase.com/dashboard/project/ykiojapfpbgmxurrfcps/sql/new
2. Copy and paste this SQL:

```sql
-- Drop the existing policies that are too restrictive
DROP POLICY IF EXISTS "Interviewers can view unassigned sessions" ON sessions;
DROP POLICY IF EXISTS "Interviewers can assign sessions to themselves" ON sessions;

-- Recreate policy to allow viewing unassigned sessions that are 'paid' OR 'scheduled'
CREATE POLICY "Interviewers can view unassigned sessions" ON sessions
  FOR SELECT
  USING (
    (
      SELECT role FROM users WHERE id = auth.uid()
    ) IN ('interviewer', 'admin')
    AND interviewer_id IS NULL
    AND status IN ('paid', 'scheduled')
  );

-- Recreate policy to allow assigning 'paid' OR 'scheduled' sessions
CREATE POLICY "Interviewers can assign sessions to themselves" ON sessions
  FOR UPDATE
  USING (
    (
      SELECT role FROM users WHERE id = auth.uid()
    ) IN ('interviewer', 'admin')
    AND interviewer_id IS NULL
    AND status IN ('paid', 'scheduled')
  )
  WITH CHECK (
    (
      SELECT role FROM users WHERE id = auth.uid()
    ) IN ('interviewer', 'admin')
    AND (
      interviewer_id = auth.uid()
      OR interviewer_id IS NULL
      OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    )
  );
```

3. Click "Run"
4. Refresh your `/dashboard/interviewer/available` page

### Option 2: Verify Your Sessions

To check what's in your database:

```sql
-- See all sessions and their status
SELECT id, status, interviewer_id, created_at
FROM sessions
ORDER BY created_at DESC;

-- See sessions that should be available to claim
SELECT id, status, interviewer_id, appointment_start_time
FROM sessions
WHERE interviewer_id IS NULL
  AND status IN ('paid', 'scheduled')
ORDER BY created_at DESC;
```

## What Changed in the Code

1. **`/app/actions/sessions.ts`** - Updated `getUnassignedSessions()` to fetch sessions with status `'paid'` OR `'scheduled'`
2. **`/supabase/migrations/004_fix_interviewer_assignment_rls.sql`** - New migration to fix RLS policies

## After Applying the Fix

Your scheduled sessions should now:
- ✅ Appear in `/dashboard/interviewer/available`
- ✅ Be claimable by interviewers
- ✅ Automatically assign interviewer to appointment when claimed
