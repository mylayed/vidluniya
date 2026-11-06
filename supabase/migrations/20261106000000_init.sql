-- Відлуння: початкова схема (Етап 1).
-- Запуск: Supabase Dashboard → SQL Editor → вставити весь файл → Run.
--
-- Принципи безпеки (див. PLAN.md):
--  * RLS увімкнено на всіх таблицях.
--  * Клієнт не створює капсули напряму і не читає чужі точні координати та audio_path:
--    створення й відкриття йдуть через Edge Functions (service role) з серверною перевіркою позиції.
--  * Карта користується функцією capsules_nearby: далекі капсули повертаються розмитими,
--    точна точка — лише в радіусі 300 м.

create extension if not exists postgis with schema extensions;

-- ---------------------------------------------------------------------------
-- Профілі
-- ---------------------------------------------------------------------------
create table public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  nickname       text unique check (nickname is null or char_length(nickname) between 3 and 30),
  avatar_url     text,
  language       text not null default 'uk' check (language in ('uk', 'en')),
  phone_verified boolean not null default false,
  plan           text not null default 'free' check (plan in ('free', 'plus', 'author')),
  created_at     timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: читати свій профіль"
  on public.profiles for select to authenticated
  using (id = auth.uid());

create policy "profiles: оновлювати свій профіль"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Користувач може міняти лише ці поля. plan і phone_verified виставляє тільки сервер.
revoke update on public.profiles from authenticated;
grant update (nickname, avatar_url, language) on public.profiles to authenticated;

-- Профіль створюється автоматично при реєстрації.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, 'user_' || substr(replace(new.id::text, '-', ''), 1, 8));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Капсули
-- ---------------------------------------------------------------------------
create table public.capsules (
  id                uuid primary key default gen_random_uuid(),
  author_id         uuid not null references public.profiles (id) on delete cascade,
  location          extensions.geography(Point, 4326) not null,
  radius_m          integer not null default 50 check (radius_m between 10 and 500),
  audio_path        text not null,
  duration_s        integer not null check (duration_s between 1 and 300),
  title             text check (title is null or char_length(title) <= 80),
  hint              text check (hint is null or char_length(hint) <= 200),
  transcript        text,
  visibility        text not null default 'public' check (visibility in ('public', 'private', 'quest')),
  recipient_id      uuid references public.profiles (id) on delete cascade,
  unlock_at         timestamptz,
  password_hash     text,
  is_anonymous      boolean not null default false,
  is_remote         boolean not null default false,
  moderation_status text not null default 'pending'
                    check (moderation_status in ('pending', 'approved', 'rejected')),
  status            text not null default 'active'
                    check (status in ('active', 'sleeping', 'hidden', 'deleted')),
  expires_at        timestamptz,
  created_at        timestamptz not null default now(),
  constraint private_needs_recipient check (visibility <> 'private' or recipient_id is not null)
);

create index capsules_location_idx on public.capsules using gist (location);
create index capsules_author_idx on public.capsules (author_id);
create index capsules_recipient_idx on public.capsules (recipient_id) where recipient_id is not null;

alter table public.capsules enable row level security;

-- Клієнт бачить напряму лише свої капсули. Створення, зміни й відкриття — через Edge Functions.
create policy "capsules: автор читає свої"
  on public.capsules for select to authenticated
  using (author_id = auth.uid());

