// באיזו סביבה האפליקציה רצה: אמיתית (production) או בדיקות (staging / תצוגה מקדימה של Vercel).
// Vercel מעביר לבנייה את REACT_APP_VERCEL_ENV: 'production' באתר הראשי, 'preview' בכל ענף אחר.
// בסביבת בדיקות כל הנתונים נשמרים תחת english-test/... ולא נוגעים בנתונים של הילדים.
const read = (value) => (value || '').trim();

const explicitRoot = read(process.env.REACT_APP_DB_ROOT);

export const DB_ROOT = /^[a-z0-9-]+$/.test(explicitRoot)
  ? explicitRoot
  : read(process.env.REACT_APP_VERCEL_ENV) === 'preview' ? 'english-test' : 'english';

export const IS_TEST_ENV = DB_ROOT !== 'english';

// שם הענף והגרסה - מוצגים בפס של סביבת הבדיקות
export const ENV_BRANCH = read(process.env.REACT_APP_VERCEL_GIT_COMMIT_REF);
export const ENV_COMMIT = read(process.env.REACT_APP_VERCEL_GIT_COMMIT_SHA).slice(0, 7);
