# 🔍 Fix: Ventures Not Visible in VSM Dashboard

## Problem
Ventures created by entrepreneurs appear in "My Ventures" but NOT in the "Screening Manager" (VSM Dashboard).

---

## 🎯 Most Likely Causes

### 1. **Venture Status Issue** (MOST COMMON)
The venture might still be in `draft` status instead of `Submitted`.

**Solution:**
- After filling the 4-step form, make sure to click the **"SUBMIT APPLICATION"** button
- This changes status from `draft` → `Submitted`
- Only `Submitted` ventures should appear in VSM Dashboard

### 2. **RLS Policy Restriction**
Row Level Security policies might be preventing success managers from seeing all ventures.

**Check your RLS policies:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'ventures';
```

**Required policy for VSM Dashboard:**
```sql
-- Staff can read all ventures
CREATE POLICY "Staff can read all ventures"
ON ventures FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('success_mgr', 'committee', 'venture_mgr', 'admin')
    )
    OR user_id = auth.uid()
);
```

### 3. **User Role Issue**
The logged-in user might not have the correct role.

**Check:**
1. Log in as success manager
2. Verify email contains "admin" or role is explicitly set to `success_mgr`
3. Check in browser console:
   ```javascript
   const { data: { user } } = await supabase.auth.getUser();
   console.log('Role:', user?.user_metadata?.role);
   ```

---

## 🛠️ Step-by-Step Fix

### Step 1: Run Diagnostic Query

1. Open Supabase Dashboard → **SQL Editor**
2. Run [`diagnose_vsm_visibility.sql`](./diagnose_vsm_visibility.sql)
3. Check the results:
   - How many ventures have status `'Submitted'`?
   - What RLS policies exist?
   - Can you see recent ventures?

### Step 2: Check Venture Status

If ventures show status `'draft'`:
```sql
-- Manually update to Submitted (for testing)
UPDATE ventures
SET status = 'Submitted'
WHERE status = 'draft';
```

### Step 3: Verify RLS Policies

Run this to check if the policy exists:
```sql
SELECT policyname, qual
FROM pg_policies
WHERE tablename = 'ventures'
AND policyname LIKE '%Staff%read%';
```

If it doesn't exist, run [`fresh_supabase_setup.sql`](./fresh_supabase_setup.sql) again to create proper RLS policies.

### Step 4: Test Client-Side Filtering

The VSM Dashboard has role-based filtering. Check:

1. **If logged in as `venture_mgr`:**
   - Only shows ventures with `program_recommendation = 'Accelerate Prime'`

2. **If logged in as `committee`:**
   - Only shows ventures with `program_recommendation IN ('Accelerate Core', 'Accelerate Select')`

3. **If logged in as `success_mgr` or `admin`:**
   - Shows ALL ventures (no filtering)

**To fix:** Make sure your test user has role `'success_mgr'` or `'admin'`.

---

## ✅ Quick Test

### In your Netlify deployment:

1. **As Entrepreneur:**
   - Login with `test@example.com`
   - Create a venture
   - **IMPORTANT:** Complete all 4 steps and click **"SUBMIT APPLICATION"**
   - Verify the success message appears

2. **As Success Manager:**
   - Login with `admin@example.com` (or any email with "admin")
   - Go to VSM Dashboard
   - You should see the venture

### If still not visible:

**Check in browser console:**
```javascript
// Get current user
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user role:', user?.user_metadata?.role);

// Try to fetch ventures directly
const { data: ventures, error } = await supabase
    .from('ventures')
    .select('*');
console.log('Ventures:', ventures);
console.log('Error:', error);
```

---

## 🔧 Manual Fix (if needed)

If you need to manually fix existing ventures:

```sql
-- Update all draft ventures to Submitted
UPDATE ventures
SET status = 'Submitted'
WHERE status = 'draft'
AND created_at > NOW() - INTERVAL '1 day';

-- Verify
SELECT name, status, created_at
FROM ventures
ORDER BY created_at DESC;
```

---

## 📊 Expected Data Flow

```
Entrepreneur fills form (4 steps)
          ↓
Clicks "SUBMIT APPLICATION"
          ↓
api.submitVenture(ventureId)
          ↓
UPDATE ventures SET status = 'Submitted'
          ↓
Success Manager logs in
          ↓
VSM Dashboard calls api.getVentures()
          ↓
Supabase checks RLS policies
          ↓
Returns ALL ventures for success_mgr role
          ↓
Client filters by role (if venture_mgr or committee)
          ↓
✅ Ventures displayed in VSM Dashboard
```

---

## 🆘 If Nothing Works

1. **Check backend logs** (Railway/Render) for errors
2. **Run the diagnostic script** and share results
3. **Verify RLS policies** match the expected ones
4. **Test with a fresh user** to rule out caching issues

---

## 🎯 Most Common Fix

**99% of the time, the issue is:**
- Venture is still in `draft` status (not submitted)
- OR user role is not `success_mgr`/`admin`

**Quick fix:**
```sql
-- In Supabase SQL Editor
UPDATE ventures SET status = 'Submitted' WHERE status = 'draft';
```

Then refresh VSM Dashboard. ✅
