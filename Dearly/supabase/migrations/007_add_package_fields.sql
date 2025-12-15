-- Add package_name field to questionnaires table
ALTER TABLE questionnaires
  ADD COLUMN IF NOT EXISTS package_name TEXT;

-- Set package_name based on existing length_minutes
UPDATE questionnaires
  SET package_name = CASE
    WHEN length_minutes = 30 THEN 'Essential'
    WHEN length_minutes = 60 THEN 'Gift'
    WHEN length_minutes = 90 THEN 'Legacy'
    ELSE 'Gift'
  END
  WHERE package_name IS NULL;
