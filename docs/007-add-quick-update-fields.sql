-- Add quick_update_fields column to stacks table
ALTER TABLE stacks ADD COLUMN IF NOT EXISTS quick_update_fields text[] DEFAULT '{}';
