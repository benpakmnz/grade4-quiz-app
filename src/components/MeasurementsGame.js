import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateMeasurementsQuestion } from '../services/geminiService';
import './MeasurementsGame.css';

const MeasurementsGame = ({ onBack, score, setScore }) => {
  const [question, setQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [streak, setStreak] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const measurementTypes = {
    length: {
      name: 'אורך',
      emoji: '📏',
      units: [
        { name: 'מילימטר', abbr: 'מ"מ', toBase: 1 },
        { name: 'סנטימטר', abbr: 'ס"מ', toBase: 10 },
        { name: 'מטר', abbr: 'מ\'', toBase: 1000 },
        { name: 'קילומטר', abbr: 'ק"מ', toBase: 1000000 }
      ]
    },
    weight: {
      name: 'משקל',
      emoji: '⚖️',
      units: [
        { name: 'גרם', abbr: 'גר\'', toBase: 1 },
        { name: 'קילוגרם', abbr: 'ק"ג', toBase: 1000 },
        { name: 'טון', abbr: 'טון', toBase: 1000000 }
      ]
    },
    volume: {
      name: 'נפח',
      emoji: '🥤',
      units: [
        { name: 'מיליליטר', abbr: 'מ"ל', toBase: 1 },
        { name: 'ליטר', abbr: 'ליטר', toBase: 1000 }
      ]
    }
  };

  const questionTypes = [
    {
      type: 'convert',
      generate: (measureType) => {
        const units = measurementTypes[measureType].units;
        const fromUnit = units[Math.floor(Math.random() * units.length)];
        const toUnit = units[Math.floor(Math.random() * units.length)];
        
        if (fromUnit === toUnit) {
          return questionTypes[0].generate(measureType);
        }

        const value = Math.floor(Math.random() * 100) + 1;
        const answer = Math.round((value * fromUnit.toBase) / toUnit.toBase * 100) / 100;

        return {
          text: `המר ${value} ${fromUnit.name} ל${toUnit.name}`,
          emoji: measurementTypes[measureType].emoji,
          answer: answer,
          unit: toUnit.abbr,
          type: measurementTypes[measureType].name
        };
      }
    },
    {
      type: 'compare',
      generate: (measureType) => {
        const units = measurementTypes[measureType].units;
        const unit1 = units[Math.floor(Math.random() * units.length)];
        const unit2 = units[Math.floor(Math.random() * units.length)];
        
        const value1 = Math.floor(Math.random() * 50) + 10;
        const value2 = Math.floor(Math.random() * 50) + 10;
        
        const base1 = value1 * unit1.toBase;
        const base2 = value2 * unit2.toBase;
        
        const answer = base1 + base2;
        const resultUnit = units[0]; // תמיד מחזיר ביחידה הקטנה ביותר
        const finalAnswer = Math.round(answer / resultUnit.toBase);

        return {
          text: `${value1} ${unit1.name} + ${value2} ${unit2.name} = ? ${resultUnit.name}`,
          emoji: measurementTypes[measureType].emoji,
          answer: finalAnswer,
          unit: resultUnit.abbr,
          type: measurementTypes[measureType].name
        };
      }
    },
    {
      type: 'wordProblem',
      generate: (measureType) => {
        if (measureType === 'length') {
          const distance1 = Math.floor(Math.random() * 500) + 100;
          const distance2 = Math.floor(Math.random() * 500) + 100;
          const total = distance1 + distance2;
          return {
            text: `יוסי הלך ${distance1} מטר בבוקר ו-${distance2} מטר אחר הצהריים. כמה מטר הלך בסך הכל?`,
            emoji: '🚶',
            answer: total,
            unit: 'מ\'',
            type: 'אורך'
          };
        } else if (measureType === 'weight') {
          const weight1 = Math.floor(Math.random() * 5) + 1;
          const weight2 = Math.floor(Math.random() * 5) + 1;
          const total = weight1 + weight2;
          return {
            text: `תמר קנתה ${weight1} ק"ג תפוחים ו-${weight2} ק"ג תפוזים. כמה ק"ג פירות קנתה בסך הכל?`,
            emoji: '🍎',
            answer: total,
            unit: 'ק"ג',
            type: 'משקל'
          };
        } else {
          const volume1 = Math.floor(Math.random() * 2000) + 500;
          const volume2 = Math.floor(Math.random() * 2000) + 500;
          const total = volume1 + volume2;
          return {
            text: `בבקבוק אחד יש ${volume1} מ"ל מים ובבקבוק שני יש ${volume2} מ"ל. כמה מ"ל מים יש בסך הכל?`,
            emoji: '💧',
            answer: total,
            unit: 'מ"ל',
            type: 'נפח'
          };
        }
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
    const measureTypes = Object.keys(measurementTypes);
    const measureType = measureTypes[Math.floor(Math.random() * measureTypes.length)];
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    const q = questionType.generate(measureType);
    setQuestion(q);
    setUserAnswer('');
    setFeedback(null);
  };

  const generateQuestion = () => {
    generateQuestionWithAI(); // Use AI by default
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  const checkAnswer = () => {
    const userNum = parseFloat(userAnswer);
    const isCorrect = Math.abs(userNum - question.answer) < 0.01;
    
    if (isCorrect) {
      const points = 15 + (streak * 5);
      setScore(score + points);
      setStreak(streak + 1);
      setFeedback({ 
        correct: true, 
        message: ['מעולה! חישבת נכון! 🎉', 'נכון מאוד! ⭐', 'כל הכבוד! 🌟', 'מדהים! 🚀'][Math.floor(Math.random() * 4)],
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
