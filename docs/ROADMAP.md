# V6 Delivery Roadmap

## Product sequence

V6 develops in this order:

**Identity → FC 26/eFootball identity → Free competition → Rank/Rep → Tournaments → Sponsored prizes → Financial infrastructure → Compliant Cash Arena**

The identity Alpha remains intact. Competitive and financial scope is added only after the preceding layer is proven.

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

- Google/email auth
- profile bootstrap
- handle availability/claim
- reserved handles
- auth redirects
- RLS
- onboarding entry

## Sprint 2 — Onboarding

- avatar
- display name
- bio
- country/city
- games
- platforms
- gamer style
- optional accounts

## Sprint 3 — Public Profile

- `/@handle`
- hero
- games
- platforms
- account provenance
- sharing controls
- SEO/profile views

## Sprint 4 — Mechi Card

- dynamic OG
- square/story cards
- QR/native/WhatsApp sharing
- share analytics

## Sprint 5 — Discover

- search
- filters
- game pages
- recommendations
- location/platform discovery

## Sprint 6 — Follow + Home

- following
- counts
- identity activity
- recommendations
- notifications
- profile performance

## Sprint 7 — Alpha Polish

- accessibility
- mobile UX
- loading/empty/error states
- performance
- metadata
- no major new feature

## Sprint 8 — Closed Identity Alpha

Target 50–100 real gamers.

Measure:

- onboarding completion
- profile sharing
- share → view
- view → signup
- discovery usage
- D1/D7/D30 retention

**Identity Beta gate:** proceed only if the identity loop shows meaningful traction.

---

# Competitive Football Roadmap

## Sprint 9 — FC 26 + eFootball Competitive Profiles

- `mechi_competitive_game_configs`
- only FC 26 and eFootball enabled competitively
- game-specific competitive profiles
- platform/account association
- placement state
- rank placeholders
- competitive stats shell

**Exit:** a player can have independent FC 26 and eFootball competitive identities.

## Sprint 10 — Free Match Room

- create/join normal matches
- Match Room
- participant acceptance
- ready state
- game/platform/rules display
- public Mechi Match ID
- match lifecycle state machine
- cancellation/expiration

**Exit:** two players can complete the operational flow of a free match without rankings or money.

## Sprint 11 — Result Verification + Evidence

- structured score submission
- independent player reporting
- automatic agreement detection
- result verification
- evidence upload
- dispute creation
- moderator review surface
- verified/void outcomes

**Exit:** every completed match has an auditable result path.

## Sprint 12 — Mechi Rank

- game-specific rating engine
- placement matches
- visible rank tiers/divisions
- rating events
- rank history
- promotion/demotion
- match history

Planned tiers:

Bronze → Silver → Gold → Platinum → Diamond → Elite → Champion

**Exit:** FC 26 and eFootball players can build separate competitive ranks.

## Sprint 13 — Mechi Rep + Competitive Trust

- match completion signals
- result agreement signals
- dispute outcome events
- disconnect reporting
- sportsmanship/reporting controls
- trust/restriction status
- verified-player indicators where appropriate

**Exit:** skill and trust are clearly separated.

## Sprint 14 — Ranked Matchmaking

- FC 26 queue
- eFootball queue
- platform compatibility
- rating-band matching
- region considerations
- queue widening over time
- challenge a specific player

**Exit:** a player can reliably find an appropriately matched opponent.

## Sprint 15 — Leaderboards + Seasons

- FC 26 leaderboard
- eFootball leaderboard
- weekly/monthly/season views
- friends/locality filters where safe/useful
- form
- season history
- trophies/badges

**Exit:** competitive identity has persistent progression and status.

## Sprint 16 — Tournament Engine

- controlled PlayMechi tournaments
- brackets
- entries
- rounds
- normal Match Room reuse
- tournament standings/results
- tournament history on profiles

**Exit:** tournaments use the same underlying match/result engine.

## Sprint 17 — Sponsored Prize Competitions

- PlayMechi/sponsor-funded prize pools
- free-entry eligibility
- fixed rulesets
- KYC/age/eligibility gates as required
- payout workflow
- enhanced disputes/admin review
- accounting for sponsor prize funds

**Exit:** PlayMechi can run controlled prize competitions without player-funded entry.

---

# Financial Readiness Roadmap

## Sprint 18 — Dedicated Financial Infrastructure

Before real-money features:

- migrate Mechi to a dedicated Supabase/database security boundary
- isolate production secrets
- harden server authorization
- financial domain tables
- immutable double-entry ledger
- financial audit log
- idempotency framework
- transactional outbox/events

**Hard gate:** no live player deposits on the shared Jenga database.

## Sprint 19 — Wallet + Ledger

- wallet read model
- available balance
- locked balance
- bonus balance
- ledger accounts
- journals/entries
- transaction history
- reversals
- refund flow
- cash liability reporting

**Exit:** every internal shilling movement is reconstructable from the ledger.

## Sprint 20 — Payment Sandbox + Reconciliation

- approved payment-provider integration
- deposit intents
- authenticated provider callbacks/webhooks
- idempotent deposit crediting
- withdrawal requests
- payout state machine
- reconciliation jobs
- duplicate/missing/mismatch detection

**Exit:** payment-provider money and PlayMechi ledger reconcile reliably.

## Sprint 21 — KYC + Risk + Compliance Controls

- player eligibility policy engine
- identity/age verification integration as required
- jurisdiction rules
- cash-enabled account gates
- risk events/scores
- shared-device/payment signals
- velocity limits
- restrictions/review cases
- responsible-play controls where required
- audit and privacy controls

**Exit:** eligibility and risk decisions are explicit, reviewable and enforceable.

## Sprint 22 — Closed Cash Arena Pilot

Only after legal/regulatory classification, licensing/authorization where required and payment-provider approval.

Initial pilot should be intentionally narrow:

- Kenya only
- KES only
- FC 26 and/or eFootball
- one approved competition format
- fixed entry tiers
- verified/eligible players
- one approved payment path
- invite-only
- manual dispute/risk oversight
- strict limits
- daily reconciliation

**Primary pilot question:** can PlayMechi account for every shilling and resolve every match fairly?

## Sprint 23+ — Scale Carefully

Potential future layers after the pilot proves trustworthy:

- broader paid competition availability
- automated 1v1 cash matchmaking
- cash tournaments
- more robust official/integrated result verification
- creator tournaments
- university/corporate esports
- leagues and divisions
- teams
- organizer tooling
- additional jurisdictions only after local policy/licensing work

## Explicitly postponed

Until the core FC 26/eFootball system works beautifully, do not prioritize:

- other competitive games
- arbitrary user-entered cash wagers
- spectator betting
- crypto
- P2P wallet transfers
- multi-currency launch
- casino/odds products
- unrestricted user-created cash contests
- loans/credit for entry

## V6 success ladder

1. Gamers want a Mechi identity.
2. Gamers use that identity for FC 26/eFootball competition.
3. Match results can be verified reliably.
4. Rank and Rep become meaningful.
5. Tournaments retain players.
6. Sponsored prizes can be operated safely.
7. Financial accounting and reconciliation are exact.
8. Cash competition is enabled only where approved and controlled.
