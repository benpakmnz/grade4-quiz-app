import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SUBJECTS } from '../data/subjects';
import {
  ROOM_MINUTES, TASKS_PER_KID, MAX_TEAM, CODE_PATTERN, CHEERS,
  pickTopics, roomQuestion, checkRoomAnswer, canHint, makeHint, topicName, roomLink, formatClock,
  roomReward, recordRoomResult, recordHintGiven, readEscapeStats,
  saveActiveRoom, readActiveRoom, saveRoomProgress, readRoomProgress, clearRoomProgress, shareText, ROOM_TOPICS
} from '../data/escapeRoom';
import {
  createRoom, readMeta, requestJoin, setMemberStatus, leaveRoom, startRoom, insertDigit,
  changeBank, sendCheer, linkNextRound, watch, watchServerOffset,
  createRoomWithTeam, watchInvites, dismissInvite
} from '../services/rooms';
import { logMistake } from '../utils/mistakes';
import { saveTeamCard } from '../utils/teamCard';
import { getGenderText } from '../utils/genderText';
import { fxCorrect, fxWrong } from '../utils/fx';
import MathText from './MathText';
import MathVisual from './MathVisual';
import SpeakButton from './SpeakButton';
import VaultCelebration from './VaultCelebration';
import { ChallengeList } from './EscapeHistory';
import './EscapeRoom.css';

const LockIcon = ({ size = 52, open = false }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <path d={open ? 'M20 28V20a12 12 0 0 1 23.5-3.4' : 'M20 28V20a12 12 0 0 1 24 0v8'} stroke="#fde047" strokeWidth="5" strokeLinecap="round" />
    <rect x="12" y="28" width="40" height="30" rx="8" fill="#fde047" />
    {open
      ? <path d="M24 43l6 6 11-12" stroke="#5b21b6" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      : <><circle cx="32" cy="40" r="4" fill="#5b21b6" /><path d="M32 43v7" stroke="#5b21b6" strokeWidth="4" strokeLinecap="round" /></>}
  </svg>
);

const Avatar = ({ m, size = 'md', host }) => (
  <div className={`er-avatar ${size}`}>
    <span className={`er-avatar-face ${host ? 'host' : ''}`} aria-hidden="true">{m.emoji}</span>
    {size !== 'sm' && <span className="er-avatar-name">{m.name}</span>}
    {host && size !== 'sm' && <span className="er-avatar-role">מארח/ת</span>}
  </div>
);

/** הכספת: ספרות שנכנסו מופיעות, השאר עם סימן שאלה. אף אחד לא רואה מי הכניס מה */
const Vault = ({ slots, lock, compact }) => (
  <div className={`er-vault ${compact ? 'compact' : ''}`} dir="ltr">
    {Array.from({ length: slots }, (_, i) => {
      const cell = lock?.[String(i)];
      return (
        <motion.span
          key={i}
          className={`er-vault-cell ${cell ? 'filled' : ''}`}
          initial={false}
          animate={cell ? { scale: [1.3, 1] } : {}}
        >
          {cell ? cell.d : '?'}
        </motion.span>
      );
    })}
  </div>
);

// הזמנה לאתגר חדש תקפה כמה שעות
const INVITE_HOURS = 6;

// ההסבר בדף הכניסה
const INTRO_STEPS = [
  { icon: '🔑', title: 'פותחים חדר ומזמינים חברים', text: 'בוחרים שם לצוות, מקצוע וזמן, ושולחים לחברים קוד או קישור.' },
  { icon: '🧩', title: 'כל אחד פותר 5 משימות', text: 'שאלה מכל נושא, ברמה שלך. ההתקדמות האישית גלויה רק לך.' },
  { icon: '🔓', title: 'מכניסים ספרה לכספת', text: 'מי שמסיים מקבל ספרה מהקוד. כשכל הספרות בפנים - הכספת נפתחת!' },
  { icon: '🤝', title: 'עוזרים אחד לשני', text: 'מי שסיים ממלא את קופת הרמזים ושולח עידוד. בלי תחרות - מנצחים יחד.' }
];

