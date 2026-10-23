import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FX_EVENT, reducedMotion } from '../utils/fx';
import './FxLayer.css';

const SPARKS = ['⭐', '✨', '🌟', '💫'];
const COLORS = ['#fde047', '#f472b6', '#60a5fa', '#34d399', '#fb923c', '#a78bfa'];

/** שכבת האפקטים: נצנוצים ו"+15 ⭐" בתשובה נכונה, וניעור של כרטיס השאלה בטעות (הודעת הרצף כבר קיימת במשחקים) */
const FxLayer = () => {
  const [bursts, setBursts] = useState([]);
  const idRef = useRef(0);

  useEffect(() => {
    const onFx = (e) => {
      const { type, points } = e.detail || {};
      const calm = reducedMotion();
      if (type === 'wrong') {
        if (calm) return;
        const card = document.querySelector('.er-question')?.closest('.er-card') || document.querySelector('.question-card');
        card?.animate?.(
          [{ transform: 'translateX(0)' }, { transform: 'translateX(-9px)' }, { transform: 'translateX(8px)' },
            { transform: 'translateX(-5px)' }, { transform: 'translateX(3px)' }, { transform: 'translateX(0)' }],
          { duration: 420, easing: 'ease-out' }
        );
        return;
      }
      if (type !== 'correct') return;
      const id = ++idRef.current;
      const particles = calm ? [] : Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * Math.PI * 2 + Math.random() * 0.4;
        const dist = 90 + Math.random() * 90;
        return {
          i,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 30,
          spin: (Math.random() - 0.5) * 360,
          emoji: i % 3 === 0 ? SPARKS[i % SPARKS.length] : null,
          color: COLORS[i % COLORS.length],
          size: 8 + Math.random() * 8
        };
      });
      setBursts(b => [...b, { id, points, particles }]);
      setTimeout(() => setBursts(b => b.filter(x => x.id !== id)), 1400);
    };
    window.addEventListener(FX_EVENT, onFx);
    return () => window.removeEventListener(FX_EVENT, onFx);
  }, []);

  return (
    <div className="fx-layer" aria-hidden="true">
      {bursts.map(b => (
        <div key={b.id} className="fx-burst">
          {b.particles.map(p => (
            <motion.span
              key={p.i}
              className={p.emoji ? 'fx-spark' : 'fx-dot'}
              style={p.emoji ? undefined : { background: p.color, width: p.size, height: p.size }}
              initial={{ x: 0, y: 0, scale: 0.3, opacity: 1, rotate: 0 }}
              animate={{ x: p.x, y: p.y, scale: 1, opacity: 0, rotate: p.spin }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            >
              {p.emoji}
            </motion.span>
          ))}
          {b.points > 0 && (
            <motion.span
              className="fx-points"
              dir="ltr"
              initial={{ y: 10, scale: 0.6, opacity: 0 }}
              animate={{ y: -90, scale: [0.6, 1.25, 1], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            >
              +{b.points} ⭐
            </motion.span>
          )}
        </div>
      ))}
    </div>
  );
};

export default FxLayer;
