# Architecture

## Principles

1. Identity is the core domain; competition is layered on deliberately.
2. V6 competitive support is intentionally limited to FC 26 and eFootball.
3. Keep route vocabulary small and user-facing.
4. Separate domain/services from JSX.
5. Prefer small feature components over 30–60 KB monoliths.
6. Every exposed Supabase table gets explicit API grants and RLS.
7. Never put service-role/secret keys in client-exposed environment variables.
8. Authorization is enforced in the database and server, never from user-editable metadata.
9. Competitive state transitions must be explicit and auditable.
10. Money truth comes from an immutable double-entry ledger, never a mutable profile balance.
11. Match truth comes from verified results and frozen rulesets.
12. Real-money enablement is gated by dedicated infrastructure, legal/regulatory classification and payment-provider approval.

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
  features/
  domain/
  server/
```

## Target app shape as competition grows

```text
src/
  app/
    (app)/
      home/
      arena/
      tournaments/
      rankings/
      discover/
      wallet/
      me/

  components/
    brand/
    gamer/
    layout/
    competition/

  features/
    identity/
    profiles/
    arena/
    matchmaking/
    matches/
    results/
    disputes/
    ranking/
    reputation/
    tournaments/
    wallet/
    payments/
    settlements/

  domain/
    competition/
    trust/
    money/

  server/
    repositories/
    services/
    payments/
    jobs/

  lib/
    supabase/
    validation/
    money/
