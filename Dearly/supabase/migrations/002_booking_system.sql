-- Migration: Custom Booking Calendar System
-- Description: Replace Calendly with custom booking system
-- Date: 2025-11-12

-- 1. Create availability_slots table for admin-managed time slots
CREATE TABLE IF NOT EXISTS availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure start_time is before end_time
  CONSTRAINT valid_time_range CHECK (start_time < end_time),

  -- Ensure slots don't overlap (handled by application logic + unique constraint on time ranges)
  EXCLUDE USING gist (tstzrange(start_time, end_time) WITH &&) WHERE (is_booked = FALSE)
);

-- 2. Create appointments table for booked appointments
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  availability_slot_id UUID REFERENCES availability_slots(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'completed', 'no_show')),
  booking_token TEXT UNIQUE NOT NULL, -- Used for manage booking link
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure start_time is before end_time
  CONSTRAINT valid_appointment_time CHECK (start_time < end_time)
);

-- 3. Modify sessions table
-- Add new columns for appointment tracking
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS appointment_start_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS appointment_end_time TIMESTAMPTZ;

-- Remove calendly_event_id (no longer needed)
ALTER TABLE sessions
  DROP COLUMN IF EXISTS calendly_event_id;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_availability_slots_time_range ON availability_slots(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_availability_slots_is_booked ON availability_slots(is_booked);
CREATE INDEX IF NOT EXISTS idx_appointments_session_id ON appointments(session_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_booking_token ON appointments(booking_token);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_time_range ON appointments(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_sessions_appointment_id ON sessions(appointment_id);

-- 5. Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Add updated_at triggers
CREATE TRIGGER update_availability_slots_updated_at
  BEFORE UPDATE ON availability_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Enable Row Level Security
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for availability_slots

-- Anyone can view availability slots (needed for booking calendar)
CREATE POLICY "Anyone can view availability slots"
  ON availability_slots
  FOR SELECT
  USING (true);

-- Only admins and interviewers can insert availability slots
CREATE POLICY "Admins and interviewers can insert availability slots"
  ON availability_slots
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'interviewer')
    )
  );

-- Only admins and interviewers can update availability slots
CREATE POLICY "Admins and interviewers can update availability slots"
  ON availability_slots
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'interviewer')
    )
  );

-- Only admins and interviewers can delete availability slots
CREATE POLICY "Admins and interviewers can delete availability slots"
  ON availability_slots
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'interviewer')
    )
  );

-- 9. RLS Policies for appointments

-- Users can view their own appointments, admins/interviewers can view all
CREATE POLICY "Users can view own appointments, admins can view all"
  ON appointments
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'interviewer')
    )
  );

-- Only authenticated users with paid sessions can create appointments
CREATE POLICY "Authenticated users can create appointments"
  ON appointments
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_id
      AND sessions.user_id = user_id
      AND sessions.status = 'paid'
    )
  );

-- Users can update their own appointments, admins/interviewers can update all
CREATE POLICY "Users can update own appointments, admins can update all"
  ON appointments
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'interviewer')
    )
  );

-- Only admins and interviewers can delete appointments
CREATE POLICY "Only admins and interviewers can delete appointments"
  ON appointments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'interviewer')
    )
  );

-- 10. Create helper function to generate unique booking tokens
CREATE OR REPLACE FUNCTION generate_booking_token()
RETURNS TEXT AS $$
DECLARE
  token TEXT;
  token_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 32-character token
    token := encode(gen_random_bytes(24), 'base64');
    token := REPLACE(token, '/', '_');
    token := REPLACE(token, '+', '-');
    token := SUBSTRING(token, 1, 32);

    -- Check if token already exists
    SELECT EXISTS(SELECT 1 FROM appointments WHERE booking_token = token) INTO token_exists;

    -- If token doesn't exist, return it
    IF NOT token_exists THEN
      RETURN token;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 11. Add comment documentation
COMMENT ON TABLE availability_slots IS 'Admin-managed time slots available for booking';
COMMENT ON TABLE appointments IS 'Customer appointments linked to paid sessions';
COMMENT ON COLUMN appointments.booking_token IS 'Unique token for managing booking (reschedule/cancel) without authentication';
COMMENT ON COLUMN availability_slots.is_booked IS 'Whether this slot has been booked (prevents double booking)';
