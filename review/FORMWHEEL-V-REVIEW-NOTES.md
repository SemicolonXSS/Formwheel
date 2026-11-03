# Formwheel V — Firebase Realtime Database Rules review

Status: **review candidate only — NOT deployed**.

## Source of truth
- User-supplied active Rules: `붙여넣은 텍스트(1)(7).txt`, supplied 2026-11-03.
- Previously generated review candidate: `review/FORMWHEEL-RULES-INTEGRATION-CANDIDATE.json`.
- Compared with GitHub main `database.rules.json`.

## Actual changes
- Preserve ALL current supplied rules and 57 top-level keys, including 25 `formwheelV2` sections.
- Keep root `.read=false`, `.write=false`.
- Preserve top-level `boardRooms` and `syncRooms` `.read=false`, `.write=false`.
- Add **only** the existing GitHub `boardRooms/$code` and `syncRooms/$code` child rules (32 leaf settings).
- Preserve existing visitor counts, theme preferences, rapid wallets, friends, clicker leaderboard, and other policies unchanged.

## Caveats before deploying
- JSON parse and structural-preservation checks passed; Firebase Emulator Rules tests **not run**.
- Firebase Realtime Database Rules are not a database migration: this JSON does not update or delete existing DB data unless someone subsequently deploys unsafe client/server code.
- Adding child permissions makes some previously blocked game rooms accessible; verify with authenticated/anonymous users, unauthorized read/write attempts, game room creation, joining, mutation, and deletion scenarios before applying.
- Review any current production Rules drift and existing record formats prior to applying. Keep an exported backup and rollback plan.
- Server-controlled rapid wallets and other blocked legacy features are **not automatically unlocked** by this revision.
- No production Firebase deployment and no main branch modification were performed.
