// הגדרות הטפסים בממשק הניהול: לכל נושא - אילו מאגרים יש בו, אילו שדות, איך בודקים ואיך מציגים בשורה
import { mathCategories } from './mathCategories';

const WORD_GROUPS = [
  ['family', 'משפחה ואנשים'], ['jobs', 'מקצועות'], ['animals', 'חיות'], ['food', 'אוכל'],
  ['school', 'בית ספר'], ['home', 'בית'], ['body', 'גוף'], ['clothes', 'בגדים'],
  ['nature', 'טבע ומזג אוויר'], ['places', 'מקומות ותחבורה'], ['verbs', 'פעלים'],
  ['adjectives', 'תארים'], ['colors', 'צבעים'], ['days', 'ימים וזמנים'], ['hobbies', 'תחביבים']
];

const BLANK = '____';
const trim = (v) => (typeof v === 'string' ? v.trim() : v);
const hasBlank = (s) => typeof s === 'string' && s.includes(BLANK);
const filled = (arr) => Array.isArray(arr) && arr.every(v => trim(v));

const grammarBank = (bank, title, options, example) => ({
  bank,
  title,
  fields: [
    { name: 'sentence', label: 'המשפט (במקום החסר: ____ )', type: 'text', ltr: true, placeholder: example, blankButton: true },
    { name: 'answer', label: 'התשובה הנכונה', type: 'select', options: options.map(o => [o, o]) },
    { name: 'why', label: 'הסבר קצר בעברית (מופיע אחרי התשובה)', type: 'text' }
  ],
  validate: (it) => {
    if (!hasBlank(it.sentence)) return 'במשפט חייב להופיע ____ במקום המילה החסרה';
    if (!options.map(o => o.toLowerCase()).includes((it.answer || '').toLowerCase())) return 'צריך לבחור תשובה נכונה';
    return null;
  },
  summary: (it) => it.sentence.replace(BLANK, `[${it.answer}]`)
});

const passageBank = (bank, title) => ({
  bank,
  title,
  fields: [
    { name: 'title', label: 'כותרת (באנגלית)', type: 'text', ltr: true, placeholder: 'My Best Friend' },
    { name: 'text', label: bank === 'listening' ? 'הטקסט שיוקרא בקול' : 'הקטע', type: 'textarea', ltr: true },
    { name: 'questions', label: 'שאלות על הקטע', type: 'questions' }
  ],
  validate: (it) => {
    if (!trim(it.title) || !trim(it.text)) return 'חסרים כותרת או טקסט';
    const qs = it.questions || [];
    if (qs.length === 0) return 'צריך לפחות שאלה אחת';
    for (let i = 0; i < qs.length; i++) {
      const q = qs[i];
      const n = `שאלה ${i + 1}: `;
      if (q.type !== 'order' && !trim(q.q)) return n + 'חסר נוסח השאלה';
      if (q.type === 'mc') {
        if (!filled(q.options) || q.options.length < 2) return n + 'צריך למלא את כל האפשרויות';
        if (new Set(q.options.map(trim)).size !== q.options.length) return n + 'יש אפשרויות כפולות';
        if (!q.options.includes(q.answer)) return n + 'צריך לסמן את התשובה הנכונה';
      }
      if (q.type === 'yesno' && !['Yes', 'No'].includes(q.answer)) return n + 'צריך לבחור Yes או No';
      if (q.type === 'order' && (!filled(q.events) || q.events.length < 2)) return n + 'צריך לפחות 2 אירועים מלאים';
    }
    return null;
  },
  summary: (it) => `${it.title} · ${(it.questions || []).length} שאלות`
});

