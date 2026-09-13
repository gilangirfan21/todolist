-- Categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

-- Todos
create table if not exists todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'review', 'done')),
  completed_date date,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  category_id uuid references categories(id) on delete set null,
  weight smallint not null default 1 check (weight between 1 and 10),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists todos_user_id_idx on todos (user_id);
create index if not exists todos_user_id_position_idx on todos (user_id, position);

-- Keep updated_at current on every update
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists todos_set_updated_at on todos;
create trigger todos_set_updated_at
before update on todos
for each row execute function set_updated_at();

-- Subtasks (checklist items per todo)
create table if not exists subtasks (
  id uuid primary key default gen_random_uuid(),
  todo_id uuid not null references todos(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  is_done boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists subtasks_todo_id_idx on subtasks (todo_id);

-- Row Level Security: every row is only visible/writable by its owner
alter table categories enable row level security;
alter table todos enable row level security;
alter table subtasks enable row level security;

create policy "select own categories" on categories for select using (auth.uid() = user_id);
create policy "insert own categories" on categories for insert with check (auth.uid() = user_id);
create policy "update own categories" on categories for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own categories" on categories for delete using (auth.uid() = user_id);

create policy "select own todos" on todos for select using (auth.uid() = user_id);
create policy "insert own todos" on todos for insert with check (auth.uid() = user_id);
create policy "update own todos" on todos for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own todos" on todos for delete using (auth.uid() = user_id);

create policy "select own subtasks" on subtasks for select using (auth.uid() = user_id);
create policy "insert own subtasks" on subtasks for insert with check (auth.uid() = user_id);
create policy "update own subtasks" on subtasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own subtasks" on subtasks for delete using (auth.uid() = user_id);
