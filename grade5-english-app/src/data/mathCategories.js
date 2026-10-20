// נושאי התרגול בחשבון - לפי רשימת הנושאים למבחן של צוות המתמטיקה (כיתה ה', 08.11.2026)

export const MATH_EXAM_DATE = new Date('2026-11-08T08:00:00');

export const mathCategories = [
  // ----- מספרים טבעיים -----
  {
    id: 'mPlaceValue',
    title: '🏛️ מבנה עשרוני ופילוג',
    name: 'מבנה עשרוני ופילוג',
    description: 'עד המיליון: ערך הספרה, פילוג, מילים וספרות',
    color: 'blue.500',
    emoji: '🔢',
    section: 'מספרים טבעיים'
  },
  {
    id: 'mNumberLine',
    title: '📏 ישר המספרים',
    name: 'ישר המספרים',
    description: 'איזה מספר מסמן החץ?',
    color: 'cyan.600',
    emoji: '📏',
    section: 'מספרים טבעיים'
  },
  {
    id: 'mCompare',
    title: '⚖️ השוואה וסדרות',
    name: 'השוואה וסדרות',
    description: 'גדול, קטן, שווה - ומה בא אחר כך בסדרה',
    color: 'teal.500',
    emoji: '⚖️',
    section: 'מספרים טבעיים'
  },
  {
    id: 'mOperations',
    title: '➕ ארבע פעולות החשבון',
    name: 'ארבע פעולות החשבון',
    description: 'חיבור, חיסור, כפל וחילוק',
    color: 'green.500',
    emoji: '🧮',
    section: 'מספרים טבעיים'
  },
  {
    id: 'mOrderOps',
    title: '🥇 סדר פעולות חשבון',
    name: 'סדר פעולות חשבון',
    description: 'סוגריים, כפל וחילוק, ואז חיבור וחיסור',
    color: 'purple.500',
    emoji: '🥇',
    section: 'מספרים טבעיים'
  },
  {
    id: 'mEquations',
    title: '🔍 משוואות עם נעלם',
    name: 'משוואות עם נעלם',
    description: 'איזה מספר מסתתר בריבוע?',
    color: 'pink.500',
    emoji: '🔍',
    section: 'מספרים טבעיים'
  },
  {
    id: 'mWordProblems',
    title: '📖 שאלות מילוליות',
    name: 'שאלות מילוליות',
    description: 'סיפור קצר - ומה צריך לחשב?',
    color: 'orange.500',
    emoji: '🛒',
    section: 'מספרים טבעיים'
  },
  // ----- שברים -----
  {
    id: 'mFractionMeaning',
    title: '🍕 משמעות השבר',
    name: 'משמעות השבר',
    description: 'חלק משלם וחלק מכמות',
    color: 'red.400',
    emoji: '🍕',
    section: 'שברים'
  },
  {
    id: 'mFractionAdd',
    title: '➗ חיבור וחיסור שברים',
    name: 'חיבור וחיסור שברים',
    description: 'מכנים זהים ושלמים',
    color: 'red.500',
    emoji: '🧁',
    section: 'שברים'
  },
  {
    id: 'mMixed',
    title: '🥧 שבר מדומה ומספר מעורב',
    name: 'שבר מדומה ומספר מעורב',
    description: 'מעבר מאחד לשני',
    color: 'orange.600',
    emoji: '🥧',
    section: 'שברים'
  },
  {
    id: 'mFractionWords',
    title: '🍫 שאלות מילוליות בשברים',
    name: 'שאלות מילוליות בשברים',
    description: 'שברים בסיפורים מהחיים',
    color: 'yellow.600',
    emoji: '🍫',
    section: 'שברים'
  },
  // ----- גאומטריה -----
  {
    id: 'mPolygonSides',
    title: '🔷 צלעות במצולעים',
    name: 'צלעות במצולעים',
    description: 'מקבילות, מאונכות, נגדיות וסמוכות',
    color: 'blue.600',
    emoji: '🔷',
    section: 'גאומטריה'
  },
  {
    id: 'mAngles',
    title: '📐 סוגי זוויות',
    name: 'סוגי זוויות',
    description: 'חדה, ישרה, קהה ושטוחה',
    color: 'purple.600',
    emoji: '📐',
    section: 'גאומטריה'
  },
  {
    id: 'mAreaPerimeter',
    title: '🟩 שטח והיקף מלבן',
    name: 'שטח והיקף מלבן',
    description: 'כמה ריבועים בפנים, וכמה מסביב',
    color: 'green.600',
    emoji: '🟩',
    section: 'גאומטריה'
  },
  {
    id: 'mTest',
    title: '🎯 מבחן מסכם בחשבון',
    name: 'מבחן מסכם בחשבון',
    description: '12 שאלות מכל הנושאים',
    color: 'purple.700',
    emoji: '📋',
    section: 'כל הנושאים',
    testLength: 12
  }
];
