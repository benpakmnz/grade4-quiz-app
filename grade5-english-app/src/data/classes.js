// הכיתות באפליקציה. כל ילד שייך לכיתה אחת, ורואה רק את המקצועות, המבחנים והאתגרים שלה.
// משתמש בלי כיתה (כל מי שנרשם לפני שהיו כיתות) שייך לכיתת ברירת המחדל.
// ילד חדש מצטרף לכיתה דרך קישור: <כתובת האתר>/?class=<id>

export const CLASSES = {
  gi5: { id: 'gi5', school: 'גיבורי ישראל', grade: 'ה', subjects: ['english', 'math', 'hebrew'] },
  g3: { id: 'g3', school: '', grade: 'ג', subjects: ['math3'] }
};

export const DEFAULT_CLASS = 'gi5';
export const CLASS_IDS = Object.keys(CLASSES);

export const isClassId = (id) => Object.prototype.hasOwnProperty.call(CLASSES, id);
export const classById = (id) => CLASSES[isClassId(id) ? id : DEFAULT_CLASS];

/** "כיתה ה' · גיבורי ישראל" */
export const classLabel = (id) => {
  const c = classById(id);
  return `כיתה ${c.grade}'${c.school ? ` · ${c.school}` : ''}`;
};

/** קישור ההצטרפות של הכיתה */
export const classJoinLink = (id, origin = typeof window !== 'undefined' ? window.location.origin : '') =>
  `${origin}/?class=${id}`;

// ---------- קישור הצטרפות שנפתח לפני ההרשמה ----------
const PENDING_KEY = 'english_pendingClass';

/** שומרים את הכיתה מהקישור (?class=g3) עד שהילד נרשם */
export const capturePendingClass = (search = typeof window !== 'undefined' ? window.location.search : '') => {
  try {
    const id = new URLSearchParams(search).get('class');
    if (isClassId(id)) localStorage.setItem(PENDING_KEY, id);
  } catch {
    // ignore
  }
};

export const readPendingClass = () => {
  try {
    const id = localStorage.getItem(PENDING_KEY);
    return isClassId(id) ? id : null;
  } catch {
    return null;
  }
};

export const clearPendingClass = () => {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {
    // ignore
  }
};

// ---------- המנהל יכול "לראות כמו" כיתה אחרת (רק בתצוגה, לא משנה את השיוך) ----------
const VIEW_KEY = 'english_viewClass';
export const readViewClass = () => {
  try {
    const id = localStorage.getItem(VIEW_KEY);
    return isClassId(id) ? id : null;
  } catch {
    return null;
  }
};
export const saveViewClass = (id) => {
  try {
    if (id) localStorage.setItem(VIEW_KEY, id);
    else localStorage.removeItem(VIEW_KEY);
  } catch {
    // ignore
  }
};
