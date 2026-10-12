import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPassage, shuffle } from '../data/questionGenerator';
import { getGenderText } from '../utils/genderText';
import { useGameScoring } from '../utils/useGameScoring';
import { stopSpeaking, isSpeechSupported, splitIntoSentences } from '../utils/speech';
import ReadAloudPlayer from './ReadAloudPlayer';
import SpeakButton from './SpeakButton';
import { LessonLauncher } from './LessonViewer';
import './Game.css';
import './EnglishGame.css';

// הבנת הנקרא / הבנת הנשמע: קטע + סדרת שאלות (אמריקאיות, Yes/No, סידור אירועים)
const PassageGame = (props) => {
  const { category, title, onBack, streak, userData } = props;
  const isListening = category === 'listening';
  const { registerResult, praise } = useGameScoring(props);
  const g = (text) => getGenderText(text, userData?.gender);

  const [passage, setPassage] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [wrongOptions, setWrongOptions] = useState([]);
  const [orderPool, setOrderPool] = useState([]);
  const [orderPicked, setOrderPicked] = useState([]);
  const [showText, setShowText] = useState(!isListening);
  const [currentSentence, setCurrentSentence] = useState(null);

  const question = passage && qIndex < passage.questions.length ? passage.questions[qIndex] : null;
  const finished = passage && qIndex >= passage.questions.length;

  const prepareQuestion = (q) => {
    setFeedback(null);
    setAttempts(0);
    setWrongOptions([]);
    setOrderPicked([]);
    if (q && q.type === 'order') {
      let pool = shuffle(q.events);
      for (let i = 0; i < 5 && pool.join() === q.events.join(); i++) pool = shuffle(q.events);
      setOrderPool(pool);
    }
  };

  const loadPassage = useCallback(() => {
    stopSpeaking();
    const p = getPassage(category);
    setPassage(p);
    setQIndex(0);
    setResults([]);
    setShowText(category !== 'listening');
    setCurrentSentence(null);
    prepareQuestion(p.questions[0]);
  }, [category]);

  useEffect(() => {
    loadPassage();
    return () => stopSpeaking();
  }, [loadPassage]);

  if (!passage) return null;

  // הטקסט מחולק למשפטים כדי להדגיש את המשפט שמוקרא עכשיו
  let sentenceCounter = 0;
  const paragraphs = passage.text.split('\n').map(para =>
    splitIntoSentences(para).map(sentence => ({ sentence, index: sentenceCounter++ }))
  );

  const maxAttempts = question
    ? question.type === 'yesno' ? 1 : 2
    : 1;

  const finish = (isCorrect) => {
    const points = registerResult(isCorrect, attempts === 0 ? 15 : 10);
    setResults(r => [...r, isCorrect]);
    setFeedback({
      done: true,
      correct: isCorrect,
      message: isCorrect ? praise() : g('לא נורא! בפעם הבאה תצליחי 💪'),
      points
    });
  };

  const wrong = (extraMessage) => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    if (newAttempts >= maxAttempts) {
      finish(false);
    } else {
      setFeedback({ done: false, message: extraMessage || g('לא נכון, נסי שוב! 💪') });
    }
  };

  const answer = question?.type === 'yesno' ? question.answer : question?.answer;

  const handleOption = (option) => {
    if (feedback?.done) return;
    if (option === answer) {
      finish(true);
    } else {
      setWrongOptions(w => [...w, option]);
      wrong();
    }
  };

  const pickEvent = (ev) => {
    if (feedback?.done) return;
    setOrderPicked(p => [...p, ev]);
    setOrderPool(p => p.filter(e => e !== ev));
    if (feedback && !feedback.done) setFeedback(null);
  };

  const unpickEvent = (ev) => {
    if (feedback?.done) return;
    setOrderPicked(p => p.filter(e => e !== ev));
    setOrderPool(p => [...p, ev]);
  };

  const checkOrder = () => {
    if (orderPicked.join('|') === question.events.join('|')) {
      finish(true);
      return;
    }
    let ok = 0;
    while (ok < orderPicked.length && orderPicked[ok] === question.events[ok]) ok++;
    const msg = ok > 0
      ? g(`כמעט! ${ok} האירועים הראשונים במקום הנכון. נסי שוב 💪`)
      : g('לא נכון, נסי שוב! 💪');
    // משאירים רק את ההתחלה הנכונה
    const kept = orderPicked.slice(0, ok);
    setOrderPool(p => [...p, ...orderPicked.slice(ok)]);
    setOrderPicked(kept);
    wrong(msg);
  };

  const next = () => {
    const ni = qIndex + 1;
    setQIndex(ni);
    if (ni < passage.questions.length) {
      prepareQuestion(passage.questions[ni]);
    } else {
      setFeedback(null);
      if (isListening) setShowText(true);
    }
  };

  const correctCount = results.filter(Boolean).length;

  const options = question
    ? question.type === 'yesno' ? ['Yes', 'No'] : question.options
    : [];

  return (
    <div className="math-game english-game">
      <div className="game-header">
        <button className="back-button" onClick={() => { stopSpeaking(); onBack(); }}>
          ← חזרה
        </button>
        <LessonLauncher categoryId={category} userData={userData} />
        <h2 className="game-title">{title}</h2>
      </div>

      <div className="passage-layout">
        {/* הקטע */}
        <motion.div
          className="passage-card"
          key={passage.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="passage-title" dir="ltr">
            {isListening ? '🎧 ' : '📖 '}{passage.title}
          </div>
          <div className="instruction" dir="ltr">
            Instructions: {isListening
              ? 'Listen to the text and answer the questions.'
              : 'Read the story and answer the questions below.'}
          </div>

          {isListening && (
            <div className="listening-controls">
              {!isSpeechSupported() && (
                <p className="warning-text">הדפדפן לא תומך בהקראה - הטקסט מוצג במקום</p>
              )}
              <ReadAloudPlayer text={passage.text} onSentence={setCurrentSentence} />
              <p className="listening-tip">
                {g('הקשיבי לקטע (אפשר לשמוע כמה פעמים) ועני על השאלות')}
              </p>
              {!showText && !finished && (
                <button className="show-text-button" onClick={() => setShowText(true)}>
                  👀 הצגת הטקסט (רק אם ממש צריך)
                </button>
              )}
            </div>
          )}

          {!isListening && (
            <ReadAloudPlayer text={passage.text} onSentence={setCurrentSentence} compact playLabel="הקראת הקטע" />
          )}

          {(showText || !isSpeechSupported()) && (
            <div className="passage-text" dir="ltr">
              {paragraphs.map((para, i) => (
                <p key={i}>
                  {para.map(({ sentence, index }) => (
                    <span key={index} className={index === currentSentence ? 'reading-now' : undefined}>
                      {sentence}{' '}
                    </span>
                  ))}
                </p>
              ))}
            </div>
          )}
        </motion.div>

        {/* השאלות */}
        <motion.div
          className="question-card passage-question-card"
          key={`${passage.id}-${qIndex}`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          {!finished && question && (
            <>
              <div className="question-progress">
                שאלה {qIndex + 1} מתוך {passage.questions.length}
                <div className="progress-dots">
                  {passage.questions.map((_, i) => (
                    <span
                      key={i}
                      className={`dot ${i < results.length ? (results[i] ? 'ok' : 'bad') : i === qIndex ? 'current' : ''}`}
                    />
                  ))}
                </div>
              </div>
              <div className="question-label">
                {question.type === 'yesno' ? 'שאלת Yes / No' : question.type === 'order' ? 'סידור אירועים לפי הסדר' : 'מענה על שאלה מתוך הקטע'}
              </div>
              <div className="english-text" dir="ltr">
                {question.q}
                <SpeakButton text={question.q} small />
              </div>

              {question.type !== 'order' && (
                <div className={`options-grid ${question.type === 'yesno' ? 'yes-no' : ''}`}>
                  {options.map(option => {
                    const isWrong = wrongOptions.includes(option);
                    const isAnswer = feedback?.done && option === answer;
                    return (
                      <motion.button
                        key={option}
                        dir="ltr"
                        className={`option-button ${isWrong ? 'wrong' : ''} ${isAnswer ? 'right' : ''} ${question.type === 'yesno' ? option.toLowerCase() : ''}`}
                        whileHover={!feedback?.done && !isWrong ? { scale: 1.05 } : {}}
                        whileTap={!feedback?.done && !isWrong ? { scale: 0.95 } : {}}
                        disabled={isWrong || feedback?.done}
                        onClick={() => handleOption(option)}
                      >
                        {question.type === 'yesno' ? (option === 'Yes' ? '👍 Yes' : '👎 No') : option}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {question.type === 'order' && (
                <div className="order-events">
                  <div className="picked-events" dir="ltr">
                    {orderPicked.length === 0 && (
                      <span className="placeholder">👇 {g('לחצי על מה שקרה קודם')}</span>
                    )}
                    {orderPicked.map((ev, i) => (
                      <motion.button layout key={ev} className="event-item picked" onClick={() => unpickEvent(ev)}>
                        <span className="event-num">{i + 1}</span> {ev}
                      </motion.button>
                    ))}
                  </div>
                  <div className="pool-events" dir="ltr">
                    {orderPool.map(ev => (
                      <motion.button layout key={ev} className="event-item" onClick={() => pickEvent(ev)}>
                        {ev}
                      </motion.button>
                    ))}
                  </div>
                  {!feedback?.done && (
                    <button className="submit-button" disabled={orderPool.length > 0} onClick={checkOrder}>
                      ✓ בדיקה
                    </button>
                  )}
                </div>
              )}

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
                    {!feedback.correct && question.type !== 'order' && (
                      <p className="correct-answer">
                        התשובה הנכונה: <span dir="ltr" className="ltr-inline">{answer}</span>
                      </p>
                    )}
                    {!feedback.correct && question.type === 'order' && (
                      <div className="correct-order" dir="ltr">
                        {question.events.map((ev, i) => <div key={ev}>{i + 1}. {ev}</div>)}
                      </div>
                    )}
                    <button className="next-button" onClick={next}>
                      {qIndex + 1 < passage.questions.length ? 'שאלה הבאה →' : 'לסיכום →'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {finished && (
            <motion.div className="passage-summary" initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <div className="summary-emoji">
                {correctCount === results.length ? '🏆' : correctCount >= results.length * 0.7 ? '⭐' : '💪'}
              </div>
              <h3>
                {correctCount} / {results.length} תשובות נכונות
              </h3>
              <p>
                {correctCount === results.length
                  ? g('מושלם! הבנת את הקטע מצוין!')
                  : g('כל הכבוד! תרגול נוסף ואת מוכנה!')}
              </p>
              <button className="next-button big" onClick={loadPassage}>
                {isListening ? '🎧 קטע האזנה הבא →' : '📖 קטע קריאה הבא →'}
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>

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

export default PassageGame;
