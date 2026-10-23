import React from 'react';
import { motion } from 'framer-motion';
import { SUBJECTS, getDaysUntilSubjectExam, examCountdownText } from '../data/subjects';
import { TARGET_PER_CATEGORY } from '../data/categories';
import { getGenderText } from '../utils/genderText';
import './SubjectHub.css';

// עיצוב לכל מקצוע: צבעים וקישוטים שמרחפים בכרטיס
const LOOK = {
  english: {
    tagline: 'מילים, דקדוק, קריאה והקשבה',
    floaters: ['A', 'b', 'C', '🔤', '📖', '🎧'],
    className: 'hub-card-english'
  },
  hebrew: {
    tagline: 'שורשים, פעלים, זמנים ועוד',
    floaters: ['א', 'ב', 'ש', '📝', '✏️', '📚'],
    className: 'hub-card-hebrew'
  },
  math: {
    tagline: 'מספרים, שברים וגאומטריה',
    floaters: ['+', '÷', '×', '½', '📐', '🔢'],
    className: 'hub-card-math'
  }
};

/** כמה מוכנים במקצוע: תשובות נכונות מתוך היעד (30 בכל נושא) */
export const subjectReadiness = (subjectId, categoryStats = {}) => {
  const cats = SUBJECTS[subjectId].categories;
  const done = cats.reduce((sum, c) => sum + Math.min(TARGET_PER_CATEGORY, categoryStats[c.id]?.correct || 0), 0);
  return Math.round((done / (TARGET_PER_CATEGORY * cats.length)) * 100);
};

const examDateText = (date) => `${date.getDate()}.${date.getMonth() + 1}`;

// דף הבחירה: לאן הולכים היום - אנגלית או חשבון?
const SubjectHub = ({ subjects, enabled = subjects, userData, categoryStats, onPick, lastSubject, onEscapeRoom, escapeInvites = 0 }) => {
  const g = (t) => getGenderText(t, userData?.gender);

  return (
    <div className="subject-hub">
      <motion.div
        className="hub-hello"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          className="hub-buddy"
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        >
          {userData?.character?.emoji || '🙂'}
        </motion.div>
        <h1 className="hub-title">היי {userData?.name}! 👋</h1>
        <p className="hub-subtitle">{g('במה בא לך להתאמן היום?')}</p>
      </motion.div>

      {onEscapeRoom && escapeInvites > 0 && (
        <motion.button
          className="hub-invite-banner"
          onClick={onEscapeRoom}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: [1, 1.03, 1] }}
          transition={{ scale: { repeat: Infinity, duration: 1.8 } }}
        >
          <span aria-hidden="true">📩</span>
          <span><b>הוזמנת לאתגר מפצחי הכספות!</b> החברים מהצוות מחכים לך</span>
          <span className="hub-invite-go">הצטרפות ←</span>
        </motion.button>
      )}

      <div className="hub-cards">
        {subjects.map((id, i) => {
          const s = SUBJECTS[id];
          const look = LOOK[id];
          const locked = !enabled.includes(id);
          const days = getDaysUntilSubjectExam(id);
          const ready = subjectReadiness(id, categoryStats);
          const topics = s.categories.filter(c => !c.testLength).length;
          return (
            <motion.button
              key={id}
              className={`hub-card ${look.className} ${!locked && lastSubject === id ? 'last' : ''} ${locked ? 'locked' : ''}`}
              onClick={() => !locked && onPick(id)}
              disabled={locked}
              aria-disabled={locked}
              initial={{ opacity: 0, y: 40, rotate: i % 2 ? 2 : -2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 0.15 + i * 0.15, type: 'spring', stiffness: 140, damping: 14 }}
              whileHover={locked ? {} : { y: -6, scale: 1.02 }}
              whileTap={locked ? {} : { scale: 0.97 }}
              aria-label={locked ? `${s.name} - בקרוב` : `${s.name} - ${s.examName}`}
            >
              <span className="hub-floaters" aria-hidden="true">
                {look.floaters.map((f, k) => (
                  <motion.span
                    key={k}
                    className={`hub-floater f${k}`}
                    animate={locked ? {} : { y: [0, k % 2 ? 10 : -10, 0], rotate: [0, k % 2 ? -12 : 12, 0] }}
                    transition={{ repeat: Infinity, duration: 3 + k * 0.4, ease: 'easeInOut' }}
                  >
                    {f}
                  </motion.span>
                ))}
              </span>

              {!locked && lastSubject === id && <span className="hub-last">{g('המשיכי מכאן')} ✨</span>}
              {locked && <span className="hub-soon-badge">🔒 בקרוב</span>}

              <span className="hub-emoji">{s.emoji}</span>
              <span className="hub-name">{s.name}</span>
              <span className="hub-tagline">{look.tagline}</span>

              {locked ? (
                <>
                  <span className="hub-soon">בקרוב! 🚧</span>
                  <span className="hub-soon-text">תרגולים חדשים בדרך - עוד מעט זה פה ✨</span>
                </>
              ) : (
                <>
                  <span className="hub-meta">
                    {days >= 0 && <span className="hub-pill" title={s.examName}>⏰ מבחן ב-{examDateText(s.examDate)}: <b>{examCountdownText(days)}</b></span>}
                    <span className="hub-pill">📚 {topics} נושאים</span>
                  </span>

                  <span className="hub-progress" aria-label={`מוכנות ${ready}%`}>
                    <span className="hub-progress-label">
                      <span>מוכנות למבחן</span>
                      <b>{ready}%</b>
                    </span>
                    <span className="hub-bar"><span style={{ width: `${Math.max(ready, 3)}%` }} /></span>
                  </span>

                  <span className="hub-go">{g('יאללה, בואי! 🚀')}</span>
                </>
              )}
            </motion.button>
          );
        })}
      </div>

      {onEscapeRoom && (
        <motion.button
          className="hub-escape"
          onClick={onEscapeRoom}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="hub-escape-icon" aria-hidden="true">🔐</span>
          {escapeInvites > 0 && <span className="hub-escape-invite">📩 {escapeInvites === 1 ? 'הזמנה חדשה!' : `${escapeInvites} הזמנות!`}</span>}
          <span className="hub-escape-text">
            <b>אתגר מפצחי הכספות</b>
            <span>עם חברים: פותרים יחד ופותחים את הכספת</span>
          </span>
          <span className="hub-escape-go" aria-hidden="true">←</span>
        </motion.button>
      )}
    </div>
  );
};

export default SubjectHub;
