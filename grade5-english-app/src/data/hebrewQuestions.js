// שאלות בשפה (לשון) - כיתה ה'. מבוסס על רשימת הנושאים של המורה למבחן (1.11.2026):
// שורשים ומשפחות מילים, שמות עצם, מילות קישור, זמנים, פעלים, כינויי גוף.
// כל התוכן כתוב ביד (בלי "חישוב" של עברית) - כדי שיהיה מדויק. בשורשים יש גם שורשים עם אות שנעלמת (WEAK_FAMILIES)
// ומילים "דומות" מהשורש אחר (LOOKALIKES) - כדי שהרמה תתאים לכיתה ה'.

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const sample = (arr, n) => shuffle(arr).slice(0, n);

// "חפיסה": כל רשימה נשלפת בסדר אקראי בלי חזרות, ורק כשנגמרה - מערבבים מחדש.
// בערבוב החדש, הפריטים שהופיעו לאחרונה נשלחים לסוף - כדי שלא יחזרו מהר.
// החפיסה משותפת לכל היחידות - כך משפט שהופיע ביחידה אחת לא חוזר מיד ביחידה אחרת או במבחן המסכם
const decks = {};
export const draw = (key, list) => {
  let d = decks[key];
  if (!d || !d.idx.length || d.size !== list.length) {
    const recent = d && d.size === list.length ? d.recent : [];
    const fresh = shuffle(list.map((_, i) => i).filter(i => !recent.includes(i)));
    // pop() לוקח מהסוף: קודם החדשים, אחר כך מה שהופיע לאחרונה - והאחרון שהופיע יוצא אחרון
    d = { idx: [...recent.slice().reverse(), ...fresh], size: list.length, recent };
    decks[key] = d;
  }
  const i = d.idx.pop();
  d.recent = [...d.recent.filter(x => x !== i), i].slice(-Math.floor(list.length / 2));
  return list[i];
};
/** תשובה + מסיחים: בלי כפילויות, בלי התשובה פעמיים, עד 4 אפשרויות */
const withDistractors = (answer, distractors, n = 4) =>
  shuffle([answer, ...[...new Set(distractors)].filter(d => d && d !== answer).slice(0, n - 1)]);

// ======================================================================
// שורשים ומשפחות מילים
// ======================================================================
export const ROOT_FAMILIES = [
  { root: 'כ.ת.ב', words: ['מכתב', 'כתיבה', 'כתובת', 'כתבה', 'כתבן'] },
  { root: 'ס.פ.ר', words: ['ספרייה', 'סופר', 'סיפור', 'ספרן', 'מספר'] },
  { root: 'ל.מ.ד', words: ['תלמיד', 'לימוד', 'מלמד', 'למידה', 'תלמידה'] },
  { root: 'ש.מ.ר', words: ['שומר', 'שמירה', 'משמרת', 'שמור', 'משמר'] },
  { root: 'ג.ד.ל', words: ['גדול', 'גודל', 'גידול', 'מגדל', 'גדילה'] },
  { root: 'ר.ק.ד', words: ['ריקוד', 'רקדן', 'רקדנית', 'רוקדת'] },
  { root: 'ש.ב.ר', words: ['שבור', 'שבירה', 'משבר', 'שבריר', 'נשבר'] },
  { root: 'ז.כ.ר', words: ['זיכרון', 'מזכרת', 'תזכורת', 'זוכר', 'מזכיר'] },
  { root: 'ס.ג.ר', words: ['סגור', 'סגירה', 'מסגרת', 'מסגר'] },
  { root: 'ע.ב.ד', words: ['עבודה', 'עובד', 'מעבדה', 'עבד'] },
  { root: 'ש.ל.ח', words: ['שליח', 'משלוח', 'שליחה', 'משלחת'] },
  { root: 'ח.ש.ב', words: ['מחשב', 'חשבון', 'מחשבה', 'חשוב', 'חישוב'] },
  { root: 'ר.כ.ב', words: ['רכבת', 'רכב', 'רוכב', 'מרכבה'] },
  { root: 'פ.ת.ח', words: ['פתיחה', 'מפתח', 'פתוח', 'פתח'] },
  { root: 'ס.ד.ר', words: ['סדר', 'סידור', 'מסודר', 'סדרן'] },
  { root: 'ב.ש.ל', words: ['מבשל', 'בישול', 'תבשיל', 'מבשלה'] },
  { root: 'ל.ב.ש', words: ['לבוש', 'מלבוש', 'התלבשות', 'לובשת'] },
  { root: 'ש.ח.ק', words: ['משחק', 'שחקן', 'שחקנית', 'משחקייה'] },
  { root: 'צ.ל.ם', words: ['צלם', 'מצלמה', 'צילום', 'תצלום'] },
  { root: 'ת.פ.ר', words: ['תופרת', 'תפירה', 'מתפרה', 'תפר'] },
  { root: 'ר.ש.ם', words: ['רשימה', 'רושם', 'מרשם', 'הרשמה'] },
  { root: 'ק.ב.ל', words: ['קבלה', 'מקבל', 'קבלן', 'מקובל'] },
  { root: 'נ.ג.ן', words: ['נגן', 'נגינה', 'מנגינה', 'מנגן'] }
];

// שורשים "חסרים": אות שנעלמת או מתחלפת במילה (גזרות). כאן אותיות השורש לא תמיד נראות כולן במילה
export const WEAK_FAMILIES = [
  { root: 'י.ש.ב', words: ['מושב', 'ישיבה', 'תושב', 'יושב'], note: "י' בתחילת השורש הופכת לפעמים ל-ו' (מושב, תושב)" },
  { root: 'י.ל.ד', words: ['ילדות', 'מולדת', 'לידה', 'הולדת'], note: "י' בתחילת השורש הופכת לפעמים ל-ו' (מולדת) או נעלמת (לידה)" },
  { root: 'י.ד.ע', words: ['ידיעה', 'מודעה', 'מדע', 'יודע'], note: "י' בתחילת השורש הופכת ל-ו' (מודעה) או נעלמת (מדע)" },
  { root: 'נ.פ.ל', words: ['נפילה', 'מפל', 'מפולת', 'נופל'], note: "נ' בתחילת השורש נעלמת לפעמים (מפל, מפולת)" },
  { root: 'נ.ס.ע', words: ['נסיעה', 'מסע', 'נוסע', 'נוסעת'], note: "נ' בתחילת השורש נעלמת לפעמים (מסע)" },
  { root: 'נ.ת.ן', words: ['מתנה', 'נתינה', 'נותן'], note: "נ' בתחילת השורש נעלמת לפעמים (מתנה)" },
  { root: 'ק.ו.ם', words: ['מקום', 'קימה', 'תקומה', 'קומה'], note: "ו' באמצע השורש מתחלפת לפעמים ב-י' (קימה)" },
  { root: 'ר.ו.ץ', words: ['ריצה', 'מרוץ', 'רץ', 'רצים'], note: "ו' באמצע השורש מתחלפת ב-י' (ריצה) או נעלמת (רץ)" },
  { root: 'ט.ו.ס', words: ['מטוס', 'טיסה', 'טייס', 'טס'], note: "ו' באמצע השורש מתחלפת ב-י' (טיסה) או נעלמת (טס)" },
  { root: 'ש.ו.ב', words: ['תשובה', 'שיבה', 'משוב'], note: "ו' באמצע השורש מתחלפת לפעמים ב-י' (שיבה)" },
  { root: 'ש.י.ר', words: ['שיר', 'שירה', 'משורר', 'שירון'], note: "י' באמצע השורש מתחלפת לפעמים ב-ו' (משורר)" },
  { root: 'ב.נ.ה', words: ['בניין', 'בנייה', 'מבנה', 'בונה', 'תבנית'], note: "ה' בסוף השורש נעלמת לפעמים או מתחלפת ב-י' (בנייה, תבנית)" },
  { root: 'ק.נ.ה', words: ['קנייה', 'קונה', 'מקנה'], note: "ה' בסוף השורש מתחלפת לפעמים ב-י' (קנייה)" },
  { root: 'ע.ש.ה', words: ['מעשה', 'עשייה', 'עושה', 'תעשייה'], note: "ה' בסוף השורש מתחלפת לפעמים ב-י' (עשייה, תעשייה)" },
  { root: 'ר.א.ה', words: ['ראייה', 'מראה', 'רואה', 'ראיון'], note: "ה' בסוף השורש מתחלפת לפעמים ב-י' (ראייה, ראיון)" },
  { root: 'ש.ת.ה', words: ['שתייה', 'משתה', 'שותה'], note: "ה' בסוף השורש מתחלפת לפעמים ב-י' (שתייה)" }
];

