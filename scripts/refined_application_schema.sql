
-- ============================================================================
-- REFINED SUPABASE SCHEMA FOR VENTURE APPLICATION PROCESS
-- ============================================================================
-- Based on the exact fields used in NewApplication.tsx and the existing schema structure.
-- This script ensures all tables and columns needed for the application flow exist.
-- ============================================================================

-- 1. PROFILES (Standard Auth)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  updated_at timestamptz DEFAULT now(),
  full_name text,
  role text CHECK (role IN ('entrepreneur', 'success_mgr', 'admin', 'committee_member')),
  avatar_url text
);

-- RLS (Standard)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. VENTURES (Core Application Data)
-- ----------------------------------------------------------------------------
-- This table stores the bulk of the form data from Step 1, 2, and 4.
CREATE TABLE IF NOT EXISTS public.ventures (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  
  -- Core Identification
  name text NOT NULL,             -- Form: businessName
  program text,                   -- Form: hardcoded 'Accelerate'
  status text DEFAULT 'draft',    -- 'draft', 'submitted', 'review', etc.
  
  -- Step 1: Business Information (Stored in structured JSON for flexibility or columns)
  -- We will use JSONB for the complex nested data to keep the schema clean and adaptable.
  growth_current jsonb,           
  -- Covers: product, segment, geography, city, state, business_type, referred_by, employees, role, email, phone

  -- Step 2: Growth Focus
  growth_focus text,              -- Form: growthFocus.join(',') (e.g., "product,segment")
  
  -- Financials & Commitments (Step 2)
  commitment jsonb,
  -- Covers: investment, incrementalHiring, revenuePotential, lastYearRevenue

  -- Step 4: Support Request
  support_request text,           -- Form: specificSupportRequired
  
  -- Additional fields for standard process
  founder_name text,              -- Form: managingDirector (promoted to column for easy search)
  description text,               -- Can be populated from growth_current->product
  blockers text                   -- Form: (empty string sent currently)
);

-- RLS for Ventures
ALTER TABLE public.ventures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own ventures" ON public.ventures FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own ventures" ON public.ventures FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ventures" ON public.ventures FOR UPDATE USING (auth.uid() = user_id);

-- 3. VENTURE STREAMS (Step 3: Workstream Status)
-- ----------------------------------------------------------------------------
-- This table stores the status of each workstream (Product, GTM, Funding, etc.)
CREATE TABLE IF NOT EXISTS public.venture_streams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  venture_id uuid REFERENCES public.ventures(id) ON DELETE CASCADE,
  stream_name text NOT NULL,      -- e.g., "Product", "GTM"
  status text DEFAULT 'No help needed', -- e.g., "Need help", "No help needed"
  created_at timestamptz DEFAULT now()
);

-- RLS for Venture Streams
ALTER TABLE public.venture_streams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own streams" ON public.venture_streams FOR SELECT USING (EXISTS (SELECT 1 FROM public.ventures WHERE id = public.venture_streams.venture_id AND user_id = auth.uid()));
CREATE POLICY "Users insert own streams" ON public.venture_streams FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.ventures WHERE id = public.venture_streams.venture_id AND user_id = auth.uid()));
CREATE POLICY "Users update own streams" ON public.venture_streams FOR UPDATE USING (EXISTS (SELECT 1 FROM public.ventures WHERE id = public.venture_streams.venture_id AND user_id = auth.uid()));


-- ============================================================================
-- SUMMARY OF MAPPING
-- ============================================================================
-- Frontend Field                -> DB Column / JSON Path
-- ----------------------------------------------------------------------------
-- businessName                  -> ventures.name
-- managingDirector              -> ventures.founder_name
-- whatDoYouSell                 -> ventures.growth_current->product
-- whoDoYouSellTo                -> ventures.growth_current->segment
-- whichRegions                  -> ventures.growth_current->geography
-- city                          -> ventures.growth_current->city
-- state                         -> ventures.growth_current->state
-- companyType                   -> ventures.growth_current->business_type
-- referredBy                    -> ventures.growth_current->referred_by
-- numberOfEmployees             -> ventures.growth_current->employees
-- role                          -> ventures.growth_current->role
-- email                         -> ventures.growth_current->email
-- phone                         -> ventures.growth_current->phone
-- growthFocus                   -> ventures.growth_focus
-- focusProduct                  -> (Would be in growth_focus logic or separate json)
-- focusSegment                  -> (Would be in growth_focus logic or separate json)
-- focusGeography                -> (Would be in growth_focus logic or separate json)
-- revenuePotential12m           -> ventures.commitment->revenuePotential
-- requestedInvestmentLimit      -> ventures.commitment->investment
-- incrementalHiring             -> ventures.commitment->incrementalHiring
-- lastYearRevenue               -> ventures.commitment->lastYearRevenue
-- workstreamStatuses            -> venture_streams (table)
-- specificSupportRequired       -> ventures.support_request