```

The application should remain a modular monolith. Do not split into microservices prematurely.

## Supabase auth

V6 uses cookie-based SSR via `@supabase/ssr`. Browser and server clients are separate. Next.js 16 uses `proxy.ts`; the root proxy refreshes/verifies auth claims. Server authorization must use validated claims/user identity, not a spoofable cookie session object.

## Identity data domains

Alpha:

- `mechi_profiles`
- handle history/reserved handles
- `mechi_games`
- `mechi_profile_games`
- `mechi_platforms`
- `mechi_profile_platforms`
- `mechi_external_accounts`
- follows
- profile views
- shares
- notifications
- reputation/moderation events

## Game catalogue rule

A game being present in the profile catalogue does not mean competitive support exists.

Keep profile catalogue state separate from competitive enablement.

Initial competitive games are only:

- EA SPORTS FC 26
- eFootball

Recommended configuration table:

`mechi_competitive_game_configs`

Example fields:

- `game_id`
- `competition_enabled`
- `ranked_enabled`
- `tournament_enabled`
- `cash_enabled`
- `verification_method`
- `supported_platforms`
- `supported_modes`
- `minimum_evidence`
- `ruleset_version`

`cash_enabled` defaults to false.

## Competitive player profiles

Use a separate game-specific competitive profile instead of storing one generic rank on `mechi_profiles`.

Recommended table:

`mechi_player_game_profiles`

Core fields:

- `profile_id`
- `competitive_game_id`
- `rating`
- `rank_tier`
- `rank_division`
- `matches_played`
- `wins`
- `draws`
- `losses`
- `goals_for`
- `goals_against`
- `current_streak`
- `best_win_streak`
- `placements_completed`
- timestamps

FC 26 and eFootball ratings are independent.

## Competition domain

Recommended tables:

- `mechi_competitive_game_configs`
- `mechi_player_game_profiles`
- `mechi_match_rulesets`
- `mechi_matches`
- `mechi_match_participants`
- `mechi_result_submissions`
- `mechi_match_evidence`
- `mechi_match_results`
- `mechi_disputes`
- `mechi_dispute_events`
- `mechi_rating_events`
- `mechi_seasons`
- `mechi_tournaments`
- `mechi_tournament_entries`
- `mechi_tournament_rounds`
- `mechi_tournament_matches`

## Match state machine

Use explicit state transitions:

`CREATED → MATCHED → ACCEPTING → CONFIRMED → READY → IN_PROGRESS → RESULT_PENDING → VERIFIED → COMPLETED`

Dispute branch:

`RESULT_PENDING → DISPUTED → UNDER_REVIEW → VERIFIED / VOID`

Cancellation/expiration states must also be explicit.

Do not scatter ad-hoc status strings across UI and database code.

## Rulesets

Every match references a versioned/frozen ruleset.

A ruleset can define:

- game
- mode
- platform compatibility
- team restrictions
- match duration/settings
- disconnect policy
- result verification method
- evidence requirements
- dispute window
- competition type

Once a match is confirmed, its rules snapshot must not be silently edited.

## Result verification

For the first competitive release:

1. each player independently submits a structured result
2. matching submissions produce a verified result
3. conflicting submissions create a dispute
4. disputed results require evidence/review
5. rating and settlement events occur only after authoritative verification

Tournaments reuse the same normal match/result engine.

## Rating and reputation integrity

Rating and reputation changes are event-oriented so derived aggregates can be rebuilt and audited.

Keep skill and trust separate:

- **Mechi Rank** = game-specific competitive strength
- **Mechi Rep** = reliability/trustworthiness

Record provenance is mandatory for competitive history.

## Money domain

Do not add `wallet_balance` to profiles as the source of truth.

When the financial phase begins, use:

- `mechi_wallets`
- `mechi_ledger_accounts`
- `mechi_ledger_transactions`
- `mechi_ledger_entries`
- `mechi_deposits`
- `mechi_withdrawals`
- `mechi_payment_events`
- `mechi_reconciliations`
- `mechi_settlements`
- `mechi_settlement_items`

Money is stored in integer minor units, never floating point.

Every financial journal must balance. Corrections use reversals rather than editing historical entries.

Financial POST operations require idempotency keys/provider reference uniqueness where applicable.

## Financial account separation

At minimum keep distinct concepts for:

- player available cash
- player locked cash
- player bonus/promotional balance
- deposit clearing
- withdrawal clearing
- competition pool
- platform revenue
- refund clearing
- adjustment suspense

Mechi RP/Rep/rank progression is never withdrawable and must never be converted into player cash.

## Settlement engine

Settlement is a dedicated server-side domain operation.

Conceptual flow:

1. verify competition is eligible for settlement
2. verify authoritative result
3. verify settlement has not already occurred
4. calculate distribution
5. create balanced ledger journal
6. mark settlement complete atomically
7. publish domain/outbox event

A unique settlement identifier makes retries idempotent.

## Server/API boundary

Client code may request actions, but sensitive competition and money mutations are server-authorized.

Likely endpoints include:

- `POST /api/arena/queue`
- `DELETE /api/arena/queue`
- `POST /api/matches/:id/accept`
- `POST /api/matches/:id/ready`
- `POST /api/matches/:id/result`
- `POST /api/matches/:id/evidence`
- `POST /api/matches/:id/dispute`
- `GET /api/wallet`
- `POST /api/wallet/deposit`
- `POST /api/wallet/withdraw`
- provider callback/webhook endpoints

Money and settlement must never depend on browser redirects as financial truth.

## Dedicated infrastructure gate

V6 currently reuses the Jenga Supabase project for early identity work. That remains acceptable for Alpha while Mechi data is isolated behind `mechi_*` tables and RLS.

Before any real-money implementation is enabled, PlayMechi should move to a dedicated Supabase project/database/security boundary. The financial layer should not inherit unrelated application functions, policies or historical security configuration from a shared project.

## Audit and admin

Consequential admin actions must be auditable.

For money:

- no direct balance-edit form
- adjustments create explicit ledger transactions
- reason codes and internal notes are required
- important adjustments should support dual approval

For competition:

- result overrides create review events
- dispute outcomes preserve evidence and reviewer identity
- ruleset changes are versioned

## Five truths

1. **Money truth = ledger.**
2. **Match truth = verified result.**
3. **Competition truth = frozen rules.**
4. **Player eligibility truth = identity + jurisdiction + policy.**
5. **Operational truth = audit trail.**
