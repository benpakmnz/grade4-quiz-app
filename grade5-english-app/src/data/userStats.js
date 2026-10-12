// הופך את הנתונים הגולמיים של משתמש מ-Firebase (english/users/<uid>) לנתונים לתצוגה בלוח הבקרה
import { categories, TARGET_PER_CATEGORY } from './categories';

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

export const parseUser = (uid, raw = {}) => {
  const profile = raw.profile || {};
  const data = raw.progress?.data || {};
  const userData = parseJSON(data.english_userData, {}) || {};
  const stats = parseJSON(data.english_categoryStats, {}) || {};
  const mistakes = parseJSON(data.english_mistakes, []);

  const perCategory = categories.map(cat => {
    const s = stats[cat.id] || { correct: 0, total: 0 };
    const correct = toNumber(s.correct);
    const total = toNumber(s.total);
    return {
      id: cat.id,
      name: cat.name,
      emoji: cat.emoji,
      correct,
      total,
      rate: total > 0 ? Math.round((correct / total) * 100) : null,
      progress: Math.min(100, Math.round((correct / TARGET_PER_CATEGORY) * 100))
    };
  });

  const correct = perCategory.reduce((sum, c) => sum + c.correct, 0);
  const total = perCategory.reduce((sum, c) => sum + c.total, 0);

  return {
    uid,
    name: userData.name || profile.name || '(ללא שם)',
    googleName: profile.name || '',
    email: profile.email || '',
    character: userData.character?.emoji || '🙂',
    lastSeen: toNumber(profile.lastSeen) || toNumber(raw.progress?.updatedAt) || 0,
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
