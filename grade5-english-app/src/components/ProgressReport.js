import React, { useState } from 'react';
import { rateColor, formatWhen, parseUser, formatDuration, formatClock, formatDay } from '../data/userStats';
import { DEVICE_ICONS } from '../utils/device';
import { readLocalProgress } from '../services/cloudSync';
import './AdminPanel.css';
import './ProgressReport.css';
import { categories, TARGET_PER_CATEGORY } from '../data/categories';
import { hasLesson } from '../data/lessons';
import { getGenderText } from '../utils/genderText';

const categoryName = (id) => {
  const c = categories.find(x => x.id === id);
  return c ? `${c.emoji} ${c.name}` : id;
};

const RateBadge = ({ rate }) => (
  <span className="rate-badge" style={{ background: rateColor(rate) }}>
    {rate === null ? '—' : `${rate}%`}
  </span>
);

/** הדוח של המשתמש הנוכחי, מתוך הנתונים שבמכשיר (עובד גם לאורחים ובלי אינטרנט) */
export const buildLocalReport = (userData) => {
  let lastPractice = 0;
  try {
    lastPractice = Number(localStorage.getItem('english_localUpdatedAt')) || 0;
  } catch {
    // ignore
  }
  return parseUser('me', {
    profile: { name: userData?.name },
    progress: { data: readLocalProgress(), updatedAt: lastPractice }
  });
};

// טיפ קצר להורה: איך לעזור בכל נושא
export const PARENT_TIPS = {
  vocabulary: 'לבחור 5 מילים מהיומן, לשמוע אותן ב-🔊 ולהגיד אותן יחד. אפשר לשחק "מה המילה באנגלית?" בארוחת ערב.',
  isAre: 'לשאול כל פעם: "על מי מדברים? אחד או כמה?". I הולך עם am, אחד עם is, כמה עם are.',
  hasHave: 'לשאול: "למי יש?". he / she / it וכל שם של אדם אחד הולכים עם has, וכל השאר עם have.',
  canCant: 'לקרוא את המשפט בקול ולשאול "זה אפשרי?". אם כן - can, אם לא - can\'t. לשים לב לרמזים כמו but ו-so.',
  becauseWhy: 'יש סימן שאלה בסוף? זו שאלה ולכן Why. מסבירים סיבה באמצע משפט? because.',
  sentenceOrder: 'לבנות יחד את המשפט לפי הסדר: מי? ← עושה מה? ← מה / איפה? ← מתי?. שאלה מתחילה ב-Do / Can / Is.',
  reading: 'לקרוא קודם את השאלות, ואז לחפש בקטע את המילה מהשאלה. בשאלות Why התשובה מתחילה ב-because.',
  listening: 'לבחור מהירות 🐢 לאט, לקרוא את השאלה לפני ההשמעה, ולעצור ⏸️ אחרי כל כמה משפטים.',
  writing: 'לכתוב יחד 6 משפטים קצרים על עצמו/ה, ולבדוק עם רשימת הבדיקה: אות גדולה, נקודה, I גדולה.',
  mixed: 'לחזור לנושא שבו היו הכי הרבה טעויות במבחן ולתרגל אותו לבד לפני מבחן נוסף.'
};

/**
 * דוח התקדמות של משתמש אחד.
 * mode='admin' - מתוך ממשק הניהול; mode='self' - התלמיד/ההורה רואים את הדוח של עצמם
 */