// מילים "דומות" שנראות כאילו הן מהמשפחה - אבל השורש שלהן אחר
export const LOOKALIKES = [
  { root: 'כ.ת.ב', word: 'כתף', wordRoot: 'כ.ת.ף' },
  { root: 'ש.מ.ר', word: 'שמן', wordRoot: 'ש.מ.ן' },
  { root: 'ס.פ.ר', word: 'ספל', wordRoot: 'ס.פ.ל' },
  { root: 'ג.ד.ל', word: 'גדר', wordRoot: 'ג.ד.ר' },
  { root: 'ש.ב.ר', word: 'שבת', wordRoot: 'ש.ב.ת' },
  { root: 'ר.ק.ד', word: 'רקע', wordRoot: 'ר.ק.ע' },
  { root: 'ח.ש.ב', word: 'חושך', wordRoot: 'ח.ש.ך' },
  { root: 'פ.ת.ח', word: 'פתק', wordRoot: 'פ.ת.ק' },
  { root: 'ע.ב.ד', word: 'עבר', wordRoot: 'ע.ב.ר' },
  { root: 'ר.כ.ב', word: 'רכוש', wordRoot: 'ר.כ.ש' },
  { root: 'ל.ב.ש', word: 'לבן', wordRoot: 'ל.ב.ן' },
  { root: 'ק.ב.ל', word: 'קבוצה', wordRoot: 'ק.ב.ץ' },
  { root: 'נ.ג.ן', word: 'נגר', wordRoot: 'נ.ג.ר' },
  { root: 'ב.ש.ל', word: 'בשר', wordRoot: 'ב.ש.ר' },
  { root: 'ש.ח.ק', word: 'שחור', wordRoot: 'ש.ח.ר' },
  { root: 'ר.ש.ם', word: 'רשת', wordRoot: 'ר.ש.ת' },
  { root: 'צ.ל.ם', word: 'צלחת', wordRoot: 'צ.ל.ח' },
  { root: 'ת.פ.ר', word: 'תפיסה', wordRoot: 'ת.פ.ס' },
  { root: 'ס.ג.ר', word: 'סגול', wordRoot: 'ס.ג.ל' },
  { root: 'ז.כ.ר', word: 'זכייה', wordRoot: 'ז.כ.ה' },
  { root: 'ש.ב.ר', word: 'שבט', wordRoot: 'ש.ב.ט' },
  { root: 'ס.ד.ר', word: 'סדין', wordRoot: 'ס.ד.ן' }
];

const familyOf = (word) => ROOT_FAMILIES.find(f => f.words.includes(word)) || WEAK_FAMILIES.find(f => f.words.includes(word));
const otherFamilies = (fam) => ROOT_FAMILIES.filter(f => f !== fam);
const FINAL_TO_REGULAR = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };
const REGULAR_TO_FINAL = { 'כ': 'ך', 'מ': 'ם', 'נ': 'ן', 'פ': 'ף', 'צ': 'ץ' };

const asRoot = (letters) => {
  const l = letters.map(c => FINAL_TO_REGULAR[c] || c);
  l[2] = REGULAR_TO_FINAL[l[2]] || l[2];
  return l.join('.');
};

/** "מלכודת": שלוש האותיות הראשונות של המילה - טעות נפוצה במציאת שורש */
const firstLettersTrap = (word) => {
  const letters = word.replace(/[^א-ת]/g, '').split('').slice(0, 3);
  return letters.length < 3 ? null : asRoot(letters);
};

/**
 * מסיחים "קשים": שלישיות אותיות מתוך המילה עצמה (ההתחלה, הסוף, בלי ו/י...)
 * כך שאי אפשר לפסול תשובה רק כי האותיות שלה לא מופיעות במילה
 */
const letterTraps = (word) => {
  const all = word.replace(/[^א-ת]/g, '').split('');
  const noVav = all.filter((c, i) => i === 0 || !'וי'.includes(c));
  const triples = [all.slice(0, 3), all.slice(-3), all.slice(1, 4), noVav.slice(0, 3), noVav.slice(-3), noVav.slice(1, 4)];
  return shuffle([...new Set(triples.filter(t => t.length === 3).map(asRoot))]);
};

const rootExplanation = (fam, word) => (fam.note
  ? `השורש של "${word}" הוא ${fam.root}.\n${fam.note}.\nבודקים עם עוד מילים מהמשפחה: ${fam.words.filter(w => w !== word).slice(0, 3).join(', ')}`
  : `מורידים את התוספות (אותיות בהתחלה, בסוף, ו' וי' באמצע) ומחפשים את 3 האותיות שחוזרות בכל המשפחה.\n${fam.words.slice(0, 3).join(', ')} - בכולן השורש ${fam.root}`);

// ---------- שאלות פתוחות (לא אמריקאיות) ----------
const hebrewLetters = (w) => String(w || '').replace(/[^\u05D0-\u05EA]/g, '').split('').map(c => FINAL_TO_REGULAR[c] || c);
const rootLetters = (root) => root.split('.').map(c => FINAL_TO_REGULAR[c] || c);

/** האם אותיות השורש מופיעות במילה, לפי הסדר (כמו שבודקים במשפחת מילים) */
export const hasRootInOrder = (root, word) => {
  const r = rootLetters(root);
  let i = 0;
  hebrewLetters(word).forEach(c => { if (c === r[i]) i++; });
  return i === r.length;
};

/**
 * בדיקת מילים שהילד/ה כתב/ה: לכל מילה 'ok' / 'bad' / 'dup' (כבר כתבת) / 'given' (המילה מהשאלה) / 'empty'
 * מילה מתקבלת אם היא מהמשפחה המוכרת, או אם יש בה את אותיות השורש לפי הסדר
 */
export const checkRootWords = (root, words, exclude = []) => {
  const seen = new Set(exclude.map(w => hebrewLetters(w).join('')));
  const givenSet = new Set(seen);
  return words.map(raw => {
    const w = String(raw || '').trim();
    if (!w) return 'empty';
    const key = hebrewLetters(w).join('');
    if (!/^[\u05D0-\u05EA\u0591-\u05C7]+$/.test(w) || key.length < 3 || key.length > 12) return 'bad';
    if (givenSet.has(key)) return 'given';
    if (seen.has(key)) return 'dup';
    seen.add(key);
    return hasRootInOrder(root, w) ? 'ok' : 'bad';
  });
};

/** השורש שהוקלד: "זכר", "ז.כ.ר", "ז כ ר" - כולם נכונים (גם עם/בלי אות סופית) */
export const isSameRoot = (typed, root) => hebrewLetters(typed).join('') === rootLetters(root).join('');

const openRootQuestion = (type) => {
  if (type === 'writeWords') {
    const fam = pick(ROOT_FAMILIES);
    const fromWord = Math.random() < 0.5;
    const given = fromWord ? pick(fam.words) : null;
    const count = fromWord ? 2 : 3;
    return {
      kind: 'words',
      label: 'כותבים מילים מהשורש',
      prompt: fromWord
        ? `כתבי עוד ${count} מילים מהמשפחה של "${given}"`
        : `כתבי ${count} מילים שונות מהשורש ${fam.root}`,
      count,
      check: (words) => checkRootWords(fam.root, words, given ? [given] : []),
      answer: `למשל: ${fam.words.filter(w => w !== given).slice(0, 3).join(', ')}`,
      explanation: `בכל מילה צריכות להופיע אותיות השורש ${fam.root}, לפי הסדר.\nמילים מהמשפחה: ${fam.words.join(', ')} - וגם פעלים מאותו שורש.`
    };
  }

  if (type === 'typeRoot') {
    const fam = Math.random() < 0.4 ? pick(WEAK_FAMILIES) : pick(ROOT_FAMILIES);
    const word = pick(fam.words);
    return {
      kind: 'text',
      label: 'כותבים את השורש',
      prompt: `כתבי את השורש של המילה "${word}" (3 אותיות)`,
      check: (typed) => isSameRoot(typed, fam.root),
      answer: fam.root,
      explanation: rootExplanation(fam, word)
    };
  }

  // pickAll: מסמנים את כל המילים מהמשפחה (בלי לדעת כמה יש)
  const weak = Math.random() < 0.3;
  const fam = weak ? pick(WEAK_FAMILIES) : pick(ROOT_FAMILIES);
  const right = sample(fam.words, Math.min(fam.words.length, pick([2, 3, 3, 4])));
  const look = LOOKALIKES.find(l => l.root === fam.root);
  const pool = shuffle((weak ? WEAK_FAMILIES : ROOT_FAMILIES).filter(o => o !== fam)).map(o => pick(o.words));
  const wrong = [look?.word, ...pool].filter(Boolean).slice(0, 8 - right.length);
  return {
    kind: 'multi',
    label: 'מסמנים את כל המשפחה',
    prompt: `סמני את כל המילים מהשורש ${fam.root}`,
    options: shuffle([...right, ...wrong]),
    answers: right,
    check: (picked) => picked.length === right.length && picked.every(w => right.includes(w)),
    answer: right.join(', '),
    optionsHebrew: true,
    explanation: `מהשורש ${fam.root}: ${right.join(', ')}.${fam.note ? `\n${fam.note}.` : ''}${look ? `\n"${look.word}" נראית דומה, אבל השורש שלה ${look.wordRoot}.` : ''}`
  };
};

