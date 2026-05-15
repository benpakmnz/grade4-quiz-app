import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './WelcomeScreen.css';

const WelcomeScreen = ({ onStart }) => {
  const [name, setName] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const characters = [
    { id: 'unicorn', emoji: '🦄', name: 'חד-קרן', color: '#ff6b9d' },
    { id: 'cat', emoji: '🐱', name: 'חתולה', color: '#fbbf24' },
    { id: 'panda', emoji: '🐼', name: 'פנדה', color: '#4ecdc4' },
    { id: 'fox', emoji: '🦊', name: 'שועלה', color: '#f97316' },
    { id: 'koala', emoji: '🐨', name: 'קואלה', color: '#a78bfa' },
    { id: 'bunny', emoji: '🐰', name: 'ארנבת', color: '#ec4899' }
  ];

  const handleStart = () => {
    if (name.trim() && selectedCharacter) {
      onStart({ name: name.trim(), character: selectedCharacter });
    }
  };

  return (
    <div className="welcome-screen">
      <motion.div
        className="welcome-card"
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <motion.h1
          className="welcome-title"
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          🎮 ברוכה הבאה!
        </motion.h1>
        
        <p className="welcome-subtitle">בואי נכיר! 😊</p>

        <div className="name-section">
          <label className="input-label">מה השם שלך?</label>
          <input
            type="text"
            className="name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="הכניסי את השם שלך..."
            maxLength={20}
            autoFocus
          />
        </div>

        <div className="character-section">
          <label className="input-label">בחרי חברה שתלווה אותך! 🌟</label>
          <div className="characters-grid">
            {characters.map((char) => (
              <motion.div
                key={char.id}
                className={`character-card ${selectedCharacter?.id === char.id ? 'selected' : ''}`}
                style={{ '--char-color': char.color }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCharacter(char)}
              >
                <div className="character-emoji">{char.emoji}</div>
                <div className="character-name">{char.name}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.button
          className="start-button"
          disabled={!name.trim() || !selectedCharacter}
          onClick={handleStart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          בואי נתחיל! 🚀
        </motion.button>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
