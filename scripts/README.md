# SQL Scripts Directory

This directory contains various SQL scripts for database setup, diagnostics, and maintenance.

## 🚀 Setup Scripts

### Required (Run in Order)
1. **`../fresh_supabase_setup.sql`** - Initial database schema setup
   - Creates all tables (profiles, ventures, programs, etc.)
   - Sets up Row Level Security policies
   - Inserts initial program data
   - **Run this FIRST on a fresh Supabase project**

2. **`../vsm_schema_migration.sql`** - VSM Dashboard migration
   - Adds VSM workflow columns (vsm_notes, program_recommendation, etc.)
   - Updates RLS policies for VSM features
   - **Run this AFTER fresh_supabase_setup.sql**

3. **`../fix_profiles_roles.sql`** - Fix NULL roles in profiles
   - Populates missing profiles from auth.users
   - Updates NULL roles based on email patterns
   - **Run if ventures aren't visible in VSM Dashboard**

## 🔍 Diagnostic Scripts

### `diagnose_vsm_visibility.sql`
Diagnose why ventures aren't showing in VSM Dashboard.
- Checks venture statuses
- Examines RLS policies
- Verifies user roles
- **Use when**: Ventures created but not visible to success managers

### `quick_check_ventures.sql`
Quick status check for all ventures.
- Lists all ventures with statuses
- Counts by status
- Simple queries for fast debugging

### `check_schema.sql`
Verify database schema is correct.
- Checks if all required columns exist
- Verifies table structure
- **Use when**: Getting "column does not exist" errors

## 🛠️ Maintenance Scripts

### `truncate_for_demo.sql`
⚠️ **DESTRUCTIVE** - Clears all user data for demo/testing.
- Truncates all user-generated data tables
- Preserves reference data (programs table)
- **DO NOT run on production!**

## 🔧 Fix Scripts

### `fix_streams_policy.sql`
Fix RLS policies for venture_streams table.
- Updates policies to allow proper access
- **Use when**: Stream data not loading

### `add_missing_columns.sql`
Add any missing columns to existing tables.
- Safe to re-run (uses IF NOT EXISTS)
- **Use when**: Schema updates needed

## 📦 Legacy/Archive Scripts

The following scripts are kept for reference but are superseded by the main setup scripts:

- `rebuild_application_schema.sql` - Old schema rebuild (use fresh_supabase_setup.sql instead)
- `clean_app_schema.sql` - Old cleanup script
- `supabase_schema.sql` - Legacy schema definition
- `complete_schema_fix.sql` - Old comprehensive fix
- `refined_application_schema.sql` - Old schema version

## 📝 Usage Notes

1. **Always backup your database** before running any script
2. **Test in development** before running in production
3. **Read the script** before executing to understand what it does
4. **Run scripts in order** when setting up a fresh database
5. **Check Supabase logs** if you encounter errors

## 🆘 Common Issues

**Issue**: "Column does not exist"
- **Solution**: Run `check_schema.sql` to verify, then `vsm_schema_migration.sql`

**Issue**: "Ventures not visible in VSM Dashboard"
- **Solution**: Run `diagnose_vsm_visibility.sql`, then `fix_profiles_roles.sql`

**Issue**: "Email rate limit exceeded"
- **Solution**: See [FIX_EMAIL_RATE_LIMIT.md](../FIX_EMAIL_RATE_LIMIT.md)
