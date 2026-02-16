-- Add new columns for Application Workflow Phase 12

DO $$ 
BEGIN 
    -- Section 1: Business
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ventures' AND column_name = 'city') THEN 
        ALTER TABLE ventures ADD COLUMN city text; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ventures' AND column_name = 'revenue_12m') THEN 
        ALTER TABLE ventures ADD COLUMN revenue_12m text; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ventures' AND column_name = 'full_time_employees') THEN 
        ALTER TABLE ventures ADD COLUMN full_time_employees text; 
    END IF;

    -- Section 2: Venture
    -- Reusing 'program' or creating specific 'growth_focus' if needed. 
    -- existing 'growth_target' JSONB can hold this, but explicit columns are requested in schema update plan.
    -- Let's add them as columns for clarity as per plan.
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ventures' AND column_name = 'growth_focus') THEN 
        ALTER TABLE ventures ADD COLUMN growth_focus text; -- New Product, New Segment, New Geography
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ventures' AND column_name = 'revenue_potential_3y') THEN 
        ALTER TABLE ventures ADD COLUMN revenue_potential_3y text; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ventures' AND column_name = 'min_investment') THEN 
        ALTER TABLE ventures ADD COLUMN min_investment text; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ventures' AND column_name = 'incremental_hiring') THEN 
        ALTER TABLE ventures ADD COLUMN incremental_hiring text; 
    END IF;

    -- Section 3: Status (Blockers) -> Streams are in venture_streams
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ventures' AND column_name = 'blockers') THEN 
        ALTER TABLE ventures ADD COLUMN blockers text; 
    END IF;

    -- Section 4: Support
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ventures' AND column_name = 'support_request') THEN 
        ALTER TABLE ventures ADD COLUMN support_request text; 
    END IF;

END $$;
