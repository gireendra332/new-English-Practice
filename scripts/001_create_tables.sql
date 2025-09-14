-- Create profiles table for user management
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  level text default 'beginner' check (level in ('beginner', 'intermediate', 'advanced')),
  points integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create rooms table for practice sessions
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  topic text not null,
  level text not null check (level in ('beginner', 'intermediate', 'advanced')),
  max_participants integer default 6,
  current_participants integer default 0,
  host_id uuid references public.profiles(id) on delete cascade,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create room_participants table for tracking who's in each room
create table if not exists public.room_participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_speaking boolean default false,
  unique(room_id, user_id)
);

-- Create messages table for text chat
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  message_type text default 'text' check (message_type in ('text', 'system', 'game')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create activities table for gamified features
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade,
  activity_type text not null check (activity_type in ('word_game', 'pronunciation', 'conversation_starter', 'role_play')),
  title text not null,
  description text,
  data jsonb, -- Store activity-specific data
  is_active boolean default false,
  created_by uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_achievements table for tracking progress
create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  achievement_type text not null,
  achievement_data jsonb,
  earned_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security on all tables
alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.room_participants enable row level security;
alter table public.messages enable row level security;
alter table public.activities enable row level security;
alter table public.user_achievements enable row level security;

-- Profiles policies
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_select_all" on public.profiles for select using (true); -- Allow viewing other profiles
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- Rooms policies
create policy "rooms_select_all" on public.rooms for select using (true); -- Anyone can view rooms
create policy "rooms_insert_authenticated" on public.rooms for insert with check (auth.uid() is not null);
create policy "rooms_update_host" on public.rooms for update using (auth.uid() = host_id);
create policy "rooms_delete_host" on public.rooms for delete using (auth.uid() = host_id);

-- Room participants policies
create policy "room_participants_select_all" on public.room_participants for select using (true);
create policy "room_participants_insert_own" on public.room_participants for insert with check (auth.uid() = user_id);
create policy "room_participants_update_own" on public.room_participants for update using (auth.uid() = user_id);
create policy "room_participants_delete_own" on public.room_participants for delete using (auth.uid() = user_id);

-- Messages policies
create policy "messages_select_room_participants" on public.messages 
  for select using (
    exists (
      select 1 from public.room_participants 
      where room_id = messages.room_id and user_id = auth.uid()
    )
  );
create policy "messages_insert_room_participants" on public.messages 
  for insert with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.room_participants 
      where room_id = messages.room_id and user_id = auth.uid()
    )
  );

-- Activities policies
create policy "activities_select_room_participants" on public.activities 
  for select using (
    exists (
      select 1 from public.room_participants 
      where room_id = activities.room_id and user_id = auth.uid()
    )
  );
create policy "activities_insert_room_participants" on public.activities 
  for insert with check (
    auth.uid() = created_by and
    exists (
      select 1 from public.room_participants 
      where room_id = activities.room_id and user_id = auth.uid()
    )
  );
create policy "activities_update_creator" on public.activities for update using (auth.uid() = created_by);

-- User achievements policies
create policy "achievements_select_own" on public.user_achievements for select using (auth.uid() = user_id);
create policy "achievements_insert_system" on public.user_achievements for insert with check (auth.uid() = user_id);
