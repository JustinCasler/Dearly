# Quick Fix Guide - Session Assignment Issues

## The Problem
1. ❌ Can't claim sessions (button does nothing)
2. ❌ "Session not found" when viewing details
3. ❌ Console shows "infinite recursion detected in policy for relation users"

## The Solution (3 Steps)

### Step 1: Apply Database Migration ⚠️ REQUIRED

1. Open your Supabase SQL Editor:
   https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new

2. Copy the **ENTIRE contents** of:
   ```
   scripts/comprehensive-rls-fix-v2.sql
   ```

3. Paste into the SQL Editor

4. Click **"Run"**

### Step 2: Restart Your Dev Server

```bash
# Stop your current dev server (Ctrl+C)
# Then restart it
npm run dev
```

### Step 3: Test

1. Go to: `/dashboard/interviewer/available`
2. You should see sessions with status 'scheduled'
3. Click "Claim Session" - should work now
4. Click "View Details" - should show session info

## What Was Fixed

### Code Changes ✅
- Fixed status check to allow 'scheduled' sessions
- Fixed ambiguous database relationship error
- Added detailed logging

### Database Changes (requires migration) ⚠️
- Fixed infinite recursion in RLS policies
- Created helper function to check user roles
- Updated policies to allow viewing/claiming 'scheduled' sessions

## Still Having Issues?

Check the browser console (F12) for logs starting with:
- `[assignSessionToSelf]`
- `[getSessionDetails]`

Share those logs for further debugging.

## Files to Use

✅ **USE THIS**: `scripts/comprehensive-rls-fix-v2.sql`
❌ Don't use: `scripts/comprehensive-rls-fix.sql` (old version)
❌ Don't use: `scripts/apply-rls-fix.sql` (incomplete)
