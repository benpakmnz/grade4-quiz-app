import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateDataAnalysisQuestion } from '../services/geminiService';
import { getGenderText } from '../utils/genderText';
import './MathGame.css';

const DataAnalysisGame = ({ onBack, score, setScore, streak, setStreak, questionCount, setQuestionCount, userData, onAnswer }) => {
  const [question, setQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [questionKey, setQuestionKey] = useState(0);
  const MAX_ATTEMPTS = 3;

  const generateQuestion = async () => {
    setLoading(true);
    setQuestion(null);
    setQuestionKey(prev => prev + 1);
    try {
      const newQuestion = await generateDataAnalysisQuestion();
      setQuestion(newQuestion);
    } catch (error) {
      console.error('Error generating question:', error);
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
    // Handle both numeric and dropdown (string) answers
    const isCorrect = question.answerType === 'dropdown' 
      ? userAnswer === question.answer 
      : parseInt(userAnswer) === question.answer;
    const newAttempts = attempts + 1;
    
    if (isCorrect) {
      // Notify parent component
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

  const renderVisualization = () => {
    if (!question || !question.type) return null;
    
    if (question.type === 'table') {
      // Support both old format (students/subjects) and new format (headers/rows)
      if (question.headers && question.rows) {
        // New format with headers and rows
        return (
          <div style={{ 
            overflowX: 'auto',
            marginBottom: '30px',
            background: '#f8f9fa',
            padding: '30px',
            borderRadius: '15px',
            width: '100%',
            maxWidth: '700px'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'center',
              fontSize: '1.1rem'
            }}>
              <thead>
                <tr style={{ background: '#667eea', color: 'white' }}>
                  {question.headers.map((header, idx) => (
                    <th key={idx} style={{ padding: '18px', border: '2px solid #ddd', fontSize: '1.1rem' }}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {question.rows.map((row, rowIdx) => (
                  <tr key={rowIdx} style={{ background: rowIdx % 2 === 0 ? 'white' : '#f0f0f0' }}>
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} style={{ 
                        padding: '15px', 
                        border: '2px solid #ddd',
                        fontWeight: cellIdx === 0 ? 'bold' : 'normal',
                        fontSize: '1.05rem'
                      }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      } else if (question.subjects && question.students && question.data) {
        // Old format with students/subjects
        return (
          <div style={{ 
            overflowX: 'auto',
            marginBottom: '30px',
            background: '#f8f9fa',
            padding: '30px',
            borderRadius: '15px',
            width: '100%',
            maxWidth: '700px'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'center',
              fontSize: '1.1rem'
            }}>
              <thead>
                <tr style={{ background: '#667eea', color: 'white' }}>
                  <th style={{ padding: '18px', border: '2px solid #ddd', fontSize: '1.1rem' }}>תלמיד</th>
                  {question.subjects.map(subject => (
                    <th key={subject} style={{ padding: '18px', border: '2px solid #ddd', fontSize: '1.1rem' }}>{subject}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {question.students.map((student, idx) => (
                  <tr key={student} style={{ background: idx % 2 === 0 ? 'white' : '#f0f0f0' }}>
                    <td style={{ padding: '15px', border: '2px solid #ddd', fontWeight: 'bold', fontSize: '1.05rem' }}>{student}</td>
                    {question.subjects.map(subject => (
                      <td key={subject} style={{ padding: '15px', border: '2px solid #ddd', fontSize: '1.05rem' }}>
                        {question.data[student][subject]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      
      return null;
    } else if (question.type === 'barChart' || question.type === 'bar') {
      if (!question.data) return null;
      
      const maxValue = Math.max(...Object.values(question.data));
      return (
        <div style={{
          background: '#f8f9fa',
          padding: '40px',
          borderRadius: '15px',
          marginBottom: '30px',
          width: '100%',
          maxWidth: '700px'
        }}>
          <h3 style={{ textAlign: 'center', marginBottom: '30px', color: '#667eea', fontSize: '1.3rem' }}>
            {question.title}
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            height: '350px',
            borderBottom: '3px solid #333',
            paddingBottom: '10px',
            gap: '20px'
          }}>
            {Object.entries(question.data).map(([item, value]) => (
              <div key={item} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '15px',
                flex: 1,
                maxWidth: '120px'
              }}>
                <div style={{
                  background: `linear-gradient(135deg, ${['#ff6b9d', '#4ecdc4', '#a78bfa', '#fbbf24'][Math.floor(Math.random() * 4)]}, #667eea)`,
                  width: '80px',
                  height: `${(value / maxValue) * 280}px`,
                  borderRadius: '10px 10px 0 0',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  paddingTop: '15px',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.4rem',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}>
                  {value}
                </div>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  maxWidth: '100px',
                  wordWrap: 'break-word',
                  lineHeight: '1.3'
                }}>
                  {item}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } else if (question.type === 'pictograph') {
      if (!question.data || !question.scale) return null;
      
      return (
        <div style={{
          background: '#f8f9fa',
          padding: '40px',
          borderRadius: '15px',
          marginBottom: '30px',
          width: '100%',
          maxWidth: '700px'
        }}>
          <h3 style={{ textAlign: 'center', marginBottom: '15px', color: '#667eea', fontSize: '1.3rem' }}>
            {question.title}
          </h3>
          <p style={{ textAlign: 'center', marginBottom: '25px', fontSize: '1rem', color: '#666', fontWeight: 'bold' }}>
            כל סמל = {question.scale} יחידות
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {Object.entries(question.data).map(([item, value]) => {
              const iconCount = Math.floor(value / question.scale);
              const icon = item.split(' ')[0];
              return (
                <div key={item} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '20px',
                  background: 'white',
                  padding: '20px',
                  borderRadius: '10px'
                }}>
                  <div style={{
                    minWidth: '140px',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    paddingTop: '5px'
                  }}>
                    {item}
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    fontSize: '2.2rem',
                    flex: 1,
                    flexWrap: 'wrap'
                  }}>
                    {Array(iconCount).fill(icon).map((ic, idx) => (
                      <span key={idx}>{ic}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    } else if (question.type === 'pieChart' || question.type === 'pie') {
      if (!question.data || !question.total) return null;
      
      const colors = ['#ff6b9d', '#4ecdc4', '#a78bfa', '#fbbf24', '#ff8fab'];
      return (
        <div style={{
          background: '#f8f9fa',
          padding: '40px',
          borderRadius: '15px',
          marginBottom: '30px',
          width: '100%',
          maxWidth: '700px'
        }}>
          <h3 style={{ textAlign: 'center', marginBottom: '30px', color: '#667eea', fontSize: '1.3rem' }}>
            {question.title}
          </h3>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '40px'
          }}>
            {/* Pie Chart Representation */}
            <div style={{
              width: '250px',
              height: '250px',
              borderRadius: '50%',
              background: `conic-gradient(${Object.entries(question.data).map(([item, value], idx) => {
                const prevTotal = Object.values(question.data).slice(0, idx).reduce((a, b) => a + b, 0);
                const startPercent = (prevTotal / question.total) * 100;
                const endPercent = ((prevTotal + value) / question.total) * 100;
                return `${colors[idx]} ${startPercent}% ${endPercent}%`;
              }).join(', ')})`,
              boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
            }} />
            
            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {Object.entries(question.data).map(([item, value], idx) => (
                <div key={item} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  background: 'white',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  minWidth: '200px'
                }}>
                  <div style={{
                    width: '25px',
                    height: '25px',
                    background: colors[idx],
                    borderRadius: '4px',
                    flexShrink: 0
                  }} />
                  <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>{item}:</span>
                  <span style={{ color: '#667eea', fontWeight: 'bold', fontSize: '1.1rem' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    // If no matching type, return null
    return null;
  };

  if (!question && !loading) return null;

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
        key={questionKey}
        style={{ maxWidth: '1000px' }}
      >
        {loading || !question ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            fontSize: '2rem'
          }}>
            <div style={{ fontSize: '4rem', animation: 'spin 2s linear infinite' }}>🤖</div>
            <p style={{ marginTop: '20px', color: '#667eea', fontSize: '1.5rem' }}>יוצר שאלה חדשה...</p>
          </div>
        ) : (
          <>
            <div className="operation-badge">📊</div>
            <h2 className="question-title">חקר נתונים</h2>
            {question.title && (
              <h3 style={{ color: '#667eea', marginBottom: '20px', fontSize: '1.3rem' }}>
                {question.title}
              </h3>
            )}
            
            {/* Horizontal Layout: Graph on right, Question on left */}
            <div style={{
              display: 'flex',
              gap: '30px',
              alignItems: 'flex-start',
              width: '100%',
              minHeight: '500px'
            }}>
              {/* Right Side - Visualization */}
              <div style={{ 
                flex: '1.5', 
                minWidth: '0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {renderVisualization()}
              </div>

              {/* Left Side - Question and Answer */}
              <div style={{ 
                flex: '1',
                minWidth: '350px',
                maxWidth: '450px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                <div className="question-text" style={{ 
                  fontSize: '1.5rem', 
                  lineHeight: '2',
                  padding: '25px',
                  background: '#fff3cd',
                  borderRadius: '15px',
                  border: '3px solid #ffc107'
                }}>
                  {question.question || question.text}
                </div>

                <AnimatePresence mode="wait">
                  {!feedback ? (
                    <motion.div
                      className="answer-section"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {question.answerType === 'dropdown' ? (
                        <select
                          className="answer-input"
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          autoFocus
                          style={{
                            fontSize: '1.2rem',
                            padding: '15px',
                            borderRadius: '10px',
                            border: '2px solid #667eea',
                            width: '100%',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="">בחר תשובה...</option>
                          {question.options.map((option, idx) => (
                            <option key={idx} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          className="answer-input"
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && userAnswer && checkAnswer()}
                          placeholder="התשובה שלך..."
                          autoFocus
                        />
                      )}
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
                      {question.answerType === 'dropdown' ? (
                        <select
                          className="answer-input"
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          autoFocus
                          style={{
                            fontSize: '1.2rem',
                            padding: '15px',
                            borderRadius: '10px',
                            border: '2px solid #667eea',
                            width: '100%',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="">בחר תשובה...</option>
                          {question.options.map((option, idx) => (
                            <option key={idx} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          className="answer-input"
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && userAnswer && checkAnswer()}
                          placeholder={getGenderText("נסי שוב...", userData?.gender)}
                          autoFocus
                        />
                      )}
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
                      style={{ padding: '15px' }}
                    >
                      <div className="feedback-emoji" style={{ fontSize: '2rem' }}>
                        {feedback.correct ? '🎉' : '💪'}
                      </div>
                      <h3 className="feedback-message" style={{ fontSize: '1.2rem', margin: '10px 0' }}>
                        {feedback.message}
                      </h3>
                      {feedback.correct && (
                        <p className="points-earned" style={{ fontSize: '1rem', margin: '8px 0' }}>
                          +{feedback.points} נקודות!
                        </p>
                      )}
                      {!feedback.correct && feedback.correctAnswer && (
                        <p className="correct-answer" style={{ fontSize: '1rem', margin: '8px 0' }}>
                          התשובה הנכונה: {feedback.correctAnswer}
                        </p>
                      )}
                      {feedback.explanation && (
                        <div className="solution-steps" style={{ fontSize: '0.9rem', margin: '10px 0', padding: '10px' }}>
                          <h4 style={{ fontSize: '1rem', margin: '5px 0' }}>💡 הסבר:</h4>
                          <p style={{ margin: '5px 0' }}>{feedback.explanation}</p>
                        </div>
                      )}
                      <button className="next-button" onClick={nextQuestion} style={{ marginTop: '10px', padding: '10px 20px' }}>
                        שאלה הבאה →
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </>
        )}
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

export default DataAnalysisGame;
