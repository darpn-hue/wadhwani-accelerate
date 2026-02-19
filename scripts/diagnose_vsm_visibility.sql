-- ============================================================================
-- DIAGNOSE VSM DASHBOARD VISIBILITY ISSUES
-- ============================================================================
-- Run this in Supabase SQL Editor to diagnose why ventures aren't showing
-- in the VSM Dashboard (Screening Manager)
-- ============================================================================

-- ============================================================================
-- STEP 1: Check all ventures and their visibility
-- ============================================================================

SELECT
    id,
    name,
    founder_name,
    status,
    program_recommendation,
    user_id,
    created_at,
    vsm_reviewed_at
FROM ventures
ORDER BY created_at DESC
LIMIT 20;

-- ============================================================================
-- STEP 2: Check RLS policies on ventures table
-- ============================================================================

SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'ventures'
ORDER BY policyname;

-- ============================================================================
-- STEP 3: Check if there are any ventures with status 'Submitted'
-- ============================================================================

SELECT
    COUNT(*) as total_ventures,
    COUNT(CASE WHEN status = 'Submitted' THEN 1 END) as submitted_ventures,
    COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_ventures,
    COUNT(CASE WHEN status = 'Under Review' THEN 1 END) as under_review_ventures
FROM ventures;

-- ============================================================================
-- STEP 4: Check recent venture creations
-- ============================================================================

SELECT
    v.id,
    v.name,
    v.status,
    v.created_at,
    v.user_id,
    p.role as entrepreneur_role
FROM ventures v
LEFT JOIN profiles p ON v.user_id = p.id
WHERE v.created_at > NOW() - INTERVAL '7 days'
ORDER BY v.created_at DESC;

-- ============================================================================
-- STEP 5: Test if a specific user (success manager) can see all ventures
-- ============================================================================

-- Replace 'your-success-manager-user-id' with actual user ID
-- SELECT
--     id,
--     name,
--     status,
--     program_recommendation
-- FROM ventures
-- WHERE (
--     -- This should match your RLS policy conditions
--     user_id = 'your-success-manager-user-id'
--     OR
--     EXISTS (
--         SELECT 1 FROM profiles
--         WHERE profiles.id = 'your-success-manager-user-id'
--         AND profiles.role IN ('success_mgr', 'committee', 'venture_mgr', 'admin')
--     )
-- );

-- ============================================================================
-- EXPECTED RESULTS
-- ============================================================================
--
-- If VSM Dashboard should show a venture, check:
-- ✅ Venture status should be 'Submitted' (not 'draft')
-- ✅ RLS policy should allow success_mgr role to SELECT all ventures
-- ✅ No client-side filtering should exclude it
--
-- Common Issues:
-- ❌ Venture status is still 'draft' (not submitted properly)
-- ❌ RLS policy only allows seeing own ventures
-- ❌ Profile role is not 'success_mgr' or 'admin'
-- ============================================================================
