/**
 * Formwheel unique-visitor public counter synchronizer.
 * Run only in a trusted GitHub Actions environment with FIREBASE_SERVICE_ACCOUNT.
 * Never expose the service account to the browser or commit it to Git.
 */
import { initializeApp, cert, getApps } from "firebase-admin/app";
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
process.exit(0);
