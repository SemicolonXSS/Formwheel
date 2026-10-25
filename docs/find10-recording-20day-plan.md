# FIND IT! consented recording — implementation contract (prototype branch)

Status: design / not enabled in production. Retention: **20 days from upload**.

## User flow
1. Separate, unchecked opt-in for screen recording; declining must not affect the challenge.
2. Before recording, explain that browser screen-sharing may expose other tabs, notifications or personal data. Prefer sharing only the challenge tab when supported.
3. Explicit browser screen-share picker; no recording without both consent and browser permission.
4. Record from challenge start through completion, including after the 10-second scoring threshold. Stop on cancellation, track end, share termination or maximum safety duration. Never capture microphone/audio by default.
5. Local preview before any upload. Allow discard, and allow submitting the challenge result without a recording.
6. Display upload progress and separate failure states; do not falsely report upload success.

## Architecture limitation
The existing challenge navigates from playtest.html to the Hub and possibly another project. A MediaRecorder bound to playtest.html will not survive that full-page navigation. Implement a persistent recording context (e.g. same-origin recorder window with explicit user activation) or redesign challenge routing before enabling end-to-end recording. Do not silently record only the initial page.

## Backend requirements (not yet deployed)
- Store video in a private object store, never GitHub or a public Firebase Realtime Database node.
- Require authenticated, server-verified administrator access for playback/listing; no public read URL.
- Upload only with separate informed consent; use bounded upload size, duration and type.
- Store metadata: challengeResultId, consentVersion, createdAt, expiresAt=createdAt+20 days, owner pseudonym, storage path, status. Do not place PII in filenames.
- Server-enforced deletion at 20 days, including objects and metadata. Scheduled cleanup must be idempotent, monitored and independently tested; client timers are not sufficient.
- Support deletion requests before expiration and avoid collecting more than necessary.
- Review applicable privacy notice, consent and guardian requirements before launch.

## Regression requirements
- No change to existing find10 success/failure logic, retries, search, filters or statistics.
- Recording disabled/unsupported/denied must leave existing gameplay functional.
- Test browser share termination, reload, iOS unsupported path, failed upload, double submit, unauthorized playback and expiry deletion.

## Release gate
Do not merge or enable recording until persistent capture, private storage, authorization rules, automated deletion and tests all pass.
