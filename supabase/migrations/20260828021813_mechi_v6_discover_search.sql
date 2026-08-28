create index if not exists mechi_profiles_discover_recent_idx
  on public.mechi_profiles (created_at desc)
  where profile_visibility = 'public' and profile_completed_at is not null;

create index if not exists mechi_profiles_country_city_lower_idx
  on public.mechi_profiles (country_code, lower(city))
  where profile_visibility = 'public' and profile_completed_at is not null and city is not null;

create index if not exists mechi_profiles_gaming_styles_gin_idx
  on public.mechi_profiles using gin (gaming_styles)
  where profile_visibility = 'public' and profile_completed_at is not null;

create or replace function public.mechi_discover_profiles(
  p_query text default null,
  p_game_slug text default null,
  p_platform_slug text default null,
  p_country_code text default null,
  p_city text default null,
  p_gaming_style text default null,
  p_limit integer default 24,
  p_offset integer default 0
)
returns table (
  id uuid,
  handle text,
  display_name text,
  bio text,
  avatar_url text,
  country_code text,
  city text,
  gaming_styles text[],
  created_at timestamptz,
  games jsonb,
  platforms jsonb,
  verified_accounts integer
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    p.id,
    p.handle,
    p.display_name,
    p.bio,
    p.avatar_url,
    p.country_code,
    case when p.show_city then p.city else null end as city,
    p.gaming_styles,
    p.created_at,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'slug', g.slug,
            'name', g.name,
            'shortName', g.short_name,
            'isPrimary', pg.is_primary
          )
          order by pg.is_primary desc, g.name asc
        )
        from public.mechi_profile_games pg
        join public.mechi_games g on g.id = pg.game_id
        where pg.profile_id = p.id and g.is_active = true
      ),
      '[]'::jsonb
    ) as games,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'slug', pl.slug,
            'name', pl.name,
            'isPrimary', pp.is_primary
          )
          order by pp.is_primary desc, pl.name asc
        )
        from public.mechi_profile_platforms pp
        join public.mechi_platforms pl on pl.id = pp.platform_id
        where pp.profile_id = p.id and pl.is_active = true
      ),
      '[]'::jsonb
    ) as platforms,
    (
      select count(*)::integer
      from public.mechi_external_accounts ea
      where ea.profile_id = p.id
        and p.show_accounts = true
        and ea.verification_status in ('verified', 'connected')
    ) as verified_accounts
  from public.mechi_profiles p
  where p.profile_visibility = 'public'
    and p.profile_completed_at is not null
    and (
      nullif(trim(p_query), '') is null
      or p.handle ilike '%' || trim(p_query) || '%'
      or p.display_name ilike '%' || trim(p_query) || '%'
      or (p.show_city and p.city ilike '%' || trim(p_query) || '%')
      or exists (
        select 1
        from public.mechi_profile_games qpg
        join public.mechi_games qg on qg.id = qpg.game_id
        where qpg.profile_id = p.id
          and qg.is_active = true
          and (qg.name ilike '%' || trim(p_query) || '%' or qg.short_name ilike '%' || trim(p_query) || '%')
      )
      or (
        p.show_accounts
        and exists (
          select 1
          from public.mechi_external_accounts qea
          where qea.profile_id = p.id
            and qea.username ilike '%' || trim(p_query) || '%'
        )
      )
    )
    and (
      nullif(trim(p_game_slug), '') is null
      or exists (
        select 1
        from public.mechi_profile_games fpg
        join public.mechi_games fg on fg.id = fpg.game_id
        where fpg.profile_id = p.id
          and fg.is_active = true
          and fg.slug = lower(trim(p_game_slug))
      )
    )
    and (
      nullif(trim(p_platform_slug), '') is null
      or exists (
        select 1
        from public.mechi_profile_platforms fpp
        join public.mechi_platforms fp on fp.id = fpp.platform_id
        where fpp.profile_id = p.id
          and fp.is_active = true
          and fp.slug = lower(trim(p_platform_slug))
      )
    )
    and (
      nullif(trim(p_country_code), '') is null
      or p.country_code = upper(trim(p_country_code))
    )
    and (
      nullif(trim(p_city), '') is null
      or (p.show_city and lower(p.city) = lower(trim(p_city)))
    )
    and (
      nullif(trim(p_gaming_style), '') is null
      or p.gaming_styles @> array[lower(trim(p_gaming_style))]::text[]
    )
  order by
    case
      when nullif(trim(p_query), '') is null then 4
      when lower(p.handle) = lower(trim(p_query)) then 0
      when lower(p.handle) like lower(trim(p_query)) || '%' then 1
      when lower(p.display_name) like lower(trim(p_query)) || '%' then 2
      else 3
    end,
    p.created_at desc,
    p.handle asc
  limit least(greatest(coalesce(p_limit, 24), 1), 48)
  offset greatest(coalesce(p_offset, 0), 0);
$$;

revoke all on function public.mechi_discover_profiles(text, text, text, text, text, text, integer, integer) from public;
grant execute on function public.mechi_discover_profiles(text, text, text, text, text, text, integer, integer) to anon, authenticated;

comment on function public.mechi_discover_profiles(text, text, text, text, text, text, integer, integer)
  is 'Public Mechi V6 gamer discovery search. SECURITY INVOKER preserves underlying RLS and completed-profile visibility rules.';
