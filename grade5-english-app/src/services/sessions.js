// זמני פעילות של משתמשים מחוברים:
//   english/users/<uid>/sessions/<id> = { start, last, end?, d: "iPhone · Safari", k: "mobile" }
// start - כניסה, last - הדקה האחרונה שבה הייתה פעילות (נגיעה / הקלדה / גלילה),
// end - סוף הסשן: אחרי 15 דקות בלי פעילות, ביציאה מהחשבון, או כשהחיבור נסגר (השרת רושם לבד).
// פעילות אחרי סשן שנסגר בגלל חוסר פעילות פותחת סשן חדש.
import { ref, push, update, get, onValue, onDisconnect, serverTimestamp } from 'firebase/database';
import { db } from './firebase';
import { currentDevice } from '../utils/device';
import { SESSION_BEAT_MS, SESSION_IDLE_MS } from '../data/userStats';

const KEEP_SESSIONS = 60;
const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'touchstart', 'wheel', 'scroll'];

let tracker = null; // { uid, sessionRef, lastActivity, dirty, timer, stopConnected }

const isVisible = () => typeof document === 'undefined' || document.visibilityState !== 'hidden';

// שומרים רק את הכניסות האחרונות כדי שהנתונים לא יגדלו בלי סוף
const pruneOld = async (uid) => {
  const snap = await get(ref(db, `english/users/${uid}/sessions`));
  const keys = Object.keys(snap.val() || {}).sort();
  if (keys.length <= KEEP_SESSIONS) return;
  const removals = {};
  keys.slice(0, keys.length - KEEP_SESSIONS).forEach(k => { removals[k] = null; });
  await update(ref(db, `english/users/${uid}/sessions`), removals);
};

const openSession = () => {
  const t = tracker;
  const device = currentDevice();
  const sessionRef = push(ref(db, `english/users/${t.uid}/sessions`));
  t.sessionRef = sessionRef;
  t.dirty = false;
  update(sessionRef, { start: serverTimestamp(), last: serverTimestamp(), d: device.label, k: device.type })
    .then(() => pruneOld(t.uid))
    .catch(() => {});

  // אחרי ניתוק קצר וחזרה - ממשיכים את אותו סשן
  t.stopConnected = onValue(ref(db, '.info/connected'), (snap) => {
    if (snap.val() !== true || tracker?.sessionRef !== sessionRef) return;
    onDisconnect(sessionRef).update({ end: serverTimestamp() })
      .then(() => update(sessionRef, { end: null }))
      .catch(() => {});
  });
};

const closeSession = () => {
  const t = tracker;
  if (!t?.sessionRef) return Promise.resolve();
  const sessionRef = t.sessionRef;
  const last = t.dirty ? { last: serverTimestamp() } : {};
  t.sessionRef = null;
  t.stopConnected();
  onDisconnect(sessionRef).cancel().catch(() => {});
  return update(sessionRef, { ...last, end: serverTimestamp() }).catch(() => {});
};

const onActivity = () => {
  const t = tracker;
  if (!t || !isVisible()) return;
  t.lastActivity = Date.now();
  if (t.sessionRef) t.dirty = true;
  else openSession(); // חזרה אחרי הפסקה ארוכה - סשן חדש
};

const beat = () => {
  const t = tracker;
  if (!t?.sessionRef) return;
  if (Date.now() - t.lastActivity >= SESSION_IDLE_MS) {
    closeSession();
  } else if (t.dirty) {
    t.dirty = false;
    update(t.sessionRef, { last: serverTimestamp() }).catch(() => {});
  }
};

const onVisibility = () => {
  if (isVisible()) onActivity();
  else beat(); // שומרים את הדקה האחרונה לפני שהלשונית יורדת לרקע
};

export const endSession = () => {
  if (!tracker) return Promise.resolve();
  const done = closeSession();
  clearInterval(tracker.timer);
  ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, onActivity, true));
  document.removeEventListener('visibilitychange', onVisibility);
  tracker = null;
  return done;
};

export const startSession = (uid) => {
  if (!db || !uid) return;
  endSession();
  tracker = { uid, sessionRef: null, lastActivity: Date.now(), dirty: false, timer: null, stopConnected: () => {} };
  openSession();
  tracker.timer = setInterval(beat, SESSION_BEAT_MS);
  ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, onActivity, { capture: true, passive: true }));
  document.addEventListener('visibilitychange', onVisibility);
};
