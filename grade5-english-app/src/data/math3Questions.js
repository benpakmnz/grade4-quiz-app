// מחולל שאלות בחשבון לכיתה ג' - לפי נושאי מבחן תחילת השנה (28.10.2026).
// אותו מבנה שאלה כמו בחשבון של כיתה ה' (ראו mathQuestions.js), עם מספרים עד 1,000 ופעולות בתחום ה-100.
import { numberToHebrew, formatNumber as fmt } from '../utils/hebrewNumbers';
import { rnd, pick, shuffle, withDistractors, NAMES_F, NAMES_M, SHAPES } from './mathQuestions';

const PLACES3 = ['יחידות', 'עשרות', 'מאות'];
const digits3 = (n) => [Math.floor(n / 100), Math.floor(n / 10) % 10, n % 10]; // [מאות, עשרות, יחידות]

/** מספר תלת-ספרתי, לפעמים עם 0 באמצע או בסוף */
const threeDigit = () => {
  const n = rnd(101, 999);
  const r = Math.random();
  if (r < 0.15) return Math.floor(n / 10) * 10; // 340
  if (r < 0.3) return Math.floor(n / 100) * 100 + (n % 10 || 5); // 307
  return n;
};

/** מספרים "קרובים" שמבלבלים: ספרות מוחלפות */
const swapsOf = (n) => {
  const [h, t, u] = digits3(n);
  return [
    h * 100 + u * 10 + t,
    t * 100 + h * 10 + u,
    u * 100 + t * 10 + h,
    h * 100 + t + u * 10,
    n + 100 <= 999 ? n + 100 : n - 100,
    n + 10 <= 999 ? n + 10 : n - 10
  ].filter(v => v >= 100 && v <= 999 && v !== n);
};

const placesText = (n) => {
  const [h, t, u] = digits3(n);
  return `${h} מאות, ${t} עשרות ו-${u} יחידות`;
};
const expandedText = (n) => {
  const [h, t, u] = digits3(n);
  return [h * 100, t * 10, u].filter(Boolean).join(' + ');
};

