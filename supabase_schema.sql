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