const rootsQuestion = () => {
  const type = pick(['rootOf', 'rootOf', 'weakRoot', 'weakRoot', 'weakFamily', 'lookalike', 'lookalike', 'sameFamily', 'oddOne', 'fromRoot', 'writeWords', 'writeWords', 'typeRoot', 'typeRoot', 'pickAll', 'pickAll']);
  if (['writeWords', 'typeRoot', 'pickAll'].includes(type)) return openRootQuestion(type);
  const fam = pick(ROOT_FAMILIES);
  const others = shuffle(otherFamilies(fam));

  if (type === 'rootOf' || type === 'weakRoot') {
    const f = type === 'weakRoot' ? pick(WEAK_FAMILIES) : fam;
    const word = pick(f.words);
    const otherRoots = shuffle([...ROOT_FAMILIES, ...WEAK_FAMILIES].filter(o => o !== f)).map(o => o.root);
    return {
      kind: 'mc',
      label: type === 'weakRoot' ? 'שורש עם אות חסרה' : 'מציאת שורש',
      prompt: `מה השורש של המילה "${word}"?`,
      options: withDistractors(f.root, [...letterTraps(word), ...otherRoots]),
      answer: f.root,
      optionsHebrew: true,
      explanation: rootExplanation(f, word)
    };
  }

  if (type === 'weakFamily') {
    const f = pick(WEAK_FAMILIES);
    const [given, match] = sample(f.words, 2);
    const wrong = shuffle(WEAK_FAMILIES.filter(o => o !== f)).map(o => pick(o.words));
    return {
      kind: 'mc',
      label: 'משפחת מילים',
      prompt: `איזו מילה שייכת למשפחת המילים של "${given}"?`,
      options: withDistractors(match, wrong),
      answer: match,
      optionsHebrew: true,
      explanation: `ל"${given}" ול"${match}" יש אותו שורש: ${f.root}.\n${f.note}.`
    };
  }

  if (type === 'lookalike') {
    // שלוש מילים מהמשפחה + מילה שנראית דומה אבל מהשורש אחר
    const look = draw('lookalike', LOOKALIKES);
    const f = ROOT_FAMILIES.find(o => o.root === look.root);
    const three = sample(f.words, 3);
    return {
      kind: 'mc',
      label: 'מי לא שייך?',
      prompt: 'איזו מילה לא שייכת למשפחת המילים של שאר המילים?',
      options: shuffle([...three, look.word]),
      answer: look.word,
      optionsHebrew: true,
      explanation: `${three.join(', ')} - מהשורש ${f.root}.\n"${look.word}" נראית דומה, אבל השורש שלה ${look.wordRoot} - ולכן היא לא שייכת.`
    };
  }

  if (type === 'sameFamily') {
    const [given, match] = sample(fam.words, 2);
    const look = LOOKALIKES.find(l => l.root === fam.root);
    return {
      kind: 'mc',
      label: 'משפחת מילים',
      prompt: `איזו מילה שייכת למשפחת המילים של "${given}"?`,
      options: withDistractors(match, [look?.word, ...others.map(o => pick(o.words))].filter(Boolean)),
      answer: match,
      optionsHebrew: true,
      explanation: `ל"${given}" ול"${match}" יש אותו שורש: ${fam.root}. מילים עם אותו שורש הן משפחה אחת.${look ? `\n"${look.word}" נראית דומה, אבל השורש שלה ${look.wordRoot}.` : ''}`
    };
  }

  if (type === 'oddOne') {
    const three = sample(fam.words, 3);
    const odd = pick(others[0].words);
    return {
      kind: 'mc',
      label: 'מי לא שייך?',
      prompt: 'איזו מילה לא שייכת למשפחת המילים של שאר המילים?',
      options: shuffle([...three, odd]),
      answer: odd,
      optionsHebrew: true,
      explanation: `${three.join(', ')} - מהשורש ${fam.root}.\n"${odd}" - מהשורש ${others[0].root}, ולכן היא לא שייכת.`
    };
  }

  // fromRoot
  const word = pick(fam.words);
  const look = LOOKALIKES.find(l => l.root === fam.root);
  return {
    kind: 'mc',
    label: 'מילה מהשורש',
    prompt: `איזו מילה בנויה מהשורש ${fam.root}?`,
    options: withDistractors(word, [look?.word, ...others.map(o => pick(o.words))].filter(Boolean)),
    answer: word,
    optionsHebrew: true,
    explanation: `במילה "${word}" יש את אותיות השורש ${fam.root.replace(/\./g, ', ')}, לפי הסדר.${look ? `\n"${look.word}" - השורש שלה ${look.wordRoot}.` : ''}`
  };
};

// ======================================================================
// שמות עצם
// ======================================================================
// [יחיד, רבים, מין]. כולל "מלכודות": נקבה עם ים (ציפור, שנה) וזכר עם ות (שולחן, לילה), ורבים לא רגילים (איש ← אנשים)
export const NOUNS = [
  ['ספר', 'ספרים', 'ז'], ['מחברת', 'מחברות', 'נ'], ['ילד', 'ילדים', 'ז'], ['ילדה', 'ילדות', 'נ'],
  ['שולחן', 'שולחנות', 'ז'], ['חלון', 'חלונות', 'ז'], ['כיסא', 'כיסאות', 'ז'], ['עיפרון', 'עפרונות', 'ז'],
  ['תלמידה', 'תלמידות', 'נ'], ['עץ', 'עצים', 'ז'], ['ציפור', 'ציפורים', 'נ'], ['אבן', 'אבנים', 'נ'],
  ['עיר', 'ערים', 'נ'], ['דלת', 'דלתות', 'נ'], ['כלב', 'כלבים', 'ז'], ['חתולה', 'חתולות', 'נ'],
  ['בית', 'בתים', 'ז'], ['ארץ', 'ארצות', 'נ'], ['לילה', 'לילות', 'ז'], ['קיר', 'קירות', 'ז'],
  ['מקום', 'מקומות', 'ז'], ['אות', 'אותיות', 'נ'], ['שנה', 'שנים', 'נ'], ['מילה', 'מילים', 'נ'],
  ['חבר', 'חברים', 'ז'], ['משפחה', 'משפחות', 'נ'], ['גן', 'גנים', 'ז'], ['תמונה', 'תמונות', 'נ'],
  ['שיר', 'שירים', 'ז'], ['פרח', 'פרחים', 'ז'], ['כוכב', 'כוכבים', 'ז'], ['מכונית', 'מכוניות', 'נ'],
  ['אישה', 'נשים', 'נ'], ['איש', 'אנשים', 'ז'], ['שבוע', 'שבועות', 'ז'], ['רגל', 'רגליים', 'נ'],
  ['יד', 'ידיים', 'נ'], ['עין', 'עיניים', 'נ'], ['כדור', 'כדורים', 'ז'], ['עוגה', 'עוגות', 'נ'],
  ['יום', 'ימים', 'ז'], ['בת', 'בנות', 'נ'], ['בן', 'בנים', 'ז'], ['אחות', 'אחיות', 'נ'],
  ['רחוב', 'רחובות', 'ז'], ['חלום', 'חלומות', 'ז'], ['קול', 'קולות', 'ז'], ['אוצר', 'אוצרות', 'ז'],
  ['ביצה', 'ביצים', 'נ'], ['נמלה', 'נמלים', 'נ'], ['יונה', 'יונים', 'נ'], ['מזלג', 'מזלגות', 'ז'],
  ['שדה', 'שדות', 'ז'], ['כוס', 'כוסות', 'נ'], ['רוח', 'רוחות', 'נ'], ['שן', 'שיניים', 'נ'],
  ['אוזן', 'אוזניים', 'נ'], ['נעל', 'נעליים', 'נ'], ['שעון', 'שעונים', 'ז'], ['ראש', 'ראשים', 'ז']
];

/** שמות עצם "מבלבלים": המין לא מתאים לסיומת ברבים, או שהרבים משתנה */
const isTricky = ([sing, plural, gender]) =>
  (gender === 'נ' && /ים$/.test(plural)) || (gender === 'ז' && /ות$/.test(plural)) || !plural.startsWith(sing.replace(/[הת]$/, '').slice(0, 2));
export const TRICKY_NOUNS = NOUNS.filter(isTricky);
/** בערך פעמיים מתוך שלוש - מילה "מבלבלת" */
const pickNoun = () => (Math.random() < 0.65 ? pick(TRICKY_NOUNS) : pick(NOUNS));

/** צורת "רבים" שמבלבלת (לפי הסיומת) */
const pluralMisleads = ([, plural, gender]) => (gender === 'נ' && /ים$/.test(plural)) || (gender === 'ז' && /ות$/.test(plural));

// שמות תואר: [זכר יחיד, נקבה יחיד, זכר רבים, נקבה רבים]
export const ADJECTIVES = [
  ['גדול', 'גדולה', 'גדולים', 'גדולות'],
  ['קטן', 'קטנה', 'קטנים', 'קטנות'],
  ['חדש', 'חדשה', 'חדשים', 'חדשות']
];

// משפטים ארוכים יותר - שמות העצם מסומנים כמו שהם כתובים (גם עם ה, ב, ל, מ, ו בהתחלה)
export const NOUN_SENTENCES = [
  { s: 'הילדים שיחקו בכדור בגן', nouns: ['הילדים', 'בכדור', 'בגן'] },
  { s: 'אמא קנתה לחם וחלב בחנות', nouns: ['אמא', 'לחם', 'וחלב', 'בחנות'] },
  { s: 'דני כתב מכתב ארוך לסבתא', nouns: ['דני', 'מכתב', 'לסבתא'] },
  { s: 'הציפורים בנו קן על העץ הגבוה', nouns: ['הציפורים', 'קן', 'העץ'] },
  { s: 'בבוקר הלכנו לים עם החברים', nouns: ['בבוקר', 'לים', 'החברים'] },
  { s: 'המורה קראה סיפור מצחיק לתלמידים', nouns: ['המורה', 'סיפור', 'לתלמידים'] },
  { s: 'החתול קפץ מהחלון אל הגינה', nouns: ['החתול', 'מהחלון', 'הגינה'] },
  { s: 'אבא תיקן את האופניים במחסן', nouns: ['אבא', 'האופניים', 'במחסן'] },
  { s: 'נועה שמה את הספרים בתיק הכחול', nouns: ['נועה', 'הספרים', 'בתיק'] },
  { s: 'בחורף יורד גשם חזק בעיר', nouns: ['בחורף', 'גשם', 'בעיר'] },
  { s: 'הרופאה בדקה את הילד בבוקר', nouns: ['הרופאה', 'הילד', 'בבוקר'] },
  { s: 'סבא סיפר לנכדים על הטיול בהרים', nouns: ['סבא', 'לנכדים', 'הטיול', 'בהרים'] },
  { s: 'השמש זרחה והציפורים שרו על הגג', nouns: ['השמש', 'והציפורים', 'הגג'] },
  { s: 'התלמידה החרוצה ציירה תמונה יפה', nouns: ['התלמידה', 'תמונה'] }
];

