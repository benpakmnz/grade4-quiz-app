import { words, fillSentences } from './vocabulary';
import { isAre, hasHave, canCant, becauseWhy, whyMatch } from './grammar';
import { sentences } from './sentences';
import { readingPassages, listeningPassages } from './reading';

export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// מעקב אחרי שאלות שכבר הופיעו כדי למנוע חזרות עד שהמאגר נגמר
const used = {};
const pickUnused = (key, bank) => {
  if (!used[key]) used[key] = new Set();
  let available = bank.map((_, i) => i).filter(i => !used[key].has(i));
  if (available.length === 0) {
    used[key].clear();
    available = bank.map((_, i) => i);
  }
  const idx = pickRandom(available);
  used[key].add(idx);
  return bank[idx];
};

// בוחר מסיחים - קודם מאותה קבוצה, ובלי כפילויות בשדה הנבדק
const pickDistractors = (word, field, count = 3) => {
  const taken = new Set([word[field], word.en]);
  const result = [];
  const sameGroup = shuffle(words.filter(w => w.group === word.group));
  const others = shuffle(words.filter(w => w.group !== word.group));
  for (const w of [...sameGroup, ...others]) {
    if (result.length >= count) break;
    if (taken.has(w[field]) || taken.has(w.en)) continue;
    taken.add(w[field]);
    taken.add(w.en);
    result.push(w);
  }
  return result;
};

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// ---------- אוצר מילים ----------
const vocabularyQuestion = () => {
  const type = pickRandom(['enToHe', 'heToEn', 'picture', 'definition', 'wordBank', 'wordBank']);

  if (type === 'wordBank') {
    const item = pickUnused('fill', fillSentences);
    const bank = shuffle([item.answer, ...item.distractors]);
    return {
      kind: 'mc',
      label: Math.random() < 0.5 ? 'השלמת משפט בעזרת מחסן מילים' : 'בחירת המילה המתאימה למשפט',
      instruction: 'Complete the sentence with a word from the word bank.',
      prompt: 'בחרי את המילה שמשלימה את המשפט:',
      english: item.sentence,
      wordBank: true,
      options: bank,
      answer: item.answer,
      explanation: `המשפט המלא: ${item.sentence.replace('____', item.answer)}`,
      speak: item.sentence.replace('____', item.answer)
    };
  }

  const word = pickUnused('words', words);

  if (type === 'enToHe') {
    const distractors = pickDistractors(word, 'he');
    return {
      kind: 'mc',
      label: 'הבנת מילים ומשמעותן',
      instruction: 'Choose the correct meaning.',
      prompt: 'מה הפירוש של המילה?',
      english: word.en,
      big: true,
      options: shuffle([word.he, ...distractors.map(d => d.he)]),
      optionsHebrew: true,
      answer: word.he,
      explanation: `${word.en} = ${word.he} ${word.emoji}`,
      speak: word.en
    };
  }

  if (type === 'heToEn') {
    const distractors = pickDistractors(word, 'en');
    return {
      kind: 'mc',
      label: 'הבנת מילים ומשמעותן',
      instruction: 'Choose the correct word.',
      prompt: `איך אומרים "${word.he}" באנגלית?`,
      options: shuffle([word.en, ...distractors.map(d => d.en)]),
      answer: word.en,
      explanation: `${word.he} = ${word.en} ${word.emoji}`,
      speak: word.en
    };
  }

  if (type === 'picture') {
    const distractors = pickDistractors(word, 'emoji');
    return {
      kind: 'mc',
      label: 'התאמת מילה לתמונה',
      instruction: 'Match the word to the picture.',
      prompt: 'איזו מילה מתאימה לתמונה?',
      emoji: word.emoji,
      options: shuffle([word.en, ...distractors.map(d => d.en)]),
      answer: word.en,
      explanation: `${word.emoji} = ${word.en} (${word.he})`,
      speak: word.en
    };
  }

  // definition
  const distractors = pickDistractors(word, 'en');
  return {
    kind: 'mc',
    label: 'התאמת מילה להגדרה',
    instruction: 'Match the word to the definition.',
    prompt: 'איזו מילה מתאימה להגדרה?',
    english: word.def,
    options: shuffle([word.en, ...distractors.map(d => d.en)]),
    answer: word.en,
    explanation: `${word.en} = ${word.he} ${word.emoji}`,
    speak: word.def
  };
};

// ---------- דקדוק ----------
const GRAMMAR = {
  isAre: {
    bank: isAre,
    options: ['am', 'is', 'are'],
    label: 'am / is / are',
    instruction: 'Fill in the blank with am, is, or are.',
    rule: 'I ← am | יחיד (he, she, it, שם אחד) ← is | רבים (we, you, they, כמה) ← are'
  },
  hasHave: {
    bank: hasHave,
    options: ['has', 'have'],
    label: 'has / have',
    instruction: 'Fill in the blank with have or has.',
    rule: 'he, she, it ← has | I, you, we, they ← have'
  },
  canCant: {
    bank: canCant,
    options: ['can', 'can\'t'],
    label: 'can / can\'t',
    instruction: 'Fill in the blank with can (ability) or can\'t (inability).',
    rule: 'can = יכול/ה | can\'t = לא יכול/ה'
  },
  becauseWhy: {
    bank: becauseWhy,
    options: ['why', 'because'],
    label: 'because / why',
    instruction: 'Fill in the blank with Why or because.',
    rule: 'Why = למה (שאלה) | because = כי (תשובה / סיבה)'
  }
};

