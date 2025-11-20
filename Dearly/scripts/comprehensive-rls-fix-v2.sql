-- Comprehensive Fix for Session Assignment and Viewing Issues (V2)
-- This fixes ALL RLS policies to allow proper session management
-- Copy and paste this into your Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new

-- ============================================================================
-- 1. FIX USERS TABLE POLICIES FIRST (to prevent infinite recursion)
-- ============================================================================

-- Drop existing users policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Admins and interviewers can view all users" ON users;

-- Users can always view their own data
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Create a helper function to check user role WITHOUT causing recursion
-- This bypasses RLS by using SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.users WHERE id = user_id;
$$;

-- Admins and interviewers can view all users (using helper function)
CREATE POLICY "Admins and interviewers can view all users" ON users
  FOR SELECT
  USING (
    public.get_user_role(auth.uid()) IN ('admin', 'interviewer')
  );

-- ============================================================================
-- 2. DROP ALL EXISTING SESSION POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions;
DROP POLICY IF EXISTS "Admins and interviewers can view all sessions" ON sessions;
DROP POLICY IF EXISTS "Admins and interviewers can update sessions" ON sessions;
DROP POLICY IF EXISTS "Interviewers can view unassigned sessions" ON sessions;
DROP POLICY IF EXISTS "Interviewers can view assigned sessions" ON sessions;
DROP POLICY IF EXISTS "Interviewers can assign sessions to themselves" ON sessions;
DROP POLICY IF EXISTS "Interviewers can view relevant sessions" ON sessions;
DROP POLICY IF EXISTS "Admins can view all sessions" ON sessions;
DROP POLICY IF EXISTS "Admins can update all sessions" ON sessions;

-- ============================================================================
-- 3. CREATE NEW COMPREHENSIVE SESSION POLICIES (using helper function)
-- ============================================================================

-- Policy 1: Users can view their own sessions
CREATE POLICY "Users can view their own sessions" ON sessions
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy 2: Admins can see and do everything
CREATE POLICY "Admins can view all sessions" ON sessions
  FOR SELECT
  USING (
    public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can update all sessions" ON sessions
  FOR UPDATE
  USING (
    public.get_user_role(auth.uid()) = 'admin'
  );

-- Policy 3: Interviewers can view BOTH unassigned sessions AND their assigned sessions
CREATE POLICY "Interviewers can view relevant sessions" ON sessions
  FOR SELECT
  USING (
    public.get_user_role(auth.uid()) = 'interviewer'
    AND (
      -- Can see unassigned sessions that are paid or scheduled
      (interviewer_id IS NULL AND status IN ('paid', 'scheduled'))
      OR
      -- Can see sessions assigned to them
      (interviewer_id = auth.uid())
    )
  );

-- Policy 4: Interviewers can update sessions to assign themselves
-- (only if unassigned and paid/scheduled)
CREATE POLICY "Interviewers can assign sessions to themselves" ON sessions
  FOR UPDATE
  USING (
    public.get_user_role(auth.uid()) = 'interviewer'
    AND interviewer_id IS NULL
    AND status IN ('paid', 'scheduled')
  )
  WITH CHECK (
    public.get_user_role(auth.uid()) = 'interviewer'
    AND (
      -- They can assign to themselves
      interviewer_id = auth.uid()
      -- Or leave it unassigned
      OR interviewer_id IS NULL
    )
  );

-- ============================================================================
-- 4. UPDATE INDEX TO INCLUDE 'scheduled' STATUS
-- ============================================================================
DROP INDEX IF EXISTS idx_sessions_unassigned;
CREATE INDEX idx_sessions_unassigned
  ON sessions(status, interviewer_id)
  WHERE interviewer_id IS NULL AND status IN ('paid', 'scheduled');

-- ============================================================================
-- 5. ADD HELPFUL COMMENTS
-- ============================================================================
COMMENT ON FUNCTION public.get_user_role(UUID) IS
  'Helper function to get user role without triggering RLS recursion. Uses SECURITY DEFINER to bypass RLS.';

COMMENT ON POLICY "Interviewers can view relevant sessions" ON sessions IS
  'Allows interviewers to view both unassigned sessions (paid/scheduled) and their own assigned sessions';

COMMENT ON POLICY "Interviewers can assign sessions to themselves" ON sessions IS
  'Allows interviewers to claim unassigned sessions that are paid or scheduled';