/** צורות רבים "לא נכונות" שילדים נוטים לכתוב */
const wrongPlurals = (sing, plural) => {
  const stem = sing.replace(/[הת]$/, '');
  return [...new Set([sing + 'ים', sing + 'ות', stem + 'ים', stem + 'ות', sing])]
    .filter(w => w !== plural && !/ה(ים|ות)$/.test(w) && !/א(ים)$/.test(w));
};

// משפטים: כל מילה מסומנת - שם עצם (n), פועל (v), שם תואר (adj), תואר הפועל / מילת זמן (adv)
export const TAGGED_SENTENCES = [
  [['הכלב', 'n'], ['הגדול', 'adj'], ['רץ', 'v'], ['מהר', 'adv']],
  [['השמש', 'n'], ['זורחת', 'v'], ['חזק', 'adv'], ['מאוד', 'adv']],
  [['הציפור', 'n'], ['הקטנה', 'adj'], ['מצייצת', 'v'], ['יפה', 'adv']],
  [['התלמידים', 'n'], ['החרוצים', 'adj'], ['כתבו', 'v'], ['מהר', 'adv']],
  [['המכונית', 'n'], ['האדומה', 'adj'], ['נסעה', 'v'], ['לאט', 'adv']],
  [['הפרחים', 'n'], ['הצהובים', 'adj'], ['גדלו', 'v'], ['מהר', 'adv']],
  [['העוגה', 'n'], ['המתוקה', 'adj'], ['נאפתה', 'v'], ['אתמול', 'adv']],
  [['הילדים', 'n'], ['השמחים', 'adj'], ['קפצו', 'v'], ['גבוה', 'adv']],
  [['החתולה', 'n'], ['הלבנה', 'adj'], ['שותה', 'v'], ['לאט', 'adv']],
  [['הספר', 'n'], ['החדש', 'adj'], ['נפתח', 'v'], ['בקלות', 'adv']],
  [['הגשם', 'n'], ['החזק', 'adj'], ['ירד', 'v'], ['שוב', 'adv']],
  [['האוטובוס', 'n'], ['הכחול', 'adj'], ['הגיע', 'v'], ['מוקדם', 'adv']],
  [['המורה', 'n'], ['הנחמדה', 'adj'], ['צחקה', 'v'], ['הרבה', 'adv']],
  [['הכדור', 'n'], ['העגול', 'adj'], ['התגלגל', 'v'], ['רחוק', 'adv']],
  [['הרוח', 'n'], ['הקרה', 'adj'], ['נשבה', 'v'], ['חזק', 'adv']],
  [['התינוק', 'n'], ['הקטן', 'adj'], ['ישן', 'v'], ['עכשיו', 'adv']]
];
// משפטים נפרדים ל"מצאו את הפועל" - כדי שאותו משפט לא יופיע גם ביחידת שמות העצם
export const VERB_SENTENCES = [
  [['אחותי', 'n'], ['הקטנה', 'adj'], ['ציירה', 'v'], ['פרפר', 'n'], ['צבעוני', 'adj']],
  [['השחקנים', 'n'], ['התאמנו', 'v'], ['במגרש', 'n'], ['החדש', 'adj']],
  [['סבתא', 'n'], ['אפתה', 'v'], ['עוגיות', 'n'], ['טעימות', 'adj']],
  [['הרוח', 'n'], ['החזקה', 'adj'], ['הפילה', 'v'], ['את', 'x'], ['העציץ', 'n']],
  [['בערב', 'n'], ['קראנו', 'v'], ['סיפור', 'n'], ['מרתק', 'adj']],
  [['הנמלים', 'n'], ['סחבו', 'v'], ['פירורים', 'n'], ['לקן', 'n']],
  [['התינוקת', 'n'], ['חייכה', 'v'], ['אל', 'x'], ['אמא', 'n']],
  [['הדייגים', 'n'], ['יצאו', 'v'], ['לים', 'n'], ['בבוקר', 'n']],
  [['המורה', 'n'], ['החדשה', 'adj'], ['הסבירה', 'v'], ['את', 'x'], ['התרגיל', 'n']],
  [['האריה', 'n'], ['שאג', 'v'], ['בקול', 'n'], ['רם', 'adj']],
  [['ילדי', 'n'], ['הכיתה', 'n'], ['שתלו', 'v'], ['עצים', 'n']],
  [['הגננת', 'n'], ['לימדה', 'v'], ['שיר', 'n'], ['חדש', 'adj']]
];
const sentenceText = (s) => s.map(([w]) => w).join(' ');
const wordsOf = (s, tag) => s.filter(([, t]) => t === tag).map(([w]) => w);

const SINGLE_VERBS = ['רץ', 'כתבה', 'שומעים', 'ילך', 'קופצת', 'שרו', 'נסע', 'אוכלים'];
const SINGLE_ADJ = ['גדול', 'חכם', 'קטנים', 'שמח', 'אדומות', 'חדש'];
const SINGLE_ADV = ['מהר', 'לאט', 'אתמול', 'מאוד', 'מחר', 'עכשיו'];

const nounsQuestion = () => {
  const type = pick(['gender', 'gender', 'plural', 'plural', 'singular', 'agree', 'agree', 'countNouns', 'notNoun', 'findNoun', 'isNoun']);
  const [sing, plural, gender] = pickNoun();
  const one = gender === 'ז' ? `${sing} אחד` : `${sing} אחת`;

  if (type === 'gender') {
    // לפעמים שואלים על צורת הרבים - שם הסיומת "מטעה"
    const askPlural = Math.random() < 0.4 && pluralMisleads([sing, plural, gender]);
    const word = askPlural ? plural : sing;
    const answer = gender === 'ז' ? 'זכר' : 'נקבה';
    return {
      kind: 'mc',
      label: 'זכר או נקבה?',
      prompt: `מה המין של שם העצם "${word}"?`,
      options: ['זכר', 'נקבה'],
      answer,
      optionsHebrew: true,
      explanation: `${askPlural ? `ביחיד: "${sing}". ` : ''}בודקים עם "אחד" / "אחת": "${one}" ← ${answer}.\nשימו לב: הסיומת ברבים (ים / ות) לא תמיד מגלה את המין!`
    };
  }

  if (type === 'plural') {
    return {
      kind: 'mc',
      label: 'יחיד ← רבים',
      prompt: `מה צורת הרבים של "${sing}"?`,
      options: withDistractors(plural, [...shuffle(wrongPlurals(sing, plural)), ...sample(NOUNS.filter(n => n[0] !== sing), 3).map(n => n[1])]),
      answer: plural,
      optionsHebrew: true,
      explanation: `${one} ← הרבה ${plural}.${pluralMisleads([sing, plural, gender]) ? `\nשימו לב: "${sing}" היא ${gender === 'נ' ? 'נקבה' : 'זכר'}, אבל ברבים - "${plural}".` : ''}`
    };
  }

  if (type === 'singular') {
    return {
      kind: 'mc',
      label: 'רבים ← יחיד',
      prompt: `מה צורת היחיד של "${plural}"?`,
      options: withDistractors(sing, shuffle([plural.replace(/(ים|ות)$/, 'ה'), plural.replace(/(ים|ות)$/, 'ת'), plural, ...sample(NOUNS.filter(n => n[0] !== sing), 3).map(n => n[0])].filter(w => w.length > 1))),
      answer: sing,
      optionsHebrew: true,
      explanation: `הרבה ${plural} ← ${one}.`
    };
  }

  if (type === 'agree') {
    // התאמה של שם התואר לשם העצם: צריך לדעת את המין גם כשהסיומת מטעה
    const adj = pick(ADJECTIVES);
    const usePlural = Math.random() < 0.6;
    const noun = usePlural ? plural : sing;
    const idx = (usePlural ? 2 : 0) + (gender === 'נ' ? 1 : 0);
    return {
      kind: 'mc',
      label: 'התאמה',
      prompt: `איזו מילה מתאימה? "ה${noun} ה____"`,
      options: shuffle(adj.map(a => `ה${a}`)),
      answer: `ה${adj[idx]}`,
      optionsHebrew: true,
      explanation: `"${noun}" - ${gender === 'ז' ? 'זכר' : 'נקבה'}, ${usePlural ? 'רבים' : 'יחיד'} (${one}).\nלכן: ה${noun} ה${adj[idx]}.${usePlural && pluralMisleads([sing, plural, gender]) ? '\nלא הולכים לפי הסיומת ים / ות - בודקים את היחיד!' : ''}`
    };
  }

  if (type === 'countNouns' || type === 'notNoun') {
    const item = type === 'notNoun' ? draw('nounSentence3', NOUN_SENTENCES.filter(x => x.nouns.length >= 3)) : draw('nounSentenceLong', NOUN_SENTENCES);
    const words = item.s.split(' ');
    const others = words.filter(w => !item.nouns.includes(w));
    if (type === 'notNoun' && others.length) {
      const odd = pick(others);
      return {
        kind: 'mc',
        label: 'שמות עצם במשפט',
        prompt: `"${item.s}"\nאיזו מילה במשפט היא לא שם עצם?`,
        options: shuffle([odd, ...sample(item.nouns, 3)]),
        answer: odd,
        optionsHebrew: true,
        long: true,
        explanation: `שמות העצם במשפט: ${item.nouns.join(', ')} (גם עם ה, ב, ל, מ, ו בהתחלה - זה עדיין שם עצם).\n"${odd}" היא לא שם של דבר, אדם או מקום.`
      };
    }
    const n = item.nouns.length;
    return {
      kind: 'mc',
      label: 'כמה שמות עצם?',
      prompt: `"${item.s}"\nכמה שמות עצם יש במשפט?`,
      options: ['1', '2', '3', '4', '5'].filter(o => Math.abs(Number(o) - n) <= 2).slice(0, 4),
      answer: String(n),
      long: true,
      explanation: `שמות העצם: ${item.nouns.join(', ')} - ${n}.\nשימו לב למילים עם ה, ב, ל, מ, ו בהתחלה - גם הן שמות עצם (בכדור = ב + כדור).`
    };
  }

  if (type === 'isNoun') {
    const noun = pick(NOUNS)[Math.random() < 0.5 ? 0 : 1];
    return {
      kind: 'mc',
      label: 'מה זה שם עצם?',
      prompt: 'איזו מילה היא שם עצם?',
      options: shuffle([noun, pick(SINGLE_VERBS), pick(SINGLE_ADJ), pick(SINGLE_ADV)]),
      answer: noun,
      optionsHebrew: true,
      explanation: `שם עצם הוא שם של דבר, אדם, בעל חיים או מקום. אפשר להוסיף לו "ה" בהתחלה: ה${noun}.\nשאר המילים: פעולה (פועל), תיאור (שם תואר) או מתי / איך (תואר הפועל).`
    };
  }

  // findNoun
  const s = draw('nounSentence', TAGGED_SENTENCES);
  const noun = wordsOf(s, 'n')[0];
  return {
    kind: 'mc',
    label: 'שם עצם במשפט',
    prompt: `מהו שם העצם במשפט: "${sentenceText(s)}"?`,
    options: shuffle(s.map(([w]) => w)),
    answer: noun,
    optionsHebrew: true,
    explanation: `"${noun}" - שם של ${['הילדים', 'התלמידים', 'המורה', 'התינוק'].includes(noun) ? 'אדם' : 'דבר / בעל חיים'}, ולכן שם עצם.\n${wordsOf(s, 'v').map(v => `"${v}" - פועל (מה עושים)`).join('. ')}${wordsOf(s, 'adj').length ? `. "${wordsOf(s, 'adj')[0]}" - שם תואר (איך הוא)` : ''}.`
  };
};

