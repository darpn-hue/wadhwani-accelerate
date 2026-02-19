-- ============================================================================
-- ADD MISSING COLUMNS TO VENTURES TABLE
-- Run this in the Supabase SQL Editor
-- This is safe to run multiple times (uses IF NOT EXISTS pattern via DO block)
-- ============================================================================

DO $$
BEGIN

  -- 1. growth_target (JSONB) — used by Step 2 of application form
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ventures' AND column_name='growth_target') THEN
    ALTER TABLE public.ventures ADD COLUMN growth_target jsonb;
  END IF;

  -- 2. program_recommendation — used by VSM Dashboard to recommend a program
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ventures' AND column_name='program_recommendation') THEN
    ALTER TABLE public.ventures ADD COLUMN program_recommendation text;
  END IF;

  -- 3. vsm_notes — call transcript / notes entered by the screening manager
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ventures' AND column_name='vsm_notes') THEN
    ALTER TABLE public.ventures ADD COLUMN vsm_notes text;
  END IF;

  -- 4. internal_comments — committee-only comments
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ventures' AND column_name='internal_comments') THEN
    ALTER TABLE public.ventures ADD COLUMN internal_comments text;
  END IF;

  -- 5. ai_analysis (JSONB) — stores strengths, risks, questions from AI analysis
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ventures' AND column_name='ai_analysis') THEN
    ALTER TABLE public.ventures ADD COLUMN ai_analysis jsonb;
  END IF;

  -- 6. venture_partner — assigned venture partner (committee step)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ventures' AND column_name='venture_partner') THEN
    ALTER TABLE public.ventures ADD COLUMN venture_partner text;
  END IF;

  -- 7. agreement_status — e.g., 'Sent', 'Signed'
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ventures' AND column_name='agreement_status') THEN
    ALTER TABLE public.ventures ADD COLUMN agreement_status text;
  END IF;

  -- 8. location — display field used in venture cards
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ventures' AND column_name='location') THEN
    ALTER TABLE public.ventures ADD COLUMN location text;
  END IF;

END $$;

-- ============================================================================
-- VERIFY: Run this SELECT to confirm all columns are now present
-- ============================================================================
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'ventures'
ORDER BY ordinal_position;
