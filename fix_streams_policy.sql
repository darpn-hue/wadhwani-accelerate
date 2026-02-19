-- ============================================================================
-- FIX: ALLOW STAFF TO VIEW VENTURE STREAMS
-- ============================================================================
-- Currently, venture_streams table only allows the venture owner to view streams.
-- This prevents Screening Managers from seeing the status of workstreams.
-- We need to add a policy allowing staff (success_mgr, admin, committee_member)
-- to view all streams.
-- ============================================================================

-- 1. Drop existing policy if it exists (to avoid duplicates or conflicts)
DROP POLICY IF EXISTS "Staff can view all streams" ON public.venture_streams;

-- 2. Create the new policy for Staff Access to Streams
CREATE POLICY "Staff can view all streams" ON public.venture_streams FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('success_mgr', 'admin', 'committee_member', 'venture_mgr')
  )
);

-- Note: We also need to ensure they can update/insert if needed, but for viewing N/A issue, SELECT is key.
-- Adding UPDATE policy just in case they need to edit status later.
DROP POLICY IF EXISTS "Staff can update all streams" ON public.venture_streams;
CREATE POLICY "Staff can update all streams" ON public.venture_streams FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('success_mgr', 'admin', 'committee_member', 'venture_mgr')
  )
);
