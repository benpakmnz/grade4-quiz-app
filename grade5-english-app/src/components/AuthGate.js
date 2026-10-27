import React, { useEffect, useState } from 'react';
import App from '../App';
import LoginScreen from './LoginScreen';
import { isCloudConfigured, onUserChanged, signOut } from '../services/firebase';
import { startSync, stopSync, GUEST_KEY } from '../services/cloudSync';
import { checkIsAdmin, checkTeacherOf } from '../services/contentSync';
import { resolveMyClass, readLocalClass } from '../services/classSync';
import { readPendingClass } from '../data/classes';
import { trackVisit } from '../services/analytics';
import { IS_TEST_ENV } from '../services/env';
import { startSession, endSession } from '../services/sessions';
import './LoginScreen.css';

// בסביבת הבדיקות אין מצב אורח - והיא פתוחה רק למנהלים (גם כללי האבטחה חוסמים את כל השאר)
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
  const [teacherOf, setTeacherOf] = useState(null); // הכיתה שהמשתמש/ת מלמד/ת
  const [classId, setClassId] = useState(() => readLocalClass() || readPendingClass());
  const [loginMode, setLoginMode] = useState(null); // 'signup' - כשמגיעים מתזכורת ההרשמה


  useEffect(() => {
    if (!isCloudConfigured) return undefined;
    return onUserChanged(async (u) => {
      if (!IS_TEST_ENV) trackVisit(Boolean(u));
      if (!u) {
        endSession();
        stopSync();
        setUser(null);
        setIsAdmin(false);
        setTeacherOf(null);
        setClassId(readPendingClass());
        setState(readGuest() ? 'guest' : 'login');
        return;
      }
      // סביבת הבדיקות: מי שאינו מנהל לא נכנס בכלל (בלי סנכרון ובלי רישום ביקור)
      if (IS_TEST_ENV) {
        if (!(await checkIsAdmin(u.uid))) {
          setUser(u);
          setState('locked');
          return;
        }
        trackVisit(true);
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
      setTeacherOf(await checkTeacherOf(u.uid));
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

  if (state === 'locked') {
    return (
      <div className="App">
        <div className="auth-loading auth-locked">
          <div className="spinner">🔒</div>
          <p>סביבת הבדיקות סגורה</p>
          <p className="auth-locked-text">
            זו גרסת ניסוי של האפליקציה, והיא פתוחה רק למנהלים.
            <br />
            האפליקציה עצמה נמצאת כאן:
          </p>
          <a className="auth-locked-link" href="https://grade5-english-app.vercel.app">grade5-english-app.vercel.app</a>
          <button className="auth-locked-out" onClick={() => signOut()}>התנתקות</button>
        </div>
      </div>
    );
  }

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
      teacherOf={teacherOf}
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
