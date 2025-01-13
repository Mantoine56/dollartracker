-- Enable Row Level Security
alter database postgres set "app.jwt_secret" to 'your-jwt-secret';

-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  email text not null unique,
  full_name text,
  avatar_url text,
  monthly_income numeric default 0 not null,
  savings_goal numeric default 0 not null,
  theme_preference text default 'system' not null check (theme_preference in ('light', 'dark', 'system')),
  currency text default 'USD' not null,
  constraint profiles_email_check check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create categories table
create table categories (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  name text not null,
  color text not null,
  icon text not null,
  budget_amount numeric default 0 not null,
  profile_id uuid references profiles(id) on delete cascade not null,
  type text not null check (type in ('expense', 'income')),
  unique (profile_id, name, type)
);

-- Create transactions table
create table transactions (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  amount numeric not null check (amount > 0),
  description text,
  category_id uuid references categories(id) on delete restrict not null,
  profile_id uuid references profiles(id) on delete cascade not null,
  date timestamptz default now() not null,
  type text not null check (type in ('expense', 'income')),
  recurring_id uuid references recurring_transactions(id) on delete set null
);

-- Create recurring_transactions table
create table recurring_transactions (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  amount numeric not null check (amount > 0),
  description text,
  category_id uuid references categories(id) on delete restrict not null,
  profile_id uuid references profiles(id) on delete cascade not null,
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  start_date timestamptz not null,
  end_date timestamptz,
  last_generated timestamptz,
  type text not null check (type in ('expense', 'income')),
  check (end_date is null or end_date > start_date)
);

-- Create budgets table
create table budgets (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  profile_id uuid references profiles(id) on delete cascade not null,
  month date not null,
  savings_goal numeric default 0 not null,
  total_income numeric default 0 not null,
  total_expenses numeric default 0 not null,
  unique (profile_id, month)
);

-- Enable Row Level Security on all tables
alter table profiles enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;
alter table recurring_transactions enable row level security;
alter table budgets enable row level security;

-- Create policies
create policy "Users can view own profile"
  on profiles for select
  using ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

create policy "Users can view own categories"
  on categories for select
  using ( auth.uid() = profile_id );

create policy "Users can insert own categories"
  on categories for insert
  with check ( auth.uid() = profile_id );

create policy "Users can update own categories"
  on categories for update
  using ( auth.uid() = profile_id );

create policy "Users can delete own categories"
  on categories for delete
  using ( auth.uid() = profile_id );

create policy "Users can view own transactions"
  on transactions for select
  using ( auth.uid() = profile_id );

create policy "Users can insert own transactions"
  on transactions for insert
  with check ( auth.uid() = profile_id );

create policy "Users can update own transactions"
  on transactions for update
  using ( auth.uid() = profile_id );

create policy "Users can delete own transactions"
  on transactions for delete
  using ( auth.uid() = profile_id );

create policy "Users can view own recurring transactions"
  on recurring_transactions for select
  using ( auth.uid() = profile_id );

create policy "Users can insert own recurring transactions"
  on recurring_transactions for insert
  with check ( auth.uid() = profile_id );

create policy "Users can update own recurring transactions"
  on recurring_transactions for update
  using ( auth.uid() = profile_id );

create policy "Users can delete own recurring transactions"
  on recurring_transactions for delete
  using ( auth.uid() = profile_id );

create policy "Users can view own budgets"
  on budgets for select
  using ( auth.uid() = profile_id );

create policy "Users can insert own budgets"
  on budgets for insert
  with check ( auth.uid() = profile_id );

create policy "Users can update own budgets"
  on budgets for update
  using ( auth.uid() = profile_id );

create policy "Users can delete own budgets"
  on budgets for delete
  using ( auth.uid() = profile_id );

-- Create triggers for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();

create trigger update_categories_updated_at
  before update on categories
  for each row
  execute function update_updated_at_column();

create trigger update_transactions_updated_at
  before update on transactions
  for each row
  execute function update_updated_at_column();

create trigger update_recurring_transactions_updated_at
  before update on recurring_transactions
  for each row
  execute function update_updated_at_column();

create trigger update_budgets_updated_at
  before update on budgets
  for each row
  execute function update_updated_at_column();
