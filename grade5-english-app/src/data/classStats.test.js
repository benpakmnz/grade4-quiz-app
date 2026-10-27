import { computeClassStats, studentSubject } from './classStats';

const DAY = 864e5;
const NOW = Date.UTC(2026, 9, 27);
const user = (name, cats, last = NOW - DAY) => {
  const perCategory = Object.entries(cats).map(([id, [correct, total]]) => ({
    id, subject: id.startsWith('h') ? 'hebrew' : id.startsWith('m') ? 'math' : 'english', correct, total,
    rate: total ? Math.round((correct / total) * 100) : null
  }));
  const correct = perCategory.reduce((s, c) => s + c.correct, 0);
  const total = perCategory.reduce((s, c) => s + c.total, 0);
  return { uid: name, name, perCategory, lastSeen: last, lastPractice: last, overall: { correct, total, rate: total ? Math.round((correct / total) * 100) : null } };
};

test('class summary: active students, topic success and who needs attention', () => {
  const users = [
    user('נועה', { hRoots: [9, 10], hNouns: [3, 10] }),
    user('דן', { hRoots: [2, 10], hNouns: [8, 10] }),
    user('מיכל', {}, NOW - 20 * DAY),
    user('איתי', { hRoots: [1, 10], hNouns: [2, 10] }, NOW - 10 * DAY)
  ];
  const s = computeClassStats(users, ['hebrew'], NOW);
  expect(s.count).toBe(4);
  expect(s.activeCount).toBe(2);
  expect(s.answers).toBe(60);
  const roots = s.subjects[0].topics.find(t => t.id === 'hRoots');
  expect(roots).toMatchObject({ practiced: 3, total: 30, rate: 40 });
  expect(roots.struggling.map(u => u.name).sort()).toEqual(['איתי', 'דן']);
  expect(s.subjects[0].untouched.map(t => t.id)).toContain('hReading');
  // שורשים 40%, שמות עצם 43% - שניהם מתחת ל-75%, הקשה ביותר ראשון
  expect(s.subjects[0].hardest.map(t => t.id)).toEqual(['hRoots', 'hNouns']);
  expect(computeClassStats([user('א', { hRoots: [9, 10] })], ['hebrew'], NOW).subjects[0].hardest).toEqual([]);
  const att = Object.fromEntries(s.attention.map(a => [a.user.name, a.reasons]));
  expect(att['מיכל']).toEqual(['עוד לא תרגל/ה']);
  expect(att['איתי']).toEqual(['לא תרגל/ה 10 ימים', 'הצלחה 15%']);
  expect(att['נועה']).toBeUndefined();
});

test('student subject summary', () => {
  const u = user('נועה', { hRoots: [30, 35], hNouns: [2, 10], hTest: [5, 12] });
  const r = studentSubject(u, 'hebrew');
  expect(r.total).toBe(45); // בלי המבחן המסכם
  expect(r.weakest.id).toBe('hNouns');
  expect(r.readiness).toBeGreaterThan(0);
});
