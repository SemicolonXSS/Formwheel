# HARMONY 01-3 — Rapid v3 isolated prototype

**Status: prototype on a non-default branch. Not deployed.** Existing Formwheel Clicker, Rapid Shop, Hub, live rules, live data and production functions remain unchanged.

## Findings
Current beta uses localStorage `formwheel_clicker_rapid_beta_v1`, shop purchases in `formwheel_rapid_shop_beta_v1`, extras in `formwheel_rapid_extras_v1`, and online beta wallet at `formwheelV2/rapidWallets/$uid`. The current beta's sign-in maximum-balance merge and later client `set()` must not be reused for a trusted wallet.

## Design
- New wallet at `rapidV3/$uid` stores balance as an integer string, version, inventory and transaction receipts **under the same transaction root**.
- `core.cjs` is a pure purchase/refund reducer intended for a server-side Admin SDK transaction. It rejects arbitrary client prices, double purchases, expired refunds, bad integers and receipt ID collisions.
- `database.rules.json` is a **standalone rules test fixture**, NOT a replacement for the project's existing rules. It denies client writes at `rapidV3/$uid`. Do not publish it.
- Catalog is intentionally a tiny prototype subset. Real prices and huge-number catalog must be versioned and validated before use.
- Clicker exchange is **not enabled**: existing local Clicker scores are client-controlled and cannot serve as trusted server credit without a separate verified-earnings mechanism.
- Migration must preserve raw local and server data. No maximum-balance auto-import. Verified evidence is required before credit.

## Run pure tests
```sh
node --test firebase-security/rapid-v3/core.test.cjs
```

## Before wiring to Firebase
1. Add authenticated callable wrapper with App Check, non-anonymous identity checks and rate limits; resolve prices server-side.
2. Atomically transact at one per-user node using Admin SDK; return committed receipt, not optimistic local success.
3. Bound transaction history growth with a documented archive/idempotency policy; maintain refund evidence.
4. Add Rules Emulator tests for owner reads, unauthorized reads, all client writes, unauthenticated access, and child-path writes. Merge only a scoped rule into a copy of the **current live** rules after full compatibility tests.
5. Confirm migration evidence and design explicit pending_review outcomes, with no silent overwrite.
6. Test real catalog, huge BigInt prices, concurrent requests and timeout/retry behavior before connecting Shop/Clicker.

No deploy commands, live Firebase access or changes to production entrypoints are part of this prototype.
