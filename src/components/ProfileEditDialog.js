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
    { id: 'cat', emoji: '🐱', name: 'חתול/ה', color: '#fbbf24' },
    { id: 'panda', emoji: '🐼', name: 'פנדה', color: '#4ecdc4' },
    { id: 'fox', emoji: '🦊', name: 'שועל/ה', color: '#f97316' },
    { id: 'koala', emoji: '🐨', name: 'קואלה', color: '#a78bfa' },
    { id: 'bunny', emoji: '🐰', name: 'ארנב/ת', color: '#ec4899' },
    { id: 'lion', emoji: '🦁', name: 'אריה', color: '#f59e0b' },
    { id: 'tiger', emoji: '🐯', name: 'נמר', color: '#ff6b35' },
    { id: 'bear', emoji: '🐻', name: 'דוב', color: '#8b5a3c' },
    { id: 'robot', emoji: '🤖', name: 'רובוט', color: '#3b82f6' },
    { id: 'dinosaur', emoji: '🦖', name: 'דינוזאור', color: '#10b981' },
    { id: 'rocket', emoji: '🚀', name: 'חללית', color: '#8b5cf6' }
  ];

  const themeColors = [
    { id: 'purple', color: '#667eea', name: 'סגול' },
    { id: 'pink', color: '#ff6b9d', name: 'ורוד' },
    { id: 'blue', color: '#3b82f6', name: 'כחול' },
    { id: 'green', color: '#10b981', name: 'ירוק' },
    { id: 'orange', color: '#f97316', name: 'כתום' },
    { id: 'teal', color: '#14b8a6', name: 'טורקיז' },
    { id: 'red', color: '#ef4444', name: 'אדום' },
    { id: 'yellow', color: '#fbbf24', name: 'צהוב' }
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
              <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                מגדר נוכחי: {gender === 'female' ? 'בת' : 'בן'}
              </div>
            </div>

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
                {themeColors.map((theme) => (
                  <motion.div
                    key={theme.id}
                    className={`color-option ${selectedColor === theme.color ? 'selected' : ''}`}
                    style={{ backgroundColor: theme.color }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedColor(theme.color)}
                    title={theme.name}
                  >
                    {selectedColor === theme.color && <span className="check-mark">✓</span>}
                  </motion.div>
                ))}
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
