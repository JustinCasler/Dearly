-- Migration: Fix Interviewer Assignment RLS Policies
-- Description: Allow interviewers to view and claim sessions with status 'scheduled'
--              (not just 'paid') since sessions become 'scheduled' after booking
-- Date: 2025-11-19

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

-- Update the check constraint comment for clarity
COMMENT ON POLICY "Interviewers can view unassigned sessions" ON sessions IS
  'Allows interviewers and admins to view sessions that are paid or scheduled but not yet assigned to an interviewer';

COMMENT ON POLICY "Interviewers can assign sessions to themselves" ON sessions IS
  'Allows interviewers and admins to update sessions to assign themselves, only for unassigned paid or scheduled sessions';
