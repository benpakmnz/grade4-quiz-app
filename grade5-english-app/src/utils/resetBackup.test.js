import { resetWithBackup, readBackup, undoReset, BACKUP_KEY } from './resetBackup';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('english_score', '620');
  localStorage.setItem('english_questionCount', '152');
  localStorage.setItem('english_streak', '4');
  localStorage.setItem('english_categoryStats', JSON.stringify({ isAre: { correct: 30, total: 33 }, mAngles: { correct: 5, total: 6 } }));
  localStorage.setItem('english_achievements', JSON.stringify(['first_steps', 'score_500']));
  localStorage.setItem('english_mistakes', JSON.stringify([{ ts: 1, category: 'isAre' }]));
});

test('reset keeps a backup and leaves the mistakes log alone', () => {
  resetWithBackup(1000);
  expect(localStorage.getItem('english_score')).toBeNull();
  expect(localStorage.getItem('english_categoryStats')).toBeNull();
  expect(localStorage.getItem('english_mistakes')).not.toBeNull();
  expect(readBackup(2000).data.english_score).toBe('620');
});

test('undo brings everything back - and keeps what was practised after the reset', () => {
  resetWithBackup(1000);
  // אחרי האיפוס תרגלו עוד קצת
  localStorage.setItem('english_score', '30');
  localStorage.setItem('english_questionCount', '2');
  localStorage.setItem('english_categoryStats', JSON.stringify({ isAre: { correct: 2, total: 2 } }));
  localStorage.setItem('english_achievements', JSON.stringify(['first_steps']));

  expect(undoReset(5000)).toBe(true);
  expect(localStorage.getItem('english_score')).toBe('650');
  expect(localStorage.getItem('english_questionCount')).toBe('154');
  expect(JSON.parse(localStorage.getItem('english_categoryStats'))).toEqual({ isAre: { correct: 32, total: 35 }, mAngles: { correct: 5, total: 6 } });
  expect(JSON.parse(localStorage.getItem('english_achievements')).sort()).toEqual(['first_steps', 'score_500']);
  expect(localStorage.getItem(BACKUP_KEY)).toBeNull();
  expect(undoReset(6000)).toBe(false); // רק פעם אחת
});

test('the undo option expires after 7 days', () => {
  resetWithBackup(0);
  expect(readBackup(6 * 24 * 3600e3)).not.toBeNull();
  expect(readBackup(8 * 24 * 3600e3)).toBeNull();
  expect(undoReset(8 * 24 * 3600e3)).toBe(false);
});
