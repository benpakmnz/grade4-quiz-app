import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateMeasurementsQuestion } from '../services/geminiService';
import { getGenderText } from '../utils/genderText';
import './MeasurementsGame.css';

const MeasurementsGame = ({ onBack, score, setScore, onAnswer, userData }) => {
  const [question, setQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [streak, setStreak] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 3;

  const questionTypes = [
    {
      type: 'area',
      name: 'שטח',
      emoji: '📐',
      generate: () => {
        const shapes = [
          {
            name: 'מלבן',
            generate: () => {
              const length = Math.floor(Math.random() * 10) + 3;
              const width = Math.floor(Math.random() * 8) + 2;
              const area = length * width;
              return {
                text: `חשבו את השטח של מלבן שאורכו ${length} ס"מ ורוחבו ${width} ס"מ`,
                answer: area,
                unit: 'ס"מ²',
                explanation: `שטח = אורך × רוחב = ${length} × ${width} = ${area} ס"מ²`
              };
            }
          },
          {
            name: 'ריבוע',
            generate: () => {
              const side = Math.floor(Math.random() * 10) + 3;
              const area = side * side;
              return {
                text: `חשבו את השטח של ריבוע שאורך צלעו ${side} ס"מ`,
                answer: area,
                unit: 'ס"מ²',
                explanation: `שטח = צלע × צלע = ${side} × ${side} = ${area} ס"מ²`
              };
            }
          }
        ];
        
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        return shape.generate();
      }
    },
    {
      type: 'perimeter',
      name: 'היקף',
      emoji: '📏',
      generate: () => {
        const shapes = [
          {
            name: 'מלבן',
            generate: () => {
              const length = Math.floor(Math.random() * 10) + 3;
              const width = Math.floor(Math.random() * 8) + 2;
              const perimeter = 2 * (length + width);
              return {
                text: `חשבו את ההיקף של מלבן שאורך צלעותיו הן ${length} ס"מ ו-${width} ס"מ`,
                answer: perimeter,
                unit: 'ס"מ',
                explanation: `היקף = ${length} + ${width} + ${length} + ${width} = ${perimeter} ס"מ`
              };
            }
          },
          {
            name: 'ריבוע',
            generate: () => {
              const side = Math.floor(Math.random() * 10) + 3;
              const perimeter = 4 * side;
              return {
                text: `חשבו את ההיקף של ריבוע שאורך צלעו ${side} ס"מ`,
                answer: perimeter,
                unit: 'ס"מ',
                explanation: `היקף = ${side} + ${side} + ${side} + ${side} = ${perimeter} ס"מ`
              };
            }
          },
          {
            name: 'משולש',
            generate: () => {
              const side1 = Math.floor(Math.random() * 8) + 3;
              const side2 = Math.floor(Math.random() * 8) + 3;
              const side3 = Math.floor(Math.random() * 8) + 3;
              const perimeter = side1 + side2 + side3;
              return {
                text: `חשבו את ההיקף של משולש שאורך צלעותיו הן ${side1} ס"מ, ${side2} ס"מ ו-${side3} ס"מ`,
                answer: perimeter,
                unit: 'ס"מ',
                explanation: `היקף = ${side1} + ${side2} + ${side3} = ${perimeter} ס"מ`
              };
            }
          }
        ];
        
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        return shape.generate();
      }
    }
  ];

  const generateQuestionWithAI = async () => {
    setLoading(true);
    try {
      const aiQuestion = await generateMeasurementsQuestion();
      setQuestion({
        text: aiQuestion.question,
        answer: aiQuestion.answer,
        unit: aiQuestion.unit,
        explanation: aiQuestion.explanation,
        emoji: '📏'
      });
    } catch (error) {
      console.error('Error generating AI question:', error);
      // Fallback to static question
      generateStaticQuestion();
    }
    setLoading(false);
    setUserAnswer('');
    setFeedback(null);
  };

  const generateStaticQuestion = () => {
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    const q = questionType.generate();
    
    setQuestion({
      ...q,
      emoji: questionType.emoji,
      type: questionType.name
    });
    setUserAnswer('');
    setFeedback(null);
    setAttempts(0);
  };

  const generateQuestion = () => {
    generateStaticQuestion(); // Use static questions for area and perimeter
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  const checkAnswer = () => {
    const userNum = parseFloat(userAnswer);
    const isCorrect = Math.abs(userNum - question.answer) < 0.01;
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
          getGenderText('מעולה! חישבת נכון! 🎉', userData?.gender),
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

  if (!question && !loading) return null;

  return (
    <div className="measurements-game">
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
          key={question.text}
        >
          <div className="measurement-badge">{question.emoji}</div>
          {question.type && <div className="measurement-type">{question.type}</div>}
          
          <div className="question-text">
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
                <div className="answer-input-group">
                  <input
                  type="number"
                  step="0.01"
                  className="answer-input"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && userAnswer && checkAnswer()}
                  placeholder="התשובה..."
                  autoFocus
                />
                <span className="unit-label">{question.unit}</span>
              </div>
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
              <div className="answer-input-group">
                <input
                  type="number"
                  step="0.01"
                  className="answer-input"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && userAnswer && checkAnswer()}
                  placeholder={getGenderText("נסי שוב...", userData?.gender)}
                  autoFocus
                />
                <span className="unit-label">{question.unit}</span>
              </div>
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
                  התשובה הנכונה: {feedback.correctAnswer} {question.unit}
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

export default MeasurementsGame;
