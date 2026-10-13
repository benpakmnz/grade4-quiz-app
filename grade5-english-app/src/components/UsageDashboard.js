import React, { useCallback, useEffect, useRef, useState } from 'react';
import { fetchVisitsSince, subscribePresence } from '../services/contentSync';
import { computeUsage, lastDays, shortDay, niceMax } from '../data/usageStats';

const RANGES = [7, 14, 30];

// ---------- גרף עמודות מוערמות: מחוברים (למטה) + אורחים (למעלה) ----------
const PAD = { top: 14, right: 10, bottom: 28, left: 34 };
const GAP = 2; // רווח בצבע הרקע בין שני חלקי העמודה
const R = 4; // פינות עגולות רק בקצה העליון של העמודה

// מלבן עם פינות עליונות עגולות ובסיס ישר
const topRoundedRect = (x, y, w, h, r) => {
  const rr = Math.min(r, h, w / 2);
  if (h <= 0) return '';
  return `M${x},${y + h} L${x},${y + rr} Q${x},${y} ${x + rr},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h} Z`;
};

const UsageChart = ({ series }) => {
  const [hover, setHover] = useState(null);
  // מציירים ברוחב האמיתי של המסך, כדי שהטקסט יישאר קריא גם בטלפון
  const boxRef = useRef(null);
  const [W, setW] = useState(640);
  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([entry]) => setW(Math.max(280, Math.round(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = W < 500 ? 200 : 240;
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const max = niceMax(Math.max(1, ...series.map(d => d.total)));
  const slot = plotW / series.length;
  const barW = Math.max(6, Math.min(28, slot * 0.6));
  const y = (v) => PAD.top + plotH - (v / max) * plotH;
  const labelEvery = Math.max(1, Math.ceil(40 / slot)); // תווית תאריך כל ~40 פיקסלים
  const ticks = [0, 1, 2, 3, 4].map(i => (max / 4) * i);

  return (
    <div className="usage-chart" dir="ltr" ref={boxRef}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="מבקרים ייחודיים ליום">
        {ticks.map(t => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className={t === 0 ? 'axis' : 'grid'} />
            <text x={PAD.left - 6} y={y(t) + 4} textAnchor="end" className="tick">{t}</text>
          </g>
        ))}
        {series.map((d, i) => {
          const x = PAD.left + slot * i + (slot - barW) / 2;
          const baseY = y(0);
          const inH = (d.signedIn / max) * plotH;
          const guestH = (d.guests / max) * plotH;
          const topIsGuests = d.guests > 0;
          const dim = hover !== null && hover !== i;
          return (
            <g key={d.day} opacity={dim ? 0.45 : 1}>
              {d.signedIn > 0 && (
                <path
                  className="bar signed"
                  d={topIsGuests
                    ? `M${x},${baseY} L${x},${baseY - inH} L${x + barW},${baseY - inH} L${x + barW},${baseY} Z`
                    : topRoundedRect(x, baseY - inH, barW, inH, R)}
                />
              )}
              {topIsGuests && (
                <path
                  className="bar guests"
                  d={topRoundedRect(x, baseY - inH - guestH, barW, Math.max(0, guestH - (d.signedIn > 0 ? GAP : 0)), R)}
                />
              )}
              {i % labelEvery === 0 || i === series.length - 1 ? (
                <text x={x + barW / 2} y={H - 8} textAnchor="middle" className="tick">{shortDay(d.day)}</text>
              ) : null}
              {/* אזור ריחוף גדול מהעמודה */}
              <rect
                x={PAD.left + slot * i} y={PAD.top} width={slot} height={plotH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setHover(hover === i ? null : i)}
              />
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div
          className="usage-tooltip"
          style={{ left: `${((PAD.left + slot * hover + slot / 2) / W) * 100}%` }}
          dir="rtl"
        >
          <b>{shortDay(series[hover].day)}</b>
          <span><i className="swatch signed" /> מחוברים: {series[hover].signedIn}</span>
          <span><i className="swatch guests" /> אורחים: {series[hover].guests}</span>
          <span className="muted">סה"כ {series[hover].total} · {series[hover].sessions} כניסות</span>
        </div>
      )}
    </div>
  );
};

const UsageDashboard = () => {
  const [range, setRange] = useState(14);
  const [visits, setVisits] = useState(null);
  const [presence, setPresence] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setVisits(await fetchVisitsSince(lastDays(30)[0]));
    } catch (err) {
      setError(/permission/i.test(err?.message || '')
        ? 'אין הרשאה לקרוא את נתוני השימוש - צריך לפרסם את כללי האבטחה המעודכנים (database.rules.json)'
        : `הטעינה נכשלה: ${err?.message || err}`);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => subscribePresence(setPresence), []);

  const usage = visits ? computeUsage(visits, range) : null;

  return (
    <div className="usage">
      <div className="dash-kpis">
        <div className="dash-kpi live">
          <b>{presence ? presence.total : '—'}</b>
          <span>🟢 באתר עכשיו{presence ? ` (${presence.signedIn} מחוברים)` : ''}</span>
        </div>
        <div className="dash-kpi"><b>{usage ? usage.today.total : '—'}</b><span>מבקרים היום</span></div>
        <div className="dash-kpi"><b>{usage ? usage.uniqueWeek : '—'}</b><span>מבקרים ב-7 ימים</span></div>
        <div className="dash-kpi"><b>{usage ? usage.sessionsRange : '—'}</b><span>כניסות ב-{range} ימים</span></div>
      </div>

      <div className="admin-row usage-controls">
        <div className="speed-picker" role="radiogroup" aria-label="טווח ימים">
          {RANGES.map(r => (
            <button key={r} role="radio" aria-checked={range === r}
              className={`speed-option ${range === r ? 'active' : ''}`} onClick={() => setRange(r)}>
              {r} ימים
            </button>
          ))}
        </div>
        <button className="admin-small-btn" onClick={() => setShowTable(!showTable)}>
          {showTable ? '📈 גרף' : '📋 טבלה'}
        </button>
        <button className="admin-small-btn" onClick={load} disabled={loading}>{loading ? 'טוען...' : '🔄 רענון'}</button>
      </div>

      {error && <div className="admin-error">⚠️ {error}</div>}

      {usage && (
        <>
          <h4 className="usage-title">מבקרים ייחודיים ליום</h4>
          <div className="usage-legend">
            <span><i className="swatch signed" /> מחוברים עם Google</span>
            <span><i className="swatch guests" /> אורחים (בלי התחברות)</span>
          </div>
          {showTable ? (
            <table className="dash-table">
              <thead><tr><th>יום</th><th>מחוברים</th><th>אורחים</th><th>סה"כ</th><th>כניסות</th></tr></thead>
              <tbody>
                {[...usage.series].reverse().map(d => (
                  <tr key={d.day} className={d.total === 0 ? 'muted' : ''}>
                    <td>{shortDay(d.day)}</td><td>{d.signedIn}</td><td>{d.guests}</td><td>{d.total}</td><td>{d.sessions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <UsageChart series={usage.series} />
          )}
          <p className="admin-hint">
            כל דפדפן נספר פעם אחת ביום. אותו ילד בשני מכשירים ייספר פעמיים, וגלישה בחלון פרטי נספרת כמבקר חדש.
            הנתונים נאספים מהגרסה הזו והלאה.
          </p>
        </>
      )}
    </div>
  );
};

export default UsageDashboard;
