import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateQuestion } from '../data/questionGenerator';
import { getGenderText } from '../utils/genderText';
import { useGameScoring } from '../utils/useGameScoring';
import SpeakButton from './SpeakButton';
import { LessonLauncher } from './LessonViewer';
import './Game.css';
import './EnglishGame.css';

const TestSummary = ({ results, onRestart, onBack, g }) => {
  const correct = results.filter(Boolean).length;
  const pct = Math.round((correct / results.length) * 100);
  return (
    <motion.div className="question-card passage-summary" initial={{ scale: 0 }} animate={{ scale: 1 }}>
      <div className="summary-emoji">{pct === 100 ? '🏆' : pct >= 80 ? '⭐' : pct >= 60 ? '👍' : '💪'}</div>
      <h3>{correct} / {results.length} תשובות נכונות ({pct}%)</h3>
      <p>
        {pct === 100
          ? g('מושלם! את מוכנה למבחן!')
          : pct >= 80
            ? g('כל הכבוד! עוד קצת תרגול ואת שם!')
            : g('כדאי לתרגל עוד את הנושאים שטעית בהם - ונסי שוב!')}
      </p>
      <div className="progress-dots summary-dots">
        {results.map((ok, i) => <span key={i} className={`dot ${ok ? 'ok' : 'bad'}`} />)}
      </div>
      <div className="builder-actions">
        <button className="next-button big" onClick={onRestart}>🎯 מבחן חדש</button>
        <button className="clear-button" onClick={onBack}>← לכל הנושאים</button>
      </div>
    </motion.div>
  );
};

