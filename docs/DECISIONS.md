# V6 Decisions

This file records product and architecture decisions that should not drift casually during implementation.

## D001 — Identity remains the foundation

V6 remains identity-first.

The Alpha continues to prioritize Mechi ID, profile, Mechi Card and discovery. Competition is layered on after the identity loop is proven rather than replacing it.

## D002 — Competitive support is FC 26 + eFootball only

The profile catalogue may include many games, but competitive V6 support is intentionally limited to:

- EA SPORTS FC 26
- eFootball

A game appearing in `mechi_games` does not imply matchmaking, ranking, tournaments or cash eligibility.

## D003 — FC 26 and eFootball identities are independent

Each player has separate competitive ratings, ranks, records and progression for FC 26 and eFootball.

There is no universal cross-game skill rating.

## D004 — Mechi Rank and Mechi Rep are different systems

- **Mechi Rank** represents game-specific competitive skill.
- **Mechi Rep** represents reliability, trust and competitive behaviour.

They must not be collapsed into one score.

## D005 — Free Ranked comes before cash competition

The first Arena release is Free Ranked 1v1.

PlayMechi must prove matchmaking, result verification, disputes, ratings and competitive trust before enabling player-funded competition.

## D006 — One match engine

Friendly/ranked matches, tournament matches and later eligible cash matches all use the same core match lifecycle, Match Room, ruleset, result submission, evidence and dispute systems.

Tournaments must not create a separate result engine.

## D007 — Rules are versioned and frozen

Every confirmed match references a versioned ruleset/snapshot.

Once confirmed, material competition rules must not be silently changed for that match.

## D008 — Result verification precedes rating and settlement

No rating change or money settlement happens from an unverified result.

Initial result verification uses independent structured submissions from both players. Conflicts become disputes and require evidence/review.

## D009 — Sponsored prizes precede player-funded cash

Controlled PlayMechi/sponsor-funded prize competitions should be tested before paid-entry cash competition.

This validates eligibility, result operations, fraud controls, disputes and payout workflows with lower system risk.

## D010 — Money is a separate domain

Mechi RP, Rank, Rep, badges, streaks and other progression systems are non-cash systems.

They are never withdrawable and are never converted into KES.

Real player money uses a dedicated financial domain.

## D011 — Ledger is financial truth

Do not use a mutable `wallet_balance` column as financial truth.

Real money uses an immutable double-entry ledger with explicit reversals, idempotency and reconciliation.

## D012 — No live cash on shared Jenga Supabase

The current shared Jenga Supabase setup is acceptable for early identity work while Mechi data remains isolated behind explicit `mechi_*` tables and RLS.

Before real-money features are enabled, PlayMechi moves to a dedicated Supabase/database security boundary.

## D013 — Fixed competition formats first

Initial competitive modes are deliberately controlled.

Start with one standard 1v1 format for FC 26 and one standard 1v1 format for eFootball. Do not launch arbitrary user-created rules or entry amounts.

## D014 — Matchmaking uses game-specific compatibility

Matchmaking must consider at minimum:

- game
- platform compatibility
- skill/rating band
- region/connection considerations
- trust/restriction state
- queue age

## D015 — Placement matches are required for ranked identity

A player begins unranked for each competitive game and completes placement matches before receiving a visible rank.

FC 26 and eFootball placement progress is independent.

## D016 — Primary leaderboards measure skill, not money won

The principal leaderboard is based on competitive skill/rating.

Prize earnings may appear in appropriate financial/history surfaces, but money won is not the main ranking mechanism.

## D017 — Admin cannot directly edit balances

Financial corrections happen through explicit ledger adjustment/reversal transactions with reason codes, notes and audit history.

High-impact adjustments should support dual approval.

## D018 — Sensitive competition and money mutations are server-authorized

The client may request an action, but settlement, payments, withdrawals, dispute outcomes and protected match transitions must be validated and authorized on the server/database boundary.

## D019 — AI assists evidence review, not final cash decisions initially

Computer vision/AI may help classify screenshots or extract scores, but early real-money dispute settlement requires deterministic evidence/reviewer policy rather than an opaque automated decision.

## D020 — Cash enablement is a gated policy decision

`cash_enabled` is false by default.

Live cash competition is enabled only after the relevant technical, security, legal/regulatory, eligibility and payment-provider gates are satisfied.

## D021 — Initial Cash Arena is intentionally narrow

The first real-money pilot, when approved, is constrained to a small controlled scope such as:

- Kenya
- KES
- FC 26 and/or eFootball
- approved competition format(s)
- fixed entry tiers
- eligible/verified users
- approved payment path
- invite-only or tightly controlled cohort
- daily reconciliation
- close dispute/risk oversight

## D022 — Product identity stays gaming-first

PlayMechi should feel like competitive football gaming infrastructure, not a casino or sportsbook.

The product hierarchy remains:

**identity → competition → trust → tournaments → money infrastructure**

not:

**money → betting UI → game wrapper**
