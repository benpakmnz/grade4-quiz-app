// מחולל שאלות בחשבון לכיתה ה' - כל שאלה נוצרת מחדש עם מספרים אקראיים.
//
// מבנה שאלה:
//   kind: 'mc' (בחירה מתוך אפשרויות) | 'input' (הקלדת מספר)
//   label   - שם סוג השאלה (קטן, מעל השאלה)
//   prompt  - השאלה בעברית (בלשון נקבה - הומר לזכר בתצוגה)
//   expr    - תרגיל להצגה גדולה (משמאל לימין). "3/4" מוצג כשבר, "2 1/4" כמספר מעורב
//   visual  - ציור (ראו MathVisual)
//   options - אפשרויות (ל-mc); optionVisuals - ציור לכל אפשרות במקום טקסט
//   answer  - התשובה הנכונה (מחרוזת)
//   unit    - יחידה ליד שדה ההקלדה
//   explanation - הסבר (שורות מופרדות ב-\n)
import { numberToHebrew, formatNumber as fmt } from '../utils/hebrewNumbers';
import { getBank } from './contentStore';

// ---------- עזרים ----------
export const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
export const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/** 4 אפשרויות שונות: התשובה + מסיחים (בלי כפילויות ובלי ערכים לא תקינים) */
const withDistractors = (answer, candidates, count = 4) => {
  const seen = new Set([String(answer)]);
  const out = [String(answer)];
  for (const c of candidates) {
    const s = String(c);
    if (out.length >= count) break;
    if (c === null || c === undefined || s === '' || s.includes('NaN') || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return shuffle(out);
};

const frac = (n, d) => `${n}/${d}`;
/** שבר או מספר מעורב: 7/4 ← "1 3/4", 8/4 ← "2", 3/4 ← "3/4" */
export const toMixed = (n, d) => {
  const w = Math.floor(n / d);
  const r = n % d;
  if (!r) return String(w);
  return w ? `${w} ${r}/${d}` : `${r}/${d}`;
};

const NAMES_F = ['נועה', 'מאיה', 'תמר', 'שירה', 'יעל', 'רותם', 'אביגיל', 'הילה', 'ליה', 'עדי'];
const NAMES_M = ['איתי', 'יונתן', 'עומר', 'דניאל', 'אורי', 'נדב', 'אריאל', 'רון', 'יואב', 'תום'];

// ======================================================================
// מבנה עשרוני ופילוג
// ======================================================================
const PLACES = [
  { name: 'יחידות', value: 1 },
  { name: 'עשרות', value: 10 },
  { name: 'מאות', value: 100 },
  { name: 'אלפים', value: 1000 },
  { name: 'עשרות אלפים', value: 10000 },
  { name: 'מאות אלפים', value: 100000 }
];

const digitsOf = (n) => String(n).split('').reverse().map(Number); // [יחידות, עשרות, ...]

/** מספר בן 6 ספרות שכל הספרות שלו שונות - כדי שהשאלה "ערך הספרה" תהיה חד-משמעית */
const distinctDigitsNumber = (len = 6) => {
  const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
  if (digits[0] === 0) [digits[0], digits[1]] = [digits[1], digits[0]];
  return Number(digits.slice(0, len).join(''));
};

const expandedParts = (n) =>
  digitsOf(n)
    .map((d, i) => d * 10 ** i)
    .filter(v => v > 0)
    .reverse();

const expandedText = (n) => expandedParts(n).map(fmt).join(' + ');

/** מספר "עם אפסים" - מבלבל במעבר בין מילים / פילוג לספרות */
const numberWithZeros = () => {
  const d = digitsOf(rnd(100000, 999999));
  const zeros = shuffle([0, 1, 2, 3, 4]).slice(0, rnd(1, 3));
  zeros.forEach(i => { d[i] = 0; });
  return Number(d.reverse().join(''));
};

/** מסיחים שנוצרים מהזזת ספרה למקום הלא נכון */
const placeSwaps = (n) => {
  const d = digitsOf(n);
  const out = [];
  for (let i = 0; i < d.length; i++) {
    for (let j = 0; j < d.length; j++) {
      if (i === j || d[i] === 0 || d[j] !== 0) continue;
      const copy = [...d];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      const v = Number(copy.reverse().join(''));
      if (v >= 1000 && v !== n) out.push(v);
    }
  }
  // גם "שוכחים את האפסים"
  out.push(Number(String(n).replace(/0/g, '')));
  return shuffle(out);
};

const placeValueQuestion = () => {
  const type = pick(['digitValue', 'digitValue', 'whichPlace', 'fromExpanded', 'toExpanded', 'fromPlaces', 'wordsToDigits', 'digitsToWords']);

  if (type === 'digitValue') {
    const n = distinctDigitsNumber(6);
    const place = rnd(0, 5);
    const digit = digitsOf(n)[place];
    if (digit === 0) return placeValueQuestion();
    const value = digit * PLACES[place].value;
    return {
      kind: 'mc',
      label: 'ערך הספרה',
      prompt: `מה הערך של הספרה ${digit} במספר?`,
      expr: fmt(n),
      options: withDistractors(fmt(value), shuffle(PLACES.map(p => fmt(digit * p.value)))),
      answer: fmt(value),
      explanation: `הספרה ${digit} נמצאת במקום ה${PLACES[place].name}.\nלכן הערך שלה הוא ${digit} × ${fmt(PLACES[place].value)} = ${fmt(value)}`
    };
  }

  if (type === 'whichPlace') {
    const n = distinctDigitsNumber(6);
    const place = rnd(0, 5);
    const digit = digitsOf(n)[place];
    return {
      kind: 'mc',
      label: 'מקום הספרה',
      prompt: `באיזה מקום נמצאת הספרה ${digit}?`,
      expr: fmt(n),
      options: withDistractors(PLACES[place].name, shuffle(PLACES.map(p => p.name))),
      answer: PLACES[place].name,
      optionsHebrew: true,
      explanation: `סופרים מימין לשמאל: יחידות, עשרות, מאות, אלפים, עשרות אלפים, מאות אלפים.\nהספרה ${digit} נמצאת במקום ה${PLACES[place].name}.`
    };
  }

  if (type === 'fromExpanded') {
    const n = numberWithZeros();
    return {
      kind: 'mc',
      label: 'פילוג',
      prompt: 'איזה מספר מתאים לפילוג?',
      expr: expandedText(n),
      options: withDistractors(fmt(n), placeSwaps(n).map(fmt)),
      answer: fmt(n),
      explanation: `כותבים כל חלק במקום שלו, ובמקומות שחסרים - 0.\n${expandedText(n)} = ${fmt(n)}`
    };
  }

  if (type === 'toExpanded') {
    const n = numberWithZeros();
    const wrong = placeSwaps(n).map(expandedText);
    return {
      kind: 'mc',
      label: 'פילוג',
      prompt: 'מה הפילוג של המספר?',
      expr: fmt(n),
      options: withDistractors(expandedText(n), wrong),
      answer: expandedText(n),
      explanation: `מפרקים לפי ערך כל ספרה (ומדלגים על האפסים):\n${fmt(n)} = ${expandedText(n)}`
    };
  }

  if (type === 'fromPlaces') {
    const n = numberWithZeros();
    const d = digitsOf(n);
    const parts = d
      .map((digit, i) => ({ digit, i }))
      .filter(p => p.digit > 0)
      .reverse()
      .map(p => `${p.digit} ${PLACES[p.i].name}`);
    return {
      kind: 'input',
      label: 'טבלת מקומות',
      prompt: `כתבי את המספר בספרות: ${parts.join(', ')}`,
      answer: String(n),
      explanation: `${parts.join(' + ')}\nבפילוג: ${expandedText(n)} = ${fmt(n)}`
    };
  }

  if (type === 'wordsToDigits') {
    const n = numberWithZeros();
    return {
      kind: 'mc',
      label: 'מילים ← ספרות',
      prompt: `איך כותבים בספרות: "${numberToHebrew(n)}"?`,
      options: withDistractors(fmt(n), placeSwaps(n).map(fmt)),
      answer: fmt(n),
      explanation: `${numberToHebrew(n)}\nבפילוג: ${expandedText(n)} = ${fmt(n)}`
    };
  }

  // digitsToWords
  const n = numberWithZeros();
  return {
    kind: 'mc',
    label: 'ספרות ← מילים',
    prompt: 'איך קוראים את המספר?',
    expr: fmt(n),
    options: withDistractors(numberToHebrew(n), placeSwaps(n).filter(v => v <= 1000000).map(numberToHebrew)),
    answer: numberToHebrew(n),
    optionsHebrew: true,
    explanation: `${fmt(n)} = ${expandedText(n)}\nקוראים: ${numberToHebrew(n)}`
  };
};

// ======================================================================
// ישר המספרים
// ======================================================================
const STEPS = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000];

const numberLineQuestion = () => {
  const step = pick(STEPS.filter(s => s >= 10));
  const intervals = 10;
  const from = step * rnd(0, Math.floor(900000 / step / 10)) * (step >= 1000 ? 1 : 1);
  const start = Math.min(from, 1000000 - step * intervals);
  const arrow = rnd(1, intervals - 1);
  const value = start + arrow * step;
  const type = pick(['arrow', 'arrow', 'step', 'middle']);

  if (type === 'step') {
    const labels = { 0: fmt(start), [intervals]: fmt(start + step * intervals) };
    return {
      kind: 'mc',
      label: 'ישר המספרים',
      prompt: 'בכמה גדל המספר בכל קפיצה (בין שני קווים סמוכים)?',
      visual: { type: 'numberLine', ticks: intervals, labels },
      options: withDistractors(fmt(step), shuffle([step / 10, step * 10, step * 2, step / 2, step * 5].filter(Number.isInteger).map(fmt))),
      answer: fmt(step),
      explanation: `מ-${fmt(start)} עד ${fmt(start + step * intervals)} יש ${fmt(step * intervals)}.\nיש ${intervals} קפיצות, ולכן כל קפיצה היא ${fmt(step * intervals)} : ${intervals} = ${fmt(step)}`
    };
  }

  if (type === 'middle') {
    const a = start;
    const b = start + step * intervals;
    return {
      kind: 'input',
      label: 'ישר המספרים',
      prompt: `איזה מספר נמצא בדיוק באמצע בין ${fmt(a)} ל-${fmt(b)}?`,
      visual: { type: 'numberLine', ticks: intervals, labels: { 0: fmt(a), [intervals]: fmt(b) }, arrow: intervals / 2 },
      answer: String((a + b) / 2),
      explanation: `המרחק בין המספרים הוא ${fmt(b - a)}, וחצי ממנו ${fmt((b - a) / 2)}.\n${fmt(a)} + ${fmt((b - a) / 2)} = ${fmt((a + b) / 2)}`
    };
  }

  // arrow: מתויגים שני קווים (לא תמיד ההתחלה), החץ על קו אחר
  const known = pick([[0, intervals], [0, 5], [5, intervals], [0, 2]]);
  const labels = Object.fromEntries(known.map(i => [i, fmt(start + i * step)]));
  if (known.includes(arrow)) return numberLineQuestion();
  const wrong = [value + step, value - step, start + arrow * step * 10, start + arrow * (step / 10), value + step * 2]
    .filter(v => Number.isInteger(v) && v >= 0 && v <= 1000000);
  const stepFound = known[1] - known[0] === 1
    ? `כל קפיצה היא ${fmt(step)}.`
    : `בין ${fmt(start + known[0] * step)} ל-${fmt(start + known[1] * step)} יש ${known[1] - known[0]} קפיצות, ולכן כל קפיצה היא ${fmt(step)}.`;
  return {
    kind: 'mc',
    label: 'ישר המספרים',
    prompt: 'איזה מספר מסמן החץ?',
    visual: { type: 'numberLine', ticks: intervals, labels, arrow },
    options: withDistractors(fmt(value), shuffle(wrong).map(fmt)),
    answer: fmt(value),
    explanation: `${stepFound}\nהחץ נמצא ${arrow - known[0]} קפיצות אחרי ${fmt(start + known[0] * step)}: ${fmt(start + known[0] * step)} + ${arrow - known[0]} × ${fmt(step)} = ${fmt(value)}`
  };
};

// ======================================================================
// השוואה וסדרות
// ======================================================================
/** מספר קרוב: אותן ספרות, שתי ספרות מוחלפות */
const nearNumber = (n) => {
  const d = String(n).split('');
  const i = rnd(1, d.length - 1);
  const j = rnd(1, d.length - 1);
  [d[i], d[j]] = [d[j], d[i]];
  return Number(d.join(''));
};

const compareQuestion = () => {
  const type = pick(['compare', 'compare', 'biggest', 'smallest', 'nextInSequence', 'nextInSequence', 'sequenceRule', 'missingInSequence']);

  if (type === 'compare') {
    const a = rnd(10000, 999999);
    let b = Math.random() < 0.15 ? a : nearNumber(a);
    if (Math.random() < 0.3) b = Number(String(a).slice(0, -1)); // מספר עם פחות ספרות
    const answer = a > b ? '>' : a < b ? '<' : '=';
    return {
      kind: 'mc',
      label: 'השוואת מספרים',
      prompt: 'איזה סימן מתאים במקום הריבוע?',
      expr: `${fmt(a)} ⬜ ${fmt(b)}`,
      options: ['>', '<', '='],
      fixedOrder: true,
      answer,
      explanation: String(a).length !== String(b).length
        ? `למספר עם יותר ספרות יש ערך גדול יותר.\n${fmt(a)} ${answer} ${fmt(b)}`
        : a === b
          ? `המספרים זהים.\n${fmt(a)} = ${fmt(b)}`
          : `משווים ספרה-ספרה משמאל (מהמקום הגדול), עד שמגיעים לספרה שונה.\n${fmt(a)} ${answer} ${fmt(b)}`
    };
  }

  if (type === 'biggest' || type === 'smallest') {
    const base = rnd(100000, 989999);
    const nums = new Set([base]);
    for (let tries = 0; nums.size < 4 && tries < 50; tries++) nums.add(nearNumber(base));
    while (nums.size < 4) nums.add(base + rnd(1, 9) * pick([10, 100, 1000, 10000]));
    const list = [...nums];
    const target = type === 'biggest' ? Math.max(...list) : Math.min(...list);
    return {
      kind: 'mc',
      label: 'השוואת מספרים',
      prompt: type === 'biggest' ? 'מהו המספר הגדול ביותר?' : 'מהו המספר הקטן ביותר?',
      options: shuffle(list.map(fmt)),
      answer: fmt(target),
      explanation: `לכל המספרים יש אותו מספר ספרות, ולכן משווים משמאל לימין עד שמוצאים ספרה שונה.\n${type === 'biggest' ? 'הגדול ביותר' : 'הקטן ביותר'}: ${fmt(target)}`
    };
  }

  // סדרות
  const rules = [
    { op: '+', step: pick([3, 4, 6, 7, 8, 9, 12, 15, 25, 50, 75, 125, 250, 500, 1000, 2500, 5000]) },
    { op: '-', step: pick([3, 4, 6, 7, 9, 11, 25, 50, 100, 250, 500, 1000]) },
    { op: '×', step: 2 }
  ];
  const rule = Math.random() < 0.15 ? rules[2] : pick(rules.slice(0, 2));
  let first = rule.op === '×' ? pick([1, 3, 5, 6, 7, 25]) : rnd(1, 50) * (rule.step >= 100 ? 100 : 1);
  if (rule.op === '-') first = rule.step * rnd(8, 20) + rnd(0, rule.step - 1);
  const items = [first];
  for (let i = 1; i < 6; i++) {
    const p = items[i - 1];
    items.push(rule.op === '+' ? p + rule.step : rule.op === '-' ? p - rule.step : p * 2);
  }
  const ruleText = `${rule.op}${fmt(rule.step)}`;

  if (type === 'sequenceRule') {
    const others = ['+', '-'].flatMap(op => [rule.step, rule.step * 2, Math.max(1, rule.step / 2), rule.step + 1].filter(Number.isInteger).map(s => `${op}${fmt(s)}`));
    return {
      kind: 'mc',
      label: 'סדרות',
      prompt: 'מהו כלל הסדרה?',
      visual: { type: 'sequence', items: items.slice(0, 5).map(fmt) },
      options: withDistractors(ruleText, shuffle([...others, '×2', '×10'])),
      answer: ruleText,
      explanation: `${fmt(items[0])} ← ${fmt(items[1])} ← ${fmt(items[2])}\nבכל צעד: ${ruleText}`
    };
  }

  if (type === 'missingInSequence') {
    const miss = rnd(1, 3);
    return {
      kind: 'input',
      label: 'סדרות',
      prompt: 'איזה מספר חסר בסדרה?',
      visual: { type: 'sequence', items: items.slice(0, 5).map((v, i) => (i === miss ? '?' : fmt(v))) },
      answer: String(items[miss]),
      explanation: `כלל הסדרה: ${ruleText}\n${fmt(items[miss - 1])} ${rule.op} ${fmt(rule.step)} = ${fmt(items[miss])}`
    };
  }

  return {
    kind: 'input',
    label: 'סדרות',
    prompt: 'מהו המספר הבא בסדרה?',
    visual: { type: 'sequence', items: [...items.slice(0, 5).map(fmt), '?'] },
    answer: String(items[5]),
    explanation: `כלל הסדרה: ${ruleText}\n${fmt(items[4])} ${rule.op} ${fmt(rule.step)} = ${fmt(items[5])}`
  };
};

// ======================================================================
// ארבע פעולות החשבון
// ======================================================================
const multiplyExplanation = (a, b) => {
  if (b < 10) {
    const parts = expandedParts(a);
    if (parts.length < 2) return `${fmt(a)} × ${b} = ${fmt(a * b)}`;
    return `מפרקים את ${fmt(a)} ומכפילים כל חלק ב-${b}:\n${parts.map(p => `${fmt(p)} × ${b} = ${fmt(p * b)}`).join('\n')}\nמחברים: ${parts.map(p => fmt(p * b)).join(' + ')} = ${fmt(a * b)}`;
  }
  const tens = Math.floor(b / 10) * 10;
  const ones = b % 10;
  if (!ones) return `${fmt(a)} × ${b} = ${fmt(a)} × ${b / 10} × 10 = ${fmt(a * (b / 10))} × 10 = ${fmt(a * b)}`;
  return `מפרקים את ${b} ל-${tens} + ${ones}:\n${fmt(a)} × ${tens} = ${fmt(a * tens)}\n${fmt(a)} × ${ones} = ${fmt(a * ones)}\n${fmt(a * tens)} + ${fmt(a * ones)} = ${fmt(a * b)}`;
};

const operationsQuestion = () => {
  const type = pick(['add', 'sub', 'mul1', 'mul2', 'mul10', 'div', 'div', 'divRemainder']);

  if (type === 'add') {
    const a = rnd(1000, 600000);
    const b = rnd(1000, Math.min(399999, 999999 - a));
    return {
      kind: 'input',
      label: 'חיבור',
      prompt: 'חשבי:',
      expr: `${fmt(a)} + ${fmt(b)} = ?`,
      answer: String(a + b),
      explanation: `מחברים במאונך: יחידות עם יחידות, עשרות עם עשרות... ולא שוכחים את ה"נשא".\n${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}`
    };
  }

  if (type === 'sub') {
    const a = rnd(10000, 999999);
    // הרבה פעמים - עם אפסים באמצע (פריטה!)
    const top = Math.random() < 0.4 ? Number(String(a).replace(/\d(?=\d{2}$)/, '0').replace(/\d(?=\d{3}$)/, '0')) : a;
    const b = rnd(1000, top - 1);
    return {
      kind: 'input',
      label: 'חיסור',
      prompt: 'חשבי:',
      expr: `${fmt(top)} - ${fmt(b)} = ?`,
      answer: String(top - b),
      explanation: `מחסרים במאונך מימין לשמאל. כשהספרה למעלה קטנה יותר - פורטים מהמקום שמשמאל.\nבדיקה בחיבור: ${fmt(top - b)} + ${fmt(b)} = ${fmt(top)}`
    };
  }

  if (type === 'mul1' || type === 'mul2') {
    const a = type === 'mul1' ? rnd(105, 9999) : rnd(12, 450);
    const b = type === 'mul1' ? rnd(3, 9) : rnd(12, 48);
    return {
      kind: 'input',
      label: 'כפל',
      prompt: 'חשבי:',
      expr: `${fmt(a)} × ${b} = ?`,
      answer: String(a * b),
      explanation: multiplyExplanation(a, b)
    };
  }

  if (type === 'mul10') {
    const a = rnd(3, 999);
    const b = pick([10, 100, 1000]);
    if (a * b > 1000000) return operationsQuestion();
    const zeros = String(b).length - 1;
    return {
      kind: 'input',
      label: 'כפל ב-10, 100, 1000',
      prompt: 'חשבי:',
      expr: `${fmt(a)} × ${fmt(b)} = ?`,
      answer: String(a * b),
      explanation: `כופלים ב-${fmt(b)}? מוסיפים ${zeros === 1 ? 'אפס אחד' : `${zeros} אפסים`} בסוף המספר.\n${fmt(a)} × ${fmt(b)} = ${fmt(a * b)}`
    };
  }

  if (type === 'div') {
    const b = rnd(2, 9);
    const q = rnd(12, 1500);
    const a = b * q;
    return {
      kind: 'input',
      label: 'חילוק',
      prompt: 'חשבי:',
      expr: `${fmt(a)} : ${b} = ?`,
      answer: String(q),
      explanation: `מחלקים בחילוק ארוך משמאל לימין.\nבדיקה בכפל: ${fmt(q)} × ${b} = ${fmt(a)}`
    };
  }

  // divRemainder
  const b = rnd(3, 9);
  const q = rnd(11, 150);
  const r = rnd(1, b - 1);
  const a = b * q + r;
  const answer = `${q} ושארית ${r}`;
  return {
    kind: 'mc',
    label: 'חילוק עם שארית',
    prompt: 'חשבי:',
    expr: `${fmt(a)} : ${b} = ?`,
    options: withDistractors(answer, shuffle([`${q + 1} ושארית ${r}`, `${q} ושארית ${(r + 1) % b || b - 1}`, `${q - 1} ושארית ${r + b}`, `${q} ושארית ${b}`])),
    answer,
    optionsHebrew: true,
    explanation: `${b} × ${q} = ${fmt(b * q)}, ונשאר ${fmt(a)} - ${fmt(b * q)} = ${r}.\nהשארית תמיד קטנה מהמחלק (${b}).`
  };
};

// ======================================================================
// סדר פעולות חשבון
// ======================================================================
const ORDER_TEMPLATES = [
  () => { const a = rnd(2, 40), b = rnd(2, 9), c = rnd(2, 9); return { expr: `${a} + ${b} × ${c}`, value: a + b * c, steps: [`קודם כפל: ${b} × ${c} = ${b * c}`, `אחר כך חיבור: ${a} + ${b * c} = ${a + b * c}`] }; },
  () => { const a = rnd(3, 12), b = rnd(3, 9), c = rnd(1, a * b - 1); return { expr: `${a} × ${b} - ${c}`, value: a * b - c, steps: [`קודם כפל: ${a} × ${b} = ${a * b}`, `אחר כך חיסור: ${a * b} - ${c} = ${a * b - c}`] }; },
  () => { const a = rnd(2, 15), b = rnd(2, 15), c = rnd(2, 9); return { expr: `(${a} + ${b}) × ${c}`, value: (a + b) * c, steps: [`קודם סוגריים: ${a} + ${b} = ${a + b}`, `אחר כך כפל: ${a + b} × ${c} = ${(a + b) * c}`] }; },
  () => { const c = rnd(2, 9), q = rnd(2, 12), b = c * q, a = rnd(q + 1, q + 60); return { expr: `${a} - ${b} : ${c}`, value: a - q, steps: [`קודם חילוק: ${b} : ${c} = ${q}`, `אחר כך חיסור: ${a} - ${q} = ${a - q}`] }; },
  () => { const a = rnd(2, 9), c = rnd(1, 20), b = c + rnd(1, 12); return { expr: `${a} × (${b} - ${c})`, value: a * (b - c), steps: [`קודם סוגריים: ${b} - ${c} = ${b - c}`, `אחר כך כפל: ${a} × ${b - c} = ${a * (b - c)}`] }; },
  () => { const c = rnd(2, 9), q = rnd(2, 12), b = rnd(1, 30), a = c * q + b; return { expr: `(${a} - ${b}) : ${c}`, value: q, steps: [`קודם סוגריים: ${a} - ${b} = ${a - b}`, `אחר כך חילוק: ${a - b} : ${c} = ${q}`] }; },
  () => { const a = rnd(10, 60), b = rnd(2, 9), c = rnd(2, 9), d = rnd(1, a + b * c - 1); const p = b * c; return { expr: `${a} + ${b} × ${c} - ${d}`, value: a + p - d, steps: [`קודם כפל: ${b} × ${c} = ${p}`, `אחר כך משמאל לימין: ${a} + ${p} = ${a + p}`, `${a + p} - ${d} = ${a + p - d}`] }; },
  () => { const a = rnd(2, 9), b = rnd(2, 9), c = rnd(2, 9), d = rnd(2, 9); return { expr: `${a} × ${b} + ${c} × ${d}`, value: a * b + c * d, steps: [`קודם שני הכפלים: ${a} × ${b} = ${a * b}, ${c} × ${d} = ${c * d}`, `אחר כך חיבור: ${a * b} + ${c * d} = ${a * b + c * d}`] }; },
  () => { const b = rnd(2, 9), q = rnd(2, 10), a = b * q, c = rnd(2, 9), d = rnd(2, 9); return { expr: `${a} : ${b} + ${c} × ${d}`, value: q + c * d, steps: [`קודם חילוק וכפל: ${a} : ${b} = ${q}, ${c} × ${d} = ${c * d}`, `אחר כך חיבור: ${q} + ${c * d} = ${q + c * d}`] }; },
  () => { const b = rnd(5, 40), c = rnd(5, 40), a = b + c + rnd(1, 60); return { expr: `${a} - (${b} + ${c})`, value: a - b - c, steps: [`קודם סוגריים: ${b} + ${c} = ${b + c}`, `אחר כך חיסור: ${a} - ${b + c} = ${a - b - c}`] }; },
  () => { const c = rnd(2, 9), q = rnd(2, 12), b = c * q, a = rnd(5, 80); return { expr: `${a} + ${b} : ${c}`, value: a + q, steps: [`קודם חילוק: ${b} : ${c} = ${q}`, `אחר כך חיבור: ${a} + ${q} = ${a + q}`] }; },
  () => { const a = rnd(20, 90), b = rnd(2, a - 10), c = rnd(1, a - b); return { expr: `${a} - ${b} - ${c}`, value: a - b - c, steps: ['רק חיבור וחיסור? פותרים משמאל לימין:', `${a} - ${b} = ${a - b}`, `${a - b} - ${c} = ${a - b - c}`] }; }
];

const orderOpsQuestion = () => {
  if (Math.random() < 0.25) {
    // איפה לשים סוגריים?
    const a = rnd(2, 9), b = rnd(2, 9), c = rnd(2, 9);
    const target = (a + b) * c;
    const plain = a + b * c;
    if (target === plain) return orderOpsQuestion();
    const answer = `(${a} + ${b}) × ${c}`;
    return {
      kind: 'mc',
      label: 'איפה הסוגריים?',
      prompt: `באיזה תרגיל התוצאה היא ${target}?`,
      options: shuffle([answer, `${a} + (${b} × ${c})`, `${a} + ${b} × ${c}`]),
      answer,
      explanation: `${a} + ${b} × ${c} = ${a} + ${b * c} = ${plain} (כפל לפני חיבור)\nכדי לחבר קודם - שמים סוגריים: (${a} + ${b}) × ${c} = ${a + b} × ${c} = ${target}`
    };
  }
  const t = pick(ORDER_TEMPLATES)();
  return {
    kind: 'input',
    label: 'סדר פעולות',
    prompt: 'חשבי לפי סדר פעולות החשבון:',
    expr: `${t.expr} = ?`,
    answer: String(t.value),
    explanation: t.steps.join('\n')
  };
};

// ======================================================================
// משוואות עם נעלם
// ======================================================================
const equationsQuestion = () => {
  const type = pick(['x+a', 'a+x', 'x-a', 'a-x', 'x*a', 'x:a', 'a:x', 'big+', 'twoStep']);
  let expr;
  let x;
  let explanation;
  if (type === 'x+a' || type === 'a+x' || type === 'big+') {
    const big = type === 'big+';
    x = big ? rnd(1000, 90000) : rnd(5, 400);
    const a = big ? rnd(1000, 90000) : rnd(5, 400);
    expr = type === 'a+x' ? `${fmt(a)} + □ = ${fmt(a + x)}` : `□ + ${fmt(a)} = ${fmt(a + x)}`;
    explanation = `חסר מחובר? מחסרים: ${fmt(a + x)} - ${fmt(a)} = ${fmt(x)}\nבדיקה: ${fmt(x)} + ${fmt(a)} = ${fmt(a + x)} ✓`;
  } else if (type === 'x-a') {
    const a = rnd(5, 500);
    x = a + rnd(5, 500);
    expr = `□ - ${fmt(a)} = ${fmt(x - a)}`;
    explanation = `חסר המספר שממנו מחסרים? מחברים: ${fmt(x - a)} + ${fmt(a)} = ${fmt(x)}\nבדיקה: ${fmt(x)} - ${fmt(a)} = ${fmt(x - a)} ✓`;
  } else if (type === 'a-x') {
    x = rnd(5, 400);
    const a = x + rnd(5, 500);
    expr = `${fmt(a)} - □ = ${fmt(a - x)}`;
    explanation = `כמה הורידו? ${fmt(a)} - ${fmt(a - x)} = ${fmt(x)}\nבדיקה: ${fmt(a)} - ${fmt(x)} = ${fmt(a - x)} ✓`;
  } else if (type === 'x*a') {
    x = rnd(2, 12);
    const a = rnd(2, 12) * (Math.random() < 0.3 ? 10 : 1);
    expr = Math.random() < 0.5 ? `□ × ${a} = ${a * x}` : `${a} × □ = ${a * x}`;
    explanation = `חסר גורם בכפל? מחלקים: ${a * x} : ${a} = ${x}\nבדיקה: ${x} × ${a} = ${a * x} ✓`;
  } else if (type === 'x:a') {
    const a = rnd(2, 9);
    const q = rnd(2, 30);
    x = a * q;
    expr = `□ : ${a} = ${q}`;
    explanation = `חסר המחולק? כופלים: ${q} × ${a} = ${x}\nבדיקה: ${x} : ${a} = ${q} ✓`;
  } else if (type === 'a:x') {
    x = rnd(2, 9);
    const q = rnd(2, 15);
    expr = `${x * q} : □ = ${q}`;
    explanation = `חסר המחלק? מחלקים: ${x * q} : ${q} = ${x}\nבדיקה: ${x * q} : ${x} = ${q} ✓`;
  } else {
    const a = rnd(2, 9);
    const b = rnd(1, 30);
    x = rnd(2, 12);
    expr = `${a} × □ + ${b} = ${a * x + b}`;
    explanation = `קודם מורידים את ה-${b}: ${a * x + b} - ${b} = ${a * x}\nעכשיו ${a} × □ = ${a * x}, ולכן □ = ${a * x} : ${a} = ${x}`;
  }
  return {
    kind: 'input',
    label: 'משוואה',
    prompt: 'איזה מספר מסתתר בריבוע?',
    expr,
    answer: String(x),
    explanation
  };
};

// ======================================================================
// שאלות מילוליות
// ======================================================================
const WORD_PROBLEMS = [
  () => { const a = rnd(1200, 4800), b = rnd(150, 900), c = rnd(100, 700); return { text: `בספרייה היו ${fmt(a)} ספרים. הגיעו ${fmt(b)} ספרים חדשים, ו-${fmt(c)} ספרים הושאלו לקוראים. כמה ספרים נשארו בספרייה?`, value: a + b - c, unit: 'ספרים', steps: [`${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}`, `${fmt(a + b)} - ${fmt(c)} = ${fmt(a + b - c)}`] }; },
  () => { const s = pick([45, 48, 52, 55, 60]), n = rnd(4, 9), empty = rnd(3, 20); return { text: `לטיול השכבתי יצאו ${n} אוטובוסים, ובכל אוטובוס ${s} מקומות. ${empty} מקומות נשארו ריקים. כמה תלמידים יצאו לטיול?`, value: s * n - empty, unit: 'תלמידים', steps: [`${s} × ${n} = ${s * n} מקומות`, `${s * n} - ${empty} = ${s * n - empty}`] }; },
  () => { const g = rnd(4, 8), n = rnd(12, 40); return { text: `${g * n} תלמידים התחלקו לקבוצות של ${g} תלמידים בכל קבוצה. כמה קבוצות יש?`, value: n, unit: 'קבוצות', steps: [`${g * n} : ${g} = ${n}`] }; },
  () => { const p = rnd(6, 15), n = rnd(3, 8), pen = rnd(4, 12), paid = 100; if (p * n + pen >= paid) return null; const name = pick(NAMES_F); return { text: `${name} קנתה ${n} מחברות במחיר ${p} ₪ כל אחת, ועט ב-${pen} ₪. היא שילמה בשטר של ${paid} ₪. כמה עודף קיבלה?`, value: paid - p * n - pen, unit: '₪', steps: [`${n} × ${p} = ${n * p} ₪ על מחברות`, `${n * p} + ${pen} = ${n * p + pen} ₪ בסך הכול`, `${paid} - ${n * p + pen} = ${paid - n * p - pen} ₪ עודף`] }; },
  () => { const s = pick([15, 20, 25, 30, 35, 40]), w = rnd(4, 12), price = s * w + rnd(20, 200); const name = pick(NAMES_M); return { text: `${name} חוסך ${s} ₪ בכל שבוע. אחרי ${w} שבועות הוא רוצה לקנות אופניים שעולים ${price} ₪. כמה כסף עוד חסר לו?`, value: price - s * w, unit: '₪', steps: [`${s} × ${w} = ${s * w} ₪ חסך`, `${price} - ${s * w} = ${price - s * w} ₪ חסרים`] }; },
  () => { const perDay = rnd(1200, 4800), days = rnd(5, 9); return { text: `מפעל מייצר ${fmt(perDay)} בקבוקים ביום. כמה בקבוקים ייצר המפעל ב-${days} ימים?`, value: perDay * days, unit: 'בקבוקים', steps: [multiplyExplanation(perDay, days)] }; },
  () => { const total = rnd(200000, 600000), kids = rnd(50000, total - 50000); return { text: `בעיר גרים ${fmt(total)} תושבים. ${fmt(kids)} מהם ילדים. כמה מבוגרים גרים בעיר?`, value: total - kids, unit: 'מבוגרים', steps: [`${fmt(total)} - ${fmt(kids)} = ${fmt(total - kids)}`] }; },
  () => { const boxes = rnd(12, 40), broken = rnd(3, 15); return { text: `בכל תבנית יש 12 ביצים. בחנות יש ${boxes} תבניות. ${broken} ביצים נשברו. כמה ביצים שלמות נשארו?`, value: boxes * 12 - broken, unit: 'ביצים', steps: [`${boxes} × 12 = ${boxes * 12} ביצים`, `${boxes * 12} - ${broken} = ${boxes * 12 - broken}`] }; },
  () => { const f = rnd(3, 6), each = rnd(12, 30), give = rnd(2, 8); return { text: `${f} חברים חילקו ביניהם ${f * each} סוכריות שווה בשווה. כל אחד נתן ${give} סוכריות לאח הקטן שלו. כמה סוכריות נשארו לכל אחד?`, value: each - give, unit: 'סוכריות', steps: [`${f * each} : ${f} = ${each} סוכריות לכל אחד`, `${each} - ${give} = ${each - give}`] }; },
  () => { const y = rnd(12, 45), times = rnd(2, 4); const name = pick(NAMES_F), name2 = pick(NAMES_M); return { text: `ל${name2} יש ${y} מדבקות. ל${name} יש פי ${times} יותר מדבקות. כמה מדבקות יש לשניהם יחד?`, value: y + y * times, unit: 'מדבקות', steps: [`ל${name}: ${y} × ${times} = ${y * times}`, `יחד: ${y} + ${y * times} = ${y + y * times}`] }; },
  () => { const price = rnd(35, 65), n = rnd(2, 4), paid = 200; if (price * n >= paid) return null; return { text: `אמא קנתה ${n} חולצות במחיר ${price} ₪ כל אחת, ושילמה ב-${paid} ₪. כמה עודף קיבלה?`, value: paid - price * n, unit: '₪', steps: [`${n} × ${price} = ${n * price} ₪`, `${paid} - ${n * price} = ${paid - n * price} ₪`] }; },
  () => { const rows = rnd(12, 30), seats = rnd(15, 28), taken = rnd(50, rows * seats - 10); return { text: `באולם ${rows} שורות, ובכל שורה ${seats} כיסאות. ${taken} כיסאות כבר תפוסים. כמה כיסאות פנויים?`, value: rows * seats - taken, unit: 'כיסאות', steps: [`${rows} × ${seats} = ${rows * seats} כיסאות`, `${rows * seats} - ${taken} = ${rows * seats - taken}`] }; },
  () => { const a = rnd(120, 480), diff = rnd(30, 150); const n1 = pick(NAMES_F), n2 = pick(NAMES_M); return { text: `${n1} קראה ${a} עמודים. ${n2} קרא ${diff} עמודים פחות ממנה. כמה עמודים קראו שניהם יחד?`, value: a + a - diff, unit: 'עמודים', steps: [`${n2}: ${a} - ${diff} = ${a - diff}`, `יחד: ${a} + ${a - diff} = ${2 * a - diff}`] }; },
  () => { const km = rnd(120, 380), d = rnd(3, 7); return { text: `משאית נסעה ${km} ק"מ בכל יום, במשך ${d} ימים. כמה ק"מ נסעה בסך הכול?`, value: km * d, unit: 'ק"מ', steps: [`${km} × ${d} = ${fmt(km * d)}`] }; }
];

const wordProblemQuestion = () => {
  const t = pick(WORD_PROBLEMS)();
  if (!t || t.value <= 0) return wordProblemQuestion();
  return {
    kind: 'input',
    label: 'שאלה מילולית',
    prompt: t.text,
    answer: String(t.value),
    unit: t.unit,
    long: true,
    explanation: t.steps.join('\n')
  };
};

// ======================================================================
// משמעות השבר
// ======================================================================
const properFractionDistractors = (k, n) => [
  frac(n - k, n), frac(k, n + 1), frac(k + 1, n), frac(Math.max(1, k - 1), n), frac(k, n - k > 0 ? n - k : n + 2), frac(n, k)
];

const fractionMeaningQuestion = () => {
  const type = pick(['shaded', 'shaded', 'notShaded', 'pickPicture', 'ofQuantity', 'ofQuantity', 'unitOf', 'reverse', 'compare']);
  const n = pick([3, 4, 5, 6, 8, 10]);
  const k = rnd(1, n - 1);
  const shape = pick(['circle', 'bar', 'rect']);

  if (type === 'shaded' || type === 'notShaded') {
    const ans = type === 'shaded' ? frac(k, n) : frac(n - k, n);
    return {
      kind: 'mc',
      label: 'חלק משלם',
      prompt: type === 'shaded' ? 'איזה חלק מהשלם צבוע?' : 'איזה חלק מהשלם לא צבוע?',
      visual: { type: 'fraction', shape, parts: n, filled: k },
      options: withDistractors(ans, shuffle(properFractionDistractors(type === 'shaded' ? k : n - k, n))),
      answer: ans,
      explanation: `השלם מחולק ל-${n} חלקים שווים - זה המכנה.\n${type === 'shaded' ? `צבועים ${k}` : `לא צבועים ${n - k}`} חלקים - זה המונה. ולכן ${ans}`
    };
  }

  if (type === 'pickPicture') {
    const ans = frac(k, n);
    const opts = [
      { key: ans, v: { type: 'fraction', shape, parts: n, filled: k } },
      { key: frac(n - k, n), v: { type: 'fraction', shape, parts: n, filled: n - k } },
      { key: frac(k, n + 1), v: { type: 'fraction', shape, parts: n + 1, filled: k } },
      { key: frac(k, n + 2), v: { type: 'fraction', shape, parts: n + 2, filled: k } },
      { key: frac(Math.min(n - 1, k + 1), n), v: { type: 'fraction', shape, parts: n, filled: Math.min(n - 1, k + 1) } }
    ];
    const unique = [];
    opts.forEach(o => { if (!unique.some(u => u.key === o.key)) unique.push(o); });
    const chosen = shuffle(unique.slice(0, 4));
    return {
      kind: 'mc',
      label: 'חלק משלם',
      prompt: `באיזה ציור צבועים ${ans} מהשלם?`,
      options: chosen.map(o => o.key),
      optionVisuals: Object.fromEntries(chosen.map(o => [o.key, o.v])),
      answer: ans,
      explanation: `${ans}: השלם מחולק ל-${n} חלקים שווים, ו-${k} מהם צבועים.`
    };
  }

  if (type === 'ofQuantity') {
    const g = rnd(2, 6);
    const total = n * g;
    const emoji = pick(['🍎', '⭐', '🌸', '🎈', '🍪', '⚽', '🐟']);
    return {
      kind: 'input',
      label: 'חלק מכמות',
      prompt: `כמה הם ${frac(k, n)} מ-${total} ${emoji}?`,
      visual: total <= 40 ? { type: 'set', emoji, groups: n, perGroup: g, highlight: k } : undefined,
      answer: String(k * g),
      explanation: `מחלקים את ${total} ל-${n} קבוצות שוות: ${total} : ${n} = ${g} בכל קבוצה.\nלוקחים ${k} קבוצות: ${k} × ${g} = ${k * g}`
    };
  }

  if (type === 'unitOf') {
    const d = pick([2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const q = rnd(3, 15);
    return {
      kind: 'input',
      label: 'חלק מכמות',
      prompt: 'חשבי:',
      expr: `${frac(1, d)} מ-${d * q} = ?`,
      answer: String(q),
      explanation: `${frac(1, d)} מכמות = מחלקים את הכמות ל-${d} חלקים שווים.\n${d * q} : ${d} = ${q}`
    };
  }

  if (type === 'reverse') {
    const d = pick([2, 3, 4, 5, 6, 8]);
    const part = rnd(3, 12);
    return {
      kind: 'input',
      label: 'מהחלק לשלם',
      prompt: `${frac(1, d)} מהתלמידים בחוג הם ${part} תלמידים. כמה תלמידים יש בחוג?`,
      answer: String(part * d),
      unit: 'תלמידים',
      explanation: `${frac(1, d)} הוא חלק אחד מתוך ${d} חלקים שווים.\nאם בחלק אחד יש ${part}, בכל ${d} החלקים יש ${d} × ${part} = ${d * part}`
    };
  }

  // compare: אותו מכנה או אותו מונה
  if (Math.random() < 0.5) {
    const a = rnd(1, n - 1);
    let b = rnd(1, n - 1);
    if (a === b) b = a === n - 1 ? a - 1 : a + 1;
    const ans = a > b ? frac(a, n) : frac(b, n);
    return {
      kind: 'mc',
      label: 'השוואת שברים',
      prompt: 'איזה שבר גדול יותר?',
      options: [frac(a, n), frac(b, n)],
      answer: ans,
      explanation: `לשני השברים אותו מכנה (${n}) - החלקים באותו גודל.\nלכן הגדול הוא זה שיש בו יותר חלקים: ${ans}`
    };
  }
  const top = rnd(1, 3);
  const d1 = rnd(top + 1, 6);
  let d2 = rnd(top + 1, 10);
  if (d1 === d2) d2 = d1 + 2;
  const ans = d1 < d2 ? frac(top, d1) : frac(top, d2);
  return {
    kind: 'mc',
    label: 'השוואת שברים',
    prompt: 'איזה שבר גדול יותר?',
    options: [frac(top, d1), frac(top, d2)],
    visual: { type: 'fractionPair', a: { parts: d1, filled: top }, b: { parts: d2, filled: top } },
    answer: ans,
    explanation: `לשני השברים אותו מונה (${top}).\nככל שמחלקים ליותר חלקים - כל חלק קטן יותר. ולכן ${ans} גדול יותר.`
  };
};

// ======================================================================
// חיבור וחיסור שברים (מכנים זהים ושלמים)
// ======================================================================
/** תוצאה שלא צריך לצמצם - כדי שיהיה רק תשובה נכונה אחת */
const isReduced = (n, d) => n % d === 0 || gcd(n % d, d) === 1;

const fractionAddQuestion = () => {
  const d = pick([3, 4, 5, 6, 7, 8, 9, 10, 12]);
  const type = pick(['simpleAdd', 'simpleSub', 'mixedAdd', 'mixedAdd', 'mixedSub', 'wholeMinus', 'wholePlus']);
  let a;
  let b;
  let result;
  let expr;
  let steps;

  if (type === 'simpleAdd') {
    a = rnd(1, d - 1);
    b = rnd(1, d - 1);
    result = a + b;
    expr = `${frac(a, d)} + ${frac(b, d)}`;
    steps = [`המכנה נשאר ${d}, ומחברים את המונים: ${a} + ${b} = ${a + b}`, `${frac(a + b, d)}${a + b >= d ? ` = ${toMixed(a + b, d)}` : ''}`];
  } else if (type === 'simpleSub') {
    a = rnd(2, d - 1);
    b = rnd(1, a - 1);
    result = a - b;
    expr = `${frac(a, d)} - ${frac(b, d)}`;
    steps = [`המכנה נשאר ${d}, ומחסרים את המונים: ${a} - ${b} = ${a - b}`, `${frac(a - b, d)}`];
  } else if (type === 'mixedAdd') {
    const w1 = rnd(1, 5), w2 = rnd(1, 4);
    const n1 = rnd(1, d - 1), n2 = rnd(1, d - 1);
    result = (w1 + w2) * d + n1 + n2;
    expr = `${w1} ${frac(n1, d)} + ${w2} ${frac(n2, d)}`;
    steps = [`שלמים עם שלמים: ${w1} + ${w2} = ${w1 + w2}`, `שברים עם שברים: ${frac(n1, d)} + ${frac(n2, d)} = ${frac(n1 + n2, d)}`];
    if (n1 + n2 >= d) steps.push(`${frac(n1 + n2, d)} = ${toMixed(n1 + n2, d)}, ולכן מוסיפים עוד שלם: ${toMixed(result, d)}`);
    else steps.push(`ביחד: ${toMixed(result, d)}`);
  } else if (type === 'mixedSub') {
    const w1 = rnd(3, 7), w2 = rnd(1, w1 - 1);
    const n1 = rnd(1, d - 1), n2 = rnd(1, d - 1);
    const top = w1 * d + n1;
    const bottom = w2 * d + n2;
    if (top <= bottom) return fractionAddQuestion();
    result = top - bottom;
    expr = `${w1} ${frac(n1, d)} - ${w2} ${frac(n2, d)}`;
    steps = n1 >= n2
      ? [`שלמים: ${w1} - ${w2} = ${w1 - w2}`, `שברים: ${frac(n1, d)} - ${frac(n2, d)} = ${frac(n1 - n2, d)}`, `ביחד: ${toMixed(result, d)}`]
      : [`${frac(n1, d)} קטן מ-${frac(n2, d)}, ולכן "פורטים" שלם אחד: ${w1} ${frac(n1, d)} = ${w1 - 1} ${frac(n1 + d, d)}`, `שלמים: ${w1 - 1} - ${w2} = ${w1 - 1 - w2}`, `שברים: ${frac(n1 + d, d)} - ${frac(n2, d)} = ${frac(n1 + d - n2, d)}`, `ביחד: ${toMixed(result, d)}`];
  } else if (type === 'wholeMinus') {
    const w = rnd(1, 6);
    const n1 = rnd(1, d - 1);
    result = w * d - n1;
    expr = `${w} - ${frac(n1, d)}`;
    steps = [`פורטים שלם אחד ל-${frac(d, d)}: ${w} = ${w - 1 ? `${w - 1} ` : ''}${frac(d, d)}`, `${frac(d, d)} - ${frac(n1, d)} = ${frac(d - n1, d)}`, `ביחד: ${toMixed(result, d)}`];
  } else {
    const w = rnd(1, 6);
    const n1 = rnd(1, d - 1);
    result = w * d + n1;
    expr = `${w} + ${frac(n1, d)}`;
    steps = [`שלם ועוד שבר - פשוט כותבים אותם יחד:`, `${toMixed(result, d)}`];
  }
  if (!isReduced(result, d) || result <= 0) return fractionAddQuestion();

  const ans = toMixed(result, d);
  const wrong = [
    toMixed(result + d, d), toMixed(Math.max(1, result - d), d), toMixed(result + 1, d), toMixed(Math.max(1, result - 1), d),
    type === 'simpleAdd' ? frac(a + b, d * 2) : null
  ].filter(Boolean);
  return {
    kind: 'mc',
    label: type.startsWith('simple') ? 'שברים עם מכנה זהה' : 'מספרים מעורבים ושלמים',
    prompt: 'חשבי:',
    expr: `${expr} = ?`,
    options: withDistractors(ans, shuffle(wrong)),
    answer: ans,
    explanation: steps.join('\n')
  };
};

// ======================================================================
// שבר מדומה ומספר מעורב
// ======================================================================
const mixedQuestion = () => {
  const d = pick([2, 3, 4, 5, 6, 7, 8, 10]);
  const type = pick(['toMixed', 'toImproper', 'whichImproper', 'picture', 'howManyWholes', 'howManyParts', 'wholeAsFraction', 'compare']);

  if (type === 'toMixed') {
    const w = rnd(1, 5), r = rnd(1, d - 1);
    const n = w * d + r;
    const ans = toMixed(n, d);
    return {
      kind: 'mc',
      label: 'שבר מדומה ← מספר מעורב',
      prompt: 'איזה מספר מעורב שווה לשבר המדומה?',
      expr: frac(n, d),
      options: withDistractors(ans, shuffle([`${w + 1} ${frac(r, d)}`, `${w} ${frac(Math.min(d - 1, r + 1), d)}`, `${w - 1 || w + 2} ${frac(r, d)}`, `${r} ${frac(w, d)}`])),
      answer: ans,
      explanation: `כמה פעמים ${d} נכנס ב-${n}? ${n} : ${d} = ${w} ושארית ${r}.\n${w} שלמים, ונשארו ${frac(r, d)} ← ${ans}`
    };
  }

  if (type === 'toImproper') {
    const w = rnd(1, 5), r = rnd(1, d - 1);
    const n = w * d + r;
    const ans = frac(n, d);
    return {
      kind: 'mc',
      label: 'מספר מעורב ← שבר מדומה',
      prompt: 'איזה שבר מדומה שווה למספר המעורב?',
      expr: `${w} ${frac(r, d)}`,
      options: withDistractors(ans, shuffle([frac(w * r + d, d), frac(w + r, d), frac(n + d, d), frac(n - 1, d), frac(w * d, d)])),
      answer: ans,
      explanation: `בכל שלם יש ${d} חלקים: ${w} × ${d} = ${w * d}\nמוסיפים את ה-${r}: ${w * d} + ${r} = ${n} ← ${ans}`
    };
  }

  if (type === 'whichImproper') {
    const imp = frac(d + rnd(1, d), d);
    const proper = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9].filter(x => x < d)).slice(0, 3).map(x => frac(x, d));
    if (proper.length < 3) return mixedQuestion();
    return {
      kind: 'mc',
      label: 'מהו שבר מדומה?',
      prompt: 'איזה מהשברים הוא שבר מדומה?',
      options: shuffle([imp, ...proper]),
      answer: imp,
      explanation: `שבר מדומה: המונה (למעלה) גדול מהמכנה או שווה לו - כלומר שווה לשלם או יותר.\n${imp} הוא שבר מדומה.`
    };
  }

  if (type === 'picture') {
    const pd = pick([2, 3, 4, 6]);
    const w = rnd(1, 3), r = rnd(1, pd - 1);
    const n = w * pd + r;
    const ans = toMixed(n, pd);
    return {
      kind: 'mc',
      label: 'מספר מעורב בציור',
      prompt: 'איזה מספר מתאים לחלק הצבוע?',
      visual: { type: 'fraction', shape: 'circle', parts: pd, filled: n },
      options: withDistractors(ans, shuffle([toMixed(n + pd, pd), `${w} ${frac(pd - r, pd)}`, frac(r, pd), toMixed(n + 1, pd), `${r} ${frac(w, pd)}`])),
      answer: ans,
      explanation: `${w === 1 ? 'עיגול אחד צבוע כולו = שלם אחד' : `${w} עיגולים צבועים כולם = ${w} שלמים`}.\nבעיגול האחרון צבועים ${r} חלקים מתוך ${pd} = ${frac(r, pd)}. ולכן ${ans}`
    };
  }

  if (type === 'howManyWholes') {
    const w = rnd(2, 9), r = rnd(1, d - 1);
    const n = w * d + r;
    return {
      kind: 'input',
      label: 'שלמים בשבר מדומה',
      prompt: `כמה שלמים שלמים יש ב-${frac(n, d)}?`,
      answer: String(w),
      explanation: `${n} : ${d} = ${w} ושארית ${r}\nולכן ${frac(n, d)} = ${w} ${frac(r, d)} - יש ${w} שלמים.`
    };
  }

  if (type === 'howManyParts') {
    const w = rnd(1, 5), r = rnd(1, d - 1);
    const unit = { 2: 'חצאים', 3: 'שלישים', 4: 'רבעים', 5: 'חמישיות', 6: 'שישיות', 7: 'שביעיות', 8: 'שמיניות', 10: 'עשיריות' }[d];
    return {
      kind: 'input',
      label: 'כמה חלקים?',
      prompt: `כמה ${unit} יש ב-${w} ${frac(r, d)}?`,
      answer: String(w * d + r),
      explanation: `בכל שלם יש ${d} ${unit}: ${w} × ${d} = ${w * d}\nועוד ${r}: ${w * d} + ${r} = ${w * d + r}`
    };
  }

  if (type === 'wholeAsFraction') {
    const w = rnd(2, 6);
    return {
      kind: 'input',
      label: 'שלם כשבר',
      prompt: 'איזה מספר חסר בריבוע (המונה)?',
      expr: `${w} = □/${d}`,
      answer: String(w * d),
      explanation: `בכל שלם יש ${d} חלקים.\n${w} × ${d} = ${w * d}, ולכן ${w} = ${frac(w * d, d)}`
    };
  }

  // compare: שבר מדומה מול מספר מעורב
  const w = rnd(1, 4), r = rnd(1, d - 1);
  const mixedN = w * d + r;
  const impN = mixedN + pick([-1, 0, 1]);
  const answer = impN > mixedN ? '>' : impN < mixedN ? '<' : '=';
  return {
    kind: 'mc',
    label: 'השוואה',
    prompt: 'איזה סימן מתאים במקום הריבוע?',
    expr: `${frac(impN, d)} ⬜ ${w} ${frac(r, d)}`,
    options: ['>', '<', '='],
    fixedOrder: true,
    answer,
    explanation: `הופכים את המספר המעורב לשבר: ${w} ${frac(r, d)} = ${frac(mixedN, d)}\nמשווים: ${frac(impN, d)} ${answer} ${frac(mixedN, d)}`
  };
};

// ======================================================================
// שאלות מילוליות בשברים
// ======================================================================
const FRACTION_WORDS = [
  () => { const n = pick([6, 8, 10, 12]), a = rnd(1, n / 2 - 1), b = rnd(1, n / 2 - 1); const f = pick(NAMES_F), m = pick(NAMES_M); const ans = frac(a + b, n); return { kind: 'mc', text: `פיצה חולקה ל-${n} משולשים שווים. ${f} אכלה ${a} משולשים ו${m} אכל ${b}. איזה חלק מהפיצה נאכל?`, answer: ans, options: withDistractors(ans, shuffle([frac(n - a - b, n), frac(a + b, n * 2), frac(a, n), frac(b, n), frac(a + b + 1, n)])), steps: [`כל משולש הוא ${frac(1, n)} מהפיצה.`, `נאכלו ${a} + ${b} = ${a + b} משולשים ← ${ans}`] }; },
  () => { const n = pick([6, 8, 10, 12]), a = rnd(2, n - 2); const ans = frac(n - a, n); return { kind: 'mc', text: `עוגה חולקה ל-${n} חתיכות שוות. בארוחת ערב אכלו ${a} חתיכות. איזה חלק מהעוגה נשאר?`, answer: ans, options: withDistractors(ans, shuffle([frac(a, n), frac(n - a, a), frac(n - a + 1, n), frac(n - a - 1 || n - a + 2, n)])), steps: [`כל העוגה = ${frac(n, n)}`, `${frac(n, n)} - ${frac(a, n)} = ${ans}`] }; },
  () => { const d = pick([3, 4, 5, 6, 8]), k = rnd(1, d - 1), g = rnd(3, 6), total = d * g; return { kind: 'input', text: `בכיתה ${total} תלמידים. ${frac(k, d)} מהם הגיעו לבית הספר באופניים. כמה תלמידים הגיעו באופניים?`, value: k * g, unit: 'תלמידים', steps: [`${frac(1, d)} מ-${total}: ${total} : ${d} = ${g}`, `${frac(k, d)}: ${k} × ${g} = ${k * g}`] }; },
  () => { const d = pick([4, 5, 10]), g = pick([5, 8, 10, 12]), total = d * g, k = 1; const m = pick(NAMES_M); return { kind: 'input', text: `ל${m} היו ${total} ₪. הוא הוציא ${frac(k, d)} מהכסף על ממתקים. כמה כסף נשאר לו?`, value: total - g, unit: '₪', steps: [`${frac(1, d)} מ-${total}: ${total} : ${d} = ${g} ₪ הוציא`, `${total} - ${g} = ${total - g} ₪ נשאר`] }; },
  () => { const d = pick([3, 4, 5, 6, 8]), w1 = rnd(1, 3), w2 = rnd(1, 3), n1 = rnd(1, d - 1), n2 = rnd(1, d - 1); const total = (w1 + w2) * d + n1 + n2; if (!isReduced(total, d)) return null; const f = pick(NAMES_F); const ans = toMixed(total, d); return { kind: 'mc', text: `${f} הלכה ${w1} ${frac(n1, d)} ק"מ בבוקר ו-${w2} ${frac(n2, d)} ק"מ בערב. כמה ק"מ הלכה בסך הכול?`, answer: ans, options: withDistractors(ans, shuffle([toMixed(total - d, d), toMixed(total + 1, d), toMixed(total - 1, d), `${w1 + w2} ${frac(n1 + n2, d * 2)}`])), steps: [`שלמים: ${w1} + ${w2} = ${w1 + w2}`, `שברים: ${frac(n1, d)} + ${frac(n2, d)} = ${toMixed(n1 + n2, d)}`, `ביחד: ${ans}`] }; },
  () => { const d = pick([3, 4, 5, 8]), w = rnd(2, 5), dw = rnd(1, w - 1), n = rnd(1, d - 1); const left = w * d - (dw * d + n); if (!isReduced(left, d)) return null; const ans = toMixed(left, d); return { kind: 'mc', text: `בבקבוק היו ${w} ליטרים של מיץ. שתו ${dw} ${frac(n, d)} ליטרים. כמה ליטרים נשארו?`, answer: ans, options: withDistractors(ans, shuffle([toMixed(left + d, d), toMixed(left + 1, d), `${w - dw} ${frac(n, d)}`, toMixed(Math.max(1, left - 1), d)])), steps: [`פורטים שלם: ${w} = ${w - 1} ${frac(d, d)}`, `${w - 1} ${frac(d, d)} - ${dw} ${frac(n, d)} = ${ans}`] }; },
  () => { const d = pick([3, 4, 5, 6]), part = rnd(3, 9); return { kind: 'input', text: `${frac(1, d)} מהעוגיות בצנצנת הן ${part} עוגיות. כמה עוגיות יש בצנצנת?`, value: part * d, unit: 'עוגיות', steps: [`בחלק אחד מתוך ${d} יש ${part}.`, `${d} × ${part} = ${d * part}`] }; },
  () => { const d = pick([5, 7, 8, 9]), a = rnd(1, d - 1); let b = rnd(1, d - 1); if (a === b) b = a === 1 ? 2 : a - 1; const f = pick(NAMES_F), m = pick(NAMES_M); const ans = a > b ? f : m; return { kind: 'mc', text: `${f} קראה ${frac(a, d)} מהספר, ו${m} קרא ${frac(b, d)} מאותו ספר. מי קרא יותר?`, answer: ans, options: [f, m], hebrew: true, steps: [`אותו מכנה (${d}) - משווים את המונים: ${a} ו-${b}.`, `${ans} קרא/ה יותר.`] }; }
];

const fractionWordsQuestion = () => {
  const t = pick(FRACTION_WORDS)();
  if (!t) return fractionWordsQuestion();
  return {
    kind: t.kind,
    label: 'שאלה מילולית בשברים',
    prompt: t.text,
    options: t.options,
    optionsHebrew: t.hebrew,
    answer: t.kind === 'input' ? String(t.value) : t.answer,
    unit: t.unit,
    long: true,
    explanation: t.steps.join('\n')
  };
};

// ======================================================================
// גאומטריה: צלעות במצולעים
// ======================================================================
// קודקודים בתוך ריבוע 100×100 (y גדל למטה). הצורות מדויקות - כדי שהציור יתאים לתשובה.
export const SHAPES = {
  rectangle: { name: 'מלבן', points: [[10, 20], [90, 20], [90, 75], [10, 75]] },
  square: { name: 'ריבוע', points: [[20, 12], [80, 12], [80, 72], [20, 72]] },
  parallelogram: { name: 'מקבילית', points: [[28, 20], [95, 20], [72, 75], [5, 75]] },
  trapezoid: { name: 'טרפז', points: [[30, 20], [70, 20], [95, 75], [5, 75]] },
  rightTrapezoid: { name: 'טרפז ישר-זווית', points: [[10, 20], [60, 20], [92, 75], [10, 75]] },
  rhombus: { name: 'מעוין', points: [[50, 5], [82, 42], [50, 79], [18, 42]] },
  quadrilateral: { name: 'מרובע', points: [[39, 45], [84, 8], [79, 64], [18, 82]] },
  rightTriangle: { name: 'משולש ישר-זווית', points: [[15, 12], [15, 80], [88, 80]] },
  hexagon: { name: 'משושה', points: [[30, 8], [70, 8], [92, 45], [70, 82], [30, 82], [8, 45]] }
};
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

const sideName = (shape, i) => `${LETTERS[i]}${LETTERS[(i + 1) % shape.points.length]}`;
const vec = (shape, i) => {
  const p = shape.points;
  const a = p[i];
  const b = p[(i + 1) % p.length];
  return [b[0] - a[0], b[1] - a[1]];
};
// אחרי עיגול הקודקודים - סובלנות קטנה
const angleBetween = (u, v) => {
  const dot = u[0] * v[0] + u[1] * v[1];
  const cos = dot / (Math.hypot(...u) * Math.hypot(...v));
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
};
export const sidesParallel = (shape, i, j) => {
  const a = angleBetween(vec(shape, i), vec(shape, j));
  return a < 3 || a > 177;
};
export const sidesPerpendicular = (shape, i, j) => Math.abs(angleBetween(vec(shape, i), vec(shape, j)) - 90) < 3;
export const sidesAdjacent = (shape, i, j) => {
  const n = shape.points.length;
  return i !== j && ((i + 1) % n === j || (j + 1) % n === i);
};
/** במרובע - הצלע שאין לה קודקוד משותף; במשושה - הצלע שמול */
export const sidesOpposite = (shape, i, j) => {
  const n = shape.points.length;
  return (n === 4 || n === 6) && (j - i + n) % n === n / 2;
};
export const countParallelPairs = (shape) => {
  const n = shape.points.length;
  let c = 0;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (sidesParallel(shape, i, j)) c++;
  return c;
};
export const countRightAngles = (shape) => {
  const n = shape.points.length;
  let c = 0;
  for (let i = 0; i < n; i++) if (sidesPerpendicular(shape, i, (i + 1) % n)) c++;
  return c;
};

const polygonVisual = (key, highlight = []) => ({ type: 'polygon', points: SHAPES[key].points, labels: LETTERS.slice(0, SHAPES[key].points.length), highlight });

const RELATION_DIRECTION = ['מקבילות', 'מאונכות', 'לא מקבילות ולא מאונכות'];

const polygonSidesQuestion = () => {
  const type = pick(['position', 'direction', 'direction', 'findParallel', 'findPerpendicular', 'findAdjacent', 'countParallel']);

  if (type === 'position') {
    const key = pick(['rectangle', 'parallelogram', 'trapezoid', 'quadrilateral', 'rhombus', 'hexagon']);
    const shape = SHAPES[key];
    const n = shape.points.length;
    const i = rnd(0, n - 1);
    const adjacent = Math.random() < 0.5;
    const j = adjacent ? (i + 1) % n : (i + n / 2) % n;
    const ans = adjacent ? 'סמוכות' : 'נגדיות';
    return {
      kind: 'mc',
      label: 'סמוכות או נגדיות?',
      prompt: `הצלעות ${sideName(shape, i)} ו-${sideName(shape, j)} (בצבע) הן צלעות:`,
      visual: polygonVisual(key, [i, j]),
      options: ['סמוכות', 'נגדיות'],
      fixedOrder: true,
      optionsHebrew: true,
      answer: ans,
      explanation: adjacent
        ? `לצלעות ${sideName(shape, i)} ו-${sideName(shape, j)} יש קודקוד משותף (${LETTERS[j]}) - ולכן הן סמוכות.`
        : `לצלעות ${sideName(shape, i)} ו-${sideName(shape, j)} אין קודקוד משותף - הן אחת מול השנייה, ולכן נגדיות.`
    };
  }

  if (type === 'direction') {
    const key = pick(['rectangle', 'square', 'parallelogram', 'trapezoid', 'rightTrapezoid', 'quadrilateral', 'rightTriangle', 'hexagon', 'rhombus']);
    const shape = SHAPES[key];
    const n = shape.points.length;
    // מעדיפים זוגות "מעניינים" (מקבילות / מאונכות) בחצי מהמקרים
    const pairs = [];
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) pairs.push([a, b]);
    const interesting = pairs.filter(([a, b]) => sidesParallel(shape, a, b) || sidesPerpendicular(shape, a, b));
    const [i, j] = Math.random() < 0.7 && interesting.length ? pick(interesting) : pick(pairs);
    const ans = sidesParallel(shape, i, j) ? RELATION_DIRECTION[0] : sidesPerpendicular(shape, i, j) ? RELATION_DIRECTION[1] : RELATION_DIRECTION[2];
    return {
      kind: 'mc',
      label: 'מקבילות או מאונכות?',
      prompt: `הצלעות ${sideName(shape, i)} ו-${sideName(shape, j)} (בצבע) הן:`,
      visual: polygonVisual(key, [i, j]),
      options: RELATION_DIRECTION,
      fixedOrder: true,
      optionsHebrew: true,
      answer: ans,
      explanation: ans === 'מקבילות'
        ? 'צלעות מקבילות "הולכות באותו כיוון" - גם אם נמשיך אותן בלי סוף, הן לא ייפגשו.'
        : ans === 'מאונכות'
          ? 'צלעות מאונכות נפגשות (או היו נפגשות אם נמשיך אותן) בזווית ישרה - 90°.'
          : 'הצלעות לא באותו כיוון (ולכן לא מקבילות), והזווית ביניהן היא לא זווית ישרה (ולכן לא מאונכות).'
    };
  }

  if (type === 'findParallel' || type === 'findPerpendicular' || type === 'findAdjacent') {
    const relation = type === 'findParallel' ? sidesParallel : type === 'findPerpendicular' ? sidesPerpendicular : sidesAdjacent;
    const word = type === 'findParallel' ? 'מקבילה' : type === 'findPerpendicular' ? 'מאונכת' : 'סמוכה';
    const keys = type === 'findAdjacent' ? ['hexagon', 'rectangle', 'trapezoid'] : type === 'findParallel' ? ['hexagon', 'rectangle', 'trapezoid', 'parallelogram', 'rightTrapezoid', 'rhombus'] : ['rectangle', 'rightTrapezoid', 'rightTriangle', 'square'];
    const key = pick(keys);
    const shape = SHAPES[key];
    const n = shape.points.length;
    const candidates = [];
    for (let i = 0; i < n; i++) {
      const others = [...Array(n).keys()].filter(j => j !== i);
      const yes = others.filter(j => relation(shape, i, j));
      const no = others.filter(j => !relation(shape, i, j));
      if (yes.length && no.length) candidates.push({ i, yes, no });
    }
    if (!candidates.length) return polygonSidesQuestion();
    const c = pick(candidates);
    const right = pick(c.yes);
    const opts = shuffle([right, ...shuffle(c.no).slice(0, 3)]);
    return {
      kind: 'mc',
      label: `צלע ${word}`,
      prompt: `איזו צלע ${word} לצלע ${sideName(shape, c.i)}?`,
      visual: polygonVisual(key, [c.i]),
      options: opts.map(j => sideName(shape, j)),
      answer: sideName(shape, right),
      explanation: type === 'findParallel'
        ? `${sideName(shape, right)} הולכת באותו כיוון כמו ${sideName(shape, c.i)} - הן לא ייפגשו לעולם.`
        : type === 'findPerpendicular'
          ? `${sideName(shape, right)} יוצרת זווית ישרה (90°) עם ${sideName(shape, c.i)}.`
          : `ל-${sideName(shape, right)} ול-${sideName(shape, c.i)} יש קודקוד משותף - ולכן הן סמוכות.`
    };
  }

  // countParallel
  const key = pick(['rectangle', 'square', 'parallelogram', 'trapezoid', 'rightTrapezoid', 'quadrilateral', 'rightTriangle', 'hexagon']);
  const count = countParallelPairs(SHAPES[key]);
  return {
    kind: 'input',
    label: 'זוגות מקבילים',
    prompt: `כמה זוגות של צלעות מקבילות יש ב${SHAPES[key].name}?`,
    visual: polygonVisual(key),
    answer: String(count),
    explanation: count === 0
      ? `ב${SHAPES[key].name} הזה אין אף זוג צלעות מקבילות.`
      : `ב${SHAPES[key].name} יש ${count === 1 ? 'זוג אחד' : `${count} זוגות`} של צלעות מקבילות${key.includes('rapezoid') ? ' - זה בדיוק מה שמגדיר טרפז!' : '.'}`
  };
};

