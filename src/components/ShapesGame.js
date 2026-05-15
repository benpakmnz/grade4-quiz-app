import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ShapesGame.css';

const ShapesGame = ({ onBack, score, setScore }) => {
  const [question, setQuestion] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [streak, setStreak] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);

  const shapes = [
    {
      name: 'מרובע',
      properties: 'יש לו 4 צלעות ו-4 זוויות',
      svg: '<rect x="50" y="50" width="200" height="200" fill="#ff6b9d" stroke="#fff" stroke-width="4"/>',
      sides: 4,
      angles: 4
    },
    {
      name: 'משולש',
      properties: 'יש לו 3 צלעות ו-3 זוויות',
      svg: '<polygon points="150,50 50,250 250,250" fill="#4ecdc4" stroke="#fff" stroke-width="4"/>',
      sides: 3,
      angles: 3
    },
    {
      name: 'עיגול',
      properties: 'אין לו צלעות וזוויות, הוא עגול לחלוטין',
      svg: '<circle cx="150" cy="150" r="100" fill="#ffe66d" stroke="#fff" stroke-width="4"/>',
      sides: 0,
      angles: 0
    },
    {
      name: 'מלבן',
      properties: 'יש לו 4 צלעות ו-4 זוויות ישרות, 2 צלעות ארוכות ו-2 קצרות',
      svg: '<rect x="50" y="80" width="200" height="140" fill="#a78bfa" stroke="#fff" stroke-width="4"/>',
      sides: 4,
      angles: 4
    },
    {
      name: 'ריבוע',
      properties: 'יש לו 4 צלעות שוות ו-4 זוויות ישרות',
      svg: '<rect x="75" y="75" width="150" height="150" fill="#f472b6" stroke="#fff" stroke-width="4"/>',
      sides: 4,
      angles: 4,
      equal: true
    },
    {
      name: 'מחומש',
      properties: 'יש לו 5 צלעות ו-5 זוויות',
      svg: '<polygon points="150,50 250,120 210,230 90,230 50,120" fill="#fb923c" stroke="#fff" stroke-width="4"/>',
      sides: 5,
      angles: 5
    },
    {
      name: 'משושה',
      properties: 'יש לו 6 צלעות ו-6 זוויות',
      svg: '<polygon points="150,50 230,95 230,185 150,230 70,185 70,95" fill="#34d399" stroke="#fff" stroke-width="4"/>',
      sides: 6,
      angles: 6
    }
  ];

  const questionTypes = [
    {
      type: 'identify',
      generate: (shape) => ({
        question: 'איזו צורה זו?',
        shape: shape,
        correctAnswer: shape.name,
        options: getRandomShapeNames(shape.name)
      })
    },
    {
      type: 'countSides',
      generate: (shape) => ({
        question: `כמה צלעות יש ל${shape.name}?`,
        shape: shape,
        correctAnswer: shape.sides.toString(),
        options: [shape.sides - 1, shape.sides, shape.sides + 1, shape.sides + 2].map(n => n.toString()).filter(n => parseInt(n) >= 0)
      })
    },
    {
      type: 'countAngles',
      generate: (shape) => ({
        question: `כמה זוויות יש ל${shape.name}?`,
        shape: shape,
        correctAnswer: shape.angles.toString(),
        options: [shape.angles - 1, shape.angles, shape.angles + 1, shape.angles + 2].map(n => n.toString()).filter(n => parseInt(n) >= 0)
      })
    },
    {
      type: 'properties',
      generate: (shape) => ({
        question: `מה נכון לגבי ${shape.name}?`,
        shape: shape,
        correctAnswer: shape.properties,
        options: [shape.properties, ...getRandomProperties(shape.properties)]
      })
    }
  ];

  function getRandomShapeNames(correctName) {
    const names = shapes.map(s => s.name).filter(n => n !== correctName);
    const shuffled = names.sort(() => 0.5 - Math.random());
    return [correctName, ...shuffled.slice(0, 3)].sort(() => 0.5 - Math.random());
  }

  function getRandomProperties(correctProp) {
    const props = shapes.map(s => s.properties).filter(p => p !== correctProp);
    return props.sort(() => 0.5 - Math.random()).slice(0, 3);
  }

  const generateQuestion = () => {
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    const q = questionType.generate(shape);
    
    setQuestion(q);
    setFeedback(null);
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  const checkAnswer = (selectedAnswer) => {
    const isCorrect = selectedAnswer === question.correctAnswer;
    
    if (isCorrect) {
      const points = 15 + (streak * 5);
      setScore(score + points);
      setStreak(streak + 1);
      setFeedback({ 
        correct: true, 
        message: ['מצוין! זיהית נכון! 🎉', 'נכון! ⭐', 'כל הכבוד! 🌟', 'מעולה! 🚀'][Math.floor(Math.random() * 4)],
        points
      });
    } else {
      setStreak(0);
      setFeedback({ 
        correct: false, 
        message: 'לא נורא, ננסה שוב! 💪',
        correctAnswer: question.correctAnswer
      });
    }

    setQuestionCount(questionCount + 1);
  };

  const nextQuestion = () => {
    generateQuestion();
  };

  if (!question) return null;

  return (
    <div className="shapes-game">
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
        key={question.question}
      >
        <h2 className="question-title">{question.question}</h2>
        
        <div className="shape-display">
          <svg viewBox="0 0 300 300" className="shape-svg">
            <g dangerouslySetInnerHTML={{ __html: question.shape.svg }} />
          </svg>
        </div>

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
                  התשובה הנכונה: {feedback.correctAnswer}
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
    </div>
  );
};

export default ShapesGame;
