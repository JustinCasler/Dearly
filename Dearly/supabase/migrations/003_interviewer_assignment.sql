-- Migration: Interviewer Assignment System
-- Description: Add interviewer assignment to sessions and appointments
-- Date: 2025-11-15

-- 1. Add interviewer_id to sessions table
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS interviewer_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- 2. Add interviewer_id and meeting details to appointments table
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS interviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS meeting_url TEXT,
  ADD COLUMN IF NOT EXISTS meeting_password TEXT;

-- 3. Create index for faster lookups of unassigned sessions
CREATE INDEX IF NOT EXISTS idx_sessions_unassigned
  ON sessions(status, interviewer_id)
  WHERE interviewer_id IS NULL AND status = 'paid';

-- 4. Create index for interviewer's assigned sessions
CREATE INDEX IF NOT EXISTS idx_sessions_by_interviewer
  ON sessions(interviewer_id, status)
  WHERE interviewer_id IS NOT NULL;

-- 5. Create index for appointment interviewer lookups
CREATE INDEX IF NOT EXISTS idx_appointments_by_interviewer
  ON appointments(interviewer_id)
  WHERE interviewer_id IS NOT NULL;

-- 6. Update RLS policies for sessions table

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Interviewers can view unassigned sessions" ON sessions;
DROP POLICY IF EXISTS "Interviewers can view assigned sessions" ON sessions;
DROP POLICY IF EXISTS "Interviewers can assign sessions to themselves" ON sessions;

-- Interviewers can view unassigned sessions (status='paid' and no interviewer)
CREATE POLICY "Interviewers can view unassigned sessions" ON sessions
  FOR SELECT
  USING (
    (
      SELECT role FROM users WHERE id = auth.uid()
    ) IN ('interviewer', 'admin')
    AND interviewer_id IS NULL
    AND status = 'paid'
  );

-- Interviewers can view their own assigned sessions
CREATE POLICY "Interviewers can view assigned sessions" ON sessions
  FOR SELECT
  USING (
    interviewer_id = auth.uid()
    OR (
      SELECT role FROM users WHERE id = auth.uid()
    ) = 'admin'
  );

-- Interviewers can update sessions to assign themselves (only if unassigned)
CREATE POLICY "Interviewers can assign sessions to themselves" ON sessions
  FOR UPDATE
  USING (
    (
      SELECT role FROM users WHERE id = auth.uid()
    ) IN ('interviewer', 'admin')
    AND interviewer_id IS NULL
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

-- 7. Update RLS policies for appointments table

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Interviewers can view their appointments" ON appointments;
DROP POLICY IF EXISTS "Interviewers can update their appointments" ON appointments;

-- Interviewers can view their own appointments
CREATE POLICY "Interviewers can view their appointments" ON appointments
  FOR SELECT
  USING (
    interviewer_id = auth.uid()
    OR (
      SELECT role FROM users WHERE id = auth.uid()
    ) = 'admin'
  );

-- Interviewers can update their own appointments (meeting details)
CREATE POLICY "Interviewers can update their appointments" ON appointments
  FOR UPDATE
  USING (
    interviewer_id = auth.uid()
    OR (
      SELECT role FROM users WHERE id = auth.uid()
    ) = 'admin'
  )
  WITH CHECK (
    interviewer_id = auth.uid()
    OR (
      SELECT role FROM users WHERE id = auth.uid()
    ) = 'admin'
  );

-- 8. Create function to automatically copy interviewer_id from session to appointment
CREATE OR REPLACE FUNCTION sync_appointment_interviewer()
RETURNS TRIGGER AS $$
BEGIN
  -- When a session gets an interviewer assigned, update the linked appointment
  IF NEW.interviewer_id IS DISTINCT FROM OLD.interviewer_id AND NEW.appointment_id IS NOT NULL THEN
    UPDATE appointments
    SET interviewer_id = NEW.interviewer_id,
        updated_at = NOW()
    WHERE id = NEW.appointment_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger to sync interviewer assignment
DROP TRIGGER IF EXISTS sync_interviewer_to_appointment ON sessions;
CREATE TRIGGER sync_interviewer_to_appointment
  AFTER UPDATE OF interviewer_id ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION sync_appointment_interviewer();

-- 10. Add comments for documentation
COMMENT ON COLUMN sessions.interviewer_id IS 'Interviewer assigned to conduct this session (null = unassigned)';
COMMENT ON COLUMN appointments.interviewer_id IS 'Interviewer conducting this appointment (synced from session)';
COMMENT ON COLUMN appointments.meeting_url IS 'Zoom/Google Meet URL for the appointment';
COMMENT ON COLUMN appointments.meeting_password IS 'Meeting password/credentials if needed';

-- 11. Backfill existing appointments with NULL interviewer_id (already nullable, just making explicit)
UPDATE appointments SET interviewer_id = NULL WHERE interviewer_id IS NULL;
UPDATE sessions SET interviewer_id = NULL WHERE interviewer_id IS NULL;