// ======================================================================
// הכרת המספר
// ======================================================================
const numbersQuestion = () => {
  const type = pick(['toWords', 'toWords', 'fromWords', 'next', 'next', 'prev', 'places', 'fromPlaces', 'expanded', 'digitValue', 'build', 'build']);

  if (type === 'toWords') {
    const n = threeDigit();
    return {
      kind: 'mc',
      label: 'מספר במילים',
      prompt: 'איך כותבים את המספר במילים?',
      expr: String(n),
      options: withDistractors(numberToHebrew(n), shuffle(swapsOf(n)).map(numberToHebrew)),
      answer: numberToHebrew(n),
      optionsHebrew: true,
      explanation: `${n} = ${expandedText(n)}\nבמילים: ${numberToHebrew(n)}`
    };
  }

  if (type === 'fromWords') {
    const n = threeDigit();
    return {
      kind: 'mc',
      label: 'ממילים לספרות',
      prompt: `איך כותבים בספרות: "${numberToHebrew(n)}"?`,
      options: withDistractors(String(n), shuffle(swapsOf(n)).map(String)),
      answer: String(n),
      explanation: `${numberToHebrew(n)}\n= ${expandedText(n)} = ${n}`
    };
  }

  if (type === 'next' || type === 'prev') {
    // הרבה פעמים - במעבר עשרת או מאה (399 ← 400)
    const r = Math.random();
    let n = r < 0.35 ? rnd(1, 9) * 100 + 99 : r < 0.7 ? rnd(10, 99) * 10 + 9 : rnd(100, 998);
    if (type === 'prev') n = r < 0.35 ? rnd(1, 9) * 100 : r < 0.7 ? rnd(11, 99) * 10 : rnd(101, 999);
    const ans = type === 'next' ? n + 1 : n - 1;
    return {
      kind: 'input',
      label: type === 'next' ? 'המספר העוקב' : 'המספר הקודם',
      prompt: type === 'next' ? `מהו המספר העוקב של ${n}?` : `מהו המספר שבא לפני ${n}?`,
      answer: String(ans),
      explanation: type === 'next'
        ? `העוקב = המספר שבא מיד אחרי, כלומר גדול ב-1.\n${n} + 1 = ${ans}`
        : `המספר שבא לפני = קטן ב-1.\n${n} - 1 = ${ans}`
    };
  }

  if (type === 'places') {
    const n = threeDigit();
    const [h, t, u] = digits3(n);
    const wrong = [
      `${t} מאות, ${h} עשרות ו-${u} יחידות`,
      `${u} מאות, ${t} עשרות ו-${h} יחידות`,
      `${h} מאות, ${u} עשרות ו-${t} יחידות`,
      `${h} מאות, ${t === 9 ? 8 : t + 1} עשרות ו-${u} יחידות`
    ];
    return {
      kind: 'mc',
      label: 'מבנה עשורי',
      prompt: 'ממה בנוי המספר?',
      expr: String(n),
      options: withDistractors(placesText(n), wrong),
      answer: placesText(n),
      optionsHebrew: true,
      explanation: `סופרים מימין לשמאל: יחידות, עשרות, מאות.\n${n} = ${placesText(n)}`
    };
  }

  if (type === 'fromPlaces') {
    const n = threeDigit();
    return {
      kind: 'input',
      label: 'מבנה עשורי',
      prompt: `כתבי את המספר בספרות: ${placesText(n)}`,
      answer: String(n),
      explanation: `${expandedText(n)} = ${n}${n % 10 === 0 || Math.floor(n / 10) % 10 === 0 ? '\nבמקום שאין בו כלום כותבים 0.' : ''}`
    };
  }

  if (type === 'expanded') {
    const n = threeDigit();
    return {
      kind: 'mc',
      label: 'פירוק המספר',
      prompt: 'איזה מספר מתאים לפירוק?',
      expr: expandedText(n),
      options: withDistractors(String(n), shuffle(swapsOf(n)).map(String)),
      answer: String(n),
      explanation: `${expandedText(n)} = ${n}`
    };
  }

  if (type === 'digitValue') {
    let n = threeDigit();
    while (new Set(String(n)).size < 3 || String(n).includes('0')) n = rnd(123, 987);
    const place = rnd(0, 2); // 0 מאות, 1 עשרות, 2 יחידות
    const digit = digits3(n)[place];
    const value = digit * [100, 10, 1][place];
    return {
      kind: 'mc',
      label: 'ערך הספרה',
      prompt: `מה הערך של הספרה ${digit} במספר?`,
      expr: String(n),
      options: withDistractors(String(value), [digit, digit * 10, digit * 100, digit * 1000].map(String)),
      answer: String(value),
      explanation: `הספרה ${digit} נמצאת במקום ה${PLACES3[2 - place]}, ולכן היא שווה ${value}.`
    };
  }

  // build: הגדול / הקטן ביותר מספרות נתונות
  const ds = [];
  while (ds.length < 3) {
    const d = rnd(ds.length === 2 && Math.random() < 0.25 ? 0 : 1, 9);
    if (!ds.includes(d)) ds.push(d);
  }
  const biggest = Math.random() < 0.55;
  const sorted = [...ds].sort((a, b) => (biggest ? b - a : a - b));
  if (!biggest && sorted[0] === 0) [sorted[0], sorted[1]] = [sorted[1], sorted[0]];
  const ans = Number(sorted.join(''));
  return {
    kind: 'input',
    label: 'בונים מספר',
    prompt: `מהו המספר ה${biggest ? 'גדול' : 'קטן'} ביותר שאפשר לבנות מהספרות ${ds.join(', ')}? (כל ספרה פעם אחת)`,
    answer: String(ans),
    explanation: biggest
      ? `שמים את הספרה הגדולה ביותר במקום המאות, אחריה במקום העשרות, והקטנה ביותר ביחידות.\n${ans}`
      : `שמים את הספרה הקטנה ביותר במקום המאות${ds.includes(0) ? ' (אבל לא 0 - מספר לא מתחיל ב-0)' : ''}, וכך הלאה.\n${ans}`
  };
};

