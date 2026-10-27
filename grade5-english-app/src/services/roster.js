// רשימת התלמידים של כיתה שמורה פתחה: חשבון וסיסמה (6 ספרות) לכל תלמיד/ה.
// החשבונות נוצרים בחיבור צדדי (asOtherUser) - המורה נשארת מחוברת.
// הסיסמאות נשמרות ב-classSecrets/<כיתה> - רק המורה של הכיתה והמנהל יכולים לקרוא אותן.
import { ref, get, set, remove, update } from 'firebase/database';
import { updatePassword, deleteUser } from 'firebase/auth';
import { db, asOtherUser } from './firebase';
import { DB_ROOT } from './env';
import { ensureClass } from './classSync';

const randomDigits = (n) => {
  const bytes = new Uint8Array(n);
  window.crypto.getRandomValues(bytes);
  // לא מתחילים ב-0, ובלי רצפים "קלים מדי" כמו 111111
  let pin = Array.from(bytes, b => String(b % 10)).join('');
  if (pin[0] === '0') pin = `${(bytes[0] % 9) + 1}${pin.slice(1)}`;
  return /^(\d)\1+$/.test(pin) || pin === '123456' ? randomDigits(n) : pin;
};
export const makePin = () => randomDigits(6);

/** שם משתמש ייחודי לתלמיד/ה: מזהה הכיתה + מספר (הילדים לא צריכים להקליד אותו - הם בוחרים את השם שלהם) */
export const usernameFor = (cid, n) => `${cid}${String(n).padStart(2, '0')}`;

const rosterRef = (cid) => ref(db, `${DB_ROOT}/classes/${cid}/roster`);
const secretsRef = (cid) => ref(db, `${DB_ROOT}/classSecrets/${cid}`);

/** רשימת הכיתה + הסיסמאות (למורה) */
export const fetchRoster = async (cid) => {
  const [r, s] = await Promise.all([get(rosterRef(cid)), get(secretsRef(cid)).catch(() => null)]);
  const roster = r.val() || {};
  const secrets = s?.val() || {};
  return Object.entries(roster)
    .map(([uid, e]) => ({ uid, name: e.name, username: e.username, pin: secrets[uid] || null }))
    .sort((a, b) => a.name.localeCompare(b.name, 'he'));
};

/**
 * מוסיף תלמידים לכיתה. names - רשימת שמות.
 * onProgress(i, total) - לעדכון המסך. מחזיר את התלמידים שנוספו (עם הסיסמאות)
 */
export const addStudents = async (cid, names, onProgress = () => {}) => {
  const current = await fetchRoster(cid);
  const used = new Set(current.map(s => s.username));
  let next = current.length + 1;
  const added = [];
  const clean = names.map(n => String(n).trim().replace(/\s+/g, ' ').slice(0, 30)).filter(Boolean);
  for (let i = 0; i < clean.length; i++) {
    onProgress(i, clean.length);
    while (used.has(usernameFor(cid, next))) next++;
    const username = usernameFor(cid, next);
    used.add(username);
    const pin = makePin();
    // eslint-disable-next-line no-await-in-loop
    const uid = await asOtherUser({ username, password: pin, create: true, displayName: clean[i] }, async ({ user, db: sideDb }) => {
      // התלמיד/ה (בחיבור הצדדי) רושם/ת לעצמו/ה את הכיתה ואת השם
      await set(ref(sideDb, `${DB_ROOT}/classOf/${user.uid}`), cid);
      await set(ref(sideDb, `${DB_ROOT}/users/${user.uid}/profile`), { name: clean[i], email: '', username });
      return user.uid;
    });
    // eslint-disable-next-line no-await-in-loop
    await update(ref(db), {
      [`${DB_ROOT}/classes/${cid}/roster/${uid}`]: { name: clean[i], username },
      [`${DB_ROOT}/classSecrets/${cid}/${uid}`]: pin
    });
    added.push({ uid, name: clean[i], username, pin });
    next++;
  }
  onProgress(clean.length, clean.length);
  await ensureClass(cid);
  return added;
};

/** סיסמה חדשה לתלמיד/ה (צריך את הסיסמה הקודמת - היא שמורה אצל המורה) */
export const resetPin = async (cid, student) => {
  const pin = makePin();
  await asOtherUser({ username: student.username, password: student.pin }, ({ user }) => updatePassword(user, pin));
  await set(ref(db, `${DB_ROOT}/classSecrets/${cid}/${student.uid}`), pin);
  return pin;
};

/** שינוי שם בתצוגה (ברשימת הכיתה) */
export const renameStudent = (cid, uid, name) =>
  set(ref(db, `${DB_ROOT}/classes/${cid}/roster/${uid}/name`), String(name).trim().slice(0, 30));

/** הסרת תלמיד/ה: מוחקים את החשבון ואת ההתקדמות, ומורידים מהרשימה */
export const removeStudent = async (cid, student) => {
  if (student.pin) {
    await asOtherUser({ username: student.username, password: student.pin }, async ({ user, db: sideDb }) => {
      await remove(ref(sideDb, `${DB_ROOT}/users/${user.uid}`)).catch(() => {});
      await deleteUser(user);
    }).catch(() => {});
  }
  await update(ref(db), {
    [`${DB_ROOT}/classes/${cid}/roster/${student.uid}`]: null,
    [`${DB_ROOT}/classSecrets/${cid}/${student.uid}`]: null
  });
  await ensureClass(cid);
};
