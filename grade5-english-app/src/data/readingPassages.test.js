import { PASSAGES, parsePassage, parseParagraph, wrongTapHint, Q_KINDS } from './readingPassages';
import { lessons } from './lessons';
import { hebrewCategories } from './hebrewCategories';

// מילות קישור שאסור שיופיעו בקטע בלי סימון (אחרת ילד/ה ילחץ עליהן ויקבל "לא נכון")
const CONNECTIVES = ['אבל', 'אך', 'כי', 'לכן', 'ולכן', 'כאשר', 'למרות', 'כדי', 'אם', 'לפני', 'אחרי', 'מפני', 'בגלל', 'גם', 'וגם', 'כמו', 'אלא', 'אולם', 'על כן', 'בנוסף'];

describe.each(PASSAGES.map(p => [p.id, p]))('%s', (id, p) => {
  const paras = parsePassage(p);

  test('the marked paragraph is fully tagged', () => {
    paras[p.tagged].forEach(t => expect([t.text, Boolean(t.tag)]).toEqual([t.text, true]));
  });

  test('every connective in the passage is tagged, and only real connectives are', () => {
    paras.forEach(para => para.forEach(t => {
      if (CONNECTIVES.includes(t.text)) expect([t.text, t.tag]).toEqual([t.text, 'c']);
      if (t.tag === 'c') expect(CONNECTIVES).toContain(t.text);
    }));
  });

  test('marking tasks can be completed exactly', () => {
    const cCount = paras.flat().filter(t => t.tag === 'c').length;
    p.tasks.forEach(task => {
      if (task.type === 'c') expect(task.count).toBe(cCount);
      else {
        const inPara = paras[p.tagged].filter(t => t.tag === task.type).length;
        expect([task.type, task.count <= inPara && task.count >= 3]).toEqual([task.type, true]);
      }
    });
  });

  test('comprehension questions: 6, one right answer each, all kinds used sensibly', () => {
    expect(p.questions).toHaveLength(6);
    p.questions.forEach(q => {
      expect(Object.keys(Q_KINDS)).toContain(q.kind);
      expect(q.options).toContain(q.answer);
      expect(new Set(q.options).size).toBe(q.options.length);
      expect(q.tip.length).toBeGreaterThan(10);
    });
    expect(p.questions.some(q => q.kind === 'inference')).toBe(true);
    expect(p.questions.some(q => q.kind === 'vocab')).toBe(true);
  });

  test('medium length passage', () => {
    const words = paras.flat().length;
    expect(words).toBeGreaterThanOrEqual(80);
    expect(words).toBeLessThanOrEqual(200);
  });
});

test('parsing keeps punctuation outside the word', () => {
  const t = parseParagraph('נועה|n נכנסה|v למטבח|n. אבל|c, שלום!');
  expect(t.map(x => [x.text, x.tag, x.punct])).toEqual([['נועה', 'n', ''], ['נכנסה', 'v', ''], ['למטבח', 'n', '.'], ['אבל', 'c', ','], ['שלום', null, '!']]);
});

test('wrong-tap hints explain what the word is', () => {
  expect(wrongTapHint({ text: 'הדלת', tag: 'n' }, 'v')).toBe('"הדלת" - שם עצם, לא פועל.');
  expect(wrongTapHint({ text: 'ומצאה', tag: null }, 'c')).toMatch(/ו' החיבור/);
});

test('the reading unit has a lesson and a category', () => {
  expect(lessons.hReading).toBeTruthy();
  expect(hebrewCategories.find(c => c.id === 'hReading')).toBeTruthy();
});
