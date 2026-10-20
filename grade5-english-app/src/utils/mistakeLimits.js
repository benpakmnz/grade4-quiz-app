// יומן הטעויות מופרד לפי מקצוע: לכל מקצוע עד 300 טעויות אחרונות,
// כדי שהרבה תרגול בחשבון לא "ידחוף החוצה" את הטעויות באנגלית (ולהפך).
import { subjectOf } from '../data/subjects';

export const MAX_PER_SUBJECT = 300;

/** המקצוע של רשומה ביומן (רשומות ישנות - לפי הנושא) */
export const mistakeSubject = (m) => m?.subject || subjectOf(m?.category);

/** מהחדש לישן, ולכל מקצוע רק MAX_PER_SUBJECT האחרונות */
export const capMistakes = (list, max = MAX_PER_SUBJECT) => {
  const counts = {};
  return [...(Array.isArray(list) ? list : [])]
    .filter(m => m && typeof m === 'object')
    .sort((a, b) => (b.ts || 0) - (a.ts || 0))
    .filter(m => {
      const s = mistakeSubject(m);
      counts[s] = (counts[s] || 0) + 1;
      return counts[s] <= max;
    });
};
