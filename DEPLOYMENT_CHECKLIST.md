# Deployment Checklist - Selection Committee Feature

## 🗄️ Database Migrations (REQUIRED before deployment)

Run these SQL scripts in your **Production Supabase** SQL Editor in this exact order:

### 1. Create venture_interactions table
```sql
-- Run: scripts/add_venture_interactions.sql
-- This creates the table for tracking calls, meetings, and notes
```

### 2. Update Selection Committee user role
```sql
-- Update the role for meetul@wadhwani.com
UPDATE public.profiles
SET role = 'committee_member'
WHERE id = (
    SELECT id FROM auth.users WHERE email = 'meetul@wadhwani.com'
);

-- Verify the change
SELECT u.email, p.role
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'meetul@wadhwani.com';
```

### 3. Add RLS Policies
```sql
-- Allow committee members to view ventures
CREATE POLICY "Committee members can view all ventures"
ON ventures
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'committee_member'
    )
);

-- Allow venture managers to view ventures
CREATE POLICY "Venture managers can view all ventures"
ON ventures
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'venture_mgr'
    )
);

-- Verify policies were created
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'ventures'
ORDER BY policyname;
```

---

## 🧪 Pre-Deployment Testing

### Test Each Demo Account:

- [ ] **Entrepreneur** (vipul@wadhwani.com)
  - [ ] Can login
  - [ ] Sees their ventures
  - [ ] Dashboard loads correctly

- [ ] **Screening Manager** (rajesh@wadhwani.com)
  - [ ] Can login
  - [ ] Sees all submitted applications
  - [ ] Can recommend Core, Select, and Prime

- [ ] **Selection Committee** (meetul@wadhwani.com)
  - [ ] Can login
  - [ ] Dashboard shows "Selection Committee" label
  - [ ] Only sees Core and Select applications
  - [ ] Can view venture details
  - [ ] Can add interactions

- [ ] **Venture Manager** (ravi@wadhwani.com)
  - [ ] Can login
  - [ ] Dashboard shows "Venture Manager" label
  - [ ] Only sees Prime applications
  - [ ] Can view venture details
  - [ ] Can add interactions

### Verify Filtering Logic:

1. **As Screening Manager:**
   - [ ] Recommend one app for "Accelerate Core"
   - [ ] Recommend one app for "Accelerate Select"
   - [ ] Recommend one app for "Accelerate Prime"

2. **As Selection Committee:**
   - [ ] See ONLY the Core and Select apps (2 total)
   - [ ] Prime app does NOT appear

3. **As Venture Manager:**
   - [ ] See ONLY the Prime app (1 total)
   - [ ] Core and Select apps do NOT appear

---

## 🚀 Deployment Steps

### 1. Run Build Locally
```bash
npm run build
```
**Expected:** No errors, build succeeds

### 2. Push to Git
```bash
git status
git push origin dev-branch
```

### 3. Update Netlify Environment Variables
Go to: Netlify Dashboard → Your Site → Site Settings → Environment Variables

Add these variables:
```
VITE_API_URL=https://your-backend-url.com/api
VITE_SUPABASE_URL=https://ymeqyrcstuskhcbpenss.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_KEY=your_production_service_key
```

### 4. Deploy to Netlify
- Netlify will auto-deploy when you push to your branch
- Or manually trigger deploy from Netlify Dashboard

### 5. Post-Deployment Verification
- [ ] Visit production site
- [ ] Test all 4 demo accounts
- [ ] Verify filtering works correctly
- [ ] Check browser console for errors
- [ ] Test interactions feature
- [ ] Test approve/contract workflow

---

## 🔍 Troubleshooting

### Issue: Selection Committee sees no ventures
**Solution:**
1. Verify role in database: `SELECT email, role FROM profiles JOIN auth.users ON profiles.id = auth.users.id WHERE email = 'meetul@wadhwani.com'`
2. Should show `role = 'committee_member'`
3. If wrong, run UPDATE query from step 2 above

### Issue: Filtering not working
**Solution:**
1. Check console logs for filtering debug messages
2. Verify ventures have `program_recommendation` field set correctly
3. Check RLS policies are active

### Issue: RLS policy errors
**Solution:**
1. Verify RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'ventures'`
2. Re-run RLS policy creation scripts from step 3 above

---

## 📝 Summary of Changes

### New Files Created:
- `src/pages/SelectionCommitteeDashboard.tsx` - Dashboard for Committee members
- `scripts/create_committee_user.sql` - SQL to create committee user
- `backend/src/scripts/create-committee-user.ts` - Script to create committee user via API

### Modified Files:
- `src/App.tsx` - Added /committee/dashboard route
- `src/layouts/VSMDashboardLayout.tsx` - Role detection for committee
- `src/pages/Login.tsx` - Committee login navigation
- `src/pages/VentureManagerDashboard.tsx` - Filter for Prime only
- `scripts/add_venture_interactions.sql` - Fixed auth.users reference

### Features Added:
- ✅ Selection Committee dashboard
- ✅ Role-based filtering (Core/Select for Committee, Prime for Manager)
- ✅ Venture interactions tracking
- ✅ Demo account for Selection Committee

---

## ✅ Ready to Deploy!

Once all checkboxes above are complete, you're ready to deploy! 🚀
