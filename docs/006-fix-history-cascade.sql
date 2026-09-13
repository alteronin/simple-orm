-- Migration: Fix record_history foreign key to cascade deletes
-- Run this in the Supabase SQL Editor

-- Drop existing foreign key constraint (if it exists)
DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'record_history'::regclass
    AND confrelid = 'records'::regclass
    AND contype = 'f';
  
  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE record_history DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

-- Re-create with on delete cascade
ALTER TABLE record_history
  ADD CONSTRAINT record_history_record_id_fkey
  FOREIGN KEY (record_id) REFERENCES records(id) ON DELETE CASCADE;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_record_history_record_id ON record_history(record_id);
