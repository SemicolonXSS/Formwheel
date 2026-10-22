# Formwheel security policy

## Reporting a vulnerability
Please report security problems privately via GitHub's **Report a vulnerability** feature (if enabled), not in public issues. Do not include credentials, tokens, personal data, or exploit details in public reports.

## Security checklist
- **Firebase Realtime Database:** Verify the rules currently deployed in the Firebase console. The checked-in `database.rules.json` denies access by default, but repository rules are not proof of deployment. Test legitimate user and guest flows before deploying any changes.
- **Authentication and authorization:** Enforce ownership and admin roles with Firebase Security Rules or trusted Cloud Functions. UI-only checks are not a security boundary. Never authorize admin access based on a nickname, email field editable by the client, or local storage.
- **Virtual currency, XP, badges, scores and refunds:** Treat browser input as untrusted. Validate amounts, authorization, and transaction consistency on trusted backend code. Use atomic writes/transactions, replay protection, and server-issued audit records for financial-like virtual transactions.
- **Multiplayer:** Validate host/player identity, room membership, game state transitions, and turn/score submissions on the server or in database rules where feasible.
- **User-generated content:** Display untrusted text with `textContent` or appropriate escaping; sanitize permitted rich HTML. Review any `innerHTML` use.
- **API keys and secrets:** Firebase Web API keys are normally public identifiers, not authorization secrets. Restrict applicable keys in Google Cloud, protect databases with Rules and App Check, and keep service account credentials and server tokens out of Git.
- **Supply chain:** Review Dependabot alerts and update PRs. Never auto-merge dependency changes without testing.
- **Monitoring:** Check Authentication sign-ins, database permission-denied spikes, suspicious high scores, and unusually frequent currency/refund requests.

## Verification before rollout
1. Confirm rules in the Firebase Console and compare to `database.rules.json`.
2. Run Firebase Emulator Suite tests for anonymous, signed-in, different-user, and admin identities.
3. Verify legitimate Hub, Clicker, Rapid, AQS, and multiplayer flows still work.
4. Enable monitoring and roll out backend policy updates only after regression tests.