// ======================================================================
// מילות קישור
// ======================================================================
export const RELATIONS = ['הוספה', 'ניגוד', 'סיבה', 'תוצאה', 'תנאי', 'זמן', 'מטרה'];

export const CONNECTIVE_TYPES = [
  { w: 'וגם', t: 'הוספה' }, { w: 'בנוסף', t: 'הוספה' },
  { w: 'אבל', t: 'ניגוד' }, { w: 'למרות ש', t: 'ניגוד' }, { w: 'אך', t: 'ניגוד' },
  { w: 'כי', t: 'סיבה' }, { w: 'מפני ש', t: 'סיבה' }, { w: 'בגלל ש', t: 'סיבה' },
  { w: 'לכן', t: 'תוצאה' }, { w: 'ולכן', t: 'תוצאה' }, { w: 'על כן', t: 'תוצאה' },
  { w: 'אם', t: 'תנאי' },
  { w: 'כאשר', t: 'זמן' }, { w: 'אחרי ש', t: 'זמן' }, { w: 'לפני ש', t: 'זמן' },
  { w: 'כדי ש', t: 'מטרה' }, { w: 'כדי ל', t: 'מטרה' },
  { w: 'ואילו', t: 'ניגוד' }, { w: 'אף על פי ש', t: 'ניגוד' }, { w: 'מכיוון ש', t: 'סיבה' },
  { w: 'לפיכך', t: 'תוצאה' }, { w: 'במקרה ש', t: 'תנאי' }, { w: 'בזמן ש', t: 'זמן' }, { w: 'יתר על כן', t: 'הוספה' }
];

// משפט עם מקום ריק, התשובה, סוג הקשר ומסיחים שלא מתאימים למשפט
export const CONNECTIVE_SENTENCES = [
  { s: 'רציתי לצאת לשחק בחוץ, ____ התחיל לרדת גשם.', a: 'אבל', t: 'ניגוד', d: ['לכן', 'כי', 'אם'] },
  { s: 'נשארתי בבית ____ הייתי חולה.', a: 'כי', t: 'סיבה', d: ['לכן', 'אבל', 'אם'] },
  { s: 'הייתי חולה, ____ נשארתי בבית.', a: 'לכן', t: 'תוצאה', d: ['כי', 'אבל', 'אם'] },
  { s: '____ ירד גשם, ניקח מטרייה.', a: 'אם', t: 'תנאי', d: ['לכן', 'אבל', 'כי'] },
  { s: 'למדתי הרבה למבחן, ____ קיבלתי ציון גבוה.', a: 'לכן', t: 'תוצאה', d: ['כי', 'אבל', 'אם'] },
  { s: 'קיבלתי ציון גבוה ____ למדתי הרבה למבחן.', a: 'כי', t: 'סיבה', d: ['לכן', 'אבל', 'אם'] },
  { s: 'דני אוהב כדורגל ____ כדורסל.', a: 'וגם', t: 'הוספה', d: ['לכן', 'כי', 'אם'] },
  { s: '____ שהיה קר בחוץ, יצאנו לטייל.', a: 'למרות', t: 'ניגוד', d: ['בגלל', 'כדי', 'לכן'] },
  { s: '____ שסיימתי את שיעורי הבית, יצאתי לשחק.', a: 'אחרי', t: 'זמן', d: ['למרות', 'לכן', 'אם'] },
  { s: 'השקיתי את העציץ ____ שהפרחים יגדלו.', a: 'כדי', t: 'מטרה', d: ['למרות', 'אבל', 'לכן'] },
  { s: 'אחי הגדול גבוה, ____ אני נמוך.', a: 'אבל', t: 'ניגוד', d: ['כי', 'לכן', 'אם'] },
  { s: 'שכחתי את הכובע בבית, ____ חזרתי לקחת אותו.', a: 'לכן', t: 'תוצאה', d: ['כי', 'אבל', 'אם'] },
  { s: '____ נגיע מוקדם, נשיג מקומות טובים.', a: 'אם', t: 'תנאי', d: ['לכן', 'כי', 'אבל'] },
  { s: 'אכלתי ארוחת בוקר ____ שתיתי מיץ.', a: 'וגם', t: 'הוספה', d: ['כי', 'לכן', 'אם'] },
  { s: 'הכלב נבח ____ ראה חתול.', a: 'כי', t: 'סיבה', d: ['לכן', 'אבל', 'אם'] },
  { s: '____ הצלצול נשמע, כל התלמידים יצאו להפסקה.', a: 'כאשר', t: 'זמן', d: ['למרות', 'אבל', 'לכן'] },
  { s: 'הלכתי לישון מוקדם, ____ הייתי עייף מאוד.', a: 'כי', t: 'סיבה', d: ['לכן', 'אבל', 'כדי ש'] },
  { s: 'הייתי עייף מאוד, ____ הלכתי לישון מוקדם.', a: 'ולכן', t: 'תוצאה', d: ['כי', 'אבל', 'אם'] },
  { s: 'מיכל התאמנה כל יום, ____ זכתה במקום הראשון.', a: 'ולכן', t: 'תוצאה', d: ['למרות ש', 'כי', 'כאשר'] },
  { s: '____ שהתאמנה כל יום, מיכל לא זכתה במרוץ.', a: 'למרות', t: 'ניגוד', d: ['בגלל', 'מפני', 'כדי'] },
  { s: 'אני אוהב לקרוא ספרים, ____ אחותי אוהבת לצייר.', a: 'ואילו', t: 'ניגוד', d: ['כי', 'לכן', 'כדי ש'] },
  { s: 'הטלפון נפל על הרצפה, ____ הוא לא נשבר.', a: 'אך', t: 'ניגוד', d: ['לכן', 'כי', 'אם'] },
  { s: '____ שיצאנו לטיול, בדקנו מה מזג האוויר.', a: 'לפני', t: 'זמן', d: ['למרות', 'כדי', 'אם'] },
  { s: 'נועה חסכה כסף ____ לקנות אופניים חדשים.', a: 'כדי', t: 'מטרה', d: ['למרות', 'כאשר', 'לכן'] },
  { s: 'שמנו את החלב במקרר ____ שהוא לא יתקלקל.', a: 'כדי', t: 'מטרה', d: ['למרות', 'אחרי', 'בגלל'] },
  { s: '____ תסיים את שיעורי הבית, תוכל לצאת לשחק.', a: 'אם', t: 'תנאי', d: ['למרות ש', 'כי', 'לכן'] },
  { s: 'לא נוכל לשחק בחוץ ____ ימשיך לרדת גשם.', a: 'אם', t: 'תנאי', d: ['לכן', 'למרות ש', 'כדי ש'] },
  { s: 'בטיול ראינו צבאים, ____ ראינו נשרים בשמיים.', a: 'וגם', t: 'הוספה', d: ['כי', 'לכן', 'כדי ש'] },
  { s: 'הוא לא הגיע לאימון ____ שהיה חולה.', a: 'מפני', t: 'סיבה', d: ['למרות', 'כדי', 'אם'] },
  { s: '____ שהשמש שקעה, הדלקנו מדורה.', a: 'אחרי', t: 'זמן', d: ['למרות', 'כדי', 'אם'] },
  { s: 'הפרחים נבלו ____ שכחנו להשקות אותם.', a: 'כי', t: 'סיבה', d: ['לכן', 'למרות ש', 'כדי ש'] },
  { s: 'שכחנו להשקות את הפרחים, ____ הם נבלו.', a: 'לכן', t: 'תוצאה', d: ['כי', 'למרות ש', 'אם'] },
  { s: 'הכביש היה חלק מהגשם, ____ הנהגים נסעו לאט.', a: 'על כן', t: 'תוצאה', d: ['כי', 'אבל', 'כדי ש'] },
  { s: 'יונתן רץ מהר, ____ הוא לא הספיק לתפוס את האוטובוס.', a: 'אך', t: 'ניגוד', d: ['לכן', 'כי', 'כדי ש'] },
  { s: 'התלמידים שקטו ____ המורה נכנסה לכיתה.', a: 'כאשר', t: 'זמן', d: ['למרות ש', 'אם', 'כדי ש'] },
  { s: 'אמא הכינה עוגה ____ לחגוג את יום ההולדת של סבא.', a: 'כדי', t: 'מטרה', d: ['למרות', 'כאשר', 'אם'] },
  { s: 'בחורף קר בחוץ, ____ בקיץ חם מאוד.', a: 'ואילו', t: 'ניגוד', d: ['כי', 'לכן', 'כדי ש'] },
  { s: '____ שהייתה עייפה, מאיה סיימה לקרוא את כל הספר.', a: 'למרות', t: 'ניגוד', d: ['בגלל', 'כדי', 'מפני'] },
  { s: 'אני אוהב תפוחים ____ בננות.', a: 'וגם', t: 'הוספה', d: ['לכן', 'כי', 'אם'] },
  { s: 'נגמר הלחם, ____ אבא הלך למכולת.', a: 'לכן', t: 'תוצאה', d: ['כי', 'למרות ש', 'אם'] },
  { s: 'אבא הלך למכולת ____ נגמר הלחם.', a: 'כי', t: 'סיבה', d: ['לכן', 'למרות ש', 'אם'] },
  { s: '____ תבוא מוקדם, תוכל לעזור לנו לקשט.', a: 'אם', t: 'תנאי', d: ['למרות ש', 'כי', 'לכן'] },
  { s: 'שמתי כובע ____ שהשמש לא תשרוף לי את הפנים.', a: 'כדי', t: 'מטרה', d: ['למרות', 'בגלל', 'אחרי'] },
  { s: 'הסרט היה ארוך מאוד, ____ הוא היה מעניין.', a: 'אבל', t: 'ניגוד', d: ['לכן', 'כי', 'אם'] }
];

