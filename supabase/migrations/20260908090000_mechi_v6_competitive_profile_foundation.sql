insert into public.mechi_reserved_handles(handle) values
  ('arena'),('tournaments'),('rankings'),('wallet'),('matches'),('leaderboard')
on conflict do nothing;

update public.mechi_games
set competition_enabled = true,
    updated_at = now()
where slug in ('ea-sports-fc-26', 'efootball');

create table public.mechi_competitive_game_configs (
  game_id uuid primary key references public.mechi_games(id) on delete cascade,
  competition_enabled boolean not null default true,
  ranked_enabled boolean not null default true,
  tournament_enabled boolean not null default false,
  cash_enabled boolean not null default false,
  placement_match_count smallint not null default 5,
  default_rating integer not null default 1000,
  verification_method text not null default 'dual_submission',
  supported_modes text[] not null default array['standard-1v1']::text[],
  supported_platform_slugs text[] not null default '{}'::text[],
  ruleset_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mechi_competitive_game_configs_placements check (placement_match_count between 1 and 20),
  constraint mechi_competitive_game_configs_default_rating check (default_rating between 100 and 5000),
  constraint mechi_competitive_game_configs_verification check (verification_method in ('dual_submission','manual_review','official_api','trusted_integration')),
  constraint mechi_competitive_game_configs_cash_gate check (cash_enabled = false or competition_enabled = true)
);

create table public.mechi_player_game_profiles (
  profile_id uuid not null references public.mechi_profiles(id) on delete cascade,
  game_id uuid not null references public.mechi_competitive_game_configs(game_id) on delete cascade,
  rating integer not null default 1000,
  rank_tier text not null default 'unranked',
  rank_division smallint,
  placements_completed smallint not null default 0,
  matches_played integer not null default 0,
  wins integer not null default 0,
  draws integer not null default 0,
  losses integer not null default 0,
  goals_for integer not null default 0,
  goals_against integer not null default 0,
  current_streak integer not null default 0,
  best_win_streak integer not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (profile_id, game_id),
  constraint mechi_player_game_profiles_rating check (rating between 0 and 10000),
  constraint mechi_player_game_profiles_rank_tier check (rank_tier in ('unranked','bronze','silver','gold','platinum','diamond','elite','champion')),
  constraint mechi_player_game_profiles_rank_division check (rank_division is null or rank_division between 1 and 3),
  constraint mechi_player_game_profiles_placements check (placements_completed between 0 and 20),
  constraint mechi_player_game_profiles_stats_nonnegative check (
    matches_played >= 0 and wins >= 0 and draws >= 0 and losses >= 0 and goals_for >= 0 and goals_against >= 0 and best_win_streak >= 0
  ),
  constraint mechi_player_game_profiles_record_consistent check (wins + draws + losses <= matches_played),
  constraint mechi_player_game_profiles_status check (status in ('active','restricted','suspended'))
);

create index mechi_player_game_profiles_game_rating_idx
  on public.mechi_player_game_profiles (game_id, rating desc)
  where status = 'active';

create index mechi_player_game_profiles_profile_idx
  on public.mechi_player_game_profiles (profile_id);

create trigger mechi_competitive_game_configs_touch_updated_at
before update on public.mechi_competitive_game_configs
for each row execute function private.mechi_touch_updated_at();

create trigger mechi_player_game_profiles_touch_updated_at
before update on public.mechi_player_game_profiles
for each row execute function private.mechi_touch_updated_at();

alter table public.mechi_competitive_game_configs enable row level security;
alter table public.mechi_player_game_profiles enable row level security;

revoke all on table public.mechi_competitive_game_configs from anon, authenticated;
revoke all on table public.mechi_player_game_profiles from anon, authenticated;

grant select on table public.mechi_competitive_game_configs to anon, authenticated;
grant select on table public.mechi_player_game_profiles to anon, authenticated;

create policy mechi_competitive_game_configs_public_read
on public.mechi_competitive_game_configs
for select to anon, authenticated
using (competition_enabled = true);

create policy mechi_player_game_profiles_public_read
on public.mechi_player_game_profiles
for select to anon
using (
  exists (
    select 1
    from public.mechi_profiles p
    where p.id = profile_id
      and p.profile_visibility = 'public'
      and p.profile_completed_at is not null
  )
);

