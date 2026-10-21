// סנכרון ההתקדמות לענן (Firebase Realtime Database)
// localStorage נשאר "עותק העבודה" של האפליקציה; כאן מעתיקים אותו אל english/users/<uid> ובחזרה.
import { ref, get, set, remove, serverTimestamp } from 'firebase/database';
import { db } from './firebase';
import { capMistakes } from '../utils/mistakeLimits';
import { DB_ROOT } from './env';
import { emailToUsername } from '../utils/username';

// כל המפתחות שמרכיבים את ההתקדמות של הילד/ה
export const PROGRESS_KEYS = [
  'english_userData',
  'english_score',
  'english_streak',
  'english_questionCount',
  'english_history',
  'english_categoryStats',
  'english_achievements',
  'english_writingDraft',
  'english_hasSeenWelcome',
  'english_lessonsSeen',
  'english_mistakes',
  'english_resetBackup',
  'english_escapeRooms'
];

const OWNER_KEY = 'english_owner';         // ה-uid שהנתונים המקומיים שייכים לו
const LOCAL_UPDATED_KEY = 'english_localUpdatedAt';
export const GUEST_KEY = 'english_guest';  // בחרו להמשיך בלי התחברות

const SAVE_DELAY_MS = 1500;

let currentUid = null;
let saveTimer = null;

const progressRef = (uid) => ref(db, `${DB_ROOT}/users/${uid}/progress`);
const profileRef = (uid) => ref(db, `${DB_ROOT}/users/${uid}/profile`);

const safeGet = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const snapshotLocal = () => {
  const data = {};
  PROGRESS_KEYS.forEach(key => {
    const value = safeGet(key);
    if (value !== null) data[key] = value;
  });
  return data;
};

/** כל ההתקדמות ששמורה במכשיר (לדוח "ההתקדמות שלי") */
export const readLocalProgress = () => snapshotLocal();

const applyToLocal = (data) => {
  PROGRESS_KEYS.forEach(key => localStorage.removeItem(key));
  Object.entries(data || {}).forEach(([key, value]) => {
    if (PROGRESS_KEYS.includes(key) && typeof value === 'string') localStorage.setItem(key, value);
  });
};

export const clearLocalProgress = () => {
  PROGRESS_KEYS.forEach(key => localStorage.removeItem(key));
  localStorage.removeItem(OWNER_KEY);
  localStorage.removeItem(LOCAL_UPDATED_KEY);
};

const hasLocalProgress = () => safeGet('english_userData') !== null;

const parse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

/**
 * מיזוג התקדמות של אורח/ת (במכשיר) לתוך חשבון שכבר יש לו נתונים בענן - כדי ששום דבר לא ילך לאיבוד.
 * נקודות, ספירות וסטטיסטיקה מתחברות; הישגים / שיעורים / טעויות מתאחדים; הפרופיל של החשבון נשמר.
 */
