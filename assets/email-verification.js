import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged, sendEmailVerification, reload } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const config = {
  apiKey:"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE",
  authDomain:"formwheel.firebaseapp.com",
  projectId:"formwheel",
  appId:"1:431583088241:web:74e0e34ea1e3e1170c55d0"
};
const app = getApps().find(a => a.name === "[DEFAULT]") || initializeApp(config);
const auth = getAuth(app);
const panel = document.getElementById("fw-email-verification");
const state = document.getElementById("fw-email-verification-state");
const sendButton = document.getElementById("fw-email-send");
const checkButton = document.getElementById("fw-email-check");
const details = document.getElementById("fw-email-actions");
let user = null;
let pending = false;
let lastSent = 0;
const verified = u => Boolean(u && u.emailVerified);
function render(message) {
  if (!panel) return;
  const address = user?.email || "";
  if (!user || user.isAnonymous) {
    state.textContent = "이메일 계정으로 로그인하면 인증 상태를 확인할 수 있어요. Google 로그인과 게스트 이용은 기존대로 가능합니다.";
    details.hidden = true;
    return;
  }
  const providerIds = (user.providerData || []).map(p => p.providerId);
  const passwordAccount = providerIds.includes("password");
  if (verified(user)) {
    state.textContent = "✅ 이메일 인증 완료 · " + address;
    details.hidden = true;
  } else if (passwordAccount) {
    state.textContent = message || ("⚠️ 이메일 인증 대기 중 · " + address);
    details.hidden = false;
  } else {
    state.textContent = message || ("계정 이메일: " + address + " · 이 로그인 방식의 인증 상태를 확인해 주세요.");
    details.hidden = true;
  }
  sendButton.disabled = pending || Date.now() - lastSent < 60000;
  checkButton.disabled = pending;
}
function friendlyError(e) {
  if (e?.code === "auth/too-many-requests") return "요청이 너무 많아요. 잠시 후 다시 시도해 주세요.";
  if (e?.code === "auth/network-request-failed") return "인터넷 연결을 확인해 주세요.";
  if (e?.code === "auth/requires-recent-login") return "보안을 위해 다시 로그인한 후 시도해 주세요.";
  return "처리하지 못했어요. (" + (e?.code || "알 수 없는 오류") + ")";
}
onAuthStateChanged(auth, u => {
  user = u;
  render();
});
sendButton?.addEventListener("click", async () => {
  if (!user || pending || verified(user) || Date.now() - lastSent < 60000) return;
  pending = true;
  render("인증 메일을 보내는 중…");
  try {
    await sendEmailVerification(user, {
      url: "https://semicolonxss.github.io/Formwheel/profile.html",
      handleCodeInApp: false
    });
    lastSent = Date.now();
    setTimeout(() => render(), 60000);
    render("📨 인증 메일을 보냈어요! 받은편지함과 스팸함을 확인한 뒤 인증 링크를 눌러 주세요.");
  } catch (e) { render(friendlyError(e)); }
  finally { pending = false; sendButton.disabled = Date.now() - lastSent < 60000; checkButton.disabled = false; }
});
checkButton?.addEventListener("click", async () => {
  if (!user || pending) return;
  pending = true;
  render("인증 상태를 확인하는 중…");
  try {
    await reload(user);
    render(user.emailVerified ? undefined : "아직 인증되지 않았어요. 이메일에 있는 인증 링크를 먼저 눌러 주세요.");
  } catch (e) { render(friendlyError(e)); }
  finally { pending = false; render(state.textContent); }
});