// מילות קישור שאפשר להחליף זו בזו בלי לשנות את המשמעות
const SAME_MEANING = {
  כי: ['מפני ש', 'בגלל ש'], לכן: ['על כן', 'לפיכך'], ולכן: ['על כן', 'לפיכך'], 'על כן': ['לכן', 'לפיכך'],
  אבל: ['אך'], אך: ['אבל'], למרות: ['אף על פי'], מפני: ['בגלל', 'מכיוון']
};

// משפט שמתחיל במילת קישור - ומה מתאים להמשיך (צריך להבין את הקשר, לא רק לזהות מילה)
export const CLAUSES = [
  { start: 'למרות שהיה קר בחוץ,', good: 'יצאנו לטייל בפארק', bad: ['לבשנו מעיל חם', 'נשארנו בבית'], t: 'ניגוד' },
  { start: 'מכיוון שהאוטובוס איחר,', good: 'הגענו לבית הספר באיחור', bad: ['הגענו לבית הספר מוקדם', 'שיחקנו כדורגל בהפסקה'], t: 'סיבה' },
  { start: 'אם תשקה את העציץ כל יום,', good: 'הפרחים יגדלו יפה', bad: ['הפרחים נבלו אתמול', 'הפרחים לא יקבלו מים'], t: 'תנאי' },
  { start: 'נועה למדה הרבה למבחן, ולכן', good: 'היא קיבלה ציון גבוה', bad: ['היא שכחה את כל החומר', 'היא לא פתחה את הספר'], t: 'תוצאה' },
  { start: 'דני רצה לקנות כדור חדש, אבל', good: 'לא היה לו מספיק כסף', bad: ['הוא רצה כדור חדש', 'היה לו הרבה כסף והוא קנה'], t: 'ניגוד' },
  { start: 'הלכנו לישון מוקדם כדי', good: 'לקום מוקדם לטיול', bad: ['שהיינו עייפים', 'שהטיול כבר נגמר'], t: 'מטרה' },
  { start: 'הגשם לא הפסיק, לכן', good: 'המשחק נדחה למחר', bad: ['השמש זרחה כל היום', 'שיחקנו בחוץ כל היום'], t: 'תוצאה' },
  { start: 'אחרי שגמרנו לאכול,', good: 'פינינו את השולחן', bad: ['ערכנו את השולחן לארוחה', 'הלכנו לקנות אוכל לארוחה'], t: 'זמן' },
  { start: 'הכלב נבח בקול רם, כי', good: 'הוא שמע רעש מבחוץ', bad: ['הוא ישן בשקט', 'הוא נבח בקול רם'], t: 'סיבה' },
  { start: 'אחי אוהב כדורגל, ואילו', good: 'אני מעדיפה לרקוד', bad: ['גם אני אוהבת כדורגל', 'הוא משחק כדורגל כל יום'], t: 'ניגוד' },
  { start: 'למרות שהמשחק היה קשה,', good: 'הקבוצה שלנו ניצחה', bad: ['הקבוצה שלנו הפסידה בגלל זה', 'המשחק היה קשה מאוד'], t: 'ניגוד' },
  { start: 'אם לא נמהר,', good: 'נפספס את הרכבת', bad: ['נגיע הרבה לפני הרכבת', 'הרכבת יצאה אתמול'], t: 'תנאי' },
  { start: 'יעל שכחה את המטרייה בבית, ולכן', good: 'היא נרטבה בגשם', bad: ['היא נשארה יבשה לגמרי', 'היא לקחה איתה את המטרייה'], t: 'תוצאה' },
  { start: 'החנות הייתה סגורה, כי', good: 'היה כבר מאוחר בלילה', bad: ['קנינו בה הרבה דברים', 'החנות הייתה סגורה'], t: 'סיבה' },
  { start: 'לפני שיוצאים לטיול,', good: 'ממלאים בקבוק מים', bad: ['מספרים איך היה בטיול', 'חוזרים הביתה מהטיול'], t: 'זמן' },
  { start: 'אבא השקה את הגינה כדי', good: 'שהצמחים לא יתייבשו', bad: ['שהצמחים כבר התייבשו', 'שירד גשם אתמול'], t: 'מטרה' },
  { start: 'רוני אוהב ללכת לים, ואילו', good: 'אחותו מעדיפה את הבריכה', bad: ['גם הוא אוהב ללכת לים', 'הוא הולך לים כל קיץ'], t: 'ניגוד' },
  { start: 'הכביש היה פקוק, לכן', good: 'הגענו מאוחר להופעה', bad: ['הגענו מוקדם מכולם', 'הכביש היה ריק'], t: 'תוצאה' },
  { start: 'מכיוון שהיה חם מאוד,', good: 'שתינו הרבה מים', bad: ['לבשנו מעילים וכפפות', 'הדלקנו את התנור'], t: 'סיבה' },
  { start: 'אף על פי שהסרט היה ארוך,', good: 'לא השתעממנו לרגע', bad: ['נרדמנו באמצע מרוב שעמום', 'הוא היה ארוך מאוד'], t: 'ניגוד' }
];

const RELATION_HINT = {
  הוספה: 'מוסיפים עוד מידע באותו כיוון',
  ניגוד: 'החלק השני הפוך או מפתיע ביחס לראשון',
  סיבה: 'החלק השני מסביר למה',
  תוצאה: 'החלק השני הוא מה שקרה בגלל הראשון',
  תנאי: 'משהו יקרה רק אם יתקיים דבר אחר',
  זמן: 'מתי זה קרה',
  מטרה: 'בשביל מה עושים את הפעולה'
};

