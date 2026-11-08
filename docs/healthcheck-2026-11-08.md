# Formwheel healthcheck fixes — 2026-11-08

This patch preserves existing visitor records, balances, inventories and account IDs. It does not migrate or delete production data. Source baseline: c0c86eb7d52d8eecb2bf0006593561eed7b31abf.

## Client fixes

- Verify the signed Firebase token before subscribing to aggregate visitor/session records or attempting administrator publications. Everyone displays the published total first.
- Sample visible time every 15 seconds and coordinate samples across same-origin tabs using Web Locks and shared timestamps. Older browsers use a focused-document fallback. Existing totals are not rewritten.
- Arm session disconnect cleanup before registration; retain compatibility with older Rules that only permit deleting an existing session. Retry transient registration failures up to three times; do not loop on permission errors.
- Replace social polling and sequential outgoing-request reads with scoped realtime subscriptions. Cancel them on account changes. Notify valid preexisting invitations, label expired invitations, and link accepted invitations to the actual game. Room codes still need to be shared in the game.
- Add friend removal, block/unblock, declined-request resubmission and recipient invite cleanup. Remove the ineffective reservation control.
- Friend search now emits its selection event. Public event badges use an explicitly published badge-ID-only snapshot; private event records and timestamps stay private. Users choose whether to publish or withdraw their snapshot.
- Use the same badge inputs for the grid, count, frames and featured display. Real session counts drive visit badges; collector checks all earned categories. Keep legacy fallback when session data is unavailable.
- Preserve compact-Hub pins/exclusions and sync history across tabs. Both display versions already recorded clicks in the baseline; the earlier audit's claim that compact clicks were untracked was incorrect.
- Default new display preferences to cards while retaining saved choices.
- Save only changed theme fields, encode project paths into valid Firebase keys, retain pending local edits across incoming remote changes, and support Haunted Night. Wallets and entitlements remain server-controlled.
- Fix the missing 404 favicon and check relative, root-relative and same-origin absolute links. Read Rules from firebase.json in CI, and include localization/theme regression checks.

The baseline already included FW12 error source locations, early-error capture, and the command-palette syntax fix. These were retained.

## Rules and Functions

The matching Rules additions keep ownership checks, validate public badge IDs against existing earned records, enforce blocks on requests/invitations, and permit owner-only disconnect cleanup before a session exists. No public access is granted to visitor detail records, balances or private event records.

The server commits each new peak and all associated witnesses atomically. Session heartbeat updates no longer cause full presence scans; membership changes publish live counts. The existing scheduled reconciliation remains available.

## Verification and application

Run:

```sh
node scripts/check-syntax.cjs
node scripts/check-hub-catalog.cjs
node --test tests/*.test.cjs
node tests/localization-theme-regression.cjs
node firebase-security/tests/core.test.cjs
node scripts/check-combined-rules.cjs
cd firebase-security
npx firebase emulators:exec --project demo-formwheel --only database "node --test tests/social-rules.test.mjs"
```

The quality workflow runs the social/security transitions against the active Rules file in the Database Emulator. Local logic tests and source checks do not establish production deployment.

Static client changes take effect after the site publishes. New social/public-badge operations need the matching Database Rules; server peak and live-count changes need Functions deployment. The existing visitor-functions deployment workflow deploys only syncNewUniqueVisitor and refreshVisitorCounts, not awardPeakWitness or Database Rules. Do not report those components as deployed based on a Pages build.

Before applying the whole Rules file, compare it with the actual deployed Rules and retain a backup. This patch does not fetch, replace or verify the operational Rules. A complete local browser test was blocked because Chromium is not installed in this environment.
