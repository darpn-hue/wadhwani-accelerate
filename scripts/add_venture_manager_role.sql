-- Migration: Add Venture Manager Role Support
-- This adds 'venture_mgr' to the profiles table and updates RLS policies

-- 1. Drop the existing role constraint and recreate with 'venture_mgr'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('entrepreneur', 'success_mgr', 'admin', 'committee_member', 'venture_mgr'));

-- 2. Update RLS policy to allow venture_mgr to view all ventures
DROP POLICY IF EXISTS "Staff can view all ventures" ON ventures;
CREATE POLICY "Staff can view all ventures"
  ON ventures FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('success_mgr', 'admin', 'committee_member', 'venture_mgr')
    )
  );

-- 3. Update RLS policy to allow venture_mgr to update ventures
DROP POLICY IF EXISTS "Staff can update any venture" ON ventures;
CREATE POLICY "Staff can update any venture"
  ON ventures FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('success_mgr', 'admin', 'committee_member', 'venture_mgr')
    )
  );

-- 4. Update the signup trigger to recognize venture_mgr emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role text;
BEGIN
  -- Automatically assign roles based on email pattern (For Demo Purpose)
  IF new.email ILIKE '%ravi%' THEN
    user_role := 'venture_mgr';
  ELSIF new.email ILIKE '%admin%' THEN
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

-- 5. Add venture_partner field if it doesn't exist (for tracking which Venture Manager is assigned)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ventures' AND column_name = 'venture_partner') THEN
        ALTER TABLE ventures ADD COLUMN venture_partner text;
    END IF;
END $$;

COMMENT ON COLUMN ventures.venture_partner IS 'Name of the Venture Manager assigned to this Prime venture';
