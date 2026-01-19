-- FIX MISSING TABLES (Categories & Goals)

-- 1. Create 'categories' table
create table if not exists public.categories (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  name text not null,
  icon text not null,
  color text null,
  type text not null, -- 'income' or 'expense'
  user_id uuid null default auth.uid (),
  constraint categories_pkey primary key (id),
  constraint categories_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
) tablespace pg_default;

-- 2. Create 'goals' table (if it doesn't exist)
create table if not exists public.goals (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  name text not null,
  target_amount numeric not null,
  current_amount numeric null default 0,
  deadline timestamp with time zone null,
  icon text null,
  color text null,
  sub_goals jsonb null default '[]'::jsonb,
  user_id uuid null default auth.uid (),
  constraint goals_pkey primary key (id),
  constraint goals_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
) tablespace pg_default;

-- 3. Enable Security (RLS) for Categories
alter table public.categories enable row level security;

create policy "Users can view their own categories" on public.categories for select using (auth.uid() = user_id);
create policy "Users can insert their own categories" on public.categories for insert with check (auth.uid() = user_id);
create policy "Users can update their own categories" on public.categories for update using (auth.uid() = user_id);
create policy "Users can delete their own categories" on public.categories for delete using (auth.uid() = user_id);

-- 4. Enable Security (RLS) for Goals
alter table public.goals enable row level security;

create policy "Users can view their own goals" on public.goals for select using (auth.uid() = user_id);
create policy "Users can insert their own goals" on public.goals for insert with check (auth.uid() = user_id);
create policy "Users can update their own goals" on public.goals for update using (auth.uid() = user_id);
create policy "Users can delete their own goals" on public.goals for delete using (auth.uid() = user_id);

-- 5. Insert Default Categories (Optional helper)
-- Only inserts if user has no categories
do $$
declare
  _user_id uuid := auth.uid();
begin
  if _user_id is not null and not exists (select 1 from public.categories where user_id = _user_id) then
    insert into public.categories (name, icon, type, color, user_id) values
    ('Salário', 'Wallet', 'income', '#10B981', _user_id),
    ('Freelance', 'Briefcase', 'income', '#3B82F6', _user_id),
    ('Alimentação', 'Utensils', 'expense', '#F43F5E', _user_id),
    ('Transporte', 'Car', 'expense', '#F59E0B', _user_id),
    ('Moradia', 'Home', 'expense', '#8B5CF6', _user_id),
    ('Lazer', 'Gamepad2', 'expense', '#EC4899', _user_id),
    ('Saúde', 'HeartPulse', 'expense', '#EF4444', _user_id),
    ('Educação', 'GraduationCap', 'expense', '#6366F1', _user_id);
  end if;
end $$;