// ======================================================================
// סדרות וישר המספרים
// ======================================================================
const sequencesQuestion = () => {
  const type = pick(['next', 'next', 'middle', 'line', 'line', 'lineStep']);

  if (type === 'next' || type === 'middle') {
    const step = pick([2, 3, 4, 5, 10, 10, 20, 50, 100]);
    const down = Math.random() < 0.3;
    const max = step >= 50 ? 1000 : 200;
    const len = 6;
    const span = step * (len - 1);
    const start = down ? rnd(span, max) : rnd(0, max - span);
    const items = Array.from({ length: len }, (_, i) => start + (down ? -1 : 1) * step * i);
    const miss = type === 'next' ? len - 1 : rnd(1, len - 2);
    return {
      kind: 'input',
      label: 'השלמת סדרה',
      prompt: 'איזה מספר חסר בסדרה?',
      visual: { type: 'sequence', items: items.map((v, i) => (i === miss ? '?' : String(v))) },
      answer: String(items[miss]),
      explanation: `בכל צעד המספר ${down ? 'קטן' : 'גדל'} ב-${step}.\n${items[miss - 1]} ${down ? '-' : '+'} ${step} = ${items[miss]}`
    };
  }

  // ישר המספרים: 10 קפיצות, עד 1,000
  const step = pick([1, 2, 5, 10, 10, 100]);
  const intervals = 10;
  const START = { 1: () => 10 * rnd(0, 9), 2: () => 20 * rnd(0, 4), 5: () => 50 * rnd(0, 9), 10: () => 100 * rnd(0, 9), 100: () => 0 };
  const start = START[step]();
  const end = start + step * intervals;
  const arrow = rnd(1, intervals - 1);
  const value = start + arrow * step;

  if (type === 'lineStep') {
    return {
      kind: 'mc',
      label: 'ישר המספרים',
      prompt: 'בכמה גדל המספר בכל קפיצה (בין שני קווים סמוכים)?',
      visual: { type: 'numberLine', ticks: intervals, labels: { 0: fmt(start), [intervals]: fmt(end) } },
      options: withDistractors(String(step), [1, 2, 5, 10, 20, 50, 100].filter(v => v !== step).map(String)),
      answer: String(step),
      explanation: `מ-${start} עד ${end} יש ${end - start}.\nיש ${intervals} קפיצות, ולכן כל קפיצה: ${end - start} : ${intervals} = ${step}`
    };
  }

  const known = pick([[0, intervals], [0, intervals], [0, 5]]);
  if (known.includes(arrow)) return sequencesQuestion();
  const labels = Object.fromEntries(known.map(i => [i, fmt(start + i * step)]));
  const wrong = [value + step, value - step, start + arrow * step * 10, start + arrow, value + 2 * step].filter(v => v >= 0 && v !== value);
  return {
    kind: 'mc',
    label: 'ישר המספרים',
    prompt: 'איזה מספר מסמן החץ?',
    visual: { type: 'numberLine', ticks: intervals, labels, arrow },
    options: withDistractors(String(value), shuffle(wrong).map(String)),
    answer: String(value),
    explanation: `כל קפיצה היא ${step}.\nהחץ נמצא ${arrow} קפיצות אחרי ${start}: ${start} + ${arrow} × ${step} = ${value}`
  };
};

