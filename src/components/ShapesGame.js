import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateShapesQuestion } from '../services/geminiService';
import { getGenderText } from '../utils/genderText';
import './ShapesGame.css';

const ShapesGame = ({ onBack, score, setScore, onAnswer, userData }) => {
  const [question, setQuestion] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [streak, setStreak] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [questionKey, setQuestionKey] = useState(0);
  const MAX_ATTEMPTS = 3;

  const generateQuestion = async () => {
    setLoading(true);
    setQuestionKey(prev => prev + 1);
    try {
      const newQuestion = await generateShapesQuestion();
      setQuestion(newQuestion);
    } catch (error) {
      console.error('Error generating question:', error);
    }
    setLoading(false);
    setFeedback(null);
    setAttempts(0);
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  const checkAnswer = (selectedAnswer) => {
    // Support both correctAnswer (string) and correctIndex (number)
    let isCorrect;
    if (question.correctIndex !== undefined) {
      // If correctIndex is provided, compare by index
      const selectedIndex = question.options.indexOf(selectedAnswer);
      isCorrect = selectedIndex === question.correctIndex;
    } else {
      // Otherwise, compare by value
      isCorrect = selectedAnswer === question.correctAnswer;
    }
    
    const newAttempts = attempts + 1;
    
    if (isCorrect) {
      // Notify parent component
      if (onAnswer) {
        onAnswer(true);
      }
      
      const points = 15 + (streak * 5);
      setScore(score + points);
      setStreak(streak + 1);
      setFeedback({ 
        correct: true, 
        message: [
          getGenderText('מצוין! זיהית נכון! 🎉', userData?.gender),
          'נכון! ⭐',
          'כל הכבוד! 🌟',
          getGenderText('מעולה! 🚀', userData?.gender)
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
        message: getGenderText(`לא נכון, נסי שוב! יש לך עוד ${attemptsLeft} ${attemptsLeft === 1 ? 'ניסיון' : 'ניסיונות'} 💪`, userData?.gender),
        wrongAnswer: selectedAnswer
      });
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
        correctAnswer: question.correctAnswer
      });
      setQuestionCount(questionCount + 1);
    }
  };

  const nextQuestion = () => {
    generateQuestion();
  };

  if (!question && !loading) return null;

  return (
    <div className="shapes-game">
      <div className="game-header">
        <button className="back-button" onClick={onBack}>
          ← חזרה
        </button>
        <h2 className="game-title">גיאומטריה וצורות</h2>
      </div>

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            fontSize: '2rem'
          }}
        >
          <div style={{ fontSize: '4rem', animation: 'spin 2s linear infinite' }}>🤖</div>
          <p style={{ marginTop: '20px', color: 'white', fontSize: '1.5rem' }}>יוצר שאלה חדשה...</p>
        </motion.div>
      ) : (
        <motion.div
          className="question-card"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          key={questionKey}
        >
          <h2 className="question-title">{question.text || question.question}</h2>
          
          {question.shape && (
            <div className="shape-display">
              <svg viewBox="0 0 300 300" className="shape-svg">
                <g dangerouslySetInnerHTML={{ __html: question.shape.svg }} />
              </svg>
            </div>
          )}

          <AnimatePresence mode="wait">
            {!feedback ? (
              <motion.div
                className="options-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {question.options.map((option, index) => (
                  <motion.button
                    key={index}
                    className="option-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => checkAnswer(option)}
                  >
                    {option}
                  </motion.button>
                ))}
              </motion.div>
            ) : feedback.isRetry ? (
              <motion.div
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
                <div className="options-grid">
                  {question.options.map((option, index) => (
                    <motion.button
                      key={index}
                      className="option-button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => checkAnswer(option)}
                      style={{
                        opacity: option === feedback.wrongAnswer ? 0.5 : 1,
                        pointerEvents: option === feedback.wrongAnswer ? 'none' : 'auto'
                      }}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
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
                {!feedback.correct && (question.correctAnswer || question.correctIndex !== undefined) && (
                  <p className="correct-answer">
                    התשובה הנכונה: {question.correctAnswer || question.options[question.correctIndex]}
                  </p>
                )}
                {question.explanation && (
                  <div className="solution-steps">
                    <h4>💡 הסבר:</h4>
                    <p>{question.explanation}</p>
                  </div>
                )}
                <button className="next-button" onClick={nextQuestion}>
                  שאלה הבאה →
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

export default ShapesGame;
