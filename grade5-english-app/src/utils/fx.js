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