// ======================================================================
// פעולות חשבון בתחום ה-100
// ======================================================================
const operationsQuestion = () => {
  const type = pick(['add', 'add', 'sub', 'sub', 'mul', 'mul', 'div', 'div']);
  if (type === 'add') {
    const a = rnd(10, 89);
    const b = rnd(2, 100 - a);
    return {
      kind: 'input',
      label: 'חיבור',
      prompt: 'חשבי:',
      expr: `${a} + ${b} = ?`,
      answer: String(a + b),
      explanation: b >= 10
        ? `מחברים עשרות ואז יחידות:\n${a} + ${Math.floor(b / 10) * 10} = ${a + Math.floor(b / 10) * 10}\n${a + Math.floor(b / 10) * 10} + ${b % 10} = ${a + b}`
        : `${a} + ${b} = ${a + b}`
    };
  }
  if (type === 'sub') {
    const a = rnd(20, 100);
    const b = rnd(2, a - 1);
    return {
      kind: 'input',
      label: 'חיסור',
      prompt: 'חשבי:',
      expr: `${a} - ${b} = ?`,
      answer: String(a - b),
      explanation: b >= 10
        ? `מחסרים עשרות ואז יחידות:\n${a} - ${Math.floor(b / 10) * 10} = ${a - Math.floor(b / 10) * 10}\n${a - Math.floor(b / 10) * 10} - ${b % 10} = ${a - b}\nבדיקה: ${a - b} + ${b} = ${a}`
        : `${a} - ${b} = ${a - b}\nבדיקה: ${a - b} + ${b} = ${a}`
    };
  }
  const x = rnd(2, 10);
  const y = rnd(1, 10);
  if (type === 'mul') {
    return {
      kind: 'input',
      label: 'כפל',
      prompt: 'חשבי:',
      expr: `${x} × ${y} = ?`,
      answer: String(x * y),
      explanation: `${x} × ${y} = ${x * y}\nזה כמו ${y} פעמים ${x}${y <= 5 ? `: ${Array(y).fill(x).join(' + ')} = ${x * y}` : ''}`
    };
  }
  return {
    kind: 'input',
    label: 'חילוק',
    prompt: 'חשבי:',
    expr: `${x * y} : ${x} = ?`,
    answer: String(y),
    explanation: `חושבים בכפל: ${x} כפול כמה זה ${x * y}?\n${x} × ${y} = ${x * y}, ולכן ${x * y} : ${x} = ${y}`
  };
};

// ======================================================================
// המספר החסר בתרגיל
// ======================================================================
const missingQuestion = () => {
  const type = pick(['a+x', 'x+a', 'a-x', 'x-a', 'x*a', 'a*x', 'x:a']);
  let expr;
  let x;
  let explanation;
  if (type === 'a+x' || type === 'x+a') {
    const a = rnd(5, 80);
    x = rnd(2, 100 - a);
    expr = type === 'a+x' ? `${a} + □ = ${a + x}` : `□ + ${a} = ${a + x}`;
    explanation = `כמה צריך להוסיף ל-${a} כדי להגיע ל-${a + x}?\n${a + x} - ${a} = ${x}`;
  } else if (type === 'a-x') {
    const a = rnd(20, 100);
    x = rnd(2, a - 1);
    expr = `${a} - □ = ${a - x}`;
    explanation = `כמה הורידו מ-${a} כדי שיישאר ${a - x}?\n${a} - ${a - x} = ${x}`;
  } else if (type === 'x-a') {
    const a = rnd(2, 50);
    x = a + rnd(2, 100 - a);
    expr = `□ - ${a} = ${x - a}`;
    explanation = `מאיזה מספר הורידו ${a} ונשאר ${x - a}?\n${x - a} + ${a} = ${x}`;
  } else if (type === 'x*a' || type === 'a*x') {
    const a = rnd(2, 10);
    x = rnd(1, 10);
    expr = type === 'x*a' ? `□ × ${a} = ${a * x}` : `${a} × □ = ${a * x}`;
    explanation = `${a} כפול כמה זה ${a * x}?\n${a * x} : ${a} = ${x}`;
  } else {
    const a = rnd(2, 10);
    const q = rnd(1, 10);
    x = a * q;
    expr = `□ : ${a} = ${q}`;
    explanation = `איזה מספר מתחלק ל-${a} ויוצא ${q}?\n${q} × ${a} = ${x}`;
  }
  return {
    kind: 'input',
    label: 'המספר החסר',
    prompt: 'איזה מספר חסר בריבוע?',
    expr,
    answer: String(x),
    explanation: `${explanation}\nבדיקה: ${expr.replace('□', String(x))} ✓`
  };
};