// ======================================================================
// גאומטריה: סוגי זוויות
// ======================================================================
const ANGLE_TYPES = ['חדה', 'ישרה', 'קהה', 'שטוחה'];
export const angleType = (deg) => (deg < 90 ? 'חדה' : deg === 90 ? 'ישרה' : deg < 180 ? 'קהה' : 'שטוחה');
const ANGLE_RULE = {
  חדה: 'זווית חדה קטנה מזווית ישרה (פחות מ-90°).',
  ישרה: 'זווית ישרה היא בדיוק 90° - כמו פינה של דף.',
  קהה: 'זווית קהה גדולה מזווית ישרה וקטנה מזווית שטוחה (בין 90° ל-180°).',
  שטוחה: 'זווית שטוחה היא 180° - שתי הקרניים יוצרות קו ישר.'
};

const anglesQuestion = () => {
  const type = pick(['picture', 'picture', 'degrees', 'clock', 'which', 'rightAnglesIn', 'definition']);
  const randomDeg = () => {
    const t = pick(ANGLE_TYPES);
    return t === 'חדה' ? rnd(4, 16) * 5 : t === 'ישרה' ? 90 : t === 'קהה' ? rnd(20, 34) * 5 : 180;
  };

  if (type === 'picture' || type === 'degrees') {
    const deg = randomDeg();
    const ans = angleType(deg);
    return {
      kind: 'mc',
      label: 'סוגי זוויות',
      prompt: type === 'picture' ? 'איזו זווית בציור?' : `זווית של ${deg}° היא זווית:`,
      visual: type === 'picture' ? { type: 'angle', degrees: deg, rotate: rnd(0, 3) * 15 * (deg === 180 ? 0 : 1) } : undefined,
      options: ANGLE_TYPES,
      fixedOrder: true,
      optionsHebrew: true,
      answer: ans,
      explanation: ANGLE_RULE[ans] + (type === 'picture' && ans !== 'ישרה' && ans !== 'שטוחה' ? '\nטיפ: משווים לפינה של דף - האם הזווית קטנה ממנה או גדולה ממנה?' : '')
    };
  }

  if (type === 'clock') {
    const hour = rnd(1, 11);
    const deg = Math.min(hour, 12 - hour) * 30;
    const ans = angleType(deg);
    return {
      kind: 'mc',
      label: 'זוויות בשעון',
      prompt: `איזו זווית יוצרים המחוגים בשעה ${hour}:00?`,
      visual: { type: 'clock', hour },
      options: ANGLE_TYPES,
      fixedOrder: true,
      optionsHebrew: true,
      answer: ans,
      explanation: `בין כל שני מספרים בשעון יש 30°. בשעה ${hour}:00 בין המחוגים ${Math.min(hour, 12 - hour)} "קפיצות" = ${deg}°.\n${ANGLE_RULE[ans]}`
    };
  }

  if (type === 'which') {
    const target = pick(['חדה', 'קהה', 'ישרה', 'שטוחה']);
    const degs = { חדה: rnd(4, 17) * 5, ישרה: 90, קהה: rnd(19, 35) * 5, שטוחה: 180 };
    return {
      kind: 'mc',
      label: 'סוגי זוויות',
      prompt: `איזו מהזוויות היא זווית ${target}?`,
      options: shuffle(ANGLE_TYPES.map(t => `${degs[t]}°`)),
      answer: `${degs[target]}°`,
      explanation: ANGLE_RULE[target]
    };
  }

  if (type === 'rightAnglesIn') {
    const key = pick(['rectangle', 'square', 'rightTrapezoid', 'rightTriangle', 'parallelogram', 'trapezoid']);
    const count = countRightAngles(SHAPES[key]);
    return {
      kind: 'input',
      label: 'זוויות ישרות במצולע',
      prompt: `כמה זוויות ישרות יש ב${SHAPES[key].name}?`,
      visual: polygonVisual(key),
      answer: String(count),
      explanation: count === 0
        ? `ב${SHAPES[key].name} הזה אין זוויות ישרות - כל הזוויות חדות או קהות.`
        : `ב${SHAPES[key].name} יש ${count === 1 ? 'זווית ישרה אחת' : `${count} זוויות ישרות`}.`
    };
  }

  // definition
  const t = pick(ANGLE_TYPES);
  const defs = {
    חדה: 'קטנה מזווית ישרה',
    ישרה: 'בדיוק 90°',
    קהה: 'גדולה מזווית ישרה וקטנה מזווית שטוחה',
    שטוחה: 'בדיוק 180° - קו ישר'
  };
  return {
    kind: 'mc',
    label: 'הגדרות',
    prompt: `זווית ${t} היא זווית ש...`,
    options: shuffle(ANGLE_TYPES.map(x => defs[x])),
    optionsHebrew: true,
    answer: defs[t],
    explanation: ANGLE_RULE[t]
  };
};

