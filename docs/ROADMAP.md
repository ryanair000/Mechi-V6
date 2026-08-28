# V6 Delivery Roadmap

## Sprint 0 — Foundation

- clean Next.js project
- current patched dependency baseline
- TypeScript/Tailwind
- Supabase SSR utilities
- environment contract
- health endpoint
- minimal V6 product shell
- CI workflow
- product/architecture docs

**Exit:** app builds in CI and Supabase project/env can be attached without restructuring.

## Sprint 1 — Auth + Mechi ID

Google/email auth, profile bootstrap, handle availability/claim, reserved handles, auth redirects, RLS, onboarding entry.

## Sprint 2 — Onboarding

Avatar, display name, bio, country/city, games, platforms, gamer style, optional accounts.

## Sprint 3 — Public profile

`/@handle`, hero, games, platforms, account provenance, sharing controls, SEO/profile views.

## Sprint 4 — Mechi Card

Dynamic OG, square/story cards, QR/native/WhatsApp sharing, share analytics.

## Sprint 5 — Discover

Search, filters, game pages, recommendations, location/platform discovery.

## Sprint 6 — Follow + Home

Following, counts, identity activity, recommendations, notifications, profile performance.

## Sprint 7 — Polish

Accessibility, mobile UX, loading/empty/error states, performance, metadata. No major new feature.

## Sprint 8 — Closed Alpha

50–100 real gamers. Measure onboarding completion, activation, profile sharing, share→view, view→signup, discovery usage, D1/D7/D30 retention.

## Beta gate

Only after the identity loop shows traction: add **Looking to Play**, then Mechi Match/Rank/Rep for deliberately enabled games.
