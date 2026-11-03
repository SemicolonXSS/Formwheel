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


## Formwheel V compile fix — 2026-11-03
- Resolved unsupported RTDB Security Rules `numChildren()` expressions previously reported at V lines 976, 1003, 1171.
- Empty action lists are checked using supported `!snapshot.hasChildren()`.
- Board moves are authorized at `boardRooms/$code/actions/$index`, with per-action authenticated participant checks and an index range 0–1199. **Existing clients that write a whole board room to append a move must be updated or tested; the new rule intentionally rejects those parent-level writes.**
- The old 1,200-action **count** condition is not directly expressible with `numChildren`; action-index limits do not strictly enforce number of stored keys when the room has legacy data. Test this explicitly.
- The former 6-player **count cap in syncRooms is not enforced** because Firebase Realtime Database Rules provide no `numChildren()` or equivalent count method. Do not publish this version until the game uses a bounded slot schema or a trustworthy server-validated player count.
- JSON integrity/structural checks passed; Firebase Console compiler and Emulator scenarios **not verified**. No live Firebase deployment performed.