const ProgressReport = ({ user, mode = 'admin', onBack, backLabel, gender, onOpenLesson, onPractice }) => {
  const [mistakeFilter, setMistakeFilter] = useState('all');
  const g = (t) => getGenderText(t, gender);
  const self = mode === 'self';

  const practiced = user.perCategory.filter(c => c.total > 0);
  const weakest = [...practiced].sort((a, b) => a.rate - b.rate).slice(0, 3).filter(c => c.rate < 80);
  const notStarted = user.perCategory.filter(c => c.total === 0);
  const mistakes = user.mistakes.filter(m => mistakeFilter === 'all' || m.category === mistakeFilter);
  const mistakeCategories = [...new Set(user.mistakes.map(m => m.category))];

  return (
    <div className="dash-details">
      {onBack && <button className="admin-small-btn back-link" onClick={onBack}>{backLabel || '→ חזרה'}</button>}

      <div className="dash-user-head">
        <span className="dash-avatar">{user.character}</span>
        <div>
          <h3>{self ? `ההתקדמות של ${user.name}` : user.name}</h3>
          <div className="dash-sub">
            {!self && <>{user.email || `👤 ${user.username}`} · </>}
            תרגול אחרון: {formatWhen(user.lastPractice || user.lastSeen)}
          </div>
        </div>
      </div>

      {self && (
        <div className="report-parents">
          👨‍👩‍👧 <b>להורים:</b> כאן רואים באילו נושאים יש הצלחה, איפה כדאי לתרגל יחד, ועל אילו שאלות היו טעויות.
          לכל נושא חלש יש טיפ קצר איך לעזור, וקישור לשיעור "איך פותרים?".
        </div>
      )}

      <div className="dash-kpis">
        <div className="dash-kpi"><b>{user.score}</b><span>נקודות</span></div>
        <div className="dash-kpi"><b>{user.overall.total}</b><span>תשובות</span></div>
        <div className="dash-kpi"><b>{user.overall.rate === null ? '—' : `${user.overall.rate}%`}</b><span>הצלחה</span></div>
        <div className="dash-kpi"><b>{user.mistakes.length}</b><span>טעויות ביומן</span></div>
      </div>

      {weakest.length > 0 && !self && (
        <div className="dash-focus">
          🎯 <b>כדאי לעבור יחד על:</b> {weakest.map(c => `${c.emoji} ${c.name} (${c.rate}%)`).join(' · ')}
        </div>
      )}

      {self && (
        <>
          <h4>🎯 על מה כדאי לעבוד</h4>
          {weakest.length === 0 ? (
            <p className="report-good">
              {practiced.length === 0
                ? g('עוד לא תרגלת - בחרי נושא ונתחיל! 🚀')
                : g('כל הכבוד! בכל הנושאים שתרגלת יש הצלחה של 80% ומעלה 🌟')}
            </p>
          ) : (
            <div className="report-focus-list">
              {weakest.map(c => (
                <div key={c.id} className="report-focus-card">
                  <div className="report-focus-head">
                    <span>{c.emoji} <b>{c.name}</b></span>
                    <RateBadge rate={c.rate} />
                  </div>
                  <p>💡 {PARENT_TIPS[c.id]}</p>
                  <div className="admin-row">
                    {onOpenLesson && hasLesson(c.id) && (
                      <button className="admin-small-btn" onClick={() => onOpenLesson(c.id)}>📘 שיעור "איך פותרים?"</button>
                    )}
                    {onPractice && (
                      <button className="admin-small-btn primary-soft" onClick={() => onPractice(c.id)}>✏️ לתרגל עכשיו</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {notStarted.length > 0 && practiced.length > 0 && (
            <p className="admin-hint">
              עוד לא תורגלו: {notStarted.map(c => `${c.emoji} ${c.name}`).join(' · ')}
            </p>
          )}
        </>
      )}

      <h4>הצלחה לפי נושא</h4>
      <div className="table-scroll">
        <table className="dash-table">
          <thead>
            <tr><th>נושא</th><th>נכונות / סה"כ</th><th>הצלחה</th><th>התקדמות ליעד ({TARGET_PER_CATEGORY})</th></tr>
          </thead>
          <tbody>
            {user.perCategory.map(c => (
              <tr key={c.id} className={c.total === 0 ? 'muted' : ''}>
                <td>{c.emoji} {c.name}</td>
                <td><bdi dir="ltr">{c.correct} / {c.total}</bdi></td>
                <td><RateBadge rate={c.rate} /></td>
                <td>
                  <div className="dash-bar"><div style={{ width: `${c.progress}%`, background: rateColor(c.rate) }} /></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4>📝 יומן טעויות</h4>
      {user.mistakes.length === 0 ? (
        <p className="admin-hint">
          {self
            ? g('אין עדיין טעויות ביומן. כל שאלה שבה התשובה הראשונה לא הייתה נכונה תופיע כאן, עם התשובה הנכונה.')
            : 'אין עדיין טעויות ביומן.'}
        </p>
      ) : (
        <>
          {self && (
            <p className="admin-hint">
              {g('כל שאלה שבה התשובה הראשונה לא הייתה נכונה - מה נענה, ומה התשובה הנכונה. כדאי לעבור עליהן יחד ולהסביר למה.')}
            </p>
          )}
          <div className="admin-row">
            <select className="admin-input narrow" value={mistakeFilter} onChange={e => setMistakeFilter(e.target.value)}
              aria-label="סינון לפי נושא">
              <option value="all">כל הנושאים ({user.mistakes.length})</option>
              {mistakeCategories.map(id => (
                <option key={id} value={id}>
                  {categoryName(id)} ({user.mistakes.filter(m => m.category === id).length})
                </option>
              ))}
            </select>
          </div>
          <ul className="dash-mistakes">
            {mistakes.map((m, i) => (
              <li key={`${m.ts}-${i}`}>
                <div className="dash-mistake-head">
                  <span>{categoryName(m.category)}</span>
                  <span className={`dash-final ${m.finalCorrect ? 'ok' : 'bad'}`}>
                    {m.finalCorrect ? g('תיקנה בניסיון נוסף') : g('לא הצליחה')}
                  </span>
                  <span className="dash-when">{formatWhen(m.ts)}</span>
                </div>
                <div className="dash-q" dir="auto">{m.question}</div>
                <div className="dash-answers">
                  <span className="given" dir="auto">❌ {m.given}</span>
                  <span className="correct" dir="auto">✅ {m.correct}</span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {!self && (
        <>
          <h4>🕒 זמני פעילות</h4>
          {user.sessions.length === 0 ? (
            <p className="admin-hint">עדיין אין נתונים - נרשמים מעכשיו בכל כניסה עם חשבון.</p>
          ) : (
            <>
              <p className="admin-hint">
                כניסות אחרונות: {user.sessions.length} · סה"כ {formatDuration(user.sessions.reduce((sum, s) => sum + s.minutes, 0))}.
                {' '}אחרי 15 דקות בלי נגיעה במסך הסשן נגמר, והסוף נרשם לפי הפעולה האחרונה.
              </p>
              <div className="table-scroll">
                <table className="dash-table dash-sessions">
                  <thead>
                    <tr><th>יום</th><th>שעות</th><th>משך</th><th>מכשיר</th></tr>
                  </thead>
                  <tbody>
                    {user.sessions.map(s => (
                      <tr key={s.id}>
                        <td>{formatDay(s.start)}</td>
                        <td>
                          <bdi dir="ltr">{formatClock(s.start)} – {s.live ? '' : formatClock(s.end)}</bdi>
                          {s.live && <span className="dash-live">🟢 עכשיו</span>}
                        </td>
                        <td>{formatDuration(s.minutes)}</td>
                        <td>{DEVICE_ICONS[s.type] || '❔'} <bdi>{s.device || 'לא ידוע'}</bdi></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {user.writingDraft.trim() && (
        <>
          <h4>✍️ {g('הקטע שכתבה על עצמה')}</h4>
          <div className="dash-writing" dir="ltr">{user.writingDraft}</div>
        </>
      )}
    </div>
  );
};

export default ProgressReport;
