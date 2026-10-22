// חדר בריחה: פעילות קבוצתית. כל ילד/ה פותר/ת סט משלו (שאלה מכל נושא), מקבל/ת ספרה מהקוד
// ומכניס/ה אותה למנעול המשותף. כאן - כל ההיגיון שלא תלוי ב-Firebase (בחירת נושאים, שאלות, רמזים, גביעים).
import { generateQuestion, getPassage, shuffle } from './questionGenerator';
import { generateMathQuestion, MATH_TOPIC_IDS, isInputCorrect } from './mathQuestions';
import { findCategory } from './subjects';
import { notifyLocalChange } from '../services/cloudSync';
import { IS_TEST_ENV } from '../services/env';

// חדר הבריחה עדיין בבדיקה: באתר הבדיקות לכולם, באתר האמיתי רק למנהלים.
// לפתיחה לכולם (אחרי פרסום כללי האבטחה החדשים): REACT_APP_ESCAPE_ROOM=true ב-Vercel
export const ESCAPE_FOR_EVERYONE = IS_TEST_ENV || (process.env.REACT_APP_ESCAPE_ROOM || '').trim() === 'true';
export const escapeRoomAvailable = (isAdmin) => ESCAPE_FOR_EVERYONE || Boolean(isAdmin);

export const ROOM_MINUTES = [10, 15, 20];
export const TASKS_PER_KID = 5;
export const MAX_TEAM = 12;          // תקרה טכנית: מספר הילדים = אורך הקוד
export const STARTING_HINTS = 2;     // כדי שיהיה רמז גם לפני שמישהו סיים
export const CODE_PATTERN = /^[0-9]{6}$/;

// נושאים שמתאימים לחדר (בלי כתיבה, הקשבה וסידור מילים - הם ארוכים מדי לשעון משותף)
export const ROOM_TOPICS = {
  english: ['vocabulary', 'isAre', 'hasHave', 'canCant', 'becauseWhy', 'reading'],
  math: MATH_TOPIC_IDS
};

export const CHEERS = [
  { id: 'almost', text: '💪 יאללה, כמעט!' },
  { id: 'stars', text: '⭐ אתם תותחים' },
  { id: 'with', text: '❤️ אני איתכם' },
  { id: 'go', text: '🚀 קדימה צוות!' }
];

export const topicName = (id) => findCategory(id)?.name || id;

/**
 * "ברמה שלו": קודם הנושאים שבהם הכי פחות הצלחות (עם קצת אקראיות), ואז מערבבים את הסדר
 */
export const pickTopics = (subject, categoryStats = {}, count = TASKS_PER_KID, random = Math.random) => {
  const topics = ROOM_TOPICS[subject] || ROOM_TOPICS.english;
  const ranked = topics
    .map(id => {
      const s = categoryStats[id] || {};
      const rate = s.total ? s.correct / s.total : 0.5;
      return { id, weight: rate * 0.7 + Math.min(1, (s.correct || 0) / 30) * 0.3 + random() * 0.35 };
    })
    .sort((a, b) => a.weight - b.weight)
    .slice(0, Math.min(count, topics.length))
    .map(t => t.id);
  return shuffle(ranked);
};

// שאלת הבנת הנקרא: קטע אחד ושאלה אחת ממנו (אמריקאית או Yes/No)
const readingQuestion = () => {
  const passage = getPassage('reading');
  const q = shuffle((passage?.questions || []).filter(x => x.type !== 'order'))[0];
  if (!q) return null;
  return {
    kind: 'mc',
    label: 'הבנת הנקרא',
    prompt: 'קראו את הקטע וענו על השאלה:',
    passage: { title: passage.title, text: passage.text },
    english: q.q,
    options: q.type === 'yesno' ? ['Yes', 'No'] : shuffle(q.options),
    answer: q.answer
  };
};

/** שאלה אחת לנושא. subject נשמר על השאלה כדי לדעת איך להציג אותה */
const usable = (q) => Boolean(q) && (
  (q.kind === 'mc' && Array.isArray(q.options) && q.options.length >= 2 && q.options.includes(q.answer)) ||
  (q.kind === 'input' && q.answer !== undefined && q.answer !== null && String(q.answer) !== '')
);

