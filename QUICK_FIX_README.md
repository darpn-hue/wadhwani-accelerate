# Quick Fix for Error 5174

## Problem
You're getting error **5174** when submitting because the database columns don't exist yet.

## Root Cause
The code is trying to save fields (`vsm_reviewed_at`, `ai_analysis`, etc.) to columns that haven't been added to the database yet.

## Solution Options

### Option 1: Run the Migration NOW (Recommended)
This adds all missing columns to your database.

**Steps:**
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the entire contents of `vsm_schema_migration.sql`
3. Click "Run"
4. Wait for success message
5. Try submitting again

**Time:** 30 seconds

---

### Option 2: Temporary Fix (If you can't run migration now)
Comment out the new fields temporarily until you can run the migration.

**Edit VSMDashboard.tsx line 352-359:**

```typescript
// BEFORE (Current - causes error)
const updatePayload: any = {
    vsm_notes: vsmNotes,
    program_recommendation: program,
    internal_comments: internalComments,
    status: 'Under Review',
    ai_analysis: analysisResult || selectedVenture.ai_analysis,
    vsm_reviewed_at: new Date().toISOString() // ← This causes error!
};

// AFTER (Temporary fix)
const updatePayload: any = {
    vsm_notes: vsmNotes,
    program_recommendation: program,
    internal_comments: internalComments,
    status: 'Under Review',
    ai_analysis: analysisResult || selectedVenture.ai_analysis,
    // vsm_reviewed_at: new Date().toISOString() // ← Commented out
};
```

**⚠️ Note:** This is temporary. You still need to run the migration later to get full functionality.

---

## Diagnostic Steps

### 1. Check Browser Console
Open browser DevTools (F12) → Console tab

Look for detailed error message:
```
Supabase update error: {
  code: "42703",
  message: "column \"vsm_reviewed_at\" does not exist",
  details: "...",
  hint: "..."
}
```

### 2. Check Database Schema
Run this in Supabase SQL Editor:

```sql
-- See what columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'ventures'
ORDER BY column_name;
```

Or use our diagnostic script:
```bash
# In Supabase SQL Editor, run:
check_schema.sql
```

### 3. Verify Migration Status
Run this query:
```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'ventures'
  AND column_name IN ('vsm_reviewed_at', 'ai_analysis', 'venture_partner');
```

**Expected if migration NOT run:**
```
(0 rows)
```

**Expected if migration already run:**
```
 column_name
--------------
 ai_analysis
 venture_partner
 vsm_reviewed_at
```

---

## Common Error Codes

| Error Code | Meaning | Solution |
|------------|---------|----------|
| 42703 | Column does not exist | Run migration |
| 42P01 | Table does not exist | Check table name |
| 23505 | Duplicate key | Check unique constraints |
| 23502 | Not null violation | Check required fields |
| 42501 | Insufficient privilege | Check RLS policies |

---

## Step-by-Step Recovery

**If you see error 5174 or similar:**

1. **Open browser console** (F12)
   - Look for the detailed error message
   - Note which column is missing

2. **Verify the issue:**
   ```bash
   # In Supabase SQL Editor:
   SELECT column_name FROM information_schema.columns
   WHERE table_name='ventures' AND column_name='vsm_reviewed_at';
   ```

   If returns no rows → Column doesn't exist

3. **Run the migration:**
   - Open `vsm_schema_migration.sql`
   - Copy entire contents
   - Paste in Supabase SQL Editor
   - Click "Run"
   - Wait for "Schema migration completed successfully!"

4. **Try again:**
   - Go back to VSM Dashboard
   - Click Submit
   - Should work now ✓

---

## Testing After Fix

### Quick Test
1. Log in as VSM (admin@test.com)
2. Select a venture
3. Fill in recommendation form
4. Click Submit
5. Should see: "✓ Recommendation submitted successfully!"

### Verify Persistence
1. Refresh page (F5)
2. Go back to VSM Dashboard
3. Click the same venture
4. Check that:
   - Status = "Under Review" ✓
   - Program recommendation saved ✓
   - Notes saved ✓
   - AI analysis saved ✓

---

## Prevention

To avoid this in future:
1. Always run migrations before deploying code changes
2. Use staging environment to test schema changes
3. Add migration status checks to CI/CD pipeline

---

## Need Help?

**Check the logs:**
```bash
# Backend logs
cd backend
npm run dev
# Watch for error messages

# Frontend console
# F12 → Console tab
# Look for red error messages
```

**Still stuck?**
1. Share the exact error message from console
2. Run `check_schema.sql` and share results
3. Check if Supabase connection is working
