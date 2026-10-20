// גיבוי לפני "איפוס נתונים" + אפשרות לבטל את האיפוס (עד 7 ימים).
// הגיבוי נשמר יחד עם ההתקדמות (english_resetBackup), ולכן עובר גם לענן ולמכשירים אחרים.

export const BACKUP_KEY = 'english_resetBackup';
export const RESET_KEYS = [
  'english_categoryStats',
  'english_score',
  'english_streak',
  'english_questionCount',
  'english_history',
  'english_achievements'
];
export const UNDO_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

/** שומר עותק של מה שעומד להימחק, ואז מוחק */
export const resetWithBackup = (now = Date.now()) => {
  const data = {};
  RESET_KEYS.forEach(k => {
    const v = localStorage.getItem(k);
    if (v !== null) data[k] = v;
  });
  if (Object.keys(data).length) localStorage.setItem(BACKUP_KEY, JSON.stringify({ ts: now, data }));
  RESET_KEYS.forEach(k => localStorage.removeItem(k));
  localStorage.setItem('english_localUpdatedAt', String(now));
};

/** הגיבוי האחרון, אם עדיין אפשר לבטל (פחות מ-7 ימים) */
export const readBackup = (now = Date.now()) => {
  try {
    const b = JSON.parse(localStorage.getItem(BACKUP_KEY) || 'null');
    if (!b || typeof b.ts !== 'number' || !b.data || now - b.ts > UNDO_DAYS * DAY_MS) return null;
    return b;
  } catch {
    return null;
  }
};

/** מחזיר את הנתונים מהגיבוי. מה שנצבר אחרי האיפוס (נקודות, שאלות) מתווסף ולא הולך לאיבוד */
export const undoReset = (now = Date.now()) => {
  const b = readBackup(now);
  if (!b) return false;
  const num = (v) => Number(v) || 0;
  const parse = (v, fallback) => {
    try {
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  };
  const cur = Object.fromEntries(RESET_KEYS.map(k => [k, localStorage.getItem(k)]));
  const old = b.data;

  localStorage.setItem('english_score', String(num(old.english_score) + num(cur.english_score)));
  localStorage.setItem('english_questionCount', String(num(old.english_questionCount) + num(cur.english_questionCount)));
  localStorage.setItem('english_streak', String(Math.max(num(old.english_streak), num(cur.english_streak))));

  const os = parse(old.english_categoryStats, {});
  const cs = parse(cur.english_categoryStats, {});
  const stats = {};
  new Set([...Object.keys(os), ...Object.keys(cs)]).forEach(id => {
    stats[id] = {
      correct: num(os[id]?.correct) + num(cs[id]?.correct),
      total: num(os[id]?.total) + num(cs[id]?.total)
    };
  });
  localStorage.setItem('english_categoryStats', JSON.stringify(stats));

  const achievements = [...new Set([...parse(old.english_achievements, []), ...parse(cur.english_achievements, [])])];
  localStorage.setItem('english_achievements', JSON.stringify(achievements));
  localStorage.setItem('english_history', JSON.stringify(
    [...parse(cur.english_history, []), ...parse(old.english_history, [])].slice(0, 50)
  ));

  localStorage.removeItem(BACKUP_KEY);
  localStorage.setItem('english_localUpdatedAt', String(now));
  return true;
};
