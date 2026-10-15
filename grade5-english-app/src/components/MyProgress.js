import React, { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import ProgressReport from './ProgressReport';
import { LessonViewer } from './LessonViewer';
import { parseUser } from '../data/userStats';
import { readLocalProgress } from '../services/cloudSync';
import './Game.css';
import './EnglishGame.css';
import './AdminPanel.css';
import './MyProgress.css';

// "ההתקדמות שלי" - דוח לתלמיד ולהורים, מתוך הנתונים שבמכשיר (עובד גם לאורחים ובלי אינטרנט)
const MyProgress = ({ userData, onBack, onPractice }) => {
  const [lesson, setLesson] = useState(null);

  const user = useMemo(() => {
    const data = readLocalProgress();
    let lastPractice = 0;
    try {
      lastPractice = Number(localStorage.getItem('english_localUpdatedAt')) || 0;
    } catch {
      // ignore
    }
    return parseUser('me', { profile: { name: userData?.name }, progress: { data, updatedAt: lastPractice } });
  }, [userData]);

  return (
    <div className="math-game english-game my-progress">
      <div className="game-header">
        <button className="back-button" onClick={onBack}>← חזרה</button>
        <h2 className="game-title">📒 ההתקדמות שלי</h2>
      </div>

      <div className="admin-card">
        <ProgressReport
          user={user}
          mode="self"
          gender={userData?.gender}
          onOpenLesson={setLesson}
          onPractice={onPractice}
        />
      </div>

      <AnimatePresence>
        {lesson && <LessonViewer categoryId={lesson} userData={userData} onClose={() => setLesson(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default MyProgress;
