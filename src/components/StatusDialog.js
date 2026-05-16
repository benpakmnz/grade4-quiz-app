import React from 'react';
import { motion } from 'framer-motion';
import './StatusDialog.css';
import { getGenderText } from '../utils/genderText';

const StatusDialog = ({ onClose, userData, categoryStats }) => {
  const TARGET_PER_CATEGORY = 30;
  
  // Calculate overall progress
  const calculateOverallStats = () => {
    let totalCorrect = 0;
    let totalQuestions = 0;
    
    Object.values(categoryStats).forEach(stat => {
      totalCorrect += stat.correct;
      totalQuestions += stat.total;
    });
    
    const successRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const overallProgress = Math.round((totalCorrect / (TARGET_PER_CATEGORY * 7)) * 100);
    
    return {
      totalCorrect,
      totalQuestions,
      successRate,
      overallProgress
    };
  };

  // Find categories that need attention
  const getCategoryRecommendations = () => {
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

    const categoryProgress = categories.map(cat => {
      const stats = categoryStats[cat.id] || { correct: 0, total: 0 };
      const progress = Math.round((stats.correct / TARGET_PER_CATEGORY) * 100);
      const rate = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      return { ...cat, ...stats, progress, rate };
    });

    // Sort by progress (ascending) to find weakest
    const sorted = [...categoryProgress].sort((a, b) => a.progress - b.progress);
    
    return {
      weakest: sorted.slice(0, 3), // 3 weakest categories
      strongest: sorted.slice(-2), // 2 strongest categories
      notStarted: sorted.filter(cat => cat.total === 0)
    };
  };

  const stats = calculateOverallStats();
  const recommendations = getCategoryRecommendations();
  
  // Calculate days until exam
  const examDate = new Date('2026-05-27');
  const today = new Date();
  const daysUntilExam = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
  
  // Calculate recommended daily practice
  const remainingToTarget = (TARGET_PER_CATEGORY * 8) - stats.totalCorrect;
  const recommendedDaily = daysUntilExam > 0 ? Math.ceil(remainingToTarget / daysUntilExam) : 0;

  return (
    <motion.div
      className="status-dialog-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="status-dialog-content"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="status-dialog-header">
          <h2>👋 {getGenderText('שלום שוב', userData?.gender)} {userData?.name}!</h2>
          <p className="status-subtitle">כל ההתקדמות שלך נשמרה ✅</p>
          <div className="status-character">{userData?.character?.emoji}</div>
        </div>

        <div className="status-dialog-body">
          {/* Overall Progress */}
          <div className="status-section main-progress">
            <div className="status-icon">📊</div>
            <h3>{getGenderText('איפה את עומדת', userData?.gender)}?</h3>
            <div className="progress-stats">
              <div className="stat-item">
                <div className="stat-value">{stats.totalCorrect}</div>
                <div className="stat-label">תרגילים נכונים</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.overallProgress}%</div>
                <div className="stat-label">התקדמות כללית</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.successRate}%</div>
                <div className="stat-label">אחוז הצלחה</div>
              </div>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${stats.overallProgress}%` }}></div>
            </div>
          </div>

          {/* Time & Recommendation */}
          <div className="status-section time-section">
            <div className="time-info">
              <div className="status-icon">⏰</div>
              <div>
                <h4>זמן עד המבחן</h4>
                <p className="time-value">{daysUntilExam} ימים</p>
              </div>
            </div>
            {remainingToTarget > 0 && (
              <div className="recommendation-info">
                <div className="status-icon">💡</div>
                <div>
                  <h4>המלצה יומית</h4>
                  <p>{getGenderText('תרגלי', userData?.gender)} <strong>{recommendedDaily}</strong> תרגילים ביום</p>
                </div>
              </div>
            )}
          </div>

          {recommendations.notStarted.length > 0 && (
            <div className="status-section warning-section">
              <div className="status-icon">⚠️</div>
              <h3>{getGenderText('נושאים שעוד לא התחלת', userData?.gender)}</h3>
              <div className="category-list">
                {recommendations.notStarted.map(cat => (
                  <div key={cat.id} className="category-badge not-started">
                    <span>{cat.emoji}</span>
                    <span>{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recommendations.weakest.length > 0 && recommendations.weakest[0].total > 0 && (
            <div className="status-section focus-section">
              <div className="status-icon">🎯</div>
              <h3>{getGenderText('כדאי לך להתמקד ב:', userData?.gender)}</h3>
              <div className="category-recommendations">
                {recommendations.weakest.map(cat => (
                  cat.total > 0 && (
                    <div key={cat.id} className="recommendation-item">
                      <div className="rec-header">
                        <span className="rec-emoji">{cat.emoji}</span>
                        <span className="rec-name">{cat.name}</span>
                      </div>
                      <div className="rec-stats">
                        <span className="rec-progress">{cat.correct}/{TARGET_PER_CATEGORY}</span>
                        <span className="rec-percentage" style={{
                          color: cat.rate >= 80 ? '#10b981' : cat.rate >= 60 ? '#f59e0b' : '#ef4444'
                        }}>
                          {cat.rate}% הצלחה
                        </span>
                      </div>
                      <div className="rec-progress-bar">
                        <div 
                          className="rec-progress-fill" 
                          style={{ 
                            width: `${cat.progress}%`,
                            background: cat.progress >= 80 ? '#10b981' : cat.progress >= 50 ? '#f59e0b' : '#ef4444'
                          }}
                        ></div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {recommendations.strongest.length > 0 && recommendations.strongest[0].total > 0 && (
            <div className="status-section success-section">
              <div className="status-icon">💪</div>
              <h3>{getGenderText('את חזקה ב:', userData?.gender)}</h3>
              <div className="strength-list">
                {recommendations.strongest.map(cat => (
                  cat.total > 0 && (
                    <div key={cat.id} className="strength-item">
                      <span className="strength-emoji">{cat.emoji}</span>
                      <span className="strength-name">{cat.name}</span>
                      <span className="strength-badge">{cat.correct}/{TARGET_PER_CATEGORY}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Motivation */}
          <div className="status-section motivation-section">
            <div className="status-icon">🌟</div>
            <p className="motivation-text">
              {getGenderText('המשיכי', userData?.gender)} כך! כל תרגיל מקרב {getGenderText('אותך', userData?.gender)} להצלחה במבחן! 💪
            </p>
          </div>
        </div>

        <div className="status-dialog-footer">
          <button className="status-continue-button" onClick={onClose}>
            {getGenderText('בואי נמשיך', userData?.gender)}! 🚀
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StatusDialog;
