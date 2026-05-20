-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Macros table: daily macro entries per user
create table public.macros (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null default current_date,
  calories integer not null default 0,
  protein_g numeric(6,1) not null default 0,
  carbs_g numeric(6,1) not null default 0,
  fat_g numeric(6,1) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  unique(user_id, date)
);

-- Sleep table: nightly sleep entries per user
create table public.sleep (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null default current_date,
  duration_hours numeric(4,2) not null,
  quality integer not null check (quality between 1 and 5),
  notes text,
  created_at timestamptz not null default now(),
  unique(user_id, date)
);

-- Workouts table: workout sessions per user
create table public.workouts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null default current_date,
  type text not null,
  duration_minutes integer not null,
  intensity integer not null check (intensity between 1 and 5),
  notes text,
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table public.macros enable row level security;
alter table public.sleep enable row level security;
alter table public.workouts enable row level security;

-- RLS Policies: users can only access their own data
create policy "Users can manage their own macros"
  on public.macros for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own sleep"
  on public.sleep for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own workouts"
  on public.workouts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