// ======================================================================
// בעיות מילוליות
// ======================================================================
// כל בעיה: טקסט, התשובה, התרגיל הנכון ותרגילים "מבלבלים" (לשאלות "איזה תרגיל מתאים?")
const WORD3 = [
  () => { const a = rnd(12, 45), b = rnd(5, 40); const f = pick(NAMES_F); return { text: `ל${f} היו ${a} מדבקות. היא קיבלה עוד ${b} מדבקות. כמה מדבקות יש לה עכשיו?`, value: a + b, unit: 'מדבקות', ex: `${a} + ${b}`, wrong: [`${a} - ${b}`, `${a} × ${b}`, `${a + b} - ${b}`] }; },
  () => { const a = rnd(30, 95), b = rnd(5, a - 5); const m = pick(NAMES_M); return { text: `ל${m} היו ${a} גולות. הוא נתן לחבר ${b} גולות. כמה גולות נשארו לו?`, value: a - b, unit: 'גולות', ex: `${a} - ${b}`, wrong: [`${a} + ${b}`, `${b} - ${a}`, `${a} : ${b}`] }; },
  () => { const n = rnd(2, 10), k = rnd(2, 10); return { text: `יש ${n} קופסאות, ובכל קופסה ${k} עפרונות. כמה עפרונות יש בסך הכול?`, value: n * k, unit: 'עפרונות', ex: `${n} × ${k}`, wrong: [`${n} + ${k}`, `${n * k} : ${k}`, `${k} - ${n}`] }; },
  () => { const g = rnd(2, 10), n = rnd(2, 10); return { text: `${g * n} ילדים התחלקו לקבוצות של ${g} ילדים בכל קבוצה. כמה קבוצות יש?`, value: n, unit: 'קבוצות', ex: `${g * n} : ${g}`, wrong: [`${g * n} - ${g}`, `${g * n} × ${g}`, `${g * n} + ${g}`] }; },
  () => { const k = rnd(2, 8), n = rnd(3, 10); const f = pick(NAMES_F); return { text: `${f} חילקה ${k * n} סוכריות שווה בשווה ל-${k} חברות. כמה סוכריות קיבלה כל חברה?`, value: n, unit: 'סוכריות', ex: `${k * n} : ${k}`, wrong: [`${k * n} - ${k}`, `${k * n} × ${k}`, `${k * n} + ${k}`] }; },
  () => { const p = rnd(3, 10), n = rnd(2, 9); return { text: `מחברת עולה ${p} ₪. כמה עולות ${n} מחברות?`, value: p * n, unit: '₪', ex: `${p} × ${n}`, wrong: [`${p} + ${n}`, `${p * n} : ${n}`, `${n} - ${p}`] }; },
  () => { const a = rnd(25, 60), b = rnd(10, 35); const m = pick(NAMES_M), f = pick(NAMES_F); return { text: `${m} קרא ${a} עמודים, ו${f} קראה ${b} עמודים. כמה עמודים קראו שניהם יחד?`, value: a + b, unit: 'עמודים', ex: `${a} + ${b}`, wrong: [`${a} - ${b}`, `${a} × ${b}`, `${a} + ${a}`] }; },
  () => { const a = rnd(40, 99), b = rnd(10, a - 10); const f = pick(NAMES_F); return { text: `בספר יש ${a} עמודים. ${f} קראה כבר ${b} עמודים. כמה עמודים נשאר לה לקרוא?`, value: a - b, unit: 'עמודים', ex: `${a} - ${b}`, wrong: [`${a} + ${b}`, `${a} : ${b}`, `${b} - ${a}`] }; },
  () => { const r = rnd(3, 9), s = rnd(3, 10); return { text: `בכיתה ${r} שורות של שולחנות, ובכל שורה ${s} שולחנות. כמה שולחנות יש בכיתה?`, value: r * s, unit: 'שולחנות', ex: `${r} × ${s}`, wrong: [`${r} + ${s}`, `${r * s} - ${s}`, `${r * s} : ${r}`] }; },
  () => { const a = rnd(20, 60), b = rnd(5, 30), c = rnd(3, Math.min(20, a + b - 5)); return { text: `באוטובוס היו ${a} נוסעים. בתחנה עלו ${b} נוסעים וירדו ${c}. כמה נוסעים יש עכשיו באוטובוס?`, value: a + b - c, unit: 'נוסעים', ex: `${a} + ${b} - ${c}`, wrong: [`${a} - ${b} + ${c}`, `${a} + ${b} + ${c}`, `${a} - ${b} - ${c}`] }; },
  () => { const w = rnd(2, 10); return { text: `לכל כלב יש 4 רגליים. כמה רגליים יש ל-${w} כלבים?`, value: 4 * w, unit: 'רגליים', ex: `${w} × 4`, wrong: [`${w} + 4`, `${w} - 4`, `${w} + ${w}`] }; },
  () => { const a = rnd(10, 50), d = rnd(3, 25); const m = pick(NAMES_M), f = pick(NAMES_F); return { text: `ל${m} יש ${a} קלפים. ל${f} יש ${d} קלפים יותר ממנו. כמה קלפים יש ל${f}?`, value: a + d, unit: 'קלפים', ex: `${a} + ${d}`, wrong: [`${a} - ${d}`, `${a} × ${d}`, `${d} - ${a}`] }; }
];

