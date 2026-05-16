import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './WelcomeScreen.css';

const WelcomeScreen = ({ onStart }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('female');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#667eea');

  const themeColors = [
    { id: 'purple', color: '#667eea', name: 'סגול' },
    { id: 'pink', color: '#ec4899', name: 'ורוד' },
    { id: 'blue', color: '#3b82f6', name: 'כחול' },
    { id: 'green', color: '#10b981', name: 'ירוק' },
    { id: 'orange', color: '#f97316', name: 'כתום' },
    { id: 'red', color: '#ef4444', name: 'אדום' },
    { id: 'teal', color: '#14b8a6', name: 'טורקיז' },
    { id: 'indigo', color: '#6366f1', name: 'אינדיגו' },
    { id: 'yellow', color: '#eab308', name: 'צהוב' },
    { id: 'cyan', color: '#06b6d4', name: 'ציאן' }
  ];

  const allCharacters = [
    // דמויות מגניבות לכולם
    { id: 'unicorn', emoji: '🦄', name: 'חד-קרן', color: '#ff6b9d' },
    { id: 'wizard', emoji: '🧙', name: 'קוסם/ת', color: '#8b5cf6' },
    { id: 'superhero', emoji: '🦸', name: 'גיבור על', color: '#3b82f6' },
    { id: 'ninja', emoji: '🥷', name: 'נינג\'ה', color: '#1f2937' },
    { id: 'fairy', emoji: '🧚', name: 'פיה', color: '#ec4899' },
    { id: 'dragon', emoji: '🐉', name: 'דרקון', color: '#10b981' },
    { id: 'cat', emoji: '🐱', name: 'חתול/ה', color: '#fbbf24' },
    { id: 'fox', emoji: '🦊', name: 'שועל/ה', color: '#f97316' },
    { id: 'dolphin', emoji: '🐬', name: 'דולפין', color: '#06b6d4' },
    { id: 'eagle', emoji: '🦅', name: 'נשר', color: '#92400e' },
    { id: 'rocket', emoji: '🚀', name: 'חללית', color: '#6366f1' },
    { id: 'robot', emoji: '🤖', name: 'רובוט', color: '#a78bfa' }
  ];

  const handleStart = () => {
    if (name.trim() && selectedCharacter) {
      onStart({ 
        name: name.trim(), 
        gender,
        character: selectedCharacter,
        themeColor: selectedColor
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
          🎮 ברוכים הבאים
        </motion.h1>
        
        <p className="welcome-subtitle">בואו נכיר! 😊</p>

        <div className="welcome-content-grid">
          {/* Right Column - Name & Gender */}
          <div className="welcome-column-right">
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
          </div>

          {/* Divider */}
          <div className="welcome-divider"></div>

          {/* Left Column - Character & Color */}
          <div className="welcome-column-left">
            <div className="character-section">
              <label className="input-label">
                {gender === 'female' ? '🌟 בחרי חברה שתלווה אותך' : '🌟 בחר חבר שילווה אותך'}
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

            <div className="color-section">
              <label className="input-label">
                {gender === 'female' ? '🎨 בחרי צבע לאפליקציה' : '🎨 בחר צבע לאפליקציה'}
              </label>
              <div className="colors-grid">
                {themeColors.map((colorOption) => (
                  <motion.div
                    key={colorOption.id}
                    className={`color-card ${selectedColor === colorOption.color ? 'selected' : ''}`}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedColor(colorOption.color)}
                  >
                    <div 
                      className="color-circle" 
                      style={{ backgroundColor: colorOption.color }}
                    >
                      {selectedColor === colorOption.color && <span className="check-mark">✓</span>}
                    </div>
                    <div className="color-name">{colorOption.name}</div>
                  </motion.div>
                ))}
              </div>
            </div>
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
