import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Achievements.css';
import { getGenderText } from '../utils/genderText';

const Achievements = ({ score, streak, questionCount, onClose, categoryStats, userData }) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [showNotification, setShowNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'achievements', 'categories'

  // Calculate overall statistics
  const calculateOverallStats = () => {
    let totalCorrect = 0;
    let totalQuestions = 0;
    
    Object.values(categoryStats).forEach(stat => {
      totalCorrect += stat.correct;
      totalQuestions += stat.total;
    });
    
    const successRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const failedQuestions = totalQuestions - totalCorrect;
    
    return {
      totalCorrect,
      totalQuestions,
      failedQuestions,
      successRate
    };
  };

  // Find strongest and weakest categories
  const getCategoryInsights = () => {
    const categories = [
      { id: 'addSubtract', name: 'חיבור וחיסור', emoji: '🧮' },
      { id: 'multiplyDivide', name: 'כפל וחילוק', emoji: '🔢' },
      { id: 'decimalStructure', name: 'מבנה עשרוני', emoji: '💯' },
      { id: 'wordProblems', name: 'בעיות מילוליות', emoji: '🤔' },
      { id: 'dataAnalysis', name: 'חקר נתונים', emoji: '📈' },
      { id: 'shapes', name: 'צורות הנדסיות', emoji: '📐' },
      { id: 'measurements', name: 'מדידות', emoji: '⚖️' },
      { id: 'orderOfOperations', name: 'סדר פעולות', emoji: '🔢' }
    ];

    const categoryRates = categories.map(cat => {
      const stats = categoryStats[cat.id] || { correct: 0, total: 0 };
      const rate = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
      return { ...cat, ...stats, rate };
    }).filter(cat => cat.total > 0);

    categoryRates.sort((a, b) => b.rate - a.rate);

    return {
      strongest: categoryRates[0] || null,
      weakest: categoryRates[categoryRates.length - 1] || null,
      allCategories: categoryRates
    };
  };

  // Calculate days until exam and progress
  const examDate = new Date('2026-05-27');
  const today = new Date();
  const daysUntilExam = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
  
  const TARGET_PER_CATEGORY = 30;
  const totalTarget = TARGET_PER_CATEGORY * 8; // 8 categories
  const stats = calculateOverallStats();
  const insights = getCategoryInsights();
  
  // Calculate recommended daily practice
  const remainingToTarget = totalTarget - stats.totalCorrect;
  const recommendedDaily = daysUntilExam > 0 ? Math.ceil(remainingToTarget / daysUntilExam) : 0;

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
      title: getGenderText('לומדת מהירה', userData?.gender),
      description: 'פתרת 5 שאלות!',
      emoji: '🚀',
      condition: (s, st, q) => q >= 5,
      color: '#ff6b9d'
    },
    {
      id: 'dedicated',
      title: getGenderText('מסורה', userData?.gender),
      description: 'פתרת 10 שאלות!',
      emoji: '💪',
      condition: (s, st, q) => q >= 10,
      color: '#a78bfa'
    },
    {
      id: 'math_master',
      title: getGenderText('מלכת החשבון', userData?.gender),
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
      title: getGenderText('בלתי ניתנת לעצירה', userData?.gender),
      description: 'רצף של 10 תשובות נכונות!',
      emoji: '🌟',
      condition: (s, st, q) => st >= 10,
      color: '#a78bfa'
    },
    {
      id: 'score_50',
      title: getGenderText('אספנית נקודות', userData?.gender),
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
      title: getGenderText('אלופה', userData?.gender),
      description: 'צברת 200 נקודות!',
      emoji: '🥇',
      condition: (s, st, q) => s >= 200,
      color: '#fbbf24'
    },
    {
      id: 'score_500',
      title: getGenderText('גאונית מתמטיקה', userData?.gender),
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
        <div className="achievements-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h2 className="achievements-title" style={{ margin: 0 }}>🏆 ההישגים שלי</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
              }}
              onClick={() => {
                if (window.confirm(getGenderText('האם אתה בטוח שברצונך לאפס את כל הנתונים?', userData?.gender))) {
                  localStorage.removeItem('quiz_categoryStats');
                  localStorage.removeItem('quiz_score');
                  localStorage.removeItem('quiz_streak');
                  localStorage.removeItem('quiz_questionCount');
                  localStorage.removeItem('quiz_history');
                  localStorage.removeItem('quiz_achievements');
                  window.location.reload();
                }
              }}
            >
              🔄 איפוס נתונים
            </button>
            <button className="close-button" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="achievements-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 סקירה כללית
          </button>
          <button 
            className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            📈 פירוט נושאים
          </button>
          <button 
            className={`tab ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            🏆 תגי הצטיינות
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div 
            className="tab-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Main Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-emoji">📝</div>
                <div className="stat-value">{stats.totalQuestions}</div>
                <div className="stat-label">סה"כ תרגילים</div>
              </div>
              
              <div className="stat-card success">
                <div className="stat-emoji">✅</div>
                <div className="stat-value">{stats.totalCorrect}</div>
                <div className="stat-label">תשובות נכונות</div>
              </div>
              
              <div className="stat-card error">
                <div className="stat-emoji">❌</div>
                <div className="stat-value">{stats.failedQuestions}</div>
                <div className="stat-label">טעויות</div>
              </div>
              
              <div className="stat-card percentage">
                <div className="stat-emoji">📊</div>
                <div className="stat-value">{stats.successRate}%</div>
                <div className="stat-label">אחוז הצלחה</div>
              </div>
              
              <div className="stat-card streak">
                <div className="stat-emoji">🔥</div>
                <div className="stat-value">{streak}</div>
                <div className="stat-label">רצף נוכחי</div>
              </div>
              
              <div className="stat-card points">
                <div className="stat-emoji">⭐</div>
                <div className="stat-value">{score}</div>
                <div className="stat-label">נקודות</div>
              </div>
            </div>

            {/* Progress to Goal */}
            <div className="goal-section">
              <h3 className="section-title">🎯 התקדמות ליעד</h3>
              <div className="goal-card">
                <div className="goal-info">
                  <span className="goal-label">יעד: 210 תרגילים נכונים (30 בכל נושא)</span>
                  <span className="goal-value">{stats.totalCorrect} / 210</span>
                </div>
                <div className="goal-progress-bar">
                  <motion.div
                    className="goal-progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (stats.totalCorrect / totalTarget) * 100)}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <div className="goal-percentage">
                  {Math.round((stats.totalCorrect / totalTarget) * 100)}% מהיעד
                </div>
              </div>
            </div>

            {/* Exam Countdown & Recommendation */}
            <div className="exam-section">
              <div className="exam-card">
                <div className="exam-icon">⏰</div>
                <div className="exam-content">
                  <h4>זמן עד המבחן</h4>
                  <div className="exam-days">{daysUntilExam} ימים</div>
                </div>
              </div>
              
              {remainingToTarget > 0 && (
                <div className="recommendation-card">
                  <div className="recommendation-icon">💡</div>
                  <div className="recommendation-content">
                    <h4>המלצה יומית</h4>
                    <p>{getGenderText('כדי להגיע ליעד, תרגלי', userData?.gender)} <strong>{recommendedDaily}</strong> תרגילים ביום</p>
                  </div>
                </div>
              )}
            </div>

            {/* Insights */}
            {insights.strongest && insights.weakest && (
              <div className="insights-section">
                <h3 className="section-title">💪 נקודות חוזק וחולשה</h3>
                <div className="insights-grid">
                  <div className="insight-card strong">
                    <div className="insight-emoji">{insights.strongest.emoji}</div>
                    <h4>{getGenderText('הכי חזקה ב:', userData?.gender)}</h4>
                    <p className="insight-category">{insights.strongest.name}</p>
                    <p className="insight-rate">{Math.round(insights.strongest.rate)}% הצלחה</p>
                  </div>
                  
                  <div className="insight-card weak">
                    <div className="insight-emoji">{insights.weakest.emoji}</div>
                    <h4>כדאי להתמקד ב:</h4>
                    <p className="insight-category">{insights.weakest.name}</p>
                    <p className="insight-rate">{Math.round(insights.weakest.rate)}% הצלחה</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <motion.div 
            className="tab-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="section-title">📚 פירוט לפי נושאים</h3>
            <div className="categories-list">
              {insights.allCategories.map((cat, index) => (
                <motion.div
                  key={cat.id}
                  className="category-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="category-header">
                    <span className="category-emoji">{cat.emoji}</span>
                    <span className="category-name">{cat.name}</span>
                  </div>
                  
                  <div className="category-stats">
                    <div className="category-numbers">
                      <span className="correct-count" title="תשובות נכונות">
                        <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>נכונות: </span>
                        ✅ {cat.correct}
                      </span>
                      <span className="total-count" title="סה״כ שאלות">
                        <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>סה״כ: </span>
                        📝 {cat.total}
                      </span>
                      <span className="rate-badge" style={{
                        background: cat.rate >= 80 ? '#10b981' : cat.rate >= 60 ? '#f59e0b' : '#ef4444'
                      }} title="אחוז הצלחה">
                        <span style={{ fontSize: '0.75rem', opacity: 0.9, marginLeft: '4px' }}>הצלחה:</span>
                        {Math.round(cat.rate)}%
                      </span>
                    </div>
                    
                    <div className="category-progress-bar">
                      <motion.div
                        className="category-progress-fill"
                        style={{
                          background: cat.rate >= 80 ? '#10b981' : cat.rate >= 60 ? '#f59e0b' : '#ef4444'
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (cat.correct / TARGET_PER_CATEGORY) * 100)}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                      />
                    </div>
                    
                    <div className="category-goal">
                      <span>יעד: {cat.correct} / {TARGET_PER_CATEGORY}</span>
                      <span style={{ fontWeight: 'bold', color: cat.correct >= TARGET_PER_CATEGORY ? '#10b981' : '#667eea' }}>
                        {Math.round((cat.correct / TARGET_PER_CATEGORY) * 100)}% מהיעד
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <motion.div 
            className="tab-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
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
        )}
      </motion.div>
    </>
  );
};

export default Achievements;
