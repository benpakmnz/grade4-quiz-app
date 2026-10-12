import React, { useEffect, useMemo, useState } from 'react';
import { createReader, SPEEDS, getSpeedId, setSpeedId, isSpeechSupported } from '../utils/speech';

// נגן הקראה: השמעה / עצירה / המשך מאותו משפט / מההתחלה, ו-3 מהירויות
const ReadAloudPlayer = ({ text, onSentence, compact = false, playLabel = 'השמעת הקטע' }) => {
  const [status, setStatus] = useState('idle'); // idle | playing | paused | done
  const [index, setIndex] = useState(0);
  const [speed, setSpeed] = useState(getSpeedId);

  const reader = useMemo(() => createReader(text, {
    onProgress: (i) => {
      setIndex(i);
      if (onSentence) onSentence(i);
    },
    onEnd: () => {
      setStatus('done');
      setIndex(0);
      if (onSentence) onSentence(null);
    }
  }), [text]); // eslint-disable-line react-hooks/exhaustive-deps

  // קטע חדש / יציאה מהמסך - עוצרים
  useEffect(() => {
    setStatus('idle');
    setIndex(0);
    return () => reader.stop();
  }, [reader]);

  if (!isSpeechSupported()) return null;

  const play = (from) => {
    setStatus('playing');
    reader.play(from);
  };

  const pause = () => {
    reader.pause();
    setStatus('paused');
  };

  const restart = () => {
    reader.stop();
    setIndex(0);
    play(0);
  };

  const chooseSpeed = (id) => {
    setSpeed(id);
    setSpeedId(id);
    // אם מתנגן - ממשיכים מאותו משפט במהירות החדשה
    if (status === 'playing') reader.play(reader.getIndex());
  };

  const progress = status === 'done' ? 100 : Math.round((index / reader.total) * 100);

  return (
    <div className={`reader ${compact ? 'compact' : ''}`}>
      <div className="reader-buttons">
        {status === 'playing' ? (
          <button className="play-button pause" onClick={pause}>⏸️ עצירה</button>
        ) : status === 'paused' ? (
          <button className="play-button" onClick={() => play()}>▶️ המשך</button>
        ) : (
          <button className="play-button" onClick={() => play(0)}>
            ▶️ {status === 'done' ? 'השמעה שוב' : playLabel}
          </button>
        )}
        {(status === 'playing' || status === 'paused') && (
          <button className="play-button restart" onClick={restart} title="מההתחלה">⏮️ מההתחלה</button>
        )}
      </div>

      <div className="reader-progress" aria-hidden="true">
        <div className="reader-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="reader-status">
        {status === 'idle' && `${reader.total} משפטים`}
        {(status === 'playing' || status === 'paused') && `משפט ${index + 1} מתוך ${reader.total}${status === 'paused' ? ' · בהפסקה' : ''}`}
        {status === 'done' && '✓ הקטע הסתיים'}
      </div>

      <div className="speed-picker" role="radiogroup" aria-label="מהירות הקראה">
        {SPEEDS.map(s => (
          <button
            key={s.id}
            role="radio"
            aria-checked={speed === s.id}
            className={`speed-option ${speed === s.id ? 'active' : ''}`}
            onClick={() => chooseSpeed(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReadAloudPlayer;
