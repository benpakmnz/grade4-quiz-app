import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  sentenceStarters, modelParagraph, writingChecks, splitSentences
} from '../data/writing';
import { getBank } from '../data/contentStore';
import { shuffle } from '../data/questionGenerator';
import { getGenderText } from '../utils/genderText';
import { useGameScoring } from '../utils/useGameScoring';
import SpeakButton from './SpeakButton';
import { notifyLocalChange } from '../services/cloudSync';
import './Game.css';
import './EnglishGame.css';

const DRAFT_KEY = 'english_writingDraft';
const PASS_CHECKS = 8; // כמה בדיקות צריך לעבור כדי שהקטע ייחשב "מוכן"

let usedIdx = new Set();
const pickSentenceQuestion = () => {
  const correctSentenceQuestions = getBank('writing');
  let available = correctSentenceQuestions.map((_, i) => i).filter(i => !usedIdx.has(i));
  if (available.length === 0) {
    usedIdx = new Set();
    available = correctSentenceQuestions.map((_, i) => i);
  }
  const idx = available[Math.floor(Math.random() * available.length)];
  usedIdx.add(idx);
  const q = correctSentenceQuestions[idx];
  return { ...q, options: shuffle([q.correct, ...q.wrong]) };
};

const WritingGame = (props) => {
  const { title, onBack, streak, userData } = props;
  const { registerResult, praise } = useGameScoring(props);
  const g = (text) => getGenderText(text, userData?.gender);

  const [mode, setMode] = useState('practice'); // 'practice' | 'write'

  // ---- תרגול: איזה משפט נכון ----
  const [question, setQuestion] = useState(pickSentenceQuestion);
  const [questionKey, setQuestionKey] = useState(0);
  const [wrongOptions, setWrongOptions] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const nextQuestion = () => {
    setQuestion(pickSentenceQuestion());
    setQuestionKey(k => k + 1);
    setWrongOptions([]);
    setFeedback(null);
  };

  const handleOption = (option) => {
    if (feedback?.done) return;
    if (option === question.correct) {
      const points = registerResult(true, wrongOptions.length === 0 ? 15 : 10);
      setFeedback({ done: true, correct: true, message: praise(), points });
    } else if (wrongOptions.length === 0) {
      setWrongOptions([option]);
      setFeedback({ done: false, message: g('לא נכון, נסי שוב! 💪') });
    } else {
      setWrongOptions([...wrongOptions, option]);
      registerResult(false);
      setFeedback({ done: true, correct: false, message: g('לא נורא! בפעם הבאה תצליחי 💪') });
    }
  };

  // ---- כתיבה חופשית ----
  const [text, setText] = useState(() => {
    try {
      return localStorage.getItem(DRAFT_KEY) || '';
    } catch {
      return '';
    }
  });
  const [showModel, setShowModel] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(DRAFT_KEY) !== text) {
        localStorage.setItem(DRAFT_KEY, text);
        notifyLocalChange();
      }
    } catch {
      // ignore
    }
  }, [text]);

  const sentences = splitSentences(text);
  const checks = writingChecks.map(c => ({ ...c, ok: c.test(text, sentences) }));
  const passed = checks.filter(c => c.ok).length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const insertStarter = (starter) => {
    const sep = text && !/\s$/.test(text) ? ' ' : '';
    setText(text + sep + starter);
    setSubmitted(null);
    setTimeout(() => {
      const el = textareaRef.current;
      if (el) {
        el.focus();
        el.selectionStart = el.selectionEnd = el.value.length;
      }
    }, 0);
  };

  const submitWriting = () => {
    const ok = passed >= PASS_CHECKS;
    const points = registerResult(ok, ok ? 30 + passed * 2 : 0);
    setSubmitted({ ok, points });
  };

  return (
    <div className="math-game english-game">
      <div className="game-header">
        <button className="back-button" onClick={onBack}>
          ← חזרה
        </button>
        <h2 className="game-title">{title}</h2>
      </div>

      <div className="mode-tabs">
        <button className={`mode-tab ${mode === 'practice' ? 'active' : ''}`} onClick={() => setMode('practice')}>
          ✅ איזה משפט נכון?
        </button>
        <button className={`mode-tab ${mode === 'write' ? 'active' : ''}`} onClick={() => setMode('write')}>
          ✍️ כתיבת קטע על עצמי
        </button>
      </div>

      {mode === 'practice' && (
        <motion.div
          className="question-card"
          key={questionKey}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="question-label">כתיבה נכונה</div>
          <div className="instruction" dir="ltr">Instructions: Choose the sentence that is written correctly.</div>
          <h2 className="question-title">{g('בחרי את המשפט שכתוב נכון:')}</h2>
          <div className="options-grid single-column">
            {question.options.map(option => {
              const isWrong = wrongOptions.includes(option);
              const isAnswer = feedback?.done && option === question.correct;
              return (
                <motion.button
                  key={option}
                  dir="ltr"
                  className={`option-button sentence-option ${isWrong ? 'wrong' : ''} ${isAnswer ? 'right' : ''}`}
                  whileHover={!feedback?.done && !isWrong ? { scale: 1.03 } : {}}
                  disabled={isWrong || feedback?.done}
                  onClick={() => handleOption(option)}
                >
                  {option}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {feedback && !feedback.done && (
              <motion.div key="retry" className="retry-box" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                ⚠️ {feedback.message}
              </motion.div>
            )}
            {feedback?.done && (
              <motion.div
                key="done"
                className={`feedback ${feedback.correct ? 'correct' : 'incorrect'}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <div className="feedback-emoji">{feedback.correct ? '🎉' : '💪'}</div>
                <h3 className="feedback-message">{feedback.message}</h3>
                {feedback.correct && <p className="points-earned">+{feedback.points} נקודות!</p>}
                <p className="correct-answer">
                  <span dir="ltr" className="ltr-inline">{question.correct}</span>
                </p>
                <div className="solution-steps">
                  <h4>💡 הסבר:</h4>
                  <p>{question.why}</p>
                </div>
                <button className="next-button" onClick={nextQuestion}>
                  שאלה הבאה →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {mode === 'write' && (
        <motion.div className="writing-layout" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="question-card writing-card">
            <div className="question-label">Write about yourself</div>
            <div className="instruction" dir="ltr">Instructions: Write a short paragraph about yourself.</div>
            <h2 className="question-title">{g('כתבי קטע קצר באנגלית על עצמך')}</h2>
            <p className="writing-tip">
              {g('לחצי על פתיח כדי להוסיף אותו, והשלימי את המשפט במילים שלך')}
            </p>

            <div className="starters" dir="ltr">
              {sentenceStarters.map(s => (
                <button key={s} className="starter-chip" onClick={() => insertStarter(s)}>
                  {s}
                </button>
              ))}
            </div>

            <textarea
              ref={textareaRef}
              className="writing-area"
              dir="ltr"
              value={text}
              onChange={(e) => { setText(e.target.value); setSubmitted(null); }}
              placeholder="My name is ..."
              rows={9}
              spellCheck={false}
              autoCapitalize="sentences"
            />
            <div className="writing-meta">
              <span>{wordCount} מילים · {sentences.length} משפטים</span>
              {text.trim() && <SpeakButton text={text} title="הקראת מה שכתבתי" small />}
              {text && (
                <button
                  className="clear-button"
                  onClick={() => {
                    if (window.confirm('למחוק את כל הטקסט?')) { setText(''); setSubmitted(null); }
                  }}
                >
                  🗑️ ניקוי
                </button>
              )}
            </div>

            <button className="submit-button wide" disabled={!text.trim() || !!submitted} onClick={submitWriting}>
              ✓ סיימתי - בדיקה
            </button>

            {submitted && (
              <motion.div
                className={`feedback ${submitted.ok ? 'correct' : 'incorrect'}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <div className="feedback-emoji">{submitted.ok ? '🏆' : '✏️'}</div>
                <h3 className="feedback-message">
                  {submitted.ok
                    ? g(`קטע מצוין! עברת ${passed} מתוך ${checks.length} בדיקות`)
                    : g(`עברת ${passed} מתוך ${checks.length} בדיקות. תקני את מה שמסומן באדום ונסי שוב!`)}
                </h3>
                {submitted.ok && <p className="points-earned">+{submitted.points} נקודות!</p>}
                <p className="writing-note">
                  💡 הבדיקה האוטומטית בודקת רק דברים בסיסיים. כדאי להקריא את הקטע להורה ולבקש שיעבור עליו.
                </p>
              </motion.div>
            )}
          </div>

          <div className="writing-side">
            <div className="checklist-card">
              <h3>📋 רשימת בדיקה</h3>
              <div className="checklist-progress">
                <div className="checklist-fill" style={{ width: `${(passed / checks.length) * 100}%` }} />
              </div>
              <ul className="checklist">
                {checks.map(c => (
                  <li key={c.id} className={c.ok ? 'ok' : 'missing'}>
                    <span className="check-icon">{c.ok ? '✅' : '⬜'}</span>
                    {c.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="checklist-card">
              <button className="model-toggle" onClick={() => setShowModel(!showModel)}>
                {showModel ? '🙈 הסתרת הקטע לדוגמה' : '👀 קטע לדוגמה'}
              </button>
              {showModel && (
                <div className="model-paragraph" dir="ltr">
                  <SpeakButton text={modelParagraph} small />
                  {modelParagraph.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {streak >= 3 && (
        <motion.div
          className="streak-badge"
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          🔥 רצף של {streak}!
        </motion.div>
      )}
    </div>
  );
};

export default WritingGame;
