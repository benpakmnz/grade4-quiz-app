// הגדרות מרכזיות של האפליקציה - קטגוריות התרגול לפי החומר למבחן המיפוי באנגלית

export const EXAM_DATE = new Date('2026-10-21T08:00:00');

// 30 תשובות נכונות בכל נושא = 100% מוכנות
export const TARGET_PER_CATEGORY = 30;

export const getDaysUntilExam = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(EXAM_DATE);
  exam.setHours(0, 0, 0, 0);
  return Math.round((exam - today) / (1000 * 60 * 60 * 24));
};

export const categories = [
  {
    id: 'vocabulary',
    title: '📚 אוצר מילים',
    name: 'אוצר מילים',
    description: 'משמעות מילים, תמונות, הגדרות ומחסן מילים',
    color: 'pink.500',
    emoji: '🔤',
    section: 'אוצר מילים'
  },
  {
    id: 'isAre',
    title: '🟰 is / are',
    name: 'is / are',
    description: 'יחיד או רבים?',
    color: 'purple.500',
    emoji: '👥',
    section: 'דקדוק'
  },
  {
    id: 'hasHave',
    title: '🎒 has / have',
    name: 'has / have',
    description: 'למי יש מה?',
    color: 'blue.500',
    emoji: '🎁',
    section: 'דקדוק'
  },
  {
    id: 'canCant',
    title: '💪 can / can\'t',
    name: 'can / can\'t',
    description: 'מה אפשר ומה אי אפשר',
    color: 'cyan.500',
    emoji: '🏊',
    section: 'דקדוק'
  },
  {
    id: 'becauseWhy',
    title: '❓ because / why',
    name: 'because / why',
    description: 'שאלה ← תשובה',
    color: 'yellow.600',
    emoji: '🤔',
    section: 'דקדוק'
  },
  {
    id: 'sentenceOrder',
    title: '🧩 סידור משפטים',
    name: 'סידור משפטים',
    description: 'סדרי את המילים למשפט נכון',
    color: 'green.500',
    emoji: '🔀',
    section: 'דקדוק'
  },
  {
    id: 'reading',
    title: '📖 הבנת הנקרא',
    name: 'הבנת הנקרא',
    description: 'קריאת קטע, Yes/No, סדר אירועים',
    color: 'orange.500',
    emoji: '📰',
    section: 'הבנת הנקרא'
  },
  {
    id: 'listening',
    title: '🎧 הבנת הנשמע',
    name: 'הבנת הנשמע',
    description: 'הקשבה לקטע ומענה על שאלות',
    color: 'teal.500',
    emoji: '👂',
    section: 'הבנת הנשמע'
  },
  {
    id: 'writing',
    title: '✍️ כתיבה',
    name: 'כתיבה',
    description: 'כתיבת קטע קצר על עצמי',
    color: 'red.500',
    emoji: '📝',
    section: 'כתיבה'
  }
];

export const getEmptyCategoryStats = () =>
  categories.reduce((acc, cat) => {
    acc[cat.id] = { correct: 0, total: 0 };
    return acc;
  }, {});
