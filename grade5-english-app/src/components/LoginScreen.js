import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { signInWithGoogle, describeAuthError } from '../services/firebase';
import './WelcomeScreen.css';
import './LoginScreen.css';

const LoginScreen = ({ onGuest }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const login = async () => {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
      // AuthGate ממשיך מכאן (onAuthStateChanged)
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
          🇬🇧 Welcome!
        </motion.h1>
        <p className="welcome-subtitle">מתכוננים למבחן המיפוי באנגלית 📚</p>

        <p className="login-explain">
          מתחברים פעם אחת עם Google, וכל ההתקדמות נשמרת -
          <br />
          אפשר להמשיך לתרגל מכל מחשב, טאבלט או טלפון.
        </p>

        <motion.button
          className="google-button"
          onClick={login}
          disabled={busy}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <svg className="google-logo" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
          </svg>
          {busy ? 'מתחברים...' : 'התחברות עם Google'}
        </motion.button>

        {error && <div className="login-error">⚠️ {error}</div>}

        <button className="guest-link" onClick={onGuest} disabled={busy}>
          להמשיך בלי התחברות (ההתקדמות תישמר רק במכשיר הזה)
        </button>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
