// נושאי התרגול בחשבון לכיתה ג' - לפי נושאי מבחן תחילת השנה (28.10.2026)

export const MATH3_EXAM_DATE = new Date('2026-10-28T08:00:00');

export const math3Categories = [
  // ----- חשבון -----
  {
    id: 'g3Numbers',
    title: '🔢 הכרת המספר',
    name: 'הכרת המספר',
    description: 'במילים, העוקב, מאות-עשרות-יחידות ובניית מספרים',
    color: 'blue.500',
    emoji: '🔢',
    section: 'חשבון'
  },
  {
    id: 'g3Sequences',
    title: '📏 סדרות וישר המספרים',
    name: 'סדרות וישר המספרים',
    description: 'מה חסר בסדרה, ואיזה מספר מסמן החץ',
    color: 'cyan.600',
    emoji: '📏',
    section: 'חשבון'
  },
  {
    id: 'g3Operations',
    title: '➕ חיבור, חיסור, כפל וחילוק',
    name: 'חיבור, חיסור, כפל וחילוק',
    description: 'תרגילים בתחום ה-100',
    color: 'green.500',
    emoji: '🧮',
    section: 'חשבון'
  },
  {
    id: 'g3Missing',
    title: '🔍 המספר החסר',
    name: 'המספר החסר',
    description: 'איזה מספר מסתתר בריבוע?',
    color: 'pink.500',
    emoji: '🔍',
    section: 'חשבון'
  },
  {
    id: 'g3Word',
    title: '📖 בעיות מילוליות',
    name: 'בעיות מילוליות',
    description: 'פותרים, ומתאימים תרגיל לבעיה',
    color: 'orange.500',
    emoji: '🛒',
    section: 'חשבון'
  },
  // ----- גאומטריה -----
  {
    id: 'g3Perimeter',
    title: '🔷 היקף מצולע',
    name: 'היקף מצולע',
    description: 'מחברים את כל הצלעות מסביב',
    color: 'purple.500',
    emoji: '🔷',
    section: 'גאומטריה'
  },
  {
    id: 'g3Area',
    title: '🟩 שטח מלבן',
    name: 'שטח מלבן',
    description: 'כמה ריבועים יש בפנים?',
    color: 'green.600',
    emoji: '🟩',
    section: 'גאומטריה'
  },
  {
    id: 'g3Test',
    title: '🎯 מבחן מסכם',
    name: 'מבחן מסכם',
    description: '10 שאלות מכל הנושאים',
    color: 'purple.700',
    emoji: '📋',
    section: 'כל הנושאים',
    testLength: 10
  }
];
