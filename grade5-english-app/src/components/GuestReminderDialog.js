import React from 'react';
import { motion } from 'framer-motion';
import { getGenderText } from '../utils/genderText';
import './GuestReminderDialog.css';

// הודעה ידידותית לאורחים שחוזרים לאפליקציה: כדאי להירשם כדי שההתקדמות תישמר
const GuestReminderDialog = ({ userData, score, onSignup, onLater }) => {
  const g = (t) => getGenderText(t, userData?.gender);
  const name = userData?.name || '';

  const reasons = [
    { icon: '💾', text: g('כל הנקודות וההישגים שלך יישמרו - גם אם המכשיר יתקלקל או יימחק') },
    { icon: '📱', text: g('תוכלי להמשיך לתרגל מכל מקום: מחשב, טאבלט או טלפון') },
    { icon: '🔑', text: 'לא צריך אימייל! מספיק שם משתמש וסיסמה פשוטים' }
  ];

  return (
    <motion.div className="guest-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="guest-dialog"
        initial={{ scale: 0.7, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      >
        <motion.div
          className="guest-character"
          animate={{ rotate: [0, -10, 10, -6, 0] }}
          transition={{ duration: 1.2, delay: 0.3 }}
        >
          {userData?.character?.emoji || '🦄'}
        </motion.div>

        <h2 className="guest-title">{g(`היי ${name}! טוב שחזרת`)} 👋</h2>

        <div className="guest-warning">
          <span className="guest-warning-icon">📱</span>
          <span>
            {score > 0
              ? <>{g('כרגע')} <b>{score} {g('הנקודות שצברת')}</b> {g('שמורות רק במכשיר הזה.')}</>
              : g('כרגע ההתקדמות שלך שמורה רק במכשיר הזה.')}
          </span>
        </div>

        <h3 className="guest-subtitle">{g('אם תירשמי:')}</h3>
        <ul className="guest-reasons">
          {reasons.map((r, i) => (
            <motion.li key={r.icon} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.15 }}>
              <span className="guest-reason-icon">{r.icon}</span>
              <span>{r.text}</span>
            </motion.li>
          ))}
        </ul>

        <p className="guest-note">
          ⏱️ {g('זה לוקח פחות מדקה, וכל מה שכבר עשית עובר איתך!')}
          <br />
          👨‍👩‍👧 {g('כדאי לבקש מאמא או מאבא לעזור לשמור את הסיסמה.')}
        </p>

        <motion.button
          className="guest-signup"
          onClick={onSignup}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        >
          {g('🚀 בואי נירשם!')}
        </motion.button>
        <button className="guest-later" onClick={onLater}>אולי אחר כך</button>
      </motion.div>
    </motion.div>
  );
};

export default GuestReminderDialog;
