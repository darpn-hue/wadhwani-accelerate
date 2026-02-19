# VSM Program Recommendation - Deployment Guide

## Overview
This guide covers the deployment of the VSM (Venture Success Manager) program recommendation feature, ensuring data is properly submitted and persisted to the database.

## Changes Made

### ✅ 1. Backend Validation Schema Updated
**File**: `backend/src/types/schemas.ts`

**Added fields to `updateVentureSchema`:**
```typescript
// VSM Fields
vsm_notes: z.string().optional(),
program_recommendation: z.string().optional(),
internal_comments: z.string().optional(),
ai_analysis: z.any().optional(),

// Committee Fields
venture_partner: z.string().optional(),
committee_feedback: z.string().optional(),
committee_decision: z.string().optional(),

// Agreement Fields
agreement_status: z.string().optional(),

// Application Form Fields
city: z.string().optional(),
location: z.string().optional(),
revenue_12m: z.string().optional(),
revenue_potential_3y: z.string().optional(),
min_investment: z.string().optional(),
incremental_hiring: z.string().optional(),
full_time_employees: z.string().optional(),
```

**Status**: Changed from strict enum to flexible string to support all status values (Submitted, Under Review, etc.)

### ✅ 2. Database Schema Migration Created
**File**: `vsm_schema_migration.sql`

This comprehensive migration script adds all missing columns required for the VSM workflow:

**VSM Workflow Fields:**
- `vsm_notes` (text) - Call transcripts and screening notes
- `program_recommendation` (text) - Program tier recommendation
- `internal_comments` (text) - Committee-only internal notes
- `ai_analysis` (jsonb) - AI-generated insights, strengths, risks, questions

**Committee Workflow Fields:**
- `venture_partner` (text) - Assigned venture partner name
- `committee_feedback` (text) - Committee decision notes
- `committee_decision` (text) - Final committee decision

**Supporting Fields:**
- `agreement_status` (text) - Agreement workflow status
- `location` (text) - Venture location display
- All application form fields (revenue_12m, growth_target, etc.)

### ✅ 3. Test Script Created
**File**: `backend/src/scripts/test-vsm-submission.ts`

Comprehensive test script that verifies:
1. Venture creation
2. VSM recommendation submission
3. Committee partner assignment
4. Data retrieval for dashboards
5. Data persistence

---

## Deployment Steps

### Step 1: Update Backend
The backend code has already been updated with the new validation schema. No additional backend changes needed.

### Step 2: Run Database Migration

**Option A: Via Supabase SQL Editor (Recommended)**
1. Log into your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy the contents of `vsm_schema_migration.sql`
4. Paste and run the script
5. Verify success messages in the output

**Option B: Via psql command line**
```bash
psql $DATABASE_URL -f vsm_schema_migration.sql
```

**Expected Output:**
```
NOTICE:  Starting VSM schema migration...
NOTICE:  Added column: vsm_notes
NOTICE:  Added column: program_recommendation
NOTICE:  Added column: internal_comments
NOTICE:  Added column: ai_analysis
NOTICE:  Added column: venture_partner
...
NOTICE:  VSM schema migration completed successfully!
```

### Step 3: Verify Schema
After running the migration, the script will display a verification table showing all critical columns.

**Expected columns:**
```
 column_name              | data_type | field_category
--------------------------+-----------+----------------
 ai_analysis              | jsonb     | ✓ VSM Field
 agreement_status         | text      | ✓ VSM Field
 city                     | text      |
 commitment               | jsonb     | ✓ VSM Field
 full_time_employees      | text      |
 growth_current           | jsonb     | ✓ VSM Field
 growth_focus             | text      |
 growth_target            | jsonb     | ✓ VSM Field
 internal_comments        | text      | ✓ VSM Field
 program_recommendation   | text      | ✓ VSM Field
 revenue_12m              | text      |
 venture_partner          | text      | ✓ VSM Field
 vsm_notes                | text      | ✓ VSM Field
```

### Step 4: Deploy Backend
```bash
cd backend
npm run build
# Deploy to your hosting platform (Railway, Render, etc.)
```

### Step 5: Test the Flow (Optional but Recommended)

**Option A: Manual Testing**
1. Log in as a Success Manager (email with "admin" in it)
2. Navigate to VSM Dashboard
3. Select a venture
4. Fill in:
   - Other Details (vsm_notes)
   - Generate AI insights
   - Select a program recommendation
   - Add internal comments
5. Click Submit
6. Verify data is saved (check the venture in the database)

