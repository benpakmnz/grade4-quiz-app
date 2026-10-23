import React from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { SUBJECTS } from '../data/subjects';
import { formatClock } from '../data/escapeRoom';
import './EscapeRoom.css';

const dateText = (ts) => {
  const d = new Date(ts);
  return `${d.getDate()}.${d.getMonth() + 1}`;
};

/** רשימת האתגרים שבוצעו: שם הצוות, החברים, וכמה זמן לקח לפצח */
export const ChallengeList = ({ history = [], compact = false, onAgain = null }) => (
  <ul className={`ch-list ${compact ? 'compact' : ''}`}>
    {history.map(h => (
      <li key={h.id} className={`ch-item ${h.opened ? 'opened' : ''}`}>
        <span className="ch-icon" aria-hidden="true">{h.opened ? '🗝️' : '🔐'}</span>
        <span className="ch-main">
          <span className="ch-top">
            <b>{h.team || 'הצוות'}</b>
            <span className="ch-meta">{dateText(h.at)}</span>
          </span>
          <span className={`ch-subject ${['math', 'hebrew'].includes(h.subject) ? h.subject : 'english'}`}>
            {SUBJECTS[h.subject]?.emoji} {SUBJECTS[h.subject]?.name}
          </span>
          <span className="ch-result">
            {h.opened
              ? (h.seconds != null ? <>פוצח ב-<b dir="ltr">{formatClock(h.seconds * 1000)}</b> דקות</> : 'הכספת נפתחה!')
              : `נפתחו ${h.filled} מתוך ${h.total} מנעולים`}
          </span>
          {h.emojis?.length > 0 && (
            <span className="ch-team" aria-label={`${h.emojis.length} חברים בצוות`}>
              {h.emojis.map((e, i) => <span key={i} aria-hidden="true">{e}</span>)}
            </span>
          )}
          {onAgain && h.code && h.emojis?.length > 1 && (
            <button className="ch-again" onClick={() => onAgain(h)}>🔄 אתגר חדש עם הצוות הזה</button>
          )}
        </span>
      </li>
    ))}
  </ul>
);

/** הדיאלוג שנפתח מהמפתח בכותרת */
const EscapeHistoryDialog = ({ stats, onClose, onNew }) => createPortal((
  <motion.div className="ch-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
    <motion.div
      className="ch-dialog"
      role="dialog"
      aria-label="האתגרים שלי"
      initial={{ y: 40, scale: 0.95 }}
      animate={{ y: 0, scale: 1 }}
      onClick={(e) => e.stopPropagation()}
    >
      <button className="ch-close" onClick={onClose} aria-label="סגירה">✕</button>
      <div className="ch-head">
        <span className="ch-key" aria-hidden="true">🗝️<i>{stats.played}</i></span>
        <h2>האתגרים שלי</h2>
        <p>
          {stats.played === 1 ? 'אתגר אחד' : `${stats.played} אתגרים`}
          {stats.opened > 0 && ` · ${stats.opened === 1 ? 'כספת אחת פוצחה' : `${stats.opened} כספות פוצחו`} 🔓`}
        </p>
      </div>
      {stats.history.length > 0
        ? <ChallengeList history={stats.history} />
        : <p className="ch-empty">האתגרים הבאים יופיעו כאן.</p>}
      {onNew && <button className="er-cta" onClick={onNew}>לאתגר הבא 🚀</button>}
    </motion.div>
  </motion.div>
), document.body);

export default EscapeHistoryDialog;
