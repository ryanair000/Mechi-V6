create schema if not exists private;

create table public.mechi_reserved_handles (
  handle text primary key,
  created_at timestamptz not null default now(),
  constraint mechi_reserved_handles_lowercase check (handle = lower(handle)),
  constraint mechi_reserved_handles_format check (handle ~ '^[a-z0-9_]{3,20}$')
);

create table public.mechi_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text not null unique,
  display_name text not null,
  bio text,
  avatar_url text,
  banner_url text,
  country_code text,
  city text,
  gaming_styles text[] not null default '{}'::text[],
  languages text[] not null default '{}'::text[],
  profile_visibility text not null default 'public',
  show_city boolean not null default true,
  show_accounts boolean not null default true,
  show_followers boolean not null default true,
  onboarding_step smallint not null default 1,
  profile_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mechi_profiles_display_name_length check (char_length(display_name) between 1 and 60),
  constraint mechi_profiles_bio_length check (bio is null or char_length(bio) <= 160),
  constraint mechi_profiles_country_code check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  constraint mechi_profiles_visibility check (profile_visibility in ('public','private')),
  constraint mechi_profiles_onboarding_step check (onboarding_step between 1 and 7)
);

create table public.mechi_games (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_name text,
  cover_url text,
  icon_url text,
  genres text[] not null default '{}'::text[],
  is_active boolean not null default true,
  competition_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mechi_games_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.mechi_profile_games (
  profile_id uuid not null references public.mechi_profiles(id) on delete cascade,
  game_id uuid not null references public.mechi_games(id) on delete cascade,
  is_primary boolean not null default false,
  is_favorite boolean not null default false,
  currently_playing boolean not null default true,
  skill_style text not null default 'mixed',
  added_at timestamptz not null default now(),
  primary key (profile_id, game_id),
  constraint mechi_profile_games_skill_style check (skill_style in ('competitive','casual','mixed'))
);

create table public.mechi_platforms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  icon_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint mechi_platforms_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.mechi_profile_platforms (
  profile_id uuid not null references public.mechi_profiles(id) on delete cascade,
  platform_id uuid not null references public.mechi_platforms(id) on delete cascade,
  is_primary boolean not null default false,
  added_at timestamptz not null default now(),
  primary key (profile_id, platform_id)
);

create table public.mechi_external_accounts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.mechi_profiles(id) on delete cascade,
  provider text not null,
  username text not null,
  external_user_id text,
  profile_url text,
  verification_status text not null default 'self_reported',
  verified_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mechi_external_accounts_provider_length check (char_length(provider) between 2 and 40),
  constraint mechi_external_accounts_username_length check (char_length(username) between 1 and 100),
  constraint mechi_external_accounts_verification_status check (verification_status in ('self_reported','verified','connected'))
);

create unique index mechi_external_accounts_profile_provider_username_uq
  on public.mechi_external_accounts (profile_id, lower(provider), lower(username));
create index mechi_profiles_handle_idx on public.mechi_profiles (handle);
create index mechi_profiles_location_idx on public.mechi_profiles (country_code, city) where profile_visibility = 'public';
create index mechi_profile_games_game_idx on public.mechi_profile_games (game_id, profile_id);
create index mechi_profile_platforms_platform_idx on public.mechi_profile_platforms (platform_id, profile_id);

create or replace function private.mechi_normalize_profile_handle()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.handle := lower(trim(new.handle));
  if new.handle !~ '^[a-z0-9_]{3,20}$' then
    raise exception using errcode = '23514', message = 'invalid_mechi_handle';
  end if;
  if exists (select 1 from public.mechi_reserved_handles where handle = new.handle) then
    raise exception using errcode = '23514', message = 'reserved_mechi_handle';
  end if;
  return new;
end;
$$;
revoke all on function private.mechi_normalize_profile_handle() from public, anon, authenticated;
create trigger mechi_profiles_normalize_handle
before insert or update of handle on public.mechi_profiles
for each row execute function private.mechi_normalize_profile_handle();

