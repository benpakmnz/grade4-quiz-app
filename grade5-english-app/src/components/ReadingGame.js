import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGenderText } from '../utils/genderText';
import { useGameScoring } from '../utils/useGameScoring';
import { logMistake } from '../utils/mistakes';
import { LessonLauncher } from './LessonViewer';
import { PASSAGES, parsePassage, wrongTapHint, TAG_PLURAL, TAG_SOME, Q_KINDS } from '../data/readingPassages';
import './Game.css';
import './EnglishGame.css';
import './ReadingGame.css';

// "בלשי המילים": כל קטע הוא "תיק חקירה" - קוראים, אוספים ראיות (מסמנים מילים בטקסט) ופותרים (שאלות הבנה)
const SOLVED_KEY = 'english_readingSolved';
const readSolved = () => {
  try {
    const v = JSON.parse(localStorage.getItem(SOLVED_KEY) || '{}');
    return v && typeof v === 'object' ? v : {};
  } catch {
    return {};
  }
};
const saveSolved = (v) => {
  try {
    localStorage.setItem(SOLVED_KEY, JSON.stringify(v));
  } catch {
    // ignore
  }
};

const RANKS = [
  { at: 0, emoji: '🔎', f: 'בלשית מתחילה', m: 'בלש מתחיל' },
  { at: 2, emoji: '🕵️', f: 'בלשית בכירה', m: 'בלש בכיר' },
  { at: 4, emoji: '🎖️', f: 'מפקחת', m: 'מפקח' },
  { at: 6, emoji: '🏆', f: 'ראשת הבלשים', m: 'ראש הבלשים' }
];
const rankOf = (n) => [...RANKS].reverse().find(r => n >= r.at);

const Stars = ({ n }) => (
  <span className="rd-stars" aria-label={`${n} כוכבים`}>
    {[1, 2, 3].map(i => <span key={i} className={i <= n ? 'on' : ''}>★</span>)}
  </span>
);

