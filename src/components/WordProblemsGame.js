import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateWordProblem } from '../services/geminiService';
import { getGenderText } from '../utils/genderText';
import './WordProblemsGame.css';

const WordProblemsGame = ({ onBack, score, setScore, onAnswer, userData }) => {
  const [question, setQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [streak, setStreak] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 3;

  const generateQuestion = async () => {
    setLoading(true);
    try {
      const problem = await generateWordProblem();
      setQuestion({
        text: problem.question,
        answer: problem.answer,
        explanation: problem.explanation,
        emoji: ['🎨', '📚', '🍪', '🍎', '✏️', '🍫', '⚽', '🎈'][Math.floor(Math.random() * 8)],
        title: 'בעיה מילולית'
      });
    } catch (error) {
      console.error('Error generating question:', error);
      // Fallback to static question
      setQuestion({
        text: 'לשרה היו 45 מדבקות. היא קיבלה עוד 23 מדבקות מחברה. כמה מדבקות יש לה עכשיו?',
        answer: 68,
        explanation: '45 + 23 = 68',
        emoji: '🎨',
        title: 'בעיה מילולית'
      });
    }
    setLoading(false);
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
      
      const points = 20;
      const bonusPoints = streak * 5;
      const totalPoints = points + bonusPoints;
      
      setScore(score + totalPoints);
      setStreak(streak + 1);
      setFeedback({ 
        correct: true, 
        message: [
          getGenderText('מצוין! חשבת נכון! 🎉', userData?.gender),
          getGenderText('פתרת את זה! ⭐', userData?.gender),
          getGenderText('מעולה! 🌟', userData?.gender),
          getGenderText('גאונות! 🚀', userData?.gender)
        ][Math.floor(Math.random() * 4)],
        points: totalPoints,
        explanation: question.explanation
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
    <div className="word-problems-game">
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

      {loading ? (
        <motion.div
          className="loading-spinner"
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
          <div className="spinner" style={{ fontSize: '4rem', animation: 'spin 2s linear infinite' }}>🤖</div>
          <p style={{ marginTop: '20px', color: 'white', fontSize: '1.5rem' }}>יוצר שאלה חדשה...</p>
        </motion.div>
      ) : (
        <motion.div
          className="question-card"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          key={question.text}
        >
          <div className="problem-badge">{question.emoji}</div>
          <div className="problem-type-badge">{question.title}</div>
          
          <div className="problem-text">
            {question.text}
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
                    התשובה הנכונה: {feedback.correctAnswer}
                  </p>
                )}
                {feedback.explanation && (
                  <div className="solution-steps">
                    <h4>💡 הסבר:</h4>
                    <p>{feedback.explanation}</p>
                  </div>
                )}
                <button className="next-button" onClick={nextQuestion}>
                  בעיה הבאה →
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

export default WordProblemsGame;