// החסר בתחילת משפט (גם אחרי נקודה / סימן שאלה) ← אות גדולה
const blankStartsSentence = (sentence) => /(^|[.!?]\s+)____/.test(sentence);

/**
 * שאלת דקדוק. style:
 *   'blank'   - השלמת החסר (Fill in the blank) עם כל האפשרויות של הנושא
 *   'circle'  - "הקיפי את המילה הנכונה": ( is / are ) בתוך המשפט, שתי אפשרויות
 */
const grammarQuestion = (key, style = 'blank') => {
  const g = GRAMMAR[key];
  const item = pickUnused(key, g.bank);
  const atStart = blankStartsSentence(item.sentence);
  const fix = (o) => (atStart ? capitalize(o) : o);
  const answer = fix(item.answer.toLowerCase());

  let options = g.options.map(fix);
  if (style === 'circle' && options.length > 2) {
    const others = options.filter(o => o !== answer);
    options = shuffle([answer, others[Math.floor(Math.random() * others.length)]]);
  }

  const full = item.sentence.replace('____', answer);
  return {
    kind: 'mc',
    label: style === 'circle' ? `תרגול מעורב · ${g.label}` : g.label,
    instruction: style === 'circle' ? 'Circle the correct word.' : g.instruction,
    prompt: style === 'circle' ? 'בחרי את המילה הנכונה מתוך הסוגריים:' : 'השלימי את המשפט:',
    english: style === 'circle'
      ? item.sentence.replace('____', `( ${options.join(' / ')} )`)
      : item.sentence,
    options,
    answer,
    explanation: `${item.why}\n${g.rule}`,
    fullSentence: full,
    speak: full
  };
};

const becauseWhyQuestion = () => {
  if (Math.random() < 0.3) {
    const item = pickUnused('whyMatch', whyMatch);
    return {
      kind: 'mc',
      label: 'שאלת Why ← תשובת Because',
      instruction: 'Choose the correct answer.',
      prompt: 'בחרי את התשובה המתאימה לשאלה:',
      english: item.q,
      options: shuffle([item.a, ...item.distractors]),
      answer: item.a,
      explanation: `${item.q}  ${item.a}\nעל שאלה עם Why עונים ב-Because`,
      speak: `${item.q} ${item.a}`
    };
  }
  return grammarQuestion('becauseWhy');
};

// מבחן מסכם ומעורב - כל נושאי הדקדוק בפורמט "הקיפי את המילה הנכונה"
const mixedQuestion = () => {
  const key = pickRandom(Object.keys(GRAMMAR));
  return grammarQuestion(key, 'circle');
};

// ---------- סידור משפטים ----------
// מילים שנשארות באות גדולה גם כשהן מעורבבות (I, שמות, ימים, שפות)
const NAMES = ['I', 'Dan', 'Tom', 'Danny', 'Maya', 'Noa', 'Ben', 'Max'];
const KEEP_CASE = new Set([
  ...NAMES,
  ...sentences.flatMap(s => s.en.split(' ').slice(1).filter(w => /^[A-Z]/.test(w)).map(w => w.replace(/[.,!?]$/, '')))
]);

// כמו בדף העבודה: מילים קטנות, בלי נקודה בסוף, וסימן שאלה כאריח נפרד
export const toTiles = (sentence) => {
  const words = sentence.trim().split(/\s+/);
  const last = words[words.length - 1];
  const tiles = [...words];
  const end = last.slice(-1);
  if (['.', '!', '?'].includes(end)) {
    tiles[tiles.length - 1] = last.slice(0, -1);
    if (end === '?') tiles.push('?');
  }
  const first = tiles[0];
  if (!KEEP_CASE.has(first)) tiles[0] = first.toLowerCase();
  return tiles;
};

const sentenceOrderQuestion = () => {
  const item = pickUnused('sentences', sentences);
  const tiles = toTiles(item.en);
  const target = tiles.join(' ');
  let scrambled = shuffle(tiles);
  // לוודא שהמשפט באמת מעורבב
  for (let i = 0; i < 5 && scrambled.join(' ') === target; i++) scrambled = shuffle(tiles);
  return {
    kind: 'order',
    label: 'סידור מילים למשפט',
    instruction: 'Unscramble the words to make a correct sentence.',
    prompt: 'סדרי את המילים למשפט נכון באנגלית:',
    hint: item.he,
    tokens: scrambled.map((t, i) => ({ id: i, text: t })),
    answerTokens: tiles,
    answer: item.en,
    speak: item.en
  };
};

export const generateQuestion = (category) => {
  switch (category) {
    case 'vocabulary':
      return vocabularyQuestion();
    case 'isAre':
    case 'hasHave':
    case 'canCant':
      return grammarQuestion(category);
    case 'becauseWhy':
      return becauseWhyQuestion();
    case 'sentenceOrder':
      return sentenceOrderQuestion();
    case 'mixed':
      return mixedQuestion();
    default:
      return null;
  }
};

export const getPassage = (category) =>
  category === 'listening'
    ? pickUnused('listening', listeningPassages)
    : pickUnused('reading', readingPassages);
