# Mechi V6 — Product Spec

## Vision

Mechi is the competitive identity layer for football gamers: **one persistent gamer identity, with FC 26 and eFootball competition layered on top**.

The product must remain valuable even when a gamer is the only person currently online. V6 therefore starts with persistent identity, shareability and discovery, then adds deliberately scoped competitive football features after the identity loop is proven.

## Product thesis

V6 follows this progression:

**Mechi ID → Gamer Profile → FC 26 / eFootball identity → Free Ranked → Mechi Rank → Mechi Rep → Tournaments → Sponsored Prizes → Compliant Cash Arena**

The product is gaming-first, not sportsbook-first. Money is infrastructure underneath trusted competition, not the primary identity of the product.

## Alpha core loop

1. Claim a unique Mechi ID.
2. Build a profile with avatar, location, games, platforms, gamertags and gamer style.
3. Generate a Mechi Card.
4. Share the card/profile externally.
5. A viewer opens the profile.
6. They discover the gamer's identity and games.
7. They claim their own Mechi ID.
8. Follow/discovery creates the first network relationship.

## Alpha surfaces

### Mechi ID
Permanent global handle and public URL (`/@handle`). Handles are case-insensitively unique, 3–20 characters, with a reserved-word list and future handle history/redirect support.

### Public profile
The highest-quality screen in V6. It should answer immediately: who is this gamer, what do they play, on which platforms, where are they, how do they like to play, and which accounts are connected/verified?

### Mechi Card
Shareable identity visual in square, story and OG/link-preview forms. Sharing is a first-class growth event, not a utility hidden in settings.

### Discover
Search and filters for game, platform, country, city and gamer style. Discovery should still work at low network density through relevant grouping and recommendations.

## Alpha navigation

**Home · Discover · Me**

Notifications/search live in the header as needed.

## Competitive focus

The broader profile catalogue may contain many games, but V6 competitive support is intentionally limited to:

- EA SPORTS FC 26
- eFootball

A catalogue game does not become a competitive game automatically.

### Competitive player identity

Each gamer can develop separate competitive records for FC 26 and eFootball.

Each game profile may include:

- rating
- visible rank tier/division
- matches played
- wins, draws and losses
- goals for / goals against
- current form
- streaks
- placement status
- tournament history
- dispute and disconnect signals

FC 26 and eFootball ratings are independent.

### Mechi Rank

Mechi Rank represents competitive skill and is game-specific.

Planned visible tiers:

- Bronze
- Silver
- Gold
- Platinum
- Diamond
- Elite
- Champion

A numerical rating sits underneath the visible tier system.

### Mechi Rep

Mechi Rep represents trust and competitive reliability, not skill.

It may incorporate evidence such as verified identity, match completion, result agreement, dispute outcomes, disconnect behaviour and moderation history.

Rank answers **how strong is this player?** Rep answers **how trustworthy is this player?**

## Arena Beta

The first competitive release is **PlayMechi Arena Beta**.

Initial scope:

- FC 26
- eFootball
- Free Ranked 1v1
- placement matches
- game-specific rankings
- Match Room
- independent result submission
- evidence upload
- disputes
- match history
- leaderboards
- Mechi Rank
- Mechi Rep

No player deposits are required for the first competitive beta.

## Match lifecycle

The competitive engine should use a strict state machine:

`CREATED → MATCHED → ACCEPTING → CONFIRMED → READY → IN_PROGRESS → RESULT_PENDING → VERIFIED → COMPLETED`

Dispute branch:

`RESULT_PENDING → DISPUTED → UNDER_REVIEW → VERIFIED / VOID`

Expiration/cancellation branches must also be explicit.

## Match Room

Every competition format should resolve to a normal Mechi Match and use the same Match Room for:

- participants
- game and platform
- ruleset
- readiness
- match state
- result submission
- evidence
- dispute reporting
- final result

Tournaments should create normal matches rather than inventing a separate result engine.

## Result verification

For the first competitive release, both players independently submit structured results.

- matching submissions → verified result
- conflicting submissions → dispute
- disputed matches → evidence and review

AI may later assist moderators with evidence classification, but it should not initially make final real-money settlement decisions.

## Tournaments

Tournaments are layered on top of the same match engine.

Initial formats should be controlled PlayMechi tournaments with fixed rulesets and brackets. Sponsored/free-entry prize competitions should precede player-funded cash competition.

## Cash Arena direction

Cash functionality is a later gated phase, not an Alpha feature.

The intended order is:

1. identity works
2. free competitive matches work
3. result verification works
4. rankings and reputation work
5. tournaments work
6. sponsored prize competitions work
7. financial infrastructure is isolated and audited
8. legal/regulatory classification and payment-provider approval are complete
9. a small closed Cash Arena pilot can begin

The initial cash pilot should be intentionally narrow: Kenya, KES, FC 26 and/or eFootball, approved competition formats, fixed entry tiers, verified players, controlled payment methods and close admin oversight.

## Explicitly out of initial V6 competitive scope

- competitive support for games other than FC 26 and eFootball
- arbitrary user-entered wager amounts
- spectator betting
- casino games
- crypto deposits
- P2P wallet transfers
- loans or credit for competition entry
- random cash loot-box mechanics
- unrestricted user-created cash contests
- international multi-currency launch

## Trust foundation

Every competitive and identity record must preserve provenance. Planned source classes include:

- `self_reported`
- `connected_account`
- `mechi_match`
- `organizer`
- `manual_review`
- `official_api`

Self-reported data must never be styled as verified data.

## Activation

A strong Alpha activation remains:

**profile created + profile shared + at least one external profile view**

A strong Arena activation later becomes:

**competitive game profile created + placement completed + first verified ranked match**

## North stars

### Identity Alpha
Weekly Active Gamer Identities: profiles that perform or receive a meaningful identity/network interaction such as profile view, share, follow, account connection or discovery interaction.

### Arena Beta
Verified Competitive Players: gamers who complete at least one verified FC 26 or eFootball competitive match in the measurement period.

### Financial phase
The foundational operational question is simple: **can PlayMechi account for every shilling?**