const tryTopic = (topic) => {
  const isMath = MATH_TOPIC_IDS.includes(topic);
  for (let i = 0; i < 5; i++) {
    let q = null;
    try {
      if (isMath) q = generateMathQuestion(topic);
      else if (topic === 'reading') q = readingQuestion();
      else q = generateQuestion(topic);
    } catch (err) {
      console.warn('Escape room: question failed', topic, err);
    }
    if (usable(q)) return { ...q, subject: isMath ? 'math' : 'english' };
  }
  return null;
};

/**
 * שאלה לנושא. אם הנושא לא מצליח לייצר שאלה תקינה (למשל תוכן שנוסף בממשק הניהול בלי תשובות) -
 * לוקחים שאלה מנושא אחר באותו מקצוע, כדי שאף ילד/ה לא ייתקע/תיתקע בלי שאלה.
 * topic נשאר הנושא של המשימה (כדי שההתקדמות תמשיך כרגיל)
 */
export const roomQuestion = (topic) => {
  const subject = MATH_TOPIC_IDS.includes(topic) ? 'math' : 'english';
  const order = [topic, ...shuffle(ROOM_TOPICS[subject].filter(t => t !== topic))];
  for (const t of order) {
    const q = tryTopic(t);
    if (q) return { ...q, topic, from: t };
  }
  return null;
};

export const checkRoomAnswer = (question, given) =>
  question.kind === 'input' ? isInputCorrect(given, question.answer) : given === question.answer;

/** רמז מהקופה: באמריקאית מורידים עד שתי תשובות שגויות; בשאלה פתוחה - הספרה הראשונה ואורך התשובה */
export const canHint = (question) =>
  Boolean(question) && (question.kind === 'input' || (question.options || []).length >= 3);

export const makeHint = (question, random = Math.random) => {
  if (!canHint(question)) return null;
  if (question.kind === 'input') {
    const ans = String(question.answer).trim();
    const digits = ans.replace(/[^0-9]/g, '');
    if (/^[0-9]+$/.test(ans)) {
      return { text: `התשובה מתחילה ב-${ans[0]}, ויש בה ${ans.length === 1 ? 'ספרה אחת' : `${ans.length} ספרות`}.` };
    }
    return { text: digits ? `המספר הראשון בתשובה הוא ${ans.match(/[0-9]+/)[0]}.` : 'נסו לפתור שלב אחרי שלב.' };
  }
  const wrong = question.options.filter(o => o !== question.answer);
  const removeCount = Math.min(2, question.options.length - 2);
  const removed = [...wrong].sort(() => random() - 0.5).slice(0, removeCount);
  return { remove: removed, text: `הורדנו ${removeCount === 1 ? 'תשובה שגויה אחת' : 'שתי תשובות שגויות'}.` };
};

/** ספרה אקראית לכל משבצת בקוד */
export const makeCodeDigits = (length, random = Math.random) =>
  Array.from({ length }, () => Math.floor(random() * 10));

export const makeRoomCode = (random = Math.random) =>
  String(Math.floor(random() * 900000) + 100000);

export const roomLink = (code, origin = typeof window !== 'undefined' ? window.location.origin : '') =>
  `${origin}/?room=${code}`;

export const readRoomParam = (search = typeof window !== 'undefined' ? window.location.search : '') => {
  const code = new URLSearchParams(search).get('room');
  return code && CODE_PATTERN.test(code) ? code : null;
};

export const formatClock = (ms) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

// ---------------- הפרס ----------------
export const POINTS_FULL = 50;
export const POINTS_PER_LOCK = 10;

/** הפרס זהה לכל הצוות: כספת פתוחה = 50, אחרת 10 לכל מנעול שנפתח */
export const roomReward = (filled, total) => (total > 0 && filled >= total ? POINTS_FULL : filled * POINTS_PER_LOCK);

// ---------------- גביעים ומונה (נשמר עם ההתקדמות) ----------------
export const ESCAPE_KEY = 'english_escapeRooms';

export const TROPHY_TIERS = [
  { id: 'bronze', emoji: '🥉', name: 'ארד', at: 1 },
  { id: 'silver', emoji: '🥈', name: 'כסף', at: 5 },
  { id: 'gold', emoji: '🥇', name: 'זהב', at: 10 }
];

const EMPTY = { played: 0, opened: 0, hints: 0, rooms: [], history: [] };
export const HISTORY_LIMIT = 40;

