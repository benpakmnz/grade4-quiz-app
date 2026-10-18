// הופך את הנתונים הגולמיים של משתמש מ-Firebase (english/users/<uid>) לנתונים לתצוגה בלוח הבקרה
import { TARGET_PER_CATEGORY } from './categories';
import { allCategories } from './subjects';

const parseJSON = (value, fallback) => {
  if (typeof value !== 'string') return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const SESSION_BEAT_MS = 60 * 1000; // כל כמה זמן נשמרת הדקה האחרונה של פעילות
export const SESSION_IDLE_MS = 15 * 60 * 1000; // אחרי כמה זמן בלי פעילות הסשן נגמר

/**
 * מסכם כניסה אחת לתצוגה. הסוף בפועל הוא הדקה האחרונה שבה הייתה פעילות -
 * זמן בלי נגיעה במסך (או עם הלשונית ברקע) לא נספר.
 */
export const summarizeSession = (id, s, now = Date.now()) => {
  const start = toNumber(s?.start);
  const last = Math.max(toNumber(s?.last), start);
  const end = toNumber(s?.end);
  const live = !end && now - last < SESSION_IDLE_MS + SESSION_BEAT_MS;
  const until = end ? Math.min(end, last + SESSION_BEAT_MS) : live ? now : last;
  return {
    id,
    start,
    end: live ? null : until,
    live,
    minutes: Math.max(0, Math.round((until - start) / 60000)),
    device: typeof s?.d === 'string' ? s.d : '',
    type: typeof s?.k === 'string' ? s.k : ''
  };
};

export const parseSessions = (node, now = Date.now()) =>
  Object.entries(node && typeof node === 'object' ? node : {})
    .map(([id, s]) => summarizeSession(id, s, now))
    .filter(s => s.start > 0)
    .sort((a, b) => b.start - a.start);

export const parseUser = (uid, raw = {}) => {
  const profile = raw.profile || {};
  const data = raw.progress?.data || {};
  const userData = parseJSON(data.english_userData, {}) || {};
  const stats = parseJSON(data.english_categoryStats, {}) || {};
  const mistakes = parseJSON(data.english_mistakes, []);

  const perCategory = allCategories.map(cat => {
    const s = stats[cat.id] || { correct: 0, total: 0 };
    const correct = toNumber(s.correct);
    const total = toNumber(s.total);
    return {
      id: cat.id,
      name: cat.name,
      emoji: cat.emoji,
      subject: cat.subject,
      correct,
      total,
      rate: total > 0 ? Math.round((correct / total) * 100) : null,
      progress: Math.min(100, Math.round((correct / TARGET_PER_CATEGORY) * 100))
    };
  });

  const sessions = parseSessions(raw.sessions);

  const correct = perCategory.reduce((sum, c) => sum + c.correct, 0);
  const total = perCategory.reduce((sum, c) => sum + c.total, 0);

  return {
    uid,
    name: userData.name || profile.name || '(ללא שם)',
    googleName: profile.name || '',
    email: profile.email || '',
    username: profile.username || '',
    character: userData.character?.emoji || '🙂',
    lastSeen: Math.max(toNumber(profile.lastSeen), sessions[0] ? (sessions[0].end || Date.now()) : 0) || toNumber(raw.progress?.updatedAt) || 0,
    sessions,
    online: Boolean(sessions[0]?.live),
    lastPractice: toNumber(raw.progress?.updatedAt) || 0,
    score: toNumber(data.english_score),
    questionCount: toNumber(data.english_questionCount),
    perCategory,
    overall: { correct, total, rate: total > 0 ? Math.round((correct / total) * 100) : null },
    mistakes: Array.isArray(mistakes) ? mistakes : [],
    writingDraft: typeof data.english_writingDraft === 'string' ? data.english_writingDraft : '',
    lessonsSeen: parseJSON(data.english_lessonsSeen, []) || []
  };
};

export const parseAllUsers = (usersNode) =>
  Object.entries(usersNode || {})
    .map(([uid, raw]) => parseUser(uid, raw))
    .sort((a, b) => Math.max(b.lastSeen, b.lastPractice) - Math.max(a.lastSeen, a.lastPractice));

export const rateColor = (rate) =>
  rate === null ? '#9ca3af' : rate >= 80 ? '#10b981' : rate >= 60 ? '#f59e0b' : '#ef4444';

export const formatDuration = (minutes) => {
  if (minutes < 1) return 'פחות מדקה';
  if (minutes < 60) return `${minutes} דק'`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} שע' ${m} דק'` : `${h} שע'`;
};

const pad2 = (n) => String(n).padStart(2, '0');
export const formatClock = (ts) => {
  const d = new Date(ts);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};
export const formatDay = (ts) =>
  new Date(ts).toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'numeric' });

export const formatWhen = (ts) => {
  if (!ts) return '—';
  const diff = Date.now() - ts;
  const min = Math.round(diff / 60000);
  if (min < 1) return 'עכשיו';
  if (min < 60) return `לפני ${min} דק'`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `לפני ${hours} שע'`;
  const days = Math.round(hours / 24);
  if (days < 7) return `לפני ${days} ימים`;
  return new Date(ts).toLocaleDateString('he-IL');
};
