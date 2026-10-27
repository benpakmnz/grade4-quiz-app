import React, { useState } from 'react';
import { rateColor, formatWhen, parseUser, formatDuration, formatClock, formatDay } from '../data/userStats';
import { DEVICE_ICONS } from '../utils/device';
import { readLocalProgress } from '../services/cloudSync';
import './AdminPanel.css';
import './ProgressReport.css';
import { TARGET_PER_CATEGORY } from '../data/categories';
import { allCategories as categories, SUBJECTS, SUBJECT_IDS } from '../data/subjects';
import { mistakeSubject } from '../utils/mistakeLimits';
import { hasLesson } from '../data/lessons';
import { getGenderText } from '../utils/genderText';
import MathText from './MathText';

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
  mixed: 'לחזור לנושא שבו היו הכי הרבה טעויות במבחן ולתרגל אותו לבד לפני מבחן נוסף.',
  // חשבון
  mPlaceValue: 'לכתוב יחד מספר גדול (למשל מחיר דירה במודעה) ולשאול: "כמה שווה כל ספרה?". אפשר לפרק לפילוג ולקרוא בקול.',
  mNumberLine: 'לצייר ישר מספרים על דף, לסמן שני מספרים ולשאול כמה שווה כל קפיצה - ורק אז איפה החץ.',
  mCompare: 'לבחור שני מספרים מחשבונית או משלט ולשאול מי גדול יותר ולמה. בסדרות - קודם למצוא את ההפרש בין שני מספרים סמוכים.',
  mOperations: 'לפתור יחד תרגיל אחד במאונך, ולבקש לבדוק אותו בפעולה ההפוכה (חיסור בחיבור, חילוק בכפל).',
  mOrderOps: 'לסמן בעיפרון את הפעולה הראשונה (סוגריים, אחר כך כפל וחילוק), לפתור אותה ולהעתיק מחדש את מה שנשאר.',
  mEquations: 'לשאול: "מה עושה הריבוע?" ולפתור בפעולה ההפוכה. בסוף - להציב את המספר ולבדוק שהתרגיל נכון.',
  mWordProblems: 'לקרוא יחד פעמיים, לסמן את המספרים ואת השאלה, ולהחליט ביחד איזו פעולה מתאימה לכל שלב.',
  mFractionMeaning: 'לחלק פיצה, שוקולד או תפוח לחלקים שווים ולשאול "איזה חלק אכלנו?" ו"כמה הם שלושה רבעים מ-12?".',
  mFractionAdd: 'לזכור יחד: המכנה לא משתנה! שלמים עם שלמים, שברים עם שברים. לצייר פסים מחולקים כדי לראות.',
  mMixed: 'לצייר עיגולים מחולקים לרבעים, לצבוע 7 רבעים, ולראות יחד שזה שלם אחד ועוד 3 רבעים.',
  mFractionWords: 'להפוך כל סיפור לציור (עוגה, פס, קבוצות) לפני שמחשבים. לשאול: "מה השלם כאן?".',
  mPolygonSides: 'לחפש בבית צלעות מקבילות ומאונכות (בדלת, בחלון, בספר). לבדוק "מאונכות" עם פינה של דף.',
  mAngles: 'להשתמש בפינה של דף כ"בודק זוויות": נכנסת בפנים - חדה, בדיוק - ישרה, יוצאת החוצה - קהה.',
  mAreaPerimeter: 'למדוד יחד שולחן או ספר: מסביב (גדר) = היקף, הכיסוי (מפה) = שטח. לשים לב ליחידות (ס"מ מול סמ"ר).',
  mTest: 'לחזור לנושא שבו היו הכי הרבה טעויות במבחן המסכם ולתרגל אותו לבד, ואז לנסות שוב את המבחן.',
  hRoots: 'לבחור מילה (למשל "מכתב") ולמצוא יחד עוד 3 מילים מאותה משפחה. לבדוק: אילו 3 אותיות חוזרות בכולן? זה השורש.',
  hNouns: 'לשחק "אחד או אחת?": אומרים שם עצם, והילד/ה עונה זכר או נקבה ואומר/ת אותו ברבים. לשים לב למלכודות כמו ציפורים ושולחנות.',
  hConnectives: 'לחבר שני משפטים קצרים מהיום-יום ("הייתי עייף/ה" + "הלכתי לישון") עם מילות קישור שונות, ולשאול: איזו מתאימה ולמה?',
  hTenses: 'לבחור פועל אחד ולספר עליו בשלושה זמנים: "אתמול כתבתי, עכשיו אני כותב/ת, מחר אכתוב". לחפש במשפטים מילות זמן.',
  hVerbs: 'לקרוא משפט מספר ולשאול "מה עשו?" כדי למצוא את הפועל, ואז להוריד ממנו את התוספות ולמצוא את השורש.',
  hPronouns: 'להחליף שמות בכינויי גוף בזמן שיחה: "דני ונועה" ← הם, "אני ואבא" ← אנחנו. לבדוק שהפועל מתאים (אנחנו הלכנו).',
  hTest: 'לחזור לנושא בשפה שבו היו הכי הרבה טעויות במבחן המסכם, לקרוא את "איך פותרים?" ולתרגל אותו לבד.',
  hReading: 'לקרוא יחד סיפור קצר ולשאול: מה כתוב במפורש? מה אפשר להבין "בין השורות"? מה הרעיון המרכזי? ולחפש בו מילות קישור.',
  // חשבון כיתה ג'
  g3Numbers: 'לבחור מספר מהסביבה (מספר בית, מחיר) ולשאול: כמה מאות, עשרות ויחידות? מה העוקב? איך כותבים אותו במילים?',
  g3Sequences: 'לספור יחד בקפיצות (של 2, 5, 10, 100) קדימה ואחורה, ולעצור כדי לשאול "מה המספר הבא?".',
  g3Operations: 'לתרגל לוח הכפל בעל פה כמה דקות ביום, ובחיבור וחיסור - לחשב קודם עשרות ואחר כך יחידות.',
  g3Missing: 'לשאול "כמה חסר?" במצבים יומיומיים: יש 7 צלחות ואנחנו 10 - כמה עוד צריך? ולבדוק עם התרגיל המלא.',
  g3Word: 'לקרוא את הבעיה יחד, לסמן את מילות המפתח (עוד, נשאר, בכל, חילקו) ולבחור את הפעולה לפני שמחשבים.',
  g3Perimeter: 'למדוד יחד את ההיקף של שולחן או ספר בסרגל: מחברים את כל הצלעות מסביב.',
  g3Area: 'לצייר מלבנים על דף משבצות ולספור ריבועים, ואז לבדוק שזה שווה לאורך × רוחב.',
  g3Test: 'לחזור לנושא שבו היו הכי הרבה טעויות במבחן המסכם, לקרוא את "איך פותרים?" ולתרגל אותו.'
};

