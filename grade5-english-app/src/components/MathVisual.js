import React from 'react';
import MathText from './MathText';
import './MathVisual.css';

// ציורים לשאלות בחשבון. כל ציור מוגדר כאובייקט פשוט (type + נתונים) - ראו data/mathQuestions.js

const FILL = '#fb923c';
const EMPTY = '#ffffff';
const INK = '#334155';
const HIGHLIGHT = ['#e11d48', '#2563eb'];

// ---------- שברים ----------
const sector = (cx, cy, r, a0, a1) => {
  const p = (a) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} Z`;
};

const FractionWhole = ({ shape, parts, filled, size = 1 }) => {
  if (shape === 'circle') {
    const r = 40;
    return (
      <svg viewBox="0 0 90 90" className="mv-whole" style={{ width: 92 * size }} aria-hidden="true">
        {parts === 1 ? (
          <circle cx="45" cy="45" r={r} fill={filled ? FILL : EMPTY} stroke={INK} strokeWidth="2" />
        ) : (
          Array.from({ length: parts }, (_, i) => (
            <path key={i} d={sector(45, 45, r, (i * 2 * Math.PI) / parts, ((i + 1) * 2 * Math.PI) / parts)}
              fill={i < filled ? FILL : EMPTY} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          ))
        )}
      </svg>
    );
  }
  // מלבן: אם אפשר - שתי שורות (6 ← 2×3), אחרת פס אחד
  const rows = shape === 'rect' && parts % 2 === 0 && parts >= 4 ? 2 : 1;
  const cols = parts / rows;
  const w = 160;
  const h = rows === 2 ? 70 : 42;
  return (
    <svg viewBox={`0 0 ${w + 4} ${h + 4}`} className="mv-whole" style={{ width: (w + 4) * size }} aria-hidden="true">
      {Array.from({ length: parts }, (_, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        return (
          <rect key={i} x={2 + (col * w) / cols} y={2 + (row * h) / rows} width={w / cols} height={h / rows}
            fill={i < filled ? FILL : EMPTY} stroke={INK} strokeWidth="2" />
        );
      })}
    </svg>
  );
};

const FractionPicture = ({ shape = 'circle', parts, filled, small }) => {
  const wholes = Math.max(1, Math.ceil(filled / parts));
  return (
    <div className={`mv-fraction ${small ? 'small' : ''}`} dir="ltr">
      {Array.from({ length: wholes }, (_, i) => (
        <FractionWhole key={i} shape={shape} parts={parts} filled={Math.min(parts, filled - i * parts)} size={small ? 0.7 : 1} />
      ))}
    </div>
  );
};

const FractionPair = ({ a, b }) => (
  <div className="mv-pair">
    {[a, b].map((f, i) => (
      <div key={i} className="mv-pair-row">
        <span className="mv-pair-label"><MathText text={`${f.filled}/${f.parts}`} /></span>
        <FractionWhole shape="bar" parts={f.parts} filled={f.filled} />
      </div>
    ))}
  </div>
);

// ---------- חלק מכמות ----------
const SetPicture = ({ emoji, groups, perGroup, highlight }) => (
  <div className="mv-set" dir="ltr">
    {Array.from({ length: groups }, (_, g) => (
      <div key={g} className={`mv-group ${g < highlight ? 'on' : ''}`}>
        {Array.from({ length: perGroup }, (__, i) => <span key={i}>{emoji}</span>)}
      </div>
    ))}
  </div>
);

// ---------- ישר המספרים ----------
const NumberLine = ({ ticks, labels = {}, arrow }) => {
  const W = 340;
  const pad = 26;
  const y = 50;
  const x = (i) => pad + (i * (W - 2 * pad)) / ticks;
  return (
    <svg viewBox={`0 0 ${W} 92`} className="mv-numberline" role="img" aria-label="ישר המספרים" dir="ltr">
      <line x1={pad - 14} y1={y} x2={W - pad + 14} y2={y} stroke={INK} strokeWidth="2.5" />
      <path d={`M${W - pad + 14},${y} l-7,-5 v10 z`} fill={INK} />
      {Array.from({ length: ticks + 1 }, (_, i) => (
        <line key={i} x1={x(i)} y1={y - 8} x2={x(i)} y2={y + 8} stroke={INK} strokeWidth={labels[i] ? 2.5 : 1.6} />
      ))}
      {Object.entries(labels).map(([i, text]) => (
        <text key={i} x={x(Number(i))} y={y + 28} textAnchor="middle" className="mv-nl-label">{text}</text>
      ))}
      {arrow !== undefined && (
        <g>
          <text x={x(arrow)} y={14} textAnchor="middle" className="mv-nl-q">?</text>
          <path d={`M${x(arrow)},${18} v14`} stroke={HIGHLIGHT[0]} strokeWidth="3" />
          <path d={`M${x(arrow)},${y - 10} l-6,-9 h12 z`} fill={HIGHLIGHT[0]} />
        </g>
      )}
    </svg>
  );
};

// ---------- סדרה ----------
const Sequence = ({ items }) => (
  <div className="mv-sequence">
    {items.map((it, i) => (
      // החץ צמוד למספר שאחריו - כדי שלא יישאר חץ "תלוי" בסוף שורה
      <span key={i} className="mv-seq-cell">
        {i > 0 && <span className="mv-seq-arrow" aria-hidden="true">←</span>}
        <span className={`mv-seq-item ${it === '?' ? 'q' : ''}`} dir="ltr">{it}</span>
      </span>
    ))}
  </div>
);

// ---------- מצולעים ----------
const Polygon = ({ points, labels, highlight = [] }) => {
  const n = points.length;
  const cx = points.reduce((s, p) => s + p[0], 0) / n;
  const cy = points.reduce((s, p) => s + p[1], 0) / n;
  return (
    <svg viewBox="-12 -12 124 116" className="mv-polygon" role="img" aria-label="מצולע" dir="ltr">
      <polygon points={points.map(p => p.join(',')).join(' ')} fill="#e0f2fe" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      {highlight.map((i, k) => {
        const a = points[i];
        const b = points[(i + 1) % n];
        return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={HIGHLIGHT[k % 2]} strokeWidth="4.5" strokeLinecap="round" />;
      })}
      {points.map((p, i) => {
        const dx = p[0] - cx;
        const dy = p[1] - cy;
        const len = Math.hypot(dx, dy) || 1;
        return (
          <text key={i} x={p[0] + (dx / len) * 8} y={p[1] + (dy / len) * 8 + 3.5} textAnchor="middle" className="mv-vertex">
            {labels[i]}
          </text>
        );
      })}
    </svg>
  );
};

// ---------- זוויות ----------
const Angle = ({ degrees, rotate = 0 }) => {
  const R = 70;
  const cx = 100;
  const cy = 95;
  const rad = (d) => (d * Math.PI) / 180;
  // שתי הקרניים נשארות מעל הקודקוד (בתוך הציור)
  const turn = Math.max(0, Math.min(rotate, 180 - degrees));
  const a0 = rad(turn);
  const a1 = rad(turn + degrees);
  const ray = (a) => [cx + R * Math.cos(a), cy - R * Math.sin(a)];
  const [x0, y0] = ray(a0);
  const [x1, y1] = ray(a1);
  const r = 22;
  const arc = (a) => [cx + r * Math.cos(a), cy - r * Math.sin(a)];
  const [ax0, ay0] = arc(a0);
  const [ax1, ay1] = arc(a1);
  return (
    <svg viewBox="0 0 200 120" className="mv-angle" role="img" aria-label="זווית" dir="ltr">
      <path d={`M${ax0},${ay0} A${r},${r} 0 ${degrees > 180 ? 1 : 0} 0 ${ax1},${ay1}`} fill="none" stroke={HIGHLIGHT[0]} strokeWidth="2.5" />
      <line x1={cx} y1={cy} x2={x0} y2={y0} stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={x1} y2={y1} stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="3.5" fill={INK} />
    </svg>
  );
};

const Clock = ({ hour }) => {
  const c = 60;
  const hand = (deg, len) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [c + len * Math.cos(a), c + len * Math.sin(a)];
  };
  const [hx, hy] = hand(hour * 30, 30);
  const [mx, my] = hand(0, 44);
  return (
    <svg viewBox="0 0 120 120" className="mv-clock" role="img" aria-label={`שעון: ${hour}:00`} dir="ltr">
      <circle cx={c} cy={c} r="56" fill="#fff" stroke={INK} strokeWidth="3" />
      {Array.from({ length: 12 }, (_, i) => {
        const [x, y] = hand((i + 1) * 30, 45);
        return <text key={i} x={x} y={y + 4} textAnchor="middle" className="mv-clock-num">{i + 1}</text>;
      })}
      <line x1={c} y1={c} x2={mx} y2={my} stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <line x1={c} y1={c} x2={hx} y2={hy} stroke={HIGHLIGHT[0]} strokeWidth="4.5" strokeLinecap="round" />
      <circle cx={c} cy={c} r="4" fill={INK} />
    </svg>
  );
};

// ---------- מלבן ----------
const Rect = ({ w, h, wLabel, hLabel, grid }) => {
  const maxW = 220;
  const maxH = 130;
  const unit = Math.min(maxW / w, maxH / h, grid ? 34 : 999);
  const W = w * unit;
  const H = h * unit;
  const ox = 12;
  const oy = 12;
  return (
    <svg viewBox={`0 0 ${W + ox + 72} ${H + oy + 34}`} className="mv-rect" role="img" aria-label="מלבן" dir="ltr">
      <rect x={ox} y={oy} width={W} height={H} fill="#dcfce7" stroke={INK} strokeWidth="2.5" />
      {grid && (
        <g stroke="#16a34a" strokeWidth="1" opacity="0.7">
          {Array.from({ length: w - 1 }, (_, i) => <line key={`v${i}`} x1={ox + (i + 1) * unit} y1={oy} x2={ox + (i + 1) * unit} y2={oy + H} />)}
          {Array.from({ length: h - 1 }, (_, i) => <line key={`h${i}`} x1={ox} y1={oy + (i + 1) * unit} x2={ox + W} y2={oy + (i + 1) * unit} />)}
        </g>
      )}
      {/* תוויות בעברית ("5 ס"מ") נכתבות מימין לשמאל; ב-rtl העוגן "end" הוא הקצה השמאלי */}
      {wLabel && <text x={ox + W / 2} y={oy + H + 24} textAnchor="middle" direction="rtl" className="mv-rect-label">{wLabel}</text>}
      {hLabel && <text x={ox + W + 8} y={oy + H / 2 + 5} textAnchor="end" direction="rtl" className="mv-rect-label">{hLabel}</text>}
    </svg>
  );
};

const RENDERERS = {
  fraction: FractionPicture,
  fractionPair: FractionPair,
  set: SetPicture,
  numberLine: NumberLine,
  sequence: Sequence,
  polygon: Polygon,
  angle: Angle,
  clock: Clock,
  rect: Rect
};

const MathVisual = ({ spec, small }) => {
  if (!spec) return null;
  const Renderer = RENDERERS[spec.type];
  if (!Renderer) return null;
  return (
    <div className={`math-visual ${small ? 'small' : ''}`}>
      <Renderer {...spec} small={small} />
    </div>
  );
};

export default MathVisual;
