// שאלות בשפה (לשון) - כיתה ה'. מבוסס על רשימת הנושאים של המורה למבחן (1.11.2026):
// שורשים ומשפחות מילים, שמות עצם, מילות קישור, זמנים, פעלים, כינויי גוף.
// כל התוכן כתוב ביד (בלי "חישוב" של עברית) - כדי שיהיה מדויק. בשורשים רק שורשים "שלמים" (בלי אותיות שנופלות).

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

const familyOf = (word) => ROOT_FAMILIES.find(f => f.words.includes(word));
const otherFamilies = (fam) => ROOT_FAMILIES.filter(f => f !== fam);
const FINAL_TO_REGULAR = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };
const REGULAR_TO_FINAL = { 'כ': 'ך', 'מ': 'ם', 'נ': 'ן', 'פ': 'ף', 'צ': 'ץ' };

/** "מלכודת": שלוש האותיות הראשונות של המילה - טעות נפוצה במציאת שורש */
const firstLettersTrap = (word) => {
  const letters = word.replace(/[^א-ת]/g, '').split('').slice(0, 3).map(c => FINAL_TO_REGULAR[c] || c);
  if (letters.length < 3) return null;
  letters[2] = REGULAR_TO_FINAL[letters[2]] || letters[2];
  return letters.join('.');
};

