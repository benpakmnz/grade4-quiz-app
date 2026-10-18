import { lessons } from './lessons';
import { allCategories as categories } from './subjects';

const KNOWN = ['rules', 'howto', 'sort', 'check', 'tips', 'pictures'];
const VISUALS = ['fraction', 'fractionPair', 'set', 'numberLine', 'sequence', 'polygon', 'angle', 'clock', 'rect'];

test('every practice category except the mixed test has a lesson', () => {
  categories.filter(c => !['mixed', 'mTest'].includes(c.id)).forEach(c => {
    expect([c.id, Boolean(lessons[c.id])]).toEqual([c.id, true]);
  });
});

Object.entries(lessons).forEach(([id, lesson]) => {
  test(`${id} lesson is well formed`, () => {
    expect(lesson.steps.length).toBeGreaterThan(0);
    lesson.steps.forEach(step => {
      expect(KNOWN).toContain(step.type);
      if (step.type === 'sort') {
        step.items.forEach(it => expect(step.buckets).toContain(it.answer));
        step.buckets.forEach(b => expect(step.items.some(it => it.answer === b)).toBe(true));
      }
      if (step.type === 'check') {
        step.questions.forEach(q => {
          expect(q.options).toContain(q.answer);
          expect(new Set(q.options).size).toBe(q.options.length);
        });
      }
      if (step.type === 'howto') expect(step.steps.length).toBeGreaterThan(1);
      if (step.type === 'pictures') {
        step.cards.forEach(card => {
          expect(VISUALS).toContain(card.visual.type);
          expect(card.text.length).toBeGreaterThan(10);
        });
      }
    });
  });
});
