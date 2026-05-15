import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Achievements.css';

const Achievements = ({ score, streak, questionCount, onClose }) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [showNotification, setShowNotification] = useState(null);

  const achievements = [
    {
      id: 'first_steps',
      title: 'צעדים ראשונים',
      description: 'פתרת את השאלה הראשונה!',
      emoji: '👣',
      condition: (s, st, q) => q >= 1,
      color: '#4ecdc4'
    },
    {
      id: 'quick_learner',
      title: 'לומדת מהירה',
      description: 'פתרת 5 שאלות!',
      emoji: '🚀',
      condition: (s, st, q) => q >= 5,
      color: '#ff6b9d'
    },
    {
      id: 'dedicated',
      title: 'מסורה',
      description: 'פתרת 10 שאלות!',
      emoji: '💪',
      condition: (s, st, q) => q >= 10,
      color: '#a78bfa'
    },
    {
      id: 'math_master',
      title: 'מלכת החשבון',
      description: 'פתרת 20 שאלות!',
      emoji: '👑',
      condition: (s, st, q) => q >= 20,
      color: '#fbbf24'
    },
    {
      id: 'streak_3',
      title: 'רצף מדהים',
      description: 'רצף של 3 תשובות נכונות!',
      emoji: '🔥',
      condition: (s, st, q) => st >= 3,
      color: '#ff6b9d'
    },
    {
      id: 'streak_5',
      title: 'רצף מושלם',
      description: 'רצף של 5 תשובות נכונות!',
      emoji: '⚡',
      condition: (s, st, q) => st >= 5,
      color: '#fbbf24'
    },
    {
      id: 'streak_10',
      title: 'בלתי ניתנת לעצירה',
      description: 'רצף של 10 תשובות נכונות!',
      emoji: '🌟',
      condition: (s, st, q) => st >= 10,
      color: '#a78bfa'
    },
    {
      id: 'score_50',
      title: 'אספנית נקודות',
      description: 'צברת 50 נקודות!',
      emoji: '💎',
      condition: (s, st, q) => s >= 50,
      color: '#4ecdc4'
    },
    {
      id: 'score_100',
      title: 'מאה ועוד',
      description: 'צברת 100 נקודות!',
      emoji: '🏆',
      condition: (s, st, q) => s >= 100,
      color: '#ff6b9d'
    },
    {
      id: 'score_200',
      title: 'אלופה',
      description: 'צברת 200 נקודות!',
      emoji: '🥇',
      condition: (s, st, q) => s >= 200,
      color: '#fbbf24'
    },
    {
      id: 'score_500',
      title: 'גאונית מתמטיקה',
      description: 'צברת 500 נקודות!',
      emoji: '🌈',
      condition: (s, st, q) => s >= 500,
      color: '#a78bfa'
    }
  ];

  // Load unlocked achievements from localStorage on mount
  useEffect(() => {
    const savedAchievements = localStorage.getItem('quiz_achievements');
    if (savedAchievements) {
      setUnlockedAchievements(JSON.parse(savedAchievements));
    }
  }, []);

  // Save unlocked achievements to localStorage whenever they change
  useEffect(() => {
    if (unlockedAchievements.length > 0) {
      localStorage.setItem('quiz_achievements', JSON.stringify(unlockedAchievements));
    }
  }, [unlockedAchievements]);

  useEffect(() => {
    const newUnlocked = achievements.filter(achievement => 
      achievement.condition(score, streak, questionCount) &&
      !unlockedAchievements.find(u => u.id === achievement.id)
    );

    if (newUnlocked.length > 0) {
      const latest = newUnlocked[newUnlocked.length - 1];
      setUnlockedAchievements([...unlockedAchievements, ...newUnlocked]);
      setShowNotification(latest);
      
      setTimeout(() => {
        setShowNotification(null);
      }, 4000);
    }
  }, [score, streak, questionCount]);

  const progress = {
    total: achievements.length,
    unlocked: unlockedAchievements.length,
    percentage: Math.round((unlockedAchievements.length / achievements.length) * 100)
  };

  return (
    <>
      {/* Achievement Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            className="achievement-notification"
            style={{ '--achievement-color': showNotification.color }}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <div className="notification-emoji">{showNotification.emoji}</div>
            <div className="notification-content">
              <div className="notification-badge">הישג חדש! 🎉</div>
              <h3 className="notification-title">{showNotification.title}</h3>
              <p className="notification-description">{showNotification.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievements Panel */}
      <motion.div
        className="achievements-panel"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="achievements-header">
          <h2 className="achievements-title">🏆 ההישגים שלי</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="achievements-progress">
          <div className="progress-text">
            <span className="progress-label">התקדמות:</span>
            <span className="progress-value">{progress.unlocked} / {progress.total}</span>
          </div>
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <div className="progress-percentage">{progress.percentage}%</div>
        </div>

        <div className="achievements-grid">
          {achievements.map((achievement, index) => {
            const isUnlocked = unlockedAchievements.find(u => u.id === achievement.id);
            return (
              <motion.div
                key={achievement.id}
                className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                style={{ '--achievement-color': achievement.color }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={isUnlocked ? { scale: 1.05 } : {}}
              >
                <div className="achievement-emoji">
                  {isUnlocked ? achievement.emoji : '🔒'}
                </div>
                <h3 className="achievement-title">
                  {isUnlocked ? achievement.title : '???'}
                </h3>
                <p className="achievement-description">
                  {isUnlocked ? achievement.description : 'הישג נעול'}
                </p>
                {isUnlocked && (
                  <motion.div
                    className="achievement-shine"
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </>
  );
};

export default Achievements;