const wordQuestion = () => {
  const t = pick(WORD3)();
  if (!t || t.value <= 0 || t.value > 100) return wordQuestion();
  if (Math.random() < 0.4) {
    return {
      kind: 'mc',
      label: 'איזה תרגיל מתאים?',
      prompt: `${t.text}\nאיזה תרגיל מתאים לבעיה?`,
      options: withDistractors(t.ex, shuffle(t.wrong)),
      answer: t.ex,
      long: true,
      explanation: `התרגיל המתאים: ${t.ex} = ${t.value}`
    };
  }
  return {
    kind: 'input',
    label: 'בעיה מילולית',
    prompt: t.text,
    answer: String(t.value),
    unit: t.unit,
    long: true,
    explanation: `${t.ex} = ${t.value} ${t.unit}`
  };
};

// ======================================================================
// היקף מצולע
// ======================================================================
const EXTRA_SHAPES = {
  triangle: { name: 'משולש', points: [[50, 8], [92, 80], [8, 80]] },
  pentagon: { name: 'מחומש', points: [[50, 6], [94, 38], [77, 84], [23, 84], [6, 38]] }
};
const shapeOf = (key) => SHAPES[key] || EXTRA_SHAPES[key];

const perimeterQuestion = () => {
  const type = pick(['any', 'any', 'rect', 'rectTwo', 'square']);
  if (type === 'rect' || type === 'rectTwo') {
    const w = rnd(3, 15);
    let h = rnd(2, 12);
    if (h === w) h += 1;
    const p = 2 * (w + h);
    const two = type === 'rectTwo';
    return {
      kind: 'input',
      label: 'היקף מלבן',
      prompt: two ? 'מה ההיקף של המלבן? (במלבן הצלעות שמול זו את זו שוות)' : 'מה ההיקף של המלבן?',
      visual: { type: 'rect', w, h, wLabel: `${w} ס"מ`, hLabel: `${h} ס"מ` },
      answer: String(p),
      unit: 'ס"מ',
      explanation: `היקף = סכום כל הצלעות מסביב.\n${w} + ${h} + ${w} + ${h} = ${p} ס"מ`
    };
  }
  if (type === 'square') {
    const s = rnd(2, 12);
    return {
      kind: 'input',
      label: 'היקף ריבוע',
      prompt: 'מה ההיקף של הריבוע? (בריבוע כל הצלעות שוות)',
      visual: { type: 'rect', w: s, h: s, wLabel: `${s} ס"מ`, hLabel: '' },
      answer: String(4 * s),
      unit: 'ס"מ',
      explanation: `לריבוע 4 צלעות שוות.\n${s} + ${s} + ${s} + ${s} = ${4 * s} ס"מ (או ${s} × 4)`
    };
  }
  const key = pick(['triangle', 'triangle', 'rightTriangle', 'trapezoid', 'pentagon', 'hexagon', 'quadrilateral']);
  const shape = shapeOf(key);
  // צורות "משוכללות" למראה (מחומש, משושה) - צלעות קרובות באורכן, כדי שהציור לא יבלבל
  const base = rnd(3, 10);
  const sides = shape.points.map(() => (['pentagon', 'hexagon'].includes(key) ? base + rnd(-1, 1) : rnd(2, 15)));
  const p = sides.reduce((a, b) => a + b, 0);
  return {
    kind: 'input',
    label: 'היקף מצולע',
    prompt: `מה ההיקף של ה${shape.name}? (האורכים בס"מ)`,
    visual: { type: 'polygon', points: shape.points, sideLabels: sides.map(String) },
    answer: String(p),
    unit: 'ס"מ',
    explanation: `היקף = מחברים את כל הצלעות מסביב.\n${sides.join(' + ')} = ${p} ס"מ`
  };
};

