import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './MathGame.css';

const DecimalStructureGame = ({ onBack, score, setScore, streak, setStreak, questionCount, setQuestionCount, userData }) => {
  const [question, setQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);

  const questionTypes = [
    { type: 'digitValue', name: 'ערך ספרה', emoji: '🔟' },
    { type: 'digitChange', name: 'שינוי ספרה', emoji: '🔄' }
  ];

  const generateQuestion = () => {
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    let number, digit, position, answer, questionText;

    if (questionType.type === 'digitValue') {
      // שאלה: מה ערך הספרה X במספר Y?
      number = Math.floor(Math.random() * 9000) + 1000; // מספר בין 1000-9999
      const numberStr = number.toString();
      position = Math.floor(Math.random() * numberStr.length);
      digit = numberStr[position];
      
      // חישוב ערך הספרה
      const placeValue = Math.pow(10, numberStr.length - position - 1);
      answer = parseInt(digit) * placeValue;
      
      questionText = `מה ערך הספרה ${digit} במספר ${number.toLocaleString('he-IL')}?`;
      
    } else {
      // שאלה: במספר X החליפו את הספרה Y בספרה Z, בכמה קטן/גדול המספר?
      number = Math.floor(Math.random() * 9000) + 1000;
      const numberStr = number.toString();
      position = Math.floor(Math.random() * numberStr.length);
      const oldDigit = parseInt(numberStr[position]);
      let newDigit;
      
      // בחר ספרה חדשה שונה
      do {
        newDigit = Math.floor(Math.random() * 10);
      } while (newDigit === oldDigit);
      
      const placeValue = Math.pow(10, numberStr.length - position - 1);
      const difference = (newDigit - oldDigit) * placeValue;
      answer = Math.abs(difference);
      
      const changeType = difference > 0 ? 'גדול' : 'קטן';
      questionText = `במספר ${number.toLocaleString('he-IL')} החליפו את הספרה ${oldDigit} בספרה ${newDigit}. בכמה ${changeType} המספר החדש שהתקבל?`;
    }

    setQuestion({ 
      type: questionType.type,
      text: questionText,
      answer,
      emoji: questionType.emoji,
      name: questionType.name
    });
    setUserAnswer('');
    setFeedback(null);
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  const checkAnswer = () => {
    const isCorrect = parseInt(userAnswer) === question.answer;
    
    if (isCorrect) {
      const points = 15 + (streak * 5); // נקודות גבוהות יותר לשאלות מבנה עשרוני
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
        key={question.text}
      >
        <div className="operation-badge">{question.emoji}</div>
        <h2 className="question-title">{question.name}</h2>
        
        <div className="question-display">
          <div className="question-text" style={{ 
            fontSize: '1.5rem', 
            lineHeight: '2',
            padding: '30px',
            background: '#f8f9fa',
            borderRadius: '20px',
            marginBottom: '30px'
          }}>
            {question.text}
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

export default DecimalStructureGame;
