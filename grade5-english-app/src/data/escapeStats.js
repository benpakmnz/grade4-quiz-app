// סטטיסטיקות "אתגר מפצחי הכספות" ללוח הבקרה - מתוך היסטוריית האתגרים שנשמרת לכל משתמש מחובר
import { SUBJECT_IDS } from './subjects';
import { ROOM_SIZES } from './escapeRoom';

const parseHistory = (raw) => {
  try {
    const data = JSON.parse(raw?.progress?.data?.english_escapeRooms || 'null');
    return Array.isArray(data?.history) ? data.history : [];
  } catch {
    return [];
  }
};

const playerOf = (uid, raw) => {
  let userData = {};
  try {
    userData = JSON.parse(raw?.progress?.data?.english_userData || '{}') || {};
  } catch {
    // ignore
  }
  return { uid, name: userData.name || raw?.profile?.name || '(ללא שם)', character: userData.character?.emoji || '🙂' };
};

const median = (values) => {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return Math.round(s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2);
};

const summarize = (rooms) => {
  const times = rooms.filter(r => r.opened && Number.isFinite(r.seconds)).map(r => r.seconds);
  const opened = rooms.filter(r => r.opened).length;
  return {
    played: rooms.length,
    opened,
    rate: rooms.length ? Math.round((opened / rooms.length) * 100) : null,
    medianSeconds: median(times),
    fastestSeconds: times.length ? Math.min(...times) : null
  };
};

/**
 * מאחד את ההיסטוריה של כל המשתמשים. כל חברי הצוות שומרים את אותו חדר (אותו id),
 * אז סופרים כל חדר פעם אחת ומצרפים אליו את השחקנים שהיו בו.
 */
export const computeEscapeStats = (usersNode) => {
  const rooms = new Map();
  const players = new Map();
  Object.entries(usersNode || {}).forEach(([uid, raw]) => {
    const history = parseHistory(raw);
    if (!history.length) return;
    const player = playerOf(uid, raw);
    players.set(uid, { ...player, played: 0, opened: 0 });
    history.forEach(h => {
      if (!h || !h.id) return;
      const p = players.get(uid);
      p.played += 1;
      if (h.opened) p.opened += 1;
      const room = rooms.get(h.id);
      if (!room) {
        rooms.set(h.id, {
          id: h.id,
          at: Number(h.at) || 0,
          subject: SUBJECT_IDS.includes(h.subject) ? h.subject : 'english',
          tasks: Number(h.tasks) || null,
          minutes: Number(h.minutes) || null,
          team: h.team || '',
          opened: Boolean(h.opened),
          seconds: Number.isFinite(h.seconds) ? h.seconds : null,
          filled: Number(h.filled) || 0,
          total: Number(h.total) || 0,
          size: Array.isArray(h.emojis) ? h.emojis.length : 0,
          players: [player]
        });
      } else {
        room.players.push(player);
        // ייתכנו הבדלים קטנים בין המכשירים - לוקחים את הנתון הטוב יותר
        if (h.opened) room.opened = true;
        if (Number.isFinite(h.seconds) && (room.seconds === null || h.seconds < room.seconds)) room.seconds = h.seconds;
        room.filled = Math.max(room.filled, Number(h.filled) || 0);
        room.size = Math.max(room.size, Array.isArray(h.emojis) ? h.emojis.length : 0);
      }
    });
  });

  const all = [...rooms.values()].sort((a, b) => b.at - a.at);
  const bySubject = SUBJECT_IDS.map(id => ({ id, ...summarize(all.filter(r => r.subject === id)) }));
  const bySize = ROOM_SIZES.map(s => ({ ...s, ...summarize(all.filter(r => r.tasks === s.tasks)) }));
  const byTeam = [
    { id: 'solo', label: 'לבד', test: n => n <= 1 },
    { id: 'pair', label: '2 ילדים', test: n => n === 2 },
    { id: 'group', label: '3 ומעלה', test: n => n >= 3 }
  ].map(({ test, ...g }) => ({ ...g, ...summarize(all.filter(r => test(r.size))) }));

  return {
    total: summarize(all),
    playersCount: players.size,
    bySubject,
    bySize,
    byTeam,
    topPlayers: [...players.values()].sort((a, b) => b.played - a.played || b.opened - a.opened).slice(0, 10),
    recent: all.slice(0, 15)
  };
};

/** 125 -> "2:05" */
export const formatSeconds = (s) =>
  (s === null || s === undefined ? '—' : `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`);
