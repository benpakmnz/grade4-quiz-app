import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithGoogle, signInWithUsername, signUpWithUsername, describeAuthError } from '../services/firebase';
import { validateUsername, validatePassword, USERNAME_MAX } from '../utils/username';
import './WelcomeScreen.css';
import './LoginScreen.css';

const GoogleLogo = () => (
  <svg className="google-logo" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);

// טופס שם משתמש + סיסמה (כניסה / הרשמה)
const UsernameForm = ({ busy, setBusy, setError, initialMode = 'signin' }) => {
  const [mode, setMode] = useState(initialMode); // signin | signup
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const problem = validateUsername(username) || validatePassword(password)
      || (mode === 'signup' && password !== confirm ? 'הסיסמאות לא זהות' : null);
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (mode === 'signup') await signUpWithUsername(username, password);
      else await signInWithUsername(username, password);
      // AuthGate ממשיך מכאן
    } catch (err) {
      setError(describeAuthError(err));
      setBusy(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setError(null);
    setConfirm('');
  };

  return (
    <form className="username-form" onSubmit={submit}>
      <div className="login-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={mode === 'signin'}
          className={`login-tab ${mode === 'signin' ? 'active' : ''}`} onClick={() => switchMode('signin')}>
          כבר יש לי משתמש
        </button>
        <button type="button" role="tab" aria-selected={mode === 'signup'}
          className={`login-tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => switchMode('signup')}>
          הרשמה חדשה ✨
        </button>
      </div>

      <label className="login-label" htmlFor="login-username">שם משתמש</label>
      <input
        id="login-username"
        className="login-input"
        value={username}
        onChange={e => setUsername(e.target.value)}
        maxLength={USERNAME_MAX}
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="למשל: noa_10"
      />
      {mode === 'signup' && (
        <span className="login-help">3-15 תווים: אותיות בעברית או באנגלית, מספרים, _ או -</span>
      )}

      <label className="login-label" htmlFor="login-password">סיסמה</label>
      <div className="password-row">
        <input
          id="login-password"
          className="login-input"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          dir="ltr"
          placeholder="לפחות 6 תווים"
        />
        <button type="button" className="show-password" onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'הסתרת הסיסמה' : 'הצגת הסיסמה'}>
          {showPassword ? '🙈' : '👁️'}
        </button>
      </div>

      {mode === 'signup' && (
        <>
          <label className="login-label" htmlFor="login-confirm">שוב את הסיסמה</label>
          <input
            id="login-confirm"
            className="login-input"
            type={showPassword ? 'text' : 'password'}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            autoComplete="new-password"
            dir="ltr"
          />
          <span className="login-help">💡 כדאי לכתוב את השם והסיסמה על דף ולשמור - אין דרך לשחזר סיסמה בלי אימייל</span>
        </>
      )}

      <button type="submit" className="start-button login-submit" disabled={busy}>
        {busy ? 'רגע...' : mode === 'signup' ? 'יצירת משתמש 🚀' : 'כניסה 🚀'}
      </button>
    </form>
  );
};

const LoginScreen = ({ onGuest, initialMode = null, allowGuest = true }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [showUsername, setShowUsername] = useState(initialMode === 'signup');

  const google = async () => {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(describeAuthError(err));
      setBusy(false);
    }
  };

  return (
    <div className="welcome-screen">
      <motion.div
        className="welcome-card login-card"
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <motion.h1
          className="welcome-title"
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          👋 ברוכים הבאים!
        </motion.h1>
        <p className="welcome-subtitle">מתכוננים למבחני המיפוי - אנגלית וחשבון 📚</p>

        {initialMode === 'signup' && (
          <p className="login-carry">✅ כל מה שכבר תרגלת במכשיר הזה יעבור לחשבון החדש</p>
        )}
        <p className="login-explain">
          מתחברים פעם אחת, וכל ההתקדמות נשמרת -
          <br />
          אפשר להמשיך לתרגל מכל מחשב, טאבלט או טלפון.
        </p>

        <motion.button
          className="google-button"
          onClick={google}
          disabled={busy}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <GoogleLogo />
          התחברות עם Google
        </motion.button>

        <div className="login-divider"><span>או</span></div>

        {!showUsername ? (
          <button className="username-toggle" onClick={() => { setShowUsername(true); setError(null); }} disabled={busy}>
            👤 כניסה עם שם משתמש וסיסמה
          </button>
        ) : (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <UsernameForm busy={busy} setBusy={setBusy} setError={setError} initialMode={initialMode || 'signin'} />
            </motion.div>
          </AnimatePresence>
        )}

        {error && <div className="login-error">⚠️ {error}</div>}

        {allowGuest ? (
          <button className="guest-link" onClick={onGuest} disabled={busy}>
            להמשיך בלי התחברות (ההתקדמות תישמר רק במכשיר הזה)
          </button>
        ) : (
          <p className="login-test-note">🧪 בסביבת הבדיקות נכנסים רק עם חשבון (Google או שם משתמש וסיסמה)</p>
        )}
      </motion.div>
    </div>
  );
};

export default LoginScreen;
