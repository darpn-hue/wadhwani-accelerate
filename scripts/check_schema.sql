-- ============================================================================
-- SCHEMA DIAGNOSTIC - Check which columns exist in ventures table
-- Run this to see what's missing
-- ============================================================================

SELECT
    'ventures' as table_name,
    column_name,
    data_type,
    is_nullable,
    CASE
        WHEN column_name IN ('vsm_notes', 'program_recommendation', 'internal_comments',
                            'ai_analysis', 'vsm_reviewed_at', 'venture_partner')
        THEN '✓ VSM FIELD'
        ELSE ''
    END as field_type
FROM information_schema.columns
WHERE table_name = 'ventures'
ORDER BY
    CASE
        WHEN column_name IN ('vsm_notes', 'program_recommendation', 'internal_comments',
                            'ai_analysis', 'vsm_reviewed_at', 'venture_partner')
        THEN 0
        ELSE 1
    END,
    column_name;

-- ============================================================================
-- Check specifically for VSM fields
-- ============================================================================
SELECT
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.columns
                     WHERE table_name='ventures' AND column_name='vsm_notes')
        THEN '✓ EXISTS'
        ELSE '✗ MISSING - Run migration!'
    END as vsm_notes,

    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.columns
                     WHERE table_name='ventures' AND column_name='program_recommendation')
        THEN '✓ EXISTS'
        ELSE '✗ MISSING - Run migration!'
    END as program_recommendation,

    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.columns
                     WHERE table_name='ventures' AND column_name='internal_comments')
        THEN '✓ EXISTS'
        ELSE '✗ MISSING - Run migration!'
    END as internal_comments,

    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.columns
                     WHERE table_name='ventures' AND column_name='ai_analysis')
        THEN '✓ EXISTS'
        ELSE '✗ MISSING - Run migration!'
    END as ai_analysis,

    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.columns
                     WHERE table_name='ventures' AND column_name='vsm_reviewed_at')
        THEN '✓ EXISTS'
        ELSE '✗ MISSING - Run migration!'
    END as vsm_reviewed_at,

    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.columns
                     WHERE table_name='ventures' AND column_name='venture_partner')
        THEN '✓ EXISTS'
        ELSE '✗ MISSING - Run migration!'
    END as venture_partner;
