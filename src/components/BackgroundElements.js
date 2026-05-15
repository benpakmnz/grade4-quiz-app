import React from 'react';
import { motion } from 'framer-motion';
import './BackgroundElements.css';

const BackgroundElements = () => {
  const clouds = [
    { id: 1, left: '10%', top: '15%', delay: 0, duration: 20 },
    { id: 2, left: '60%', top: '25%', delay: 5, duration: 25 },
    { id: 3, left: '30%', top: '70%', delay: 10, duration: 22 },
    { id: 4, left: '80%', top: '60%', delay: 3, duration: 18 }
  ];

  const stars = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: Math.random() * 3
  }));

  const bubbles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 10
  }));

  const geometricShapes = [
    { id: 1, type: 'circle', left: '15%', top: '20%', delay: 0, duration: 15 },
    { id: 2, type: 'triangle', left: '75%', top: '40%', delay: 2, duration: 18 },
    { id: 3, type: 'square', left: '45%', top: '65%', delay: 4, duration: 20 },
    { id: 4, type: 'circle', left: '85%', top: '15%', delay: 1, duration: 16 },
    { id: 5, type: 'triangle', left: '25%', top: '80%', delay: 3, duration: 17 }
  ];

  const sparkles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: Math.random() * 5
  }));

  return (
    <div className="background-elements">
      {/* Clouds */}
      {clouds.map((cloud) => (
        <motion.div
          key={`cloud-${cloud.id}`}
          className="cloud"
          style={{ left: cloud.left, top: cloud.top }}
          animate={{
            x: [0, 30, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: cloud.duration,
            delay: cloud.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          ☁️
        </motion.div>
      ))}

      {/* Stars */}
      {stars.map((star) => (
        <motion.div
          key={`star-${star.id}`}
          className="star"
          style={{ left: star.left, top: star.top }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: 2,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          ⭐
        </motion.div>
      ))}

      {/* Bubbles */}
      {bubbles.map((bubble) => (
        <motion.div
          key={`bubble-${bubble.id}`}
          className="bubble"
          style={{ left: bubble.left }}
          animate={{
            y: ['100vh', '-10vh'],
            x: [0, 50, -50, 0],
            opacity: [0, 0.6, 0.6, 0]
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="bubble-inner"></div>
        </motion.div>
      ))}

      {/* Geometric Shapes */}
      {geometricShapes.map((shape) => (
        <motion.div
          key={`shape-${shape.id}`}
          className={`geometric-shape shape-${shape.type}`}
          style={{ left: shape.left, top: shape.top }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 180, 360],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: shape.duration,
            delay: shape.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Sparkles */}
      {sparkles.map((sparkle) => (
        <motion.div
          key={`sparkle-${sparkle.id}`}
          className="sparkle"
          style={{ left: sparkle.left, top: sparkle.top }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 3,
            delay: sparkle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

export default BackgroundElements;
