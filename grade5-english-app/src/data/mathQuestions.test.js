import {
  generateMathQuestion, MATH_TOPIC_IDS, isInputCorrect, toMixed, SHAPES,
  countParallelPairs, countRightAngles, sidesParallel, sidesPerpendicular, angleType
} from './mathQuestions';
import { mathCategories } from './mathCategories';

const RUNS = 1500;
const FRACTION = /^(\d+ )?\d+\/\d+$/;

const texts = (q) => [q.label, q.prompt, q.expr, q.answer, q.unit, q.explanation, ...(q.options || [])].filter(v => v !== undefined);

describe.each(MATH_TOPIC_IDS)('%s', (topic) => {
  test(`${RUNS} random questions are all valid`, () => {
    for (let i = 0; i < RUNS; i++) {
      const q = generateMathQuestion(topic);
      const where = `${topic}: ${JSON.stringify(q)}`;
      expect([where, ['mc', 'input'].includes(q.kind)]).toEqual([where, true]);
      expect([where, Boolean(q.prompt && q.answer && q.explanation && q.label)]).toEqual([where, true]);
      texts(q).forEach(t => {
        expect([where, /NaN|undefined|null|Infinity|\[object/.test(String(t))]).toEqual([where, false]);
      });
      if (q.kind === 'mc') {
        expect([where, q.options.length >= 2]).toEqual([where, true]);
        expect([where, q.options.includes(q.answer)]).toEqual([where, true]);
        expect([where, new Set(q.options).size]).toEqual([where, q.options.length]);
        if (q.optionVisuals) q.options.forEach(o => expect([where, Boolean(q.optionVisuals[o])]).toEqual([where, true]));
      } else {
        expect([where, /^\d+$/.test(q.answer)]).toEqual([where, true]);
        expect([where, Number(q.answer) >= 0 && Number(q.answer) <= 1000000]).toEqual([where, true]);
      }
      // שבר בתשובה תמיד כתוב נכון: מונה קטן מהמכנה במספר מעורב
      if (FRACTION.test(q.answer) && q.answer.includes(' ')) {
        const [, n, d] = q.answer.match(/ (\d+)\/(\d+)$/);
        expect([where, Number(n) < Number(d)]).toEqual([where, true]);
      }
    }
  });
});

test('every math category except the test has a generator, and the test mixes topics', () => {
  mathCategories.filter(c => c.id !== 'mTest').forEach(c => expect(MATH_TOPIC_IDS).toContain(c.id));
  const topics = new Set(Array.from({ length: 300 }, () => generateMathQuestion('mTest').topic));
  expect(topics.size).toBeGreaterThan(8);
});

test('typed answers accept thousands separators and spaces', () => {
  expect(isInputCorrect('12,500', '12500')).toBe(true);
  expect(isInputCorrect(' 12 500 ', '12500')).toBe(true);
  expect(isInputCorrect('012', '12')).toBe(true);
  expect(isInputCorrect('', '0')).toBe(false);
  expect(isInputCorrect('0', '0')).toBe(true);
  expect(isInputCorrect('1250', '12500')).toBe(false);
});

test('mixed numbers', () => {
  expect(toMixed(7, 4)).toBe('1 3/4');
  expect(toMixed(8, 4)).toBe('2');
  expect(toMixed(3, 4)).toBe('3/4');
});

test('the shapes are drawn so that the picture matches the math', () => {
  expect(countParallelPairs(SHAPES.rectangle)).toBe(2);
  expect(countParallelPairs(SHAPES.square)).toBe(2);
  expect(countParallelPairs(SHAPES.parallelogram)).toBe(2);
  expect(countParallelPairs(SHAPES.rhombus)).toBe(2);
  expect(countParallelPairs(SHAPES.trapezoid)).toBe(1);
  expect(countParallelPairs(SHAPES.rightTrapezoid)).toBe(1);
  expect(countParallelPairs(SHAPES.quadrilateral)).toBe(0);
  expect(countParallelPairs(SHAPES.rightTriangle)).toBe(0);
  expect(countParallelPairs(SHAPES.hexagon)).toBe(3);

  expect(countRightAngles(SHAPES.rectangle)).toBe(4);
  expect(countRightAngles(SHAPES.square)).toBe(4);
  expect(countRightAngles(SHAPES.rightTrapezoid)).toBe(2);
  expect(countRightAngles(SHAPES.rightTriangle)).toBe(1);
  expect(countRightAngles(SHAPES.parallelogram)).toBe(0);
  expect(countRightAngles(SHAPES.rhombus)).toBe(0);
  expect(countRightAngles(SHAPES.trapezoid)).toBe(0);

  // המרובע ה"סתמי" לא נראה כמעט-מקביל או כמעט-ישר
  const q = SHAPES.quadrilateral;
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
    expect(sidesParallel(q, i, j) || sidesPerpendicular(q, i, j)).toBe(false);
  }
  // הריבוע באמת ריבועי
  const [a, b, c] = SHAPES.square.points;
  expect(b[0] - a[0]).toBe(c[1] - b[1]);
});

test('angle types', () => {
  expect(angleType(45)).toBe('חדה');
  expect(angleType(90)).toBe('ישרה');
  expect(angleType(135)).toBe('קהה');
  expect(angleType(180)).toBe('שטוחה');
});

// ---------- בדיקה עצמאית של החשבון: מציבים את התשובה בתרגיל ומחשבים ----------
const toJs = (s) => s
  .replace(/,(?=\d{3})/g, '')
  .replace(/(\d+) (\d+)\/(\d+)/g, '($1+$2/$3)')
  .replace(/×/g, '*')
  .replace(/:/g, '/');
// eslint-disable-next-line no-new-func
const evaluate = (s) => Function(`return (${toJs(s)});`)();
const valueOf = (text) => evaluate(String(text).replace(/,(?=\d{3})/g, ''));

test.each(['mOperations', 'mOrderOps', 'mEquations', 'mFractionAdd'])('%s: the answer really solves the exercise', (topic) => {
  for (let i = 0; i < 2000; i++) {
    const q = generateMathQuestion(topic);
    if (!q.expr || /שארית/.test(q.answer)) continue;
    const [left, right] = q.expr.split('=').map(s => s.trim());
    const filled = (s) => s.replace('□', `(${q.answer})`).replace('?', `(${toJs(q.answer)})`);
    const l = evaluate(filled(left));
    const r = evaluate(filled(right));
    expect([q.expr, q.answer, Math.abs(l - r) < 1e-9]).toEqual([q.expr, q.answer, true]);
  }
});

test('remainder division answers are right', () => {
  for (let i = 0; i < 2000; i++) {
    const q = generateMathQuestion('mOperations');
    if (!/שארית/.test(q.answer)) continue;
    const [a, b] = q.expr.replace(' = ?', '').split(':').map(s => valueOf(s.trim()));
    const [, quot, rem] = q.answer.match(/(\d+) ושארית (\d+)/).map(Number);
    expect([q.expr, quot * b + rem === a && rem < b]).toEqual([q.expr, true]);
  }
});

test('place value: expanded forms and number words describe the same number', () => {
  for (let i = 0; i < 2000; i++) {
    const q = generateMathQuestion('mPlaceValue');
    if (q.label === 'פילוג' && q.expr.includes('+')) expect(valueOf(q.expr)).toBe(valueOf(q.answer));
    if (q.label === 'פילוג' && q.answer.includes('+')) expect(valueOf(q.answer)).toBe(valueOf(q.expr));
  }
});
