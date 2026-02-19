
-- ============================================================================
-- REBUILD SCHEMA FOR APPLICATION PROCESS (Idempotent / Fixes Conflicts)
-- ============================================================================
-- This script will:
-- 1. Safely drop the specific application tables to ensure a clean slate.
-- 2. Re-create them with the exact structure needed for the demo.
-- 3. Update 'profiles' policies without erroring if they already exist.
-- ============================================================================

-- 1. CLEANUP (Drop tables to standardise structure)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS public.venture_streams CASCADE;
DROP TABLE IF EXISTS public.ventures CASCADE;
-- We do NOT drop profiles to avoid losing registered users/auth links.

-- 2. PROFILES (Ensure table exists & update policies)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  updated_at timestamptz DEFAULT now(),
  full_name text,
  role text CHECK (role IN ('entrepreneur', 'success_mgr', 'admin', 'committee_member')),
  avatar_url text
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Safely recreate policies (Drop first to avoid "policy already exists" error)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- 3. VENTURES (The Core Application Table)
-- ----------------------------------------------------------------------------
CREATE TABLE public.ventures (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  
  -- Core Fields
  name text NOT NULL,             
  program text,                   
  status text DEFAULT 'draft',    
  
  -- Flexible Data Columns (JSONB matches frontend API structure)
  growth_current jsonb,           
  growth_focus text,              
  commitment jsonb,
  
  -- Additional Columns
  founder_name text,              
  support_request text,           
  description text,               
  blockers text                   
);

ALTER TABLE public.ventures ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their own ventures" ON public.ventures;
CREATE POLICY "Users can view their own ventures" ON public.ventures FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own ventures" ON public.ventures;
CREATE POLICY "Users can insert their own ventures" ON public.ventures FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own ventures" ON public.ventures;
CREATE POLICY "Users can update their own ventures" ON public.ventures FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff can view all ventures" ON public.ventures;
CREATE POLICY "Staff can view all ventures" ON public.ventures FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('success_mgr', 'admin', 'committee_member'))
);


-- 4. VENTURE STREAMS (Workstream Status)
-- ----------------------------------------------------------------------------
CREATE TABLE public.venture_streams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  venture_id uuid REFERENCES public.ventures(id) ON DELETE CASCADE,
  stream_name text NOT NULL,      
  status text DEFAULT 'No help needed', 
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.venture_streams ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users view own streams" ON public.venture_streams;
CREATE POLICY "Users view own streams" ON public.venture_streams FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.ventures WHERE id = public.venture_streams.venture_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users insert own streams" ON public.venture_streams;
CREATE POLICY "Users insert own streams" ON public.venture_streams FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.ventures WHERE id = public.venture_streams.venture_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users update own streams" ON public.venture_streams;
CREATE POLICY "Users update own streams" ON public.venture_streams FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.ventures WHERE id = public.venture_streams.venture_id AND user_id = auth.uid())
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- SELECT * FROM ventures; -- Should be empty and ready
