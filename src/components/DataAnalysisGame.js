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
  const [useAI, setUseAI] = useState(true); // Use AI with improved prompts
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 3;

  const generateQuestionWithAI = async () => {
    setLoading(true);
    try {
      const aiQuestion = await generateDataAnalysisQuestion();
      console.log('AI Question received:', aiQuestion);
      
      // Process the AI response to ensure it has the right structure
      const processedQuestion = {
        ...aiQuestion,
        type: aiQuestion.type || 'bar'
      };
      
      // For pictograph, ensure scale exists
      if (processedQuestion.type === 'pictograph' && !processedQuestion.scale) {
        processedQuestion.scale = 5;
      }
      
      // For pie chart, calculate total if missing
      if (processedQuestion.type === 'pie' && !processedQuestion.total) {
        processedQuestion.total = Object.values(processedQuestion.data).reduce((a, b) => a + b, 0);
      }
      
      console.log('Processed question:', processedQuestion);
      setQuestion(processedQuestion);
    } catch (error) {
      console.error('Error generating AI question:', error);
      // Fallback to static question
      generateStaticQuestion();
    }
    setLoading(false);
    setUserAnswer('');
    setFeedback(null);
    setAttempts(0);
  };

  const generateStaticQuestion = () => {
    const visualTypes = ['table', 'barChart', 'pictograph', 'pieChart'];
    const selectedType = visualTypes[Math.floor(Math.random() * visualTypes.length)];

    if (selectedType === 'table') {
      generateTableQuestion();
    } else if (selectedType === 'barChart') {
      generateBarChartQuestion();
    } else if (selectedType === 'pictograph') {
      generatePictographQuestion();
    } else {
      generatePieChartQuestion();
    }
  };

  const generateQuestion = () => {
    if (useAI) {
      generateQuestionWithAI();
    } else {
      generateStaticQuestion();
    }
  };

  const generateTableQuestion = () => {
    const subjects = ['מתמטיקה', 'עברית', 'אנגלית', 'מדעים', 'היסטוריה'];
    const students = ['דני', 'מיכל', 'יוסי', 'שרה', 'רון'];
    
    const selectedSubjects = subjects.slice(0, 3 + Math.floor(Math.random() * 2));
    const selectedStudents = students.slice(0, 3 + Math.floor(Math.random() * 2));
    
    const data = {};
    selectedStudents.forEach(student => {
      data[student] = {};
      selectedSubjects.forEach(subject => {
        data[student][subject] = Math.floor(Math.random() * 41) + 60;
      });
    });

    const questionTypes = ['max', 'min', 'sum', 'average', 'difference'];
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    let questionText, answer;

    switch (questionType) {
      case 'max':
        const maxSubject = selectedSubjects[Math.floor(Math.random() * selectedSubjects.length)];
        let maxScore = 0;
        selectedStudents.forEach(student => {
          if (data[student][maxSubject] > maxScore) {
            maxScore = data[student][maxSubject];
          }
        });
        questionText = `מה הציון הגבוה ביותר ב${maxSubject}?`;
        answer = maxScore;
        break;

      case 'min':
        const minSubject = selectedSubjects[Math.floor(Math.random() * selectedSubjects.length)];
        let minScore = 100;
        selectedStudents.forEach(student => {
          if (data[student][minSubject] < minScore) {
            minScore = data[student][minSubject];
          }
        });
        questionText = `מה הציון הנמוך ביותר ב${minSubject}?`;
        answer = minScore;
        break;

      case 'sum':
        const sumStudent = selectedStudents[Math.floor(Math.random() * selectedStudents.length)];
        answer = 0;
        selectedSubjects.forEach(subject => {
          answer += data[sumStudent][subject];
        });
        questionText = `מה סכום כל הציונים של ${sumStudent}?`;
        break;

      case 'average':
        const avgStudent = selectedStudents[Math.floor(Math.random() * selectedStudents.length)];
        let sum = 0;
        selectedSubjects.forEach(subject => {
          sum += data[avgStudent][subject];
        });
        answer = Math.round(sum / selectedSubjects.length);
        questionText = `מה הממוצע (עגול למספר שלם) של ${avgStudent}?`;
        break;

      case 'difference':
        const diffSubject = selectedSubjects[Math.floor(Math.random() * selectedSubjects.length)];
        const student1 = selectedStudents[0];
        const student2 = selectedStudents[1];
        answer = Math.abs(data[student1][diffSubject] - data[student2][diffSubject]);
        questionText = `מה ההפרש בין הציון של ${student1} ל${student2} ב${diffSubject}?`;
        break;

      default:
        answer = 0;
        questionText = '';
    }

    setQuestion({ 
      type: 'table',
      data,
      students: selectedStudents,
      subjects: selectedSubjects,
      text: questionText,
      answer
    });
    setUserAnswer('');
    setFeedback(null);
    setAttempts(0);
  };

  const generateBarChartQuestion = () => {
    const categories = [
      { items: ['תפוחים', 'בננות', 'תפוזים', 'ענבים'], title: 'פירות שנמכרו בחנות' },
      { items: ['כדורגל', 'כדורסל', 'שחייה', 'טניס'], title: 'ספורט אהוב בכיתה' },
      { items: ['כלב', 'חתול', 'דג', 'ציפור'], title: 'חיות מחמד בכיתה' },
      { items: ['אדום', 'כחול', 'ירוק', 'צהוב'], title: 'צבעים אהובים' }
    ];

    const selected = categories[Math.floor(Math.random() * categories.length)];
    const data = {};
    selected.items.forEach(item => {
      data[item] = Math.floor(Math.random() * 20) + 5;
    });

    const questionTypes = ['max', 'min', 'sum', 'difference'];
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    let questionText, answer;

    const items = Object.keys(data);
    const values = Object.values(data);

    switch (questionType) {
      case 'max':
        answer = Math.max(...values);
        questionText = `מה המספר הגבוה ביותר בגרף?`;
        break;
      case 'min':
        answer = Math.min(...values);
        questionText = `מה המספר הנמוך ביותר בגרף?`;
        break;
      case 'sum':
        answer = values.reduce((a, b) => a + b, 0);
        questionText = `מה הסכום של כל העמודות?`;
        break;
      case 'difference':
        const item1 = items[0];
        const item2 = items[1];
        answer = Math.abs(data[item1] - data[item2]);
        questionText = `מה ההפרש בין ${item1} ל${item2}?`;
        break;
      default:
        answer = 0;
        questionText = '';
    }

    setQuestion({
      type: 'barChart',
      data,
      title: selected.title,
      text: questionText,
      answer
    });
    setUserAnswer('');
    setFeedback(null);
    setAttempts(0);
  };

  const generatePictographQuestion = () => {
    const themes = [
      { items: ['🍎 תפוחים', '🍌 בננות', '🍊 תפוזים', '🍇 ענבים'], title: 'פירות שנמכרו השבוע', icon: '🍎' },
      { items: ['⚽ כדורגל', '🏀 כדורסל', '🏊 שחייה', '🎾 טניס'], title: 'ספורט אהוב', icon: '⚽' },
      { items: ['🐕 כלבים', '🐈 חתולים', '🐠 דגים', '🐦 ציפורים'], title: 'חיות מחמד', icon: '🐕' },
      { items: ['📕 ספרים', '🎮 משחקים', '🎨 ציור', '🎵 מוזיקה'], title: 'תחביבים', icon: '📕' }
    ];

    const selected = themes[Math.floor(Math.random() * themes.length)];
    const data = {};
    const scale = Math.floor(Math.random() * 3) + 2; // כל סמל = 2-4 יחידות
    
    selected.items.forEach(item => {
      const count = Math.floor(Math.random() * 6) + 2; // 2-7 סמלים
      data[item] = count * scale;
    });

    const questionTypes = ['total', 'difference', 'howMany'];
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    let questionText, answer;

    const items = Object.keys(data);
    const values = Object.values(data);

    switch (questionType) {
      case 'total':
        const selectedItem = items[Math.floor(Math.random() * items.length)];
        answer = data[selectedItem];
        questionText = `כמה ${selectedItem.split(' ')[1]} יש בסך הכל?`;
        break;
      case 'difference':
        const item1 = items[0];
        const item2 = items[1];
        answer = Math.abs(data[item1] - data[item2]);
        questionText = `מה ההפרש בין ${item1.split(' ')[1]} ל${item2.split(' ')[1]}?`;
        break;
      case 'howMany':
        answer = values.reduce((a, b) => a + b, 0);
        questionText = `כמה פריטים יש בסך הכל?`;
        break;
      default:
        answer = 0;
        questionText = '';
    }

    setQuestion({
      type: 'pictograph',
      data,
      title: selected.title,
      scale,
      text: questionText,
      answer
    });
    setUserAnswer('');
    setFeedback(null);
    setAttempts(0);
  };

  const generatePieChartQuestion = () => {
    const themes = [
      { items: ['פיצה', 'המבורגר', 'פסטה', 'סלט'], title: 'אוכל אהוב בכיתה' },
      { items: ['קריאה', 'כתיבה', 'חשבון', 'מדעים'], title: 'מקצוע אהוב' },
      { items: ['אדום', 'כחול', 'ירוק', 'צהוב'], title: 'צבע אהוב' }
    ];

    const selected = themes[Math.floor(Math.random() * themes.length)];
    const data = {};
    let total = 0;
    
    selected.items.forEach((item, idx) => {
      const value = Math.floor(Math.random() * 15) + 5;
      data[item] = value;
      total += value;
    });

    const items = Object.keys(data);
    const selectedItem = items[Math.floor(Math.random() * items.length)];
    
    const questionText = `כמה תלמידים בחרו ב${selectedItem}?`;
    const answer = data[selectedItem];

    setQuestion({
      type: 'pieChart',
      data,
      total,
      title: selected.title,
      text: questionText,
      answer
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
      // Check if we have the required data structure
      if (!question.subjects || !question.students || !question.data) {
        return null;
      }
      
      return (
        <div style={{ 
          overflowX: 'auto',
          marginBottom: '30px',
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '15px'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'center',
            fontSize: '1.1rem'
          }}>
            <thead>
              <tr style={{ background: '#667eea', color: 'white' }}>
                <th style={{ padding: '15px', border: '2px solid #ddd' }}>תלמיד</th>
                {question.subjects.map(subject => (
                  <th key={subject} style={{ padding: '15px', border: '2px solid #ddd' }}>{subject}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {question.students.map((student, idx) => (
                <tr key={student} style={{ background: idx % 2 === 0 ? 'white' : '#f0f0f0' }}>
                  <td style={{ padding: '12px', border: '2px solid #ddd', fontWeight: 'bold' }}>{student}</td>
                  {question.subjects.map(subject => (
                    <td key={subject} style={{ padding: '12px', border: '2px solid #ddd' }}>
                      {question.data[student][subject]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (question.type === 'barChart' || question.type === 'bar') {
      if (!question.data) return null;
      
      const maxValue = Math.max(...Object.values(question.data));
      return (
        <div style={{
          background: '#f8f9fa',
          padding: '30px',
          borderRadius: '15px',
          marginBottom: '30px'
        }}>
          <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#667eea' }}>
            {question.title}
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            height: '300px',
            borderBottom: '3px solid #333',
            paddingBottom: '10px'
          }}>
            {Object.entries(question.data).map(([item, value]) => (
              <div key={item} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  background: `linear-gradient(135deg, ${['#ff6b9d', '#4ecdc4', '#a78bfa', '#fbbf24'][Math.floor(Math.random() * 4)]}, #667eea)`,
                  width: '60px',
                  height: `${(value / maxValue) * 250}px`,
                  borderRadius: '10px 10px 0 0',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  paddingTop: '10px',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  transition: 'all 0.3s'
                }}>
                  {value}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  maxWidth: '80px'
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
          padding: '30px',
          borderRadius: '15px',
          marginBottom: '30px'
        }}>
          <h3 style={{ textAlign: 'center', marginBottom: '10px', color: '#667eea' }}>
            {question.title}
          </h3>
          <p style={{ textAlign: 'center', marginBottom: '20px', fontSize: '0.9rem', color: '#666' }}>
            כל סמל = {question.scale} יחידות
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {Object.entries(question.data).map(([item, value]) => {
              const iconCount = Math.floor(value / question.scale);
              const icon = item.split(' ')[0];
              return (
                <div key={item} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  background: 'white',
                  padding: '15px',
                  borderRadius: '10px'
                }}>
                  <div style={{
                    minWidth: '120px',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}>
                    {item}
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '5px',
                    fontSize: '2rem'
                  }}>
                    {Array(iconCount).fill(icon).map((ic, idx) => (
                      <span key={idx}>{ic}</span>
                    ))}
                  </div>
                  <div style={{
                    marginRight: 'auto',
                    fontWeight: 'bold',
                    color: '#667eea'
                  }}>
                    ({value})
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    } else if (question.type === 'pieChart') {
      if (!question.data || !question.total) return null;
      
      const colors = ['#ff6b9d', '#4ecdc4', '#a78bfa', '#fbbf24', '#ff8fab'];
      return (
        <div style={{
          background: '#f8f9fa',
          padding: '30px',
          borderRadius: '15px',
          marginBottom: '30px'
        }}>
          <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#667eea' }}>
            {question.title}
          </h3>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '30px'
          }}>
            {/* Pie Chart Representation */}
            <div style={{
              width: '200px',
              height: '200px',
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(question.data).map(([item, value], idx) => (
                <div key={item} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'white',
                  padding: '10px 15px',
                  borderRadius: '10px'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    background: colors[idx],
                    borderRadius: '4px'
                  }} />
                  <span style={{ fontWeight: 'bold' }}>{item}:</span>
                  <span style={{ color: '#667eea', fontWeight: 'bold' }}>{value}</span>
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
        key={question?.text || 'loading'}
        style={{ maxWidth: '1000px' }}
      >
        {loading ? (
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
              width: '100%'
            }}>
              {/* Right Side - Visualization */}
              <div style={{ 
                flex: '1', 
                minWidth: '0'
              }}>
                {renderVisualization()}
              </div>

              {/* Left Side - Question and Answer */}
              <div style={{ 
                flex: '0 0 400px',
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
