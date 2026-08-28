# Mechi V6 Alpha — Product Spec

## Vision

Mechi is the identity layer for gamers: **one profile for everything you play**.

The Alpha must be valuable to a gamer even if they are the only person currently online. The product therefore starts with persistent identity, shareability and discovery rather than synchronous matchmaking.

## Core loop

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

## Navigation

Alpha navigation is only: **Home · Discover · Me**. Notifications/search live in the header as needed.

## Explicitly out of Alpha

Tournaments, organizer command center, ranked queues, ELO, seasons, teams/clans, wallets, wagering, DMs, marketplace, voice chat, complex achievements, automated universal game-stat scraping, subscriptions.

## Trust foundation

Every future record must preserve provenance. Planned source classes: `self_reported`, `connected_account`, `mechi_match`, `organizer`, `manual_review`, `official_api`. Self-reported data must never be styled as verified data.

## Activation

A strong Alpha activation is: profile created + profile shared + at least one external profile view.

## North star

Weekly Active Gamer Identities: profiles that perform or receive a meaningful identity/network interaction such as profile view, share, follow, account connection or discovery interaction.
