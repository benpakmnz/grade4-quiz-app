import React from 'react';
import { motion } from 'framer-motion';
import './WelcomeDialog.css';
import { getGenderText } from '../utils/genderText';
import { TARGET_PER_CATEGORY } from '../data/categories';
import { SUBJECTS, SUBJECT_IDS, getDaysUntilSubjectExam, examCountdownText } from '../data/subjects';

const WelcomeDialog = ({ onClose, userData }) => {
  console.log('WelcomeDialog - userData:', userData);
  
  return (
    <motion.div
      className="welcome-dialog-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="welcome-dialog-content"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="welcome-dialog-header">
          <h2>🎯 {getGenderText('ברוכה הבאה', userData?.gender)} {userData?.name}!</h2>
          <div className="welcome-character">{userData?.character?.emoji}</div>
        </div>

        <div className="welcome-dialog-body">
          <div className="welcome-section">
            <div className="welcome-icon">📝</div>
            <h3>אנגלית וחשבון</h3>
            <p>
              🇬🇧 <strong>אנגלית:</strong> אוצר מילים, דקדוק, הבנת הנקרא, הבנת הנשמע וכתיבה.
              🔊 {getGenderText('לחצי', userData?.gender)} על כפתור הרמקול כדי לשמוע איך אומרים.
              <br />
              🔢 <strong>חשבון:</strong> מספרים עד המיליון, ארבע פעולות, שברים וגאומטריה - עם הסבר "איך פותרים?" בכל נושא.
              <br />
              {getGenderText('בחרי', userData?.gender)} מקצוע בראש דף הבית. <strong>היעד: 100% בכל נושא!</strong>
            </p>
          </div>

          <div className="welcome-section">
            <div className="welcome-icon">💪</div>
            <h3>זה בסדר לטעות!</h3>
            <p>
              טעויות הן חלק מהלמידה - זה אפילו טוב!
              <br />
              הכי חשוב ללמוד מהטעויות ולהמשיך לתרגל.
            </p>
          </div>

          <div className="welcome-section highlight">
            <div className="welcome-icon">⏰</div>
            <h3>זמן עד המבחנים</h3>
            <p>
              {SUBJECT_IDS.filter(id => getDaysUntilSubjectExam(id) >= 0).map(id => (
                <React.Fragment key={id}>
                  {SUBJECTS[id].emoji} {SUBJECTS[id].examName}: <strong>{examCountdownText(getDaysUntilSubjectExam(id))}</strong>
                  <br />
                </React.Fragment>
              ))}
              היעד: <strong>{TARGET_PER_CATEGORY} תשובות נכונות בכל נושא</strong> = 100% מוכנות!
            </p>
          </div>

          <div className="welcome-section success">
            <div className="welcome-icon">🎯</div>
            <h3>המפתח להצלחה</h3>
            <p>
              💪 <strong>תרגול קבוע</strong> - {getGenderText('תרגלי', userData?.gender)} כל יום קצת
              &nbsp;&nbsp;|&nbsp;&nbsp;
              🎯 <strong>{getGenderText('התמקדי', userData?.gender)} בנושאים החלשים</strong>
              &nbsp;&nbsp;|&nbsp;&nbsp;
              🌟 <strong>{getGenderText('אל תוותרי', userData?.gender)}</strong> - כל תרגיל מקרב {getGenderText('אותך', userData?.gender)} להצלחה!
            </p>
          </div>
        </div>

        <div className="welcome-dialog-footer">
          <button className="welcome-start-button" onClick={onClose}>
            {getGenderText('בואי נתחיל', userData?.gender)}! 🚀
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeDialog;
