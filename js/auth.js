// ── Firebase config ──────────────────────────────────────────────
// Ersätt värdena nedan med dina egna från Firebase-konsolen
const FIREBASE_CONFIG = {
  apiKey:            "KLISTRA_IN_DIN_API_KEY",
  authDomain:        "KLISTRA_IN_DIN_AUTH_DOMAIN",
  projectId:         "KLISTRA_IN_DITT_PROJECT_ID",
  storageBucket:     "KLISTRA_IN_DIN_STORAGE_BUCKET",
  messagingSenderId: "KLISTRA_IN_DITT_MESSAGING_SENDER_ID",
  appId:             "KLISTRA_IN_DITT_APP_ID"
};
// ─────────────────────────────────────────────────────────────────

const SYNC_KEYS = [
  'cellar-srs',
  'cellar-streak',
  'cellar-category-stats',
  'cellar-quiz-history',
  'cellar-progress'
];

let _db = null;
let _auth = null;
let _currentUser = null;

function initFirebase() {
  if (firebase.apps.length === 0) {
    firebase.initializeApp(FIREBASE_CONFIG);
  }
  _auth = firebase.auth();
  _db   = firebase.firestore();
}

// Pull Firestore → localStorage
async function pullFromCloud(uid) {
  try {
    const doc = await _db.collection('users').doc(uid).get();
    if (doc.exists) {
      const data = doc.data();
      SYNC_KEYS.forEach(key => {
        if (data[key] !== undefined) {
          localStorage.setItem(key, JSON.stringify(data[key]));
        }
      });
    }
  } catch (e) {
    console.warn('Kunde inte hämta data från molnet:', e);
  }
}

// Push localStorage → Firestore
async function pushToCloud(uid) {
  try {
    const payload = {};
    SYNC_KEYS.forEach(key => {
      const raw = localStorage.getItem(key);
      if (raw) {
        try { payload[key] = JSON.parse(raw); } catch {}
      }
    });
    await _db.collection('users').doc(uid).set(payload, { merge: true });
  } catch (e) {
    console.warn('Kunde inte spara data till molnet:', e);
  }
}

function addUserBar(user) {
  if (document.getElementById('celarUserBar')) return;
  const bar = document.createElement('div');
  bar.id = 'celarUserBar';
  bar.style.cssText = [
    'position:fixed;bottom:0;left:0;right:0;z-index:9999',
    'background:rgba(20,10,8,0.92);backdrop-filter:blur(8px)',
    'border-top:1px solid rgba(139,26,43,0.25)',
    'display:flex;align-items:center;justify-content:space-between',
    'padding:0.55rem 1.25rem;font-family:var(--font-body,Inter,sans-serif)',
    'font-size:0.72rem;color:rgba(220,200,180,0.6)'
  ].join(';');
  bar.innerHTML = `
    <span>🔑 ${user.email}</span>
    <button onclick="celarLogout()" style="
      font-family:inherit;font-size:0.72rem;
      background:none;border:1px solid rgba(139,26,43,0.4);
      color:rgba(220,200,180,0.6);border-radius:4px;
      padding:0.2rem 0.6rem;cursor:pointer;">
      Logga ut
    </button>
  `;
  document.body.appendChild(bar);
  // Push body up so footer isn't hidden behind bar
  document.body.style.paddingBottom = '2.5rem';
}

window.celarLogout = async function() {
  if (_currentUser) await pushToCloud(_currentUser.uid);
  await _auth.signOut();
  window.location.href = 'login.html';
};

// Called on every page (except login.html)
function guardPage() {
  const isLoginPage = window.location.pathname.endsWith('login.html');
  if (isLoginPage) return;

  initFirebase();

  _auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    _currentUser = user;
    await pullFromCloud(user.uid);
    addUserBar(user);
  });
}

guardPage();