const connectivesQuestion = () => {
  const type = pick(['fill', 'fill', 'fill', 'relation', 'sentenceRelation', 'sameMeaning', 'clause', 'clause']);

  if (type === 'relation') {
    const c = draw('connectiveWord', CONNECTIVE_TYPES);
    return {
      kind: 'mc',
      label: 'סוג הקשר',
      prompt: `איזה קשר מבטאת מילת הקישור "${c.w}"?`,
      options: withDistractors(c.t, shuffle(RELATIONS)),
      answer: c.t,
      optionsHebrew: true,
      explanation: `"${c.w}" - קשר של ${c.t}: ${RELATION_HINT[c.t]}.\nעוד מילים עם אותו קשר: ${CONNECTIVE_TYPES.filter(x => x.t === c.t && x.w !== c.w).map(x => x.w).join(', ') || '-'}`
    };
  }

  if (type === 'clause') {
    const c = draw('clause', CLAUSES);
    return {
      kind: 'mc',
      label: 'השלמת משפט',
      prompt: `איך הכי נכון להמשיך את המשפט: "${c.start} ____"?`,
      options: shuffle([c.good, ...c.bad]),
      answer: c.good,
      optionsHebrew: true,
      long: true,
      explanation: `"${c.start} ${c.good}."\nמילת הקישור מבטאת ${c.t}: ${RELATION_HINT[c.t]} - ורק ההמשך הזה מתאים לקשר.`
    };
  }

  const item = draw('connectiveSentence', CONNECTIVE_SENTENCES);
  const full = item.s.replace('____', item.a);

  if (type === 'sameMeaning' && SAME_MEANING[item.a]) {
    const same = pick(SAME_MEANING[item.a]);
    const wrong = shuffle(CONNECTIVE_TYPES.filter(c => c.t !== item.t)).map(c => c.w);
    return {
      kind: 'mc',
      label: 'אותה משמעות',
      prompt: `"${full}"\nאיזו מילת קישור יכולה להחליף את "${item.a}" בלי לשנות את המשמעות?`,
      options: withDistractors(same, wrong),
      answer: same,
      optionsHebrew: true,
      long: true,
      explanation: `"${item.a}" ו"${same}" - שתיהן מבטאות ${item.t}: ${RELATION_HINT[item.t]}.\nשאר המילים מבטאות קשר אחר, ולכן המשמעות הייתה משתנה.`
    };
  }

  if (type === 'sentenceRelation') {
    return {
      kind: 'mc',
      label: 'הקשר במשפט',
      prompt: `מה הקשר שמבטאת מילת הקישור במשפט: "${full}"?`,
      options: withDistractors(item.t, shuffle(RELATIONS)),
      answer: item.t,
      optionsHebrew: true,
      explanation: `מילת הקישור "${item.a}" מבטאת ${item.t}: ${RELATION_HINT[item.t]}.`
    };
  }

  return {
    kind: 'mc',
    label: 'השלמת מילת קישור',
    prompt: `איזו מילת קישור מתאימה למשפט: "${item.s}"?`,
    options: withDistractors(item.a, shuffle(item.d)),
    answer: item.a,
    optionsHebrew: true,
    explanation: `"${full}"\nמילת הקישור "${item.a}" מבטאת ${item.t}: ${RELATION_HINT[item.t]}.`
  };
};

// ======================================================================
// פעלים וזמנים
// ======================================================================
export const PERSONS = [
  { id: 'ani', p: 'אני', person: 1, plural: false },
  { id: 'ata', p: 'אתה', person: 2, plural: false },
  { id: 'at', p: 'את', person: 2, plural: false },
  { id: 'hu', p: 'הוא', person: 3, plural: false },
  { id: 'hi', p: 'היא', person: 3, plural: false },
  { id: 'anachnu', p: 'אנחנו', person: 1, plural: true },
  { id: 'atem', p: 'אתם', person: 2, plural: true },
  { id: 'hem', p: 'הם', person: 3, plural: true }
];

// פעלים בבניין קל עם שורש שלם. fut: o = אכתוב, a = אלמד. obj - השלמה למשפט
export const VERBS = [
  { root: 'כ.ת.ב', fut: 'o', obj: 'מכתב' },
  { root: 'ש.מ.ר', fut: 'o', obj: 'על אחי הקטן' },
  { root: 'ס.ג.ר', fut: 'o', obj: 'את הדלת' },
  { root: 'ר.ק.ד', fut: 'o', obj: 'בהופעה' },
  { root: 'ז.כ.ר', fut: 'o', obj: 'את השיר' },
  { root: 'ש.ב.ר', fut: 'o', obj: 'את הכוס' },
  { root: 'ל.מ.ד', fut: 'a', obj: 'למבחן' },
  { root: 'ש.מ.ע', fut: 'a', obj: 'מוזיקה' },
  { root: 'פ.ת.ח', fut: 'a', obj: 'את החלון' },
  { root: 'ל.ב.ש', fut: 'a', obj: 'מעיל' },
  { root: 'ש.א.ל', fut: 'a', obj: 'שאלה' },
  { root: 'ק.ר.א', fut: 'a', obj: 'ספר' },
  { root: 'ר.כ.ב', fut: 'a', obj: 'על אופניים' },
  { root: 'ה.ל.כ', fut: 'halach', obj: 'לבית הספר' }
];

const fin = (w) => w.replace(/[כמנפצ]$/, c => REGULAR_TO_FINAL[c]);
const letters = (root) => root.split('.').map(c => FINAL_TO_REGULAR[c] || c);

/** כל הנטיות של פועל: forms.past.ani = "כתבתי" וכו' */
export const conjugate = (verb) => {
  const [c1, c2, c3] = letters(verb.root);
  const base = c1 + c2 + c3;
  const past = {
    ani: base + 'תי', ata: base + 'ת', at: base + 'ת', hu: fin(base), hi: base + 'ה',
    anachnu: base + 'נו', atem: base + 'תם', hem: base + 'ו'
  };
  const pres = { ms: fin(c1 + 'ו' + c2 + c3), fs: c1 + 'ו' + c2 + c3 + 'ת', mp: c1 + 'ו' + c2 + c3 + 'ים' };
  const present = {
    ani: pres.ms, ata: pres.ms, hu: pres.ms, at: pres.fs, hi: pres.fs,
    anachnu: pres.mp, atem: pres.mp, hem: pres.mp
  };
  let future;
  if (verb.fut === 'halach') {
    future = { ani: 'אלך', ata: 'תלך', at: 'תלכי', hu: 'ילך', hi: 'תלך', anachnu: 'נלך', atem: 'תלכו', hem: 'ילכו' };
  } else {
    const stem = verb.fut === 'o' ? fin(c1 + c2 + 'ו' + c3) : fin(base);
    future = {
      ani: 'א' + stem, ata: 'ת' + stem, at: 'ת' + base + 'י', hu: 'י' + stem, hi: 'ת' + stem,
      anachnu: 'נ' + stem, atem: 'ת' + base + 'ו', hem: 'י' + base + 'ו'
    };
  }
  return { past, present, future };
};

export const TENSE_NAMES = { past: 'עבר', present: 'הווה', future: 'עתיד' };
const TIME_WORDS = {
  past: ['אתמול', 'בשבוע שעבר', 'לפני שנה', 'שלשום'],
  present: ['עכשיו', 'כרגע', 'בדיוק עכשיו'],
  future: ['מחר', 'בשבוע הבא', 'בעוד שעה']
};
// נושא המשפט לכל גוף (בשלישי - שמות, כדי שיהיה טבעי)
const SUBJECTS_FOR = {
  ani: ['אני'], ata: ['אתה'], at: ['את'], hu: ['הוא', 'דני', 'יונתן'], hi: ['היא', 'נועה', 'מאיה'],
  anachnu: ['אנחנו'], atem: ['אתם'], hem: ['הם', 'הילדים']
};
const TENSES = ['past', 'present', 'future'];

/** גופים שהצורה שלהם בזמן הזה שונה מכל השאר (כדי שתהיה תשובה אחת בלבד) */
const uniquePersons = (forms, tense) => PERSONS.filter(x => Object.values(forms[tense]).filter(f => f === forms[tense][x.id]).length === 1);

const tensesQuestion = () => {
  const type = pick(['fillByTime', 'fillByTime', 'identify', 'identify', 'convert', 'timeWord']);
  const verb = pick(VERBS);
  const forms = conjugate(verb);
  const person = pick(PERSONS);
  const subj = pick(SUBJECTS_FOR[person.id]);
  const tense = pick(TENSES);

  if (type === 'fillByTime') {
    const time = pick(TIME_WORDS[tense]);
    const answer = forms[tense][person.id];
    const sameTenseOther = PERSONS.map(x => forms[tense][x.id]).filter(f => f !== answer);
    return {
      kind: 'mc',
      label: 'הפועל בזמן הנכון',
      prompt: `השלימו את הפועל המתאים: "${time} ${subj} ____ ${verb.obj}."`,
      options: withDistractors(answer, [...TENSES.filter(t => t !== tense).map(t => forms[t][person.id]), pick(sameTenseOther)]),
      answer,
      optionsHebrew: true,
      explanation: `"${time}" ← זמן ${TENSE_NAMES[tense]}.\n${subj} + ${TENSE_NAMES[tense]} ← "${answer}": "${time} ${subj} ${answer} ${verb.obj}."`
    };
  }

  if (type === 'identify') {
    const form = forms[tense][person.id];
    return {
      kind: 'mc',
      label: 'באיזה זמן?',
      prompt: `באיזה זמן כתוב הפועל "${form}" במשפט: "${subj} ${form} ${verb.obj}."?`,
      options: ['עבר', 'הווה', 'עתיד'],
      answer: TENSE_NAMES[tense],
      optionsHebrew: true,
      explanation: tense === 'past'
        ? `"${form}" - כבר קרה ← עבר. בעבר יש סיומות כמו תי, ת, ה, נו, תם, ו.`
        : tense === 'present'
          ? `"${form}" - קורה עכשיו ← הווה. בהווה יש צורות כמו כותב, כותבת, כותבים.`
          : `"${form}" - עוד יקרה ← עתיד. בעתיד יש אותיות בהתחלה: א, ת, י, נ (אית"ן).`
    };
  }

  if (type === 'convert') {
    const [from, to] = sample(TENSES, 2);
    const fromForm = forms[from][person.id];
    const answer = forms[to][person.id];
    const third = TENSES.find(t => t !== from && t !== to);
    const otherPerson = PERSONS.map(x => forms[to][x.id]).filter(f => f !== answer);
    return {
      kind: 'mc',
      label: 'מעבירים זמן',
      prompt: `"${subj} ${fromForm} ${verb.obj}." - איך כותבים את המשפט בזמן ${TENSE_NAMES[to]}?`,
      options: withDistractors(`${subj} ${answer} ${verb.obj}.`, [`${subj} ${fromForm} ${verb.obj}.`, `${subj} ${forms[third][person.id]} ${verb.obj}.`, `${subj} ${pick(otherPerson)} ${verb.obj}.`]),
      answer: `${subj} ${answer} ${verb.obj}.`,
      optionsHebrew: true,
      explanation: `${TENSE_NAMES[from]} ← ${TENSE_NAMES[to]}: "${fromForm}" ← "${answer}". השורש נשאר ${verb.root}, והגוף (${person.p}) לא משתנה.`
    };
  }

  // timeWord
  const form = forms[tense][person.id];
  const answer = pick(TIME_WORDS[tense]);
  return {
    kind: 'mc',
    label: 'מילת זמן',
    prompt: `איזו מילת זמן מתאימה: "____ ${subj} ${form} ${verb.obj}."?`,
    options: shuffle([answer, ...TENSES.filter(t => t !== tense).map(t => pick(TIME_WORDS[t]))]),
    answer,
    optionsHebrew: true,
    explanation: `"${form}" בזמן ${TENSE_NAMES[tense]}, ולכן מתאימה מילת זמן של ${TENSE_NAMES[tense]}: ${TIME_WORDS[tense].join(', ')}.`
  };
};

