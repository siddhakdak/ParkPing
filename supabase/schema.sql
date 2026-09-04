create extension if not exists pgcrypto;

create table if not exists public.users(
 id uuid primary key references auth.users(id) on delete cascade,
 name text not null default '',
 phone text not null default '',
 email text not null unique,
 is_admin boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.vehicles(
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references public.users(id) on delete cascade,
 vehicle_type text not null check(vehicle_type in ('Car','Bike','EV','Commercial vehicle','Other')),
 brand text,
 model text,
 registration_number text not null,
 nickname text,
 photo_url text,
 qr_token text not null unique check(char_length(qr_token)>=16),
 is_active boolean not null default true,
 scan_count integer not null default 0,
 message_count integer not null default 0,
 last_activity_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.conversations(
 id uuid primary key default gen_random_uuid(),
 vehicle_id uuid not null references public.vehicles(id) on delete cascade,
 anonymous_session_id uuid not null,
 status text not null default 'active' check(status in ('active','resolved','expired','blocked')),
 created_at timestamptz not null default now(),
 last_message_at timestamptz not null default now()
);

create table if not exists public.messages(
 id uuid primary key default gen_random_uuid(),
 conversation_id uuid not null references public.conversations(id) on delete cascade,
 sender_type text not null check(sender_type in ('visitor','owner')),
 message text not null check(char_length(message) between 1 and 500),
 created_at timestamptz not null default now(),
 read_at timestamptz
);

create table if not exists public.notifications(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.users(id) on delete cascade,
 conversation_id uuid references public.conversations(id) on delete cascade,
 type text not null,
 title text not null,
 body text not null,
 sent_at timestamptz,
 read_at timestamptz
);

create table if not exists public.reports(
 id uuid primary key default gen_random_uuid(),
 conversation_id uuid not null references public.conversations(id) on delete cascade,
 reporter_type text not null,
 reason text not null,
 description text,
 created_at timestamptz not null default now(),
 status text not null default 'open'
);

create table if not exists public.push_subscriptions(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.users(id) on delete cascade,
 endpoint text not null,
 p256dh text not null,
 auth text not null,
 is_active boolean not null default true,
 created_at timestamptz not null default now(),
 unique(user_id,endpoint)
);

create index if not exists vehicles_qr_idx on public.vehicles(qr_token);
create index if not exists vehicles_owner_idx on public.vehicles(owner_id);
create index if not exists conversations_vehicle_idx on public.conversations(vehicle_id);
create index if not exists messages_conversation_idx on public.messages(conversation_id,created_at);
create index if not exists reports_status_idx on public.reports(status);

create or replace function public.increment_scan(vehicle_uuid uuid)
returns void language sql security definer set search_path=public as $$
 update public.vehicles set scan_count=scan_count+1,last_activity_at=now(),updated_at=now() where id=vehicle_uuid;
$$;

create or replace function public.increment_message_count(vehicle_uuid uuid)
returns void language sql security definer set search_path=public as $$
 update public.vehicles set message_count=message_count+1,last_activity_at=now(),updated_at=now() where id=vehicle_uuid;
$$;

alter table public.users enable row level security;
alter table public.vehicles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.push_subscriptions enable row level security;

drop policy if exists users_self on public.users;
create policy users_self on public.users for select to authenticated using(id=auth.uid());
create policy users_self_update on public.users for update to authenticated using(id=auth.uid()) with check(id=auth.uid());

drop policy if exists vehicles_owner on public.vehicles;
create policy vehicles_owner on public.vehicles for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());

drop policy if exists conversations_owner on public.conversations;
create policy conversations_owner on public.conversations for select to authenticated using(exists(select 1 from public.vehicles v where v.id=vehicle_id and v.owner_id=auth.uid()));

drop policy if exists messages_owner on public.messages;
create policy messages_owner on public.messages for select to authenticated using(exists(select 1 from public.conversations c join public.vehicles v on v.id=c.vehicle_id where c.id=conversation_id and v.owner_id=auth.uid()));

drop policy if exists notifications_owner on public.notifications;
create policy notifications_owner on public.notifications for select to authenticated using(user_id=auth.uid());

drop policy if exists push_owner on public.push_subscriptions;
create policy push_owner on public.push_subscriptions for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());

-- Public visitors use narrowly scoped server routes with the service role.
-- Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.

-- Optional trigger to create a profile after Supabase Auth signup.
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into public.users(id,name,phone,email)
 values(new.id,coalesce(new.raw_user_meta_data->>'name',''),coalesce(new.phone,''),new.email)
 on conflict(id) do update set phone=excluded.phone,email=excluded.email;
 return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_auth_user();

-- Realtime publication for authenticated owner inbox.
alter publication supabase_realtime add table public.messages;


-- ParkPing authentication: Supabase Auth email/password. No SMS/phone OTP provider required.
