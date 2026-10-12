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

export const speak = (text, { rate = 0.85, onEnd } = {}) => {
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
