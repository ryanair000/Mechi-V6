# Architecture

## Principles

1. Identity is core domain; competition is a future module.
2. Keep route vocabulary small and user-facing.
3. Separate domain/services from JSX.
4. Prefer small feature components over 30–60 KB monoliths.
5. Every exposed Supabase table gets explicit API grants and RLS.
6. Never put service-role/secret keys in client-exposed environment variables.
7. Authorization is enforced in the database and server, never from user-editable metadata.

## Current app shape

```text
src/
  app/
    (app)/
      home/
      discover/
      me/
    health/
  components/
    brand/
    gamer/
    layout/
  lib/
    supabase/
  features/        # introduced from Sprint 1 onward
  domain/          # introduced as behavior grows
  server/          # repositories/services when data flows begin
```

## Supabase auth

V6 uses cookie-based SSR via `@supabase/ssr`. Browser and server clients are separate. Next.js 16 uses `proxy.ts`; the root proxy refreshes/verifies auth claims. Server authorization must use validated claims/user identity, not a spoofable cookie session object.

## Planned data domains

Alpha: `profiles`, `handle_history`, `games`, `profile_games`, `platforms`, `profile_platforms`, `external_accounts`, `follows`, `profile_views`, `shares`, `notifications`, `reputation_events`, `moderation_reports`.

Competition later: `matches`, `match_participants`, `match_reports`, `match_evidence`, `ratings`, `rating_events`, `seasons`, `competitive_game_configs`.

## Game catalogue rule

A game being present in a profile catalogue does not mean competitive support exists. Keep `is_active` separate from `competition_enabled`.

## Database integrity

Reputation/rating changes should be event-oriented so derived aggregates can be rebuilt and audited. Record provenance is mandatory for future competitive history.
