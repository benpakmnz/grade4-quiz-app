import React from 'react';
import { speak, isSpeechSupported } from '../utils/speech';

// כפתור 🔊 שמקריא טקסט באנגלית
const SpeakButton = ({ text, rate, title = 'הקשבה', small = false }) => {
  if (!isSpeechSupported()) return null;
  return (
    <button
      type="button"
      className={`speak-button ${small ? 'small' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        speak(text, rate ? { rate } : undefined);
      }}
      title={title}
      aria-label={title}
    >
      🔊
    </button>
  );
};

export default SpeakButton;
