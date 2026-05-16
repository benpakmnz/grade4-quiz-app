import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ProfileEditDialog.css';

const ProfileEditDialog = ({ userData, onSave, onClose }) => {
  const [name, setName] = useState(userData.name);
  const [gender, setGender] = useState(userData.gender || 'female');
  const [selectedCharacter, setSelectedCharacter] = useState(userData.character);
  const [selectedColor, setSelectedColor] = useState(userData.themeColor || '#667eea');

  // כל הדמויות זמינות לכולם
  const allCharacters = [
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

  const handleSave = () => {
    if (name.trim() && selectedCharacter) {
      const dataToSave = {
        name: name.trim(),
        gender,
        character: selectedCharacter,
        themeColor: selectedColor
      };
      console.log('ProfileEditDialog - Saving:', dataToSave);
      onSave(dataToSave);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="profile-dialog-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="profile-dialog"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="profile-dialog-header">
            <h2>✏️ עריכת פרופיל</h2>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>

          <div className="profile-dialog-content">
            <div className="profile-content-grid">
              {/* Right Column - Name & Gender */}
              <div className="profile-column-right">
                {/* Name Input */}
                <div className="profile-section">
                  <label className="profile-label">השם שלי:</label>
                  <input
                    type="text"
                    className="profile-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="הכנס/י את השם..."
                    maxLength={20}
                    autoFocus
                  />
                </div>

                {/* Gender Toggle */}
                <div className="profile-section">
                  <label className="profile-label">אני:</label>
                  <div className="gender-toggle">
                    <button
                      className={`gender-btn ${gender === 'female' ? 'active' : ''}`}
                      onClick={() => {
                        console.log('Setting gender to female');
                        setGender('female');
                      }}
                    >
                      👧 בת
                    </button>
                    <button
                      className={`gender-btn ${gender === 'male' ? 'active' : ''}`}
                      onClick={() => {
                        console.log('Setting gender to male');
                        setGender('male');
                      }}
                    >
                      👦 בן
                    </button>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="profile-divider"></div>

              {/* Left Column - Character & Color */}
              <div className="profile-column-left">
                {/* Character Selection */}
                <div className="profile-section">
                  <label className="profile-label">
                    {gender === 'female' ? 'החברה שלי:' : 'החבר שלי:'}
                  </label>
                  <div className="characters-grid-dialog">
                    {allCharacters.map((char) => (
                      <motion.div
                        key={char.id}
                        className={`character-card-dialog ${selectedCharacter?.id === char.id ? 'selected' : ''}`}
                        style={{ '--char-color': char.color }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedCharacter(char)}
                      >
                        <div className="character-emoji-dialog">{char.emoji}</div>
                        <div className="character-name-dialog">{char.name}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Theme Color Selection */}
                <div className="profile-section">
                  <label className="profile-label">הצבע האהוב עלי:</label>
                  <div className="colors-grid">
                    {themeColors.map((colorOption) => (
                      <motion.div
                        key={colorOption.id}
                        className={`color-option ${selectedColor === colorOption.color ? 'selected' : ''}`}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedColor(colorOption.color)}
                      >
                        <div style={{ backgroundColor: colorOption.color }}>
                          {selectedColor === colorOption.color && <span className="check-mark">✓</span>}
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#666', textAlign: 'center' }}>
                          {colorOption.name}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-dialog-footer">
            <button className="cancel-btn" onClick={onClose}>
              ביטול
            </button>
            <button
              className="save-btn"
              onClick={handleSave}
              disabled={!name.trim() || !selectedCharacter}
            >
              💾 שמור שינויים
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileEditDialog;
