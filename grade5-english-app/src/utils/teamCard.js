// כרטיס הצוות כתמונה (PNG) - לשמירה בגלריה או לשליחה בוואטסאפ.
// מצויר על canvas בדפדפן עצמו. בכרטיס: שם הצוות, התוצאה, הדמויות וקישור - בלי שמות ילדים ובלי ציונים.
import { formatClock } from '../data/escapeRoom';

const W = 1080;
const H = 1350;

/** טקסט ממורכז שמתכווץ עד שהוא נכנס ברוחב */
const fitText = (ctx, text, y, { max = 96, min = 40, weight = 800, width = W - 160, color = '#ffffff' } = {}) => {
  let size = max;
  ctx.font = `${weight} ${size}px Rubik, Arial, sans-serif`;
  while (size > min && ctx.measureText(text).width > width) {
    size -= 4;
    ctx.font = `${weight} ${size}px Rubik, Arial, sans-serif`;
  }
  ctx.fillStyle = color;
  ctx.fillText(text, W / 2, y);
};

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

export const cardLines = ({ team, subjectLabel, opened, filled, total, seconds }) => ({
  chip: `אתגר מפצחי הכספות · ${subjectLabel}`,
  title: team,
  result: opened
    ? `פתחו את הכספת${seconds != null ? ` ב-${formatClock(seconds * 1000)} דקות` : ''}!`
    : `פתחו ${filled} מתוך ${total} מנעולים!`,
  invite: 'רוצים לנסות גם? מתאמנים יחד למבחנים'
});

export const drawTeamCard = (canvas, info) => {
  const { emojis = [], link = '' } = info;
  const lines = cardLines(info);
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // רקע כמו באפליקציה
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#3b82f6');
  bg.addColorStop(0.55, '#6366f1');
  bg.addColorStop(1, '#db2777');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // קישוטים
  ctx.globalAlpha = 0.45;
  ctx.font = '80px sans-serif';
  [['✨', 150, 150], ['⭐', 930, 220], ['🎉', 130, 940], ['✨', 950, 940]].forEach(([e, x, y]) => ctx.fillText(e, x, y));
  ctx.globalAlpha = 1;

  // תגית
  ctx.font = '700 44px Rubik, Arial, sans-serif';
  const chipW = Math.min(W - 200, ctx.measureText(lines.chip).width + 80);
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  roundRect(ctx, (W - chipW) / 2, 110, chipW, 84, 42);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillText(lines.chip, W / 2, 153);

  // מפתח בעיגול זהוב
  const g = ctx.createLinearGradient(W / 2 - 130, 260, W / 2 + 130, 520);
  g.addColorStop(0, '#fde047');
  g.addColorStop(1, '#f59e0b');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(W / 2, 390, 130, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = '150px sans-serif';
  ctx.fillText(info.opened ? '🗝️' : '🔐', W / 2, 400);

  fitText(ctx, lines.title, 610, { max: 104 });
  fitText(ctx, lines.result, 730, { max: 64, weight: 700, color: '#fef08a' });

  // הדמויות של הצוות (בלי שמות)
  const shown = emojis.slice(0, 8);
  const size = 108;
  const gap = 18;
  const rowW = shown.length * size + (shown.length - 1) * gap;
  shown.forEach((e, i) => {
    const cx = (W - rowW) / 2 + i * (size + gap) + size / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.beginPath();
    ctx.arc(cx, 870, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '64px sans-serif';
    ctx.fillText(e, cx, 874);
  });

  // הזמנה + קישור
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, 80, 1010, W - 160, 230, 40);
  ctx.fill();
  fitText(ctx, lines.invite, 1080, { max: 46, min: 30, weight: 700, color: '#312e81', width: W - 240 });
  ctx.direction = 'ltr';
  fitText(ctx, link.replace(/^https?:\/\//, ''), 1170, { max: 44, min: 26, weight: 800, color: '#4338ca', width: W - 240 });
  return true;
};

const toBlob = (canvas) => new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

/**
 * שמירת הכרטיס: בטלפון - תפריט השיתוף (שם יש "שמירת תמונה" ו"וואטסאפ"); במחשב - הורדה של קובץ PNG.
 * מחזיר 'shared' | 'downloaded' | 'failed'
 */
export const saveTeamCard = async (info) => {
  try {
    const canvas = document.createElement('canvas');
    if (!drawTeamCard(canvas, info)) return 'failed';
    const blob = await toBlob(canvas);
    if (!blob) return 'failed';
    const name = 'escape-room-team.png';
    const file = typeof File !== 'undefined' ? new File([blob], name, { type: 'image/png' }) : null;
    const coarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
    if (coarse && file && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        return 'shared';
      } catch (err) {
        if (err?.name === 'AbortError') return 'shared';
        // אחרת - ממשיכים להורדה
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return 'downloaded';
  } catch {
    return 'failed';
  }
};
