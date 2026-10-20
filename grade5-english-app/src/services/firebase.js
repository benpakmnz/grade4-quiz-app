// חיבור ל-Firebase (התחברות עם Google או שם משתמש וסיסמה + Realtime Database)
// ההגדרות נקראות ממשתני סביבה בזמן הבנייה (ראו README). בלי הגדרות - האפליקציה עובדת כמו קודם, רק במכשיר.
import { initializeApp } from 'firebase/app';
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, onAuthStateChanged,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile
} from 'firebase/auth';
import { usernameToEmail, normalizeUsername } from '../utils/username';
import { getDatabase } from 'firebase/database';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

// ערכים שהודבקו ב-Vercel עם רווח או ירידת שורה ישברו את החיבור - לכן trim
const env = (value) => (value || '').trim() || undefined;

// פרויקט ה-Firebase של האפליקציה. אלה לא סודות - הם נשלחים לכל דפדפן שפותח את האתר;
// מה שמגן על הנתונים הוא כללי האבטחה (database.rules.json). משתני סביבה REACT_APP_FIREBASE_* גוברים עליהם.
const DEFAULT_CONFIG = {
  apiKey: 'AIzaSyAwT_c-n5yLAH2veGqoJtBZTIj6A5JI3kg',
  authDomain: 'english-practice-87420.firebaseapp.com',
  databaseURL: 'https://english-practice-87420-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'english-practice-87420',
  appId: '1:1064113384725:web:f252cd87b3486c93cd4d1c'
};

// REACT_APP_FIREBASE_DISABLED=true - לעבוד בלי ענן (למשל בפיתוח)
const disabled = env(process.env.REACT_APP_FIREBASE_DISABLED) === 'true';

const firebaseConfig = {
  apiKey: env(process.env.REACT_APP_FIREBASE_API_KEY) || DEFAULT_CONFIG.apiKey,
  authDomain: env(process.env.REACT_APP_FIREBASE_AUTH_DOMAIN) || DEFAULT_CONFIG.authDomain,
  databaseURL: env(process.env.REACT_APP_FIREBASE_DATABASE_URL) || DEFAULT_CONFIG.databaseURL,
  projectId: env(process.env.REACT_APP_FIREBASE_PROJECT_ID) || DEFAULT_CONFIG.projectId,
  appId: env(process.env.REACT_APP_FIREBASE_APP_ID) || DEFAULT_CONFIG.appId
};

export const isCloudConfigured = !disabled && Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.databaseURL && firebaseConfig.projectId
);

let app = null;
let auth = null;
let db = null;

// App Check: רק האפליקציה שלנו (מהדומיינים שלנו) יכולה לדבר עם מסד הנתונים.
// מופעל כשיש מפתח Fraud Defense / reCAPTCHA Enterprise מסוג Website (REACT_APP_RECAPTCHA_SITE_KEY ב-Vercel).
// המפתח ציבורי - זה בסדר.
const recaptchaSiteKey = env(process.env.REACT_APP_RECAPTCHA_SITE_KEY);
export const isAppCheckOn = Boolean(recaptchaSiteKey);

if (isCloudConfigured) {
  app = initializeApp(firebaseConfig);
  if (recaptchaSiteKey && typeof window !== 'undefined') {
    // בפיתוח מקומי: REACT_APP_APPCHECK_DEBUG=true - מדפיס טוקן לבדיקה בקונסול (נרשם ב-Firebase)
    if (env(process.env.REACT_APP_APPCHECK_DEBUG) === 'true') {
      window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    try {
      initializeAppCheck(app, { provider: new ReCaptchaEnterpriseProvider(recaptchaSiteKey), isTokenAutoRefreshEnabled: true });
    } catch (err) {
      console.warn('App Check could not start', err);
    }
  }
  auth = getAuth(app);
  db = getDatabase(app);
}

export { auth, db };

export const onUserChanged = (callback) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

// שם משתמש וסיסמה (בלי אימייל אמיתי - ראו utils/username.js)
export const signUpWithUsername = async (username, password) => {
  const result = await createUserWithEmailAndPassword(auth, usernameToEmail(username), password);
  await updateProfile(result.user, { displayName: normalizeUsername(username) }).catch(() => {});
  return result.user;
};

export const signInWithUsername = async (username, password) => {
  const result = await signInWithEmailAndPassword(auth, usernameToEmail(username), password);
  return result.user;
};

export const signOut = () => (auth ? fbSignOut(auth) : Promise.resolve());

// הודעת שגיאה ידידותית בעברית
export const describeAuthError = (error) => {
  const code = error?.code || '';
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return null; // המשתמש סגר את החלון - לא שגיאה
  }
  if (code === 'auth/popup-blocked') {
    return 'הדפדפן חסם את חלון ההתחברות. צריך לאפשר חלונות קופצים לאתר הזה ולנסות שוב.';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'הכתובת של האתר לא מאושרת ב-Firebase. צריך להוסיף אותה ב-Authentication ← Settings ← Authorized domains.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'שיטת ההתחברות הזו לא הופעלה ב-Firebase (Authentication ← Sign-in method).';
  }
  if (code === 'auth/email-already-in-use') {
    return 'שם המשתמש הזה כבר תפוס - נסו שם אחר (אפשר להוסיף מספר).';
  }
  if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-login-credentials'].includes(code)) {
    return 'שם המשתמש או הסיסמה לא נכונים.';
  }
  if (code === 'auth/weak-password') {
    return 'הסיסמה קצרה מדי - צריך לפחות 6 תווים.';
  }
  if (code === 'auth/too-many-requests') {
    return 'יותר מדי ניסיונות. חכו כמה דקות ונסו שוב.';
  }
  if (code === 'auth/network-request-failed') {
    return 'אין חיבור לאינטרנט. אפשר לנסות שוב או להמשיך בלי התחברות.';
  }
  return `ההתחברות נכשלה (${code || error?.message || 'שגיאה לא ידועה'})`;
};
