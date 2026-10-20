// פעולות חשבון משותפות (חלון הפרופיל ותפריט ההמבורגר)
import { signOut } from './firebase';
import { endSession } from './sessions';
import { pushNow, clearLocalProgress, GUEST_KEY } from './cloudSync';

/** התנתקות: שומרים בענן, סוגרים את הסשן, ומנקים את המכשיר (אולי ילד/ה אחר/ת יתחבר/ו כאן) */
export const signOutAndClear = async () => {
  await pushNow().catch(() => {});
  await endSession();
  await signOut();
  clearLocalProgress();
  window.location.reload();
};

export const SIGN_OUT_CONFIRM = 'להתנתק? ההתקדמות שמורה בענן ותחזור בהתחברות הבאה.';

/** אורח/ת שרוצה להתחבר: חוזרים למסך ההתחברות. ההתקדמות מהמכשיר עולה לחשבון אחרי ההתחברות. */
export const goToSignIn = () => {
  try {
    localStorage.removeItem(GUEST_KEY);
  } catch {
    // ignore
  }
  window.location.reload();
};
