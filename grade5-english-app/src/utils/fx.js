// אפקטים קטנים של "וואו" (נצנוצים בתשובה נכונה, ניעור קטן בטעות).
// המשחקים רק שולחים אירוע; FxLayer שבראש האפליקציה מצייר את האפקט.
export const FX_EVENT = 'app:fx';

export const reducedMotion = () => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
};

const send = (detail) => {
  try {
    window.dispatchEvent(new CustomEvent(FX_EVENT, { detail }));
  } catch {
    // ignore
  }
};

/** תשובה נכונה: points - כמה נקודות (אם יש), streak - הרצף אחרי התשובה */
export const fxCorrect = (points = 0, streak = 0) => send({ type: 'correct', points, streak });

/** טעות: ניעור קטן של כרטיס השאלה */
export const fxWrong = () => send({ type: 'wrong' });

// ---------------- צלילים ----------------
const SOUND_KEY = 'english_soundOff';
let audioCtx = null;

export const isSoundOn = () => {
  try {
    return localStorage.getItem(SOUND_KEY) !== '1';
  } catch {
    return true;
  }
};

export const setSoundOn = (on) => {
  try {
    if (on) localStorage.removeItem(SOUND_KEY);
    else localStorage.setItem(SOUND_KEY, '1');
  } catch {
    // ignore
  }
};

const tone = (ctx, freq, start, length, volume = 0.16, type = 'triangle') => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + length + 0.05);
};

/** צליל מפרגן קצר לתשובה נכונה (בלי קבצים). מנגינה קצת שונה כל פעם, כדי שלא יימאס */
export const playSuccess = (streak = 0) => {
  if (!isSoundOn()) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    const t = audioCtx.currentTime + 0.02;
    const melodies = [
      [659.25, 783.99, 1046.5],
      [587.33, 783.99, 987.77],
      [523.25, 659.25, 783.99, 1046.5]
    ];
    const notes = melodies[streak % melodies.length];
    notes.forEach((f, i) => tone(audioCtx, f, t + i * 0.09, i === notes.length - 1 ? 0.35 : 0.14));
    // נצנוץ קטן מעל
    tone(audioCtx, 2093, t + notes.length * 0.09, 0.18, 0.05, 'sine');
  } catch {
    // בלי צליל - לא נורא
  }
};
