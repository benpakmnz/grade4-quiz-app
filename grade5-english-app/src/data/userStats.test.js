import { parseUser, parseAllUsers, rateColor } from './userStats';
import { logMistake, readMistakes } from '../utils/mistakes';

const raw = (data, profile = {}, updatedAt = 1000) => ({
  profile: { name: 'Noa Cohen', email: 'noa@x.com', lastSeen: 500, ...profile },
  progress: { data, updatedAt }
});

test('parses stored progress strings into numbers and per-topic rates', () => {
  const u = parseUser('u1', raw({
    english_userData: JSON.stringify({ name: 'נועה', character: { emoji: '🦄' } }),
    english_score: '120',
    english_categoryStats: JSON.stringify({ isAre: { correct: 8, total: 10 }, hasHave: { correct: 1, total: 4 } }),
    english_mistakes: JSON.stringify([{ ts: 1, category: 'isAre', question: 'q', given: 'is', correct: 'are' }])
  }));
  expect(u.name).toBe('נועה');
  expect(u.character).toBe('🦄');
  expect(u.score).toBe(120);
  expect(u.perCategory.find(c => c.id === 'isAre').rate).toBe(80);
  expect(u.perCategory.find(c => c.id === 'hasHave').rate).toBe(25);
  expect(u.perCategory.find(c => c.id === 'vocabulary').rate).toBeNull();
  expect(u.overall).toEqual({ correct: 9, total: 14, rate: 64 });
  expect(u.mistakes).toHaveLength(1);
});

test('broken or missing data never crashes the dashboard', () => {
  const u = parseUser('u2', { progress: { data: { english_categoryStats: '{not json', english_mistakes: 'oops' } } });
  expect(u.name).toBe('(ללא שם)');
  expect(u.overall.rate).toBeNull();
  expect(u.mistakes).toEqual([]);
  expect(parseUser('u3').score).toBe(0);
});

test('users are sorted by most recent activity', () => {
  const list = parseAllUsers({
    old: raw({}, { lastSeen: 10 }, 10),
    recent: raw({}, { lastSeen: 50 }, 900)
  });
  expect(list.map(u => u.uid)).toEqual(['recent', 'old']);
});

test('rate colors: green / amber / red / grey', () => {
  expect(rateColor(90)).toBe('#10b981');
  expect(rateColor(65)).toBe('#f59e0b');
  expect(rateColor(30)).toBe('#ef4444');
  expect(rateColor(null)).toBe('#9ca3af');
});

test('mistake log keeps newest first and is capped', () => {
  localStorage.clear();
  for (let i = 0; i < 305; i++) logMistake({ category: 'isAre', question: `q${i}`, given: 'is', correct: 'are' });
  const list = readMistakes();
  expect(list).toHaveLength(300);
  expect(list[0].question).toBe('q304');
});
