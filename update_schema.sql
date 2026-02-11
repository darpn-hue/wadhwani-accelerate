-- Incremental update script for existing database
-- Run this in Supabase SQL Editor to add Committee features without recreating tables

-- 1. Update Profiles Role Check Constraint
-- Using a DO block to safely handle constraint updates
DO $$
BEGIN
    -- Drop the constraint if it exists (name might vary, trying standard 'profiles_role_check')
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check') THEN
        ALTER TABLE profiles DROP CONSTRAINT profiles_role_check;
    END IF;
    
    -- Also try dropping if constraint is named 'profiles_role_check1' or similar in case of duplicates
    -- but usually standard name is profiles_role_check unless manually named
    -- We'll just enact the new constraint
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('entrepreneur', 'success_mgr', 'admin', 'committee_member'));
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Constraint update failed (might not exist or different name): %', SQLERRM;
END $$;


-- 2. Update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  user_role text;
BEGIN
  -- Automatically assign roles based on email pattern
  IF new.email ILIKE '%admin%' THEN
    user_role := 'success_mgr';
  ELSIF new.email ILIKE '%committee%' THEN
    user_role := 'committee_member';
  ELSE
    user_role := 'entrepreneur';
  END IF;

  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', user_role);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Add Committee columns to ventures table
DO $$ 
BEGIN 
    -- Check and add committee_feedback
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ventures' AND column_name = 'committee_feedback') THEN 
        ALTER TABLE ventures ADD COLUMN committee_feedback text; 
    END IF;

    -- Check and add committee_decision
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ventures' AND column_name = 'committee_decision') THEN 
        ALTER TABLE ventures ADD COLUMN committee_decision text; 
    END IF;
END $$;


-- 4. Update Policies for Ventures
-- Drop old policies to update them with new role access
DROP POLICY IF EXISTS "Success Managers can view all ventures" ON ventures;
DROP POLICY IF EXISTS "Success Managers can update any venture" ON ventures;
DROP POLICY IF EXISTS "Staff can view all ventures" ON ventures;
DROP POLICY IF EXISTS "Staff can update any venture" ON ventures;

-- Re-create comprehensive Staff policies
CREATE POLICY "Staff can view all ventures"
  ON ventures FOR SELECT
  USING ( 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('success_mgr', 'admin', 'committee_member')
    )
  );

CREATE POLICY "Staff can update any venture"
  ON ventures FOR UPDATE
  USING ( 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('success_mgr', 'admin', 'committee_member')
    )
  );

-- 5. Add ai_analysis column for AI Deep Dive feature
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ventures' AND column_name = 'ai_analysis') THEN
        ALTER TABLE public.ventures ADD COLUMN ai_analysis JSONB;
    END IF;
END $$;