create or replace function private.mechi_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function private.mechi_touch_updated_at() from public, anon, authenticated;
create trigger mechi_profiles_touch_updated_at before update on public.mechi_profiles for each row execute function private.mechi_touch_updated_at();
create trigger mechi_games_touch_updated_at before update on public.mechi_games for each row execute function private.mechi_touch_updated_at();
create trigger mechi_external_accounts_touch_updated_at before update on public.mechi_external_accounts for each row execute function private.mechi_touch_updated_at();

alter table public.mechi_reserved_handles enable row level security;
alter table public.mechi_profiles enable row level security;
alter table public.mechi_games enable row level security;
alter table public.mechi_profile_games enable row level security;
alter table public.mechi_platforms enable row level security;
alter table public.mechi_profile_platforms enable row level security;
alter table public.mechi_external_accounts enable row level security;

revoke all on table public.mechi_reserved_handles from anon, authenticated;
revoke all on table public.mechi_profiles from anon, authenticated;
revoke all on table public.mechi_games from anon, authenticated;
revoke all on table public.mechi_profile_games from anon, authenticated;
revoke all on table public.mechi_platforms from anon, authenticated;
revoke all on table public.mechi_profile_platforms from anon, authenticated;
revoke all on table public.mechi_external_accounts from anon, authenticated;
grant select on table public.mechi_profiles to anon, authenticated;
grant insert, update, delete on table public.mechi_profiles to authenticated;
grant select on table public.mechi_games to anon, authenticated;
grant select on table public.mechi_platforms to anon, authenticated;
grant select on table public.mechi_profile_games to anon, authenticated;
grant insert, update, delete on table public.mechi_profile_games to authenticated;
grant select on table public.mechi_profile_platforms to anon, authenticated;
grant insert, update, delete on table public.mechi_profile_platforms to authenticated;
grant select on table public.mechi_external_accounts to anon, authenticated;
grant insert, update, delete on table public.mechi_external_accounts to authenticated;

create policy mechi_profiles_public_read on public.mechi_profiles for select to anon using (profile_visibility = 'public');
create policy mechi_profiles_authenticated_read on public.mechi_profiles for select to authenticated using (profile_visibility = 'public' or id = (select auth.uid()));
create policy mechi_profiles_owner_insert on public.mechi_profiles for insert to authenticated with check (id = (select auth.uid()));
create policy mechi_profiles_owner_update on public.mechi_profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy mechi_profiles_owner_delete on public.mechi_profiles for delete to authenticated using (id = (select auth.uid()));
create policy mechi_games_public_read on public.mechi_games for select to anon, authenticated using (is_active = true);
create policy mechi_platforms_public_read on public.mechi_platforms for select to anon, authenticated using (is_active = true);

create policy mechi_profile_games_public_read on public.mechi_profile_games for select to anon using (exists (select 1 from public.mechi_profiles p where p.id = profile_id and p.profile_visibility = 'public'));
create policy mechi_profile_games_authenticated_read on public.mechi_profile_games for select to authenticated using (profile_id = (select auth.uid()) or exists (select 1 from public.mechi_profiles p where p.id = profile_id and p.profile_visibility = 'public'));
create policy mechi_profile_games_owner_insert on public.mechi_profile_games for insert to authenticated with check (profile_id = (select auth.uid()));
create policy mechi_profile_games_owner_update on public.mechi_profile_games for update to authenticated using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));
create policy mechi_profile_games_owner_delete on public.mechi_profile_games for delete to authenticated using (profile_id = (select auth.uid()));

create policy mechi_profile_platforms_public_read on public.mechi_profile_platforms for select to anon using (exists (select 1 from public.mechi_profiles p where p.id = profile_id and p.profile_visibility = 'public'));
create policy mechi_profile_platforms_authenticated_read on public.mechi_profile_platforms for select to authenticated using (profile_id = (select auth.uid()) or exists (select 1 from public.mechi_profiles p where p.id = profile_id and p.profile_visibility = 'public'));
create policy mechi_profile_platforms_owner_insert on public.mechi_profile_platforms for insert to authenticated with check (profile_id = (select auth.uid()));
create policy mechi_profile_platforms_owner_update on public.mechi_profile_platforms for update to authenticated using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));
create policy mechi_profile_platforms_owner_delete on public.mechi_profile_platforms for delete to authenticated using (profile_id = (select auth.uid()));