create policy "capsules: автор видаляє свої"
  on public.capsules for delete to authenticated
  using (author_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Знахідки, відлуння, квести, скарги
-- ---------------------------------------------------------------------------
create table public.discoveries (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  capsule_id uuid not null references public.capsules (id) on delete cascade,
  found_at   timestamptz not null default now(),
  primary key (user_id, capsule_id)
);

alter table public.discoveries enable row level security;

-- Записує знахідки лише сервер (open-capsule) після перевірки позиції.
create policy "discoveries: читати свої"
  on public.discoveries for select to authenticated
  using (user_id = auth.uid());

create table public.echoes (
  id                uuid primary key default gen_random_uuid(),
  capsule_id        uuid not null references public.capsules (id) on delete cascade,
  author_id         uuid not null references public.profiles (id) on delete cascade,
  audio_path        text not null,
  duration_s        integer not null check (duration_s between 1 and 30),
  moderation_status text not null default 'pending'
                    check (moderation_status in ('pending', 'approved', 'rejected')),
  created_at        timestamptz not null default now()
);

alter table public.echoes enable row level security;

create policy "echoes: автор читає свої"
  on public.echoes for select to authenticated
  using (author_id = auth.uid());

create table public.quests (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid not null references public.profiles (id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 80),
  created_at timestamptz not null default now()
);

create table public.quest_steps (
  quest_id   uuid not null references public.quests (id) on delete cascade,
  position   integer not null check (position >= 1),
  capsule_id uuid not null references public.capsules (id) on delete cascade,
  hint       text check (hint is null or char_length(hint) <= 200),
  primary key (quest_id, position)
);

alter table public.quests enable row level security;
alter table public.quest_steps enable row level security;

create policy "quests: автор читає свої"
  on public.quests for select to authenticated
  using (author_id = auth.uid());

create policy "quest_steps: автор читає кроки своїх квестів"
  on public.quest_steps for select to authenticated
  using (exists (select 1 from public.quests q where q.id = quest_id and q.author_id = auth.uid()));

create table public.reports (
  id          uuid primary key default gen_random_uuid(),
  capsule_id  uuid not null references public.capsules (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  category    text not null check (category in ('abuse', 'privacy', 'spam', 'illegal', 'other')),
  comment     text check (comment is null or char_length(comment) <= 500),
  status      text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  created_at  timestamptz not null default now(),
  unique (capsule_id, reporter_id)
);

alter table public.reports enable row level security;

create policy "reports: створювати від свого імені"
  on public.reports for insert to authenticated
  with check (reporter_id = auth.uid());

create policy "reports: читати свої"
  on public.reports for select to authenticated
  using (reporter_id = auth.uid());

-- Скарга «Наркотики / незаконне» одразу ховає капсулу до розгляду.
create function public.hide_capsule_on_illegal_report()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.category = 'illegal' then
    update public.capsules set status = 'hidden' where id = new.capsule_id and status = 'active';
  end if;
  return new;
end;
$$;

create trigger on_report_created
  after insert on public.reports
  for each row execute function public.hide_capsule_on_illegal_report();

-- ---------------------------------------------------------------------------
-- Геозони-винятки (школи, військові об'єкти, приватні будинки). Лише для сервера.
-- ---------------------------------------------------------------------------
create table public.blocked_zones (
  id     uuid primary key default gen_random_uuid(),
  name   text not null,
  reason text,
  area   extensions.geography(Polygon, 4326) not null
);

create index blocked_zones_area_idx on public.blocked_zones using gist (area);

-- RLS без політик: клієнтам закрито повністю, service role обходить RLS.
alter table public.blocked_zones enable row level security;

-- ---------------------------------------------------------------------------
-- Карта: капсули поруч
-- ---------------------------------------------------------------------------
-- Далекі капсули повертаються з детермінованим зсувом до ±250 м (зсув стабільний,
-- тому усередненням його не прибрати). Точна точка й підказка — лише в радіусі 300 м.
create function public.capsules_nearby(
  p_lat      double precision,
  p_lng      double precision,
  p_radius_m integer default 5000
)
returns table (
  id              uuid,
  visibility      text,
  is_time_capsule boolean,
  is_locked       boolean,
  is_mine         boolean,
  is_exact        boolean,
  distance_m      integer,
  lat             double precision,
  lng             double precision,
  title           text,
  hint            text
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  with origin as (
    select st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography as g
  ),
  near as (
    select
      c.*,
      st_distance(c.location, o.g) as dist,
      st_y(c.location::geometry) as real_lat,
      st_x(c.location::geometry) as real_lng,
      (abs(('x' || substr(md5(c.id::text), 1, 8))::bit(32)::bigint) % 501) - 250 as dx_m,
      (abs(('x' || substr(md5(c.id::text), 9, 8))::bit(32)::bigint) % 501) - 250 as dy_m
    from public.capsules c, origin o
    where auth.uid() is not null
      and c.status = 'active'
      and st_dwithin(c.location, o.g, least(greatest(p_radius_m, 100), 20000))
      and (
        c.author_id = auth.uid()
        or (
          c.moderation_status = 'approved'
          and (
            c.visibility = 'public'
            or (c.visibility = 'private' and c.recipient_id = auth.uid())
          )
        )
      )
  )
  select
    n.id,
    n.visibility,
    n.unlock_at is not null,
    coalesce(n.unlock_at > now(), false),
    n.author_id = auth.uid(),
    (n.author_id = auth.uid() or n.dist <= 300),
    n.dist::integer,
    case when n.author_id = auth.uid() or n.dist <= 300
         then n.real_lat
         else n.real_lat + n.dy_m / 111320.0 end,
    case when n.author_id = auth.uid() or n.dist <= 300
         then n.real_lng
         else n.real_lng + n.dx_m / (111320.0 * cos(radians(n.real_lat))) end,
    case when n.author_id = auth.uid() or n.dist <= 300 then n.title end,
    case when n.author_id = auth.uid() or n.dist <= 300 then n.hint end
  from near n
  order by n.dist;
$$;

revoke all on function public.capsules_nearby(double precision, double precision, integer) from public, anon;
grant execute on function public.capsules_nearby(double precision, double precision, integer) to authenticated;
