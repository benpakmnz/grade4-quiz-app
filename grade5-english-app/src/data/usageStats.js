// חישוב נתוני שימוש מתוך english/visits (מבקרים ייחודיים ליום, מחוברים מול אורחים)
import { dayKey } from '../services/analytics';

export const lastDays = (count, today = new Date()) => {
  const days = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    days.push(dayKey(d));
  }
  return days;
};

/**
 * visits - התוכן של english/visits ({ day: { visitorId: { t, s, n } } })
 * מחזיר סדרה ליום (signedIn / guests / sessions) וסיכומים
 */
export const computeUsage = (visits, dayCount, today = new Date()) => {
  const days = lastDays(dayCount, today);
  const series = days.map(day => {
    const entries = Object.values((visits || {})[day] || {});
    const signedIn = entries.filter(v => v && v.s === true).length;
    return {
      day,
      signedIn,
      guests: entries.length - signedIn,
      total: entries.length,
      sessions: entries.reduce((sum, v) => sum + (Number(v?.n) || 1), 0)
    };
  });

  const uniqueIn = (dayList) => {
    const ids = new Set();
    dayList.forEach(day => Object.keys((visits || {})[day] || {}).forEach(id => ids.add(id)));
    return ids.size;
  };

  return {
    series,
    today: series[series.length - 1],
    uniqueWeek: uniqueIn(lastDays(7, today)),
    uniqueRange: uniqueIn(days),
    sessionsRange: series.reduce((sum, d) => sum + d.sessions, 0)
  };
};

// "2026-10-13" -> "13/10"
export const shortDay = (day) => {
  const [, m, d] = day.split('-');
  return `${Number(d)}/${Number(m)}`;
};

// קו עליון "עגול" לציר ה-Y
export const niceMax = (value) => {
  if (value <= 4) return 4;
  // צעד "עגול" (1, 2, 2.5, 5 × חזקת 10) - הקטן ביותר שארבעה ממנו מכסים את הערך
  const pow = 10 ** Math.floor(Math.log10(value / 4));
  const step = [1, 2, 2.5, 5, 10].map(m => m * pow).find(st => st * 4 >= value);
  return Math.max(4, Math.ceil(step) * 4);
};