const ReadingGame = (props) => {
  const { title, onBack, userData, category } = props;
  const { registerResult } = useGameScoring(props);
  const g = (text) => getGenderText(text, userData?.gender);

  const [solved, setSolved] = useState(readSolved);
  const [passageId, setPassageId] = useState(null);
  const [stage, setStage] = useState('read'); // read | mark | questions | done
  const [taskIdx, setTaskIdx] = useState(0);
  const [found, setFound] = useState({});          // "פסקה-מילה" ← סוג
  const [taskWrongs, setTaskWrongs] = useState(0);
  const [cleanTasks, setCleanTasks] = useState(0);
  const [hint, setHint] = useState(null);
  const [flash, setFlash] = useState(null);         // מילה שנלחצה בטעות
  const [pulse, setPulse] = useState(null);         // רמז: מילה שמהבהבת
  const [qIdx, setQIdx] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [rightCount, setRightCount] = useState(0);
  const [showText, setShowText] = useState(false);

  const passage = PASSAGES.find(p => p.id === passageId);
  const tokens = useMemo(() => (passage ? parsePassage(passage) : []), [passage]);
  const solvedCount = Object.keys(solved).length;

  const start = (id) => {
    setPassageId(id);
    setStage('read');
    setTaskIdx(0);
    setFound({});
    setTaskWrongs(0);
    setCleanTasks(0);
    setHint(null);
    setQIdx(0);
    setChosen(null);
    setRightCount(0);
    setShowText(false);
  };

  // ---------------- רשימת התיקים ----------------
  if (!passage) {
    const rank = rankOf(solvedCount);
    const next = RANKS.find(r => r.at > solvedCount);
    return (
      <div className="math-game english-game reading-game">
        <div className="game-header">
          <button className="back-button" onClick={onBack}>← חזרה</button>
          <LessonLauncher categoryId={category} userData={userData} />
          <h2 className="game-title">{title}</h2>
        </div>
        <div className="rd-rank">
          <span className="rd-rank-emoji" aria-hidden="true">{rank.emoji}</span>
          <div>
            <b>{userData?.gender === 'male' ? rank.m : rank.f}</b>
            <span>{solvedCount} תיקים נפתרו{next ? ` · עוד ${next.at - solvedCount} לדרגה הבאה` : ''}</span>
          </div>
        </div>
        <div className="rd-cases">
          {PASSAGES.map((p, i) => (
            <motion.button
              key={p.id}
              className={`rd-case ${solved[p.id] ? 'solved' : ''}`}
              onClick={() => start(p.id)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="rd-case-emoji" aria-hidden="true">{p.emoji}</span>
              <span className="rd-case-main">
                <span className="rd-case-num">תיק מס' {i + 1}</span>
                <b>{p.title}</b>
              </span>
              {solved[p.id] ? <Stars n={solved[p.id]} /> : <span className="rd-case-go">לחקירה ←</span>}
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  const task = passage.tasks[taskIdx];
  const inScope = (pi) => !task || task.type === 'c' || pi === passage.tagged;
  const foundNow = task ? Object.entries(found).filter(([, t]) => t === task.type).length : 0;
  const taskDone = task && foundNow >= task.count;

  const tapWord = (pi, tok) => {
    if (stage !== 'mark' || taskDone || !inScope(pi)) return;
    const key = `${pi}-${tok.idx}`;
    if (found[key]) return;
    if (tok.tag === task.type) {
      const next = { ...found, [key]: tok.tag };
      setFound(next);
      setHint(null);
      setPulse(null);
      if (Object.values(next).filter(t => t === task.type).length >= task.count) {
        const clean = taskWrongs <= 1;
        registerResult(clean, 10);
        if (clean) setCleanTasks(c => c + 1);
      }
      return;
    }
    setTaskWrongs(w => w + 1);
    setFlash(key);
    setTimeout(() => setFlash(f => (f === key ? null : f)), 600);
    setHint(wrongTapHint(tok, task.type));
  };

  const showHint = () => {
    for (let pi = 0; pi < tokens.length; pi++) {
      if (!inScope(pi)) continue;
      const t = tokens[pi].find(x => x.tag === task.type && !found[`${pi}-${x.idx}`]);
      if (t) {
        setPulse(`${pi}-${t.idx}`);
        setTaskWrongs(w => w + 1);
        setHint(`💡 תסתכלו טוב על המילה שמהבהבת...`);
        return;
      }
    }
  };

  const nextTask = () => {
    setHint(null);
    setPulse(null);
    setTaskWrongs(0);
    if (taskIdx + 1 < passage.tasks.length) setTaskIdx(taskIdx + 1);
    else {
      setStage('questions');
      setTaskIdx(passage.tasks.length);
    }
  };

  // ---------------- הטקסט עם המילים ----------------
  const renderPassage = (interactive) => (
    <div className={`rd-text ${interactive ? 'interactive' : ''}`}>
      {tokens.map((para, pi) => (
        <p key={pi} className={`${interactive && !inScope(pi) ? 'dim' : ''} ${interactive && task && task.type !== 'c' && pi === passage.tagged ? 'focus' : ''}`}>
          {para.map(tok => {
            const key = `${pi}-${tok.idx}`;
            const f = found[key];
            const cls = `rd-w ${f ? `tag-${f}` : ''} ${flash === key ? 'wrong' : ''} ${pulse === key ? 'pulse' : ''} ${taskDone && task && tok.tag === task.type && !f && inScope(pi) ? `missed tag-${task.type}` : ''}`;
            return (
              <React.Fragment key={tok.idx}>
                {interactive
                  ? <span role="button" tabIndex={0} className={cls} onClick={() => tapWord(pi, tok)} onKeyDown={(e) => e.key === 'Enter' && tapWord(pi, tok)}>{tok.text}</span>
                  : <span className={cls}>{tok.text}</span>}
                {tok.punct}{' '}
              </React.Fragment>
            );
          })}
        </p>
      ))}
    </div>
  );

  // ---------------- שאלות ----------------
  const question = passage.questions[qIdx];
  const answer = (opt) => {
    if (chosen) return;
    setChosen(opt);
    const ok = opt === question.answer;
    if (ok) setRightCount(c => c + 1);
    else {
      logMistake({ category: 'hReading', question: `${passage.title}: ${question.q}`, given: opt, correct: question.answer, finalCorrect: false });
    }
    registerResult(ok, 15);
  };
  const nextQuestion = () => {
    setChosen(null);
    if (qIdx + 1 < passage.questions.length) {
      setQIdx(qIdx + 1);
      return;
    }
    // סיום התיק: כוכבים לפי שאלות ההבנה (העיקר) והסימון
    const total = passage.questions.length + passage.tasks.length;
    const score = (rightCount + cleanTasks) / total;
    const stars = score >= 0.85 ? 3 : score >= 0.6 ? 2 : 1;
    const next = { ...solved, [passage.id]: Math.max(stars, solved[passage.id] || 0) };
    setSolved(next);
    saveSolved(next);
    setStage('done');
  };

  const nextCase = PASSAGES.find(p => !solved[p.id] && p.id !== passage.id) || PASSAGES[(PASSAGES.indexOf(passage) + 1) % PASSAGES.length];

  return (
    <div className="math-game english-game reading-game">
      <div className="game-header">
        <button className="back-button" onClick={() => setPassageId(null)}>← לכל התיקים</button>
        <h2 className="game-title">{passage.emoji} {passage.title}</h2>
      </div>

      <div className="rd-steps" aria-label="שלבי החקירה">
        {['📖 קוראים', '🔍 אוספים ראיות', '🧠 פותרים'].map((s, i) => {
          const at = { read: 0, mark: 1, questions: 2, done: 3 }[stage];
          return <span key={s} className={`rd-step ${i === at ? 'now' : i < at ? 'done' : ''}`}>{s}</span>;
        })}
      </div>

      {stage === 'read' && (
        <motion.div className="question-card rd-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="rd-instructions">{g('קראי את הקטע בעיון - אחר כך יהיו משימות ושאלות עליו.')}</p>
          {renderPassage(false)}
          <button className="next-button" onClick={() => setStage('mark')}>קראתי! מתחילים לחקור 🔍</button>
        </motion.div>
      )}

      {stage === 'mark' && task && (
        <motion.div className="question-card rd-card" key={`task-${taskIdx}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className={`rd-task tag-${task.type}`}>
            <span className="rd-task-num">משימה {taskIdx + 1} מתוך {passage.tasks.length}</span>
            <b>
              {task.type === 'c'
                ? `${g('מצאי')} בקטע את ${task.count} ${TAG_PLURAL.c}`
                : `${g('מצאי')} ${task.count} ${TAG_SOME[task.type]} בפסקה המודגשת`}
            </b>
          </div>
          {renderPassage(true)}
          <div className={`rd-dock ${taskDone ? 'ok' : ''}`}>
            {taskDone ? (
              <>
                <b>✅ {taskWrongs <= 1 ? 'עבודת בילוש מושלמת!' : 'מצאת את כולן!'}</b>
                {task.type !== 'c' && <span className="rd-dock-note">במסגרת מקווקוות - עוד {TAG_SOME[task.type]} שלא סימנת.</span>}
                <button className="next-button" onClick={nextTask}>{taskIdx + 1 < passage.tasks.length ? 'למשימה הבאה ←' : 'לשאלות על הקטע ←'}</button>
              </>
            ) : (
              <>
                <div className="rd-dock-row">
                  <span className="rd-counter">🔍 {Math.min(foundNow, task.count)} / {task.count}</span>
                  <button className="rd-hint-btn" onClick={showHint}>💡 רמז</button>
                </div>
                <AnimatePresence mode="wait">
                  {hint && (
                    <motion.div key={hint} className="rd-dock-hint" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      {hint}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        </motion.div>
      )}

      {stage === 'questions' && (
        <motion.div className="question-card rd-card" key={`q-${qIdx}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="rd-q-top">
            <span className={`rd-q-kind kind-${question.kind}`}>{Q_KINDS[question.kind]}</span>
            <span className="rd-q-num">שאלה {qIdx + 1} מתוך {passage.questions.length}</span>
          </div>
          <button className="rd-toggle" onClick={() => setShowText(v => !v)}>{showText ? '🙈 להסתיר את הקטע' : '📖 להציג את הקטע'}</button>
          {showText && renderPassage(false)}
          <h2 className="question-title rd-question">{question.q}</h2>
          <div className="options-grid rd-options">
            {question.options.map(opt => {
              const isRight = chosen && opt === question.answer;
              const isWrong = chosen === opt && opt !== question.answer;
              return (
                <button key={opt} className={`option-button ${isRight ? 'right' : ''} ${isWrong ? 'wrong' : ''}`} disabled={Boolean(chosen)} onClick={() => answer(opt)}>
                  {opt}
                </button>
              );
            })}
          </div>
          {chosen && (
            <motion.div className={`feedback ${chosen === question.answer ? 'correct' : 'incorrect'}`} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <h3 className="feedback-message">{chosen === question.answer ? '🎯 נכון!' : g('לא נורא - ככה מוצאים את התשובה:')}</h3>
              <p className="rd-tip">💡 {question.tip}</p>
              <button className="next-button" onClick={nextQuestion}>{qIdx + 1 < passage.questions.length ? 'שאלה הבאה ←' : 'לסגירת התיק ←'}</button>
            </motion.div>
          )}
        </motion.div>
      )}

      {stage === 'done' && (
        <motion.div className="question-card rd-card rd-done" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="rd-done-emoji">🕵️</div>
          <h2>התיק נפתר!</h2>
          <Stars n={solved[passage.id] || 1} />
          <p>
            ענית נכון על <b>{rightCount}</b> מתוך <b>{passage.questions.length}</b> שאלות הבנה,
            {' '}ו-<b>{cleanTasks}</b> מתוך <b>{passage.tasks.length}</b> משימות הסימון היו כמעט בלי טעויות.
          </p>
          <div className="rd-done-actions">
            <button className="next-button" onClick={() => start(nextCase.id)}>לתיק הבא: {nextCase.emoji} {nextCase.title} ←</button>
            <button className="rd-toggle" onClick={() => setPassageId(null)}>לכל התיקים</button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ReadingGame;
