// יומן טעויות: כל שאלה שבה התשובה הראשונה לא הייתה נכונה.
// נשמר עם ההתקדמות (localStorage + סנכרון לענן), כדי שההורה יוכל לראות בממשק הניהול על מה לעבור.
import { notifyLocalChange } from '../services/cloudSync';

export const MISTAKES_KEY = 'english_mistakes';
const MAX_ENTRIES = 300;

export const readMistakes = () => {
  try {
    const list = JSON.parse(localStorage.getItem(MISTAKES_KEY) || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

/**
 * question - נוסח השאלה, given - מה נענה (הניסיון השגוי הראשון),
 * correct - התשובה הנכונה, finalCorrect - האם בסוף הצליחה (בניסיון נוסף)
 */
export const logMistake = ({ category, question, given, correct, finalCorrect }) => {
  try {
    const entry = {
      ts: Date.now(),
      category,
      question: String(question || '').slice(0, 300),
      given: String(given ?? '').slice(0, 300),
      correct: String(correct ?? '').slice(0, 300),
      finalCorrect: Boolean(finalCorrect)
    };
    const list = [entry, ...readMistakes()].slice(0, MAX_ENTRIES);
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(list));
    notifyLocalChange();
  } catch {
    // ignore
  }
};
