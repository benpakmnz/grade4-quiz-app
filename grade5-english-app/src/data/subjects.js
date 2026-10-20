// מקצועות התרגול באפליקציה: אנגלית וחשבון. אותם משתמשים, אותן נקודות - נושאים ומבחן נפרדים.
import { categories as englishCategories, EXAM_DATE as ENGLISH_EXAM_DATE } from './categories';
import { mathCategories, MATH_EXAM_DATE } from './mathCategories';
import { IS_TEST_ENV } from '../services/env';

export const SUBJECTS = {
  english: {
    id: 'english',
    name: 'אנגלית',
    emoji: '🇬🇧',
    examName: 'מבחן מיפוי באנגלית',
    examDate: ENGLISH_EXAM_DATE,
    categories: englishCategories
  },
  math: {
    id: 'math',
    name: 'חשבון',
    emoji: '🔢',
    examName: 'מבחן בחשבון',
    examDate: MATH_EXAM_DATE,
    categories: mathCategories
  }
};

export const SUBJECT_IDS = Object.keys(SUBJECTS);

// כל הנושאים בשני המקצועות, כל אחד עם המקצוע שלו
export const allCategories = SUBJECT_IDS.flatMap(id =>
  SUBJECTS[id].categories.map(c => ({ ...c, subject: id }))
);

export const findCategory = (id) => allCategories.find(c => c.id === id);
export const subjectOf = (categoryId) => findCategory(categoryId)?.subject || 'english';

export const daysUntil = (date, now = new Date()) => {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const exam = new Date(date);
  exam.setHours(0, 0, 0, 0);
  return Math.round((exam - today) / (1000 * 60 * 60 * 24));
};

export const getDaysUntilSubjectExam = (subjectId, now) =>
  daysUntil((SUBJECTS[subjectId] || SUBJECTS.english).examDate, now);

// חשבון עדיין בבדיקה:
// - בסביבת הבדיקות (staging) - לכל המשתמשים
// - באתר האמיתי - רק למנהלים (english/admins)
// כדי לפתוח לכולם גם באתר האמיתי: REACT_APP_MATH_FOR_EVERYONE=true (או לשנות כאן ל-true)
export const MATH_FOR_EVERYONE = IS_TEST_ENV || (process.env.REACT_APP_MATH_FOR_EVERYONE || '').trim() === 'true';

/** המקצועות שהמשתמש/ת רואה */
export const availableSubjects = (isAdmin) => (MATH_FOR_EVERYONE || isAdmin ? SUBJECT_IDS : ['english']);

const SUBJECT_KEY = 'english_subject';

/** המקצוע שנבחר לאחרונה; אם עוד לא נבחר - זה שהמבחן שלו הכי קרוב (ועוד לא עבר) */
export const readSubject = (now, allowed = SUBJECT_IDS) => {
  try {
    const saved = localStorage.getItem(SUBJECT_KEY);
    if (allowed.includes(saved)) return saved;
  } catch {
    // ignore
  }
  const upcoming = allowed
    .map(id => ({ id, days: getDaysUntilSubjectExam(id, now) }))
    .filter(s => s.days >= 0)
    .sort((a, b) => a.days - b.days);
  return upcoming[0]?.id || 'english';
};

export const saveSubject = (id) => {
  try {
    localStorage.setItem(SUBJECT_KEY, id);
  } catch {
    // ignore
  }
};

/** טקסט קצר לספירה לאחור עד המבחן */
export const examCountdownText = (days) =>
  days > 1 ? `${days} ימים` : days === 1 ? 'מחר!' : days === 0 ? 'היום!' : 'עבר ✓';
