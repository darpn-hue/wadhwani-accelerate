-- ============================================================================
-- QUICK CHECK: Why ventures aren't showing in VSM Dashboard
-- ============================================================================

-- ============================================================================
-- 1. Check all ventures (simple)
-- ============================================================================

SELECT
    id,
    name,
    status,
    created_at
FROM ventures
ORDER BY created_at DESC;

-- ============================================================================
-- 2. Count by status
-- ============================================================================

SELECT
    status,
    COUNT(*) as count
FROM ventures
GROUP BY status;

-- ============================================================================
-- 3. Update all draft ventures to Submitted (if needed)
-- ============================================================================

-- UNCOMMENT BELOW TO FIX:
-- UPDATE ventures
-- SET status = 'Submitted'
-- WHERE status = 'draft';

-- ============================================================================
-- 4. Verify the fix worked
-- ============================================================================

-- Run this after the UPDATE:
-- SELECT status, COUNT(*) as count
-- FROM ventures
-- GROUP BY status;
