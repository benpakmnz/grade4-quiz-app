// טעינת השאלות שנוספו בממשק הניהול, ופעולות הניהול עצמן (הוספה / מחיקה / הסתרה)
import { ref, onValue, get, push, set, remove, serverTimestamp, query, orderByKey, startAt } from 'firebase/database';
import { db } from './firebase';
import { setRemoteContent } from '../data/contentStore';

const CONTENT_PATH = 'english/content';

/** מאזין לשינויים בשאלות (קריאה ציבורית - עובד גם בלי התחברות). מחזיר פונקציית ביטול. */
export const subscribeContent = () => {
  if (!db) return () => {};
  return onValue(
    ref(db, CONTENT_PATH),
    (snap) => setRemoteContent(snap.val()),
    (err) => console.warn('Could not load custom questions; using built-in ones only', err)
  );
};

/** האם המשתמש/ת מוגדר/ת כמנהל/ת (english/admins/<uid> = true) */
export const checkIsAdmin = async (uid) => {
  if (!db || !uid) return false;
  try {
    const snap = await get(ref(db, `english/admins/${uid}`));
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
  const snap = await get(ref(db, 'english/users'));
  return snap.val() || {};
};

/** ביקורים מהתאריך הנתון והלאה - רק למנהלים */
export const fetchVisitsSince = async (fromDay) => {
  const snap = await get(query(ref(db, 'english/visits'), orderByKey(), startAt(fromDay)));
  return snap.val() || {};
};

/** מספר המבקרים שמחוברים עכשיו (מתעדכן בזמן אמת). מחזיר פונקציית ביטול. */
export const subscribePresence = (callback) =>
  onValue(
    ref(db, 'english/presence'),
    (snap) => {
      const all = Object.values(snap.val() || {});
      callback({ total: all.length, signedIn: all.filter(p => p && p.s === true).length });
    },
    () => callback(null)
  );
