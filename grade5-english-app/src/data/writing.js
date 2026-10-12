// כתיבה: "כתיבת קטע קצר באנגלית על עצמי"

// תרגול: איזה משפט כתוב נכון? (אות גדולה, נקודה, is/are, has/have, can, because)
export const correctSentenceQuestions = [
  { correct: 'My name is Noa.', wrong: ['my name is Noa.', 'My name are Noa.', 'My name is noa'], why: 'משפט מתחיל באות גדולה, שמות כותבים באות גדולה, ובסוף שמים נקודה.' },
  { correct: 'I am ten years old.', wrong: ['I is ten years old.', 'I ten years old.', 'i am ten years old.'], why: 'עם I משתמשים ב-am, ו-I תמיד באות גדולה.' },
  { correct: 'I have a brother and a sister.', wrong: ['I has a brother and a sister.', 'I have a brother and a sister', 'I am have a brother and a sister.'], why: 'עם I משתמשים ב-have, ובסוף המשפט נקודה.' },
  { correct: 'I live in Tel Aviv.', wrong: ['I live in tel aviv.', 'I lives in Tel Aviv.', 'I am live in Tel Aviv.'], why: 'שמות של מקומות כותבים באות גדולה. אחרי I - live (בלי s).' },
  { correct: 'I can swim very well.', wrong: ['I can swims very well.', 'I can to swim very well.', 'I cans swim very well.'], why: 'אחרי can בא הפועל בצורה הבסיסית - בלי s ובלי to.' },
  { correct: 'I can\'t play the guitar.', wrong: ['I can\'t plays the guitar.', 'I not can play the guitar.', 'I can\'t to play the guitar.'], why: 'can\'t + פועל בסיסי: I can\'t play.' },
  { correct: 'I like pizza because it is tasty.', wrong: ['I like pizza why it is tasty.', 'I like pizza because it tasty.', 'I likes pizza because it is tasty.'], why: 'הסיבה מתחילה ב-because (לא why), ועם it צריך is.' },
  { correct: 'My favorite color is blue.', wrong: ['My favorite color are blue.', 'My favorite color blue.', 'my favorite color is blue.'], why: 'color = אחד ← is. משפט מתחיל באות גדולה.' },
  { correct: 'My hobbies are dancing and reading.', wrong: ['My hobbies is dancing and reading.', 'My hobbies dancing and reading.', 'My hobbies are dancing and reading'], why: 'hobbies = רבים ← are. בסוף נקודה.' },
  { correct: 'My dog is big and brown.', wrong: ['My dog are big and brown.', 'My dog is big and brown', 'My dog big and brown.'], why: 'dog = יחיד ← is. בסוף נקודה.' },
  { correct: 'My mother has long hair.', wrong: ['My mother have long hair.', 'My mother is long hair.', 'My mother has long hair'], why: 'My mother = she ← has.' },
  { correct: 'I go to school by bus.', wrong: ['I goes to school by bus.', 'I go to school by bus', 'i go to school by bus.'], why: 'I + go (בלי es). I תמיד גדולה. נקודה בסוף.' },
  { correct: 'I have got a cat. Her name is Mitzi.', wrong: ['I have got a cat. her name is Mitzi.', 'I has got a cat. Her name is Mitzi.', 'I have got a cat. Her name are Mitzi.'], why: 'כל משפט חדש מתחיל באות גדולה. I ← have. name ← is.' },
  { correct: 'I am in the fifth grade.', wrong: ['I is in the fifth grade.', 'I are in the fifth grade.', 'I in the fifth grade.'], why: 'I ← am.' },
  { correct: 'My friends are Dana and Yael.', wrong: ['My friends is Dana and Yael.', 'My friends are dana and yael.', 'My friends are Dana and Yael'], why: 'friends = רבים ← are. שמות באות גדולה.' },
  { correct: 'I don\'t like rain because it is cold.', wrong: ['I don\'t like rain why it is cold.', 'I not like rain because it is cold.', 'I don\'t likes rain because it is cold.'], why: 'שלילה: I don\'t like. סיבה: because.' },
  { correct: 'My birthday is in May.', wrong: ['My birthday is in may.', 'My birthday are in May.', 'my birthday is in May.'], why: 'חודשים כותבים באות גדולה: May.' },
  { correct: 'On Saturday I play with my friends.', wrong: ['On saturday I play with my friends.', 'On Saturday i play with my friends.', 'On Saturday I plays with my friends.'], why: 'ימים כותבים באות גדולה, וגם I.' }
];

// פתיחי משפטים לכתיבה חופשית
export const sentenceStarters = [
  'My name is ',
  'I am ... years old.',
  'I live in ',
  'I have ',
  'My family is ',
  'My favorite food is ',
  'My favorite color is ',
  'I like ... because ',
  'I can ',
  'I can\'t ',
  'My best friend is ',
  'After school I ',
  'I am good at ',
  'I don\'t like '
];

// קטע לדוגמה
export const modelParagraph = `My name is Noa. I am ten years old. I live in Ra'anana with my family. I have a mother, a father and a little brother. His name is Ido. I have a cat. Her name is Mitzi and she is very funny.
I am in the fifth grade. My favorite subject is English because my teacher is nice. I can swim and dance, but I can't play the piano. My favorite food is pizza. My best friend is Yael. After school we play in the park.`;

// בדיקות אוטומטיות לקטע שנכתב
export const writingChecks = [
  {
    id: 'length',
    label: 'לפחות 6 משפטים',
    test: (text, sentences) => sentences.length >= 6
  },
  {
    id: 'capital',
    label: 'כל משפט מתחיל באות גדולה',
    test: (text, sentences) => sentences.length > 0 && sentences.every(s => /^[A-Z]/.test(s.trim()))
  },
  {
    id: 'period',
    label: 'בסוף כל משפט יש נקודה (. ! ?)',
    test: (text) => text.trim().length > 0 && /[.!?]$/.test(text.trim())
  },
  {
    id: 'bigI',
    label: 'המילה I כתובה תמיד באות גדולה',
    test: (text) => text.trim().length > 0 && !/(^|[^A-Za-z'])i([^A-Za-z']|$)/.test(text)
  },
  {
    id: 'name',
    label: 'הצגתי את עצמי (My name is...)',
    test: (text) => /my name is/i.test(text) || /\bI am [A-Z][a-z]+/.test(text)
  },
  {
    id: 'am',
    label: 'השתמשתי ב-I am',
    test: (text) => /\bI am\b|\bI'm\b/i.test(text)
  },
  {
    id: 'have',
    label: 'השתמשתי ב-have / has',
    test: (text) => /\b(have|has)\b/i.test(text)
  },
  {
    id: 'can',
    label: 'השתמשתי ב-can / can\'t',
    test: (text) => /\bcan('t|not)?\b/i.test(text)
  },
  {
    id: 'because',
    label: 'נימקתי עם because',
    test: (text) => /\bbecause\b/i.test(text)
  },
  {
    id: 'noIs',
    label: 'לא כתבתי "I is" / "I has"',
    test: (text) => text.trim().length > 0 && !/\bI (is|are|has)\b/i.test(text)
  }
];

export const splitSentences = (text) =>
  text
    .replace(/([.!?])\s+/g, '$1\n')
    .split(/\n+/)
    .map(s => s.trim())
    .filter(s => s.split(/\s+/).length >= 2);
