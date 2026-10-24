import React, { useCallback, useEffect, useState } from 'react';
import { fetchAllUsers } from '../services/contentSync';
import { computeEscapeStats, formatSeconds } from '../data/escapeStats';
import { SUBJECTS } from '../data/subjects';
import { rateColor, formatWhen } from '../data/userStats';

const Time = ({ s }) => <bdi dir="ltr">{formatSeconds(s)}</bdi>;

// טבלה אחת לכל חלוקה: כמה אתגרים, כמה פוצחו, וכמה זמן לקח לפצח
const BreakdownTable = ({ title, rows }) => (
  <>
    <h4>{title}</h4>
    <table className="dash-table esc-table">
      <thead>
        <tr><th></th><th>אתגרים</th><th>פוצחו</th><th>זמן פיצוח (חציון)</th><th>הכי מהיר</th></tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.key} className={r.played ? '' : 'muted'}>
            <td>{r.label}</td>
            <td>{r.played}</td>
            <td>
              {r.played ? (
                <span className="rate-badge" style={{ background: rateColor(r.rate) }}>{r.opened} · {r.rate}%</span>
              ) : '—'}
            </td>
            <td><Time s={r.medianSeconds} /></td>
            <td><Time s={r.fastestSeconds} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
);

const EscapeDashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStats(computeEscapeStats(await fetchAllUsers()));
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

  return (
    <div className="dash dash-details">
      <div className="admin-row">
        <span className="admin-stats">
          🔐 אתגר מפצחי הכספות
          <span className="admin-hint"> (לפי מה שנשמר אצל משתמשים מחוברים)</span>
        </span>
        <button className="admin-small-btn" onClick={load} disabled={loading}>
          {loading ? 'טוען...' : '🔄 רענון'}
        </button>
      </div>

      {error && <div className="admin-error">⚠️ {error}</div>}

      {stats && stats.total.played === 0 && <p className="admin-empty">עדיין לא שוחקו אתגרים</p>}

      {stats && stats.total.played > 0 && (
        <>
          <div className="dash-kpis">
            <div className="dash-kpi"><b>{stats.total.played}</b><span>אתגרים</span></div>
            <div className="dash-kpi"><b>{stats.total.rate}%</b><span>כספות פוצחו ({stats.total.opened})</span></div>
            <div className="dash-kpi"><b><Time s={stats.total.medianSeconds} /></b><span>זמן פיצוח (חציון)</span></div>
            <div className="dash-kpi"><b>{stats.playersCount}</b><span>ילדים שהשתתפו</span></div>
          </div>

          <BreakdownTable
            title="לפי מקצוע"
            rows={stats.bySubject.map(s => ({ ...s, key: s.id, label: `${SUBJECTS[s.id].emoji} ${SUBJECTS[s.id].name}` }))}
          />
          <BreakdownTable
            title="לפי גודל האתגר"
            rows={stats.bySize.map(s => ({ ...s, key: s.tasks, label: `${s.tasks} משימות · ${s.minutes} דק'` }))}
          />
          <BreakdownTable
            title="לפי גודל הצוות"
            rows={stats.byTeam.map(s => ({ ...s, key: s.id }))}
          />

          <h4>הכי פעילים</h4>
          <ul className="esc-players">
            {stats.topPlayers.map(p => (
              <li key={p.uid}>
                <span className="dash-avatar small">{p.character}</span>
                <b>{p.name}</b>
                <span className="dash-sub">{p.played} אתגרים · {p.opened} פוצחו</span>
              </li>
            ))}
          </ul>

          <h4>אתגרים אחרונים</h4>
          <ul className="esc-recent">
            {stats.recent.map(r => (
              <li key={r.id} className={r.opened ? 'opened' : ''}>
                <span aria-hidden="true">{r.opened ? '🗝️' : '🔐'}</span>
                <span className="esc-recent-main">
                  <b>{r.team || 'צוות'}</b>
                  <span className="dash-sub">
                    {SUBJECTS[r.subject].emoji} {SUBJECTS[r.subject].name}
                    {r.tasks ? ` · ${r.tasks} משימות` : ''}
                    {' · '}
                    {r.opened ? <>פוצח ב-<Time s={r.seconds} /></> : `${r.filled}/${r.total} מנעולים`}
                  </span>
                  <span className="dash-sub">{r.players.map(p => `${p.character} ${p.name}`).join(' · ')}</span>
                </span>
                <span className="dash-when">{formatWhen(r.at)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default EscapeDashboard;
