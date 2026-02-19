-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  role text check (role in ('entrepreneur', 'success_mgr', 'admin', 'committee_member')),
  avatar_url text,
  
  constraint username_length check (char_length(full_name) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Set up Realtime!
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table profiles;

-- Function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
declare
  user_role text;
begin
  -- Automatically assign roles based on email pattern (For Demo Purpose)
  if new.email ilike '%admin%' then
    user_role := 'success_mgr';
  elsif new.email ilike '%committee%' then
    user_role := 'committee_member';
  else
    user_role := 'entrepreneur';
  end if;

  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', user_role);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create table for ventures
create table if not exists ventures (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  program text,
  location text,
  status text default 'Submitted',
  
  -- JSONB columns for flexible data
  growth_current jsonb,
  growth_target jsonb,
  commitment jsonb,
  needs jsonb
);

-- RLS for ventures
alter table ventures enable row level security;

create policy "Users can view their own ventures."
  on ventures for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own ventures."
  on ventures for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own ventures."
  on ventures for update
  using ( auth.uid() = user_id );

-- Add VSM specific columns if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ventures' AND column_name = 'vsm_notes') THEN 
        ALTER TABLE ventures ADD COLUMN vsm_notes text; 
        ALTER TABLE ventures ADD COLUMN program_recommendation text; 
        ALTER TABLE ventures ADD COLUMN internal_comments text; 
        
        -- Committee Columns
        ALTER TABLE ventures ADD COLUMN committee_feedback text;
        ALTER TABLE ventures ADD COLUMN committee_decision text;
    END IF;
END $$;

-- Allow Success Managers and Committee to view all ventures
create policy "Staff can view all ventures"
  on ventures for select
  using ( 
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('success_mgr', 'admin', 'committee_member')
    )
  );

-- Allow Success Managers and Committee to update any venture
create policy "Staff can update any venture"
  on ventures for update
  using ( 
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('success_mgr', 'admin', 'committee_member')
    )
  );

--------------------------------------------------------------------------------
-- Phase 6: Venture Agreement & Workbench
--------------------------------------------------------------------------------

DO $$
BEGIN
    -- 1. Agreement Status (Draft, Sent, Signed)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ventures' AND column_name = 'agreement_status') THEN
        ALTER TABLE ventures ADD COLUMN agreement_status text DEFAULT 'Draft';
    END IF;

    -- 2. Agreement Sent Timestamp
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ventures' AND column_name = 'agreement_sent_at') THEN
        ALTER TABLE ventures ADD COLUMN agreement_sent_at timestamptz;
    END IF;

    -- 3. Agreement Accepted Timestamp
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ventures' AND column_name = 'agreement_accepted_at') THEN
        ALTER TABLE ventures ADD COLUMN agreement_accepted_at timestamptz;
    END IF;
END $$;


--------------------------------------------------------------------------------
-- Phase 7: Production Schema Optimization
--------------------------------------------------------------------------------

-- 1. Programs (Lookup Table)
CREATE TABLE IF NOT EXISTS programs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text,
    created_at timestamptz DEFAULT now()
);

-- Seed Programs
INSERT INTO programs (name, description) VALUES 
('Accelerate Prime', 'For early stage ventures'),
('Accelerate Core', 'For growth stage ventures'),
('Accelerate Select', 'For mature ventures'),
('Ignite', 'For idea stage'),
('Liftoff', 'For launch stage')
ON CONFLICT (name) DO NOTHING;

-- 2. Venture Milestones
CREATE TABLE IF NOT EXISTS venture_milestones (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    venture_id uuid REFERENCES ventures(id) ON DELETE CASCADE,
    category text NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'Pending',
    due_date date,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. Venture Streams
CREATE TABLE IF NOT EXISTS venture_streams (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    venture_id uuid REFERENCES ventures(id) ON DELETE CASCADE,
    stream_name text NOT NULL,
    owner text,
    status text DEFAULT 'On Track',
    end_date text,
    end_output text,
    sprint_deliverable text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 4. Support Hours
CREATE TABLE IF NOT EXISTS support_hours (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    venture_id uuid REFERENCES ventures(id) ON DELETE CASCADE,
    allocated numeric DEFAULT 0,
    used numeric DEFAULT 0,
    balance numeric GENERATED ALWAYS AS (allocated - used) STORED,
    last_updated_at timestamptz DEFAULT now()
);

-- 5. Venture History
CREATE TABLE IF NOT EXISTS venture_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    venture_id uuid REFERENCES ventures(id) ON DELETE CASCADE,
    previous_status text,
    new_status text,
    changed_by uuid REFERENCES auth.users(id),
    changed_at timestamptz DEFAULT now(),
    notes text
);

-- Enable RLS
ALTER TABLE venture_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE venture_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE venture_history ENABLE ROW LEVEL SECURITY;

-- Policies for Phase 7 Tables

-- Milestones
CREATE POLICY "Users view own milestones" ON venture_milestones FOR SELECT USING (EXISTS (SELECT 1 FROM ventures WHERE id = venture_milestones.venture_id AND user_id = auth.uid()));
CREATE POLICY "Staff view all milestones" ON venture_milestones FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('success_mgr', 'admin', 'committee_member')));
CREATE POLICY "Staff manage milestones" ON venture_milestones FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('success_mgr', 'admin', 'committee_member')));

-- Streams
CREATE POLICY "Users view own streams" ON venture_streams FOR SELECT USING (EXISTS (SELECT 1 FROM ventures WHERE id = venture_streams.venture_id AND user_id = auth.uid()));
CREATE POLICY "Staff view all streams" ON venture_streams FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('success_mgr', 'admin', 'committee_member')));
CREATE POLICY "Users can insert own streams" ON venture_streams FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM ventures WHERE id = venture_streams.venture_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own streams" ON venture_streams FOR UPDATE USING (EXISTS (SELECT 1 FROM ventures WHERE id = venture_streams.venture_id AND user_id = auth.uid()));


-- Support Hours
CREATE POLICY "Users view own support_hours" ON support_hours FOR SELECT USING (EXISTS (SELECT 1 FROM ventures WHERE id = support_hours.venture_id AND user_id = auth.uid()));
CREATE POLICY "Staff view all support_hours" ON support_hours FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('success_mgr', 'admin', 'committee_member')));
CREATE POLICY "Users can insert own support hours" ON support_hours FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM ventures WHERE id = support_hours.venture_id AND user_id = auth.uid()));

