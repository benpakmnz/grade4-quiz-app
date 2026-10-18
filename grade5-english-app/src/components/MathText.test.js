import { splitMath, breakablePieces } from './MathText';

const maths = (t) => splitMath(t).filter(p => p.math).map(p => p.math);

test('whole exercises stay together (so they are shown left to right)', () => {
  expect(maths('8 + 4 × 5 = ?')).toEqual(['8 + 4 × 5 = ?']);
  expect(maths('קודם כפל: 4 × 5 = 20')).toEqual(['4 × 5 = 20']);
  expect(maths('(12 + 3) : 5 = 3')).toEqual(['(12 + 3) : 5 = 3']);
  expect(maths('□ + 45 = 120')).toEqual(['□ + 45 = 120']);
  expect(maths('45,302 ⬜ 45,320')).toEqual(['45,302 ⬜ 45,320']);
  expect(maths('2 3/5 + 1 4/5 = ?')).toEqual(['2 3/5 + 1 4/5 = ?']);
});

test('numbers inside Hebrew sentences keep the sentence punctuation outside', () => {
  expect(maths('יש 3 תפוחים, ו-5 אגסים.')).toEqual(['3', '5']);
  expect(maths('כמה הם 3/4 מ-20?')).toEqual(['3/4', '20']);
  expect(maths('בין 3,000 ל-4,000?')).toEqual(['3,000', '4,000']);
  expect(maths('זווית של 120° היא')).toEqual(['120°']);
});

test('plain Hebrew is untouched', () => {
  expect(splitMath('מקבילות')).toEqual([{ text: 'מקבילות' }]);
});

test('comparison signs are always isolated, so Hebrew text never mirrors them', () => {
  expect(maths('>')).toEqual(['>']);
  expect(maths('<')).toEqual(['<']);
  expect(maths('הסימן < אומר קטן מ')).toEqual(['<']);
  expect(maths('45,302 < 45,320')).toEqual(['45,302 < 45,320']);
});

test('a rule like +500 keeps its sign in front; a Hebrew prefix hyphen stays with the word', () => {
  expect(maths('+500')).toEqual(['+500']);
  expect(maths('×2')).toEqual(['×2']);
  expect(maths('-7')).toEqual(['-7']);
  expect(maths('בין 3,000 ל-4,000')).toEqual(['3,000', '4,000']);
  expect(splitMath('ל-4,000')).toEqual([{ text: 'ל-' }, { math: '4,000' }]);
});

test('a colon right after a number belongs to the sentence, division has spaces', () => {
  expect(maths('קודם מורידים את ה-30: 50 - 30 = 20')).toEqual(['30', '50 - 30 = 20']);
  expect(maths('□ : 4 = 9')).toEqual(['□ : 4 = 9']);
});

test('long exercises break only before an operator and never inside parentheses', () => {
  expect(breakablePieces('(7 + 3) × 6 = 10 × 6 = 60')).toEqual(['(7 + 3)', '× 6', '= 10', '× 6', '= 60']);
  expect(breakablePieces('8 + 4 = 12')).toEqual(['8 + 4 = 12']);
});

test('bold inside an exercise keeps the whole exercise in one left-to-right run', () => {
  expect(maths('2 + 4 = **6** ← 20 - 3 × 6')).toEqual(['2 + 4 = **6**', '20 - 3 × 6']);
  expect(maths('**שטח** = 5 × 3 = **15 סמ"ר**')).toEqual(['5 × 3 = **15']);
});
