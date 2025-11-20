-- Comprehensive Fix for Session Assignment and Viewing Issues
-- This fixes ALL RLS policies to allow proper session management
-- Copy and paste this into your Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new

-- ============================================================================
-- 1. DROP ALL EXISTING SESSION POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions;
DROP POLICY IF EXISTS "Admins and interviewers can view all sessions" ON sessions;
DROP POLICY IF EXISTS "Admins and interviewers can update sessions" ON sessions;
DROP POLICY IF EXISTS "Interviewers can view unassigned sessions" ON sessions;
DROP POLICY IF EXISTS "Interviewers can view assigned sessions" ON sessions;
DROP POLICY IF EXISTS "Interviewers can assign sessions to themselves" ON sessions;

-- ============================================================================
-- 2. CREATE NEW COMPREHENSIVE POLICIES
-- ============================================================================

-- Policy 1: Users can view their own sessions
CREATE POLICY "Users can view their own sessions" ON sessions
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy 2: Admins can see and do everything
CREATE POLICY "Admins can view all sessions" ON sessions
  FOR SELECT
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can update all sessions" ON sessions
  FOR UPDATE
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Policy 3: Interviewers can view BOTH unassigned sessions AND their assigned sessions
CREATE POLICY "Interviewers can view relevant sessions" ON sessions
  FOR SELECT
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'interviewer'
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
    (SELECT role FROM users WHERE id = auth.uid()) = 'interviewer'
    AND interviewer_id IS NULL
    AND status IN ('paid', 'scheduled')
  )
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'interviewer'
    AND (
      -- They can assign to themselves
      interviewer_id = auth.uid()
      -- Or leave it unassigned
      OR interviewer_id IS NULL
    )
  );

-- ============================================================================
-- 3. UPDATE INDEX TO INCLUDE 'scheduled' STATUS
-- ============================================================================
DROP INDEX IF EXISTS idx_sessions_unassigned;
CREATE INDEX idx_sessions_unassigned
  ON sessions(status, interviewer_id)
  WHERE interviewer_id IS NULL AND status IN ('paid', 'scheduled');

-- ============================================================================
-- 4. ADD HELPFUL COMMENTS
-- ============================================================================
COMMENT ON POLICY "Interviewers can view relevant sessions" ON sessions IS
  'Allows interviewers to view both unassigned sessions (paid/scheduled) and their own assigned sessions';

COMMENT ON POLICY "Interviewers can assign sessions to themselves" ON sessions IS
  'Allows interviewers to claim unassigned sessions that are paid or scheduled';
