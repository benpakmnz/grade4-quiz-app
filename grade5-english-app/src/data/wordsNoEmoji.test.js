import { generateQuestion } from './questionGenerator';
import { setRemoteContent, BUILTIN, builtinId } from './contentStore';
import { ADMIN_SECTIONS } from './adminSchemas';

// מורה מוסיפה מילים בלי אימוג'י (ומסתירה את כל המובנות - הכי קיצוני)
beforeAll(() => {
  const custom = {};
  ['apple', 'river', 'pencil', 'window', 'garden', 'teacher', 'cloud', 'bridge'].forEach((en, i) => {
    custom[`w${i}`] = { en, he: `מילה ${i}`, def: `A simple word number ${i}.`, group: 'school' };
  });
  const hidden = Object.fromEntries(BUILTIN.words.map(w => [builtinId(w), true]));
  setRemoteContent({ custom: { words: custom }, hidden: { words: hidden } });
});
afterAll(() => setRemoteContent(null));

test('words without an emoji never make a picture question, and no "undefined" anywhere', () => {
  for (let i = 0; i < 1500; i++) {
    const q = generateQuestion('vocabulary');
    const text = JSON.stringify(q);
    expect([text, /undefined|null/.test(text)]).toEqual([text, false]);
    if (q.label === 'התאמת מילה לתמונה') throw new Error(`picture question without a picture: ${text}`);
  }
});

test('the admin form accepts a word without an emoji', () => {
  const words = ADMIN_SECTIONS.find(s => s.id === 'vocabulary').banks.find(b => b.bank === 'words');
  expect(words.validate({ en: 'apple', he: 'תפוח', emoji: '', def: 'A red fruit.', group: 'food' })).toBeNull();
  expect(words.validate({ en: 'apple', he: '', emoji: '', def: 'A red fruit.' })).toMatch(/צריך/);
  expect(words.summary({ en: 'apple', he: 'תפוח', emoji: '' })).toBe('apple = תפוח');
});
