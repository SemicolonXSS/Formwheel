# Rapid account server

The server runs outside Firebase and uses Firebase Auth and Realtime Database. Use Node 22. Browser account wallet writes remain disabled. The existing browser wallet and previous pending transactions remain in their original storage.

## Deploy on Render

1. Create a Web Service from the Formwheel repository and choose the Free instance type. Set the root directory to `rapid-server`, build command to `npm install --no-audit --no-fund`, start command to `npm start`, and health check path to `/health`.
2. In the service's private environment variables set `FIREBASE_SERVICE_ACCOUNT` to the JSON for the Formwheel server service account with Auth user lookup and Realtime Database read/write access. Keep this value out of GitHub and the browser. Set `RAPID_WEB_ORIGIN` to `https://semicolonxss.github.io`. Enable Google sign-in and authorize `semicolonxss.github.io` in Firebase Auth if they are not configured.
3. After the service deploys, open its HTTPS `/health` endpoint and confirm it returns `{"ok":true}`. Set `endpoint` in `shared/rapid-server-config.json` to the HTTPS service URL without `/health` and commit that public file. Until the endpoint is set and authenticated requests succeed, the page stays in read-only mode.
4. Open the Rapid shop and sign in. Check the account balance before testing transactions with a dedicated test account and verified score data.

## Verified score source

At deployment time the existing Clicker score is a browser value. The service accepts only amounts from a verified balance stored beside the wallet. A trusted game adjudicator or operator must provision eligible points after independent verification. From a trusted terminal with the server credential in the environment, run:

```sh
node credit-verified.mjs USER_UID VERIFY_EVENT_ID SCORE_UNITS
```

Pass the stable event ID each time a verified award is retried. The ID must be 10–100 characters using letters, digits, hyphens, or underscores, and start with a letter or digit. Use that ID once for the same UID and quantity. 1,000 stored score units equal 100 Clicker points and exchange for 1 Rapid. The script is a privileged import, not a web endpoint. Never use browser storage or a client-submitted leaderboard as proof of points. With no verified grants, exchangeable balance remains zero.

## Trade properties

Account balance, verified-score debit, purchases, refunds, and transaction receipts are committed in a single UID-scoped database transaction. Existing wallet fields are retained. The server shop catalog uses the product IDs and prices in the Rapid shop at integration time. Keep catalog updates aligned with the shop. Full refunds follow the existing 24-hour policy and use the recorded purchase price. Account purchases and balances are read across devices from Realtime Database. Browser-only item history stays independent.

Run `npm test` to verify the wallet transaction logic without connecting to production.