export const mergeProgress = (cloud = {}, local = {}) => {
  const num = (v) => Number(v) || 0;
  const merged = { ...local, ...cloud };

  merged.english_score = String(num(cloud.english_score) + num(local.english_score));
  merged.english_questionCount = String(num(cloud.english_questionCount) + num(local.english_questionCount));
  merged.english_streak = String(Math.max(num(cloud.english_streak), num(local.english_streak)));

  const cs = parse(cloud.english_categoryStats, {});
  const ls = parse(local.english_categoryStats, {});
  const stats = {};
  new Set([...Object.keys(cs), ...Object.keys(ls)]).forEach(id => {
    stats[id] = {
      correct: num(cs[id]?.correct) + num(ls[id]?.correct),
      total: num(cs[id]?.total) + num(ls[id]?.total)
    };
  });
  merged.english_categoryStats = JSON.stringify(stats);

  const unionBy = (a, b, key) => {
    const seen = new Set();
    return [...a, ...b].filter(x => {
      const k = key(x);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };
  merged.english_achievements = JSON.stringify(unionBy(
    parse(cloud.english_achievements, []), parse(local.english_achievements, []), a => a?.id ?? JSON.stringify(a)
  ));
  merged.english_lessonsSeen = JSON.stringify(unionBy(
    parse(cloud.english_lessonsSeen, []), parse(local.english_lessonsSeen, []), x => x
  ));
  merged.english_mistakes = JSON.stringify(
    capMistakes([...parse(cloud.english_mistakes, []), ...parse(local.english_mistakes, [])])
  );
  merged.english_history = JSON.stringify(
    [...parse(cloud.english_history, []), ...parse(local.english_history, [])].slice(0, 50)
  );
  // טיוטת כתיבה: שומרים את הארוכה מביניהן
  const cw = cloud.english_writingDraft || '';
  const lw = local.english_writingDraft || '';
  merged.english_writingDraft = lw.length > cw.length ? lw : cw;

  // הפרופיל (שם, דמות) של החשבון נשאר; אם לחשבון אין - לוקחים מהמכשיר
  merged.english_userData = cloud.english_userData || local.english_userData;
  Object.keys(merged).forEach(k => {
    if (merged[k] === undefined || merged[k] === null || merged[k] === '') delete merged[k];
  });
  return merged;
};

/**
 * נקרא אחרי התחברות: מחליט מה נכון יותר - הענן או המכשיר, ומעדכן את המקומי בהתאם.
 * - יש נתונים בענן ← טוענים אותם (אלא אם יש במכשיר הזה שינויים חדשים יותר של אותו משתמש שעוד לא עלו).
 * - אין נתונים בענן ← מעלים את מה שיש במכשיר (מעבר מהגרסה בלי התחברות), אלא אם הוא שייך למשתמש אחר.
 */
export const startSync = async (user) => {
  currentUid = user.uid;
  const owner = safeGet(OWNER_KEY);
  const localUpdated = Number(safeGet(LOCAL_UPDATED_KEY) || 0);

  const snap = await get(progressRef(user.uid));
  const cloud = snap.exists() ? snap.val() : null;

  if (cloud && cloud.data && !owner && hasLocalProgress()) {
    // אורח/ת שהתחבר/ה לחשבון קיים: ממזגים את מה שבמכשיר עם מה שבענן
    applyToLocal(mergeProgress(cloud.data, snapshotLocal()));
    localStorage.setItem(LOCAL_UPDATED_KEY, String(Date.now()));
    await pushNow();
  } else if (cloud && cloud.data) {
    const cloudUpdated = Number(cloud.clientUpdatedAt || 0);
    const localIsNewer = owner === user.uid && localUpdated > cloudUpdated && hasLocalProgress();
    if (localIsNewer) {
      await pushNow();
    } else {
      applyToLocal(cloud.data);
      localStorage.setItem(LOCAL_UPDATED_KEY, String(cloudUpdated));
    }
  } else if (owner && owner !== user.uid) {
    // הנתונים במכשיר שייכים לילד/ה אחר/ת - לא מעלים אותם לחשבון החדש
    clearLocalProgress();
  } else if (hasLocalProgress()) {
    await pushNow();
  }

  localStorage.setItem(OWNER_KEY, user.uid);
  localStorage.removeItem(GUEST_KEY);

  set(profileRef(user.uid), {
    name: user.displayName || emailToUsername(user.email) || '',
    email: emailToUsername(user.email) ? '' : (user.email || ''),
    username: emailToUsername(user.email) || '',
    lastSeen: serverTimestamp()
  }).catch(() => {});
};

export const stopSync = () => {
  clearTimeout(saveTimer);
  currentUid = null;
};

export const pushNow = async () => {
  clearTimeout(saveTimer);
  if (!currentUid || !db) return;
  const clientUpdatedAt = Number(safeGet(LOCAL_UPDATED_KEY) || Date.now());
  await set(progressRef(currentUid), {
    data: snapshotLocal(),
    clientUpdatedAt,
    updatedAt: serverTimestamp()
  });
};

/**
 * לקרוא אחרי כל שינוי מקומי בהתקדמות. שומר בענן אחרי השהיה קצרה (כדי לא לכתוב על כל לחיצה).
 * אם אין חיבור - Firebase שומר את הכתיבה בתור ושולח כשהחיבור חוזר.
 */
export const notifyLocalChange = () => {
  try {
    localStorage.setItem(LOCAL_UPDATED_KEY, String(Date.now()));
  } catch {
    return;
  }
  if (!currentUid) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    pushNow().catch(err => console.warn('Cloud save failed, will retry on next change', err));
  }, SAVE_DELAY_MS);
};

// שמירה אחרונה כשסוגרים את הלשונית
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    if (saveTimer) pushNow().catch(() => {});
  });
}

export const deleteCloudProgress = async () => {
  if (!currentUid || !db) return;
  await remove(ref(db, `${DB_ROOT}/users/${currentUid}`));
};

export const isSignedIn = () => Boolean(currentUid);
