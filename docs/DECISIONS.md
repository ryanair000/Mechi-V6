# Architecture & Product Decisions

## 001 — Fresh V6 codebase
Accepted. V5 remains research/code reference, not a migration base.

## 002 — Identity before competition
Accepted. V6 is a gamer identity network; matches/rank/reputation attach to an existing identity later.

## 003 — Three-tab Alpha navigation
Accepted: Home, Discover, Me. Avoid exposing backend mechanics such as lobby/queue/challenge as top-level concepts.

## 004 — No universal gaming ELO
Accepted. Future ratings are scoped by game/mode/platform/season where relevant.

## 005 — Provenance is mandatory
Accepted. Connected, organizer-verified, Mechi-verified, evidence-verified and self-reported records remain visually/data-model distinct.

## 006 — Supabase security baseline
Accepted. Publishable frontend keys only; explicit table exposure/grants; RLS on exposed tables; ownership predicates for writes; no authorization from user-editable metadata.