// ======================================================================
// גאומטריה: שטח והיקף מלבן
// ======================================================================
const areaPerimeterQuestion = () => {
  const type = pick(['area', 'perimeter', 'grid', 'sideFromArea', 'sideFromPerimeter', 'square', 'garden']);
  const w = rnd(3, 15);
  let h = rnd(2, 12);
  if (h === w) h = w > 3 ? w - 1 : w + 1;

  if (type === 'area' || type === 'perimeter') {
    const area = type === 'area';
    return {
      kind: 'input',
      label: area ? 'שטח מלבן' : 'היקף מלבן',
      prompt: area ? 'מה השטח של המלבן?' : 'מה ההיקף של המלבן?',
      visual: { type: 'rect', w, h, wLabel: `${w} ס"מ`, hLabel: `${h} ס"מ` },
      answer: String(area ? w * h : 2 * (w + h)),
      unit: area ? 'סמ"ר' : 'ס"מ',
      explanation: area
        ? `שטח = אורך × רוחב\n${w} × ${h} = ${w * h} סמ"ר`
        : `היקף = סכום כל הצלעות\n${w} + ${h} + ${w} + ${h} = ${2 * (w + h)} ס"מ`
    };
  }

  if (type === 'grid') {
    const gw = rnd(3, 8);
    const gh = rnd(2, 5);
    const area = Math.random() < 0.5;
    return {
      kind: 'input',
      label: area ? 'שטח בריבועים' : 'היקף בריבועים',
      prompt: area ? 'כל ריבוע קטן הוא 1 סמ"ר. מה השטח של המלבן?' : 'צלע של כל ריבוע קטן היא 1 ס"מ. מה ההיקף של המלבן?',
      visual: { type: 'rect', w: gw, h: gh, grid: true },
      answer: String(area ? gw * gh : 2 * (gw + gh)),
      unit: area ? 'סמ"ר' : 'ס"מ',
      explanation: area
        ? `סופרים את הריבועים: ${gh} שורות של ${gw} ריבועים.\n${gw} × ${gh} = ${gw * gh} סמ"ר`
        : `סופרים את הקווים מסביב: ${gw} + ${gh} + ${gw} + ${gh} = ${2 * (gw + gh)} ס"מ`
    };
  }

  if (type === 'sideFromArea') {
    return {
      kind: 'input',
      label: 'מהשטח לצלע',
      prompt: `שטח המלבן הוא ${w * h} סמ"ר, ואורכו ${w} ס"מ. מה הרוחב שלו?`,
      visual: { type: 'rect', w, h, wLabel: `${w} ס"מ`, hLabel: '?' },
      answer: String(h),
      unit: 'ס"מ',
      explanation: `אורך × רוחב = שטח, ולכן ${w} × □ = ${w * h}\n□ = ${w * h} : ${w} = ${h} ס"מ`
    };
  }

  if (type === 'sideFromPerimeter') {
    const p = 2 * (w + h);
    return {
      kind: 'input',
      label: 'מההיקף לצלע',
      prompt: `היקף המלבן הוא ${p} ס"מ, ואורכו ${w} ס"מ. מה הרוחב שלו?`,
      visual: { type: 'rect', w, h, wLabel: `${w} ס"מ`, hLabel: '?' },
      answer: String(h),
      unit: 'ס"מ',
      explanation: `שני האורכים יחד: ${w} + ${w} = ${2 * w}\nשני הרוחבים יחד: ${p} - ${2 * w} = ${2 * h}\nרוחב אחד: ${2 * h} : 2 = ${h} ס"מ`
    };
  }

  if (type === 'square') {
    const s = rnd(3, 12);
    const fromPerimeter = Math.random() < 0.5;
    return fromPerimeter
      ? {
        kind: 'input',
        label: 'ריבוע',
        prompt: `היקף של ריבוע הוא ${4 * s} ס"מ. מה אורך הצלע שלו?`,
        answer: String(s),
        unit: 'ס"מ',
        explanation: `בריבוע 4 צלעות שוות.\n${4 * s} : 4 = ${s} ס"מ`
      }
      : {
        kind: 'input',
        label: 'ריבוע',
        prompt: `אורך הצלע של ריבוע הוא ${s} ס"מ. מה השטח שלו?`,
        visual: { type: 'rect', w: s, h: s, wLabel: `${s} ס"מ`, hLabel: `${s} ס"מ` },
        answer: String(s * s),
        unit: 'סמ"ר',
        explanation: `ריבוע הוא מלבן שכל הצלעות שלו שוות.\n${s} × ${s} = ${s * s} סמ"ר`
      };
  }

  // garden: היקף או שטח בסיפור
  const fence = Math.random() < 0.5;
  return {
    kind: 'input',
    label: fence ? 'היקף בסיפור' : 'שטח בסיפור',
    prompt: fence
      ? `גינה מלבנית באורך ${w} מטרים וברוחב ${h} מטרים. כמה מטרים של גדר צריך כדי להקיף את כל הגינה?`
      : `חדר מלבני באורך ${w} מטרים וברוחב ${h} מטרים. כמה מטרים רבועים של שטיח צריך כדי לכסות את כל הרצפה?`,
    answer: String(fence ? 2 * (w + h) : w * h),
    unit: fence ? 'מטרים' : 'מ"ר',
    long: true,
    explanation: fence
      ? `גדר מסביב = היקף.\n${w} + ${h} + ${w} + ${h} = ${2 * (w + h)} מטרים`
      : `לכסות את הרצפה = שטח.\n${w} × ${h} = ${w * h} מ"ר`
  };
};

