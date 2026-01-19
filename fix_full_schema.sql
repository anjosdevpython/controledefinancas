-- FIX REMAINING DATABASE SCHEMA & SECURITY ISSUES

-- 1. Add 'sub_goals' column to 'goals' table if currently missing
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'goals' and column_name = 'sub_goals') then
    alter table public.goals add column sub_goals jsonb default '[]'::jsonb;
  end if;
end $$;

-- 2. Enable RLS on all tables and ensure policies exist

-- TRANSACTIONS
alter table public.transactions enable row level security;
drop policy if exists "Users can view their own transactions" on public.transactions;
create policy "Users can view their own transactions" on public.transactions for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own transactions" on public.transactions;
create policy "Users can insert their own transactions" on public.transactions for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own transactions" on public.transactions;
create policy "Users can update their own transactions" on public.transactions for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own transactions" on public.transactions;
create policy "Users can delete their own transactions" on public.transactions for delete using (auth.uid() = user_id);

-- GOALS
alter table public.goals enable row level security;
drop policy if exists "Users can view their own goals" on public.goals;
create policy "Users can view their own goals" on public.goals for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own goals" on public.goals;
create policy "Users can insert their own goals" on public.goals for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own goals" on public.goals;
create policy "Users can update their own goals" on public.goals for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own goals" on public.goals;
create policy "Users can delete their own goals" on public.goals for delete using (auth.uid() = user_id);

-- CATEGORIES
alter table public.categories enable row level security;
drop policy if exists "Users can view their own categories" on public.categories;
create policy "Users can view their own categories" on public.categories for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own categories" on public.categories;
create policy "Users can insert their own categories" on public.categories for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own categories" on public.categories;
create policy "Users can update their own categories" on public.categories for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own categories" on public.categories;
create policy "Users can delete their own categories" on public.categories for delete using (auth.uid() = user_id);

-- 3. Validation: Ensure all foreign keys have indexes for performance (Optional but good)
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_category_id on public.transactions(category_id);
create index if not exists idx_transactions_account_id on public.transactions(account_id);
create index if not exists idx_goals_user_id on public.goals(user_id);
create index if not exists idx_categories_user_id on public.categories(user_id);
