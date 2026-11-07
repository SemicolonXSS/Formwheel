# Formwheel visitor sync: external scheduler fallback

GitHub Actions `schedule` is best-effort and may be delayed or dropped. This repository supports a second trigger, `repository_dispatch`, using event type `sync-public-visitors`.

## Setup (repository owner)

1. Create a **fine-grained GitHub personal access token** scoped only to `SemicolonXSS/Formwheel`, with **Contents: Read and write** permission (required by GitHub's repository dispatch API). Set a short expiration and rotate it regularly. This token can trigger repository workflows, so protect it.
2. In a trusted HTTPS cron service you control, create a 5-minute POST job:
   - URL: `https://api.github.com/repos/SemicolonXSS/Formwheel/dispatches`
   - Method: `POST`
   - Headers: `Accept: application/vnd.github+json`, `Authorization: Bearer <YOUR_GITHUB_TOKEN>`, `X-GitHub-Api-Version: 2022-11-28`, `Content-Type: application/json`
   - JSON body: `{"event_type":"sync-public-visitors"}`
3. Verify the GitHub Actions workflow **Sync public Formwheel visitor count** shows runs with event `repository_dispatch`, and that the published visitor total increases when new unique visitor records exist.
4. If the scheduler exposes the token in public logs or cannot store it securely, **do not use that scheduler**. Revoke the token immediately if leaked.

## Security and behavior

- Do not send `FIREBASE_SERVICE_ACCOUNT` to the scheduler. It stays in GitHub Actions Secrets.
- Keep Firebase public count writes restricted. Never enable public write access to `formwheelV2/publicVisitorCounts/total`.
- The workflow retains `schedule` and `workflow_dispatch` as fallback triggers; concurrency prevents overlapping runs.
- External cron execution may still be delayed or fail. Verify actual GitHub run timestamps rather than assuming 5-minute guarantees.
- The synchronizer publishes only increases in the verified unique visitor count; it will not invent new visitors.
- Do not paste GitHub tokens or Firebase service account JSON into issues, commits, or chat.

## Quick verification

GitHub Actions: https://github.com/SemicolonXSS/Formwheel/actions/workflows/visitor-count-sync.yml

Successful scheduler HTTP status for repository dispatch is typically **204 No Content**; that means the event was accepted, not that the workflow completed. Check the resulting workflow run for success.
