import { generateMath3Question, MATH3_TOPIC_IDS, _test } from './math3Questions';
import { math3Categories } from './math3Categories';
import { isInputCorrect } from './mathQuestions';
import { numberToHebrew } from '../utils/hebrewNumbers';
import { roomQuestion, ROOM_TOPICS } from './escapeRoom';

describe.each(MATH3_TOPIC_IDS)('%s', (topic) => {
  test('1500 random questions are valid and at grade 3 level', () => {
    for (let i = 0; i < 1500; i++) {
      const q = generateMath3Question(topic);
      const where = `${topic}: ${JSON.stringify(q)}`;
      expect([where, ['mc', 'input'].includes(q.kind)]).toEqual([where, true]);
      expect([where, Boolean(q.prompt && q.answer && q.explanation && q.label)]).toEqual([where, true]);
      const texts = [q.prompt, q.expr, q.explanation, ...(q.options || [])].filter(Boolean).map(String);
      texts.forEach(t => expect([where, /NaN|undefined|null|\[object|Infinity/.test(t)]).toEqual([where, false]));
      if (q.kind === 'mc') {
        expect([where, q.options.length >= 2]).toEqual([where, true]);
        expect([where, q.options.includes(q.answer)]).toEqual([where, true]);
        expect([where, new Set(q.options).size]).toEqual([where, q.options.length]);
      } else {
        // תשובה מספרית שלמה, לא שלילית, עד 1,000
        expect([where, /^\d+$/.test(q.answer) && Number(q.answer) <= 1000]).toEqual([where, true]);
        expect([where, isInputCorrect(q.answer, q.answer)]).toEqual([where, true]);
      }
      // כל המספרים בשאלה עד 1,000
      (String(q.prompt) + ' ' + (q.expr || '')).match(/\d[\d,]*/g)?.forEach(n => {
        expect([where, Number(n.replace(/,/g, '')) <= 1000]).toEqual([where, true]);
      });
    }
  });
});

test('operations stay within 100', () => {
  for (let i = 0; i < 2000; i++) {
    const q = generateMath3Question('g3Operations');
    const nums = q.expr.match(/\d+/g).map(Number);
    nums.forEach(n => expect([q.expr, n <= 100]).toEqual([q.expr, true]));
    expect(Number(q.answer)).toBeLessThanOrEqual(100);
  }
});

test('the answers are actually correct (operations and missing number)', () => {
  const calc = (a, op, b) => ({ '+': a + b, '-': a - b, '×': a * b, ':': a / b }[op]);
  for (let i = 0; i < 2000; i++) {
    const q = generateMath3Question('g3Operations');
    const [, a, op, b] = /^(\d+) ([-+×:]) (\d+) = \?$/.exec(q.expr);
    expect([q.expr, calc(+a, op, +b)]).toEqual([q.expr, Number(q.answer)]);
    const m = generateMath3Question('g3Missing');
    const filled = m.expr.replace('□', m.answer);
    const [, x, op2, y, z] = /^(\d+) ([-+×:]) (\d+) = (\d+)$/.exec(filled);
    expect([filled, calc(+x, op2, +y)]).toEqual([filled, +z]);
  }
});

test('number words for grade 3 numbers', () => {
  expect(numberToHebrew(347)).toBe('שלוש מאות ארבעים ושבע');
  expect(numberToHebrew(307)).toBe('שלוש מאות ושבע');
  expect(numberToHebrew(340)).toBe('שלוש מאות וארבעים');
  expect(numberToHebrew(215)).toBe('מאתיים וחמש עשרה');
  for (let i = 0; i < 500; i++) {
    const n = _test.threeDigit();
    expect(n).toBeGreaterThanOrEqual(100);
    expect(n).toBeLessThanOrEqual(999);
    _test.swapsOf(n).forEach(v => expect(v).not.toBe(n));
  }
});

test('every category is a topic (except the test) and the mixed test covers all topics', () => {
  math3Categories.filter(c => c.id !== 'g3Test').forEach(c => expect(MATH3_TOPIC_IDS).toContain(c.id));
  const seen = new Set();
  for (let i = 0; i < 400; i++) seen.add(generateMath3Question('g3Test').topic);
  expect([...seen].sort()).toEqual([...MATH3_TOPIC_IDS].sort());
});

test('escape room supports grade 3 math', () => {
  expect(ROOM_TOPICS.math3).toEqual(MATH3_TOPIC_IDS);
  MATH3_TOPIC_IDS.forEach(t => {
    const q = roomQuestion(t);
    expect(q.subject).toBe('math3');
  });
});
