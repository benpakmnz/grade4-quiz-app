// חיבור ל-Firebase (התחברות עם Google + Realtime Database)
// ההגדרות נקראות ממשתני סביבה בזמן הבנייה (ראו README). בלי הגדרות - האפליקציה עובדת כמו קודם, רק במכשיר.
import { initializeApp } from 'firebase/app';
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, onAuthStateChanged
} from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// ערכים שהודבקו ב-Vercel עם רווח או ירידת שורה ישברו את החיבור - לכן trim
const env = (value) => (value || '').trim() || undefined;

const firebaseConfig = {
  apiKey: env(process.env.REACT_APP_FIREBASE_API_KEY),
  authDomain: env(process.env.REACT_APP_FIREBASE_AUTH_DOMAIN),
  databaseURL: env(process.env.REACT_APP_FIREBASE_DATABASE_URL),
  projectId: env(process.env.REACT_APP_FIREBASE_PROJECT_ID),
  appId: env(process.env.REACT_APP_FIREBASE_APP_ID)
};

export const isCloudConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.databaseURL && firebaseConfig.projectId
);

let app = null;
let auth = null;
let db = null;

if (isCloudConfigured) {
  app = initializeApp(firebaseConfig);
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
    return 'ההתחברות עם Google לא הופעלה ב-Firebase (Authentication ← Sign-in method).';
  }
  if (code === 'auth/network-request-failed') {
    return 'אין חיבור לאינטרנט. אפשר לנסות שוב או להמשיך בלי התחברות.';
  }
  return `ההתחברות נכשלה (${code || error?.message || 'שגיאה לא ידועה'})`;
};
