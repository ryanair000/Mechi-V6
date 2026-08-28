# Mechi V6

Universal gamer identity and discovery platform.

## V6 thesis

V5 was a matchmaking product with profiles. V6 is a gamer identity product with competition layered on later.

**Alpha loop:** Claim ID → build profile → generate/share Mechi Card → profile view → discovery/follow → another gamer claims an ID.

## Alpha scope

1. Mechi ID
2. Public gamer profile
3. Mechi Card
4. Discover

Competition, tournaments, organizer tooling, wallets, DMs and teams are intentionally excluded from Alpha.

## Stack

- Next.js 16.3.3
- React 19.2.8
- TypeScript 5.9.3
- Tailwind CSS 4.3.3
- Supabase SSR 0.12.5
- Supabase JS 2.112.4
- Node.js 22+

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Until Supabase credentials are added, the marketing/product-shell routes work and `/health` reports `supabaseConfigured: false`.

## Quality

```bash
npm run verify:foundation
npm run typecheck
npm run lint
npm run build
```

## Product docs

- `docs/V6_PRODUCT_SPEC.md`
- `docs/ARCHITECTURE.md`
- `docs/ROADMAP.md`
- `docs/DECISIONS.md`

## Repository policy

This codebase is intentionally clean-room relative to V5. Reuse proven utilities selectively; do not recreate V5's route tree or organizer/tournament-first architecture.