/**
 * דוח התקדמות של משתמש אחד.
 * mode='admin' - מתוך ממשק הניהול; mode='self' - התלמיד/ההורה רואים את הדוח של עצמם
 */
const ProgressReport = ({ user, mode = 'admin', onBack, backLabel, gender, onOpenLesson, onPractice, subjects = SUBJECT_IDS, defaultSubject, fixedSubject }) => {
  const [mistakeFilter, setMistakeFilter] = useState('all');
  // מקצוע אחד בכל פעם: נפתח על המקצוע הנוכחי; בממשק הניהול - על המקצוע שתורגל הכי הרבה
  const [subjectFilter, setSubjectFilter] = useState(() => {
    if (subjects.includes(defaultSubject)) return defaultSubject;
    const answers = (sid) => user.perCategory.filter(c => c.subject === sid).reduce((s, c) => s + c.total, 0);
    return [...subjects].sort((a, b) => answers(b) - answers(a))[0];
  });
  const g = (t) => getGenderText(t, gender);
  const self = mode === 'self';

  // מקצועות שהמשתמש/ת לא רואה (חשבון בזמן הבדיקה) לא מופיעים בדוח שלו/ה
  // fixedSubject - המקצוע נבחר מבחוץ (בחלון ההישגים), ואז אין כאן בחירה נוספת
  const shownSubjects = [fixedSubject || subjectFilter];
  const perCategory = user.perCategory.filter(c => shownSubjects.includes(c.subject));
  const practiced = perCategory.filter(c => c.total > 0);
  const weakest = [...practiced].sort((a, b) => a.rate - b.rate).slice(0, 3).filter(c => c.rate < 80);
  const practicedSubjects = new Set(practiced.map(c => c.subject));
  const notStarted = perCategory.filter(c => c.total === 0 && practicedSubjects.has(c.subject));
  const subjectMistakes = user.mistakes.filter(m => shownSubjects.includes(mistakeSubject(m)));
  const mistakes = subjectMistakes.filter(m => mistakeFilter === 'all' || m.category === mistakeFilter);
  const mistakeCategories = [...new Set(subjectMistakes.map(m => m.category))];
  const correct = perCategory.reduce((s, c) => s + c.correct, 0);
  const total = perCategory.reduce((s, c) => s + c.total, 0);
  const rate = total > 0 ? Math.round((correct / total) * 100) : null;

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

      {subjects.length > 1 && !fixedSubject && (
        <div className="report-subjects" role="tablist" aria-label="מקצוע">
          {subjects.map(id => (
            <button
              key={id}
              role="tab"
              aria-selected={subjectFilter === id}
              className={`report-subject ${subjectFilter === id ? 'active' : ''}`}
              onClick={() => { setSubjectFilter(id); setMistakeFilter('all'); }}
            >
              {SUBJECTS[id].emoji} {SUBJECTS[id].name}
            </button>
          ))}
        </div>
      )}

      <div className="dash-kpis">
        <div className="dash-kpi"><b>{user.score}</b><span>נקודות</span></div>
        <div className="dash-kpi"><b>{total}</b><span>תשובות</span></div>
        <div className="dash-kpi"><b>{rate === null ? '—' : `${rate}%`}</b><span>הצלחה</span></div>
        <div className="dash-kpi"><b>{subjectMistakes.length}</b><span>טעויות ביומן</span></div>
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
            {perCategory.map(c => (
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
      {subjectMistakes.length === 0 ? (
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
              <option value="all">כל הנושאים ({subjectMistakes.length})</option>
              {mistakeCategories.map(id => (
                <option key={id} value={id}>
                  {categoryName(id)} ({subjectMistakes.filter(m => m.category === id).length})
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
                <div className="dash-q" dir="auto"><MathText text={m.question} /></div>
                <div className="dash-answers">
                  <span className="given" dir="auto">❌ <MathText text={m.given} /></span>
                  <span className="correct" dir="auto">✅ <MathText text={m.correct} /></span>
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
