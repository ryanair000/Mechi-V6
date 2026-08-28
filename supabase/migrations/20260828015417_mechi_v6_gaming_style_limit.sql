alter table public.mechi_profiles
  drop constraint if exists mechi_profiles_gaming_styles_limit;

alter table public.mechi_profiles
  add constraint mechi_profiles_gaming_styles_limit
  check (cardinality(gaming_styles) <= 3);
