import React, { useCallback, useEffect, useState } from 'react';
import { fetchAllUsers, fetchTeachers, setTeacherOf } from '../services/contentSync';
import { parseAllUsers, rateColor, formatWhen } from '../data/userStats';
import ProgressReport from './ProgressReport';
import { DEVICE_ICONS } from '../utils/device';
import { fetchAllClasses, setUserClass } from '../services/classSync';
import { CLASS_IDS, DEFAULT_CLASS, classById, classLabel, classJoinLink } from '../data/classes';

// קישורי ההצטרפות לכל כיתה - שולחים להורים, והילד/ה משויך/ת לכיתה בהרשמה
const JoinLinks = () => {
  const [copied, setCopied] = useState(null);
  const copy = (id) => {
    navigator.clipboard?.writeText(classJoinLink(id)).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    }).catch(() => {});
  };
  return (
    <details className="dash-join">
      <summary>🔗 קישורי הצטרפות לכיתות</summary>
      {CLASS_IDS.map(id => (
        <div key={id} className="admin-row">
          <b>{classLabel(id)}</b>
          <code dir="ltr">{classJoinLink(id)}</code>
          <button className="admin-small-btn" onClick={() => copy(id)}>{copied === id ? '✓ הועתק' : '📋 העתקה'}</button>
        </div>
      ))}
      <span className="admin-hint">ילד/ה שנרשם/ת דרך הקישור משויך/ת לכיתה. מי שנרשם/ה בלי קישור - ל{classLabel(DEFAULT_CLASS)}.</span>
    </details>
  );
};

// ---------- רשימת משתמשים ----------
const UsersDashboard = () => {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [classes, setClasses] = useState({});
  const [teachers, setTeachers] = useState({});
  const [filter, setFilter] = useState('all');
  const [moving, setMoving] = useState(false);
  const classOf = (uid) => classes[uid] || DEFAULT_CLASS;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [all, cls, tch] = await Promise.all([fetchAllUsers(), fetchAllClasses().catch(() => ({})), fetchTeachers().catch(() => ({}))]);
      setUsers(parseAllUsers(all));
      setClasses(cls);
      setTeachers(tch);
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

  const moveTo = async (uid, id) => {
    setMoving(true);
    try {
      await setUserClass(uid, id);
      setClasses(c => ({ ...c, [uid]: id }));
    } catch (err) {
      setError(`ההעברה נכשלה: ${err?.message || err}`);
    }
    setMoving(false);
  };

  // מורה: מקבל/ת גישה לנתוני התלמידים ולמאגר השאלות של הכיתה, ועובר/ת לכיתה הזו
  const makeTeacher = async (uid, id) => {
    if (id && !window.confirm(`להגדיר את המשתמש/ת כמורה של ${classLabel(id)}?\nהמורה תראה את נתוני כל התלמידים בכיתה ותוכל לערוך את מאגר השאלות שלה.`)) return;
    setMoving(true);
    try {
      await setTeacherOf(uid, id || null);
      if (id) {
        await setUserClass(uid, id);
        setClasses(c => ({ ...c, [uid]: id }));
      }
      setTeachers(t => {
        const n = { ...t };
        if (id) n[uid] = id; else delete n[uid];
        return n;
      });
    } catch (err) {
      setError(`השמירה נכשלה: ${err?.message || err}`);
    }
    setMoving(false);
  };

  const user = selected && users?.find(u => u.uid === selected);
  if (user) {
    return (
      <>
        <div className="admin-row dash-class-row">
          <span>🏫 כיתה:</span>
          <select className="admin-input narrow" value={classOf(user.uid)} disabled={moving} onChange={e => moveTo(user.uid, e.target.value)}>
            {CLASS_IDS.map(id => <option key={id} value={id}>{classLabel(id)}</option>)}
          </select>
          <span>👩‍🏫 מורה של:</span>
          <select className="admin-input narrow" value={teachers[user.uid] || ''} disabled={moving} onChange={e => makeTeacher(user.uid, e.target.value)}>
            <option value="">לא מורה</option>
            {CLASS_IDS.map(id => <option key={id} value={id}>{classLabel(id)}</option>)}
          </select>
          {moving && <span className="admin-hint">שומרים...</span>}
        </div>
        <ProgressReport
          key={classOf(user.uid)}
          user={user}
          mode="admin"
          subjects={classById(classOf(user.uid)).subjects}
          onBack={() => setSelected(null)}
          backLabel="→ לכל המשתמשים"
        />
      </>
    );
  }
  const shown = users?.filter(u => filter === 'all' || classOf(u.uid) === filter);

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

      <JoinLinks />

      {users && (
        <div className="report-subjects" role="tablist" aria-label="כיתה">
          {['all', ...CLASS_IDS].map(id => (
            <button key={id} role="tab" aria-selected={filter === id}
              className={`report-subject ${filter === id ? 'active' : ''}`} onClick={() => setFilter(id)}>
              {id === 'all' ? `כולם (${users.length})` : `${classLabel(id)} (${users.filter(u => classOf(u.uid) === id).length})`}
            </button>
          ))}
        </div>
      )}

      {error && <div className="admin-error">⚠️ {error}</div>}

      {users && users.length === 0 && <p className="admin-empty">עדיין אין משתמשים</p>}

      {shown && shown.length === 0 && users.length > 0 && <p className="admin-empty">אין עדיין משתמשים בכיתה הזו</p>}

      {shown && shown.length > 0 && (
        <ul className="dash-users">
          {shown.map(u => (
            <li key={u.uid}>
              <button className="dash-user" onClick={() => setSelected(u.uid)}>
                <span className="dash-avatar small">{u.character}</span>
                <span className="dash-user-main">
                  <b>{u.name}</b>
                  <span className="dash-sub">{teachers[u.uid] && <>👩‍🏫 מורה · </>}{u.email || `👤 ${u.username}`}{filter === 'all' && CLASS_IDS.length > 1 && <> · 🏫 {classById(classOf(u.uid)).grade}'</>}</span>
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
