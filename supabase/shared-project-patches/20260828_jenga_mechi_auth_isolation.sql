-- Jenga shared-project compatibility patch.
--
-- This file is intentionally NOT in supabase/migrations. A clean Mechi project
-- does not contain these legacy app functions/triggers. It documents the patch
-- applied to the existing Jenga Supabase project so Mechi auth users do not get
-- provisioned into unrelated apps.
--
-- Mechi signup sets raw_user_meta_data.app = 'mechi'. This metadata is used
-- only to route shared-project bootstrap behavior, never for authorization.

drop trigger if exists exampoa_set_admin_claims on auth.users;
create trigger exampoa_set_admin_claims
before insert or update on auth.users
for each row
when (coalesce(new.raw_user_meta_data ->> 'app', '') not in ('journalpersonal', 'mechi'))
execute function public.exampoa_set_admin_claims();

drop trigger if exists on_auth_user_created_create_profile on auth.users;
create trigger on_auth_user_created_create_profile
after insert or update of email, raw_user_meta_data on auth.users
for each row
when (coalesce(new.raw_user_meta_data ->> 'app', '') not in ('journalpersonal', 'mechi'))
execute function public.handle_new_user_profile();

drop trigger if exists on_jengaads_auth_user_created on auth.users;
create trigger on_jengaads_auth_user_created
after insert on auth.users
for each row
when (coalesce(new.raw_user_meta_data ->> 'app', '') not in ('journalpersonal', 'mechi'))
execute function public.handle_jengaads_new_user();

drop trigger if exists postcutz_on_auth_user_created on auth.users;
create trigger postcutz_on_auth_user_created
after insert on auth.users
for each row
when (coalesce(new.raw_user_meta_data ->> 'app', '') not in ('journalpersonal', 'mechi'))
execute function private.postcutz_handle_new_user();

drop trigger if exists socio_attach_new_user on auth.users;
create trigger socio_attach_new_user
after insert on auth.users
for each row
when (coalesce(new.raw_user_meta_data ->> 'app', '') not in ('journalpersonal', 'mechi'))
execute function private.socio_attach_new_user();

drop trigger if exists spykes_link_requests_after_user_change on auth.users;
create trigger spykes_link_requests_after_user_change
after insert or update of email on auth.users
for each row
when (coalesce(new.raw_user_meta_data ->> 'app', '') not in ('journalpersonal', 'mechi'))
execute function public.link_spykes_requests_to_user();