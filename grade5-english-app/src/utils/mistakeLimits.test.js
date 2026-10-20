import { capMistakes, mistakeSubject } from './mistakeLimits';
import { logMistake, readMistakes } from './mistakes';

afterEach(() => localStorage.clear());

test('each subject keeps its own 300 latest mistakes', () => {
  const english = Array.from({ length: 50 }, (_, i) => ({ ts: i, category: 'isAre' }));
  const math = Array.from({ length: 400 }, (_, i) => ({ ts: 1000 + i, category: 'mFractionAdd' }));
  const kept = capMistakes([...english, ...math]);
  expect(kept.filter(m => mistakeSubject(m) === 'english')).toHaveLength(50); // לא נדחפו החוצה
  expect(kept.filter(m => mistakeSubject(m) === 'math')).toHaveLength(300);
  expect(kept[0].ts).toBe(1399); // מהחדש לישן
});

test('old entries without a subject are sorted by their topic', () => {
  expect(mistakeSubject({ category: 'hasHave' })).toBe('english');
  expect(mistakeSubject({ category: 'mAngles' })).toBe('math');
  expect(mistakeSubject({ category: 'mAngles', subject: 'math' })).toBe('math');
});

test('new mistakes are stamped with their subject', () => {
  logMistake({ category: 'mAngles', question: 'q', given: 'חדה', correct: 'קהה', finalCorrect: false });
  logMistake({ category: 'isAre', question: 'q2', given: 'is', correct: 'are', finalCorrect: true });
  const list = readMistakes();
  expect(list.map(m => m.subject)).toEqual(['english', 'math']);
});

test('a long run of math mistakes does not erase the English log', () => {
  for (let i = 0; i < 5; i++) logMistake({ category: 'isAre', question: `e${i}`, given: 'is', correct: 'are' });
  for (let i = 0; i < 320; i++) logMistake({ category: 'mOperations', question: `m${i}`, given: '1', correct: '2' });
  const list = readMistakes();
  expect(list.filter(m => m.subject === 'english')).toHaveLength(5);
  expect(list.filter(m => m.subject === 'math')).toHaveLength(300);
});
