alter table public.mechi_profiles
  drop constraint if exists mechi_profiles_gaming_styles_allowed;

alter table public.mechi_profiles
  add constraint mechi_profiles_gaming_styles_allowed
  check (
    gaming_styles <@ array[
      'competitive','casual','chill','ranked-grinder','weekend-gamer',
      'content-creator','speedrunner','collector','esports','sports-games',
      'fps','racing','fighting-games','rpg'
    ]::text[]
  );

drop policy if exists mechi_profile_games_owner_insert on public.mechi_profile_games;
drop policy if exists mechi_profile_games_owner_update on public.mechi_profile_games;

create policy mechi_profile_games_owner_insert
on public.mechi_profile_games
for insert
to authenticated
with check (
  profile_id = (select auth.uid())
  and exists (
    select 1
    from public.mechi_games g
    where g.id = game_id and g.is_active = true
  )
);

create policy mechi_profile_games_owner_update
on public.mechi_profile_games
for update
to authenticated
using (profile_id = (select auth.uid()))
with check (
  profile_id = (select auth.uid())
  and exists (
    select 1
    from public.mechi_games g
    where g.id = game_id and g.is_active = true
  )
);

drop policy if exists mechi_profile_platforms_owner_insert on public.mechi_profile_platforms;
drop policy if exists mechi_profile_platforms_owner_update on public.mechi_profile_platforms;

create policy mechi_profile_platforms_owner_insert
on public.mechi_profile_platforms
for insert
to authenticated
with check (
  profile_id = (select auth.uid())
  and exists (
    select 1
    from public.mechi_platforms p
    where p.id = platform_id and p.is_active = true
  )
);

create policy mechi_profile_platforms_owner_update
on public.mechi_profile_platforms
for update
to authenticated
using (profile_id = (select auth.uid()))
with check (
  profile_id = (select auth.uid())
  and exists (
    select 1
    from public.mechi_platforms p
    where p.id = platform_id and p.is_active = true
  )
);

create or replace function public.mechi_complete_onboarding(
  p_display_name text,
  p_bio text default null,
  p_country_code text default null,
  p_city text default null,
  p_gaming_styles text[] default '{}'::text[],
  p_game_ids uuid[] default '{}'::uuid[],
  p_platform_ids uuid[] default '{}'::uuid[]
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_display_name text := trim(coalesce(p_display_name, ''));
  v_bio text := nullif(trim(coalesce(p_bio, '')), '');
  v_country_code text := nullif(upper(trim(coalesce(p_country_code, ''))), '');
  v_city text := nullif(trim(coalesce(p_city, '')), '');
  v_game_count integer;
  v_platform_count integer;
  v_active_game_count integer;
  v_active_platform_count integer;
begin
  if v_uid is null then
    raise exception using errcode = '28000', message = 'mechi_auth_required';
  end if;

  if not exists (select 1 from public.mechi_profiles where id = v_uid) then
    raise exception using errcode = 'P0001', message = 'mechi_profile_required';
  end if;

  if char_length(v_display_name) < 1 or char_length(v_display_name) > 60 then
    raise exception using errcode = '22023', message = 'mechi_invalid_display_name';
  end if;

  if v_bio is not null and char_length(v_bio) > 160 then
    raise exception using errcode = '22023', message = 'mechi_bio_too_long';
  end if;

  if v_country_code is not null and v_country_code !~ '^[A-Z]{2}$' then
    raise exception using errcode = '22023', message = 'mechi_invalid_country_code';
  end if;

  if v_city is not null and char_length(v_city) > 80 then
    raise exception using errcode = '22023', message = 'mechi_city_too_long';
  end if;

  if not coalesce(p_gaming_styles, '{}'::text[]) <@ array[
    'competitive','casual','chill','ranked-grinder','weekend-gamer',
    'content-creator','speedrunner','collector','esports','sports-games',
    'fps','racing','fighting-games','rpg'
  ]::text[] then
    raise exception using errcode = '22023', message = 'mechi_invalid_gaming_style';
  end if;

  select count(distinct x) into v_game_count
  from unnest(coalesce(p_game_ids, '{}'::uuid[])) as x;

  select count(distinct x) into v_platform_count
  from unnest(coalesce(p_platform_ids, '{}'::uuid[])) as x;

  if v_game_count < 2 or v_game_count > 10 then
    raise exception using errcode = '22023', message = 'mechi_choose_2_to_10_games';
  end if;

  if v_platform_count < 1 or v_platform_count > 4 then
    raise exception using errcode = '22023', message = 'mechi_choose_1_to_4_platforms';
  end if;

  select count(*) into v_active_game_count
  from public.mechi_games
  where id = any(coalesce(p_game_ids, '{}'::uuid[])) and is_active = true;

  select count(*) into v_active_platform_count
  from public.mechi_platforms
  where id = any(coalesce(p_platform_ids, '{}'::uuid[])) and is_active = true;

  if v_active_game_count <> v_game_count then
    raise exception using errcode = '22023', message = 'mechi_invalid_game_selection';
  end if;

  if v_active_platform_count <> v_platform_count then
    raise exception using errcode = '22023', message = 'mechi_invalid_platform_selection';
  end if;

  update public.mechi_profiles
  set
    display_name = v_display_name,
    bio = v_bio,
    country_code = v_country_code,
    city = v_city,
    gaming_styles = coalesce(p_gaming_styles, '{}'::text[]),
    onboarding_step = 7,
    profile_completed_at = coalesce(profile_completed_at, now())
  where id = v_uid;

  delete from public.mechi_profile_games where profile_id = v_uid;

  insert into public.mechi_profile_games (
    profile_id, game_id, is_primary, is_favorite, currently_playing, skill_style
  )
  select
    v_uid,
    selected.game_id,
    selected.ord = 1,
    selected.ord <= 3,
    true,
    'mixed'
  from (
    select game_id, min(ord)::bigint as ord
    from unnest(coalesce(p_game_ids, '{}'::uuid[])) with ordinality as u(game_id, ord)
    group by game_id
  ) as selected
  order by selected.ord;

  delete from public.mechi_profile_platforms where profile_id = v_uid;

  insert into public.mechi_profile_platforms (profile_id, platform_id, is_primary)
  select
    v_uid,
    selected.platform_id,
    selected.ord = 1
  from (
    select platform_id, min(ord)::bigint as ord
    from unnest(coalesce(p_platform_ids, '{}'::uuid[])) with ordinality as u(platform_id, ord)
    group by platform_id
  ) as selected
  order by selected.ord;
end;
$$;

revoke execute on function public.mechi_complete_onboarding(text,text,text,text,text[],uuid[],uuid[]) from public, anon;
grant execute on function public.mechi_complete_onboarding(text,text,text,text,text[],uuid[],uuid[]) to authenticated;

comment on function public.mechi_complete_onboarding(text,text,text,text,text[],uuid[],uuid[])
is 'Atomically completes Mechi V6 identity onboarding for the authenticated profile while respecting RLS.';