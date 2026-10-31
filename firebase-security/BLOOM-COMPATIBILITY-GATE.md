# Bloom compatibility gate — review only

The user-supplied **Formwheel Bloom** archive is a migration proposal, not the active rules file. The actual deploy target remains `database.rules.json` as selected by the root `firebase.json`.

## What this PR changes
- Adds `scripts/check-rtdb-security.cjs`, a **read-only static security gate** for the currently selected Formwheel rules.
- Does not change `database.rules.json`, Firebase configuration, client features, or stored user data.
- Does not deploy to Firebase or automatically import Bloom.

## Required before a Bloom migration PR
1. Export the **currently deployed** RTDB rules and data backup (repository rules may differ from live rules).
2. Inventory actual Formwheel reads and writes for profiles, rooms, achievements, visitor counters, and admin tools.
3. Adapt clients and trusted server endpoints before changing permissions.
4. Run Firebase Emulator authorization tests and UI regression tests for every migrated path.
5. Review shared-database effects separately; **do not replace the live rules tree with an isolated application's rules**.

## Run
`node scripts/check-rtdb-security.cjs`

The script verifies root denial, no unconditional true grant anywhere in the tree, and rejects the unsupported `childrenCount` expression. It is not an authorization proof and does not imply Bloom compatibility.
