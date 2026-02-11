-- Final Consolidated Schema Update
-- Run this script to ensure all necessary columns and policies exist.

-- 1. Add VSM and Committee columns to ventures table
DO $$ 
BEGIN 
    -- VSM Columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ventures' AND column_name = 'vsm_notes') THEN 
        ALTER TABLE ventures ADD COLUMN vsm_notes text; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ventures' AND column_name = 'program_recommendation') THEN 
        ALTER TABLE ventures ADD COLUMN program_recommendation text; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ventures' AND column_name = 'internal_comments') THEN 
        ALTER TABLE ventures ADD COLUMN internal_comments text; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ventures' AND column_name = 'ai_analysis') THEN 
        ALTER TABLE ventures ADD COLUMN ai_analysis JSONB; 
    END IF;

    -- Committee Columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ventures' AND column_name = 'committee_feedback') THEN 
        ALTER TABLE ventures ADD COLUMN committee_feedback text; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ventures' AND column_name = 'committee_decision') THEN 
        ALTER TABLE ventures ADD COLUMN committee_decision text; 
    END IF;
END $$;

-- 2. Ensure RLS Policies for Staff (Success Manager, Committee, Admin)
-- We drop existing policies to ensure clean state and re-create them.

DROP POLICY IF EXISTS "Staff can view all ventures" ON ventures;
DROP POLICY IF EXISTS "Staff can update any venture" ON ventures;

-- Policy: Staff can view all ventures
CREATE POLICY "Staff can view all ventures"
  ON ventures FOR SELECT
  USING ( 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('success_mgr', 'admin', 'committee_member')
    )
  );

-- Policy: Staff can update any venture
CREATE POLICY "Staff can update any venture"
  ON ventures FOR UPDATE
  USING ( 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('success_mgr', 'admin', 'committee_member')
    )
  );
