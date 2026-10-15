// מדידת שימוש אנונימית - גם למי שלא התחבר.
// לכל דפדפן מזהה אקראי (בלי שם / אימייל). נשמר:
//   english/visits/<YYYY-MM-DD>/<visitorId> = { t: זמן אחרון, s: מחובר?, n: מספר כניסות באותו יום }
//   english/presence/<visitorId> = { t, s }  - מי מחובר עכשיו (נמחק אוטומטית כשסוגרים את האתר)
import { ref, update, set, onValue, onDisconnect, serverTimestamp, increment } from 'firebase/database';
import { db } from './firebase';
import { DB_ROOT } from './env';

const VISITOR_KEY = 'english_visitorId';

export const getVisitorId = () => {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id || !/^[a-z0-9]{8,24}$/.test(id)) {
      id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
};

// תאריך מקומי (ישראל) בפורמט YYYY-MM-DD
export const dayKey = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

let counted = false;
let presenceStarted = false;
let signedInNow = false;

/** נקרא כשהאפליקציה נטענת, ושוב כשמצב ההתחברות משתנה */
export const trackVisit = (signedIn) => {
  const id = getVisitorId();
  if (!db || !id) return;
  signedInNow = Boolean(signedIn);
  const visit = { t: serverTimestamp(), s: signedInNow };
  if (!counted) {
    visit.n = increment(1);
    counted = true;
  }
  update(ref(db, `${DB_ROOT}/visits/${dayKey()}/${id}`), visit).catch(() => {});

  const presenceRef = ref(db, `${DB_ROOT}/presence/${id}`);
  if (!presenceStarted) {
    presenceStarted = true;
    // בכל התחברות מחדש לרשת - נרשמים שוב, ומבקשים מהשרת למחוק אותנו כשהחיבור נסגר
    onValue(ref(db, '.info/connected'), (snap) => {
      if (snap.val() !== true) return;
      onDisconnect(presenceRef).remove()
        .then(() => set(presenceRef, { t: serverTimestamp(), s: signedInNow }))
        .catch(() => {});
    });
  } else {
    set(presenceRef, { t: serverTimestamp(), s: signedInNow }).catch(() => {});
  }
};
