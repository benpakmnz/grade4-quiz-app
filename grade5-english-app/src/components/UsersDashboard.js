import React, { useCallback, useEffect, useState } from 'react';
import { fetchAllUsers } from '../services/contentSync';
import { parseAllUsers, rateColor, formatWhen } from '../data/userStats';
import { categories, TARGET_PER_CATEGORY } from '../data/categories';

const categoryName = (id) => {
  const c = categories.find(x => x.id === id);
  return c ? `${c.emoji} ${c.name}` : id;
};

const RateBadge = ({ rate }) => (
  <span className="rate-badge" style={{ background: rateColor(rate) }}>
    {rate === null ? '—' : `${rate}%`}
  </span>
);

// ---------- פרטי משתמש ----------
const UserDetails = ({ user, onBack }) => {
  const [mistakeFilter, setMistakeFilter] = useState('all');
  const practiced = user.perCategory.filter(c => c.total > 0);
  const weakest = [...practiced].sort((a, b) => a.rate - b.rate).slice(0, 3).filter(c => c.rate < 80);
  const mistakes = user.mistakes.filter(m => mistakeFilter === 'all' || m.category === mistakeFilter);
  const mistakeCategories = [...new Set(user.mistakes.map(m => m.category))];

  return (
    <div className="dash-details">
      <button className="admin-small-btn" onClick={onBack}>→ לכל המשתמשים</button>

      <div className="dash-user-head">
        <span className="dash-avatar">{user.character}</span>
        <div>
          <h3>{user.name}</h3>
          <div className="dash-sub">{user.email || `👤 ${user.username}`} · תרגול אחרון: {formatWhen(user.lastPractice || user.lastSeen)}</div>
        </div>
      </div>

      <div className="dash-kpis">
        <div className="dash-kpi"><b>{user.score}</b><span>נקודות</span></div>
        <div className="dash-kpi"><b>{user.overall.total}</b><span>תשובות</span></div>
        <div className="dash-kpi"><b>{user.overall.rate === null ? '—' : `${user.overall.rate}%`}</b><span>הצלחה</span></div>
        <div className="dash-kpi"><b>{user.mistakes.length}</b><span>טעויות ביומן</span></div>
      </div>

      {weakest.length > 0 && (
        <div className="dash-focus">
          🎯 <b>כדאי לעבור יחד על:</b> {weakest.map(c => `${c.emoji} ${c.name} (${c.rate}%)`).join(' · ')}
        </div>
      )}

      <h4>הצלחה לפי נושא</h4>
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

      <h4>יומן טעויות</h4>
      {user.mistakes.length === 0 ? (
        <p className="admin-hint">
          אין עדיין טעויות ביומן. היומן נשמר מהגרסה הזו והלאה - שאלות שנענו לפני כן לא מופיעות.
        </p>
      ) : (
        <>
          <div className="admin-row">
            <select className="admin-input narrow" value={mistakeFilter} onChange={e => setMistakeFilter(e.target.value)}>
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
                    {m.finalCorrect ? 'תיקנה בניסיון נוסף' : 'לא הצליחה'}
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

      {user.writingDraft.trim() && (
        <>
          <h4>✍️ הקטע שכתבה על עצמה</h4>
          <div className="dash-writing" dir="ltr">{user.writingDraft}</div>
        </>
      )}
    </div>
  );
};

// ---------- רשימת משתמשים ----------
const UsersDashboard = () => {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(parseAllUsers(await fetchAllUsers()));
    } catch (err) {
      setError(/permission/i.test(err?.message || '')
        ? 'אין הרשאה לקרוא את נתוני המשתמשים - צריך לפרסם את כללי האבטחה המעודכנים (database.rules.json)'
        : `הטעינה נכשלה: ${err?.message || err}`);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const user = selected && users?.find(u => u.uid === selected);
  if (user) return <UserDetails user={user} onBack={() => setSelected(null)} />;

  return (
    <div className="dash">
      <div className="admin-row">
        <span className="admin-stats">
          {users ? `${users.length} משתמשים מחוברים` : ''}
          <span className="admin-hint"> (מי שמתרגל בלי התחברות לא מופיע כאן)</span>
        </span>
        <button className="admin-small-btn" onClick={load} disabled={loading}>
          {loading ? 'טוען...' : '🔄 רענון'}
        </button>
      </div>

      {error && <div className="admin-error">⚠️ {error}</div>}

      {users && users.length === 0 && <p className="admin-empty">עדיין אין משתמשים</p>}

      {users && users.length > 0 && (
        <ul className="dash-users">
          {users.map(u => (
            <li key={u.uid}>
              <button className="dash-user" onClick={() => setSelected(u.uid)}>
                <span className="dash-avatar small">{u.character}</span>
                <span className="dash-user-main">
                  <b>{u.name}</b>
                  <span className="dash-sub">{u.email || `👤 ${u.username}`}</span>
                </span>
                <span className="dash-user-stats">
                  <span>⭐ {u.score}</span>
                  <span>{u.overall.total} תשובות</span>
                  <RateBadge rate={u.overall.rate} />
                  <span className="dash-when">{formatWhen(Math.max(u.lastSeen, u.lastPractice))}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UsersDashboard;
