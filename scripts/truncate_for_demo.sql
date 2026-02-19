-- ============================================================================
-- TRUNCATE ALL TABLES FOR DEMO
-- ============================================================================
-- ⚠️  WARNING: This will DELETE ALL DATA from user tables!
-- ⚠️  This is IRREVERSIBLE. Only run this on development/demo databases.
-- ⚠️  DO NOT run this on production!
-- ============================================================================

-- Disable triggers temporarily to avoid any issues
SET session_replication_role = replica;

-- ============================================================================
-- STEP 1: Truncate all user-generated data tables
-- ============================================================================

-- Truncate venture-related tables (CASCADE handles foreign keys)
TRUNCATE TABLE venture_history CASCADE;
TRUNCATE TABLE support_hours CASCADE;
TRUNCATE TABLE venture_milestones CASCADE;
TRUNCATE TABLE venture_streams CASCADE;
TRUNCATE TABLE ventures CASCADE;

-- Truncate user profiles (this will remove all users except auth.users)
TRUNCATE TABLE profiles CASCADE;

-- ============================================================================
-- STEP 2: Reset sequences to start fresh
-- ============================================================================

-- Note: If you have any sequences, reset them here
-- Example: ALTER SEQUENCE venture_id_seq RESTART WITH 1;

-- ============================================================================
-- STEP 3: Re-enable triggers
-- ============================================================================

SET session_replication_role = DEFAULT;

-- ============================================================================
-- STEP 4: Verify tables are empty
-- ============================================================================

-- Check row counts
SELECT 'ventures' as table_name, COUNT(*) as row_count FROM ventures
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'venture_streams', COUNT(*) FROM venture_streams
UNION ALL
SELECT 'venture_milestones', COUNT(*) FROM venture_milestones
UNION ALL
SELECT 'support_hours', COUNT(*) FROM support_hours
UNION ALL
SELECT 'venture_history', COUNT(*) FROM venture_history
UNION ALL
SELECT 'programs', COUNT(*) FROM programs;

-- ============================================================================
-- RESULT: All user data cleared, programs preserved
-- ============================================================================
-- ✅ ventures: 0 rows
-- ✅ profiles: 0 rows
-- ✅ venture_streams: 0 rows
-- ✅ venture_milestones: 0 rows
-- ✅ support_hours: 0 rows
-- ✅ venture_history: 0 rows
-- ✅ programs: 5 rows (PRESERVED - reference data)
-- ============================================================================

-- IMPORTANT NOTES:
-- 1. The 'programs' table is NOT truncated (contains reference data)
-- 2. You'll need to delete users from Supabase Auth separately:
--    Go to: Supabase Dashboard → Authentication → Users → Delete manually
-- 3. After running this, the database is ready for fresh demo data
-- ============================================================================
