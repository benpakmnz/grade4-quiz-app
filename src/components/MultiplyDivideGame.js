import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGenderText } from '../utils/genderText';
import './MathGame.css';

const MultiplyDivideGame = ({ onBack, score, setScore, streak, setStreak, questionCount, setQuestionCount, userData, onAnswer }) => {
  const [question, setQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 3;

  const operations = [
    { symbol: '×', name: 'כפל', emoji: '✖️' },
    { symbol: '÷', name: 'חילוק', emoji: '➗' }
  ];

  const generateQuestion = () => {
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, answer;

    switch (operation.symbol) {
      case '×':
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
        break;
      case '÷':
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = Math.floor(Math.random() * 12) + 1;
        num1 = num2 * answer;
        break;
      default:
        num1 = 0;
        num2 = 0;
        answer = 0;
    }

    setQuestion({ num1, num2, operation, answer });
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
      // Notify parent component
      if (onAnswer) {
        onAnswer(true);
      }
      
      const points = 10 + (streak * 5);
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
        points
      });
      setQuestionCount(questionCount + 1);
    } else if (newAttempts < MAX_ATTEMPTS) {
      // עוד יש ניסיונות
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
      // נגמרו הניסיונות
      if (onAnswer) {
        onAnswer(false);
      }
      
      setStreak(0);
      setFeedback({ 
        correct: false,
        isRetry: false,
        message: 'נגמרו הניסיונות 😔',
        correctAnswer: question.answer
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
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">נקודות:</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat">
            <span className="stat-label">רצף:</span>
            <span className="stat-value">{streak} 🔥</span>
          </div>
          <div className="stat">
            <span className="stat-label">שאלות:</span>
            <span className="stat-value">{questionCount}</span>
          </div>
        </div>
      </div>

      <motion.div
        className="question-card"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        key={question.num1 + question.num2}
      >
        <div className="operation-badge">{question.operation.emoji}</div>
        <h2 className="question-title">{question.operation.name} עד 12</h2>
        
        <div className="question-display">
          <div className="horizontal-display">
            <span className="question-mark">?</span>
            <span className="equals">=</span>
            <span className="number">{question.num2.toLocaleString('he-IL')}</span>
            <span className="operator">{question.operation.symbol}</span>
            <span className="number">{question.num1.toLocaleString('he-IL')}</span>
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
              >
                בדוק תשובה ✓
              </button>
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
              >
                בדוק תשובה ✓
              </button>
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
              {!feedback.correct && feedback.correctAnswer && (
                <p className="correct-answer">
                  התשובה הנכונה: {feedback.correctAnswer.toLocaleString('he-IL')}
                </p>
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

export default MultiplyDivideGame;
