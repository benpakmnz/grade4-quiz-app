import React, { useCallback, useEffect, useState } from 'react';
import { fetchAllUsers } from '../services/contentSync';
import { parseAllUsers, rateColor, formatWhen } from '../data/userStats';
import ProgressReport from './ProgressReport';
import { DEVICE_ICONS } from '../utils/device';

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
  if (user) return <ProgressReport user={user} mode="admin" onBack={() => setSelected(null)} backLabel="→ לכל המשתמשים" />;

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
                  <span className="rate-badge" style={{ background: rateColor(u.overall.rate) }}>
                    {u.overall.rate === null ? '—' : `${u.overall.rate}%`}
                  </span>
                  <span className="dash-when">
                    {u.online ? '🟢 מחובר/ת עכשיו' : formatWhen(Math.max(u.lastSeen, u.lastPractice))}
                    {u.sessions[0] && <> · {DEVICE_ICONS[u.sessions[0].type] || ''}</>}
                  </span>
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