// ======================================================================
const GENERATORS = {
  mPlaceValue: placeValueQuestion,
  mNumberLine: numberLineQuestion,
  mCompare: compareQuestion,
  mOperations: operationsQuestion,
  mOrderOps: orderOpsQuestion,
  mEquations: equationsQuestion,
  mWordProblems: wordProblemQuestion,
  mFractionMeaning: fractionMeaningQuestion,
  mFractionAdd: fractionAddQuestion,
  mMixed: mixedQuestion,
  mFractionWords: fractionWordsQuestion,
  mPolygonSides: polygonSidesQuestion,
  mAngles: anglesQuestion,
  mAreaPerimeter: areaPerimeterQuestion
};

export const MATH_TOPIC_IDS = Object.keys(GENERATORS);

// ---------- שאלות שנוספו בממשק הניהול ----------
// ככל שיש יותר שאלות שלך בנושא - הן מופיעות לעתים קרובות יותר (8% לכל שאלה, עד 40%)
export const customShare = (count) => Math.min(0.4, count * 0.08);

const usedCustom = {};
const pickCustom = (topic, list) => {
  if (!usedCustom[topic]) usedCustom[topic] = new Set();
  let fresh = list.filter((_, i) => !usedCustom[topic].has(i));
  if (!fresh.length) {
    usedCustom[topic].clear();
    fresh = list;
  }
  const item = pick(fresh);
  usedCustom[topic].add(list.indexOf(item));
  return item;
};