create policy mechi_external_accounts_public_read on public.mechi_external_accounts for select to anon using (exists (select 1 from public.mechi_profiles p where p.id = profile_id and p.profile_visibility = 'public' and p.show_accounts = true));
create policy mechi_external_accounts_authenticated_read on public.mechi_external_accounts for select to authenticated using (profile_id = (select auth.uid()) or exists (select 1 from public.mechi_profiles p where p.id = profile_id and p.profile_visibility = 'public' and p.show_accounts = true));
create policy mechi_external_accounts_owner_insert on public.mechi_external_accounts for insert to authenticated with check (profile_id = (select auth.uid()));
create policy mechi_external_accounts_owner_update on public.mechi_external_accounts for update to authenticated using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));
create policy mechi_external_accounts_owner_delete on public.mechi_external_accounts for delete to authenticated using (profile_id = (select auth.uid()));

insert into public.mechi_reserved_handles(handle) values
  ('admin'),('support'),('mechi'),('playmechi'),('settings'),('login'),('signup'),('api'),('discover'),('games'),('teams'),('events'),('rank'),('verified'),('help'),('home'),('profile'),('profiles'),('account'),('accounts'),('auth'),('moderator'),('staff')
on conflict do nothing;

insert into public.mechi_platforms(slug, name) values
  ('playstation-5','PlayStation 5'),('playstation-4','PlayStation 4'),('xbox-series','Xbox Series X|S'),('xbox-one','Xbox One'),('pc','PC'),('nintendo-switch','Nintendo Switch'),('mobile','Mobile')
on conflict (slug) do update set name = excluded.name, is_active = true;

insert into public.mechi_games(slug, name, short_name, genres) values
  ('ea-sports-fc-26','EA Sports FC 26','FC 26',array['sports']),
  ('efootball','eFootball','eFootball',array['sports']),
  ('call-of-duty','Call of Duty','COD',array['fps']),
  ('fortnite','Fortnite','Fortnite',array['battle-royale']),
  ('grand-theft-auto-v','Grand Theft Auto V','GTA V',array['action']),
  ('grand-theft-auto-vi','Grand Theft Auto VI','GTA VI',array['action']),
  ('minecraft','Minecraft','Minecraft',array['sandbox']),
  ('valorant','VALORANT','VALORANT',array['fps']),
  ('apex-legends','Apex Legends','Apex',array['battle-royale','fps']),
  ('pubg','PUBG: Battlegrounds','PUBG',array['battle-royale']),
  ('free-fire','Free Fire','Free Fire',array['battle-royale','mobile']),
  ('mortal-kombat-1','Mortal Kombat 1','MK1',array['fighting']),
  ('tekken-8','Tekken 8','Tekken 8',array['fighting']),
  ('nba-2k','NBA 2K','NBA 2K',array['sports']),
  ('f1','F1','F1',array['racing']),
  ('gran-turismo-7','Gran Turismo 7','GT7',array['racing']),
  ('forza-horizon','Forza Horizon','Forza',array['racing']),
  ('rocket-league','Rocket League','Rocket League',array['sports']),
  ('marvel-rivals','Marvel Rivals','Marvel Rivals',array['hero-shooter']),
  ('rainbow-six-siege','Tom Clancy''s Rainbow Six Siege','R6 Siege',array['fps'])
on conflict (slug) do update set name = excluded.name, short_name = excluded.short_name, genres = excluded.genres, is_active = true;

comment on table public.mechi_profiles is 'Mechi V6 gamer identity profiles. Isolated from other apps in the shared Jenga Supabase project.';
comment on table public.mechi_games is 'Games users may display on their Mechi identity. competition_enabled is intentionally separate from catalogue availability.';
comment on table public.mechi_external_accounts is 'Gaming account identities with explicit provenance via verification_status.';