const verbsQuestion = () => {
  const type = pick(['findVerb', 'findVerb', 'rootOfVerb', 'rootOfVerb', 'whoDoes', 'match']);
  const verb = pick(VERBS);
  const forms = conjugate(verb);
  const tense = pick(TENSES);

  if (type === 'findVerb') {
    const s = draw('verbSentence', VERB_SENTENCES);
    const v = wordsOf(s, 'v')[0];
    return {
      kind: 'mc',
      label: 'הפועל במשפט',
      prompt: `מהו הפועל במשפט: "${sentenceText(s)}"?`,
      options: shuffle([v, ...sample(s.map(([w]) => w).filter(w => w !== v && w !== 'את' && w !== 'אל'), 3)]),
      answer: v,
      optionsHebrew: true,
      explanation: `פועל מתאר פעולה - מה עושים / מה קרה. "${v}" זו הפעולה במשפט.\n"${wordsOf(s, 'n')[0]}" - שם עצם (מי עושה).`
    };
  }

  if (type === 'rootOfVerb') {
    const person = pick(PERSONS);
    const form = forms[tense][person.id];
    const trap = firstLettersTrap(form);
    const others = shuffle(VERBS.filter(x => x !== verb)).map(x => x.root.replace(/\.כ$/, '.ך'));
    const root = verb.root.replace(/\.כ$/, '.ך');
    return {
      kind: 'mc',
      label: 'שורש הפועל',
      prompt: `מה השורש של הפועל "${form}"?`,
      options: withDistractors(root, [trap !== root ? trap : null, ...others].filter(Boolean)),
      answer: root,
      optionsHebrew: true,
      explanation: `מורידים את אותיות הזמן והגוף (כמו א, ת, י, נ בהתחלה, ו-תי, ה, ו, ים בסוף) - נשארות אותיות השורש: ${root}.\nמאותו שורש: ${forms.past.hu}, ${forms.present.hu}, ${forms.future.hu}.`
    };
  }

  if (type === 'whoDoes') {
    const t = tense === 'present' ? pick(['past', 'future']) : tense;
    const candidates = uniquePersons(forms, t);
    const person = pick(candidates);
    const form = forms[t][person.id];
    return {
      kind: 'mc',
      label: 'מי עושה את הפעולה?',
      prompt: `איזה כינוי גוף מתאים לפועל "${form}"?`,
      options: withDistractors(person.p, shuffle(PERSONS.filter(x => forms[t][x.id] !== form).map(x => x.p))),
      answer: person.p,
      optionsHebrew: true,
      explanation: `"${person.p} ${form}" - ${t === 'past' ? 'בעבר הסיומת מגלה מי עשה' : 'בעתיד האות בהתחלה (ולפעמים הסיומת) מגלה מי יעשה'}.`
    };
  }

  // match: איזה פועל מתאים לכינוי הגוף (אותו זמן, גופים שונים)
  const t = tense === 'present' ? pick(['past', 'future']) : tense;
  const person = pick(uniquePersons(forms, t));
  const answer = forms[t][person.id];
  return {
    kind: 'mc',
    label: 'פועל + כינוי גוף',
    prompt: `השלימו: "${person.p} ____ ${verb.obj}."`,
    options: withDistractors(answer, shuffle(PERSONS.map(x => forms[t][x.id]).filter(f => f !== answer))),
    answer,
    optionsHebrew: true,
    explanation: `הפועל צריך להתאים לכינוי הגוף: "${person.p} ${answer}".`
  };
};

// ======================================================================
// כינויי גוף
// ======================================================================
export const ALL_PRONOUNS = ['אני', 'אתה', 'את', 'הוא', 'היא', 'אנחנו', 'אתם', 'אתן', 'הם', 'הן'];
export const PRONOUN_INFO = {
  אני: 'גוף ראשון, יחיד', אנחנו: 'גוף ראשון, רבים',
  אתה: 'גוף שני, יחיד', את: 'גוף שני, יחיד', אתם: 'גוף שני, רבים', אתן: 'גוף שני, רבים',
  הוא: 'גוף שלישי, יחיד', היא: 'גוף שלישי, יחיד', הם: 'גוף שלישי, רבים', הן: 'גוף שלישי, רבים'
};

// מילים שאפשר להחליף בכינוי גוף
export const REPLACE_ITEMS = [
  { w: 'דני', a: 'הוא' }, { w: 'נועה', a: 'היא' }, { w: 'דני ויוסי', a: 'הם' }, { w: 'נועה ומיכל', a: 'הן' },
  { w: 'דני ונועה', a: 'הם' }, { w: 'אני ואבא', a: 'אנחנו' }, { w: 'אתה ודני', a: 'אתם' }, { w: 'את ונועה', a: 'אתן' },
  { w: 'הכלב', a: 'הוא' }, { w: 'הספרים', a: 'הם' }, { w: 'המחברות', a: 'הן' }, { w: 'המורה רותי', a: 'היא' },
  { w: 'סבא וסבתא', a: 'הם' }, { w: 'הילדות', a: 'הן' }, { w: 'אני ואימא', a: 'אנחנו' }, { w: 'הציפור', a: 'היא' }
];

const pronounsQuestion = () => {
  const type = pick(['replace', 'replace', 'agree', 'agree', 'classify']);

  if (type === 'replace') {
    const item = draw('replace', REPLACE_ITEMS);
    return {
      kind: 'mc',
      label: 'מחליפים בכינוי גוף',
      prompt: `איזה כינוי גוף יכול להחליף את המילים "${item.w}"?`,
      options: withDistractors(item.a, shuffle(ALL_PRONOUNS)),
      answer: item.a,
      optionsHebrew: true,
      explanation: item.a === 'אנחנו'
        ? `"${item.w}" - כולל אותי ← אנחנו.`
        : item.a === 'אתם' || item.a === 'אתן'
          ? `"${item.w}" - מדברים אל כמה אנשים ← ${item.a}.`
          : item.a === 'הם'
            ? `"${item.w}" - רבים (כשיש בקבוצה גם זכר - אומרים "הם") ← הם.`
            : item.a === 'הן'
              ? `"${item.w}" - כמה, כולן נקבה ← הן.`
              : `"${item.w}" - ${item.a === 'הוא' ? 'אחד, זכר' : 'אחת, נקבה'} ← ${item.a}.`
    };
  }

  if (type === 'agree') {
    const verb = pick(VERBS);
    const forms = conjugate(verb);
    const t = pick(['past', 'future']);
    const person = pick(uniquePersons(forms, t));
    const form = forms[t][person.id];
    return {
      kind: 'mc',
      label: 'כינוי הגוף המתאים',
      prompt: `איזה כינוי גוף מתאים: "____ ${form} ${verb.obj}."?`,
      options: withDistractors(person.p, shuffle(PERSONS.filter(x => forms[t][x.id] !== form).map(x => x.p))),
      answer: person.p,
      optionsHebrew: true,
      explanation: `הפועל "${form}" מתאים רק ל"${person.p}": "${person.p} ${form} ${verb.obj}."`
    };
  }

  // classify
  const p = pick(ALL_PRONOUNS);
  const answer = PRONOUN_INFO[p];
  return {
    kind: 'mc',
    label: 'גוף ומספר',
    prompt: `כינוי הגוף "${p}" הוא:`,
    options: withDistractors(answer, shuffle([...new Set(Object.values(PRONOUN_INFO))])),
    answer,
    optionsHebrew: true,
    explanation: 'גוף ראשון - מי שמדבר (אני, אנחנו). גוף שני - מי שמדברים אליו (אתה, את, אתם, אתן). גוף שלישי - מי שמדברים עליו (הוא, היא, הם, הן).'
  };
};

// ======================================================================
const GENERATORS = {
  hRoots: rootsQuestion,
  hNouns: nounsQuestion,
  hConnectives: connectivesQuestion,
  hTenses: tensesQuestion,
  hVerbs: verbsQuestion,
  hPronouns: pronounsQuestion
};

export const HEBREW_TOPIC_IDS = Object.keys(GENERATORS);

/** שאלה חדשה בנושא. במבחן המסכם (hTest) - מנושא אקראי */
export const generateHebrewQuestion = (categoryId) => {
  const topic = categoryId === 'hTest' ? pick(HEBREW_TOPIC_IDS) : categoryId;
  const gen = GENERATORS[topic];
  if (!gen) throw new Error(`Unknown hebrew category: ${categoryId}`);
  return { ...gen(), topic };
};

export const _test = { familyOf, firstLettersTrap, wrongPlurals, uniquePersons };