// ======================================================================
// שטח מלבן
// ======================================================================
const areaQuestion = () => {
  const type = pick(['grid', 'grid', 'labels', 'labels', 'square', 'compare']);
  if (type === 'grid') {
    const w = rnd(2, 8);
    const h = rnd(2, 5);
    return {
      kind: 'input',
      label: 'שטח בריבועים',
      prompt: 'כל ריבוע קטן הוא 1 סמ"ר. מה השטח של המלבן?',
      visual: { type: 'rect', w, h, grid: true },
      answer: String(w * h),
      unit: 'סמ"ר',
      explanation: `סופרים את הריבועים: ${h} שורות, ובכל שורה ${w} ריבועים.\n${h} × ${w} = ${w * h} סמ"ר`
    };
  }
  if (type === 'square') {
    const s = rnd(2, 10);
    return {
      kind: 'input',
      label: 'שטח ריבוע',
      prompt: 'מה השטח של הריבוע?',
      visual: { type: 'rect', w: s, h: s, wLabel: `${s} ס"מ`, hLabel: `${s} ס"מ` },
      answer: String(s * s),
      unit: 'סמ"ר',
      explanation: `שטח = אורך × רוחב\n${s} × ${s} = ${s * s} סמ"ר`
    };
  }
  if (type === 'compare') {
    // שני מלבנים - למי שטח גדול יותר
    const a = [rnd(2, 9), rnd(2, 6)];
    let b = [rnd(2, 9), rnd(2, 6)];
    while (a[0] * a[1] === b[0] * b[1]) b = [rnd(2, 9), rnd(2, 6)];
    const bigger = a[0] * a[1] > b[0] * b[1] ? 'מלבן א' : 'מלבן ב';
    return {
      kind: 'mc',
      label: 'השוואת שטחים',
      prompt: `למלבן א אורך ${a[0]} ס"מ ורוחב ${a[1]} ס"מ. למלבן ב אורך ${b[0]} ס"מ ורוחב ${b[1]} ס"מ. לאיזה מלבן שטח גדול יותר?`,
      options: ['מלבן א', 'מלבן ב'],
      answer: bigger,
      optionsHebrew: true,
      long: true,
      explanation: `מלבן א: ${a[0]} × ${a[1]} = ${a[0] * a[1]} סמ"ר\nמלבן ב: ${b[0]} × ${b[1]} = ${b[0] * b[1]} סמ"ר`
    };
  }
  const w = rnd(2, 10);
  let h = rnd(2, 9);
  if (h === w) h = w > 2 ? w - 1 : 3;
  return {
    kind: 'input',
    label: 'שטח מלבן',
    prompt: 'מה השטח של המלבן?',
    visual: { type: 'rect', w, h, wLabel: `${w} ס"מ`, hLabel: `${h} ס"מ` },
    answer: String(w * h),
    unit: 'סמ"ר',
    explanation: `שטח = אורך × רוחב\n${w} × ${h} = ${w * h} סמ"ר`
  };
};

// ======================================================================
const GENERATORS = {
  g3Numbers: numbersQuestion,
  g3Sequences: sequencesQuestion,
  g3Operations: operationsQuestion,
  g3Missing: missingQuestion,
  g3Word: wordQuestion,
  g3Perimeter: perimeterQuestion,
  g3Area: areaQuestion
};

export const MATH3_TOPIC_IDS = Object.keys(GENERATORS);

/** שאלה חדשה בנושא. במבחן המסכם - מנושא אקראי */
export const generateMath3Question = (categoryId) => {
  const topic = categoryId === 'g3Test' ? pick(MATH3_TOPIC_IDS) : categoryId;
  const gen = GENERATORS[topic];
  if (!gen) throw new Error(`Unknown grade 3 math category: ${categoryId}`);
  return { ...gen(), topic };
};

export const _test = { threeDigit, swapsOf, EXTRA_SHAPES };
export { fmt };
