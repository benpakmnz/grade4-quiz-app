import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import './VaultCelebration.css';

// חגיגה על כל המסך כשהכספת נפתחת - מופיעה אצל כל ילד/ה בצוות באותו רגע.
// הספרות נכנסות אחת-אחת, הידית מסתובבת, הדלת נפתחת, יוצא גביע, וקונפטי יורד. לחיצה בכל מקום - ממשיכים.

const COLORS = ['#fde047', '#f472b6', '#60a5fa', '#34d399', '#fb923c', '#a78bfa', '#ffffff'];

/** צליל ניצחון קצר (בלי קבצים) - אם הדפדפן מרשה */
const playFanfare = () => {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const t = ctx.currentTime + 1.6 + i * 0.13;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + (i === notes.length - 1 ? 0.7 : 0.25));
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.8);
    });
    setTimeout(() => ctx.close().catch(() => {}), 3500);
  } catch {
    // בלי צליל - לא נורא
  }
};

const prefersReducedMotion = () => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
};

const VaultCelebration = ({ digits = [], team, emojis = [], onDone }) => {
  const reduced = useMemo(prefersReducedMotion, []);
  const [canClose, setCanClose] = useState(false);
  const DOOR_AT = 0.5 + digits.length * 0.18 + 0.7; // מתי הדלת נפתחת (שניות)

  const confetti = useMemo(() => Array.from({ length: reduced ? 0 : 70 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: DOOR_AT + Math.random() * 1.2,
    duration: 2.4 + Math.random() * 1.8,
    drift: (Math.random() - 0.5) * 160,
    rotate: (Math.random() - 0.5) * 900,
    color: COLORS[i % COLORS.length],
    w: 7 + Math.random() * 7,
    h: 10 + Math.random() * 10,
    round: Math.random() < 0.3
  })), [reduced, DOOR_AT]);

  useEffect(() => {
    playFanfare();
    try {
      if (navigator.vibrate) navigator.vibrate([60, 40, 60, 40, 180]);
    } catch {
      // ignore
    }
    const ready = setTimeout(() => setCanClose(true), (DOOR_AT + 1.2) * 1000);
    const auto = setTimeout(onDone, (DOOR_AT + 6) * 1000);
    return () => {
      clearTimeout(ready);
      clearTimeout(auto);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- פעם אחת

  // ישירות ב-body - כדי לכסות את כל המסך (גם את הכותרת של האפליקציה)
  return createPortal((
    <motion.div
      className="vc-overlay"
      role="dialog"
      aria-label="פיצחתם את הכספת!"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => canClose && onDone()}
    >
      {/* קרני אור מסתובבות מאחורי הכספת */}
      <motion.div
        className="vc-rays"
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1, rotate: reduced ? 0 : 360 }}
        transition={{
          opacity: { delay: DOOR_AT, duration: 0.6 },
          scale: { delay: DOOR_AT, duration: 0.8 },
          rotate: { delay: DOOR_AT, duration: 14, repeat: Infinity, ease: 'linear' }
        }}
      />

      {/* הקוד נכנס ספרה אחרי ספרה */}
      <div className="vc-digits" dir="ltr" aria-hidden="true">
        {digits.map((d, i) => (
          <motion.span
            key={i}
            initial={{ y: -60, opacity: 0, scale: 0.4 }}
            animate={{ y: 0, opacity: 1, scale: [0.4, 1.25, 1] }}
            transition={{ delay: 0.5 + i * 0.18, duration: 0.45 }}
          >
            {d}
          </motion.span>
        ))}
      </div>

      {/* הכספת */}
      <div className="vc-vault" aria-hidden="true">
        <motion.div
          className="vc-inside"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: DOOR_AT + 0.2, type: 'spring', stiffness: 160, damping: 10 }}
        >
          🏆
        </motion.div>
        <motion.div
          className="vc-door"
          initial={{ rotateY: 0 }}
          animate={{ rotateY: reduced ? 0 : -115, opacity: reduced ? 0 : 1 }}
          transition={{ delay: DOOR_AT, duration: 0.9, ease: [0.3, 1.4, 0.5, 1] }}
        >
          <motion.div
            className="vc-wheel"
            initial={{ rotate: 0 }}
            animate={{ rotate: reduced ? 0 : 540 }}
            transition={{ delay: 0.4, duration: DOOR_AT - 0.5, ease: 'easeInOut' }}
          >
            <span /><span /><span />
          </motion.div>
          <div className="vc-bolts"><i /><i /><i /><i /></div>
        </motion.div>
      </div>

      <motion.h1
        className="vc-title"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: DOOR_AT + 0.35, type: 'spring', stiffness: 220, damping: 11 }}
      >
        פיצחתם את הכספת!
      </motion.h1>
      <motion.p
        className="vc-sub"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: DOOR_AT + 0.7 }}
      >
        🎉 כל הכבוד, צוות {team}! 🎉
      </motion.p>

      {/* כל הצוות קופץ משמחה */}
      <div className="vc-team" aria-hidden="true">
        {emojis.slice(0, 12).map((e, i) => (
          <motion.span
            key={i}
            initial={{ y: 40, opacity: 0 }}
            animate={reduced ? { y: 0, opacity: 1 } : { y: [40, 0, -22, 0], opacity: 1 }}
            transition={{
              delay: DOOR_AT + 0.9 + i * 0.08,
              duration: 0.9,
              ...(reduced ? {} : { repeat: Infinity, repeatDelay: 0.9 })
            }}
          >
            {e}
          </motion.span>
        ))}
      </div>

      {canClose && (
        <motion.div className="vc-tap" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.6, 1] }} transition={{ duration: 1.4, repeat: Infinity }}>
          לחצו כדי להמשיך ✨
        </motion.div>
      )}

      {confetti.map(c => (
        <motion.i
          key={c.id}
          className="vc-confetti"
          aria-hidden="true"
          style={{ left: `${c.left}%`, width: c.w, height: c.round ? c.w : c.h, background: c.color, borderRadius: c.round ? '50%' : 2 }}
          initial={{ y: '-10vh', x: 0, rotate: 0, opacity: 1 }}
          animate={{ y: '110vh', x: c.drift, rotate: c.rotate }}
          transition={{ delay: c.delay, duration: c.duration, ease: 'easeIn', repeat: 1, repeatDelay: Math.random() }}
        />
      ))}
    </motion.div>
  ), document.body);
};

export default VaultCelebration;
