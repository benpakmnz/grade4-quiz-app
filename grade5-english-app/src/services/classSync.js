// השיוך לכיתה נשמר ב-<DB_ROOT>/classOf/<uid>. הילד/ה קובע/ת אותו פעם אחת (בהרשמה דרך קישור הכיתה),
// ורק מנהל/ת יכול/ה לשנות אותו אחר כך (לפי כללי האבטחה).
import { ref, get, set } from 'firebase/database';
import { db } from './firebase';
import { DB_ROOT } from './env';
import { isClassId, readPendingClass, clearPendingClass } from '../data/classes';

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
  if (!id && pending && isNew) {
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
