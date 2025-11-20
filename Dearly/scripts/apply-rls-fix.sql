-- Quick Fix for Session Assignment Issues
-- Copy and paste this into your Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new

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
