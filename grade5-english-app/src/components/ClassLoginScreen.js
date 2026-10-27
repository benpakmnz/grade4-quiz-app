import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithUsername, describeAuthError } from '../services/firebase';
import './WelcomeScreen.css';
import './LoginScreen.css';
import './ClassLoginScreen.css';

// כניסה דרך הקישור של הכיתה: בוחרים את השם מהרשימה ומקלידים את הסיסמה (6 ספרות) שהמורה נתנה
const ClassLoginScreen = ({ classMeta, onOtherLogin }) => {
  const roster = Object.values(classMeta.roster || {}).sort((a, b) => a.name.localeCompare(b.name, 'he'));
  const [chosen, setChosen] = useState(null);
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e?.preventDefault();
    if (pin.length !== 6 || busy) return;
    setBusy(true);
    setError(null);
    try {
      await signInWithUsername(chosen.username, pin);
    } catch (err) {
      const code = err?.code || '';
      setError(code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/invalid-login-credentials'
        ? 'הסיסמה לא נכונה. נסו שוב, או בקשו מהמורה את הסיסמה.'
        : describeAuthError(err));
      setPin('');
      setBusy(false);
    }
  };

  return (
    <div className="welcome-screen">
      <motion.div className="welcome-card login-card class-login" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <h1 className="welcome-title">🏫 {classMeta.name}</h1>
        {classMeta.school && <p className="welcome-subtitle">{classMeta.school}</p>}

        <AnimatePresence mode="wait">
          {!chosen ? (
            <motion.div key="names" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="cl-title">👋 מי את/ה? לחצו על השם שלכם</p>
              {roster.length === 0 && <p className="cl-empty">עוד אין תלמידים בכיתה. המורה תוסיף אתכם בקרוב 🙂</p>}
              <div className="cl-names">
                {roster.map(s => (
                  <motion.button key={s.username} className="cl-name" whileTap={{ scale: 0.95 }} onClick={() => { setChosen(s); setError(null); }}>
                    {s.name}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.form key="pin" className="cl-pin-form" onSubmit={submit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <p className="cl-title">שלום <b>{chosen.name}</b>! 🔑 מה הסיסמה שלך?</p>
              <input
                className="cl-pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="current-password"
                autoFocus
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="● ● ● ● ● ●"
                aria-label="הסיסמה (6 ספרות)"
              />
              <button type="submit" className="login-submit" disabled={pin.length !== 6 || busy}>{busy ? 'רגע...' : 'כניסה 🚀'}</button>
              <button type="button" className="guest-link" onClick={() => { setChosen(null); setPin(''); setError(null); }}>→ זה לא השם שלי</button>
            </motion.form>
          )}
        </AnimatePresence>

        {error && <div className="login-error">⚠️ {error}</div>}
        <button className="guest-link cl-other" onClick={onOtherLogin}>כניסה בדרך אחרת (Google / שם משתמש)</button>
      </motion.div>
    </div>
  );
};

export default ClassLoginScreen;
