import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchAllUsers, fetchUser, setExamDate } from '../services/contentSync';
import { fetchAllClasses } from '../services/classSync';
import { parseUser, rateColor, formatWhen } from '../data/userStats';
import { computeClassStats, studentSubject, ACTIVE_DAYS, STRUGGLE_RATE } from '../data/classStats';
import { SUBJECTS } from '../data/subjects';
import { DEFAULT_CLASS, classById, classLabel, classJoinLink } from '../data/classes';
import ProgressReport from './ProgressReport';
import { QuestionsEditor } from './AdminPanel';
import './Game.css';
import './EnglishGame.css';
import './AdminPanel.css';
import './TeacherPanel.css';

const Rate = ({ rate }) => (
  <span className="rate-badge" style={{ background: rateColor(rate) }}>{rate === null ? '—' : `${rate}%`}</span>
);

/**
 * תלמידי הכיתה. מורה קוראת כל תלמיד/ה לבד (הכללים מאפשרים רק את הכיתה שלה);
 * מנהל/ת קורא/ת את כולם ומסנן/ת לפי כיתה (בלי שיוך = כיתת ברירת המחדל)
 */
const loadStudents = async (classId, isAdmin, selfUid) => {
  const classes = await fetchAllClasses();
  if (isAdmin) {
    const all = await fetchAllUsers();
    return Object.entries(all)
      .filter(([uid]) => uid !== selfUid && (classes[uid] || DEFAULT_CLASS) === classId)
      .map(([uid, raw]) => parseUser(uid, raw));
  }
  const uids = Object.keys(classes).filter(uid => classes[uid] === classId && uid !== selfUid);
  const raws = await Promise.all(uids.map(uid => fetchUser(uid).catch(() => null)));
  return uids.map((uid, i) => raws[i] && parseUser(uid, raws[i])).filter(Boolean);
};

