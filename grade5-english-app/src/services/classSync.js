// השיוך לכיתה נשמר ב-<DB_ROOT>/classOf/<uid>. הילד/ה קובע/ת אותו פעם אחת (בהרשמה דרך קישור הכיתה),
// ורק מנהל/ת יכול/ה לשנות אותו אחר כך (לפי כללי האבטחה).
import { ref, get, set, update, serverTimestamp } from 'firebase/database';
import { db } from './firebase';
import { DB_ROOT } from './env';
import { isClassId, isBuiltinClass, isLoadedClass, registerClass, readPendingClass, clearPendingClass, SUBJECT_CHOICES } from '../data/classes';

const classRef = (uid) => ref(db, `${DB_ROOT}/classOf${uid ? `/${uid}` : ''}`);
const LOCAL_KEY = 'english_class';

const remember = (id) => {
  try {
    if (id) localStorage.setItem(LOCAL_KEY, id);
    else localStorage.removeItem(LOCAL_KEY);
  } catch {
    // ignore
  }
};

/** הכיתה שנשמרה במכשיר (כשאין חיבור / למשתמש אורח) */
export const readLocalClass = () => {
  try {
    const id = localStorage.getItem(LOCAL_KEY);
    return isClassId(id) ? id : null;
  } catch {
    return null;
  }
};

/**
 * הכיתה של המשתמש/ת אחרי ההתחברות. ילד/ה חדש/ה שהגיע/ה מקישור של כיתה - משויך/ת אליה עכשיו.
 * isNew - אין לו/ה עדיין התקדמות (כדי שמשתמש/ת קיים/ת שפתח/ה קישור לא יעבור/תעבור כיתה בטעות)
 * מחזיר null = כיתת ברירת המחדל
 */
export const resolveMyClass = async (uid, isNew) => {
  if (!db || !uid) return readLocalClass() || readPendingClass();
  let id = null;
  try {
    const snap = await get(classRef(uid));
    id = isClassId(snap.val()) ? snap.val() : null;
  } catch {
    return readLocalClass();
  }
  const pending = readPendingClass();
  // הרשמה עצמית דרך קישור - רק לכיתות שבקוד. לכיתה של מורה מצטרפים רק דרך רשימת הכיתה שלה
  if (!id && pending && isNew && isBuiltinClass(pending)) {
    try {
      await set(classRef(uid), pending);
      id = pending;
    } catch (err) {
      console.warn('Could not save the class', err);
    }
  }
  clearPendingClass();
  remember(id);
  return id;
};

/** מנהל/ת: הכיתה של כל המשתמשים */
export const fetchAllClasses = async () => {
  const snap = await get(classRef());
  return snap.val() || {};
};

/** מנהל/ת: העברת משתמש/ת לכיתה */
export const setUserClass = (uid, id) => set(classRef(uid), id);

// ---------- כיתות שמורה פותחת ----------
const classRefOf = (cid) => ref(db, `${DB_ROOT}/classes/${cid}`);

/** פרטי כיתה (ציבורי - גם מסך הכניסה קורא אותם). null אם אין כזו */
export const fetchClassMeta = async (cid) => {
  if (!db || !cid) return null;
  try {
    const snap = await get(classRefOf(cid));
    return snap.val();
  } catch {
    return null;
  }
};

/** דואג שהאפליקציה מכירה את הכיתה (אם היא של מורה - טוען אותה מהמסד) */
export const ensureClass = async (cid) => {
  if (!cid || isBuiltinClass(cid)) return true;
  const meta = await fetchClassMeta(cid);
  return Boolean(meta && registerClass(cid, meta));
};

const randomId = (len) => {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = new Uint8Array(len);
  (window.crypto || window.msCrypto).getRandomValues(bytes);
  return Array.from(bytes, b => chars[b % chars.length]).join('');
};

/** מורה: פתיחת כיתה חדשה. מחזיר את המזהה שלה */
export const createClass = async (teacherUid, { name, school, grade, subjects }) => {
  const cid = randomId(8);
  await set(classRefOf(cid), {
    name: String(name).trim().slice(0, 30),
    school: String(school || '').trim().slice(0, 40),
    grade: String(grade || '').slice(0, 10),
    teacher: teacherUid,
    createdAt: serverTimestamp(),
    subjects: Object.fromEntries(SUBJECT_CHOICES.filter(s => subjects.includes(s)).map(s => [s, true]))
  });
  await set(ref(db, `${DB_ROOT}/teacherClasses/${teacherUid}/${cid}`), true);
  await ensureClass(cid);
  return cid;
};

/** מורה: עדכון שם / מקצועות */
export const updateClass = async (cid, changes) => {
  await update(classRefOf(cid), changes);
  await ensureClass(cid);
};

/** הכיתות שהמורה פתחה (נטענות ונרשמות) */
export const fetchTeacherClasses = async (teacherUid) => {
  const snap = await get(ref(db, `${DB_ROOT}/teacherClasses/${teacherUid}`));
  const ids = Object.keys(snap.val() || {});
  const loaded = await Promise.all(ids.map(cid => ensureClass(cid).then(okay => (okay ? cid : null))));
  return loaded.filter(Boolean);
};

/** מנהל/ת: כל הכיתות של כל המורים */
export const fetchAllCustomClasses = async () => {
  const snap = await get(ref(db, `${DB_ROOT}/classes`));
  const all = snap.val() || {};
  return Object.entries(all).map(([cid, meta]) => registerClass(cid, meta) && cid).filter(Boolean);
};

export { isLoadedClass };
