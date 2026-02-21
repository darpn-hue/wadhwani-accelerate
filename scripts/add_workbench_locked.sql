-- Migration: Add workbench_locked field to ventures table
-- This field indicates whether the venture's workbench should be locked
-- When Contract Sent status is reached, the workbench gets locked and venture needs to take action

-- Add workbench_locked column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ventures'
        AND column_name = 'workbench_locked'
    ) THEN
        ALTER TABLE ventures ADD COLUMN workbench_locked BOOLEAN DEFAULT false;
    END IF;
END $$;

COMMENT ON COLUMN ventures.workbench_locked IS 'Indicates if the venture workbench is locked pending action from the entrepreneur';

-- Optionally: Set workbench_locked to true for any ventures that already have Contract Sent status
UPDATE ventures
SET workbench_locked = true
WHERE status = 'Contract Sent' AND (workbench_locked IS NULL OR workbench_locked = false);