export const fromCustom = (item) => {
  const isInput = item.kind === 'input';
  const answer = isInput ? String(item.answer).replace(/,/g, '') : String(item.answer);
  return {
    kind: isInput ? 'input' : 'mc',
    label: 'שאלה נוספת',
    prompt: item.prompt,
    expr: item.expr || undefined,
    options: isInput ? undefined : shuffle([answer, ...(item.distractors || []).map(String)]),
    answer,
    unit: isInput ? item.unit || undefined : undefined,
    optionsHebrew: !isInput && /[\u05D0-\u05EA]/.test([answer, ...(item.distractors || [])].join('')),
    long: (item.prompt || '').length > 60,
    custom: true,
    explanation: item.explanation || `התשובה הנכונה: ${isInput ? fmt(answer) : answer}`
  };
};

/** שאלה חדשה בנושא. במבחן המסכם - מנושא אקראי (ושומרים מאיזה נושא באה) */
export const generateMathQuestion = (categoryId) => {
  const topic = categoryId === 'mTest' ? pick(MATH_TOPIC_IDS) : categoryId;
  const gen = GENERATORS[topic];
  if (!gen) throw new Error(`Unknown math category: ${categoryId}`);
  const custom = getBank(topic);
  if (custom.length && Math.random() < customShare(custom.length)) {
    return { ...fromCustom(pickCustom(topic, custom)), topic };
  }
  return { ...gen(), topic };
};

/** האם התשובה שהוקלדה נכונה: מתעלמים מרווחים ומפסיקים (12,500 = 12500) */
export const normalizeNumberInput = (text) => String(text ?? '').replace(/[\s,]/g, '').replace(/^0+(?=\d)/, '');
export const isInputCorrect = (text, answer) => {
  const t = normalizeNumberInput(text);
  return t !== '' && t === normalizeNumberInput(answer);
};
