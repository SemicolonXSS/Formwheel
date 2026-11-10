/**
 * Formwheel public visitor counter synchronizer.
 * Run only in a trusted GitHub Actions environment with FIREBASE_SERVICE_ACCOUNT.
 * Never expose the service account to the browser or commit it to Git.
 */
import { initializeApp, cert, getApps, deleteApp } from "firebase-admin/app";
import { getDatabase, ServerValue } from "firebase-admin/database";

const json = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!json) throw new Error("Missing FIREBASE_SERVICE_ACCOUNT GitHub Actions secret.");
let serviceAccount;
try { serviceAccount = JSON.parse(json); } catch { throw new Error("FIREBASE_SERVICE_ACCOUNT must contain valid service account JSON."); }
if (serviceAccount.project_id !== "formwheel") throw new Error("Firebase service account project_id does not match formwheel.");
const app = getApps()[0] || initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://formwheel-default-rtdb.firebaseio.com",
});
const db = getDatabase(app);
const root = "formwheelV2";
async function publishLiveCount() {
  const checkedAt = Date.now();
  const sessions = await db.ref(root + "/liveHubSessions").get();
  let live = 0;
  sessions.forEach(user => {
    if (Object.values(user.val() || {}).some(session =>
      Number.isFinite(session?.lastSeen) &&
      session.lastSeen <= checkedAt + 60_000 &&
      checkedAt - session.lastSeen < 5 * 60_000
    )) live++;
  });
  const result = await db.ref(root + "/publicVisitorCounts/live").transaction(current => {
    if (Number(current?.updatedAt) >= checkedAt) return;
    return { count: live, updatedAt: checkedAt };
  }, undefined, false);
  console.log(JSON.stringify({ liveVisitors: live, publishedLive: result.committed }));
}

async function publishUniqueTotal() {
  const visitorSnapshot = await db.ref(root + "/visitorStats/uniqueVisitors").get();
  if (!visitorSnapshot.exists()) {
    throw new Error("Visitor records unavailable or empty. Refusing to reset the public count.");
  }
  let actual = 0;
  visitorSnapshot.forEach(child => {
    if (child.val() && typeof child.val() === "object") actual++;
  });
  if (!Number.isSafeInteger(actual) || actual < 1) throw new Error("Invalid unique visitor count.");
  const ref = db.ref(root + "/publicVisitorCounts/total");
  const tx = await ref.transaction(current => {
    const previous = Number(current?.count ?? current ?? 0);
    if (!Number.isSafeInteger(previous) || previous < 0) return;
    if (actual <= previous) return;
    return { count: actual, updatedAt: ServerValue.TIMESTAMP };
  }, undefined, false);
  const published = tx.snapshot.val()?.count;
  console.log(JSON.stringify({ uniqueVisitors: actual, publishedCount: published ?? null, increased: tx.committed }));
}

try {
  const results = await Promise.allSettled([publishLiveCount(), publishUniqueTotal()]);
  for (const result of results) {
    if (result.status === "rejected") console.error(result.reason);
  }
  process.exitCode = results.some(result => result.status === "rejected") ? 1 : 0;
} finally {
  await deleteApp(app);
}
