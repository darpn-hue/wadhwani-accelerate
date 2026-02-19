-- ============================================================================
-- VSM DASHBOARD SCHEMA MIGRATION
-- Adds all missing columns required for VSM Dashboard program recommendation
-- Safe to run multiple times (uses IF NOT EXISTS checks)
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Starting VSM schema migration...';

  -- ========================================================================
  -- STEP 1: Core business information fields (from application form)
  -- ========================================================================

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='ventures' AND column_name='founder_name') THEN
    ALTER TABLE public.ventures ADD COLUMN founder_name text;
    RAISE NOTICE 'Added column: founder_name';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='ventures' AND column_name='city') THEN
    ALTER TABLE public.ventures ADD COLUMN city text;
    RAISE NOTICE 'Added column: city';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='ventures' AND column_name='revenue_12m') THEN
    ALTER TABLE public.ventures ADD COLUMN revenue_12m text;
    RAISE NOTICE 'Added column: revenue_12m';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='ventures' AND column_name='full_time_employees') THEN
    ALTER TABLE public.ventures ADD COLUMN full_time_employees text;
    RAISE NOTICE 'Added column: full_time_employees';
  END IF;

  -- ========================================================================
  -- STEP 2: Growth & financial fields
  -- ========================================================================

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='ventures' AND column_name='growth_focus') THEN
    ALTER TABLE public.ventures ADD COLUMN growth_focus text;
    RAISE NOTICE 'Added column: growth_focus';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='ventures' AND column_name='revenue_potential_3y') THEN
    ALTER TABLE public.ventures ADD COLUMN revenue_potential_3y text;
    RAISE NOTICE 'Added column: revenue_potential_3y';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='ventures' AND column_name='min_investment') THEN
    ALTER TABLE public.ventures ADD COLUMN min_investment text;
    RAISE NOTICE 'Added column: min_investment';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='ventures' AND column_name='incremental_hiring') THEN
    ALTER TABLE public.ventures ADD COLUMN incremental_hiring text;
    RAISE NOTICE 'Added column: incremental_hiring';
  END IF;

  -- ========================================================================
  -- STEP 3: JSONB fields for structured data
  -- ========================================================================

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='ventures' AND column_name='growth_current') THEN
    ALTER TABLE public.ventures ADD COLUMN growth_current jsonb;
    RAISE NOTICE 'Added column: growth_current';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='ventures' AND column_name='growth_target') THEN
    ALTER TABLE public.ventures ADD COLUMN growth_target jsonb;
    RAISE NOTICE 'Added column: growth_target';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='ventures' AND column_name='commitment') THEN
    ALTER TABLE public.ventures ADD COLUMN commitment jsonb;
    RAISE NOTICE 'Added column: commitment';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='ventures' AND column_name='needs') THEN
    ALTER TABLE public.ventures ADD COLUMN needs jsonb;
    RAISE NOTICE 'Added column: needs';
  END IF;

  -- ========================================================================
  -- STEP 4: VSM (Success Manager) workflow fields
  -- ========================================================================

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='ventures' AND column_name='vsm_notes') THEN
    ALTER TABLE public.ventures ADD COLUMN vsm_notes text;
    RAISE NOTICE 'Added column: vsm_notes';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='ventures' AND column_name='program_recommendation') THEN
    ALTER TABLE public.ventures ADD COLUMN program_recommendation text;
    RAISE NOTICE 'Added column: program_recommendation';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='ventures' AND column_name='internal_comments') THEN
    ALTER TABLE public.ventures ADD COLUMN internal_comments text;
    RAISE NOTICE 'Added column: internal_comments';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='ventures' AND column_name='ai_analysis') THEN
    ALTER TABLE public.ventures ADD COLUMN ai_analysis jsonb;
    RAISE NOTICE 'Added column: ai_analysis';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='ventures' AND column_name='vsm_reviewed_at') THEN
    ALTER TABLE public.ventures ADD COLUMN vsm_reviewed_at timestamptz;
    RAISE NOTICE 'Added column: vsm_reviewed_at';
  END IF;

  -- ========================================================================
  -- STEP 5: Committee workflow fields
  -- ========================================================================

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='ventures' AND column_name='venture_partner') THEN
    ALTER TABLE public.ventures ADD COLUMN venture_partner text;
    RAISE NOTICE 'Added column: venture_partner';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='ventures' AND column_name='committee_feedback') THEN
    ALTER TABLE public.ventures ADD COLUMN committee_feedback text;
    RAISE NOTICE 'Added column: committee_feedback';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='ventures' AND column_name='committee_decision') THEN
    ALTER TABLE public.ventures ADD COLUMN committee_decision text;
    RAISE NOTICE 'Added column: committee_decision';
  END IF;

  -- ========================================================================
  -- STEP 6: Agreement workflow fields
  -- ========================================================================

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='ventures' AND column_name='agreement_status') THEN
    ALTER TABLE public.ventures ADD COLUMN agreement_status text;
    RAISE NOTICE 'Added column: agreement_status';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='ventures' AND column_name='location') THEN
    ALTER TABLE public.ventures ADD COLUMN location text;
    RAISE NOTICE 'Added column: location';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='ventures' AND column_name='blockers') THEN
    ALTER TABLE public.ventures ADD COLUMN blockers text;
    RAISE NOTICE 'Added column: blockers';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='ventures' AND column_name='support_request') THEN
    ALTER TABLE public.ventures ADD COLUMN support_request text;
    RAISE NOTICE 'Added column: support_request';
  END IF;

  RAISE NOTICE 'VSM schema migration completed successfully!';
END $$;

-- ============================================================================
-- VERIFICATION: Check that all columns exist
-- ============================================================================
SELECT
  column_name,
  data_type,
  CASE
    WHEN column_name IN (
      'vsm_notes', 'program_recommendation', 'internal_comments', 'ai_analysis',
      'venture_partner', 'agreement_status', 'growth_target'
    ) THEN '✓ VSM Field'
    ELSE ''
  END as field_category
FROM information_schema.columns
WHERE table_name = 'ventures'
  AND column_name IN (
    -- VSM critical fields
    'vsm_notes',
    'program_recommendation',
    'internal_comments',
    'ai_analysis',
    'vsm_reviewed_at',
    'venture_partner',
    'agreement_status',
    'growth_target',
    'growth_current',
    'commitment',
    -- Application form fields
    'founder_name',
    'city',
    'revenue_12m',
    'full_time_employees',
    'growth_focus',
    'revenue_potential_3y',
    'min_investment',
    'incremental_hiring'
  )
ORDER BY column_name;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '=================================================================';
  RAISE NOTICE 'Schema migration complete!';
  RAISE NOTICE 'VSM Dashboard can now save: program_recommendation, vsm_notes,';
  RAISE NOTICE 'internal_comments, ai_analysis, and venture_partner';
  RAISE NOTICE '=================================================================';
END $$;