export const ADMIN_SECTIONS = [
  {
    id: 'vocabulary',
    banks: [
      {
        bank: 'words',
        title: 'מילים',
        fields: [
          { name: 'en', label: 'המילה באנגלית', type: 'text', ltr: true, placeholder: 'giraffe' },
          { name: 'he', label: 'הפירוש בעברית', type: 'text', placeholder: 'ג\'ירפה' },
          { name: 'emoji', label: 'אימוג\'י - לא חובה (אם יש, המילה תופיע גם בשאלות "התאמת מילה לתמונה")', type: 'text', placeholder: '🦒' },
          { name: 'def', label: 'הגדרה פשוטה באנגלית', type: 'text', ltr: true, placeholder: 'A very tall animal with a long neck.' },
          { name: 'group', label: 'קבוצה (המסיחים נבחרים מאותה קבוצה)', type: 'select', options: WORD_GROUPS }
        ],
        validate: (it) => (!trim(it.en) || !trim(it.he) || !trim(it.def)
          ? 'צריך למלא מילה, פירוש והגדרה' : null),
        summary: (it) => `${it.emoji ? `${it.emoji} ` : ''}${it.en} = ${it.he}`
      },
      {
        bank: 'fill',
        title: 'משפטי השלמה (מחסן מילים)',
        fields: [
          { name: 'sentence', label: 'המשפט (במקום החסר: ____ )', type: 'text', ltr: true, placeholder: 'I drink ____ every morning.', blankButton: true },
          { name: 'answer', label: 'המילה הנכונה', type: 'text', ltr: true, placeholder: 'milk' },
          { name: 'distractors', label: '3 מילים לא נכונות', type: 'list', count: 3, ltr: true }
        ],
        validate: (it) => {
          if (!hasBlank(it.sentence)) return 'במשפט חייב להופיע ____ במקום המילה החסרה';
          if (!trim(it.answer) || !filled(it.distractors)) return 'צריך למלא תשובה ו-3 מילים לא נכונות';
          if (new Set([it.answer, ...it.distractors].map(trim)).size !== 4) return 'יש מילים כפולות';
          return null;
        },
        summary: (it) => it.sentence.replace(BLANK, `[${it.answer}]`)
      }
    ]
  },
  { id: 'isAre', banks: [grammarBank('isAre', 'משפטים', ['am', 'is', 'are'], 'She ____ my best friend.')] },
  { id: 'hasHave', banks: [grammarBank('hasHave', 'משפטים', ['has', 'have'], 'My sister ____ a red bike.')] },
  { id: 'canCant', banks: [grammarBank('canCant', 'משפטים', ['can', 'can\'t'], 'A fish ____ swim.')] },
  {
    id: 'becauseWhy',
    banks: [
      grammarBank('becauseWhy', 'השלמת Why / because', ['Why', 'because'], '____ are you sad?'),
      {
        bank: 'whyMatch',
        title: 'התאמת שאלה לתשובה',
        fields: [
          { name: 'q', label: 'שאלת Why', type: 'text', ltr: true, placeholder: 'Why are you wearing a hat?' },
          { name: 'a', label: 'התשובה הנכונה', type: 'text', ltr: true, placeholder: 'Because it is sunny.' },
          { name: 'distractors', label: '3 תשובות לא נכונות', type: 'list', count: 3, ltr: true }
        ],
        validate: (it) => (!trim(it.q) || !trim(it.a) || !filled(it.distractors)
          ? 'צריך למלא שאלה, תשובה ו-3 תשובות לא נכונות' : null),
        summary: (it) => `${it.q} → ${it.a}`
      }
    ]
  },
  {
    id: 'sentenceOrder',
    banks: [{
      bank: 'sentences',
      title: 'משפטים לסידור',
      fields: [
        { name: 'en', label: 'המשפט הנכון באנגלית (המילים יעורבבו לבד)', type: 'text', ltr: true, placeholder: 'Our teacher is very kind.' },
        { name: 'he', label: 'תרגום לעברית (מוצג כרמז)', type: 'text' }
      ],
      validate: (it) => {
        if (!trim(it.en) || !trim(it.he)) return 'צריך למלא משפט ותרגום';
        if (trim(it.en).split(/\s+/).length < 3) return 'המשפט צריך לפחות 3 מילים';
        return null;
      },
      summary: (it) => it.en
    }]
  },
  { id: 'reading', banks: [passageBank('reading', 'קטעי קריאה')] },
  { id: 'listening', banks: [passageBank('listening', 'קטעי האזנה')] },
  {
    id: 'writing',
    banks: [{
      bank: 'writing',
      title: 'איזה משפט כתוב נכון?',
      fields: [
        { name: 'correct', label: 'המשפט הנכון', type: 'text', ltr: true, placeholder: 'My name is Noa.' },
        { name: 'wrong', label: '3 גרסאות עם טעות', type: 'list', count: 3, ltr: true },
        { name: 'why', label: 'הסבר קצר בעברית', type: 'text' }
      ],
      validate: (it) => {
        if (!trim(it.correct) || !filled(it.wrong)) return 'צריך למלא משפט נכון ו-3 גרסאות עם טעות';
        if (new Set([it.correct, ...it.wrong].map(trim)).size !== 4) return 'כל הגרסאות צריכות להיות שונות זו מזו';
        return null;
      },
      summary: (it) => it.correct
    }]
  }
];