create policy mechi_player_game_profiles_authenticated_read
on public.mechi_player_game_profiles
for select to authenticated
using (
  profile_id = (select auth.uid())
  or exists (
    select 1
    from public.mechi_profiles p
    where p.id = profile_id
      and p.profile_visibility = 'public'
      and p.profile_completed_at is not null
  )
);

create or replace function public.mechi_activate_competitive_profile(p_game_slug text)
returns public.mechi_player_game_profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_game_id uuid;
  v_default_rating integer;
  v_row public.mechi_player_game_profiles;
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;

  if not exists (
    select 1
    from public.mechi_profiles p
    where p.id = v_user_id
      and p.profile_completed_at is not null
  ) then
    raise exception using errcode = '23514', message = 'complete_mechi_profile_first';
  end if;

  select c.game_id, c.default_rating
  into v_game_id, v_default_rating
  from public.mechi_competitive_game_configs c
  join public.mechi_games g on g.id = c.game_id
  where g.slug = lower(trim(p_game_slug))
    and g.is_active = true
    and g.competition_enabled = true
    and c.competition_enabled = true;

  if v_game_id is null then
    raise exception using errcode = '23514', message = 'competitive_game_not_available';
  end if;

  insert into public.mechi_profile_games (
    profile_id,
    game_id,
    is_primary,
    is_favorite,
    currently_playing,
    skill_style
  )
  values (
    v_user_id,
    v_game_id,
    false,
    false,
    true,
    'competitive'
  )
  on conflict (profile_id, game_id)
  do update set
    currently_playing = true,
    skill_style = case
      when public.mechi_profile_games.skill_style = 'casual' then 'mixed'
      else public.mechi_profile_games.skill_style
    end;

  insert into public.mechi_player_game_profiles (
    profile_id,
    game_id,
    rating
  )
  values (
    v_user_id,
    v_game_id,
    v_default_rating
  )
  on conflict (profile_id, game_id) do nothing;

  select *
  into v_row
  from public.mechi_player_game_profiles
  where profile_id = v_user_id
    and game_id = v_game_id;

  return v_row;
end;
$$;

revoke all on function public.mechi_activate_competitive_profile(text) from public, anon;
grant execute on function public.mechi_activate_competitive_profile(text) to authenticated;

insert into public.mechi_competitive_game_configs (
  game_id,
  competition_enabled,
  ranked_enabled,
  tournament_enabled,
  cash_enabled,
  placement_match_count,
  default_rating,
  verification_method,
  supported_modes,
  supported_platform_slugs,
  ruleset_version
)
select
  g.id,
  true,
  true,
  false,
  false,
  5,
  1000,
  'dual_submission',
  array['standard-1v1']::text[],
  case g.slug
    when 'ea-sports-fc-26' then array['playstation-5','playstation-4','xbox-series','xbox-one','pc']::text[]
    when 'efootball' then array['playstation-5','playstation-4','xbox-series','xbox-one','pc','mobile']::text[]
    else '{}'::text[]
  end,
  1
from public.mechi_games g
where g.slug in ('ea-sports-fc-26','efootball')
on conflict (game_id) do update set
  competition_enabled = excluded.competition_enabled,
  ranked_enabled = excluded.ranked_enabled,
  cash_enabled = false,
  placement_match_count = excluded.placement_match_count,
  default_rating = excluded.default_rating,
  verification_method = excluded.verification_method,
  supported_modes = excluded.supported_modes,
  supported_platform_slugs = excluded.supported_platform_slugs,
  ruleset_version = excluded.ruleset_version;

comment on table public.mechi_competitive_game_configs is 'Competition allow-list/config. V6 initially enables FC 26 and eFootball only; cash_enabled defaults false.';
comment on table public.mechi_player_game_profiles is 'Server-controlled game-specific competitive identity and aggregate record. Client roles have read-only table access.';
comment on function public.mechi_activate_competitive_profile(text) is 'Authenticated activation path for an FC 26/eFootball competitive identity. Creates only default competitive state; ratings/stats remain server-controlled.';
