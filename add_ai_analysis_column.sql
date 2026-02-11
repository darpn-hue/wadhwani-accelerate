-- Add ai_analysis column to ventures table
ALTER TABLE public.ventures 
ADD COLUMN IF NOT EXISTS ai_analysis JSONB;

-- Update RLS policies to allow update of this column if needed (existing policy might cover "update" content)
-- "Success Managers can update any venture" should cover it.