const shareOrWhatsApp = async (text) => {
  try {
    if (navigator.share) {
      await navigator.share({ text });
      return;
    }
  } catch {
    // המשתמש/ת ביטל/ה - לא נורא
    return;
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
};

const copy = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

// ---------------- שאלה ----------------
const RoomQuestion = ({ question, removed, picked, setPicked, input, setInput, locked, result, gender }) => {
  const isMath = question.subject === 'math';
  const options = (question.options || []).filter(o => !removed.includes(o));
  return (
    <div className="er-question">
      <div className="er-chip">{topicName(question.from || question.topic)}</div>
      <div className="er-prompt">{isMath ? <MathText text={getGenderText(question.prompt, gender)} /> : getGenderText(question.prompt, gender)}</div>
      {question.passage && (
        <div className="er-passage" dir="ltr">
          <b>{question.passage.title}</b>
          {question.passage.text.split('\n').map((p, i) => <p key={i}>{p}</p>)}
        </div>
      )}
      {question.emoji && <div className="er-emoji">{question.emoji}</div>}
      {question.english && (
        <div className="er-english" dir="ltr">
          {result === 'wrong' && question.kind === 'mc' && question.english.includes('____')
            ? question.english.replace('____', question.answer)
            : question.english}
          {!question.passage && <SpeakButton text={question.english} small />}
        </div>
      )}
      {question.expr && <div className="er-expr"><MathText text={question.expr} /></div>}
      {isMath && <MathVisual spec={question.visual} />}

      {question.kind === 'mc' && (
        <div className={`er-options ${question.optionVisuals ? 'visual' : ''} ${options.some(o => String(o).length > 18) ? 'long' : ''}`}>
          {options.map(o => {
            const sel = picked === o;
            // אחרי טעות: התשובה הנכונה מסומנת בירוק (ומה שנבחר - באדום)
            const state = result && sel ? (result === 'right' ? 'right' : 'wrong') : result === 'wrong' && o === question.answer ? 'right' : sel ? 'picked' : '';
            return (
              <button
                key={o}
                className={`er-option ${state}`}
                dir={question.optionsHebrew || isMath ? 'rtl' : 'ltr'}
                aria-pressed={sel}
                disabled={locked}
                onClick={() => setPicked(o)}
              >
                {question.optionVisuals
                  ? <MathVisual spec={question.optionVisuals[o]} small />
                  : isMath ? <MathText text={o} /> : o}
              </button>
            );
          })}
        </div>
      )}

      {question.kind === 'input' && (
        <div className="er-input-row">
          <input
            className={`er-input ${result || ''}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            inputMode="numeric"
            dir="ltr"
            disabled={locked}
            aria-label="התשובה"
            placeholder="?"
          />
          {question.unit && <span className="er-unit">{question.unit}</span>}
        </div>
      )}
    </div>
  );
};

// ---------------- מסך ראשי ----------------
const EscapeRoom = ({
  authUser, userData, categoryStats, subjects, defaultSubject, initialCode,
  onExit, onAnswer, onReward, onSignUp, onFinished
}) => {
  const uid = authUser?.uid;
  const [code, setCode] = useState(() => initialCode || readActiveRoom());
  const [meta, setMeta] = useState(undefined);       // undefined = טוען, null = אין חדר כזה
  const [members, setMembers] = useState({});
  const [membersFor, setMembersFor] = useState(null); // לאיזה חדר רשימת הילדים כבר נטענה
  const [assign, setAssign] = useState(null);
  const [lock, setLock] = useState({});
  const [bank, setBank] = useState(0);
  const [cheer, setCheer] = useState(null);
  const [offset, setOffset] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // טופס פתיחה / הצטרפות
  const [team, setTeam] = useState('');
  const [subject, setSubject] = useState(subjects.includes(defaultSubject) ? defaultSubject : subjects[0]);
  const [minutes, setMinutes] = useState(15);
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(null);
  const [showForm, setShowForm] = useState(false); // דף הכניסה ← טופס פתיחת אתגר
  const [showHow, setShowHow] = useState(false);
  const [imageState, setImageState] = useState(null); // 'saving' | 'shared' | 'downloaded' | 'failed'

  const serverNow = now + offset;

  // ----- האזנה לחדר -----
  useEffect(() => {
    if (!code || !uid) return undefined;
    setMeta(undefined);
    const fail = () => setError('אין חיבור לחדר. בדקו את האינטרנט ונסו שוב.');
    const offs = [
      watch(code, 'meta', setMeta, fail),
      watch(code, 'members', (v) => { setMembers(v || {}); setMembersFor(code); }, fail),
      watch(code, `assign/${uid}`, setAssign),
      watch(code, 'lock', (v) => setLock(v || {})),
      watch(code, 'bank', (v) => setBank(Number(v) || 0)),
      watch(code, 'cheers', (v) => {
        const list = Object.values(v || {}).sort((a, b) => (b.t || 0) - (a.t || 0));
        setCheer(list[0] || null);
      })
    ];
    return () => offs.forEach(off => off());
  }, [code, uid]);

  useEffect(() => watchServerOffset(setOffset), []);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!code || !uid) return;
    saveActiveRoom(code);
    // הקישור מהחבר/ה כבר שימש - מורידים אותו מהכתובת כדי שרענון לא יחזיר אליו
    try {
      if (new URLSearchParams(window.location.search).get('room')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch {
      // ignore
    }
  }, [code, uid]);

  const me = members[uid];
  const isHost = meta?.host === uid;
  const teamList = Object.entries(members).filter(([, m]) => m.st === 'in');
  const pending = Object.entries(members).filter(([, m]) => m.st === 'pending');
  const slots = meta?.slots || 0;
  const filled = Object.keys(lock).length;
  const opened = slots > 0 && filled >= slots;
  const timeUp = meta?.status === 'playing' && serverNow >= (meta?.endsAt || 0);
  const ended = meta?.status === 'playing' && (opened || timeUp);

  const leaveToMenu = useCallback(() => {
    saveActiveRoom(null);
    setShowForm(false);
    setCode(null);
    setMeta(undefined);
    setMembers({});
    setAssign(null);
    setLock({});
    setError(null);
  }, []);

  const exit = () => {
    saveActiveRoom(null);
    onExit();
  };

  // ----- המארח/ת מאשר/ת מיד מי שהיה בצוות בסיבוב הקודם -----
  const [prevTeam, setPrevTeam] = useState(null);
  useEffect(() => {
    setPrevTeam(null);
    if (!isHost || !meta?.prev) return undefined;
    return watch(meta.prev, 'members', (v) => setPrevTeam(v || {}));
  }, [isHost, meta?.prev]);
  useEffect(() => {
    if (!isHost || meta?.status !== 'lobby' || !prevTeam) return;
    pending.forEach(([id]) => {
      if (prevTeam[id]?.st === 'in' && teamList.length < MAX_TEAM) setMemberStatus(code, id, 'in').catch(() => {});
    });
  }, [isHost, meta?.status, pending.length, prevTeam]); // eslint-disable-line react-hooks/exhaustive-deps

  // ----- הזמנות לאתגר חדש מחברים לצוות קודם -----
  const [invites, setInvites] = useState({});
  useEffect(() => (uid ? watchInvites(uid, setInvites) : undefined), [uid]);
  const freshInvites = Object.entries(invites)
    .filter(([c, inv]) => CODE_PATTERN.test(c) && inv && serverNow - (inv.t || 0) < INVITE_HOURS * 3600000)
    .sort((a, b) => (b[1].t || 0) - (a[1].t || 0));

  // ----- פעולות -----
  const run = async (fn) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      console.error('Escape room action failed', err);
      setError(/permission/i.test(err?.message || '') ? 'הפעולה נחסמה. אולי החדר כבר התחיל או נסגר.' : 'משהו השתבש. נסו שוב.');
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = () => run(async () => {
    const newCode = await createRoom(authUser, userData, { team: team.trim() || 'הצוות שלנו', subject, minutes });
    setCode(newCode);
  });

  const handleJoinCode = () => {
    const c = joinCode.trim();
    if (!CODE_PATTERN.test(c)) {
      setError('קוד הצטרפות הוא 6 ספרות.');
      return;
    }
    run(async () => {
      const m = await readMeta(c);
      if (m) setCode(c);
      else setError('לא מצאנו חדר עם הקוד הזה. בדקו אותו עם מי שפתח/ה את החדר.');
    });
  };

  const handleRequest = () => run(() => requestJoin(code, authUser, userData));

  // אתגר חדש עם צוות מאתגר קודם (כל מי שהיה בצוות יכול לפתוח)
  const handleAgain = (past) => run(async () => {
    const newCode = await createRoomWithTeam(authUser, userData, past);
    setCode(newCode);
  });

  // מצטרפים מהזמנה - המארח/ת מאשר/ת אוטומטית מי שהיה בצוות
  const acceptInvite = (inviteCode) => run(async () => {
    const m = await readMeta(inviteCode);
    dismissInvite(uid, inviteCode).catch(() => {});
    if (!m || m.status !== 'lobby') {
      setError('האתגר הזה כבר התחיל או נסגר. אפשר לפתוח אתגר חדש 🙂');
      return;
    }
    await requestJoin(inviteCode, authUser, userData);
    setCode(inviteCode);
  });

  const handleStart = () => run(() => startRoom(code, meta, members, serverNow));

  const handleNextRound = () => run(async () => {
    const newCode = await createRoom(authUser, userData, { team: meta.team, subject: meta.subject, minutes: meta.minutes, prev: code });
    await linkNextRound(code, newCode);
    clearRoomProgress(code);
    setCode(newCode);
  });

  const joinNextRound = () => run(async () => {
    const next = meta.next;
    clearRoomProgress(code);
    setCode(next);
    await requestJoin(next, authUser, userData);
  });

  // ---------------- משחק: הסט האישי ----------------
  // { code, topics, done, inserted } - שייך לחדר אחד בלבד. התקדמות של חדר אחר לא נחשבת (גם לא לרגע, במעבר בין חדרים)
  const [progressState, setProgress] = useState(null);
  const progress = progressState && progressState.code === code ? progressState : null;
  const [question, setQuestion] = useState(null);
  const [picked, setPicked] = useState(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);   // 'right' | 'wrong'
  const [hint, setHint] = useState(null);
  const [support, setSupport] = useState(false);
  const [sentCheer, setSentCheer] = useState(false);
  const [toast, setToast] = useState(null);

  const playing = meta?.status === 'playing' && me?.st === 'in' && assign && !ended;

  useEffect(() => {
    if (!playing || progress) return;
    const saved = readRoomProgress(code);
    const p = saved && Array.isArray(saved.topics) && (saved.code === undefined || saved.code === code)
      ? { ...saved, code }
      : { code, topics: pickTopics(meta.subject, categoryStats, TASKS_PER_KID), done: 0, inserted: false };
    setProgress(p);
  }, [playing, progress, code, meta?.subject, categoryStats]);

  useEffect(() => {
    if (code && progress && progress.code === code) saveRoomProgress(code, progress);
  }, [code, progress]);

  const allDone = progress && progress.done >= progress.topics.length;

  const newQuestion = useCallback((topic) => {
    setQuestion(roomQuestion(topic));
    setPicked(null);
    setInput('');
    setResult(null);
    setHint(null);
  }, []);

  // השאלה הנוכחית: הנושא הבא בסט, או שאלת בונוס במשימת התמיכה
  useEffect(() => {
    if (!playing || !progress) return;
    if (!allDone && (!question || question.topic !== progress.topics[progress.done]) && result === null) {
      newQuestion(progress.topics[progress.done]);
    }
  }, [playing, progress, allDone, question, result, newQuestion]);

  const supportTopic = useCallback(() => {
    const list = ROOM_TOPICS[meta?.subject] || ROOM_TOPICS.english;
    return list[Math.floor(Math.random() * list.length)];
  }, [meta?.subject]);

  const startSupport = () => {
    setSupport(true);
    newQuestion(supportTopic());
  };

  const check = () => {
    if (!question || result) return;
    const given = question.kind === 'input' ? input : picked;
    if (given === null || String(given).trim() === '') return;
    const ok = checkRoomAnswer(question, given);
    setResult(ok ? 'right' : 'wrong');
    if (ok) fxCorrect();
    else fxWrong();
    onAnswer(question.from || question.topic, ok);
    if (!ok) {
      logMistake({
        category: question.from || question.topic,
        question: [question.prompt, question.english, question.expr].filter(Boolean).join('  '),
        given,
        correct: question.answer,
        finalCorrect: false
      });
    }
    if (ok && support) {
      changeBank(code, +1).then(done => done && recordHintGiven()).catch(() => {});
    }
  };

  const afterResult = () => {
    if (support) {
      newQuestion(supportTopic());
      return;
    }
    if (result === 'right') {
      setProgress(p => ({ ...p, done: p.done + 1 }));
      setQuestion(null);
      setResult(null);
    } else {
      newQuestion(question.topic); // טעות → שאלה אחרת מאותו נושא
    }
  };

  const takeHint = () => run(async () => {
    const okTake = await changeBank(code, -1);
    if (okTake) setHint(makeHint(question));
    else setError('הקופה ריקה כרגע. מי שסיים/ה יכול/ה למלא אותה במשימת התמיכה.');
  });

  const doInsert = () => run(async () => {
    await insertDigit(code, assign);
    setProgress(p => ({ ...p, inserted: true }));
  });

  const cheerUp = (id) => {
    sendCheer(code, uid, id).catch(() => {});
    setSentCheer(true);
    setTimeout(() => setSentCheer(false), 2500);
  };

  // מדבקת עידוד שהגיעה עכשיו
  useEffect(() => {
    if (!cheer || !cheer.t || serverNow - cheer.t > 6000) return undefined;
    const text = CHEERS.find(c => c.id === cheer.s)?.text;
    if (!text || cheer.u === uid) return undefined; // את העידוד שלי אני לא צריך/ה לראות
    const from = members[cheer.u];
    setToast({ text, name: from?.name, emoji: from?.emoji });
    const id = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(id);
  }, [cheer?.t]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------------- סיום: הפרס נרשם פעם אחת ----------------
  const [endStats, setEndStats] = useState(null);
  const [celebrate, setCelebrate] = useState(false);

  // מעבר לחדר אחר (אתגר חדש / סיבוב נוסף / הזמנה): מתחילים את הסט האישי מאפס.
  // בלי זה ההתקדמות מהאתגר הקודם נשארת, והילד/ה נראה/ית כאילו כבר סיים/ה - בלי שאלות
  useEffect(() => {
    setProgress(null);
    setQuestion(null);
    setPicked(null);
    setInput('');
    setResult(null);
    setHint(null);
    setSupport(false);
    setSentCheer(false);
    setToast(null);
    setEndStats(null);
    setCelebrate(false);
    setImageState(null);
    setCopied(null);
  }, [code]);
  // רץ כשהחדר נגמר וגם כשהפרטים שלי (חבר/ה בצוות + הספרה) מגיעים - למשל כשחוזרים לחדר שנגמר בזמן שלא הייתי.
  // recordRoomResult סופר כל חדר פעם אחת בלבד, ו-handledEnd מונע הפעלה כפולה של החגיגה והפרס
  const myTeamReady = Boolean(me && me.st === 'in' && assign);
  const [handledEnd, setHandledEnd] = useState(null);
  useEffect(() => {
    if (!ended || !myTeamReady) return;
    const roomId = `${code}-${meta.startedAt}`;
    if (handledEnd === roomId) return;
    setHandledEnd(roomId);
    // החגיגה - פעם אחת לכל חדר בכל מכשיר (לא בכל פעם שחוזרים למסך)
    if (opened) {
      try {
        const key = `english_escapeCelebrated_${roomId}`;
        if (!sessionStorage.getItem(key) && !localStorage.getItem(key)) {
          localStorage.setItem(key, '1');
          setCelebrate(true);
        }
      } catch {
        setCelebrate(true);
      }
    }
    const lastT = Math.max(0, ...Object.values(lock).map(c => c.t || 0));
    const rec = recordRoomResult(roomId, opened, {
      code,
      minutes: meta.minutes,
      team: meta.team,
      subject: meta.subject,
      filled,
      total: slots,
      seconds: opened && meta.startedAt && lastT ? Math.max(0, Math.round((lastT - meta.startedAt) / 1000)) : null,
      emojis: teamList.map(([, m]) => m.emoji)
    });
    onFinished?.();
    if (rec) {
      const points = roomReward(filled, slots);
      if (points) onReward(points);
    }
    setEndStats(rec || readEscapeStats());
    clearRoomProgress(code);
    // האתגר נגמר: מסך הסיום נשאר עד שיוצאים, אבל בכניסה הבאה לדף האתגר מתחילים מדף הכניסה
    // (החזרה האוטומטית לחדר נועדה רק לניתוק באמצע אתגר)
    saveActiveRoom(null);
  }, [ended, myTeamReady]); // eslint-disable-line react-hooks/exhaustive-deps -- פעם אחת לכל חדר שנגמר

  // חדר שלא קיים, או חדר שהתחיל בלעדיי - גם אותו לא זוכרים לפעם הבאה
  useEffect(() => {
    if (!code || meta === undefined) return;
    if (meta === null) saveActiveRoom(null);
    else if (meta.status === 'playing' && membersFor === code && (!me || me.st !== 'in')) saveActiveRoom(null);
  }, [code, meta, me, membersFor]);

  // ================= תצוגה =================
  const header = (title, onBack) => (
    <div className="er-top">
      {onBack ? (
        <button className="er-round" onClick={onBack} aria-label="חזרה">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      ) : <span className="er-round-space" />}
      <div className="er-top-title">{title}</div>
      <span className="er-round-space" />
    </div>
  );

  const errorBox = error && <div className="er-error" role="alert">{error}</div>;

  // צריך חשבון כדי לשחק עם חברים
  if (!uid) {
    return (
      <div className="escape-room">
        {header('אתגר מפצחי הכספות', onExit)}
        <div className="er-hero">
          <div className="er-hero-icon"><LockIcon /></div>
          <h1>אתגר מפצחי הכספות</h1>
          <p>כדי לשחק יחד צריך להתחבר עם חשבון, כך שהחברים יוכלו להצטרף לחדר שלכם.</p>
        </div>
        {onSignUp && <button className="er-cta" onClick={onSignUp}>הרשמה / התחברות ✨</button>}
      </div>
    );
  }

  const joinCard = (
    <div className="er-card">
      <label className="er-label" htmlFor="er-join">יש לכם קוד מחבר/ה?</label>
      <div className="er-join-row">
        <input
          id="er-join"
          className="er-text code"
          value={joinCode}
          inputMode="numeric"
          dir="ltr"
          maxLength={6}
          onChange={(e) => setJoinCode(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="123456"
        />
        <button className="er-secondary" disabled={busy || joinCode.length !== 6} onClick={handleJoinCode}>הצטרפות</button>
      </div>
    </div>
  );

  // ----- דף הכניסה: הסבר, האתגרים שכבר בוצעו, והתחלה -----
  if (!code && !showForm) {
    const past = readEscapeStats();
    const returning = past.history.length > 0;
    const intro = (
      <div className="er-card">
        <div className="er-card-title">איך זה עובד?</div>
        <div className="er-intro">
          {INTRO_STEPS.map(st => (
            <div key={st.icon} className="er-intro-step">
              <span className="er-intro-num" aria-hidden="true">{st.icon}</span>
              <span><b>{st.title}</b><span>{st.text}</span></span>
            </div>
          ))}
        </div>
      </div>
    );
    return (
      <div className="escape-room">
        {header('אתגר מפצחי הכספות', onExit)}
        <div className="er-hero">
          <div className="er-hero-icon"><LockIcon /></div>
          {returning
            ? <h1 className="er-next-title">מוכנים לאתגר הבא?</h1>
            : <><h1>אתגר מפצחי הכספות</h1><p>פותרים יחד, פותחים את הכספת יחד</p></>}
        </div>
        {freshInvites.map(([c, inv]) => (
          <motion.div key={c} className="er-invite" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <span className="er-request-face" aria-hidden="true">{inv.emoji}</span>
            <span className="er-invite-text">
              <b>📩 הזמנה לאתגר!</b>
              <span>{inv.name} פתח/ה אתגר חדש עם הצוות "{inv.team}"</span>
            </span>
            <span className="er-invite-actions">
              <button className="er-approve" disabled={busy} onClick={() => acceptInvite(c)}>הצטרפות</button>
              <button className="er-decline" onClick={() => dismissInvite(uid, c).catch(() => {})}>לא עכשיו</button>
            </span>
          </motion.div>
        ))}
        {!returning && intro}
        <button className="er-cta" onClick={() => setShowForm(true)}>התחלה 🚀</button>
        {returning && (
          <div className="er-card">
            <div className="er-row-between">
              <b className="er-card-title">האתגרים שלכם</b>
              <span className="er-pill">🗝️ {past.played}</span>
            </div>
            <ChallengeList history={past.history.slice(0, 5)} compact onAgain={busy ? null : handleAgain} />
          </div>
        )}
        {returning && (showHow ? intro : <button className="er-link light" onClick={() => setShowHow(true)}>איך זה עובד?</button>)}
        {joinCard}
        {errorBox}
      </div>
    );
  }

  // ----- פתיחת אתגר חדש -----
  if (!code) {
    return (
      <div className="escape-room">
        {header('אתגר מפצחי הכספות', () => setShowForm(false))}
        <div className="er-hero">
          <div className="er-hero-icon"><LockIcon /></div>
          <h1>פותחים אתגר חדש</h1>
          <p>פותרים יחד, פותחים את הכספת יחד</p>
        </div>

        <div className="er-card">
          <label className="er-label" htmlFor="er-team">שם הצוות</label>
          <input id="er-team" className="er-text" value={team} maxLength={40} onChange={(e) => setTeam(e.target.value)} placeholder="למשל: הנמרים של ה'2" />

          {subjects.length > 1 && (
            <>
              <div className="er-label" id="er-subject">במה מתאמנים?</div>
              <div className="er-choices two" role="group" aria-labelledby="er-subject">
                {subjects.map(id => (
                  <button key={id} className={`er-choice ${subject === id ? 'on' : ''}`} aria-pressed={subject === id} onClick={() => setSubject(id)}>
                    {SUBJECTS[id].emoji} {SUBJECTS[id].name}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="er-label" id="er-time">כמה זמן יש לכם?</div>
          <div className="er-choices three" role="group" aria-labelledby="er-time">
            {ROOM_MINUTES.map(m => (
              <button key={m} className={`er-choice tall ${minutes === m ? 'on' : ''}`} aria-pressed={minutes === m} onClick={() => setMinutes(m)}>
                <b>{m}</b><span>דקות</span>
              </button>
            ))}
          </div>

          <div className="er-note">🔗 אחרי הפתיחה תקבלו קוד וקישור לשלוח לחברים. כל מי שמצטרף מחכה לאישור שלכם.</div>
          <button className="er-cta" disabled={busy} onClick={handleCreate}>{busy ? 'פותחים...' : 'פתיחת האתגר 🚀'}</button>
        </div>
        {errorBox}
      </div>
    );
  }

  if (meta === undefined) {
    return (
      <div className="escape-room">
        {header('אתגר מפצחי הכספות', leaveToMenu)}
        <div className="er-center"><div className="spinner">🔐</div>{error || 'נכנסים לחדר...'}</div>
      </div>
    );
  }

  if (meta === null) {
    return (
      <div className="escape-room">
        {header('אתגר מפצחי הכספות', leaveToMenu)}
        <div className="er-card er-center-card">
          <h2>לא מצאנו חדר עם הקוד הזה 🤔</h2>
          <p>בדקו את הקוד עם מי שפתח/ה את החדר.</p>
          <button className="er-cta" onClick={leaveToMenu}>חזרה</button>
        </div>
      </div>
    );
  }

  const chips = (
    <div className="er-chips">
      <span>{SUBJECTS[meta.subject]?.emoji} {SUBJECTS[meta.subject]?.name}</span>
      <span>⏰ {meta.minutes} דקות</span>
      <span>👥 {teamList.length} בצוות</span>
    </div>
  );

  const teamGrid = (
    <div className="er-card">
      <div className="er-card-title">בצוות</div>
      <div className="er-team">
        {teamList.map(([id, m]) => <Avatar key={id} m={m} host={id === meta.host} />)}
      </div>
    </div>
  );

  // ----- חדר המתנה -----
  if (meta.status === 'lobby') {
    if (!me) {
      return (
        <div className="escape-room">
          {header('הצטרפות לחדר', leaveToMenu)}
          <div className="er-hero">
            <div className="er-hero-icon"><LockIcon /></div>
            <h1>{meta.team}</h1>
            {chips}
          </div>
          <button className="er-cta" disabled={busy} onClick={handleRequest}>בקשה להצטרף 🙋</button>
          {errorBox}
        </div>
      );
    }
    if (me.st === 'out') {
      return (
        <div className="escape-room">
          {header('אתגר מפצחי הכספות', leaveToMenu)}
          <div className="er-card er-center-card">
            <h2>הפעם זה לא הסתדר</h2>
            <p>אפשר לפתוח אתגר משלכם ולהזמין חברים 🙂</p>
            <button className="er-cta" onClick={leaveToMenu}>לפתיחת אתגר</button>
          </div>
        </div>
      );
    }
    if (!isHost) {
      return (
        <div className="escape-room">
          {header('חדר המתנה', () => { leaveRoom(code, uid).catch(() => {}); leaveToMenu(); })}
          <div className="er-hero small">
            <h1>{meta.team}</h1>
            {chips}
          </div>
          <div className="er-card er-center-card">
            {me.st === 'pending' ? (
              <>
                <motion.div className="er-wait" animate={{ rotate: [0, -8, 8, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>🚪</motion.div>
                <h2>מחכים לאישור</h2>
                <p>ביקשתם להצטרף. עוד רגע המארח/ת יאשר/תאשר.</p>
              </>
            ) : (
              <>
                <div className="er-wait">🎉</div>
                <h2>אתם בצוות!</h2>
                <p>מחכים שהמארח/ת יתחיל/תתחיל את המשחק.</p>
              </>
            )}
          </div>
          {teamGrid}
        </div>
      );
    }
    const link = roomLink(code);
    const invite = `🔐 בואו לאתגר מפצחי הכספות עם הצוות "${meta.team}"! הקוד: ${code}\n${link}`;
    return (
      <div className="escape-room">
        {header('חדר המתנה', leaveToMenu)}
        <div className="er-hero small">
          <h1>{meta.team}</h1>
          {chips}
        </div>

        <div className="er-card er-code-card">
          <div className="er-muted">קוד הצטרפות</div>
          <div className="er-big-code" dir="ltr">{code.slice(0, 3)} {code.slice(3)}</div>
          <div className="er-choices two">
            <button className="er-whatsapp" onClick={() => shareOrWhatsApp(invite)}>📤 שליחת קישור</button>
            <button className="er-choice" onClick={async () => setCopied((await copy(link)) ? 'link' : null)}>
              {copied === 'link' ? 'הועתק ✓' : '📋 העתקת קישור'}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {pending.map(([id, m]) => (
            <motion.div key={id} className="er-request" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <span className="er-request-face" aria-hidden="true">{m.emoji}</span>
              <span className="er-request-text"><b>{m.name}</b> רוצה להצטרף</span>
              <button className="er-approve" disabled={teamList.length >= MAX_TEAM} onClick={() => setMemberStatus(code, id, 'in').catch(() => {})}>אישור</button>
              <button className="er-decline" onClick={() => setMemberStatus(code, id, 'out').catch(() => {})}>לא עכשיו</button>
            </motion.div>
          ))}
        </AnimatePresence>

        {teamGrid}
        <div className="er-hint-line">🔒 כשכולם כאן לוחצים על "התחלה". אחרי ההתחלה החדר ננעל ואי אפשר להצטרף.</div>
        <button className="er-cta" disabled={busy} onClick={handleStart}>{busy ? 'מתחילים...' : 'התחלה!'}</button>
        {errorBox}
      </div>
    );
  }

  // ----- החדר כבר התחיל, ומי שלא בצוות לא יכול להיכנס -----
  if (!me || me.st !== 'in' || !assign) {
    return (
      <div className="escape-room">
        {header('אתגר מפצחי הכספות', leaveToMenu)}
        <div className="er-card er-center-card">
          <h2>החדר הזה כבר התחיל 🔒</h2>
          <p>אפשר לפתוח אתגר חדש ולהזמין חברים.</p>
          <button className="er-cta" onClick={leaveToMenu}>לפתיחת אתגר</button>
        </div>
      </div>
    );
  }

  // ----- סיום -----
  if (ended) {
    const lastT = Math.max(...Object.values(lock).map(c => c.t || 0));
    const seconds = opened && meta.startedAt ? Math.max(0, Math.round((lastT - meta.startedAt) / 1000)) : null;
    const points = roomReward(filled, slots);
    const played = endStats?.played || readEscapeStats().played;
    const text = shareText({ team: meta.team, opened, filled, total: slots, seconds, link: window.location.origin });
    const codeDigits = Object.keys(lock).sort((a, b) => Number(a) - Number(b)).map(k => lock[k].d);
    return (
      <div className="escape-room">
        <AnimatePresence>
          {celebrate && (
            <VaultCelebration
              digits={codeDigits}
              team={meta.team}
              emojis={teamList.map(([, m]) => m.emoji)}
              onDone={() => setCelebrate(false)}
            />
          )}
        </AnimatePresence>
        <div className="er-hero">
          {opened && <div className="er-confetti" aria-hidden="true"><span>🎊</span><span>✨</span><span>⭐</span><span>🎉</span></div>}
          <div className="er-hero-icon">
            {opened ? <LockIcon size={64} open /> : <span className="er-big-emoji">⏰</span>}
          </div>
          <h1>{opened ? 'פתחתם את הכספת!' : 'הזמן נגמר, וכמעט!'}</h1>
          <p>{opened ? `${meta.team}${seconds != null ? ` · ${formatClock(seconds * 1000)} דקות` : ''}` : `פתחתם ${filled} מתוך ${slots} מנעולים 💪`}</p>
        </div>


        <div className="er-card er-center-card">
          {!opened && <div className="er-muted">מה הצוות הרוויח</div>}
          <div className="er-prize">
            <span className="er-prize-icon" aria-hidden="true">{opened ? '🗝️' : '🔐'}</span>
            <span>
              <b>{opened ? 'באדג\' "פותחי כספות"' : `${filled} מנעולים פתוחים`}</b>
              {points > 0 && <span className="er-points">+{points} נקודות ⭐</span>}
            </span>
          </div>
          <div className="er-team small">
            {teamList.map(([id, m]) => <Avatar key={id} m={m} size="sm" />)}
          </div>
        </div>

        <div className="er-trophy-strip">
          <span className="er-trophy-face" aria-hidden="true">🏆</span>
          <span className="er-trophy-text">
            <b>גביע מפצחי הכספות</b>
            <span>{opened ? `זה האתגר ה-${played} שלך` : 'השתתפת באתגר - זה מה שקובע!'}</span>
          </span>
          <span className="er-trophy-count" dir="ltr">×{played}</span>
        </div>

        <div className="er-choices two">
          <button className="er-cta" onClick={() => shareOrWhatsApp(text)}>📤 שליחת הודעה</button>
          <button
            className="er-cta"
            disabled={imageState === 'saving'}
            onClick={async () => {
              setImageState('saving');
              setImageState(await saveTeamCard({
                team: meta.team,
                subjectLabel: `${SUBJECTS[meta.subject]?.emoji || ''} ${SUBJECTS[meta.subject]?.name || ''}`.trim(),
                opened,
                filled,
                total: slots,
                seconds,
                emojis: teamList.map(([, m]) => m.emoji),
                link: window.location.origin
              }));
            }}
          >
            {imageState === 'saving' ? 'מכינים...' : imageState === 'downloaded' ? 'נשמר ✓' : '🖼️ שמירת תמונה'}
          </button>
        </div>
        {imageState === 'failed' && <div className="er-error">לא הצלחנו ליצור את התמונה במכשיר הזה. אפשר לשלוח את ההודעה במקום.</div>}
        <div className="er-choices two">
          {isHost && !meta.next && <button className="er-ghost" disabled={busy} onClick={handleNextRound}>🔄 עוד סיבוב</button>}
          {!isHost && meta.next && <button className="er-ghost" disabled={busy} onClick={joinNextRound}>🔄 לסיבוב החדש</button>}
          {!isHost && !meta.next && <button className="er-ghost" onClick={leaveToMenu}>אתגר חדש</button>}
          {isHost && meta.next && <button className="er-ghost" onClick={() => setCode(meta.next)}>🔄 לסיבוב החדש</button>}
          <button className="er-ghost" onClick={exit}>🏠 לדף הבחירה</button>
        </div>
        <p className="er-share-note">🛡️ בהודעה ובתמונה מופיעים רק שם הצוות, הדמויות והתוצאה - בלי שמות של ילדים ובלי ציונים.</p>
      </div>
    );
  }

  // ----- משחק -----
  if (!progress) {
    return (
      <div className="escape-room">
        <div className="er-center"><div className="spinner">🔐</div>טוענים את המשימות...</div>
      </div>
    );
  }
  const myDigit = assign.digit;
  const timeLeft = (meta.endsAt || 0) - serverNow;
  const answerReady = question && (question.kind === 'input' ? input.trim() !== '' : picked !== null);

  const questionBlock = question && (
    <>
      <div className="er-card">
        <RoomQuestion
          question={question}
          removed={hint?.remove || []}
          picked={picked}
          setPicked={setPicked}
          input={input}
          setInput={setInput}
          locked={Boolean(result)}
          result={result}
          gender={userData?.gender}
        />
        {hint?.text && <div className="er-hint">💡 רמז: {hint.text} אף אחד בצוות לא רואה מי לקח רמז.</div>}
      </div>
      {!result && (
        <button className="er-cta" disabled={!answerReady} onClick={check}>בדיקה</button>
      )}
      {result === 'right' && (
        <div className="er-feedback right">
          <span>{support ? 'נכון! הוספתם רמז לקופה של הצוות 💡' : progress.done + 1 >= progress.topics.length ? 'נכון! הרווחתם חלק מהקוד של הצוות 🔑' : 'נכון! ממשיכים למשימה הבאה ✨'}</span>
          <button className="er-cta green" onClick={afterResult}>{support ? 'לשאלת בונוס נוספת' : progress.done + 1 >= progress.topics.length ? 'לחלק שלי בקוד 🔑' : 'למשימה הבאה'}</button>
        </div>
      )}
      {result === 'wrong' && (
        <div className="er-feedback wrong">
          <div className="er-explain">
            <div className="er-explain-answer">
              ✅ התשובה הנכונה:{' '}
              <b dir="auto">
                {question.subject === 'math'
                  ? <MathText text={`${question.answer}${question.unit ? ` ${question.unit}` : ''}`} />
                  : question.answer}
              </b>
            </div>
            {String(question.explanation || (question.passage ? 'אפשר למצוא את התשובה בקטע 📖 כדאי לקרוא שוב את המשפט שמדבר על זה.' : ''))
              .split('\n')
              .filter(Boolean)
              .map((line, i) => (
                <p key={i}>{question.subject === 'math' ? <MathText text={line} /> : line}</p>
              ))}
          </div>
          <span>💪 {support ? 'עכשיו עוד שאלת בונוס.' : 'עכשיו עוד שאלה מאותו נושא - הפעם תצליחו!'}</span>
          <button className="er-cta" onClick={afterResult}>לשאלה הבאה</button>
        </div>
      )}
    </>
  );

  return (
    <div className="escape-room playing">
      <div className="er-top">
        <div className={`er-clock ${timeLeft < 60000 ? 'urgent' : ''}`} aria-label="הזמן שנשאר">
          ⏰ <span dir="ltr">{formatClock(timeLeft)}</span>
        </div>
        {!allDone && !support && (
          <button className="er-hint-btn" disabled={busy || !question || !canHint(question) || Boolean(hint) || Boolean(result) || bank < 1} onClick={takeHint}>
            💡 רמז מהקופה · {bank}
          </button>
        )}
        {(allDone || support) && <div className="er-team-name">{meta.team}</div>}
      </div>

      {!allDone && (
        <div className="er-progress">
          <div className="er-progress-head">
            <b>משימה {Math.min(progress.done + 1, progress.topics.length)} מתוך {progress.topics.length}</b>
            <span>👁️ רק לך רואים את זה</span>
          </div>
          <div className="er-steps">
            {progress.topics.map((t, i) => <span key={t} className={i < progress.done ? 'done' : i === progress.done ? 'now' : ''} />)}
          </div>
        </div>
      )}

      {!allDone && questionBlock}

      {allDone && (
        <>
          <div className="er-card er-mine">
            <div className="er-key">
              <span aria-hidden="true">🔑</span>
              <b>{myDigit}</b>
            </div>
            <div>
              <h2>{progress.inserted ? 'נכנס למנעול! 🎉' : 'החלק שלכם בקוד'}</h2>
              <p>{progress.inserted ? 'עכשיו אפשר לעזור לצוות במשימת התמיכה.' : 'הכניסו אותו למנעול, וכל הצוות יראה את הקוד מתמלא.'}</p>
            </div>
          </div>
          {!progress.inserted && <button className="er-cta" disabled={busy} onClick={doInsert}>הכנסה למנעול 🔓</button>}
        </>
      )}

      <div className="er-vault-card">
        <div className="er-vault-title">🔒 הכספת של הצוות</div>
        <Vault slots={slots} lock={lock} compact={!allDone} />
        <div className="er-vault-count"><span dir="ltr">{filled}</span> מתוך {slots} מנעולים נפתחו</div>
      </div>

      {allDone && progress.inserted && (
        support ? questionBlock : (
          <div className="er-card">
            <div className="er-row-between">
              <b className="er-card-title">🤝 משימת תמיכה</b>
              <span className="er-pill">💡 בקופה: {bank} רמזים</span>
            </div>
            <p className="er-muted-text">פתרו שאלות בונוס ומלאו את קופת הרמזים. מי שנתקע יכול לקחת ממנה רמז.</p>
            <button className="er-outline" onClick={startSupport}>למשימת התמיכה</button>
          </div>
        )
      )}

      {allDone && progress.inserted && (
        <div className="er-cheers">
          <div className="er-cheers-title">שליחת עידוד לצוות</div>
          <div className="er-cheers-row">
            {CHEERS.map(c => <button key={c.id} className="er-cheer" onClick={() => cheerUp(c.id)}>{c.text}</button>)}
          </div>
          {sentCheer && <div className="er-sent">✓ העידוד נשלח לצוות</div>}
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div className="er-toast" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}>
            {toast.emoji && <span className="er-toast-face" aria-hidden="true">{toast.emoji}</span>}
            <span className="er-toast-body">
              {toast.name && <b>{toast.name}</b>}
              <span>{toast.text}</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      {errorBox}
    </div>
  );
};

/** אם משהו נשבר בתוך האתגר - הודעה ברורה (עם פרטי השגיאה לצילום מסך) במקום מסך ריק */
export class EscapeRoomBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Escape room crashed', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="escape-room">
        <div className="er-card er-center-card">
          <h2>אופס, משהו השתבש באתגר 🙈</h2>
          <p>אפשר לנסות שוב. אם זה חוזר - צלמו את המסך ושלחו להורה.</p>
          <code className="er-crash" dir="ltr">{String(this.state.error?.message || this.state.error).slice(0, 200)}</code>
          <button className="er-cta" onClick={() => this.setState({ error: null })}>לנסות שוב</button>
          {this.props.onExit && <button className="er-outline" onClick={this.props.onExit}>🏠 לדף הבחירה</button>}
        </div>
      </div>
    );
  }
}

export default EscapeRoom;

