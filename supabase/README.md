# Supabase setup — V6

No production schema migration is committed in Sprint 0 because the Supabase project has not yet been selected/created. Once the project exists, create migrations through the Supabase CLI (`supabase migration new ...`) rather than inventing migration filenames.

## 2026 platform notes

- New public tables may not be automatically exposed to the Data API. V6 migrations must deliberately grant API access only where required, then enable RLS.
- Use the modern **publishable key** in browser/SSR clients. Never expose service-role/secret keys through `NEXT_PUBLIC_*`.
- Next.js cookie sessions use `@supabase/ssr`; authorization should validate claims/user identity rather than trusting the cookie-backed session object.
- RLS UPDATE policies require appropriate SELECT access plus `USING` and `WITH CHECK` ownership predicates.

## First migration plan

1. Enable `citext` if needed for case-insensitive handles.
2. Create `profiles` with a FK to `auth.users`.
3. Create reserved-handle/handle-history strategy.
4. Enable RLS immediately.
5. Add public profile SELECT policy and owner-only UPDATE policy.
6. Explicitly grant only required Data API privileges.
7. Run security + performance advisors.
8. Generate TypeScript types.

Then continue with games/platforms/profile joins.
