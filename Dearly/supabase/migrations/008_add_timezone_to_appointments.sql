-- Add timezone field to appointments table
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Update existing appointments to use America/New_York
-- (These were previously displayed as EST, so we'll preserve that timezone)
UPDATE appointments
  SET timezone = 'America/New_York'
  WHERE timezone = 'UTC';

-- Add comment explaining the field
COMMENT ON COLUMN appointments.timezone IS 'User''s timezone at the time of booking (IANA timezone identifier)';
