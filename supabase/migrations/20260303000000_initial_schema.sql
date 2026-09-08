-- Family App V0 schema

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.generate_invite_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
begin
  for i in 1..6 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return result;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Our Family',
  invite_code text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.family_memberships (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'parent' check (role in ('owner', 'parent')),
  created_at timestamptz not null default now(),
  unique (family_id, user_id)
);

create table public.people (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  kind text not null check (kind in ('adult', 'child')),
  display_name text not null,
  date_of_birth date,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.care_sessions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  type text not null check (type in ('sleep', 'feed')),
  started_at timestamptz not null default now(),
  started_by uuid references auth.users(id) on delete set null,
  ended_at timestamptz,
  ended_by uuid references auth.users(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index care_sessions_open_idx on public.care_sessions (family_id, person_id)
  where ended_at is null;

create table public.family_events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  person_id uuid references public.people(id) on delete set null,
  type text not null check (
    type in (
      'feed', 'sleep', 'nappy', 'medication', 'measurement',
      'appointment', 'note', 'task_completed'
    )
  ),
  occurred_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb,
  care_session_id uuid references public.care_sessions(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index family_events_family_occurred_idx
  on public.family_events (family_id, occurred_at desc);

create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  person_id uuid references public.people(id) on delete set null,
  going_person_id uuid references public.people(id) on delete set null,
  title text not null,
  starts_at timestamptz not null,
  location text,
  questions text,
  bring text,
  notes text,
  outcome text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index calendar_events_family_starts_idx
  on public.calendar_events (family_id, starts_at);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null,
  owner_person_id uuid references public.people(id) on delete set null,
  owner_user_id uuid references auth.users(id) on delete set null,
  due_on date,
  done boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lists (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lists(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.measurements (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  weight_kg numeric(6, 3),
  length_cm numeric(6, 2),
  head_cm numeric(6, 2),
  measured_at timestamptz not null default now(),
  measured_by uuid references auth.users(id) on delete set null,
  location text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.immunisation_records (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  code text not null,
  label text not null,
  due_on date not null,
  given_on date,
  provider text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (person_id, code)
);

-- updated_at triggers
create trigger families_updated_at before update on public.families
  for each row execute function public.set_updated_at();
create trigger people_updated_at before update on public.people
  for each row execute function public.set_updated_at();
create trigger care_sessions_updated_at before update on public.care_sessions
  for each row execute function public.set_updated_at();
create trigger family_events_updated_at before update on public.family_events
  for each row execute function public.set_updated_at();
create trigger calendar_events_updated_at before update on public.calendar_events
  for each row execute function public.set_updated_at();
create trigger tasks_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();
create trigger lists_updated_at before update on public.lists
  for each row execute function public.set_updated_at();
create trigger list_items_updated_at before update on public.list_items
  for each row execute function public.set_updated_at();
create trigger measurements_updated_at before update on public.measurements
  for each row execute function public.set_updated_at();
create trigger immunisation_records_updated_at before update on public.immunisation_records
  for each row execute function public.set_updated_at();

-- Close care session -> family_event
create or replace function public.on_care_session_closed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.ended_at is null and new.ended_at is not null then
    insert into public.family_events (
      family_id, person_id, type, occurred_at, payload, care_session_id, created_by
    ) values (
      new.family_id,
      new.person_id,
      new.type,
      new.ended_at,
      coalesce(new.payload, '{}'::jsonb) || jsonb_build_object(
        'duration_minutes',
        greatest(0, extract(epoch from (new.ended_at - new.started_at)) / 60)::int,
        'started_at', new.started_at
      ),
      new.id,
      new.ended_by
    );
  end if;
  return new;
end;
$$;

create trigger care_session_closed after update on public.care_sessions
  for each row execute function public.on_care_session_closed();

-- ---------------------------------------------------------------------------
-- Onboarding RPCs (security definer)
-- ---------------------------------------------------------------------------

create or replace function public.create_family_with_child(
  p_family_name text,
  p_adult_name text,
  p_child_name text,
  p_child_dob date default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family_id uuid;
  v_invite_code text;
  v_child_id uuid;
  v_attempts int := 0;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if exists (select 1 from public.family_memberships where user_id = auth.uid()) then
    raise exception 'Already in a family';
  end if;

  loop
    v_invite_code := public.generate_invite_code();
    begin
      insert into public.families (name, invite_code)
      values (coalesce(nullif(trim(p_family_name), ''), 'Our Family'), v_invite_code)
      returning id into v_family_id;
      exit;
    exception when unique_violation then
      v_attempts := v_attempts + 1;
      if v_attempts > 10 then
        raise exception 'Could not generate invite code';
      end if;
    end;
  end loop;

  insert into public.family_memberships (family_id, user_id, role)
  values (v_family_id, auth.uid(), 'owner');

  insert into public.people (family_id, kind, display_name, user_id)
  values (v_family_id, 'adult', coalesce(nullif(trim(p_adult_name), ''), 'Parent'), auth.uid());

  insert into public.people (family_id, kind, display_name, date_of_birth)
  values (v_family_id, 'child', coalesce(nullif(trim(p_child_name), ''), 'Baby'), p_child_dob)
  returning id into v_child_id;

  insert into public.lists (family_id, name) values (v_family_id, 'Groceries');

  return jsonb_build_object(
    'family_id', v_family_id,
    'invite_code', v_invite_code,
    'child_id', v_child_id
  );
end;
$$;

create or replace function public.join_family_by_code(
  p_invite_code text,
  p_adult_name text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if exists (select 1 from public.family_memberships where user_id = auth.uid()) then
    raise exception 'Already in a family';
  end if;

  select id into v_family_id
  from public.families
  where upper(invite_code) = upper(trim(p_invite_code));

  if v_family_id is null then
    raise exception 'Invalid invite code';
  end if;

  insert into public.family_memberships (family_id, user_id, role)
  values (v_family_id, auth.uid(), 'parent');

  insert into public.people (family_id, kind, display_name, user_id)
  values (v_family_id, 'adult', coalesce(nullif(trim(p_adult_name), ''), 'Parent'), auth.uid());

  return jsonb_build_object('family_id', v_family_id);
end;
$$;

-- RLS helper (must be created after family_memberships exists)
create or replace function public.user_family_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select family_id from public.family_memberships where user_id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.families enable row level security;
alter table public.family_memberships enable row level security;
alter table public.people enable row level security;
alter table public.care_sessions enable row level security;
alter table public.family_events enable row level security;
alter table public.calendar_events enable row level security;
alter table public.tasks enable row level security;
alter table public.lists enable row level security;
alter table public.list_items enable row level security;
alter table public.measurements enable row level security;
alter table public.immunisation_records enable row level security;

-- families
create policy "families_select" on public.families for select
  using (id in (select public.user_family_ids()));
create policy "families_update" on public.families for update
  using (id in (select public.user_family_ids()));

-- memberships
create policy "memberships_select" on public.family_memberships for select
  using (family_id in (select public.user_family_ids()));
create policy "memberships_insert" on public.family_memberships for insert
  with check (family_id in (select public.user_family_ids()) or user_id = auth.uid());

-- people
create policy "people_select" on public.people for select
  using (family_id in (select public.user_family_ids()));
create policy "people_insert" on public.people for insert
  with check (family_id in (select public.user_family_ids()));
create policy "people_update" on public.people for update
  using (family_id in (select public.user_family_ids()));

-- care_sessions
create policy "care_sessions_all" on public.care_sessions for all
  using (family_id in (select public.user_family_ids()))
  with check (family_id in (select public.user_family_ids()));

-- family_events
create policy "family_events_all" on public.family_events for all
  using (family_id in (select public.user_family_ids()))
  with check (family_id in (select public.user_family_ids()));

-- calendar_events
create policy "calendar_events_all" on public.calendar_events for all
  using (family_id in (select public.user_family_ids()))
  with check (family_id in (select public.user_family_ids()));

-- tasks
create policy "tasks_all" on public.tasks for all
  using (family_id in (select public.user_family_ids()))
  with check (family_id in (select public.user_family_ids()));

-- lists
create policy "lists_all" on public.lists for all
  using (family_id in (select public.user_family_ids()))
  with check (family_id in (select public.user_family_ids()));

-- list_items
create policy "list_items_all" on public.list_items for all
  using (family_id in (select public.user_family_ids()))
  with check (family_id in (select public.user_family_ids()));

-- measurements
create policy "measurements_all" on public.measurements for all
  using (family_id in (select public.user_family_ids()))
  with check (family_id in (select public.user_family_ids()));

-- immunisation_records
create policy "immunisation_records_all" on public.immunisation_records for all
  using (family_id in (select public.user_family_ids()))
  with check (family_id in (select public.user_family_ids()));

-- RPC execute
grant execute on function public.create_family_with_child(text, text, text, date) to authenticated;
grant execute on function public.join_family_by_code(text, text) to authenticated;
grant execute on function public.user_family_ids() to authenticated;

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------

alter publication supabase_realtime add table public.family_events;
alter publication supabase_realtime add table public.care_sessions;
alter publication supabase_realtime add table public.calendar_events;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.list_items;
alter publication supabase_realtime add table public.measurements;
alter publication supabase_realtime add table public.immunisation_records;
