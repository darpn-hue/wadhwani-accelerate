-- ============================================================================
-- COMPLETE SUPABASE SCHEMA FOR VENTURE APPLICATION SYSTEM
-- ============================================================================
-- This script sets up a fresh Supabase database with all required tables,
-- columns, policies, and functions for the complete venture application workflow.
--
-- Run this script in your Supabase SQL Editor to set up the database.
-- ============================================================================

-- ============================================================================
-- 1. PROFILES TABLE
-- ============================================================================
-- Stores user profile information and roles

CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  updated_at timestamptz DEFAULT now(),
  full_name text,
  role text CHECK (role IN ('entrepreneur', 'success_mgr', 'admin', 'committee_member')),
  avatar_url text,
  
  CONSTRAINT username_length CHECK (char_length(full_name) >= 3)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- ============================================================================
-- 2. AUTO-ASSIGN ROLES ON SIGNUP
-- ============================================================================
-- Function to automatically create profile and assign role based on email

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
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

-- Trigger to call the function on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- 3. VENTURES TABLE
-- ============================================================================
-- Main table for venture applications and data

CREATE TABLE IF NOT EXISTS ventures (
  -- Core fields
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  description text,
  program text,
  location text,
  status text DEFAULT 'Submitted',
  
  -- Step 1: Business Information
  founder_name text,
  city text,
  revenue_12m text,
  full_time_employees text,
  
  -- Step 2: Venture Growth
  growth_focus text, -- Comma-separated: "product,segment,geography"
  revenue_potential_3y text,
  min_investment text,
  incremental_hiring text,
  
  -- Step 3: Status & Needs
  blockers text,
  
  -- Step 4: Support
  support_request text,
  
  -- JSONB columns for flexible/structured data
  growth_current jsonb, -- {product, segment, geography}
  growth_target jsonb,  -- {product, segment, geography}
  commitment jsonb,
  needs jsonb,
  
  -- VSM (Venture Success Manager) fields
  vsm_notes text,
  program_recommendation text,
  internal_comments text,
  
  -- Committee fields
  committee_feedback text,
  committee_decision text,
  
  -- Agreement workflow
  agreement_status text DEFAULT 'Draft',
  agreement_sent_at timestamptz,
  agreement_accepted_at timestamptz
);

-- Enable Row Level Security
ALTER TABLE ventures ENABLE ROW LEVEL SECURITY;

-- Policies for ventures
CREATE POLICY "Users can view their own ventures"
  ON ventures FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ventures"
  ON ventures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ventures"
  ON ventures FOR UPDATE
  USING (auth.uid() = user_id);

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

-- ============================================================================
-- 4. PROGRAMS TABLE
-- ============================================================================
-- Lookup table for available programs

CREATE TABLE IF NOT EXISTS programs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Seed default programs
INSERT INTO programs (name, description) VALUES 
('Accelerate Prime', 'For early stage ventures'),
('Accelerate Core', 'For growth stage ventures'),
('Accelerate Select', 'For mature ventures'),
('Ignite', 'For idea stage'),
('Liftoff', 'For launch stage')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 5. VENTURE MILESTONES TABLE
-- ============================================================================
-- Track milestones for each venture

CREATE TABLE IF NOT EXISTS venture_milestones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  venture_id uuid REFERENCES ventures(id) ON DELETE CASCADE,
  category text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'Pending',
  due_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE venture_milestones ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users view own milestones" 
  ON venture_milestones FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM ventures 
    WHERE id = venture_milestones.venture_id 
    AND user_id = auth.uid()
  ));

CREATE POLICY "Staff view all milestones" 
  ON venture_milestones FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('success_mgr', 'admin', 'committee_member')
  ));

CREATE POLICY "Staff manage milestones" 
  ON venture_milestones FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('success_mgr', 'admin', 'committee_member')
  ));

-- ============================================================================
-- 6. VENTURE STREAMS TABLE
-- ============================================================================
-- Track status of different streams (Money & Capital, Product & Strategy, etc.)

CREATE TABLE IF NOT EXISTS venture_streams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  venture_id uuid REFERENCES ventures(id) ON DELETE CASCADE,
  stream_name text NOT NULL,
  owner text,
  status text DEFAULT 'On Track',
  end_date text,
  end_output text,
  sprint_deliverable text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE venture_streams ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users view own streams" 
  ON venture_streams FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM ventures 
    WHERE id = venture_streams.venture_id 
    AND user_id = auth.uid()
  ));

CREATE POLICY "Staff view all streams" 
  ON venture_streams FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('success_mgr', 'admin', 'committee_member')
  ));

CREATE POLICY "Users can insert own streams" 
  ON venture_streams FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM ventures 
    WHERE id = venture_streams.venture_id 
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update own streams" 
  ON venture_streams FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM ventures 
    WHERE id = venture_streams.venture_id 
    AND user_id = auth.uid()
  ));

CREATE POLICY "Staff can manage all streams" 
  ON venture_streams FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('success_mgr', 'admin', 'committee_member')
  ));

-- ============================================================================
-- 7. SUPPORT HOURS TABLE
-- ============================================================================
-- Track allocated and used support hours for each venture

CREATE TABLE IF NOT EXISTS support_hours (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  venture_id uuid REFERENCES ventures(id) ON DELETE CASCADE,
  allocated numeric DEFAULT 0,
  used numeric DEFAULT 0,
  balance numeric GENERATED ALWAYS AS (allocated - used) STORED,
  last_updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE support_hours ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users view own support_hours" 
  ON support_hours FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM ventures 
    WHERE id = support_hours.venture_id 
    AND user_id = auth.uid()
  ));

CREATE POLICY "Staff view all support_hours" 
  ON support_hours FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('success_mgr', 'admin', 'committee_member')
  ));

CREATE POLICY "Users can insert own support hours" 
  ON support_hours FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM ventures 
    WHERE id = support_hours.venture_id 
    AND user_id = auth.uid()
  ));

CREATE POLICY "Staff can manage support hours" 
  ON support_hours FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('success_mgr', 'admin', 'committee_member')
  ));

-- ============================================================================
-- 8. VENTURE HISTORY TABLE
-- ============================================================================
-- Track status changes and important events

CREATE TABLE IF NOT EXISTS venture_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  venture_id uuid REFERENCES ventures(id) ON DELETE CASCADE,
  previous_status text,
  new_status text,
  changed_by uuid REFERENCES auth.users(id),
  changed_at timestamptz DEFAULT now(),
  notes text
);

-- Enable RLS
ALTER TABLE venture_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users view own history" 
  ON venture_history FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM ventures 
    WHERE id = venture_history.venture_id 
    AND user_id = auth.uid()
  ));

CREATE POLICY "Staff view all history" 
  ON venture_history FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('success_mgr', 'admin', 'committee_member')
  ));

CREATE POLICY "Staff can insert history" 
  ON venture_history FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('success_mgr', 'admin', 'committee_member')
  ));

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- You can now verify the schema by running:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- ============================================================================
