import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './MathGame.css';

const AddSubtractGame = ({ onBack, score, setScore, streak, setStreak, questionCount, setQuestionCount, userData }) => {
  const [question, setQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showVertical, setShowVertical] = useState(false);

  const operations = [
    { symbol: '+', name: 'חיבור', emoji: '➕' },
    { symbol: '-', name: 'חיסור', emoji: '➖' }
  ];

  const generateQuestion = () => {
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, answer;

    switch (operation.symbol) {
      case '+':
        // חיבור בתחום הרבבה (עד 10,000)
        num1 = Math.floor(Math.random() * 9000) + 1000;
        num2 = Math.floor(Math.random() * (10000 - num1));
        answer = num1 + num2;
        break;
      case '-':
        // חיסור בתחום הרבבה
        num1 = Math.floor(Math.random() * 9000) + 1000;
        num2 = Math.floor(Math.random() * num1);
        answer = num1 - num2;
        break;
      default:
        num1 = 0;
        num2 = 0;
        answer = 0;
    }

    setQuestion({ num1, num2, operation, answer });
    setUserAnswer('');
    setFeedback(null);
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  const checkAnswer = () => {
    const isCorrect = parseInt(userAnswer) === question.answer;
    
    if (isCorrect) {
      const points = 10 + (streak * 5);
      setScore(score + points);
      setStreak(streak + 1);
      setFeedback({ 
        correct: true, 
        message: ['מעולה! 🎉', 'נכון מאוד! ⭐', 'כל הכבוד! 🌟', 'מדהים! 🚀'][Math.floor(Math.random() * 4)],
        points
      });
    } else {
      setStreak(0);
      setFeedback({ 
        correct: false, 
        message: 'לא נורא, ננסה שוב! 💪',
        correctAnswer: question.answer
      });
    }

    setQuestionCount(questionCount + 1);
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
        <h2 className="question-title">{question.operation.name} בתחום הרבבה</h2>
        
        <div className="question-display">
          <div className="horizontal-display">
            <span className="question-mark">?</span>
            <span className="equals">=</span>
            <span className="number">{question.num2.toLocaleString('he-IL')}</span>
            <span className="operator">{question.operation.symbol}</span>
            <span className="number">{question.num1.toLocaleString('he-IL')}</span>
          </div>
          
          <button 
            className="toggle-vertical-btn"
            onClick={() => setShowVertical(!showVertical)}
          >
            {showVertical ? '📊 הצג רגיל' : '📝 פתור במאונך'}
          </button>

          {showVertical && (
            <div className="vertical-display">
              <div className="vertical-problem">
                <div className="vertical-row">
                  <span className="vertical-number">{question.num1.toLocaleString('he-IL')}</span>
                </div>
                <div className="vertical-row">
                  <span className="vertical-operator">{question.operation.symbol}</span>
                  <span className="vertical-number">{question.num2.toLocaleString('he-IL')}</span>
                </div>
                <div className="vertical-line"></div>
                <div className="vertical-row answer-row">
                  <span className="vertical-answer">?</span>
                </div>
              </div>
            </div>
          )}
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
              {!feedback.correct && (
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
            {feedback?.correct ? 'כל הכבוד!' : 'את יכולה!'}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AddSubtractGame;
