import {
  generateHebrewQuestion, HEBREW_TOPIC_IDS, ROOT_FAMILIES, NOUNS, VERBS, conjugate, PERSONS,
  CONNECTIVE_SENTENCES, CONNECTIVE_TYPES, RELATIONS, TAGGED_SENTENCES, REPLACE_ITEMS, ALL_PRONOUNS, _test,
  WEAK_FAMILIES, LOOKALIKES, NOUN_SENTENCES, ADJECTIVES, TRICKY_NOUNS, VERB_SENTENCES, CLAUSES, draw,
  checkRootWords, isSameRoot, hasRootInOrder
} from './hebrewQuestions';
import { hebrewCategories } from './hebrewCategories';
import { lessons } from './lessons';
import { roomQuestion, ROOM_TOPICS } from './escapeRoom';

const FINAL = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };
const plain = (w) => w.split('').map(c => FINAL[c] || c).join('');

describe.each(HEBREW_TOPIC_IDS)('%s', (topic) => {
  test('1500 random questions are all valid', () => {
    for (let i = 0; i < 1500; i++) {
      const q = generateHebrewQuestion(topic);
      const where = `${topic}: ${JSON.stringify(q)}`;
      expect([where, ['mc', 'words', 'text', 'multi'].includes(q.kind)]).toEqual([where, true]);
      expect([where, Boolean(q.prompt && q.answer && q.explanation && q.label)]).toEqual([where, true]);
      if (q.kind === 'mc') {
        expect([where, q.options.length >= 2]).toEqual([where, true]);
        expect([where, q.options.includes(q.answer)]).toEqual([where, true]);
      }
      if (q.kind === 'multi') {
        q.answers.forEach(a => expect([where, q.options.includes(a)]).toEqual([where, true]));
        expect([where, q.check(q.answers), q.check(q.answers.slice(1)), q.check(q.options)]).toEqual([where, true, false, false]);
      }
      if (q.kind === 'text') expect([where, q.check(q.answer), q.check('אבג')]).toEqual([where, true, false]);
      if (q.kind === 'words') expect([where, q.count >= 2 && typeof q.check === 'function']).toEqual([where, true]);
      if (q.options) expect([where, new Set(q.options).size]).toEqual([where, q.options.length]);
      [q.prompt, q.explanation, ...(q.options || [])].forEach(t => {
        expect([where, /NaN|undefined|null|\[object/.test(String(t))]).toEqual([where, false]);
      });
    }
  });
});

test('mixed test picks from every topic', () => {
  const seen = new Set();
  for (let i = 0; i < 400; i++) seen.add(generateHebrewQuestion('hTest').topic);
  expect([...seen].sort()).toEqual([...HEBREW_TOPIC_IDS].sort());
});

test('every word in a family has its root letters in order', () => {
  ROOT_FAMILIES.forEach(({ root, words }) => {
    const letters = root.split('.').map(plain);
    words.forEach(w => {
      const re = new RegExp(letters.join('.*'));
      expect([w, re.test(plain(w))]).toEqual([w, true]);
    });
  });
  // אין מילה בשתי משפחות, ואין שורש פעמיים
  const all = ROOT_FAMILIES.flatMap(f => f.words);
  expect(new Set(all).size).toBe(all.length);
  expect(new Set(ROOT_FAMILIES.map(f => f.root)).size).toBe(ROOT_FAMILIES.length);
});

test('the "first three letters" trap is never the real root of a word that starts with an addition', () => {
  expect(_test.firstLettersTrap('מכתב')).toBe('מ.כ.ת');
  expect(_test.firstLettersTrap('צלם')).toBe('צ.ל.ם');
});

test('nouns: gender and plural data', () => {
  NOUNS.forEach(([sing, plural, gender]) => {
    expect(['ז', 'נ']).toContain(gender);
    expect(sing).not.toBe(plural);
    expect(_test.wrongPlurals(sing, plural)).not.toContain(plural);
  });
  const g = Object.fromEntries(NOUNS.map(([s, , gen]) => [s, gen]));
  // המלכודות
  expect(g['ציפור']).toBe('נ');
  expect(g['שנה']).toBe('נ');
  expect(g['שולחן']).toBe('ז');
  expect(g['לילה']).toBe('ז');
});

test('tagged sentences: exactly one noun and one verb among the words', () => {
  TAGGED_SENTENCES.forEach(s => {
    expect(s.filter(([, t]) => t === 'n')).toHaveLength(1);
    expect(s.filter(([, t]) => t === 'v')).toHaveLength(1);
    expect(new Set(s.map(([w]) => w)).size).toBe(s.length);
  });
});

test('connectives: the answer is never also a distractor, and types are known', () => {
  CONNECTIVE_SENTENCES.forEach(c => {
    expect(c.s).toContain('____');
    expect(c.d).not.toContain(c.a);
    expect(RELATIONS).toContain(c.t);
  });
  CONNECTIVE_TYPES.forEach(c => expect(RELATIONS).toContain(c.t));
});

test('conjugation of a few verbs (spot check)', () => {
  const by = (root) => conjugate(VERBS.find(v => v.root === root));
  expect(by('כ.ת.ב').past.anachnu).toBe('כתבנו');
  expect(by('כ.ת.ב').present.hi).toBe('כותבת');
  expect(by('כ.ת.ב').future.hem).toBe('יכתבו');
  expect(by('כ.ת.ב').future.ani).toBe('אכתוב');
  expect(by('ל.מ.ד').future.hu).toBe('ילמד');
  expect(by('ש.מ.ע').present.hem).toBe('שומעים');
  expect(by('ה.ל.כ').past.hu).toBe('הלך');
  expect(by('ה.ל.כ').future.anachnu).toBe('נלך');
  expect(by('ה.ל.כ').present.ani).toBe('הולך');
});

test('"who does it" questions always have exactly one possible pronoun', () => {
  VERBS.forEach(v => {
    const f = conjugate(v);
    ['past', 'future'].forEach(t => {
      _test.uniquePersons(f, t).forEach(p => {
        const same = PERSONS.filter(x => f[t][x.id] === f[t][p.id]);
        expect(same).toHaveLength(1);
      });
    });
  });
});

test('pronoun replacements are valid pronouns', () => {
  REPLACE_ITEMS.forEach(r => expect(ALL_PRONOUNS).toContain(r.a));
});

test('every hebrew topic has a "how to solve" lesson', () => {
  hebrewCategories.filter(c => !c.testLength).forEach(c => {
    expect([c.id, Boolean(lessons[c.id])]).toEqual([c.id, true]);
    lessons[c.id].steps.filter(s => s.type === 'check').forEach(s => s.questions.forEach(q => {
      expect(q.options).toContain(q.answer);
    }));
  });
});

test('escape room supports hebrew', () => {
  expect(ROOM_TOPICS.hebrew).toEqual(HEBREW_TOPIC_IDS);
  HEBREW_TOPIC_IDS.forEach(t => {
    const q = roomQuestion(t);
    expect(q.subject).toBe('hebrew');
    expect(q.options).toContain(q.answer);
  });
});

test('weak roots: unique words and roots, no overlap with the regular families', () => {
  const regular = ROOT_FAMILIES.flatMap(f => f.words);
  const weak = WEAK_FAMILIES.flatMap(f => f.words);
  expect(new Set(weak).size).toBe(weak.length);
  weak.forEach(w => expect([w, regular.includes(w)]).toEqual([w, false]));
  const roots = [...ROOT_FAMILIES, ...WEAK_FAMILIES].map(f => f.root);
  expect(new Set(roots).size).toBe(roots.length);
  WEAK_FAMILIES.forEach(f => {
    expect(f.root).toMatch(/^[א-ת]\.[א-ת]\.[א-ת]$/);
    expect(f.note.length).toBeGreaterThan(10);
    expect(f.words.length).toBeGreaterThanOrEqual(3);
  });
});

test('lookalikes belong to a known family and are not in it', () => {
  const all = [...ROOT_FAMILIES, ...WEAK_FAMILIES].flatMap(f => f.words);
  LOOKALIKES.forEach(l => {
    const fam = ROOT_FAMILIES.find(f => f.root === l.root);
    expect([l.word, Boolean(fam)]).toEqual([l.word, true]);
    expect([l.word, all.includes(l.word)]).toEqual([l.word, false]);
    expect(l.wordRoot).not.toBe(l.root);
    // המילה הדומה באמת "נראית" דומה: מתחילה ב-2 אותיות השורש הראשונות
    expect(plain(l.word).replace(/[וי]/g, '').startsWith(l.root.split('.').slice(0, 2).map(plain).join(''))).toBe(true);
  });
});

test('root questions: the hard distractors never equal the answer, and the wrong roots are real options', () => {
  for (let i = 0; i < 3000; i++) {
    const q = generateHebrewQuestion('hRoots');
    if (q.kind !== 'mc') continue;
    expect(q.options.filter(o => o === q.answer)).toHaveLength(1);
    if (/^מה השורש/.test(q.prompt)) q.options.forEach(o => expect(o).toMatch(/^[א-ת]\.[א-ת]\.[א-ת]$/));
  }
});

test('nouns: sentences, adjectives and tricky words', () => {
  NOUN_SENTENCES.forEach(({ s, nouns }) => {
    const words = s.split(' ');
    nouns.forEach(n => expect([s, words.includes(n)]).toEqual([s, true]));
    expect(nouns.length).toBeGreaterThanOrEqual(2);
    expect(words.length - nouns.length).toBeGreaterThanOrEqual(1);
  });
  ADJECTIVES.forEach(a => expect(new Set(a).size).toBe(4));
  expect(TRICKY_NOUNS.length).toBeGreaterThan(15);
  const t = TRICKY_NOUNS.map(n => n[0]);
  ['ציפור', 'שנה', 'שולחן', 'לילה', 'איש', 'עיר', 'בית', 'יום'].forEach(w => expect(t).toContain(w));
});

test('noun agreement goes by the real gender, not the plural ending', () => {
  for (let i = 0; i < 3000; i++) {
    const q = generateHebrewQuestion('hNouns');
    if (q.label !== 'התאמה') continue;
    const noun = /"ה(\S+) ה____"/.exec(q.prompt)[1];
    const entry = NOUNS.find(n => n[0] === noun || n[1] === noun);
    const plural = entry[1] === noun;
    const adj = ADJECTIVES.find(a => a.some(x => q.options.includes(`ה${x}`)));
    expect(q.answer).toBe(`ה${adj[(plural ? 2 : 0) + (entry[2] === 'נ' ? 1 : 0)]}`);
  }
});

test('connectives: no distractor has the same meaning as the answer (it would also be correct)', () => {
  const norm = (w) => w.replace(/ (ש|ל)$/, '');
  const relationOf = (w) => CONNECTIVE_TYPES.find(c => norm(c.w) === norm(w) || norm(c.w) === norm(w).replace(/^ו/, ''))?.t;
  CONNECTIVE_SENTENCES.forEach(c => {
    expect([c.s, relationOf(c.a)]).toEqual([c.s, c.t]);
    c.d.forEach(d => {
      const r = relationOf(d);
      expect([c.s, d, Boolean(r)]).toEqual([c.s, d, true]);
      expect([c.s, d, r === c.t]).toEqual([c.s, d, false]);
    });
  });
  expect(new Set(CONNECTIVE_SENTENCES.map(c => c.s)).size).toBe(CONNECTIVE_SENTENCES.length);
  expect(CONNECTIVE_SENTENCES.length).toBeGreaterThanOrEqual(40);
  CLAUSES.forEach(c => {
    expect(RELATIONS).toContain(c.t);
    expect(c.bad).not.toContain(c.good);
    expect(c.bad).toHaveLength(2);
  });
});

test('no repeats: a list is used up before anything comes back, and never twice in a row', () => {
  const list = ['a', 'b', 'c', 'd', 'e'];
  let prev = null;
  for (let round = 0; round < 50; round++) {
    const seen = new Set();
    for (let i = 0; i < list.length; i++) {
      const x = draw('test-deck', list);
      expect(x).not.toBe(prev);
      seen.add(x);
      prev = x;
    }
    expect(seen.size).toBe(list.length);
  }
});

test('connectives: 20 questions in a row never repeat the same question', () => {
  for (let round = 0; round < 20; round++) {
    const prompts = Array.from({ length: 20 }, () => generateHebrewQuestion('hConnectives').prompt);
    expect(new Set(prompts).size).toBe(prompts.length);
  }
});

test('find-the-verb sentences are separate from the noun sentences', () => {
  const nounTexts = TAGGED_SENTENCES.map(s => s.map(([w]) => w).join(' '));
  VERB_SENTENCES.forEach(s => {
    expect(s.filter(([, t]) => t === 'v')).toHaveLength(1);
    expect(nounTexts).not.toContain(s.map(([w]) => w).join(' '));
  });
});

test('typed root: any reasonable way of writing it is accepted', () => {
  ['זכר', 'ז.כ.ר', 'ז כ ר', 'ז-כ-ר', ' זכר '].forEach(t => expect([t, isSameRoot(t, 'ז.כ.ר')]).toEqual([t, true]));
  expect(isSameRoot('צלם', 'צ.ל.ם')).toBe(true);
  expect(isSameRoot('צלמ', 'צ.ל.ם')).toBe(true);
  ['רכז', 'זכ', 'זכרה', 'מזכרת'].forEach(t => expect([t, isSameRoot(t, 'ז.כ.ר')]).toEqual([t, false]));
});

test('written words from a root: family words, verbs and new words with the root letters are accepted', () => {
  expect(checkRootWords('כ.ת.ב', ['מכתב', 'כתבנו', 'הכתבה'])).toEqual(['ok', 'ok', 'ok']);
  expect(checkRootWords('כ.ת.ב', ['מכתב', 'מכתב', 'ספר'])).toEqual(['ok', 'dup', 'bad']);
  expect(checkRootWords('כ.ת.ב', ['מכתב', '', 'בתכ'])).toEqual(['ok', 'empty', 'bad']);
  expect(checkRootWords('ל.מ.ד', ['תלמיד', 'לימוד'], ['תלמיד'])).toEqual(['given', 'ok']);
  expect(checkRootWords('צ.ל.ם', ['מצלמה', 'צילום', 'צלמת'])).toEqual(['ok', 'ok', 'ok']);
  expect(checkRootWords('כ.ת.ב', ['abc', 'כת', 'כתב'])).toEqual(['bad', 'bad', 'ok']);
  // כל מילה מוכרת מהמשפחה באמת עוברת
  ROOT_FAMILIES.forEach(f => expect(checkRootWords(f.root, f.words).every(r => r === 'ok')).toBe(true));
  expect(hasRootInOrder('ש.מ.ר', 'משמרת')).toBe(true);
});
