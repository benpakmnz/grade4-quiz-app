// הקראה באנגלית בעזרת Web Speech API של הדפדפן (ללא צורך בחיבור לשרת)

let cachedVoice = null;

const pickVoice = () => {
  if (cachedVoice) return cachedVoice;
  if (!window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const english = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('en'));
  cachedVoice =
    english.find(v => /samantha|google us english|zira|jenny|aria/i.test(v.name)) ||
    english.find(v => v.lang === 'en-US') ||
    english[0] ||
    null;
  return cachedVoice;
};

if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null;
    pickVoice();
  };
}

export const isSpeechSupported = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window;

// שלוש מהירויות הקראה לבחירה; הבחירה נשמרת בדפדפן ומשמשת את כל כפתורי ההקראה
export const SPEEDS = [
  { id: 'slow', label: '🐢 לאט', rate: 0.6 },
  { id: 'medium', label: '🚶 בינוני', rate: 0.75 },
  { id: 'normal', label: '🐇 רגיל', rate: 0.9 }
];
const SPEED_KEY = 'english_speechSpeed';

export const getSpeedId = () => {
  try {
    const saved = localStorage.getItem(SPEED_KEY);
    return SPEEDS.some(s => s.id === saved) ? saved : 'slow';
  } catch {
    return 'slow';
  }
};

export const setSpeedId = (id) => {
  try {
    localStorage.setItem(SPEED_KEY, id);
  } catch {
    // ignore
  }
};

export const getRate = () => SPEEDS.find(s => s.id === getSpeedId()).rate;

export const speak = (text, { rate = getRate(), onEnd } = {}) => {
  if (!isSpeechSupported() || !text) {
    if (onEnd) onEnd();
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.replace(/_+/g, 'blank'));
  utterance.lang = 'en-US';
  utterance.rate = rate;
  const voice = pickVoice();
  if (voice) utterance.voice = voice;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }
  window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
  if (isSpeechSupported()) window.speechSynthesis.cancel();
};

// מפרק טקסט למשפטים (כדי שאפשר יהיה לעצור ולהמשיך מאותו משפט)
export const splitIntoSentences = (text) =>
  text
    .replace(/([.!?]["']?)\s+/g, '$1\n')
    .split(/\n+/)
    .map(s => s.trim())
    .filter(Boolean);

const PAUSE_BETWEEN_SENTENCES_MS = 450;

/**
 * נגן להקראת קטע משפט אחרי משפט, עם עצירה והמשך מאותו משפט.
 * onProgress(index, total) נקרא כשמתחיל כל משפט; onEnd() בסוף הקטע.
 */
export const createReader = (text, { onProgress, onEnd } = {}) => {
  const sentences = splitIntoSentences(text);
  let index = 0;
  let run = 0; // מזהה ריצה - כדי להתעלם מאירועי onend של משפט שבוטל
  let timer = null;

  const speakFrom = (i, myRun) => {
    if (myRun !== run) return;
    if (i >= sentences.length) {
      index = 0;
      if (onEnd) onEnd();
      return;
    }
    index = i;
    if (onProgress) onProgress(i, sentences.length);
    speak(sentences[i], {
      rate: getRate(),
      onEnd: () => {
        if (myRun !== run) return;
        timer = setTimeout(() => speakFrom(i + 1, myRun), PAUSE_BETWEEN_SENTENCES_MS);
      }
    });
  };

  const halt = () => {
    run += 1;
    clearTimeout(timer);
    stopSpeaking();
  };

  return {
    sentences,
    total: sentences.length,
    /** מתחיל (או ממשיך) מהמשפט הנוכחי, או ממשפט מסוים */
    play: (from = index) => {
      halt();
      speakFrom(from, run);
    },
    /** עוצר; play() הבא ימשיך מאותו משפט */
    pause: () => halt(),
    stop: () => {
      halt();
      index = 0;
    },
    getIndex: () => index
  };
};