const rootsQuestion = () => {
  const type = pick(['rootOf', 'rootOf', 'sameFamily', 'oddOne', 'fromRoot']);
  const fam = pick(ROOT_FAMILIES);
  const others = shuffle(otherFamilies(fam));

  if (type === 'rootOf') {
    const word = pick(fam.words);
    const trap = firstLettersTrap(word);
    return {
      kind: 'mc',
      label: 'מציאת שורש',
      prompt: `מה השורש של המילה "${word}"?`,
      options: withDistractors(fam.root, [trap !== fam.root ? trap : null, ...others.map(f => f.root)].filter(Boolean)),
      answer: fam.root,
      optionsHebrew: true,
      explanation: `מורידים את התוספות (אותיות בהתחלה, בסוף, ו' וי' באמצע) ומחפשים את 3 האותיות שחוזרות בכל המשפחה.\n${fam.words.slice(0, 3).join(', ')} - בכולן השורש ${fam.root}`
    };
  }

  if (type === 'sameFamily') {
    const [given, match] = sample(fam.words, 2);
    return {
      kind: 'mc',
      label: 'משפחת מילים',
      prompt: `איזו מילה שייכת למשפחת המילים של "${given}"?`,
      options: withDistractors(match, others.map(f => pick(f.words))),
      answer: match,
      optionsHebrew: true,
      explanation: `ל"${given}" ול"${match}" יש אותו שורש: ${fam.root}. מילים עם אותו שורש הן משפחה אחת.`
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
  return {
    kind: 'mc',
    label: 'מילה מהשורש',
    prompt: `איזו מילה בנויה מהשורש ${fam.root}?`,
    options: withDistractors(word, others.map(f => pick(f.words))),
    answer: word,
    optionsHebrew: true,
    explanation: `במילה "${word}" יש את אותיות השורש ${fam.root.replace(/\./g, ', ')}, לפי הסדר.`
  };
};

// ======================================================================
// שמות עצם
// ======================================================================
// [יחיד, רבים, מין]. כולל "מלכודות": נקבה עם ים (ציפור, שנה) וזכר עם ות (שולחן, לילה)
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
  ['יד', 'ידיים', 'נ'], ['עין', 'עיניים', 'נ'], ['כדור', 'כדורים', 'ז'], ['עוגה', 'עוגות', 'נ']
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
const sentenceText = (s) => s.map(([w]) => w).join(' ');
const wordsOf = (s, tag) => s.filter(([, t]) => t === tag).map(([w]) => w);

const SINGLE_VERBS = ['רץ', 'כתבה', 'שומעים', 'ילך', 'קופצת', 'שרו', 'נסע', 'אוכלים'];
const SINGLE_ADJ = ['גדול', 'חכם', 'קטנים', 'שמח', 'אדומות', 'חדש'];
const SINGLE_ADV = ['מהר', 'לאט', 'אתמול', 'מאוד', 'מחר', 'עכשיו'];

const nounsQuestion = () => {
  const type = pick(['gender', 'plural', 'plural', 'singular', 'findNoun', 'findNoun', 'isNoun', 'number']);
  const [sing, plural, gender] = pick(NOUNS);

  if (type === 'gender') {
    const answer = gender === 'ז' ? 'זכר' : 'נקבה';
    return {
      kind: 'mc',
      label: 'זכר או נקבה?',
      prompt: `מה המין של שם העצם "${sing}"?`,
      options: ['זכר', 'נקבה'],
      answer,
      optionsHebrew: true,
      explanation: `בודקים עם "זה" / "זאת": ${gender === 'ז' ? `"${sing} אחד, זה ה${sing}"` : `"${sing} אחת, זאת ה${sing}"`} ← ${answer}.\nשימו לב: הסיומת ברבים (ים / ות) לא תמיד מגלה את המין!`
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
      explanation: `${gender === 'ז' ? `${sing} אחד` : `${sing} אחת`} ← הרבה ${plural}.${(gender === 'נ' && plural.endsWith('ים')) || (gender === 'ז' && plural.endsWith('ות')) ? `\nשימו לב: "${sing}" היא ${gender === 'נ' ? 'נקבה' : 'זכר'}, אבל ברבים - "${plural}".` : ''}`
    };
  }

  if (type === 'singular') {
    return {
      kind: 'mc',
      label: 'רבים ← יחיד',
      prompt: `מה צורת היחיד של "${plural}"?`,
      options: withDistractors(sing, shuffle([plural.replace(/(ים|ות)$/, ''), plural.replace(/(ים|ות)$/, 'ה'), plural.replace(/(ים|ות)$/, 'ת'), plural].filter(w => w.length > 1))),
      answer: sing,
      optionsHebrew: true,
      explanation: `הרבה ${plural} ← ${gender === 'ז' ? `${sing} אחד` : `${sing} אחת`}.`
    };
  }

  if (type === 'number') {
    const usePlural = Math.random() < 0.5;
    const word = usePlural ? plural : sing;
    const answer = usePlural ? 'רבים' : 'יחיד';
    return {
      kind: 'mc',
      label: 'יחיד או רבים?',
      prompt: `שם העצם "${word}" הוא ביחיד או ברבים?`,
      options: ['יחיד', 'רבים'],
      answer,
      optionsHebrew: true,
      explanation: usePlural ? `"${word}" - יותר מאחד (הרבה ${plural}) ← רבים. ביחיד: ${sing}.` : `"${word}" - אחד בלבד ← יחיד. ברבים: ${plural}.`
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
  const s = pick(TAGGED_SENTENCES);
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
  { w: 'כדי ש', t: 'מטרה' }, { w: 'כדי ל', t: 'מטרה' }
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
  { s: '____ הצלצול נשמע, כל התלמידים יצאו להפסקה.', a: 'כאשר', t: 'זמן', d: ['למרות', 'אבל', 'לכן'] }
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
  const type = pick(['fill', 'fill', 'fill', 'relation', 'sentenceRelation']);

  if (type === 'relation') {
    const c = pick(CONNECTIVE_TYPES);
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

  const item = pick(CONNECTIVE_SENTENCES);
  const full = item.s.replace('____', item.a);

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
    const s = pick(TAGGED_SENTENCES);
    const v = wordsOf(s, 'v')[0];
    return {
      kind: 'mc',
      label: 'הפועל במשפט',
      prompt: `מהו הפועל במשפט: "${sentenceText(s)}"?`,
      options: shuffle(s.map(([w]) => w)),
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
    const item = pick(REPLACE_ITEMS);
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
