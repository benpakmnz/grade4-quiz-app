import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './WordProblemsGame.css';

const WordProblemsGame = ({ onBack, score, setScore }) => {
  const [question, setQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [streak, setStreak] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);

  // בעיות מילוליות חד-שלביות
  const singleStepProblems = [
    {
      type: 'addition',
      generate: () => {
        const num1 = Math.floor(Math.random() * 500) + 100;
        const num2 = Math.floor(Math.random() * 500) + 100;
        return {
          text: `לדנה יש ${num1} מדבקות. חברה שלה נתנה לה עוד ${num2} מדבקות. כמה מדבקות יש לדנה עכשיו?`,
          answer: num1 + num2,
          emoji: '🎨'
        };
      }
    },
    {
      type: 'subtraction',
      generate: () => {
        const total = Math.floor(Math.random() * 800) + 200;
        const used = Math.floor(Math.random() * (total - 50)) + 50;
        return {
          text: `בחנות היו ${total} ספרים. נמכרו ${used} ספרים. כמה ספרים נשארו בחנות?`,
          answer: total - used,
          emoji: '📚'
        };
      }
    },
    {
      type: 'multiplication',
      generate: () => {
        const boxes = Math.floor(Math.random() * 10) + 2;
        const perBox = Math.floor(Math.random() * 10) + 2;
        return {
          text: `בכל קופסה יש ${perBox} עוגיות. יש ${boxes} קופסאות. כמה עוגיות יש בסך הכל?`,
          answer: boxes * perBox,
          emoji: '🍪'
        };
      }
    },
    {
      type: 'division',
      generate: () => {
        const groups = Math.floor(Math.random() * 10) + 2;
        const perGroup = Math.floor(Math.random() * 10) + 2;
        const total = groups * perGroup;
        return {
          text: `יש ${total} תפוחים. רוצים לחלק אותם שווה ל-${groups} ילדים. כמה תפוחים יקבל כל ילד?`,
          answer: perGroup,
          emoji: '🍎'
        };
      }
    }
  ];

  // בעיות מילוליות דו-שלביות
  const twoStepProblems = [
    {
      generate: () => {
        const price = Math.floor(Math.random() * 20) + 10;
        const quantity1 = Math.floor(Math.random() * 5) + 2;
        const quantity2 = Math.floor(Math.random() * 5) + 2;
        const total = (quantity1 + quantity2) * price;
        return {
          text: `נועה קנתה ${quantity1} עטים וגם ${quantity2} עטים נוספים. כל עט עולה ${price} ש"ח. כמה כסף הוציאה נועה בסך הכל?`,
          answer: total,
          emoji: '✏️',
          steps: `שלב 1: ${quantity1} + ${quantity2} = ${quantity1 + quantity2} עטים\nשלב 2: ${quantity1 + quantity2} × ${price} = ${total} ש"ח`
        };
      }
    },
    {
      generate: () => {
        const total = Math.floor(Math.random() * 100) + 50;
        const boys = Math.floor(Math.random() * (total - 20)) + 10;
        const girls = total - boys;
        const leftClass = Math.floor(Math.random() * girls) + 1;
        const remaining = girls - leftClass;
        return {
          text: `בכיתה יש ${total} ילדים. ${boys} מהם בנים. ${leftClass} בנות יצאו להפסקה. כמה בנות נשארו בכיתה?`,
          answer: remaining,
          emoji: '👧',
          steps: `שלב 1: ${total} - ${boys} = ${girls} בנות\nשלב 2: ${girls} - ${leftClass} = ${remaining} בנות נשארו`
        };
      }
    },
    {
      generate: () => {
        const boxes = Math.floor(Math.random() * 5) + 3;
        const perBox = Math.floor(Math.random() * 8) + 4;
        const ate = Math.floor(Math.random() * 10) + 5;
        const total = (boxes * perBox) - ate;
        return {
          text: `אמא קנתה ${boxes} קופסאות שוקולד. בכל קופסה ${perBox} חטיפים. המשפחה אכלה ${ate} חטיפים. כמה חטיפים נשארו?`,
          answer: total,
          emoji: '🍫',
          steps: `שלב 1: ${boxes} × ${perBox} = ${boxes * perBox} חטיפים\nשלב 2: ${boxes * perBox} - ${ate} = ${total} חטיפים נשארו`
        };
      }
    }
  ];

  const generateQuestion = () => {
    const isTwoStep = Math.random() > 0.4; // 60% סיכוי לדו-שלבית
    
    if (isTwoStep) {
      const problemGenerator = twoStepProblems[Math.floor(Math.random() * twoStepProblems.length)];
      const problem = problemGenerator.generate();
      setQuestion({
        ...problem,
        type: 'two-step',
        title: 'בעיה דו-שלבית'
      });
    } else {
      const problemGenerator = singleStepProblems[Math.floor(Math.random() * singleStepProblems.length)];
      const problem = problemGenerator.generate();
      setQuestion({
        ...problem,
        type: 'single-step',
        title: 'בעיה חד-שלבית'
      });
    }
    
    setUserAnswer('');
    setFeedback(null);
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  const checkAnswer = () => {
    const isCorrect = parseInt(userAnswer) === question.answer;
    
    if (isCorrect) {
      const points = question.type === 'two-step' ? 20 : 15;
      const bonusPoints = streak * 5;
      const totalPoints = points + bonusPoints;
      
      setScore(score + totalPoints);
      setStreak(streak + 1);
      setFeedback({ 
        correct: true, 
        message: ['מצוין! חשבת נכון! 🎉', 'פתרת את זה! ⭐', 'מעולה! 🌟', 'גאונות! 🚀'][Math.floor(Math.random() * 4)],
        points: totalPoints,
        steps: question.steps
      });
    } else {
      setStreak(0);
      setFeedback({ 
        correct: false, 
        message: 'כמעט! בואי ננסה שוב 💪',
        correctAnswer: question.answer,
        steps: question.steps
      });
    }

    setQuestionCount(questionCount + 1);
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
              {feedback.steps && (
                <div className="solution-steps">
                  <h4>💡 פתרון:</h4>
                  <pre>{feedback.steps}</pre>
                </div>
              )}
              <button className="next-button" onClick={nextQuestion}>
                בעיה הבאה →
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

export default WordProblemsGame;
