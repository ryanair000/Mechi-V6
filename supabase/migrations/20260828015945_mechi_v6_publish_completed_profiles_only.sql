drop policy if exists mechi_profiles_public_read on public.mechi_profiles;
drop policy if exists mechi_profiles_authenticated_read on public.mechi_profiles;

create policy mechi_profiles_public_read
on public.mechi_profiles
for select
to anon
using (
  profile_visibility = 'public'
  and profile_completed_at is not null
);

create policy mechi_profiles_authenticated_read
on public.mechi_profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or (
    profile_visibility = 'public'
    and profile_completed_at is not null
  )
);

drop policy if exists mechi_profile_games_public_read on public.mechi_profile_games;
drop policy if exists mechi_profile_games_authenticated_read on public.mechi_profile_games;

create policy mechi_profile_games_public_read
on public.mechi_profile_games
for select
to anon
using (
  exists (
    select 1 from public.mechi_profiles p
    where p.id = profile_id
      and p.profile_visibility = 'public'
      and p.profile_completed_at is not null
  )
);

create policy mechi_profile_games_authenticated_read
on public.mechi_profile_games
for select
to authenticated
using (
  profile_id = (select auth.uid())
  or exists (
    select 1 from public.mechi_profiles p
    where p.id = profile_id
      and p.profile_visibility = 'public'
      and p.profile_completed_at is not null
  )
);

drop policy if exists mechi_profile_platforms_public_read on public.mechi_profile_platforms;
drop policy if exists mechi_profile_platforms_authenticated_read on public.mechi_profile_platforms;

create policy mechi_profile_platforms_public_read
on public.mechi_profile_platforms
for select
to anon
using (
  exists (
    select 1 from public.mechi_profiles p
    where p.id = profile_id
      and p.profile_visibility = 'public'
      and p.profile_completed_at is not null
  )
);

create policy mechi_profile_platforms_authenticated_read
on public.mechi_profile_platforms
for select
to authenticated
using (
  profile_id = (select auth.uid())
  or exists (
    select 1 from public.mechi_profiles p
    where p.id = profile_id
      and p.profile_visibility = 'public'
      and p.profile_completed_at is not null
  )
);

drop policy if exists mechi_external_accounts_public_read on public.mechi_external_accounts;
drop policy if exists mechi_external_accounts_authenticated_read on public.mechi_external_accounts;

create policy mechi_external_accounts_public_read
on public.mechi_external_accounts
for select
to anon
using (
  exists (
    select 1 from public.mechi_profiles p
    where p.id = profile_id
      and p.profile_visibility = 'public'
      and p.profile_completed_at is not null
      and p.show_accounts = true
  )
);

create policy mechi_external_accounts_authenticated_read
on public.mechi_external_accounts
for select
to authenticated
using (
  profile_id = (select auth.uid())
  or exists (
    select 1 from public.mechi_profiles p
    where p.id = profile_id
      and p.profile_visibility = 'public'
      and p.profile_completed_at is not null
      and p.show_accounts = true
  )
);
