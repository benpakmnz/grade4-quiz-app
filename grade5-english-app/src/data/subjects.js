// מקצועות התרגול באפליקציה. אותם משתמשים, אותן נקודות - נושאים ומבחן נפרדים.
// כל כיתה רואה רק את המקצועות שלה (ראו classes.js). family - איזה מנוע/עיצוב המקצוע משתמש.
import { categories as englishCategories, EXAM_DATE as ENGLISH_EXAM_DATE } from './categories';
import { mathCategories, MATH_EXAM_DATE } from './mathCategories';
import { hebrewCategories, HEBREW_EXAM_DATE } from './hebrewCategories';
import { math3Categories, MATH3_EXAM_DATE } from './math3Categories';
import { classById } from './classes';
import { IS_TEST_ENV } from '../services/env';

export const SUBJECTS = {
  english: {
    id: 'english',
    name: 'אנגלית',
    emoji: '🔤',
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
    categories: mathCategories,
    family: 'math'
  },
  hebrew: {
    id: 'hebrew',
    name: 'שפה',
    emoji: '📝',
    examName: 'מבחן בשפה',
    examDate: HEBREW_EXAM_DATE,
    categories: hebrewCategories
  },
  // כיתה ג'
  math3: {
    id: 'math3',
    name: 'חשבון',
    emoji: '🔢',
    examName: 'מבחן תחילת השנה בחשבון',
    examDate: MATH3_EXAM_DATE,
    categories: math3Categories,
    family: 'math'
  }
};

/** המשפחה של המקצוע: 'math' לכל מקצועות החשבון (כל הכיתות), אחרת המקצוע עצמו */
export const subjectFamily = (id) => SUBJECTS[id]?.family || id;

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

// מועדי המבחנים לפי הכיתה: מועדים שהמורה קבעה (classSettings), ואם אין - המועדים שבקוד (רק בכיתות שמשתמשות בהם).
// בלי מועד - אין ספירה לאחור (הפונקציה מחזירה NaN, וכל ההשוואות ">= 0" יוצאות שקר)
let examPlan = { useDefaults: true, dates: {} };
export const setExamPlan = (plan) => {
  examPlan = { useDefaults: plan?.useDefaults !== false, dates: plan?.dates || {} };
};
export const examDateOf = (subjectId) => {
  const d = examPlan.dates[subjectId];
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return new Date(`${d}T08:00:00`);
  return examPlan.useDefaults ? SUBJECTS[subjectId]?.examDate || null : null;
};

export const getDaysUntilSubjectExam = (subjectId, now) => {
  const date = examDateOf(subjectId);
  return date ? daysUntil(date, now) : NaN;
};

// חשבון עדיין בבדיקה:
// - בסביבת הבדיקות (staging) - לכל המשתמשים
// - באתר האמיתי - רק למנהלים (english/admins)
// כדי לפתוח לכולם גם באתר האמיתי: REACT_APP_MATH_FOR_EVERYONE=true (או לשנות כאן ל-true)
export const MATH_FOR_EVERYONE = IS_TEST_ENV || (process.env.REACT_APP_MATH_FOR_EVERYONE || '').trim() === 'true';

// שפה - באותה שיטה: בבדיקות לכולם, באתר האמיתי למנהלים עד REACT_APP_HEBREW_FOR_EVERYONE=true
export const HEBREW_FOR_EVERYONE = IS_TEST_ENV || (process.env.REACT_APP_HEBREW_FOR_EVERYONE || '').trim() === 'true';

/** המקצועות שהמשתמש/ת רואה: רק של הכיתה שלו/ה, ובכיתה ה' - לפי המתגים */
export const availableSubjects = (isAdmin, classId) => classById(classId).subjects.filter(id =>
  (id === 'math' ? (MATH_FOR_EVERYONE || isAdmin)
    : id === 'hebrew' ? (HEBREW_FOR_EVERYONE || isAdmin)
      : Boolean(SUBJECTS[id])));

/** סדר התצוגה: המבחן הקרוב ראשון, ומבחנים שכבר עברו - בסוף */
export const subjectsByExam = (ids = SUBJECT_IDS, now = new Date()) =>
  [...ids].sort((a, b) => {
    // קודם מבחנים קרובים, אחר כך מקצועות בלי מועד, ובסוף מבחנים שעברו (האחרון שעבר - ראשון)
    const key = (id) => {
      const d = getDaysUntilSubjectExam(id, now);
      return Number.isNaN(d) ? [1, 0] : d >= 0 ? [0, d] : [2, -d];
    };
    const [ga, va] = key(a);
    const [gb, vb] = key(b);
    return ga - gb || va - vb;
  });

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
