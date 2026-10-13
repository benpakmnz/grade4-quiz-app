import { computeUsage, lastDays, niceMax, shortDay } from './usageStats';
import { getVisitorId, dayKey } from '../services/analytics';

const today = new Date(2026, 9, 13); // 13/10/2026

test('lastDays ends today and crosses month boundaries', () => {
  expect(lastDays(3, today)).toEqual(['2026-10-11', '2026-10-12', '2026-10-13']);
  expect(lastDays(15, today)[0]).toBe('2026-09-29');
});

test('counts unique visitors per day, signed-in vs guests, and sessions', () => {
  const visits = {
    '2026-10-13': { a1b2c3d4: { t: 1, s: true, n: 3 }, z9y8x7w6: { t: 1, s: false, n: 1 }, q1q1q1q1: { t: 1, s: false } },
    '2026-10-10': { a1b2c3d4: { t: 1, s: true, n: 2 } },
    '2026-09-01': { old00000: { t: 1, s: false, n: 1 } } // מחוץ לטווח
  };
  const u = computeUsage(visits, 7, today);
  expect(u.series).toHaveLength(7);
  expect(u.today).toEqual({ day: '2026-10-13', signedIn: 1, guests: 2, total: 3, sessions: 5 });
  expect(u.series.find(d => d.day === '2026-10-10').signedIn).toBe(1);
  expect(u.uniqueWeek).toBe(3); // a1b2c3d4 נספר פעם אחת
  expect(u.sessionsRange).toBe(7);
});

test('empty data gives zeros, not errors', () => {
  const u = computeUsage(null, 14, today);
  expect(u.series.every(d => d.total === 0)).toBe(true);
  expect(u.uniqueWeek).toBe(0);
});

test('nice y-axis maximum', () => {
  expect(niceMax(1)).toBe(4);
  expect(niceMax(5)).toBe(8);
  expect(niceMax(13)).toBe(20);
  expect(niceMax(37)).toBe(40);
});

test('short day label and local day key', () => {
  expect(shortDay('2026-10-03')).toBe('3/10');
  expect(dayKey(today)).toBe('2026-10-13');
});

test('visitor id is stable and matches the database rule format', () => {
  localStorage.clear();
  const id = getVisitorId();
  expect(id).toMatch(/^[a-z0-9]{8,24}$/);
  expect(getVisitorId()).toBe(id);
});
