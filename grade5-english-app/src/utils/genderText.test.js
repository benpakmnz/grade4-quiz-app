import { getGenderText } from './genderText';

test('math prompts switch to the masculine form', () => {
  expect(getGenderText('חשבי:', 'male')).toBe('חשב:');
  expect(getGenderText('חשבי לפי סדר פעולות החשבון:', 'male')).toBe('חשב לפי סדר פעולות החשבון:');
  expect(getGenderText('לא נכון, בדקי את החישוב ונסי שוב! 💪', 'male')).toBe('לא נכון, בדוק את החישוב ונסה שוב! 💪');
  expect(getGenderText('כתבי את המספר בספרות: 3 אלפים', 'male')).toBe('כתוב את המספר בספרות: 3 אלפים');
});

test('words that only contain a form are not broken', () => {
  expect(getGenderText('מחשבים את ההפרש', 'male')).toBe('מחשבים את ההפרש');
  expect(getGenderText('חשבי:', 'female')).toBe('חשבי:');
});

test('renamed badges have masculine forms', () => {
  expect(getGenderText('מלכת התרגול', 'male')).toBe('מלך התרגול');
  expect(getGenderText('אלופת הנקודות', 'male')).toBe('אלוף הנקודות');
});