// משחק שאלות אמריקאיות (אוצר מילים ודקדוק) + סידור מילים למשפט
const QuizGame = (props) => {
  const { category, title, onBack, streak, userData, testLength = 0 } = props;
  const { registerResult, praise } = useGameScoring(props);
  const g = (text) => getGenderText(text, userData?.gender);

  const [question, setQuestion] = useState(null);
  const [questionKey, setQuestionKey] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [wrongOptions, setWrongOptions] = useState([]);
  // לסידור משפטים
  const [placed, setPlaced] = useState([]);
  const [showHint, setShowHint] = useState(false);
  // מצב מבחן: מספר קבוע של שאלות ואז סיכום
  const [testResults, setTestResults] = useState([]);
  const [testDone, setTestDone] = useState(false);

  const nextQuestion = useCallback(() => {
    setQuestion(generateQuestion(category));
    setQuestionKey(k => k + 1);
    setFeedback(null);
    setAttempts(0);
    setWrongOptions([]);
    setPlaced([]);
    setShowHint(false);
  }, [category]);

  useEffect(() => {
    nextQuestion();
  }, [nextQuestion]);

  const goNext = () => {
    if (testLength && testResults.length >= testLength) {
      setTestDone(true);
      return;
    }
    nextQuestion();
  };

  const restartTest = () => {
    setTestResults([]);
    setTestDone(false);
    nextQuestion();
  };

  if (!question) return null;

  const maxAttempts = question.kind === 'order' ? 3 : question.options.length <= 2 ? 1 : 2;

  const finish = (isCorrect) => {
    const firstTry = attempts === 0;
    const points = registerResult(isCorrect, firstTry ? 15 : 10);
    if (testLength) setTestResults(r => [...r, isCorrect]);
    setFeedback({
      done: true,
      correct: isCorrect,
      message: isCorrect ? praise() : g('לא נורא! בפעם הבאה תצליחי 💪'),
      points
    });
  };

  const handleOption = (option) => {
    if (feedback?.done) return;
    if (option === question.answer) {
      finish(true);
      return;
    }
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setWrongOptions(prev => [...prev, option]);
    if (newAttempts >= maxAttempts) {
      finish(false);
    } else {
      setFeedback({ done: false, message: g('לא נכון, נסי שוב! 💪') });
    }
  };

  // ---------- סידור משפטים ----------
  const remaining = question.kind === 'order'
    ? question.tokens.filter(t => !placed.some(p => p.id === t.id))
    : [];

  const placeToken = (token) => {
    if (feedback?.done) return;
    setPlaced([...placed, token]);
    if (feedback && !feedback.done) setFeedback(null);
  };

  const removeToken = (token) => {
    if (feedback?.done) return;
    setPlaced(placed.filter(p => p.id !== token.id));
    if (feedback && !feedback.done) setFeedback(null);
  };

  const checkOrder = () => {
    const target = question.answerTokens || question.answer.split(' ');
    const built = placed.map(p => p.text);
    if (built.join(' ') === target.join(' ')) {
      finish(true);
      return;
    }
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    if (newAttempts >= maxAttempts) {
      finish(false);
    } else {
      // כמה מילים בהתחלה נכונות?
      let ok = 0;
      while (ok < placed.length && placed[ok].text === target[ok]) ok++;
      setFeedback({
        done: false,
        message: ok > 0
          ? g(`כמעט! ${ok} המילים הראשונות במקום הנכון. נסי שוב 💪`)
          : g('לא נכון, נסי שוב! 💪')
      });
      setPlaced(placed.slice(0, ok));
    }
  };

  const renderEnglish = () => {
    if (!question.english) return null;
    const text = feedback?.done && question.fullSentence ? question.fullSentence : question.english;
    const parts = text.split('____');
    return (
      <div className={`english-text ${question.big ? 'big' : ''}`} dir="ltr">
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {part}
            {i < parts.length - 1 && <span className="blank">____</span>}
          </React.Fragment>
        ))}
        <SpeakButton text={question.speak && feedback?.done ? question.speak : question.english} small />
      </div>
    );
  };

  return (
    <div className="math-game english-game">
      <div className="game-header">
        <button className="back-button" onClick={onBack}>
          ← חזרה
        </button>
        <LessonLauncher categoryId={category} userData={userData} />
        <h2 className="game-title">{title}</h2>
      </div>

      {testDone ? (
        <TestSummary results={testResults} onRestart={restartTest} onBack={onBack} g={g} />
      ) : (
      <motion.div
        className="question-card"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        key={questionKey}
      >
        {testLength > 0 && (
          <div className="question-progress">
            שאלה {Math.min(testResults.length + (feedback?.done ? 0 : 1), testLength)} מתוך {testLength}
            <div className="progress-dots">
              {Array.from({ length: testLength }, (_, i) => (
                <span
                  key={i}
                  className={`dot ${i < testResults.length ? (testResults[i] ? 'ok' : 'bad') : i === testResults.length ? 'current' : ''}`}
                />
              ))}
            </div>
          </div>
        )}
        <div className="question-label">{question.label}</div>
        {question.instruction && (
          <div className="instruction" dir="ltr">Instructions: {question.instruction}</div>
        )}
        <h2 className="question-title">{g(question.prompt)}</h2>

        {question.emoji && <div className="picture-emoji">{question.emoji}</div>}
        {renderEnglish()}

        {question.kind === 'mc' && (
          <>
            {question.wordBank && <div className="word-bank-title">📦 Word Bank</div>}
            <div className={`options-grid ${question.wordBank ? 'word-bank' : ''}`}>
              {question.options.map((option) => {
                const isWrong = wrongOptions.includes(option);
                const isAnswer = feedback?.done && option === question.answer;
                return (
                  <motion.button
                    key={option}
                    className={`option-button ${isWrong ? 'wrong' : ''} ${isAnswer ? 'right' : ''}`}
                    dir={question.optionsHebrew ? 'rtl' : 'ltr'}
                    whileHover={!feedback?.done && !isWrong ? { scale: 1.05 } : {}}
                    whileTap={!feedback?.done && !isWrong ? { scale: 0.95 } : {}}
                    disabled={isWrong || feedback?.done}
                    onClick={() => handleOption(option)}
                  >
                    {option}
                  </motion.button>
                );
              })}
            </div>
          </>
        )}

        {question.kind === 'order' && (
          <div className="sentence-builder">
            <div className="hint-row">
              {showHint ? (
                <span className="hint-text">💡 {question.hint}</span>
              ) : (
                !feedback?.done && (
                  <button className="hint-button" onClick={() => setShowHint(true)}>
                    💡 רמז (תרגום לעברית)
                  </button>
                )
              )}
            </div>
            <div className="built-sentence" dir="ltr">
              {placed.length === 0 && <span className="placeholder">👆 {g('לחצי על המילים לפי הסדר')}</span>}
              {placed.map(token => (
                <motion.button
                  layout
                  key={token.id}
                  className="word-tile placed"
                  onClick={() => removeToken(token)}
                >
                  {token.text}
                </motion.button>
              ))}
            </div>
            <div className="word-tiles" dir="ltr">
              {remaining.map(token => (
                <motion.button
                  layout
                  key={token.id}
                  className="word-tile"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => placeToken(token)}
                >
                  {token.text}
                </motion.button>
              ))}
            </div>
            {!feedback?.done && (
              <div className="builder-actions">
                <button
                  className="submit-button"
                  disabled={remaining.length > 0}
                  onClick={checkOrder}
                >
                  ✓ בדיקה
                </button>
                {placed.length > 0 && (
                  <button className="clear-button" onClick={() => setPlaced([])}>
                    ↺ התחלה מחדש
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <AnimatePresence mode="wait">
          {feedback && !feedback.done && (
            <motion.div
              key="retry"
              className="retry-box"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
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
              {!feedback.correct && (
                <p className="correct-answer">
                  התשובה הנכונה: <span dir="ltr" className="ltr-inline">{question.answer}</span>
                </p>
              )}
              {question.kind === 'order' && (
                <p className="correct-answer">
                  <span dir="ltr" className="ltr-inline">{question.answer}</span>
                  <SpeakButton text={question.answer} small />
                  <br />
                  <span>{question.hint}</span>
                </p>
              )}
              {question.explanation && (
                <div className="solution-steps">
                  <h4>💡 הסבר:</h4>
                  {question.explanation.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              )}
              <button className="next-button" onClick={goNext}>
                {testLength && testResults.length >= testLength ? 'לתוצאות המבחן →' : 'שאלה הבאה →'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
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

export default QuizGame;
