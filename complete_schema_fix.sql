-- ============================================================================
-- COMPLETE SCHEMA FIX — Run this in Supabase SQL Editor
-- Covers: missing columns + missing RLS UPDATE policies for staff
-- ============================================================================

-- ── STEP 1: Add all missing columns (safe, IF NOT EXISTS) ──────────────────

DO $$
BEGIN

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ventures' AND column_name='growth_target') THEN
    ALTER TABLE public.ventures ADD COLUMN growth_target jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ventures' AND column_name='program_recommendation') THEN
    ALTER TABLE public.ventures ADD COLUMN program_recommendation text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ventures' AND column_name='vsm_notes') THEN
    ALTER TABLE public.ventures ADD COLUMN vsm_notes text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ventures' AND column_name='internal_comments') THEN
    ALTER TABLE public.ventures ADD COLUMN internal_comments text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ventures' AND column_name='ai_analysis') THEN
    ALTER TABLE public.ventures ADD COLUMN ai_analysis jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ventures' AND column_name='venture_partner') THEN
    ALTER TABLE public.ventures ADD COLUMN venture_partner text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ventures' AND column_name='agreement_status') THEN
    ALTER TABLE public.ventures ADD COLUMN agreement_status text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ventures' AND column_name='location') THEN
    ALTER TABLE public.ventures ADD COLUMN location text;
  END IF;

END $$;


-- ── STEP 2: Fix RLS — add missing UPDATE policy for staff ──────────────────
-- Without this, VSM/Committee "Submit Assessment" silently fails
-- because the only UPDATE policy checks auth.uid() = user_id (owner only)

-- Drop if exists (to avoid duplicate policy errors on re-run)
DROP POLICY IF EXISTS "Staff can update all ventures" ON public.ventures;

CREATE POLICY "Staff can update all ventures" ON public.ventures
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('success_mgr', 'admin', 'committee_member', 'venture_mgr')
    )
  );


-- ── STEP 3: Fix RLS — ensure staff can SELECT across all personas ──────────
-- Recreate to include venture_mgr (was missing from ventures SELECT policy)

DROP POLICY IF EXISTS "Staff can view all ventures" ON public.ventures;

CREATE POLICY "Staff can view all ventures" ON public.ventures
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('success_mgr', 'admin', 'committee_member', 'venture_mgr')
    )
  );


-- ── STEP 4: Verify — confirm columns and policies ─────────────────────────

-- Check all columns:
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'ventures'
ORDER BY ordinal_position;

-- Check all RLS policies:
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'ventures'
ORDER BY policyname;

-- ============================================================================
-- DATA FLOW SUMMARY (what gets saved at each stage):
--
-- [ENTREPRENEUR SUBMIT]
--   ventures: name, founder_name, program, status='Submitted',
--             growth_current (product/segment/geography/city/employees/etc.)
--             growth_target (new product/segment/geography)
--             commitment (lastYearRevenue, revenuePotential, investment, hiring)
--             growth_focus, support_request, blockers
--   venture_streams: stream_name + status per workstream (6 rows)
--
-- [SCREENING MANAGER SUBMIT]
--   ventures UPDATE: vsm_notes, program_recommendation, internal_comments,
--                    status → 'Under Review', ai_analysis
--
-- [COMMITTEE SUBMIT]
--   ventures UPDATE: venture_partner, program_recommendation (confirm/change)
--
-- [VENTURE MANAGER VIEW]
--   Reads: all of the above (filtered by program_recommendation='Accelerate Prime')
-- ============================================================================
