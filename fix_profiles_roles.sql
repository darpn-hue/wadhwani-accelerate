-- ============================================================================
-- FIX PROFILES ROLES - Populate missing roles from auth.users
-- ============================================================================
-- This script fixes the NULL roles in profiles table by querying auth.users
-- ============================================================================

-- ============================================================================
-- STEP 1: Check current profiles state
-- ============================================================================

SELECT
    id,
    full_name,
    role
FROM profiles
ORDER BY updated_at DESC;

-- ============================================================================
-- STEP 2: Insert missing profiles from auth.users
-- ============================================================================
-- Create profiles for users who don't have one yet

INSERT INTO profiles (id, full_name, role)
SELECT
    au.id,
    au.raw_user_meta_data->>'full_name' as full_name,
    CASE
        WHEN au.email LIKE '%admin%' THEN 'success_mgr'
        WHEN au.email LIKE '%committee%' THEN 'committee'
        WHEN au.raw_user_meta_data->>'role' IS NOT NULL THEN au.raw_user_meta_data->>'role'
        ELSE 'entrepreneur'
    END as role
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 3: Update NULL roles in existing profiles
-- ============================================================================
-- Fix profiles that exist but have NULL role

UPDATE profiles p
SET role = CASE
    WHEN au.email LIKE '%admin%' THEN 'success_mgr'
    WHEN au.email LIKE '%committee%' THEN 'committee'
    WHEN au.raw_user_meta_data->>'role' IS NOT NULL THEN au.raw_user_meta_data->>'role'
    ELSE 'entrepreneur'
END,
full_name = COALESCE(p.full_name, au.raw_user_meta_data->>'full_name')
FROM auth.users au
WHERE p.id = au.id AND p.role IS NULL;

-- ============================================================================
-- STEP 4: Verify the fix worked
-- ============================================================================

-- Check profiles now have roles
SELECT
    p.id,
    p.full_name,
    p.role,
    au.email
FROM profiles p
JOIN auth.users au ON p.id = au.id
ORDER BY p.updated_at DESC;

-- Check ventures with their entrepreneur roles
SELECT
    v.id,
    v.name,
    v.status,
    v.created_at,
    v.user_id,
    p.role as entrepreneur_role,
    au.email as entrepreneur_email
FROM ventures v
LEFT JOIN profiles p ON v.user_id = p.id
LEFT JOIN auth.users au ON v.user_id = au.id
WHERE v.created_at > NOW() - INTERVAL '7 days'
ORDER BY v.created_at DESC;

-- ============================================================================
-- EXPECTED RESULTS
-- ============================================================================
-- ✅ All profiles should have a role (no NULL values)
-- ✅ Ventures should show entrepreneur_role correctly
-- ✅ VSM Dashboard should now display all ventures for success_mgr users
-- ============================================================================
