// סיכום כיתה לממשק המורה - מחושב מהנתונים של כל תלמיד/ה (parseUser ב-userStats.js)
import { SUBJECTS } from './subjects';
import { TARGET_PER_CATEGORY } from './categories';

const DAY = 24 * 60 * 60 * 1000;
export const ACTIVE_DAYS = 7;
export const STRUGGLE_RATE = 60;    // מתחת לזה - "מתקשה" בנושא
export const MIN_ANSWERS = 5;       // כדי לקבוע שמתקשה צריך מספיק תשובות
export const HARD_RATE = 75;        // נושא "קשה לכיתה" - הצלחה מתחת לזה

const rateOf = (correct, total) => (total > 0 ? Math.round((correct / total) * 100) : null);
const lastActive = (u) => Math.max(u.lastSeen || 0, u.lastPractice || 0);

/** סיכום של תלמיד/ה אחד/ת במקצוע: תשובות, הצלחה ומוכנות */
export const studentSubject = (user, subjectId) => {
  const cats = user.perCategory.filter(c => c.subject === subjectId && !SUBJECTS[subjectId].categories.find(x => x.id === c.id)?.testLength);
  const correct = cats.reduce((s, c) => s + c.correct, 0);
  const total = cats.reduce((s, c) => s + c.total, 0);
  const readiness = cats.length
    ? Math.round(cats.reduce((s, c) => s + Math.min(c.correct, TARGET_PER_CATEGORY), 0) / (cats.length * TARGET_PER_CATEGORY) * 100)
    : 0;
  const weakest = cats.filter(c => c.total >= MIN_ANSWERS).sort((a, b) => a.rate - b.rate)[0] || null;
  return { correct, total, rate: rateOf(correct, total), readiness, weakest: weakest && weakest.rate < STRUGGLE_RATE ? weakest : null };
};

/**
 * הכיתה כולה: מי פעיל/ה, הצלחה בכל נושא, ומי צריך/ה תשומת לב
 * users - תלמידים אחרי parseUser; subjectIds - המקצועות של הכיתה
 */
export const computeClassStats = (users, subjectIds, now = Date.now()) => {
  const active = users.filter(u => now - lastActive(u) < ACTIVE_DAYS * DAY);
  const answers = users.reduce((s, u) => s + u.overall.total, 0);
  const correct = users.reduce((s, u) => s + u.overall.correct, 0);

  const subjects = subjectIds.map(sid => {
    const topics = SUBJECTS[sid].categories.filter(c => !c.testLength).map(cat => {
      const rows = users.map(u => ({ user: u, c: u.perCategory.find(x => x.id === cat.id) })).filter(r => r.c && r.c.total > 0);
      const tc = rows.reduce((s, r) => s + r.c.correct, 0);
      const tt = rows.reduce((s, r) => s + r.c.total, 0);
      const struggling = rows.filter(r => r.c.total >= MIN_ANSWERS && r.c.rate < STRUGGLE_RATE).map(r => r.user);
      return { id: cat.id, name: cat.name, emoji: cat.emoji, practiced: rows.length, total: tt, rate: rateOf(tc, tt), struggling };
    });
    const practiced = topics.filter(t => t.total > 0);
    return {
      id: sid,
      topics,
      // הנושאים שהכי קשים לכיתה (מספיק תשובות כדי לקבוע)
      hardest: practiced.filter(t => t.total >= MIN_ANSWERS * 2 && t.rate < HARD_RATE).sort((a, b) => a.rate - b.rate).slice(0, 3),
      untouched: topics.filter(t => t.practiced === 0)
    };
  });

  // תשומת לב: לא תרגלו שבוע, או הצלחה נמוכה עם מספיק תשובות
  const attention = users
    .map(u => {
      const reasons = [];
      if (u.overall.total === 0) reasons.push('עוד לא תרגל/ה');
      else if (now - lastActive(u) >= ACTIVE_DAYS * DAY) reasons.push(`לא תרגל/ה ${Math.floor((now - lastActive(u)) / DAY)} ימים`);
      if (u.overall.total >= MIN_ANSWERS * 2 && u.overall.rate < STRUGGLE_RATE) reasons.push(`הצלחה ${u.overall.rate}%`);
      return { user: u, reasons };
    })
    .filter(x => x.reasons.length);

  return {
    count: users.length,
    activeCount: active.length,
    answers,
    rate: rateOf(correct, answers),
    subjects,
    attention
  };
};
