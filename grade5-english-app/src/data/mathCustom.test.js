import { generateMathQuestion, fromCustom, customShare, isInputCorrect } from './mathQuestions';
import { mathBank, MATH_ADMIN_SECTIONS } from './adminSchemas';
import { setRemoteContent } from './contentStore';
import { mathCategories } from './mathCategories';

afterEach(() => setRemoteContent(null));

const bank = mathBank('mFractionMeaning');

test('every math topic (except the summary test) has its own admin list', () => {
  expect(MATH_ADMIN_SECTIONS.map(s => s.id)).toEqual(mathCategories.filter(c => !c.testLength).map(c => c.id));
});

test('the form checks what each question type needs', () => {
  const base = { kind: 'mc', prompt: 'כמה הם 3/4 מ-20?', answer: '15', distractors: ['5', '12', '16'], explanation: '' };
  expect(bank.validate(base)).toBeNull();
  expect(bank.validate({ ...base, prompt: '' })).toMatch(/השאלה/);
  expect(bank.validate({ ...base, distractors: ['5', '', '16'] })).toMatch(/3 תשובות/);
  expect(bank.validate({ ...base, distractors: ['15', '12', '16'] })).toMatch(/כפולות/);
  expect(bank.validate({ ...base, kind: 'input', answer: '1,250' })).toBeNull();
  expect(bank.validate({ ...base, kind: 'input', answer: '3/4' })).toMatch(/מספר שלם/);
});

test('saving keeps only the fields of the chosen type', () => {
  expect(bank.prepare({ kind: 'input', prompt: 'q', answer: '1,250', distractors: ['', '', ''], unit: 'ס"מ', expr: '' }))
    .toEqual({ kind: 'input', prompt: 'q', answer: '1250', unit: 'ס"מ' });
  expect(bank.prepare({ kind: 'mc', prompt: 'q', answer: '3/4', distractors: ['1/4', '2/4', '4/4'], unit: 'x' }))
    .toEqual({ kind: 'mc', prompt: 'q', answer: '3/4', distractors: ['1/4', '2/4', '4/4'] });
});

test('a saved question becomes a regular practice question', () => {
  const mc = fromCustom({ kind: 'mc', prompt: 'איזה שבר גדול יותר?', answer: '1/3', distractors: ['1/5', '1/6', '1/8'] });
  expect(mc.options.sort()).toEqual(['1/3', '1/5', '1/6', '1/8']);
  expect(mc.answer).toBe('1/3');
  expect(mc.explanation).toBeTruthy();
  const typed = fromCustom({ kind: 'input', prompt: 'כמה?', answer: '1250', unit: '₪' });
  expect(typed.kind).toBe('input');
  expect(isInputCorrect('1,250', typed.answer)).toBe(true);
  const hebrew = fromCustom({ kind: 'mc', prompt: 'הצלעות הן:', answer: 'מקבילות', distractors: ['מאונכות', 'סמוכות', 'נגדיות'] });
  expect(hebrew.optionsHebrew).toBe(true);
});

test('custom questions show up in practice - more of them, more often (up to 40%)', () => {
  expect(customShare(1)).toBeCloseTo(0.08);
  expect(customShare(5)).toBeCloseTo(0.4);
  expect(customShare(20)).toBeCloseTo(0.4);

  setRemoteContent({ custom: { mFractionMeaning: {
    a: { kind: 'mc', prompt: 'שאלה של המורה 1', answer: '1/2', distractors: ['1/3', '1/4', '1/5'] },
    b: { kind: 'input', prompt: 'שאלה של המורה 2', answer: '12' },
    c: { kind: 'input', prompt: 'שאלה של המורה 3', answer: '7' },
    d: { kind: 'input', prompt: 'שאלה של המורה 4', answer: '8' },
    e: { kind: 'input', prompt: 'שאלה של המורה 5', answer: '9' }
  } } });
  let custom = 0;
  const seen = new Set();
  for (let i = 0; i < 2000; i++) {
    const q = generateMathQuestion('mFractionMeaning');
    if (q.custom) { custom++; seen.add(q.prompt); }
  }
  expect(custom / 2000).toBeGreaterThan(0.33);
  expect(custom / 2000).toBeLessThan(0.47);
  expect(seen.size).toBe(5);
  // נושא אחר לא מושפע
  for (let i = 0; i < 300; i++) expect(generateMathQuestion('mAngles').custom).toBeUndefined();
});
