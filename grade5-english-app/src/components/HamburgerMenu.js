import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SUBJECTS } from '../data/subjects';
import { accountLabel } from '../utils/username';
import { getGenderText } from '../utils/genderText';
import { signOutAndClear, goToSignIn, SIGN_OUT_CONFIRM } from '../services/account';
import './HamburgerMenu.css';

const Item = ({ icon, label, hint, onClick, active, danger }) => (
  <button className={`hm-item ${active ? 'active' : ''} ${danger ? 'danger' : ''}`} onClick={onClick} aria-current={active ? 'true' : undefined}>
    <span className="hm-icon" aria-hidden="true">{icon}</span>
    <span className="hm-label">
      {label}
      {hint && <span className="hm-hint">{hint}</span>}
    </span>
    {active && <span className="hm-check" aria-hidden="true">✓</span>}
  </button>
);

/**
 * תפריט ☰: מעבר בין מקצועות, הישגים והתקדמות, פרופיל, ניהול והתנתקות.
 * כל פעולה סוגרת את התפריט לפני שהיא מתבצעת.
 */
const HamburgerMenu = ({
  userData, authUser, isGuest, cloudEnabled, isAdmin,
  subjects, subject, onPickSubject, onOpenHub,
  onAchievements, onProgress, onEditProfile, onAdmin, onSignUp
}) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const g = (t) => getGenderText(t, userData?.gender);

  // Esc סוגר
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const run = (fn) => () => {
    setOpen(false);
    if (fn) fn();
  };

  const handleSignOut = async () => {
    if (!window.confirm(SIGN_OUT_CONFIRM)) return;
    setBusy(true);
    await signOutAndClear();
  };

  return (
    <>
      <button
        className={`hm-button ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="תפריט"
        aria-expanded={open}
      >
        <span /><span /><span />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="hm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.nav
              className="hm-panel"
              aria-label="תפריט"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="hm-head">
                <span className="hm-avatar">{userData?.character?.emoji || '🙂'}</span>
                <div className="hm-who">
                  <b>{userData?.name}</b>
                  <span>{authUser ? accountLabel(authUser) : isGuest ? g('אורחת - ההתקדמות נשמרת רק במכשיר') : ''}</span>
                </div>
                <button className="hm-close" onClick={() => setOpen(false)} aria-label="סגירה">✕</button>
              </div>

              {subjects.length > 1 && (
                <div className="hm-section">
                  <div className="hm-title">מקצוע</div>
                  {subjects.map(id => (
                    <Item
                      key={id}
                      icon={SUBJECTS[id].emoji}
                      label={SUBJECTS[id].name}
                      active={subject === id}
                      onClick={run(() => onPickSubject(id))}
                    />
                  ))}
                  {onOpenHub && <Item icon="🏠" label="דף הבחירה" onClick={run(onOpenHub)} />}
                </div>
              )}

              <div className="hm-section">
                <div className="hm-title">ההתקדמות שלי</div>
                <Item icon="🏆" label="ההישגים שלי" hint="נקודות, רצפים ותגים" onClick={run(onAchievements)} />
                <Item icon="🌱" label="ההתקדמות שלי" hint="יומן טעויות ועל מה לתרגל - גם להורים" onClick={run(onProgress)} />
              </div>

              <div className="hm-section">
                <div className="hm-title">החשבון שלי</div>
                <Item icon="✏️" label="עריכת פרופיל" hint="שם, דמות וצבע" onClick={run(onEditProfile)} />
                {isAdmin && <Item icon="⚙️" label="ניהול" hint="שאלות, משתמשים ושימוש" onClick={run(onAdmin)} />}
                {cloudEnabled && authUser && (
                  <Item icon="🚪" label={busy ? 'מתנתקים...' : 'התנתקות'} danger onClick={handleSignOut} />
                )}
                {cloudEnabled && !authUser && (
                  <Item
                    icon="✨"
                    label="הרשמה / התחברות"
                    hint={g('כדי לשמור את ההתקדמות ולהמשיך מכל מכשיר')}
                    onClick={run(onSignUp || goToSignIn)}
                  />
                )}
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HamburgerMenu;
