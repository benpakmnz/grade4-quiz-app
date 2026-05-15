import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './WelcomeScreen.css';

const WelcomeScreen = ({ onStart }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('female');
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const allCharacters = [
    // דמויות "נשיות"
    { id: 'unicorn', emoji: '🦄', name: 'חד-קרן', color: '#ff6b9d' },
    { id: 'cat', emoji: '🐱', name: 'חתול/ה', color: '#fbbf24' },
    { id: 'panda', emoji: '🐼', name: 'פנדה', color: '#4ecdc4' },
    { id: 'fox', emoji: '🦊', name: 'שועל/ה', color: '#f97316' },
    { id: 'koala', emoji: '🐨', name: 'קואלה', color: '#a78bfa' },
    { id: 'bunny', emoji: '🐰', name: 'ארנב/ת', color: '#ec4899' },
    // דמויות "גבריות"
    { id: 'lion', emoji: '🦁', name: 'אריה', color: '#f59e0b' },
    { id: 'tiger', emoji: '🐯', name: 'נמר', color: '#ff6b35' },
    { id: 'bear', emoji: '🐻', name: 'דוב', color: '#8b5a3c' },
    { id: 'robot', emoji: '🤖', name: 'רובוט', color: '#3b82f6' },
    { id: 'dinosaur', emoji: '🦖', name: 'דינוזאור', color: '#10b981' },
    { id: 'rocket', emoji: '🚀', name: 'חללית', color: '#8b5cf6' }
  ];

  const handleStart = () => {
    if (name.trim() && selectedCharacter) {
      onStart({ 
        name: name.trim(), 
        gender,
        character: selectedCharacter,
        themeColor: selectedCharacter.color
      });
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
          🎮 ברוך/ה הבא/ה
        </motion.h1>
        
        <p className="welcome-subtitle">בוא/י נכיר! 😊</p>

        <div className="name-section">
          <label className="input-label">מה השם שלך?</label>
          <input
            type="text"
            className="name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='הכנס/י את השם שלך'
            maxLength={20}
            autoFocus
          />
        </div>

        <div className="gender-section">
          <label className="input-label">אני:</label>
          <div className="gender-toggle">
            <button
              className={`gender-btn ${gender === 'female' ? 'active' : ''}`}
              onClick={() => setGender('female')}
            >
              👧 בת
            </button>
            <button
              className={`gender-btn ${gender === 'male' ? 'active' : ''}`}
              onClick={() => setGender('male')}
            >
              👦 בן
            </button>
          </div>
        </div>

        <div className="character-section">
          <label className="input-label">
            '🌟 בחר/י חבר/ה שילווה אותך'
          </label>
          <div className="characters-grid">
            {allCharacters.map((char) => (
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
          {gender === 'female' ? 'בואי נתחיל! 🚀' : 'בוא נתחיל! 🚀'}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
