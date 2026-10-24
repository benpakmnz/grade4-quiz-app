// חדר בריחה ב-Firebase: <DB_ROOT>/rooms/<code>
//   meta    - מי המארח/ת, שם הצוות, מקצוע, זמן, מצב (lobby / playing) ומתי מתחילים ונגמרים
//   members - מי ביקש להצטרף ומי אושר/ה (st: pending / in / out)
//   assign  - לכל ילד/ה: המשבצת והספרה שלו/ה בקוד. רק הילד/ה עצמו/ה יכול/ה לקרוא - כך אף אחד לא יודע מי הכניס מה
//   lock    - הספרות שכבר נכנסו למנעול (בלי שם)
//   bank    - קופת הרמזים המשותפת
//   cheers  - מדבקות עידוד (עם השולח/ת - הכללים מוודאים שזה באמת הוא/היא)
import { ref, get, set, update, onValue, runTransaction, push, serverTimestamp } from 'firebase/database';
// הזמנות: <DB_ROOT>/invites/<uid>/<code> - מי שפותח/ת אתגר חדש עם צוות קודם מזמין/ה את החברים מאותו צוות
import { db } from './firebase';
import { DB_ROOT } from './env';
import { makeRoomCode, makeCodeDigits, MAX_TEAM, STARTING_HINTS, roomSize } from '../data/escapeRoom';

const roomPath = (code, sub = '') => `${DB_ROOT}/rooms/${code}${sub ? `/${sub}` : ''}`;
const r = (code, sub) => ref(db, roomPath(code, sub));

const member = (user, userData, st) => ({
  name: String(userData?.name || 'חבר/ה').slice(0, 30),
  emoji: String(userData?.character?.emoji || '🙂').slice(0, 16),
  st,
  t: serverTimestamp()
});

/** פתיחת חדר חדש. מנסים כמה קודים עד שמוצאים אחד פנוי */
export const createRoom = async (user, userData, { team, subject, tasks, prev = null, cls = null }) => {
  const size = roomSize(tasks);
  for (let i = 0; i < 6; i++) {
    const code = makeRoomCode();
    try {
      // eslint-disable-next-line no-await-in-loop
      await set(r(code, 'meta'), {
        host: user.uid,
        team: String(team).slice(0, 40),
        subject,
        tasks: size.tasks,
        minutes: size.minutes,
        status: 'lobby',
        createdAt: serverTimestamp(),
        ...(prev ? { prev } : {}),
        ...(cls ? { cls } : {})
      });
      // eslint-disable-next-line no-await-in-loop
      await set(r(code, `members/${user.uid}`), member(user, userData, 'in'));
      return code;
    } catch (err) {
      // הקוד תפוס (הכללים לא מאפשרים לדרוס חדר קיים) - מנסים קוד אחר
      if (i === 5) throw err;
    }
  }
  return null;
};

export const readMeta = async (code) => {
  const snap = await get(r(code, 'meta'));
  return snap.exists() ? snap.val() : null;
};

export const requestJoin = (code, user, userData) =>
  set(r(code, `members/${user.uid}`), member(user, userData, 'pending'));

export const setMemberStatus = (code, uid, st) => update(r(code, `members/${uid}`), { st });

export const leaveRoom = (code, uid) => set(r(code, `members/${uid}`), null);

/**
 * התחלה: החדר ננעל, אורך הקוד = מספר הילדים שאושרו, ולכל ילד/ה ספרה ומשבצת משלו/ה
 */
export const startRoom = async (code, meta, members, serverNow) => {
  const team = Object.entries(members || {})
    .filter(([, m]) => m.st === 'in')
    .slice(0, MAX_TEAM)
    .map(([uid]) => uid)
    .sort(() => Math.random() - 0.5);
  const digits = makeCodeDigits(team.length);
  const changes = {};
  team.forEach((uid, i) => {
    changes[`assign/${uid}`] = { slot: String(i), digit: digits[i] };
  });
  // השיבוץ קודם - כדי שבזמן שהמסכים עוברים למשחק לכל אחד כבר תהיה ספרה
  await update(r(code), changes);
  await set(r(code, 'bank'), STARTING_HINTS);
  const startedAt = serverNow;
  await update(r(code, 'meta'), {
    status: 'playing',
    slots: team.length,
    startedAt,
    endsAt: startedAt + meta.minutes * 60 * 1000
  });
};

/** הכנסת הספרה למנעול (הכללים בודקים שזו באמת הספרה והמשבצת של הילד/ה) */
export const insertDigit = (code, assign) =>
  set(r(code, `lock/${assign.slot}`), { d: assign.digit, t: serverTimestamp() });

/** +1 / -1 בקופת הרמזים. מחזיר true אם הצליח (למשל: אין רמז לקחת כשהקופה ריקה) */
export const changeBank = async (code, delta) => {
  const result = await runTransaction(r(code, 'bank'), (current) => {
    const value = typeof current === 'number' ? current : 0;
    if (value + delta < 0) return undefined;
    return value + delta;
  });
  return result.committed;
};

export const sendCheer = (code, uid, cheerId) => push(r(code, 'cheers'), { s: cheerId, u: uid, t: serverTimestamp() });

/** סיבוב נוסף: המארח/ת פותח/ת חדר חדש, ובחדר הישן נשמר הקוד שלו כדי שכולם יוכלו לעבור */
export const linkNextRound = (oldCode, newCode) => update(r(oldCode, 'meta'), { next: newCode });

/** האזנה לחלק אחד של החדר. מחזיר פונקציה לביטול */
export const watch = (code, sub, callback, onError) =>
  onValue(r(code, sub), (snap) => callback(snap.exists() ? snap.val() : null), (err) => onError && onError(err));

/** ההפרש בין השעון של המכשיר לשעון של השרת - כדי שהשעון המשותף יהיה זהה לכולם */
export const watchServerOffset = (callback) =>
  onValue(ref(db, '.info/serverTimeOffset'), (snap) => callback(Number(snap.val()) || 0));

// ---------------- אתגר חדש עם צוות קודם ----------------
const invitesRef = (uid, sub = '') => ref(db, `${DB_ROOT}/invites/${uid}${sub ? `/${sub}` : ''}`);

/** החברים מהאתגר הקודם (מי שהיה בצוות), חוץ ממני */
export const readPrevTeam = async (prevCode, myUid) => {
  const snap = await get(r(prevCode, 'members'));
  return Object.entries(snap.val() || {}).filter(([id, m]) => id !== myUid && m.st === 'in').map(([id]) => id);
};

/**
 * פותחים אתגר חדש עם אותו צוות ושולחים הזמנה לכל מי שהיה בו.
 * הכללים מאפשרים להזמין רק מי שהיה איתי באותו צוות.
 */
export const createRoomWithTeam = async (user, userData, past, cls = null) => {
  const code = await createRoom(user, userData, { team: past.team, subject: past.subject, tasks: past.tasks, prev: past.code, cls });
  const friends = await readPrevTeam(past.code, user.uid).catch(() => []);
  await Promise.all(friends.map(uid => set(invitesRef(uid, code), {
    team: String(past.team || '').slice(0, 40),
    name: String(userData?.name || '').slice(0, 30),
    emoji: String(userData?.character?.emoji || '🙂').slice(0, 16),
    t: serverTimestamp()
  }).catch(() => {})));
  return code;
};

export const watchInvites = (uid, callback) =>
  onValue(invitesRef(uid), (snap) => callback(snap.val() || {}), () => callback({}));

export const dismissInvite = (uid, code) => set(invitesRef(uid, code), null);
