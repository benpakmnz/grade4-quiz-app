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
    prompt: 'איזו מילה מתאימה להגדרה?',
    english: word.def,
    options: shuffle([word.en, ...distractors.map(d => d.en)]),
    answer: word.en,
    explanation: `${word.en} = ${word.he} ${word.emoji}`,
    speak: word.def
  };
};

// ---------- דקדוק ----------
const grammarQuestion = (key, bank, pair, label, rule) => {
  const item = pickUnused(key, bank);
  // החסר בתחילת משפט (גם אחרי נקודה / סימן שאלה) ← אות גדולה
  const atStart = /(^|[.!?]\s+)____/.test(item.sentence);
  const options = pair.map(o => (atStart ? capitalize(o) : o));
  const answer = atStart ? capitalize(item.answer) : item.answer;
  const full = item.sentence.replace('____', answer);
  return {
    kind: 'mc',
    label,
    prompt: 'השלימי את המשפט:',
    english: item.sentence,
    options,
    answer,
    explanation: `${item.why}\n${rule}`,
    fullSentence: full,
    speak: full
  };
};

const becauseWhyQuestion = () => {
  if (Math.random() < 0.35) {
    const item = pickUnused('whyMatch', whyMatch);
    return {
      kind: 'mc',
      label: 'שאלת Why ← תשובת Because',
      prompt: 'בחרי את התשובה המתאימה לשאלה:',
      english: item.q,
      options: shuffle([item.a, ...item.distractors]),
      answer: item.a,
      explanation: `${item.q}  ${item.a}\nעל שאלה עם Why עונים ב-Because`,
      speak: `${item.q} ${item.a}`
    };
  }
  return grammarQuestion('becauseWhy', becauseWhy, ['why', 'because'], 'because / why',
    'Why = למה (שאלה) | because = כי (תשובה / סיבה)');
};

// ---------- סידור משפטים ----------
const sentenceOrderQuestion = () => {
  const item = pickUnused('sentences', sentences);
  const tokens = item.en.split(' ');
  let scrambled = shuffle(tokens);
  // לוודא שהמשפט באמת מעורבב
  for (let i = 0; i < 5 && scrambled.join(' ') === item.en; i++) scrambled = shuffle(tokens);
  return {
    kind: 'order',
    label: 'סידור מילים למשפט',
    prompt: 'סדרי את המילים למשפט נכון באנגלית:',
    hint: item.he,
    tokens: scrambled.map((t, i) => ({ id: i, text: t })),
    answer: item.en,
    speak: item.en
  };
};

export const generateQuestion = (category) => {
  switch (category) {
    case 'vocabulary':
      return vocabularyQuestion();
    case 'isAre':
      return grammarQuestion('isAre', isAre, ['is', 'are'], 'is / are',
        'יחיד (he, she, it, שם אחד) ← is | רבים (we, you, they, כמה) ← are');
    case 'hasHave':
      return grammarQuestion('hasHave', hasHave, ['has', 'have'], 'has / have',
        'he, she, it ← has | I, you, we, they ← have');
    case 'canCant':
      return grammarQuestion('canCant', canCant, ['can', 'can\'t'], 'can / can\'t',
        'can = יכול/ה | can\'t = לא יכול/ה');
    case 'becauseWhy':
      return becauseWhyQuestion();
    case 'sentenceOrder':
      return sentenceOrderQuestion();
    default:
      return null;
  }
};

export const getPassage = (category) =>
  category === 'listening'
    ? pickUnused('listening', listeningPassages)
    : pickUnused('reading', readingPassages);
