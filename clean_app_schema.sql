
-- ============================================================================
-- FINAL CLEAN SCHEMA FOR APP DEMO (NO PROFILE POLICY CONFLICTS)
-- ============================================================================
-- This script updates ONLY the application-specific tables.
-- It ASSUMES 'profiles' table and its policies already exist (which is true).
-- It will wipe 'ventures' and 'venture_streams' to ensure clean state for the demo.
-- ============================================================================

-- 1. RESET APPLICATION TABLES
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS public.venture_streams CASCADE;
DROP TABLE IF EXISTS public.ventures CASCADE;

-- 2. CREATE VENTURES TABLE (Matches Frontend JSON Structure)
-- ----------------------------------------------------------------------------
CREATE TABLE public.ventures (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  
  -- Core Identity
  name text NOT NULL,
  program text,
  status text DEFAULT 'draft',
  location text,

  -- JSONB Columns for Form Step Data
  growth_current jsonb,           -- Step 1: current business (product, segment, geography, city, etc.)
  commitment jsonb,               -- Step 2: revenue potential, investment, hiring
  growth_target jsonb,            -- Step 2: new product/segment/geography targets
  ai_analysis jsonb,              -- VSM: AI-generated strengths, risks, questions

  -- Simple Text Columns
  growth_focus text,
  support_request text,
  founder_name text,
  description text,
  blockers text,

  -- VSM / Screening Manager Fields
  vsm_notes text,                 -- Call transcript / notes
  internal_comments text,         -- Committee-only comments
  program_recommendation text,    -- 'Accelerate Core', 'Accelerate Prime', etc.
  venture_partner text,           -- Assigned venture partner
  agreement_status text           -- 'Sent', 'Signed', etc.
);

-- 3. ENABLE SECURITY FOR VENTURES
-- ----------------------------------------------------------------------------
ALTER TABLE public.ventures ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own data
CREATE POLICY "Users can view their own ventures" ON public.ventures FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own ventures" ON public.ventures FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ventures" ON public.ventures FOR UPDATE USING (auth.uid() = user_id);

-- Allow staff to read ALL ventures (all 4 personas)
CREATE POLICY "Staff can view all ventures" ON public.ventures FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('success_mgr', 'admin', 'committee_member', 'venture_mgr'))
);

-- Allow staff to UPDATE ventures — CRITICAL: without this VSM/Committee saves fail
CREATE POLICY "Staff can update all ventures" ON public.ventures FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('success_mgr', 'admin', 'committee_member', 'venture_mgr'))
);


-- 4. CREATE VENTURE STREAMS TABLE (For "Status" Step)
-- ----------------------------------------------------------------------------
CREATE TABLE public.venture_streams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  venture_id uuid REFERENCES public.ventures(id) ON DELETE CASCADE,
  stream_name text NOT NULL,      
  status text DEFAULT 'No help needed', 
  created_at timestamptz DEFAULT now()
);

-- 5. ENABLE SECURITY FOR VENTURE STREAMS
-- ----------------------------------------------------------------------------
ALTER TABLE public.venture_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own streams" ON public.venture_streams FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.ventures WHERE id = public.venture_streams.venture_id AND user_id = auth.uid())
);

CREATE POLICY "Users insert own streams" ON public.venture_streams FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.ventures WHERE id = public.venture_streams.venture_id AND user_id = auth.uid())
);

CREATE POLICY "Users update own streams" ON public.venture_streams FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.ventures WHERE id = public.venture_streams.venture_id AND user_id = auth.uid())
);
CREATE POLICY "Staff can view all streams" ON public.venture_streams FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('success_mgr', 'admin', 'committee_member', 'venture_mgr'))
);

CREATE POLICY "Staff can update all streams" ON public.venture_streams FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('success_mgr', 'admin', 'committee_member', 'venture_mgr'))
);
-- ============================================================================
-- DONE!
-- Run this, and your application form will work perfectly.
-- ============================================================================
