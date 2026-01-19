-- FIX DATABASE SCHEMA ISSUES

-- 1. Create the 'accounts' table if it doesn't exist
create table if not exists public.accounts (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  name text not null,
  type text not null,
  balance numeric not null default 0,
  color text null,
  user_id uuid null default auth.uid (),
  constraint accounts_pkey primary key (id),
  constraint accounts_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
) tablespace pg_default;

-- Enable Row Level Security for accounts
alter table public.accounts enable row level security;

-- Create policies for accounts (so users can only see/edit their own accounts)
create policy "Users can view their own accounts" on public.accounts for select using (auth.uid() = user_id);
create policy "Users can insert their own accounts" on public.accounts for insert with check (auth.uid() = user_id);
create policy "Users can update their own accounts" on public.accounts for update using (auth.uid() = user_id);
create policy "Users can delete their own accounts" on public.accounts for delete using (auth.uid() = user_id);

-- 2. Add missing columns to 'transactions' table
-- Add account_id column
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'transactions' and column_name = 'account_id') then
    alter table public.transactions add column account_id uuid references public.accounts(id) on delete set null;
  end if;
end $$;

-- Add goal_id column
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'transactions' and column_name = 'goal_id') then
    alter table public.transactions add column goal_id uuid references public.goals(id) on delete set null;
  end if;
end $$;

-- 3. Create default account trigger (Optional but helpful)
-- Function to create a default wallet for new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.accounts (user_id, name, type, balance, color)
  values (new.id, 'Carteira Principal', 'cash', 0, '#8B5CF6');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on new user creation
-- Check if trigger exists first to avoid error
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
