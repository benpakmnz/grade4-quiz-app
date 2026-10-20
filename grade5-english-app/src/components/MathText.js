import React from 'react';
import './MathText.css';

// טקסט עם חשבון בתוכו:
// - תרגילים ומספרים מוצגים משמאל לימין (אחרת בעברית "8 + 4 = 12" מתהפך ל-"12 = 4 + 8")
// - "3/4" מוצג כשבר אמיתי (מונה מעל מכנה), "2 3/4" כמספר מעורב

// רצף "חשבוני": מתחיל בספרה / סוגריים / ריבוע / סימן השוואה, וממשיך בספרות, רווחים וסימני פעולה.
// < ו-> חייבים להיות בתוך רצף משמאל לימין - בטקסט עברי הדפדפן הופך אותם (">" מוצג כ-"<")!
// גם סימן פעולה לפני מספר ("+500", "×2") - חוץ ממקף אחרי אות ("ל-4,000").
// ":" הוא חילוק רק עם רווח משני הצדדים ("12 : 3"); "ה-30: 50" - הנקודתיים שייכות למשפט.
// "**" (הדגשה) יכול להופיע בתוך תרגיל: "2 + 4 = **6**"
const RUN = /(?:\*\*(?=[\d(□])|[+\-×](?=\d)|[\d(□⬜<>])(?: : |\*\*|[\d\s,+\-×=()□⬜?/<>°])*/g;
const HEBREW_LETTER = /[\u05D0-\u05EA]/;
const RUN_END = /[\d)□⬜?°<>*]$/;
const FRACTION = /([\d□?]+)\/(\d+)/g;

export const Frac = ({ n, d }) => (
  <span className="frac" role="math" aria-label={`${n} חלקי ${d}`}>
    <span className="frac-n">{n}</span>
    <span className="frac-d">{d}</span>
  </span>
);

const withFractions = (piece, key) => {
  const parts = [];
  let last = 0;
  piece.replace(FRACTION, (match, n, d, offset) => {
    if (offset > last) parts.push(piece.slice(last, offset));
    parts.push(<Frac key={`${key}-${offset}`} n={n} d={d} />);
    last = offset + match.length;
    return match;
  });
  if (last < piece.length) parts.push(piece.slice(last));
  return parts;
};

// הדגשה ("**...**") שעוברת בין חלקים: state.bold נשמר לאורך כל הטקסט
const withBold = (piece, key, state, render) => {
  const out = [];
  piece.split('**').forEach((chunk, i) => {
    if (i > 0) state.bold = !state.bold;
    if (!chunk) return;
    const content = render(chunk, `${key}-${i}`);
    out.push(state.bold ? <b key={`${key}-${i}`} className="hl">{content}</b> : <React.Fragment key={`${key}-${i}`}>{content}</React.Fragment>);
  });
  return out;
};

/**
 * תרגיל ארוך מותר לשבור לשורות - אבל רק לפני סימן פעולה ומחוץ לסוגריים,
 * כדי שלא יחרוג מהמסך בטלפון וגם לא ייקרע באמצע ("(7" / "+ 3)").
 */
export const breakablePieces = (run) => {
  if (run.length <= 16) return [run];
  const pieces = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < run.length; i++) {
    const ch = run[i];
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ' ' && depth === 0 && '=+-×:'.includes(run[i + 1]) && run[i + 2] === ' ' && i > start) {
      pieces.push(run.slice(start, i));
      start = i + 1;
    }
  }
  pieces.push(run.slice(start));
  return pieces;
};

const renderRun = (rawRun, key, state) => {
  // מספר מעורב ("2 3/5") לא נשבר באמצע
  const run = rawRun.replace(/(\d) (?=[\d□?]+\/\d)/g, '$1\u00A0');
  const pieces = breakablePieces(run);
  return (
    <bdi key={key} dir="ltr" className="math-run">
      {pieces.map((piece, i) => (
        <React.Fragment key={i}>
          {i > 0 && ' '}
          <span className="nowrap">{withBold(piece, `${key}-${i}`, state, withFractions)}</span>
        </React.Fragment>
      ))}
    </bdi>
  );
};

/** מפרק את הטקסט לחלקים רגילים ולרצפים חשבוניים */
export const splitMath = (text) => {
  const out = [];
  let last = 0;
  String(text).replace(RUN, (match, off) => {
    let run = match;
    let offset = off;
    if (/^[+\-×]/.test(run) && HEBREW_LETTER.test(String(text)[offset - 1] || '')) {
      run = run.slice(1);
      offset += 1;
    }
    // מורידים מהסוף תווים שהם בעצם חלק מהמשפט (פסיק, רווח, מקף...)
    while (run && !RUN_END.test(run)) run = run.slice(0, -1);
    // "?" בסוף משפט (בלי "=") שייך למשפט ולא לתרגיל
    if (run.endsWith('?') && !run.includes('=')) run = run.slice(0, -1).trimEnd();
    if (!run) return match;
    if (offset > last) out.push({ text: String(text).slice(last, offset) });
    out.push({ math: run });
    last = offset + run.length;
    return match;
  });
  if (last < String(text).length) out.push({ text: String(text).slice(last) });
  return out;
};

/** rich - "**מילה**" מוצגת מודגשת (בשיעורים) */
const MathText = ({ text, className, rich = false }) => {
  if (text === undefined || text === null) return null;
  const state = { bold: false };
  const plainText = (t, k) => t;
  return (
    <span className={className}>
      {splitMath(text).map((p, i) => {
        if (p.math) return renderRun(rich ? p.math : p.math.replace(/\*\*/g, ''), i, rich ? state : { bold: false });
        return <React.Fragment key={i}>{rich ? withBold(p.text, `t${i}`, state, plainText) : p.text}</React.Fragment>;
      })}
    </span>
  );
};

export default MathText;
