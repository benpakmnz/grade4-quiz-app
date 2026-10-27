// טעינת השאלות שנוספו בממשק הניהול, ופעולות הניהול עצמן (הוספה / מחיקה / הסתרה)
import { ref, onValue, get, push, set, remove, serverTimestamp, query, orderByKey, startAt } from 'firebase/database';
import { db } from './firebase';
import { DB_ROOT } from './env';
import { setRemoteContent } from '../data/contentStore';

// לכל בית ספר יכול להיות מאגר שאלות משלו: <DB_ROOT>/contentBy/<key>. בלי key - המאגר הראשי.
// הוספה / מחיקה / הסתרה פועלות על המאגר שנטען כרגע (של הכיתה שמוצגת)
export const contentPath = (key) => (key ? `${DB_ROOT}/contentBy/${key}` : `${DB_ROOT}/content`);
let CONTENT_PATH = contentPath(null);

/** מאזין לשינויים בשאלות (קריאה ציבורית - עובד גם בלי התחברות). מחזיר פונקציית ביטול. */
export const subscribeContent = (key = null) => {
  if (!db) return () => {};
  CONTENT_PATH = contentPath(key);
  setRemoteContent(null);
  return onValue(
    ref(db, CONTENT_PATH),
    (snap) => setRemoteContent(snap.val()),
    (err) => console.warn('Could not load custom questions; using built-in ones only', err)
  );
};

/** הגדרות הכיתה (מועדי מבחנים) - מתעדכן בזמן אמת. מחזיר פונקציית ביטול */
export const subscribeClassSettings = (classId, callback) => {
  if (!db || !classId) return () => {};
  return onValue(
    ref(db, `${DB_ROOT}/classSettings/${classId}`),
    (snap) => callback(snap.val() || {}),
    () => callback({})
  );
};

/** מורה / מנהל: מועד מבחן למקצוע ('' = מוחקים את המועד) */
export const setExamDate = (classId, subjectId, date) => {
  const r = ref(db, `${DB_ROOT}/classSettings/${classId}/exams/${subjectId}`);
  return date ? set(r, date) : remove(r);
};

/** איזו כיתה המשתמש/ת מלמד/ת (english/teachers/<uid> = 'th5'), או null */
export const checkTeacherOf = async (uid) => {
  if (!db || !uid) return null;
  try {
    const snap = await get(ref(db, `${DB_ROOT}/teachers/${uid}`));
    return typeof snap.val() === 'string' ? snap.val() : null;
  } catch {
    return null;
  }
};

/** מנהל/ת: קביעת מורה לכיתה (null = ביטול) */
export const setTeacherOf = (uid, classId) => {
  const r = ref(db, `${DB_ROOT}/teachers/${uid}`);
  return classId ? set(r, classId) : remove(r);
};

/** מנהל/ת: כל המורים */
export const fetchTeachers = async () => {
  const snap = await get(ref(db, `${DB_ROOT}/teachers`));
  return snap.val() || {};
};

/** מורה: נתונים של תלמיד/ה אחד/ת (הכללים מאפשרים רק תלמידים מהכיתה שלה) */
export const fetchUser = async (uid) => {
  const snap = await get(ref(db, `${DB_ROOT}/users/${uid}`));
  return snap.val() || {};
};

/** האם המשתמש/ת מוגדר/ת כמנהל/ת (english/admins/<uid> = true) */
export const checkIsAdmin = async (uid) => {
  if (!db || !uid) return false;
  try {
    const snap = await get(ref(db, `${DB_ROOT}/admins/${uid}`));
    return snap.val() === true;
  } catch {
    return false;
  }
};

export const addQuestion = (bank, item) =>
  push(ref(db, `${CONTENT_PATH}/custom/${bank}`), { ...item, createdAt: serverTimestamp() });

export const deleteCustomQuestion = (bank, id) =>
  remove(ref(db, `${CONTENT_PATH}/custom/${bank}/${id}`));

export const setBuiltinHidden = (bank, id, isHidden) =>
  isHidden
    ? set(ref(db, `${CONTENT_PATH}/hidden/${bank}/${id}`), true)
    : remove(ref(db, `${CONTENT_PATH}/hidden/${bank}/${id}`));

/** כל המשתמשים וההתקדמות שלהם - רק למנהלים (לפי כללי האבטחה) */
export const fetchAllUsers = async () => {
  const snap = await get(ref(db, `${DB_ROOT}/users`));
  return snap.val() || {};
};

/** ביקורים מהתאריך הנתון והלאה - רק למנהלים */
export const fetchVisitsSince = async (fromDay) => {
  const snap = await get(query(ref(db, `${DB_ROOT}/visits`), orderByKey(), startAt(fromDay)));
  return snap.val() || {};
};

/** מספר המבקרים שמחוברים עכשיו (מתעדכן בזמן אמת). מחזיר פונקציית ביטול. */
export const subscribePresence = (callback) =>
  onValue(
    ref(db, `${DB_ROOT}/presence`),
    (snap) => {
      const all = Object.values(snap.val() || {});
      callback({ total: all.length, signedIn: all.filter(p => p && p.s === true).length });
    },
    () => callback(null)
  );
