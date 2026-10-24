import React, { useEffect, useState } from 'react';
import App from '../App';
import LoginScreen from './LoginScreen';
import { isCloudConfigured, onUserChanged } from '../services/firebase';
import { startSync, stopSync, GUEST_KEY } from '../services/cloudSync';
import { subscribeContent, checkIsAdmin } from '../services/contentSync';
import { resolveMyClass, readLocalClass } from '../services/classSync';
import { readPendingClass } from '../data/classes';
import { trackVisit } from '../services/analytics';
import { IS_TEST_ENV } from '../services/env';
import { startSession, endSession } from '../services/sessions';
import './LoginScreen.css';

// בסביבת הבדיקות אין מצב אורח - נכנסים רק עם חשבון
const ALLOW_GUEST = !IS_TEST_ENV;

const readGuest = () => {
  if (!ALLOW_GUEST) return false;
  try {
    return localStorage.getItem(GUEST_KEY) === '1';
  } catch {
    return false;
  }
};

// מחליט מה להציג: מסך התחברות, טעינה מהענן, או האפליקציה עצמה
const AuthGate = () => {
  const [state, setState] = useState(isCloudConfigured ? 'checking' : 'local');
  const [user, setUser] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [classId, setClassId] = useState(() => readLocalClass() || readPendingClass());
  const [loginMode, setLoginMode] = useState(null); // 'signup' - כשמגיעים מתזכורת ההרשמה

  // שאלות שנוספו בממשק הניהול - נטענות לכולם (גם בלי התחברות)
  useEffect(() => (isCloudConfigured ? subscribeContent() : undefined), []);

  useEffect(() => {
    if (!isCloudConfigured) return undefined;
    return onUserChanged(async (u) => {
      trackVisit(Boolean(u));
      if (!u) {
        endSession();
        stopSync();
        setUser(null);
        setIsAdmin(false);
        setClassId(readPendingClass());
        setState(readGuest() ? 'guest' : 'login');
        return;
      }
      setState('syncing');
      try {
        await startSync(u);
        setSyncError(null);
      } catch (err) {
        // בלי חיבור / חסימה בכללים - ממשיכים עם מה שיש במכשיר
        console.error('Cloud sync failed', err);
        setSyncError(err?.code === 'PERMISSION_DENIED' || /permission/i.test(err?.message || '')
          ? 'Firebase חוסם את השמירה - צריך לפרסם את כללי האבטחה (database.rules.json)'
          : 'לא הצלחנו להתחבר לענן - ההתקדמות נשמרת כרגע רק במכשיר');
      }
      startSession(u.uid);
      setIsAdmin(await checkIsAdmin(u.uid));
      // בלי "ראיתי את מסך הפתיחה" אחרי הסנכרון = משתמש/ת חדש/ה (אין התקדמות בענן)
      let isNew = false;
      try {
        isNew = !localStorage.getItem('english_hasSeenWelcome');
      } catch {
        // ignore
      }
      setClassId(await resolveMyClass(u.uid, isNew));
      setUser(u);
      setState('ready');
    });
  }, []);

  if (state === 'checking' || state === 'syncing') {
    return (
      <div className="App">
        <div className="auth-loading">
          <div className="spinner">⭐</div>
          {state === 'syncing' ? 'טוענים את ההתקדמות שלך...' : 'רגע...'}
        </div>
      </div>
    );
  }

  if (state === 'login') {
    return (
      <div className="App">
        <LoginScreen
          initialMode={loginMode || (readPendingClass() ? 'signup' : null)}
          allowGuest={ALLOW_GUEST}
          onGuest={() => {
            try {
              localStorage.setItem(GUEST_KEY, '1');
            } catch {
              // ignore
            }
            setState('guest');
          }}
        />
      </div>
    );
  }

  return (
    <App
      key={user?.uid || 'local'}
      authUser={user}
      cloudEnabled={isCloudConfigured}
      syncError={syncError}
      isAdmin={isAdmin}
      classId={classId || undefined}
      isGuest={state === 'guest'}
      onRequestSignup={() => {
        try {
          localStorage.removeItem(GUEST_KEY);
        } catch {
          // ignore
        }
        setLoginMode('signup');
        setState('login');
      }}
    />
  );
};

export default AuthGate;
