# Mechi V6

Competitive identity and football-gaming platform for FC 26 and eFootball.

## V6 thesis

V5 was a matchmaking product with profiles. V6 is an identity-first product that grows into trusted competitive football gaming.

**Product progression:** Mechi ID → Gamer Profile → FC 26 / eFootball identity → Free Ranked → Mechi Rank → Mechi Rep → Tournaments → Sponsored Prizes → Compliant Cash Arena.

The product is gaming-first. Financial features are added only after identity, match verification, trust, tournaments and compliance foundations are proven.

## Alpha loop

Claim ID → build profile → generate/share Mechi Card → profile view → discovery/follow → another gamer claims an ID.

## Alpha scope

1. Mechi ID
2. Public gamer profile
3. Mechi Card
4. Discover

Competition, tournaments, organizer tooling, wallets, DMs and teams remain excluded from Alpha.

## Competitive focus after Alpha

The broader profile catalogue may contain many games, but V6 competition is intentionally limited to:

- EA SPORTS FC 26
- eFootball

The first competitive release is free ranked 1v1 with game-specific profiles, placement matches, Match Room, result verification, evidence/disputes, Mechi Rank, Mechi Rep and leaderboards.

Sponsored prize competitions come before player-funded cash competition.

Live cash features require dedicated financial infrastructure plus legal/regulatory and payment-provider approval before enablement.

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

Keep the app a modular monolith, preserve explicit RLS/security boundaries, and do not place real-money functionality on the shared Jenga Supabase project.
