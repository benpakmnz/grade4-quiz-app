import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateMathQuestion, isInputCorrect } from '../data/mathQuestions';
import { formatNumber } from '../utils/hebrewNumbers';
import { getGenderText } from '../utils/genderText';
import { useGameScoring } from '../utils/useGameScoring';
import { LessonLauncher } from './LessonViewer';
import { TestSummary } from './QuizGame';
import { logMistake } from '../utils/mistakes';
import MathText from './MathText';
import MathVisual from './MathVisual';
import './Game.css';
import './EnglishGame.css';
import './MathGame.css';

const PRAISES = ['כל הכבוד! 🌟', 'מעולה! את אלופה! 🚀', 'נכון מאוד! ⭐', 'יפה מאוד! 🏆', 'מצוין! חישבת נכון 🎉'];
const pickPraise = (gender) => getGenderText(PRAISES[Math.floor(Math.random() * PRAISES.length)], gender);

// משחק החשבון: שאלות אמריקאיות או הקלדת תשובה, עם ציורים והסבר מלא אחרי כל שאלה
const MathGame = (props) => {
  const { category, title, onBack, streak, userData, testLength = 0 } = props;
  const { registerResult } = useGameScoring(props);
  const praise = () => pickPraise(userData?.gender);
  const g = (text) => getGenderText(text, userData?.gender);

  const [question, setQuestion] = useState(null);
  const [questionKey, setQuestionKey] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [wrongOptions, setWrongOptions] = useState([]);
  const [firstWrong, setFirstWrong] = useState(null);
  const [input, setInput] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [testDone, setTestDone] = useState(false);
  const inputRef = useRef(null);

  const nextQuestion = useCallback(() => {
    setQuestion(generateMathQuestion(category));
    setQuestionKey(k => k + 1);
    setFeedback(null);
    setAttempts(0);
    setWrongOptions([]);
    setFirstWrong(null);
    setInput('');
  }, [category]);

  useEffect(() => {
    nextQuestion();
  }, [nextQuestion]);

  // מקלדת מספרים מוכנה מיד (בלי לגלול את המסך בטלפון)
  useEffect(() => {
    if (question?.kind === 'input' && !feedback?.done) inputRef.current?.focus({ preventScroll: true });
  }, [question, feedback]);

  if (!question) return null;

  const isMc = question.kind === 'mc';
  // שתי אפשרויות או שלוש (כמו > < =) - ניסיון אחד; אחרת - שניים
  const maxAttempts = isMc && question.options.length <= 3 ? 1 : 2;
  const shownAnswer = /^\d+$/.test(question.answer) ? formatNumber(question.answer) : question.answer;
  const answerText = `${shownAnswer}${question.unit ? ` ${question.unit}` : ''}`;

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

  const finish = (isCorrect, wrongAnswer = null) => {
    if (wrongAnswer !== null) {
      logMistake({
        category: question.topic,
        question: [question.prompt, question.expr].filter(Boolean).join('  '),
        given: wrongAnswer,
        correct: answerText,
        finalCorrect: isCorrect
      });
    }
    const points = registerResult(isCorrect, attempts === 0 ? 15 : 10);
    if (testLength) setTestResults(r => [...r, isCorrect]);
    setFeedback({
      done: true,
      correct: isCorrect,
      message: isCorrect ? praise() : g('לא נורא! בפעם הבאה תצליחי 💪'),
      points
    });
  };

  const wrongTry = (given, retryMessage) => {
    const first = firstWrong ?? given;
    setFirstWrong(first);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    if (newAttempts >= maxAttempts) finish(false, first);
    else setFeedback({ done: false, message: retryMessage });
  };

  const handleOption = (option) => {
    if (feedback?.done) return;
    if (option === question.answer) {
      finish(true, firstWrong);
      return;
    }
    setWrongOptions(prev => [...prev, option]);
    wrongTry(option, g('לא נכון, נסי שוב! 💪'));
  };

  const checkInput = (e) => {
    e?.preventDefault();
    if (feedback?.done || !input.trim()) return;
    if (isInputCorrect(input, question.answer)) {
      finish(true, firstWrong);
      return;
    }
    wrongTry(input.trim(), g('לא נכון, בדקי את החישוב ונסי שוב! 💪'));
    setInput('');
  };

  return (
    <div className="math-game english-game math-subject">
      <div className="game-header">
        <button className="back-button" onClick={onBack}>
          ← חזרה
        </button>
        {!testLength && <LessonLauncher categoryId={category} userData={userData} />}
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
          <h2 className={`question-title math-prompt ${question.long ? 'long' : ''}`}>
            <MathText text={g(question.prompt)} />
          </h2>

          {question.expr && (
            <div className="math-expr">
              <MathText text={question.expr} />
            </div>
          )}
          <MathVisual spec={question.visual} />

          {isMc && (
            <div className={`options-grid math-options ${question.optionVisuals ? 'visual' : ''} ${question.options.some(o => o.length > 16) ? 'long' : ''}`}>
              {question.options.map((option) => {
                const isWrong = wrongOptions.includes(option);
                const isAnswer = feedback?.done && option === question.answer;
                return (
                  <motion.button
                    key={option}
                    className={`option-button ${isWrong ? 'wrong' : ''} ${isAnswer ? 'right' : ''}`}
                    whileHover={!feedback?.done && !isWrong ? { scale: 1.04 } : {}}
                    whileTap={!feedback?.done && !isWrong ? { scale: 0.95 } : {}}
                    disabled={isWrong || feedback?.done}
                    onClick={() => handleOption(option)}
                    aria-label={question.optionVisuals ? `ציור ${question.options.indexOf(option) + 1}` : undefined}
                  >
                    {question.optionVisuals
                      ? <MathVisual spec={question.optionVisuals[option]} small />
                      : <MathText text={option} />}
                  </motion.button>
                );
              })}
            </div>
          )}

          {!isMc && !feedback?.done && (
            <form className="math-input-row" onSubmit={checkInput}>
              <input
                ref={inputRef}
                className="answer-input math-input"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                dir="ltr"
                value={input}
                onChange={(e) => setInput(e.target.value.replace(/[^\d,\s]/g, ''))}
                placeholder="?"
                aria-label="התשובה"
              />
              {question.unit && <span className="math-unit">{question.unit}</span>}
              <button type="submit" className="submit-button" disabled={!input.trim()}>✓ בדיקה</button>
            </form>
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
                    התשובה הנכונה: <b><MathText text={answerText} /></b>
                  </p>
                )}
                {question.explanation && (
                  <div className="solution-steps math-steps">
                    <h4>💡 איך פותרים:</h4>
                    {question.explanation.split('\n').map((line, i) => (
                      <p key={i}><MathText text={line} /></p>
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

export default MathGame;
