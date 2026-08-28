# Sprint 1 Status

## Implemented

- Reused the existing **Jenga** Supabase project instead of consuming another free-project slot.
- Isolated Mechi data behind `mechi_*` tables; no existing application tables were repurposed.
- Added portable Mechi identity migration under `supabase/migrations/`.
- Added Jenga-only shared-auth compatibility patch under `supabase/shared-project-patches/` so a future clean Mechi database remains portable.
- Enabled RLS on every Mechi table exposed through `public`.
- Added explicit public/authenticated grants and owner-write policies.
- Added atomic, database-enforced unique Mechi handles and reserved handles.
- Seeded 20 launch catalogue games and 7 platforms.
- Audited Jenga `auth.users` triggers and excluded `app = 'mechi'` users from unrelated JengaAds, PostCutz, Socio, generic-profile and Spykes bootstrap behavior.
- Added email/password signup and login UI.
- Every Mechi signup is tagged with `raw_user_meta_data.app = 'mechi'` for shared-project routing only; this metadata is never used as an authorization claim.
- Added SSR auth callback support for authorization-code exchange and token-hash email confirmation.
- Added authenticated onboarding and atomic `@handle` claiming.
- Connected `/me` and `/home` to the authenticated Mechi profile.
- Added sign out.

## Database verification

- `mechi_profiles` — RLS enabled
- `mechi_games` — RLS enabled
- `mechi_profile_games` — RLS enabled
- `mechi_platforms` — RLS enabled
- `mechi_profile_platforms` — RLS enabled
- `mechi_external_accounts` — RLS enabled
- `mechi_reserved_handles` — RLS enabled, deliberately inaccessible to clients
- 20 games seeded
- 7 platforms seeded
- 23 reserved handles seeded

Supabase security advisors showed no Mechi warning-level RLS issue. The reserved-handle table reports an informational "RLS enabled with no policy" note by design because client privileges are revoked.

## Still pending before calling Sprint 1 production-ready

1. Create a new Vercel project for `ryanair000/Mechi-V6` rather than repurposing V5.
2. Configure:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. Add the deployed Mechi callback URL to the shared Supabase Auth redirect allow list without changing other apps' URLs.
4. Run a real signup → email confirmation → handle claim → logout/login E2E test.
5. Generate and commit `package-lock.json` once npm registry access is available, then run typecheck, lint and build.

## CI note

GitHub Actions is currently failing before the workflow executes any step. Jobs show `runner_id: 0`, empty step lists and completion within roughly one second. This is a GitHub Actions runner/allocation issue, not a reported application compile/test failure. A real build is therefore still unverified.

## Scope discipline

Sprint 1 does not add tournaments, matchmaking, teams, wallets, messaging or organizer tooling. The next product work should remain profile/onboarding focused after the auth flow passes E2E.
