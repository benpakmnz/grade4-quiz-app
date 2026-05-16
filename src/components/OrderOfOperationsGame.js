import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGenderText } from '../utils/genderText';
import './MathGame.css';

const OrderOfOperationsGame = ({ onBack, score, setScore, streak, setStreak, questionCount, setQuestionCount, userData, onAnswer }) => {
  const [question, setQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 3;

  const generateQuestion = () => {
    const questionTypes = [
      'multiplyFirst',      // כפל לפני חיבור/חיסור
      'divideFirst',        // חילוק לפני חיבור/חיסור
      'parentheses',        // סוגריים
      'mixed',              // מעורב
      'leftToRight'         // שתי פעולות באותה עדיפות
    ];

    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    let expression, answer, explanation;

    switch (type) {
      case 'multiplyFirst':
        // דוגמה: 5 + 3 × 2 = 5 + 6 = 11
        const a1 = Math.floor(Math.random() * 10) + 1;
        const b1 = Math.floor(Math.random() * 9) + 2;
        const c1 = Math.floor(Math.random() * 9) + 2;
        const operation1 = Math.random() < 0.5 ? '+' : '-';
        
        if (operation1 === '+') {
          expression = `${a1} + ${b1} × ${c1}`;
          answer = a1 + (b1 * c1);
          explanation = `קודם כפל: ${b1} × ${c1} = ${b1 * c1}, אחר כך חיבור: ${a1} + ${b1 * c1} = ${answer}`;
        } else {
          const a1_adjusted = Math.floor(Math.random() * 20) + (b1 * c1); // וודא שהתוצאה חיובית
          expression = `${a1_adjusted} - ${b1} × ${c1}`;
          answer = a1_adjusted - (b1 * c1);
          explanation = `קודם כפל: ${b1} × ${c1} = ${b1 * c1}, אחר כך חיסור: ${a1_adjusted} - ${b1 * c1} = ${answer}`;
        }
        break;

      case 'divideFirst':
        // דוגמה: 20 ÷ 4 + 3 = 5 + 3 = 8
        const divisor = Math.floor(Math.random() * 4) + 2; // 2-5
        const quotient = Math.floor(Math.random() * 8) + 2; // 2-9
        const dividend = divisor * quotient;
        const addend = Math.floor(Math.random() * 10) + 1;
        const operation2 = Math.random() < 0.5 ? '+' : '-';
        
        if (operation2 === '+') {
          expression = `${dividend} ÷ ${divisor} + ${addend}`;
          answer = quotient + addend;
          explanation = `קודם חילוק: ${dividend} ÷ ${divisor} = ${quotient}, אחר כך חיבור: ${quotient} + ${addend} = ${answer}`;
        } else {
          expression = `${dividend} ÷ ${divisor} - ${addend}`;
          answer = quotient - addend;
          explanation = `קודם חילוק: ${dividend} ÷ ${divisor} = ${quotient}, אחר כך חיסור: ${quotient} - ${addend} = ${answer}`;
        }
        break;

      case 'parentheses':
        // דוגמה: (8 - 2) × 3 = 6 × 3 = 18
        const num1 = Math.floor(Math.random() * 15) + 5;
        const num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
        const num3 = Math.floor(Math.random() * 8) + 2;
        const innerOp = Math.random() < 0.5 ? '+' : '-';
        const outerOp = Math.random() < 0.5 ? '×' : '÷';
        
        if (innerOp === '+' && outerOp === '×') {
          expression = `(${num1} + ${num2}) × ${num3}`;
          const innerResult = num1 + num2;
          answer = innerResult * num3;
          explanation = `קודם סוגריים: ${num1} + ${num2} = ${innerResult}, אחר כך כפל: ${innerResult} × ${num3} = ${answer}`;
        } else if (innerOp === '-' && outerOp === '×') {
          expression = `(${num1} - ${num2}) × ${num3}`;
          const innerResult = num1 - num2;
          answer = innerResult * num3;
          explanation = `קודם סוגריים: ${num1} - ${num2} = ${innerResult}, אחר כך כפל: ${innerResult} × ${num3} = ${answer}`;
        } else if (innerOp === '+' && outerOp === '÷') {
          const sum = num1 + num2;
          const divisor2 = [2, 3, 4, 5].find(d => sum % d === 0) || 1;
          expression = `(${num1} + ${num2}) ÷ ${divisor2}`;
          answer = sum / divisor2;
          explanation = `קודם סוגריים: ${num1} + ${num2} = ${sum}, אחר כך חילוק: ${sum} ÷ ${divisor2} = ${answer}`;
        } else {
          const diff = num1 - num2;
          const divisor3 = [2, 3, 4, 5].find(d => diff % d === 0) || 1;
          expression = `(${num1} - ${num2}) ÷ ${divisor3}`;
          answer = diff / divisor3;
          explanation = `קודם סוגריים: ${num1} - ${num2} = ${diff}, אחר כך חילוק: ${diff} ÷ ${divisor3} = ${answer}`;
        }
        break;

      case 'mixed':
        // דוגמה: 10 + 6 ÷ 2 - 1 = 10 + 3 - 1 = 12
        const n1 = Math.floor(Math.random() * 15) + 5;
        const div = Math.floor(Math.random() * 3) + 2;
        const n2 = div * (Math.floor(Math.random() * 5) + 2);
        const n3 = Math.floor(Math.random() * 5) + 1;
        
        expression = `${n1} + ${n2} ÷ ${div} - ${n3}`;
        const divResult = n2 / div;
        answer = n1 + divResult - n3;
        explanation = `קודם חילוק: ${n2} ÷ ${div} = ${divResult}, אחר כך משמאל לימין: ${n1} + ${divResult} - ${n3} = ${answer}`;
        break;

      case 'leftToRight':
        // דוגמה: 20 - 5 + 3 = 15 + 3 = 18
        const start = Math.floor(Math.random() * 20) + 10;
        const sub = Math.floor(Math.random() * (start - 5)) + 1;
        const add = Math.floor(Math.random() * 10) + 1;
        
        expression = `${start} - ${sub} + ${add}`;
        answer = start - sub + add;
        explanation = `משמאל לימין: ${start} - ${sub} = ${start - sub}, אחר כך: ${start - sub} + ${add} = ${answer}`;
        break;

      default:
        expression = '2 + 2';
        answer = 4;
        explanation = '2 + 2 = 4';
    }

    setQuestion({
      expression,
      answer,
      explanation,
      type
    });
    setUserAnswer('');
    setFeedback(null);
    setAttempts(0);
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  const checkAnswer = () => {
    const isCorrect = parseInt(userAnswer) === question.answer;
    const newAttempts = attempts + 1;
    
    if (isCorrect) {
      if (onAnswer) {
        onAnswer(true);
      }
      
      const points = 20 + (streak * 5);
      setScore(score + points);
      setStreak(streak + 1);
      setFeedback({ 
        correct: true, 
        message: [
          getGenderText('מעולה! 🎉', userData?.gender),
          'נכון מאוד! ⭐',
          'כל הכבוד! 🌟',
          getGenderText('מדהים! 🚀', userData?.gender)
        ][Math.floor(Math.random() * 4)],
        points,
        explanation: question.explanation
      });
      setQuestionCount(questionCount + 1);
    } else if (newAttempts < MAX_ATTEMPTS) {
      setAttempts(newAttempts);
      const attemptsLeft = MAX_ATTEMPTS - newAttempts;
      setFeedback({
        correct: false,
        isRetry: true,
        attemptsLeft: attemptsLeft,
        message: getGenderText(`לא נכון, נסי שוב! יש לך עוד ${attemptsLeft} ${attemptsLeft === 1 ? 'ניסיון' : 'ניסיונות'} 💪`, userData?.gender)
      });
      setUserAnswer('');
    } else {
      if (onAnswer) {
        onAnswer(false);
      }
      
      setStreak(0);
      setFeedback({ 
        correct: false,
        isRetry: false,
        message: 'נגמרו הניסיונות 😔',
        correctAnswer: question.answer,
        explanation: question.explanation
      });
      setQuestionCount(questionCount + 1);
    }
  };

  const nextQuestion = () => {
    generateQuestion();
  };

  if (!question) return null;

  return (
    <div className="math-game">
      <div className="game-header">
        <button className="back-button" onClick={onBack}>
          ← חזרה
        </button>
        <h2 className="game-title">סדר פעולות חשבון</h2>
      </div>

      <motion.div
        className="question-card"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        key={question.expression}
      >
        <div className="operation-badge">🧮</div>
        <h2 className="question-title">סדר פעולות חשבון</h2>
        
        <div className="question-display">
          <div className="horizontal-display order-of-operations-expression">
            {question.expression} = ?
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!feedback ? (
            <motion.div
              className="answer-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <input
                type="number"
                className="answer-input"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && userAnswer && checkAnswer()}
                placeholder="התשובה שלך..."
                autoFocus
              />
              <button
                className="submit-button"
                onClick={checkAnswer}
                disabled={!userAnswer}
              ><span className="button-text">בדוק תשובה ✓</span><span className="button-icon">✓</span></button>
            </motion.div>
          ) : feedback.isRetry ? (
            <motion.div
              className="answer-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                background: '#fff3cd',
                padding: '20px',
                borderRadius: '15px',
                marginBottom: '20px'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚠️</div>
              <h3 style={{ color: '#856404', marginBottom: '15px' }}>{feedback.message}</h3>
              <input
                type="number"
                className="answer-input"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && userAnswer && checkAnswer()}
                placeholder={getGenderText("נסי שוב...", userData?.gender)}
                autoFocus
              />
              <button
                className="submit-button"
                onClick={checkAnswer}
                disabled={!userAnswer}
              ><span className="button-text">בדוק תשובה ✓</span><span className="button-icon">✓</span></button>
            </motion.div>
          ) : (
            <motion.div
              className={`feedback ${feedback.correct ? 'correct' : 'incorrect'}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <div className="feedback-emoji">
                {feedback.correct ? '🎉' : '💪'}
              </div>
              <h3 className="feedback-message">{feedback.message}</h3>
              {feedback.correct && (
                <p className="points-earned">+{feedback.points} נקודות!</p>
              )}
              {!feedback.correct && feedback.correctAnswer !== undefined && (
                <p className="correct-answer">
                  התשובה הנכונה: {feedback.correctAnswer}
                </p>
              )}
              {feedback.explanation && (
                <div className="solution-steps">
                  <h4>💡 פתרון:</h4>
                  <p>{feedback.explanation}</p>
                </div>
              )}
              <button className="next-button" onClick={nextQuestion}>
                שאלה הבאה →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

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

      {userData && (
        <motion.div
          className="floating-character"
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <div className="character-bubble">
            {userData.character.emoji}
          </div>
          <div className="character-message">
            {feedback?.correct ? 'כל הכבוד!' : getGenderText('את יכולה!', userData?.gender)}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default OrderOfOperationsGame;
