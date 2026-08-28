alter table public.mechi_profiles
  drop constraint if exists mechi_profiles_completed_visibility;

alter table public.mechi_profiles
  add constraint mechi_profiles_completed_visibility
  check (profile_completed_at is null or onboarding_step = 7);
