# Shared Firebase Realtime Database rules: Formwheel + Blitz

Status: **PROPOSED / NOT DEPLOYED** (2026-10-31)

Both applications use `formwheel-default-rtdb`. Firebase publishes **one** rules tree per database; do not deploy a Blitz-only fragment over Formwheel rules.

## Source of truth
- Formwheel: `database.rules.json` and `firebase.json` (`database.rules` points to that file).
- Blitz: `index.html`.
- User-supplied ZIP: `shared.COMPAT-MIGRATION.rules.json`, `shared.STRICT-MIGRATION-TARGET.rules.json`, `blitz.MERGE-ONLY.rules.json`, audit, and 66 recorded emulator assertions. These artifacts are **not** automatically deployed by this repository.

## Verified concerns from migration audit
- Current Formwheel root already denies reads and writes; do not replace it with a previously public-root ruleset.
- Blitz `users`, `profiles`, `history`, and `presence` require ownership-based permissions.
- Blitz and Fate share `leaderboard`; changing the record format can break either app.
- Formwheel Rapid uses `formwheelV2/rapidWallets`. UID-scoped writes alone do **not** stop users forging their own balances.
- Client-authoritative chip balances, rewards, game scores and counters need trusted server validation.
- Public legacy multiplayer/chat and raw analytics paths require migrations; abruptly blocking them will break current clients.
- Admin permissions must come from trusted auth claims, not previously public-writable ACL records.

## Safe rollout
1. Back up the live database and currently deployed rules.
2. Compare live rules, main-branch rules, and both clients' actual read/write paths.
3. Merge proposed paths into the **current** main-branch rules, not into the old public-root baseline.
4. Run RTDB Emulator rule tests and full end-to-end regression checks for both apps.
5. Migrate legacy room identity and economic transactions to trusted server endpoints.
6. Only then promote a reviewed merged `database.rules.json` and deploy separately.

**Do not merge/deploy this PR as a complete rules migration.** It currently contains a narrow validation correction and this migration checklist, not a production-ready shared rules rewrite.