export const readEscapeStats = () => {
  try {
    const data = JSON.parse(localStorage.getItem(ESCAPE_KEY) || 'null');
    return data && typeof data === 'object'
      ? { ...EMPTY, ...data, rooms: Array.isArray(data.rooms) ? data.rooms : [], history: Array.isArray(data.history) ? data.history.map(h => ({ ...h, code: h.code || String(h.id || '').split('-')[0] })) : [] }
      : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
};

const writeEscapeStats = (stats) => {
  try {
    localStorage.setItem(ESCAPE_KEY, JSON.stringify(stats));
    notifyLocalChange();
  } catch {
    // ignore
  }
};

/**
 * סיום חדר: נספר פעם אחת בלבד לכל חדר (גם אם המסך נפתח שוב). מחזיר את המונה החדש, או null אם כבר נספר.
 * details - לרשימת האתגרים: שם הצוות, מקצוע, הדמויות של החברים, כמה מנעולים וכמה זמן לקח
 */
export const recordRoomResult = (roomId, opened, details = {}, now = Date.now()) => {
  const stats = readEscapeStats();
  if (stats.rooms.includes(roomId)) return null;
  const entry = {
    id: roomId,
    code: String(details.code || String(roomId).split('-')[0]),
    minutes: ROOM_MINUTES.includes(details.minutes) ? details.minutes : 15,
    at: now,
    opened: Boolean(opened),
    team: String(details.team || '').slice(0, 40),
    subject: details.subject === 'math' ? 'math' : 'english',
    filled: Number(details.filled) || 0,
    total: Number(details.total) || 0,
    seconds: Number.isFinite(details.seconds) ? details.seconds : null,
    emojis: (details.emojis || []).slice(0, 12).map(e => String(e).slice(0, 16))
  };
  const next = {
    ...stats,
    played: stats.played + 1,
    opened: stats.opened + (opened ? 1 : 0),
    rooms: [roomId, ...stats.rooms].slice(0, 30),
    history: [entry, ...stats.history].slice(0, HISTORY_LIMIT)
  };
  writeEscapeStats(next);
  return next;
};

/** רמז שהילד/ה הוסיף/ה לקופה במשימת התמיכה */
export const recordHintGiven = () => {
  const stats = readEscapeStats();
  writeEscapeStats({ ...stats, hints: stats.hints + 1 });
};

export const currentTier = (played) => [...TROPHY_TIERS].reverse().find(t => played >= t.at) || null;
export const nextTier = (played) => TROPHY_TIERS.find(t => played < t.at) || null;

// ---------------- חזרה לחדר אחרי ניתוק (באותו מכשיר) ----------------
const ACTIVE_KEY = 'english_escapeActive';
const progressKey = (code) => `english_escapeProgress_${code}`;

export const saveActiveRoom = (code) => {
  try {
    if (code) localStorage.setItem(ACTIVE_KEY, code);
    else localStorage.removeItem(ACTIVE_KEY);
  } catch {
    // ignore
  }
};

export const readActiveRoom = () => {
  try {
    const code = localStorage.getItem(ACTIVE_KEY);
    return code && CODE_PATTERN.test(code) ? code : null;
  } catch {
    return null;
  }
};

export const saveRoomProgress = (code, progress) => {
  try {
    localStorage.setItem(progressKey(code), JSON.stringify(progress));
  } catch {
    // ignore
  }
};

export const readRoomProgress = (code) => {
  try {
    return JSON.parse(localStorage.getItem(progressKey(code)) || 'null');
  } catch {
    return null;
  }
};

export const clearRoomProgress = (code) => {
  try {
    localStorage.removeItem(progressKey(code));
  } catch {
    // ignore
  }
};

/** הודעת השיתוף (בלי שמות ילדים ובלי ציונים) */
export const shareText = ({ team, opened, filled, total, seconds, link }) => {
  const time = seconds != null ? ` ב-${formatClock(seconds * 1000)} דקות` : '';
  const result = opened ? `פתחו את הכספת${time}! 🔓` : `פתחו ${filled} מתוך ${total} מנעולים! 🔐`;
  return `🏆 צוות "${team}" ${result}\nרוצים לנסות גם? מתאמנים למבחני המיפוי של כיתה ה' 👉 ${link}`;
};
