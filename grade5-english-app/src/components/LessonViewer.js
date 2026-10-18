import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { lessons } from '../data/lessons';
import { getGenderText } from '../utils/genderText';
import { notifyLocalChange } from '../services/cloudSync';
import SpeakButton from './SpeakButton';
import MathText from './MathText';
import MathVisual from './MathVisual';
import './LessonViewer.css';

const SEEN_KEY = 'english_lessonsSeen';

const readSeen = () => {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');
  } catch {
    return [];
  }
};

const markSeen = (id) => {
  try {
    const seen = readSeen();
    if (!seen.includes(id)) {
      localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, id]));
      notifyLocalChange();
    }
  } catch {
    // ignore
  }
};

// "**מילה**" ← מילה מודגשת (ותרגילים נשארים משמאל לימין גם כשחלק מהם מודגש)
const Rich = ({ text }) => <MathText text={text} rich />;
const plain = (text) => text.replace(/\*\*/g, '');
const isEnglish = (text) => /^[A-Za-z_'"(]/.test(plain(text).trim());

// ---------- שלבים ----------
const RulesStep = ({ step, g }) => (
  <div className="lesson-rules">
    <p className="lesson-intro">{step.intro}</p>
    {step.introEn && <p className="lesson-intro-en" dir="ltr">{step.introEn}</p>}
    <div className="rule-cards">
      {step.cards.map((card, i) => (
        <motion.div
          key={card.word}
          className="rule-card"
          style={{ background: card.color, '--ink': card.ink }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.15 }}
        >
          <div className="rule-head">
            <span className="rule-word" dir="ltr">{card.word}</span>
            <span className="rule-emoji">{card.emoji}</span>
          </div>
          <div className="rule-who" dir="ltr">
            {card.who.map(w => <span key={w} className="who-chip">{w}</span>)}
          </div>
          <ul className="rule-examples" dir="ltr">
            {card.examples.map(ex => (
              <li key={ex}>
                <SpeakButton text={plain(ex)} small />
                <span><Rich text={ex} /></span>
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
    {step.remember && <div className="lesson-remember">💡 <b>{g('זכרי:')}</b> {step.remember}</div>}
  </div>
);

const HowtoStep = ({ step, g, rtl }) => {
  const [shown, setShown] = useState(1);
  const all = shown >= step.steps.length;
  return (
    <div className="lesson-howto">
      <div className="howto-sentence" dir={rtl ? 'rtl' : 'ltr'}>{rtl ? <MathText text={step.sentence} /> : step.sentence}</div>
      <ol className="howto-steps">
        <AnimatePresence>
          {step.steps.slice(0, shown).map((s, i) => (
            <motion.li key={i} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
              <span className="howto-num">{i + 1}</span>
              <div>
                <div className="howto-he">{s.he}</div>
                <div className="howto-show" dir={rtl ? 'rtl' : 'ltr'}><Rich text={s.show} /></div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
      {!all ? (
        <button className="lesson-action" onClick={() => setShown(shown + 1)}>הצעד הבא 👇</button>
      ) : (
        step.extra && (
          <motion.div className="howto-extra" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <b>{g('עוד טיפים:')}</b>
            <ul>
              {step.extra.map(t => <li key={t} dir={!rtl && isEnglish(t) ? 'ltr' : 'rtl'}><Rich text={t} /></li>)}
            </ul>
          </motion.div>
        )
      )}
    </div>
  );
};

const SortStep = ({ step, g }) => {
  const [index, setIndex] = useState(0);
  const [placed, setPlaced] = useState({});
  const [wrong, setWrong] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const item = step.items[index];
  const done = index >= step.items.length;

  const choose = (bucket) => {
    if (done) return;
    if (bucket === item.answer) {
      setPlaced(p => ({ ...p, [bucket]: [...(p[bucket] || []), item.text] }));
      setWrong(null);
      setIndex(index + 1);
    } else {
      setWrong(bucket);
      setMistakes(m => m + 1);
    }
  };

  return (
    <div className="lesson-sort">
      <p className="lesson-intro">{g(step.instruction)}</p>
      <div className="sort-current">
        {done ? (
          <motion.div className="sort-done" initial={{ scale: 0 }} animate={{ scale: 1 }}>
            🎉 {mistakes === 0 ? 'מושלם! בלי אף טעות!' : `כל הכבוד! (${mistakes} טעויות בדרך)`}
          </motion.div>
        ) : (
          <motion.div
            key={index}
            className={`sort-item ${wrong ? 'shake' : ''}`}
            dir="ltr"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {item.text}
          </motion.div>
        )}
        {!done && <div className="sort-count">{index + 1} / {step.items.length}</div>}
        {wrong && !done && <div className="sort-wrong">לא {wrong} - {g('נסי קופסה אחרת')} 💪</div>}
      </div>
      <div className="sort-buckets">
        {step.buckets.map(b => (
          <button key={b} className="sort-bucket" onClick={() => choose(b)} disabled={done}>
            <span className="bucket-label" dir="ltr">{b}</span>
            <span className="bucket-items" dir="ltr">
              {(placed[b] || []).map((t, i) => <span key={i} className="bucket-chip">{t}</span>)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

const CheckStep = ({ step, g, rtl }) => {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const q = step.questions[index];
  const done = index >= step.questions.length;

  const pick = (opt) => {
    if (picked) return;
    setPicked(opt);
    if (opt === q.answer) setScore(s => s + 1);
  };

  return (
    <div className="lesson-check">
      {step.passage && (
        <div className="check-passage" dir="ltr">
          <SpeakButton text={step.passage} small />
          {step.passage}
        </div>
      )}
      {done ? (
        <motion.div className="sort-done" initial={{ scale: 0 }} animate={{ scale: 1 }}>
          {score === step.questions.length ? '🏆' : '⭐'} {score} / {step.questions.length} - {g('את מוכנה לתרגול!')}
        </motion.div>
      ) : (
        <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="sort-count">{index + 1} / {step.questions.length}</div>
          {rtl ? (
            <div className="check-sentence rtl" dir="rtl"><MathText text={q.sentence} /></div>
          ) : (
            <div className="check-sentence" dir="ltr">
              {q.sentence}
              <SpeakButton text={q.sentence.replace('____', picked || 'blank')} small />
            </div>
          )}
          {q.visual && <MathVisual spec={q.visual} />}
          <div className="check-options" dir={rtl ? 'rtl' : 'ltr'}>
            {q.options.map(opt => (
              <button
                key={opt}
                className={`check-option ${picked && opt === q.answer ? 'right' : ''} ${picked === opt && opt !== q.answer ? 'wrong' : ''}`}
                onClick={() => pick(opt)}
              >
                {rtl ? <MathText text={opt} /> : opt}
              </button>
            ))}
          </div>
          {picked && (
            <motion.div className={`check-feedback ${picked === q.answer ? 'ok' : 'bad'}`} initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              {picked === q.answer ? '✅ נכון! ' : <>❌ התשובה: <MathText text={q.answer} />. </>}
              <span>💡 <MathText text={q.tip} /></span>
              <button className="lesson-action small" onClick={() => { setIndex(index + 1); setPicked(null); }}>
                {index + 1 < step.questions.length ? 'הבאה ←' : 'סיום ←'}
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};

const TipsStep = ({ step }) => (
  <div className="lesson-tips">
    {step.intro && <p className="lesson-intro"><Rich text={step.intro} /></p>}
    {step.pattern && (
      <div className="pattern-row" dir="ltr">
        {step.pattern.map((p, i) => (
          <motion.div key={p.label} className="pattern-block" style={{ background: p.color }}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }}>
            <span className="pattern-label">{p.label}</span>
            <span className="pattern-en">{p.en}</span>
          </motion.div>
        ))}
      </div>
    )}
    <ul className="tips-list">
      {step.tips.map((t, i) => (
        <motion.li key={t} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.12 }}>
          <span className="tip-num">{i + 1}</span>
          <span><Rich text={t} /></span>
        </motion.li>
      ))}
    </ul>
  </div>
);

// כרטיסים עם ציור (בחשבון)
const PicturesStep = ({ step }) => (
  <div className="lesson-pictures">
    {step.intro && <p className="lesson-intro"><Rich text={step.intro} /></p>}
    <div className={`picture-cards ${step.cards.length > 2 ? 'many' : ''}`}>
      {step.cards.map((card, i) => (
        <motion.div key={i} className="picture-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}>
          <MathVisual spec={card.visual} />
          <p><Rich text={card.text} /></p>
        </motion.div>
      ))}
    </div>
  </div>
);

const STEP_COMPONENTS = { rules: RulesStep, howto: HowtoStep, sort: SortStep, check: CheckStep, tips: TipsStep, pictures: PicturesStep };

// ---------- החלון ----------
export const LessonViewer = ({ categoryId, onClose, userData }) => {
  const lesson = lessons[categoryId];
  const [stepIndex, setStepIndex] = useState(0);
  const g = (t) => getGenderText(t, userData?.gender);

  useEffect(() => {
    markSeen(categoryId);
  }, [categoryId]);

  if (!lesson) return null;
  const step = lesson.steps[stepIndex];
  const StepComponent = STEP_COMPONENTS[step.type];
  const last = stepIndex === lesson.steps.length - 1;

  return (
    <motion.div className="lesson-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}>
      <motion.div
        className="lesson-dialog"
        initial={{ scale: 0.85, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lesson-header">
          <div>
            <div className="lesson-kicker">📘 {g('לומדים לפני שמתרגלים')}</div>
            <h2 className="lesson-title">{lesson.title}</h2>
          </div>
          <button className="lesson-close" onClick={onClose} aria-label="סגירה">✕</button>
        </div>

        <div className="lesson-progress">
          {lesson.steps.map((s, i) => (
            <button
              key={i}
              className={`lesson-dot ${i === stepIndex ? 'current' : i < stepIndex ? 'done' : ''}`}
              onClick={() => setStepIndex(i)}
              aria-label={`שלב ${i + 1}`}
            />
          ))}
        </div>

        <h3 className="lesson-step-title">{g(step.title)}</h3>
        <div className="lesson-body">
          <StepComponent key={`${categoryId}-${stepIndex}`} step={step} g={g} rtl={Boolean(lesson.rtl)} />
        </div>

        <div className="lesson-footer">
          {stepIndex > 0 ? (
            <button className="lesson-nav" onClick={() => setStepIndex(stepIndex - 1)}>→ הקודם</button>
          ) : <span />}
          {last ? (
            <button className="lesson-nav primary" onClick={onClose}>🚀 {g('יאללה לתרגל!')}</button>
          ) : (
            <button className="lesson-nav primary" onClick={() => setStepIndex(stepIndex + 1)}>הבא ←</button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

/**
 * כפתור "📘 איך פותרים?" לכותרת המשחק. בכניסה הראשונה לנושא - השיעור נפתח לבד.
 */
export const LessonLauncher = ({ categoryId, userData }) => {
  const [open, setOpen] = useState(() => Boolean(lessons[categoryId]) && !readSeen().includes(categoryId));
  if (!lessons[categoryId]) return null;
  return (
    <>
      <button className="lesson-launch" onClick={() => setOpen(true)}>📘 איך פותרים?</button>
      <AnimatePresence>
        {open && <LessonViewer categoryId={categoryId} userData={userData} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
};

export default LessonViewer;
