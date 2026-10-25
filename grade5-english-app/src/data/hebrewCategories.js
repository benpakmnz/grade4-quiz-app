// נושאי התרגול בשפה (לשון) - לפי ההודעה של המורה למבחן (1.11.2026).
// קריאת טקסטים ומיומנויות עבודה עם טקסט לא כלולות כאן - רק החומר הלשוני.

export const HEBREW_EXAM_DATE = new Date('2026-11-01T08:00:00');

export const hebrewCategories = [
  {
    id: 'hRoots',
    title: '🌳 שורשים ומשפחות מילים',
    name: 'שורשים ומשפחות מילים',
    description: 'מוצאים את השורש ומילים מאותה משפחה',
    color: 'green.600',
    emoji: '🌳',
    section: 'חומר לשוני'
  },
  {
    id: 'hNouns',
    title: '🏷️ שמות עצם',
    name: 'שמות עצם',
    description: 'זכר או נקבה, יחיד או רבים',
    color: 'blue.500',
    emoji: '🏷️',
    section: 'חומר לשוני'
  },
  {
    id: 'hConnectives',
    title: '🔗 מילות קישור',
    name: 'מילות קישור',
    description: 'אבל, כי, לכן, אם... ואיזה קשר הן יוצרות',
    color: 'purple.500',
    emoji: '🔗',
    section: 'חומר לשוני'
  },
  {
    id: 'hTenses',
    title: '⏳ זמנים',
    name: 'זמנים',
    description: 'עבר, הווה ועתיד',
    color: 'orange.500',
    emoji: '⏳',
    section: 'חומר לשוני'
  },
  {
    id: 'hVerbs',
    title: '🏃 פעלים',
    name: 'פעלים',
    description: 'מוצאים את הפועל ואת השורש שלו',
    color: 'red.500',
    emoji: '🏃',
    section: 'חומר לשוני'
  },
  {
    id: 'hPronouns',
    title: '🙋 כינויי גוף',
    name: 'כינויי גוף',
    description: 'אני, אתה, היא, אנחנו, הם...',
    color: 'teal.500',
    emoji: '🙋',
    section: 'חומר לשוני'
  },
  {
    id: 'hReading',
    title: '🕵️ בלשי המילים',
    name: 'בלשי המילים - קטעי קריאה',
    description: 'קוראים סיפור, מסמנים מילים בטקסט ועונים על שאלות הבנה',
    color: 'orange.600',
    emoji: '🕵️',
    section: 'קריאה והבנה'
  },
  {
    id: 'hTest',
    title: '🎯 מבחן מסכם בשפה',
    name: 'מבחן מסכם בשפה',
    description: '12 שאלות מכל הנושאים',
    color: 'purple.700',
    emoji: '📋',
    section: 'כל הנושאים',
    testLength: 12
  }
];