**Option B: Automated Testing**
```bash
cd backend
npx ts-node src/scripts/test-vsm-submission.ts
```

This will create a test venture, submit VSM data, and verify persistence.

---

## Data Flow Verification

### Frontend → Backend → Database

**1. VSM Dashboard Submit**
```typescript
// VSMDashboard.tsx (lines 341-378)
const handleSave = async () => {
  const updatePayload = {
    vsm_notes: vsmNotes,
    program_recommendation: program,
    internal_comments: internalComments,
    status: 'Under Review',
    venture_partner: selectedPartner // if committee role
  };

  await api.updateVenture(selectedVenture.id, updatePayload);
}
```

**2. API Client**
```typescript
// src/lib/api.ts (lines 132-142)
async updateVenture(id: string, data: any) {
  const { data: venture, error } = await supabase
    .from('ventures')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  return { venture };
}
```

**3. Backend Validation**
```typescript
// backend/src/routes/ventures.ts (lines 111-132)
router.put('/:id',
  authenticateUser,
  validateBody(updateVentureSchema), // ✅ Now includes VSM fields
  async (req, res, next) => {
    const venture = await ventureService.updateVenture(...);
    successResponse(res, { venture });
  }
);
```

**4. Database Update**
```typescript
// backend/src/services/ventureService.ts (lines 156-161)
const { data: venture, error } = await client
  .from('ventures')
  .update(data) // Contains vsm_notes, program_recommendation, etc.
  .eq('id', ventureId)
  .select()
  .single();
```

---

## Usage for Next Persona Dashboards

### Committee Dashboard
The committee dashboard can now access:

```typescript
// Fetch ventures with VSM recommendations
const { data: ventures } = await supabase
  .from('ventures')
  .select('*')
  .eq('program_recommendation', 'Accelerate Core') // or 'Accelerate Select'
  .order('created_at', { ascending: false });

// Access VSM data for decision making
ventures.forEach(venture => {
  console.log('VSM Notes:', venture.vsm_notes);
  console.log('Program Rec:', venture.program_recommendation);
  console.log('AI Analysis:', venture.ai_analysis);
  console.log('Internal Comments:', venture.internal_comments);
});
```

### Venture Manager Dashboard
The venture manager can access assigned ventures:

```typescript
// Fetch ventures assigned to specific partner
const { data: myVentures } = await supabase
  .from('ventures')
  .select('*')
  .eq('venture_partner', 'Arun Kumar')
  .order('created_at', { ascending: false });
```

---

## Rollback Plan

If you need to rollback the changes:

### 1. Rollback Database Schema
```sql
-- Remove VSM columns (CAUTION: This will delete data!)
ALTER TABLE ventures DROP COLUMN IF EXISTS vsm_notes;
ALTER TABLE ventures DROP COLUMN IF EXISTS program_recommendation;
ALTER TABLE ventures DROP COLUMN IF EXISTS internal_comments;
ALTER TABLE ventures DROP COLUMN IF EXISTS ai_analysis;
ALTER TABLE ventures DROP COLUMN IF EXISTS venture_partner;
```

### 2. Rollback Backend Code
```bash
git checkout HEAD~1 backend/src/types/schemas.ts
```

---

## Troubleshooting

### Issue: "Column does not exist" error
**Solution**: Run the migration script in Supabase SQL Editor

### Issue: "Validation failed" error
**Solution**: Ensure backend is deployed with updated schemas.ts

### Issue: Data not persisting
**Solution**:
1. Check browser console for errors
2. Verify backend logs
3. Run test script to isolate issue
4. Check RLS policies in Supabase

### Issue: "Unauthorized" error for Success Managers
**Solution**: Verify RLS policies allow success_mgr role to update ventures:
```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'ventures';
```

---

## Success Criteria

✅ VSM can submit program recommendations
✅ Data persists to database
✅ Committee can view VSM recommendations
✅ AI analysis is stored and retrievable
✅ Status updates to "Under Review"
✅ Venture partner assignment works
✅ Internal comments are saved

---

## Support

If you encounter issues:
1. Check the browser console for frontend errors
2. Check backend logs for API errors
3. Run the test script to verify database schema
4. Verify Supabase RLS policies are correctly configured

## Next Steps

After successful deployment:
1. ✅ VSM Dashboard can submit recommendations
2. 🔜 Build Committee Dashboard to review and approve
3. 🔜 Build Venture Manager Dashboard for assigned ventures
4. 🔜 Implement agreement generation workflow
5. 🔜 Add email notifications for status changes