// ---------- סיכום כיתה ----------
const ClassSummary = ({ stats, subjects, onOpen }) => {
  const [subject, setSubject] = useState(subjects[0]);
  const sub = stats.subjects.find(s => s.id === subject) || stats.subjects[0];
  return (
    <div className="dash dash-details">
      <div className="dash-kpis">
        <div className="dash-kpi"><b>{stats.count}</b><span>תלמידים</span></div>
        <div className="dash-kpi"><b>{stats.activeCount}</b><span>תרגלו ב-{ACTIVE_DAYS} הימים האחרונים</span></div>
        <div className="dash-kpi"><b>{stats.answers}</b><span>תשובות</span></div>
        <div className="dash-kpi"><b>{stats.rate === null ? '—' : `${stats.rate}%`}</b><span>הצלחה ממוצעת</span></div>
      </div>

      {stats.attention.length > 0 && (
        <>
          <h4>👀 כדאי לשים לב</h4>
          <ul className="tp-attention">
            {stats.attention.map(({ user, reasons }) => (
              <li key={user.uid}>
                <button onClick={() => onOpen(user.uid)}>
                  <span className="dash-avatar small">{user.character}</span>
                  <b>{user.name}</b>
                  <span className="dash-sub">{reasons.join(' · ')}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <h4>📚 הצלחה לפי נושא</h4>
      {subjects.length > 1 && (
        <div className="report-subjects" role="tablist" aria-label="מקצוע">
          {subjects.map(id => (
            <button key={id} role="tab" aria-selected={subject === id} className={`report-subject ${subject === id ? 'active' : ''}`} onClick={() => setSubject(id)}>
              {SUBJECTS[id].emoji} {SUBJECTS[id].name}
            </button>
          ))}
        </div>
      )}
      {sub.hardest.length > 0 && (
        <div className="dash-focus">
          🎯 הנושאים הכי קשים לכיתה: {sub.hardest.map(t => `${t.name} (${t.rate}%)`).join(', ')}
        </div>
      )}
      <table className="dash-table tp-topics">
        <thead>
          <tr><th>נושא</th><th>תרגלו</th><th>הצלחה</th><th>מתקשים (מתחת ל-{STRUGGLE_RATE}%)</th></tr>
        </thead>
        <tbody>
          {sub.topics.map(t => (
            <tr key={t.id} className={t.practiced ? '' : 'muted'}>
              <td>{t.emoji} {t.name}</td>
              <td>{t.practiced} / {stats.count}</td>
              <td><Rate rate={t.rate} /></td>
              <td className="tp-names">
                {t.struggling.length
                  ? t.struggling.map(u => <button key={u.uid} className="tp-name" onClick={() => onOpen(u.uid)}>{u.name}</button>)
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ---------- רשימת התלמידים ----------
const SORTS = {
  name: { label: 'שם', fn: (a, b) => a.name.localeCompare(b.name, 'he') },
  active: { label: 'פעילות אחרונה', fn: (a, b) => Math.max(b.lastSeen, b.lastPractice) - Math.max(a.lastSeen, a.lastPractice) },
  low: { label: 'הצלחה (מהנמוכה)', fn: (a, b) => (a.overall.rate ?? 101) - (b.overall.rate ?? 101) }
};

const StudentList = ({ users, subjects, onOpen }) => {
  const [sort, setSort] = useState('name');
  const sorted = [...users].sort(SORTS[sort].fn);
  return (
    <div className="dash">
      <div className="admin-row">
        <span className="admin-hint">מיון:</span>
        {Object.entries(SORTS).map(([id, s]) => (
          <button key={id} className={`admin-small-btn ${sort === id ? 'active' : ''}`} onClick={() => setSort(id)}>{s.label}</button>
        ))}
      </div>
      <ul className="dash-users">
        {sorted.map(u => (
          <li key={u.uid}>
            <button className="dash-user" onClick={() => onOpen(u.uid)}>
              <span className="dash-avatar small">{u.character}</span>
              <span className="dash-user-main">
                <b>{u.name}</b>
                <span className="dash-sub">
                  {subjects.map(sid => {
                    const s = studentSubject(u, sid);
                    return <span key={sid} className="tp-subj">{SUBJECTS[sid].emoji} {s.total ? `${s.rate}% · מוכנות ${s.readiness}%` : 'לא תרגל/ה'}</span>;
                  })}
                </span>
              </span>
              <span className="dash-user-stats">
                <span>{u.overall.total} תשובות</span>
                <Rate rate={u.overall.rate} />
                <span className="dash-when">{formatWhen(Math.max(u.lastSeen, u.lastPractice))}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ---------- מועדי מבחנים ----------
const ExamDates = ({ classId, subjects, examDates }) => {
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState(null);
  const save = async (sid, value) => {
    setSaving(sid);
    setError(null);
    try {
      await setExamDate(classId, sid, value);
    } catch (err) {
      setError(`השמירה נכשלה: ${err?.message || err}`);
    }
    setSaving(null);
  };
  return (
    <div className="dash">
      <p className="admin-hint">התאריך מופיע אצל התלמידים כספירה לאחור, והמקצוע עם המבחן הקרוב מופיע ראשון. בלי תאריך - אין ספירה לאחור.</p>
      {subjects.map(sid => (
        <div key={sid} className="admin-row tp-exam">
          <b>{SUBJECTS[sid].emoji} {SUBJECTS[sid].name}</b>
          <input type="date" className="admin-input narrow" value={examDates[sid] || ''} disabled={saving === sid}
            onChange={e => save(sid, e.target.value)} aria-label={`מועד המבחן ב${SUBJECTS[sid].name}`} />
          {examDates[sid] && <button className="admin-small-btn" onClick={() => save(sid, '')}>מחיקה</button>}
        </div>
      ))}
      {error && <div className="admin-error">⚠️ {error}</div>}
    </div>
  );
};

// ---------- המסך הראשי ----------
const TeacherPanel = ({ classId, authUser, isAdmin = false, examDates = {}, onBack }) => {
  const cls = classById(classId);
  const [tab, setTab] = useState('summary');
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await loadStudents(classId, isAdmin, authUser?.uid));
    } catch (err) {
      setError(/permission/i.test(err?.message || '')
        ? 'אין הרשאה לקרוא את נתוני התלמידים. אם הגדרת מורה חדשה - צריך לפרסם את כללי האבטחה המעודכנים.'
        : `הטעינה נכשלה: ${err?.message || err}`);
    }
    setLoading(false);
  }, [classId, isAdmin, authUser]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => (users ? computeClassStats(users, cls.subjects) : null), [users, cls]);
  const user = selected && users?.find(u => u.uid === selected);

  const copyLink = () => {
    navigator.clipboard?.writeText(classJoinLink(classId)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  };

  return (
    <div className="math-game english-game admin-panel teacher-panel">
      <div className="game-header">
        <button className="back-button" onClick={selected ? () => setSelected(null) : onBack}>{selected ? '← לכל התלמידים' : '← חזרה'}</button>
        <h2 className="game-title">👩‍🏫 {classLabel(classId)}</h2>
      </div>

      {user ? (
        <div className="admin-card">
          <ProgressReport key={user.uid} user={user} mode="teacher" subjects={cls.subjects} onBack={() => setSelected(null)} backLabel="→ לכל התלמידים" />
        </div>
      ) : (
        <>
          <div className="mode-tabs">
            {[['summary', '📊 סיכום הכיתה'], ['students', '👧 תלמידים'], ['questions', '📝 שאלות'], ['exams', '📅 מבחנים']].map(([id, label]) => (
              <button key={id} className={`mode-tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>
            ))}
          </div>

          {(tab === 'summary' || tab === 'students') && (
            <div className="admin-card">
              <div className="admin-row">
                <span className="admin-stats">{users ? `${users.length} תלמידים בכיתה` : ''}</span>
                <button className="admin-small-btn" onClick={load} disabled={loading}>{loading ? 'טוען...' : '🔄 רענון'}</button>
                <button className="admin-small-btn" onClick={copyLink}>{copied ? '✓ הועתק' : '🔗 קישור הצטרפות לכיתה'}</button>
              </div>
              {error && <div className="admin-error">⚠️ {error}</div>}
              {users && users.length === 0 && (
                <p className="admin-empty">
                  עדיין אין תלמידים בכיתה. שלחי להורים את קישור ההצטרפות - כל מי שנרשם דרכו מצטרף לכיתה.
                  <br />
                  <code dir="ltr">{classJoinLink(classId)}</code>
                </p>
              )}
              {users && users.length > 0 && tab === 'summary' && <ClassSummary stats={stats} subjects={cls.subjects} onOpen={setSelected} />}
              {users && users.length > 0 && tab === 'students' && <StudentList users={users} subjects={cls.subjects} onOpen={setSelected} />}
            </div>
          )}

          {tab === 'questions' && (
            <QuestionsEditor note={cls.content
              ? `השינויים כאן חלים רק על ${classLabel(classId)}. אפשר להוסיף שאלות משלך ולהסתיר שאלות מובנות.`
              : `שימו לב: לכיתה הזו אין מאגר נפרד - השינויים חלים על המאגר הראשי.`} />
          )}

          {tab === 'exams' && (
            <div className="admin-card">
              <ExamDates classId={classId} subjects={cls.subjects} examDates={examDates} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeacherPanel;
