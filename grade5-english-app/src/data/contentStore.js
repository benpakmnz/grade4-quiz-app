// מאגרי השאלות: השאלות המובנות (בקוד) + שאלות שנוספו בממשק הניהול (Firebase), פחות שאלות שהוסתרו.
// מבנה ב-Realtime Database:
//   english/content/custom/<bank>/<id> = שאלה שנוספה
//   english/content/hidden/<bank>/<builtinId> = true   (שאלה מובנית שנמחקה)
import { words, fillSentences } from './vocabulary';
import { isAre, hasHave, canCant, becauseWhy, whyMatch } from './grammar';
import { sentences } from './sentences';
import { readingPassages, listeningPassages } from './reading';
import { correctSentenceQuestions } from './writing';

export const BUILTIN = {
  words,
  fill: fillSentences,
  isAre,
  hasHave,
  canCant,
  becauseWhy,
  whyMatch,
  sentences,
  reading: readingPassages,
  listening: listeningPassages,
  writing: correctSentenceQuestions
};

// מזהה יציב לשאלה מובנית (לפי התוכן שלה), כדי שאפשר יהיה להסתיר אותה
const hash = (str) => {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
};
export const builtinId = (item) => `b_${hash(JSON.stringify(item))}`;

let custom = {};
let hidden = {};
const listeners = new Set();

export const setRemoteContent = (content) => {
  custom = content?.custom || {};
  hidden = content?.hidden || {};
  listeners.forEach(fn => fn());
};

export const onContentChange = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

// Firebase מחזיר מערכים של שאלות (למשל אפשרויות) לפעמים כאובייקט {0:..,1:..}
const asArray = (value) => {
  if (Array.isArray(value)) return value.filter(v => v !== undefined && v !== null);
  if (value && typeof value === 'object') return Object.keys(value).sort((a, b) => a - b).map(k => value[k]);
  return [];
};

export const normalizeItem = (bank, item) => {
  const copy = { ...item };
  ['distractors', 'wrong', 'options', 'events'].forEach(k => {
    if (k in copy) copy[k] = asArray(copy[k]);
  });
  if ('questions' in copy) copy.questions = asArray(copy.questions).map(q => normalizeItem(bank, q));
  return copy;
};

/** כל השאלות במאגר, כולל מקור ומזהה - לממשק הניהול */
export const listBank = (bank) => {
  const hiddenIds = hidden[bank] || {};
  const builtins = (BUILTIN[bank] || []).map(item => {
    const id = builtinId(item);
    return { id, item, source: 'builtin', hidden: Boolean(hiddenIds[id]) };
  });
  const added = Object.entries(custom[bank] || {}).map(([id, item]) => ({
    id, item: normalizeItem(bank, item), source: 'custom', hidden: false
  }));
  return [...added.sort((a, b) => (b.item.createdAt || 0) - (a.item.createdAt || 0)), ...builtins];
};

/** השאלות הפעילות במאגר - למשחקים. אם הכול נמחק, חוזרים למובנות כדי שהמשחק לא יישבר */
export const getBank = (bank) => {
  const active = listBank(bank).filter(e => !e.hidden).map(e => e.item);
  return active.length > 0 ? active : (BUILTIN[bank] || []);
};
