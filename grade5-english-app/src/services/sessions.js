// זמני פעילות של משתמשים מחוברים:
//   english/users/<uid>/sessions/<id> = { start, last, end?, d: "iPhone · Safari", k: "mobile" }
// start - כניסה, last - הפעם האחרונה שהמסך היה פתוח ופעיל (מתעדכן כל דקה),
// end - השרת רושם אותו לבד כשהחיבור נסגר (סגירת הלשונית / יציאה / ניתוק רשת)
import { ref, push, update, get, onValue, onDisconnect, serverTimestamp } from 'firebase/database';
import { db } from './firebase';
import { currentDevice } from '../utils/device';

const HEARTBEAT_MS = 60 * 1000;
const KEEP_SESSIONS = 60;

let active = null; // { sessionRef, stopConnected, timer, onVisibility }

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

export const endSession = () => {
  if (!active) return Promise.resolve();
  const { sessionRef, stopConnected, timer, onVisibility } = active;
  active = null;
  stopConnected();
  clearInterval(timer);
  document.removeEventListener('visibilitychange', onVisibility);
  onDisconnect(sessionRef).cancel().catch(() => {});
  return update(sessionRef, { last: serverTimestamp(), end: serverTimestamp() }).catch(() => {});
};

export const startSession = (uid) => {
  if (!db || !uid) return;
  endSession();

  const device = currentDevice();
  const sessionRef = push(ref(db, `english/users/${uid}/sessions`));
  update(sessionRef, { start: serverTimestamp(), last: serverTimestamp(), d: device.label, k: device.type })
    .then(() => pruneOld(uid))
    .catch(() => {});

  const beat = () => {
    if (isVisible()) update(sessionRef, { last: serverTimestamp() }).catch(() => {});
  };

  // אחרי ניתוק קצר וחזרה - ממשיכים את אותו סשן
  const stopConnected = onValue(ref(db, '.info/connected'), (snap) => {
    if (snap.val() !== true) return;
    onDisconnect(sessionRef).update({ end: serverTimestamp() })
      .then(() => update(sessionRef, { end: null, last: serverTimestamp() }))
      .catch(() => {});
  });

  const onVisibility = () => beat();
  document.addEventListener('visibilitychange', onVisibility);
  active = { sessionRef, stopConnected, timer: setInterval(beat, HEARTBEAT_MS), onVisibility };
};
