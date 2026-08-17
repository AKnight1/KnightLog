-- Stage 2 schema: projects, team membership, diary entries, quick captures.
-- Modeled on the shapes in lib/mock.ts (DiaryEntry, Flag, PROJECT, USER, CAPTURES).

create type flag_type as enum ('blocked', 'delay', 'instruction', 'hse', 'visitor');

-- One row per authenticated user, extending auth.users with app-facing profile data.
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role text not null default 'engineer',
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new user signs up.
create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contract text,
  postcode text,
  created_at timestamptz not null default now()
);

-- Who can see/log against a project. A user must have a row here before
-- they can read or write anything scoped to that project.
create table project_members (
  project_id uuid not null references projects (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  role text not null default 'engineer',
  primary key (project_id, user_id)
);

create table diary_entries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  author_id uuid not null references profiles (id) on delete cascade,
  day date not null,
  progress text not null,
  flags flag_type[] not null default '{}',
  reviewed boolean not null default false,
  backdated_days integer not null default 0,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index diary_entries_project_day_idx on diary_entries (project_id, day desc);

-- Quick captures logged through the day, optionally rolled up into a diary
-- entry later. entry_id is null until that happens.
create table captures (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  author_id uuid not null references profiles (id) on delete cascade,
  entry_id uuid references diary_entries (id) on delete set null,
  body text not null,
  captured_at timestamptz not null default now()
);

create index captures_project_idx on captures (project_id, captured_at desc);

-- Row Level Security: every table is scoped to project membership.
alter table profiles enable row level security;
alter table projects enable row level security;
alter table project_members enable row level security;
alter table diary_entries enable row level security;
alter table captures enable row level security;

create policy "profiles are self-readable" on profiles
  for select using (id = auth.uid());

create policy "profiles are self-updatable" on profiles
  for update using (id = auth.uid());

create policy "members can read their own membership rows" on project_members
  for select using (user_id = auth.uid());

create policy "members can read their projects" on projects
  for select using (
    exists (
      select 1 from project_members
      where project_members.project_id = projects.id
        and project_members.user_id = auth.uid()
    )
  );

create policy "members can read project diary entries" on diary_entries
  for select using (
    exists (
      select 1 from project_members
      where project_members.project_id = diary_entries.project_id
        and project_members.user_id = auth.uid()
    )
  );

create policy "members can create diary entries as themselves" on diary_entries
  for insert with check (
    author_id = auth.uid()
    and exists (
      select 1 from project_members
      where project_members.project_id = diary_entries.project_id
        and project_members.user_id = auth.uid()
    )
  );

create policy "members can update project diary entries" on diary_entries
  for update using (
    exists (
      select 1 from project_members
      where project_members.project_id = diary_entries.project_id
        and project_members.user_id = auth.uid()
    )
  );

create policy "members can read project captures" on captures
  for select using (
    exists (
      select 1 from project_members
      where project_members.project_id = captures.project_id
        and project_members.user_id = auth.uid()
    )
  );

create policy "members can create captures as themselves" on captures
  for insert with check (
    author_id = auth.uid()
    and exists (
      select 1 from project_members
      where project_members.project_id = captures.project_id
        and project_members.user_id = auth.uid()
    )
  );

create policy "members can update project captures" on captures
  for update using (
    exists (
      select 1 from project_members
      where project_members.project_id = captures.project_id
        and project_members.user_id = auth.uid()
    )
  );
