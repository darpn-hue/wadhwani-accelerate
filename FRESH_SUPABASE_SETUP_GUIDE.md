# Fresh Supabase Setup Guide

## 🎯 Overview
This guide will help you set up your fresh Supabase project with all the required tables, columns, and policies for the complete venture application system.

---

## 📋 Prerequisites
- A fresh Supabase project
- Access to the Supabase dashboard
- Your Supabase project URL and anon key

---

## 🚀 Step-by-Step Setup

### Step 1: Run the Database Schema

1. **Open Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Execute the Schema**
   - Open [`fresh_supabase_setup.sql`](file:///Users/vipulpandey/wadhwani/wadhwani_ventures_4_arun/fresh_supabase_setup.sql)
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click **"Run"** or press `Cmd/Ctrl + Enter`

4. **Verify Success**
   - You should see "Success. No rows returned"
   - Check the "Table Editor" to see all created tables

### Step 2: Update Environment Variables

1. **Get Your Supabase Credentials**
   - In Supabase Dashboard, go to **Settings** → **API**
   - Copy:
     - **Project URL** (e.g., `https://xxxxx.supabase.co`)
     - **anon/public key** (starts with `eyJ...`)

2. **Update `.env` File**
   ```bash
   # Open your .env file
   code .env
   ```

3. **Replace the Values**
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Save the File**

### Step 3: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

---

## ✅ Verification Checklist

### Database Tables Created
- [ ] `profiles` - User profiles and roles
- [ ] `ventures` - Main venture applications
- [ ] `programs` - Available programs (seeded with 5 programs)
- [ ] `venture_milestones` - Milestone tracking
- [ ] `venture_streams` - Stream status tracking
- [ ] `support_hours` - Support hour allocation
- [ ] `venture_history` - Status change history

### Verify in Supabase Dashboard

1. **Check Tables**
   - Go to "Table Editor"
   - You should see all 7 tables listed

2. **Check Programs Data**
   - Click on `programs` table
   - You should see 5 programs:
     - Accelerate Prime
     - Accelerate Core
     - Accelerate Select
     - Ignite
     - Liftoff

3. **Check RLS Policies**
   - Click on any table (e.g., `ventures`)
   - Go to "Policies" tab
   - You should see multiple policies enabled

---

## 🧪 Test the Application

### 1. Create Test Accounts

Create accounts with different roles to test the complete workflow:

**Entrepreneur Account:**
```
Email: test@example.com
Password: Test123!
Name: Test Entrepreneur
```

**Success Manager Account:**
```
Email: admin@example.com
Password: Admin123!
Name: Test Admin
```
*Note: Email contains "admin" so role is auto-assigned as 'success_mgr'*

**Committee Member Account:**
```
Email: committee@example.com
Password: Committee123!
Name: Test Committee
```
*Note: Email contains "committee" so role is auto-assigned as 'committee_member'*

### 2. Test Venture Application Flow

1. **Login as Entrepreneur**
   - Navigate to `/new-application`
   - Fill out all 4 steps
   - Submit the application

2. **Verify Data in Supabase**
   - Go to Supabase Dashboard → Table Editor → `ventures`
   - You should see your submitted venture
   - Check that all fields are populated:
     - `name`, `founder_name`, `city`, `revenue_12m`
     - `growth_focus`, `revenue_potential_3y`, `min_investment`
     - `blockers`, `support_request`
     - `growth_current`, `growth_target` (JSONB fields)

3. **Check Stream Data**
   - Go to `venture_streams` table
   - You should see 6 rows (one for each stream)
   - Verify the statuses match your selections

### 3. Test Staff Workflows

1. **Login as Success Manager** (admin@example.com)
   - You should see the submitted venture in the dashboard
   - Test screening workflow
   - Add VSM notes

2. **Login as Committee Member** (committee@example.com)
   - You should see ventures in committee review
   - Test committee decision workflow

---

## 🎨 What's Included in the Schema

### Ventures Table Fields

**Step 1: Business Information**
- `name` - Company name
- `founder_name` - Owner/founder name ✨ NEW
- `city` - City location
- `revenue_12m` - Current revenue
- `full_time_employees` - Team size

**Step 2: Venture Growth**
- `growth_focus` - Growth areas (product/segment/geography) ✨ FIXED
- `revenue_potential_3y` - 3-year revenue projection
- `min_investment` - Investment needed
- `incremental_hiring` - Hiring plans

**Step 3: Status & Needs**
- `blockers` - Current challenges
- `needs` (JSONB) - Stream status data
- Related `venture_streams` table for detailed tracking

**Step 4: Support**
- `support_request` - Detailed support needs

**Workflow Fields**
- `status` - Current application status
- `vsm_notes` - Success manager notes
- `committee_feedback` - Committee review notes
- `agreement_status` - Agreement workflow status

---

## 🐛 Troubleshooting

### Issue: "Failed to execute SQL"
**Solution:** Make sure you copied the entire SQL file. Try running it in smaller sections.

### Issue: "Relation already exists"
**Solution:** Some tables might already exist. This is fine - the script uses `IF NOT EXISTS` checks.

### Issue: Application can't connect to Supabase
**Solution:** 
1. Double-check your `.env` file has the correct URL and key
2. Restart the dev server (`npm run dev`)
3. Clear browser cache and reload

### Issue: "Row Level Security policy violation"
**Solution:** Make sure all policies were created. Re-run the schema script.

---

## 📚 Next Steps

After setup is complete:

1. **Test the complete flow** with all three user roles
2. **Verify data persistence** in Supabase dashboard
3. **Test VSM screening workflow**
4. **Test committee review workflow**
5. **Test workbench management**

---

## 🎉 You're All Set!

Your Supabase database is now fully configured for the venture application system. You can start testing the complete end-to-end workflow!

If you encounter any issues, check the troubleshooting section or review the schema file for details.