// ---------- חשבון ----------
// השאלות בחשבון נוצרות אוטומטית; כאן מוסיפים שאלות משלך לכל נושא, והן מתערבבות בתרגול.
// מאגר לכל נושא בשם הנושא (למשל mFractionAdd).
const NUMBER = /^\d{1,3}(,\d{3})*$|^\d+$/;

export const mathBank = (topicId) => ({
  bank: topicId,
  title: 'שאלות שהוספת',
  subject: 'math',
  fields: [
    { name: 'kind', label: 'סוג השאלה', type: 'select', options: [['mc', 'בחירה מתוך 4 תשובות'], ['input', 'הקלדת מספר']] },
    { name: 'prompt', label: 'השאלה (בעברית)', type: 'textarea', rows: 3, placeholder: 'כמה הם 3/4 מ-20 תפוחים?' },
    { name: 'expr', label: 'תרגיל להצגה גדולה (לא חובה). שבר: 3/4 · מספר מעורב: 2 1/4 · כפל: × · חילוק: 12 : 3', type: 'text', ltr: true, placeholder: '2 3/5 + 1 4/5 = ?' },
    { name: 'answer', label: 'התשובה הנכונה', type: 'text', placeholder: '15' },
    { name: 'distractors', label: '3 תשובות לא נכונות', type: 'list', count: 3, showIf: (it) => it.kind === 'mc' },
    { name: 'unit', label: 'יחידה ליד התשובה (לא חובה), למשל ס"מ או ₪', type: 'text', showIf: (it) => it.kind === 'input' },
    { name: 'explanation', label: 'הסבר "איך פותרים" (כל שלב בשורה נפרדת)', type: 'textarea', rows: 4 }
  ],
  validate: (it) => {
    if (!trim(it.prompt)) return 'צריך לכתוב את השאלה';
    if (!trim(it.answer)) return 'צריך לכתוב את התשובה הנכונה';
    if (it.kind === 'input' && !NUMBER.test(trim(it.answer))) return 'בהקלדת מספר - התשובה חייבת להיות מספר שלם (למשל 1250 או 1,250)';
    if (it.kind === 'mc') {
      if (!filled(it.distractors)) return 'צריך למלא 3 תשובות לא נכונות';
      if (new Set([it.answer, ...it.distractors].map(trim)).size !== 4) return 'יש תשובות כפולות';
    }
    return null;
  },
  // שומרים רק את השדות שמתאימים לסוג השאלה
  prepare: (it) => {
    const out = { ...it };
    if (out.kind === 'input') {
      delete out.distractors;
      out.answer = out.answer.replace(/,/g, '');
    } else {
      delete out.unit;
    }
    Object.keys(out).forEach(k => { if (out[k] === '') delete out[k]; });
    return out;
  },
  summary: (it) => `${[it.prompt, it.expr].filter(Boolean).join('  ')}  ← ${it.answer}${it.unit ? ` ${it.unit}` : ''}`
});

export const MATH_ADMIN_SECTIONS = mathCategories
  .filter(c => !c.testLength)
  .map(c => ({ id: c.id, subject: 'math', banks: [mathBank(c.id)] }));

// ערכים התחלתיים לטופס ריק
export const emptyItem = (bankDef) => {
  const item = {};
  bankDef.fields.forEach(f => {
    if (f.type === 'list') item[f.name] = Array(f.count).fill('');
    else if (f.type === 'select') item[f.name] = f.options[0][0];
    else if (f.type === 'questions') item[f.name] = [emptyPassageQuestion('mc')];
    else item[f.name] = '';
  });
  return item;
};

export const emptyPassageQuestion = (type) => {
  if (type === 'yesno') return { type, q: '', answer: 'Yes' };
  if (type === 'order') return { type, q: 'Put the events in order:', events: ['', '', ''] };
  return { type: 'mc', q: '', options: ['', '', '', ''], answer: '' };
};

// ניקוי רווחים לפני שמירה
export const cleanItem = (value) => {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) return value.map(cleanItem);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, cleanItem(v)]));
  }
  return value;
};
