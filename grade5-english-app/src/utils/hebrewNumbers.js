// כתיבת מספר (0 עד מיליון) במילים בעברית, כמו שכותבים בבית הספר:
// 325 ← "שלוש מאות עשרים וחמש",  21,000 ← "עשרים ואחד אלף",  4,000 ← "ארבעת אלפים"
// היחידות בצורת נקבה (ספירה), ומספר האלפים מעל 10 בצורת זכר (אלף הוא זכר).

const ONES_F = ['', 'אחת', 'שתיים', 'שלוש', 'ארבע', 'חמש', 'שש', 'שבע', 'שמונה', 'תשע'];
const TEENS_F = ['עשר', 'אחת עשרה', 'שתים עשרה', 'שלוש עשרה', 'ארבע עשרה', 'חמש עשרה', 'שש עשרה', 'שבע עשרה', 'שמונה עשרה', 'תשע עשרה'];
const ONES_M = ['', 'אחד', 'שניים', 'שלושה', 'ארבעה', 'חמישה', 'שישה', 'שבעה', 'שמונה', 'תשעה'];
const TEENS_M = ['עשרה', 'אחד עשר', 'שנים עשר', 'שלושה עשר', 'ארבעה עשר', 'חמישה עשר', 'שישה עשר', 'שבעה עשר', 'שמונה עשר', 'תשעה עשר'];
const TENS = ['', '', 'עשרים', 'שלושים', 'ארבעים', 'חמישים', 'שישים', 'שבעים', 'שמונים', 'תשעים'];
const HUNDREDS = ['', 'מאה', 'מאתיים', 'שלוש מאות', 'ארבע מאות', 'חמש מאות', 'שש מאות', 'שבע מאות', 'שמונה מאות', 'תשע מאות'];
const THOUSANDS_2_TO_10 = ['', 'אלף', 'אלפיים', 'שלושת אלפים', 'ארבעת אלפים', 'חמשת אלפים', 'ששת אלפים', 'שבעת אלפים', 'שמונת אלפים', 'תשעת אלפים', 'עשרת אלפים'];

// מספר 1-999 כרשימת חלקים (בלי "ו")
const partsBelowThousand = (n, masculine) => {
  const parts = [];
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h) parts.push(HUNDREDS[h]);
  if (rest >= 10 && rest < 20) {
    parts.push((masculine ? TEENS_M : TEENS_F)[rest - 10]);
  } else {
    const t = Math.floor(rest / 10);
    const o = rest % 10;
    if (t) parts.push(TENS[t]);
    if (o) parts.push((masculine ? ONES_M : ONES_F)[o]);
  }
  return parts;
};

// "ו" לפני החלק האחרון
const joinParts = (parts) =>
  parts.length < 2 ? parts.join('') : `${parts.slice(0, -1).join(' ')} ו${parts[parts.length - 1]}`;

export const numberToHebrew = (n) => {
  if (!Number.isInteger(n) || n < 0 || n > 1000000) throw new Error(`out of range: ${n}`);
  if (n === 0) return 'אפס';
  if (n === 1000000) return 'מיליון';

  const thousands = Math.floor(n / 1000);
  const rest = n % 1000;
  const restParts = partsBelowThousand(rest, false);

  if (!thousands) return joinParts(restParts);

  const thousandsText = thousands <= 10
    ? THOUSANDS_2_TO_10[thousands]
    : `${joinParts(partsBelowThousand(thousands, true))} אלף`;

  if (!restParts.length) return thousandsText;
  return joinParts([thousandsText, ...restParts]);
};

/** 345678 ← "345,678" */
export const formatNumber = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
