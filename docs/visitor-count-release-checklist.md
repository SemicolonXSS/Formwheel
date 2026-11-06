# Formwheel visitor count: deployment and verification

## What is already implemented
- `assets/live-presence.js`: Firebase anonymous sign-in, UID-based visitor registration and `onValue` public counter subscription.
- `functions/index.js`: `syncNewUniqueVisitor` database trigger publishes the verified total on new UID creation; `refreshVisitorCounts` reconciles totals and live sessions every minute.
- `scripts/sync-visitor-count.mjs`: trusted GitHub Actions reconciliation fallback.
- Realtime Database Rules: `publicVisitorCounts/total` is publicly readable but writable only by privileged users. **Do not grant anonymous writes.**

## Why the number may still lag
Source code existing in GitHub does **not** mean Cloud Functions are deployed. GitHub Actions is not a real-time database trigger. Verify `syncNewUniqueVisitor` and `refreshVisitorCounts` exist in the **formwheel** Firebase project and have recent successful invocations.

## Safe release checklist
1. Back up current production RTDB Rules and data. Do not reset `visitorStats/uniqueVisitors` or `publicVisitorCounts/total`.
2. Confirm Firebase Authentication > Sign-in method > Anonymous is enabled.
3. Verify current deployed RTDB Rules allow an authenticated UID to write only its own `visitorStats/uniqueVisitors/$uid`, while public totals remain read-only for untrusted clients.
4. Test rules with Firebase Emulator: guest create own record succeeds, guest overwrite another UID fails, guest write public total fails, public read total succeeds.
5. Deploy only the visitor functions with an authorized Firebase CLI session and a billing-enabled project if required:
   `firebase deploy --only functions:syncNewUniqueVisitor,functions:refreshVisitorCounts --project formwheel`
6. Check function logs, then open the Hub in a fresh private window and verify a **new anonymous UID** creates one record and updates the public count without refreshing. Reloading the same UID must not add a unique visitor.
7. Verify a logged-in account and concurrent guest visits. Check public total never decreases and the original count remains intact.
8. Keep the existing GitHub Action as a reconciliation fallback.

## Important limits
- This deployment was **not** executed by the assistant.
- If the project lacks required Cloud Functions billing/permissions, truly immediate server-verified publication is not available from the current GitHub Action alone.
- UID-based counts are not the same as verified unique humans; clearing browser data may create a new anonymous UID.
