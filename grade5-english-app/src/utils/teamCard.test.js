import { cardLines } from './teamCard';

test('team card text: team and result only', () => {
  const l = cardLines({ team: 'מפצחי הכספות', subjectLabel: '🔤 אנגלית', opened: true, filled: 3, total: 3, seconds: 692 });
  expect(l.chip).toBe('אתגר מפצחי הכספות · 🔤 אנגלית');
  expect(l.title).toBe('מפצחי הכספות');
  expect(l.result).toBe('פתחו את הכספת ב-11:32 דקות!');
  expect(cardLines({ team: 'x', subjectLabel: '', opened: false, filled: 2, total: 5 }).result).toBe('פתחו 2 מתוך 5 מנעולים!');
});
