import { BUILTIN, builtinId, setRemoteContent, getBank, listBank } from './contentStore';
import { ADMIN_SECTIONS, emptyItem, cleanItem } from './adminSchemas';
import { generateQuestion, getPassage } from './questionGenerator';

afterEach(() => setRemoteContent(null));

const bankDefs = ADMIN_SECTIONS.flatMap(s => s.banks);
const def = (bank) => bankDefs.find(b => b.bank === bank);

describe('content store', () => {
  test('with no remote content the banks are the built-in ones', () => {
    expect(getBank('isAre')).toEqual(BUILTIN.isAre);
  });

  test('custom questions are added and hidden built-ins are removed', () => {
    const first = BUILTIN.isAre[0];
    setRemoteContent({
      custom: { isAre: { x1: { sentence: 'Noa ____ happy.', answer: 'is', why: 'she' } } },
      hidden: { isAre: { [builtinId(first)]: true } }
    });
    const bank = getBank('isAre');
    expect(bank).toContainEqual({ sentence: 'Noa ____ happy.', answer: 'is', why: 'she' });
    expect(bank).not.toContainEqual(first);
    expect(bank).toHaveLength(BUILTIN.isAre.length);
    const hiddenEntry = listBank('isAre').find(e => e.item === first);
    expect(hiddenEntry.hidden).toBe(true);
  });

  test('hiding everything falls back to the built-ins instead of an empty bank', () => {
    const hidden = Object.fromEntries(BUILTIN.canCant.map(i => [builtinId(i), true]));
    setRemoteContent({ hidden: { canCant: hidden } });
    expect(getBank('canCant')).toEqual(BUILTIN.canCant);
  });

  test('arrays stored by Firebase as objects come back as arrays', () => {
    setRemoteContent({
      custom: { fill: { a: { sentence: 'I eat ____.', answer: 'bread', distractors: { 0: 'car', 1: 'sky', 2: 'pen' } } } }
    });
    const item = getBank('fill').find(i => i.answer === 'bread');
    expect(item.distractors).toEqual(['car', 'sky', 'pen']);
  });

  test('built-in ids are unique', () => {
    Object.entries(BUILTIN).forEach(([bank, items]) => {
      const ids = items.map(builtinId);
      expect([bank, new Set(ids).size]).toEqual([bank, ids.length]);
    });
  });
});

describe('admin forms', () => {
  test('an empty form never validates', () => {
    bankDefs.forEach(b => {
      expect([b.bank, b.validate(cleanItem(emptyItem(b)))]).not.toEqual([b.bank, null]);
    });
  });

  test('every built-in question passes its own form validation', () => {
    bankDefs.forEach(b => {
      BUILTIN[b.bank].forEach(item => {
        expect([b.bank, b.validate(item)]).toEqual([b.bank, null]);
      });
    });
  });

  test('grammar form requires the ____ blank and a valid answer', () => {
    const g = def('hasHave');
    expect(g.validate({ sentence: 'She has a cat.', answer: 'has', why: '' })).toMatch(/____/);
    expect(g.validate({ sentence: 'She ____ a cat.', answer: 'is', why: '' })).toMatch(/תשובה/);
    expect(g.validate({ sentence: 'She ____ a cat.', answer: 'has', why: '' })).toBeNull();
  });

  test('passage form checks each question', () => {
    const p = def('reading');
    const base = { title: 'T', text: 'Some text.' };
    expect(p.validate({ ...base, questions: [{ type: 'mc', q: 'Q?', options: ['a', 'b', 'c', 'd'], answer: '' }] })).toMatch(/שאלה 1/);
    expect(p.validate({ ...base, questions: [{ type: 'mc', q: 'Q?', options: ['a', 'a', 'c', 'd'], answer: 'a' }] })).toMatch(/כפולות/);
    expect(p.validate({ ...base, questions: [{ type: 'order', q: 'x', events: ['one', ''] }] })).toMatch(/אירועים/);
    expect(p.validate({ ...base, questions: [{ type: 'yesno', q: 'Q?', answer: 'Yes' }] })).toBeNull();
  });
});

describe('custom questions reach the games', () => {
  test('a question added in admin shows up in its category', () => {
    setRemoteContent({ custom: { hasHave: { only: { sentence: 'Rotem ____ a kite.', answer: 'has', why: 'she' } } } });
    const seen = new Set();
    for (let i = 0; i < 400; i++) seen.add(generateQuestion('hasHave').english);
    expect(seen.has('Rotem ____ a kite.')).toBe(true);
  });

  test('a custom reading passage can be played', () => {
    const passage = {
      title: 'My Kite', text: 'I have a red kite.',
      questions: { 0: { type: 'yesno', q: 'Is the kite red?', answer: 'Yes' } }
    };
    setRemoteContent({ custom: { reading: { k: passage } } });
    let found = null;
    for (let i = 0; i < 100 && !found; i++) {
      const p = getPassage('reading');
      if (p.title === 'My Kite') found = p;
    }
    expect(found.questions).toEqual([{ type: 'yesno', q: 'Is the kite red?', answer: 'Yes' }]);
  });
});
