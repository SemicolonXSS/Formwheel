# Project QUADRA B — project mastery (design only)

Status: NOT DEPLOYED. No XP or badge award code in this branch.

## Compatibility
- Do not modify existing AQS XP, quest completion, Rapid balances, or achievements.
- Mastery is independent, opt-in per game, and invisible for unsupported projects.
- Never trust a client's claimed score, completion, elapsed time, or arbitrary XP.

## Proposed data
`formwheelV2/mastery/{uid}/{projectId}`: {xp, level, updatedAt, lastVerifiedEventId}
`formwheelV2/masteryEvents/{eventId}`: {uid, projectId, awardedXp, verifiedAt, source}

## Requirements before activation
1. Server verifies completed session for each supported game.
2. Server transaction prevents duplicate events and daily XP farming.
3. Define per-game completion criteria and XP caps.
4. Security Rules deny direct client writes to mastery balances and events.
5. Emulator tests: unauthenticated, wrong UID, replay, simultaneous completions, event-id reuse, failure retry.
6. Migration strategy is additive only. Existing records stay untouched.
7. Rollout behind a feature flag after the verified events are available.

## UI design
Beginner L1-4, Bronze L5-9, Silver L10-19, Gold L20-34, Diamond L35-49, Master L50+.
Profile shows only verified levels and progress toward next tier.
No purchasable Rapid item can grant verified game mastery.

## Other QUADRA scope
- FIND IT analytics: add timeout percentages, still limited by voluntarily submitted client data.
- Rapid: improve free-theme preview UI only; no purchases or inventory migration.
- Friends: sharing a link prefills public handle; user must log in and explicitly request friendship.
