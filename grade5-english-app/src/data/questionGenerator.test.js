import { generateQuestion, getPassage, toTiles } from './questionGenerator';
import { categories } from './categories';
import { readingPassages, listeningPassages } from './reading';
import { correctSentenceQuestions, writingChecks, splitSentences, modelParagraph } from './writing';

const quizCategories = ['vocabulary', 'isAre', 'hasHave', 'canCant', 'becauseWhy', 'sentenceOrder', 'mixed'];

describe('question generator', () => {
  quizCategories.forEach(cat => {
    test(`${cat}: 300 questions are well formed`, () => {
      for (let i = 0; i < 300; i++) {
        const q = generateQuestion(cat);
        expect(q).toBeTruthy();
        if (q.kind === 'mc') {
          expect(q.options).toContain(q.answer);
          expect(new Set(q.options).size).toBe(q.options.length);
          if (q.english) expect(typeof q.english).toBe('string');
        } else {
          expect(q.tokens.map(t => t.text).sort()).toEqual([...q.answerTokens].sort());
        }
      }
    });
  });

  test('picture questions never show two words with the same picture', () => {
    for (let i = 0; i < 500; i++) {
      const q = generateQuestion('vocabulary');
      if (q.emoji) expect(q.options).toContain(q.answer);
    }
  });

  test('am / is / are offers all three, capitalized at the start of a sentence', () => {
    for (let i = 0; i < 200; i++) {
      const q = generateQuestion('isAre');
      expect(q.options).toHaveLength(3);
      if (/^____/.test(q.english)) expect(q.options).toEqual(['Am', 'Is', 'Are']);
    }
  });

  test('mixed test shows the choice in brackets with two options', () => {
    for (let i = 0; i < 200; i++) {
      const q = generateQuestion('mixed');
      expect(q.options).toHaveLength(2);
      expect(q.english).toContain(`( ${q.options.join(' / ')} )`);
      expect(q.instruction).toBe('Circle the correct word.');
    }
  });

  test('sentence tiles look like the worksheet', () => {
    expect(toTiles('Do you speak English?')).toEqual(['do', 'you', 'speak', 'English', '?']);
    expect(toTiles('I am reading an interesting book.')).toEqual(['I', 'am', 'reading', 'an', 'interesting', 'book']);
    expect(toTiles('Dan and Tom are good friends.')).toEqual(['Dan', 'and', 'Tom', 'are', 'good', 'friends']);
    expect(toTiles('We have English on Monday.')).toEqual(['we', 'have', 'English', 'on', 'Monday']);
  });

  test('every category is routable', () => {
    categories.forEach(c => {
      if (quizCategories.includes(c.id)) expect(generateQuestion(c.id)).toBeTruthy();
    });
    expect(getPassage('reading')).toBeTruthy();
    expect(getPassage('listening')).toBeTruthy();
  });
});

describe('passages', () => {
  [...readingPassages, ...listeningPassages].forEach(p => {
    test(`${p.id} questions are valid`, () => {
      p.questions.forEach(q => {
        if (q.type === 'mc') {
          expect(q.options).toContain(q.answer);
          expect(new Set(q.options).size).toBe(q.options.length);
        } else if (q.type === 'yesno') {
          expect(['Yes', 'No']).toContain(q.answer);
        } else {
          expect(q.type).toBe('order');
          expect(new Set(q.events).size).toBe(q.events.length);
        }
      });
    });
  });
});

describe('writing', () => {
  test('correct-sentence questions have distinct options', () => {
    correctSentenceQuestions.forEach(q => {
      expect(new Set([q.correct, ...q.wrong]).size).toBe(4);
    });
  });

  test('model paragraph passes every check', () => {
    const sentences = splitSentences(modelParagraph);
    writingChecks.forEach(c => {
      expect([c.id, c.test(modelParagraph, sentences)]).toEqual([c.id, true]);
    });
  });

  test('lowercase i and "I has" are caught', () => {
    const text = 'My name is Dan. i has a dog.';
    const s = splitSentences(text);
    const byId = Object.fromEntries(writingChecks.map(c => [c.id, c.test(text, s)]));
    expect(byId.bigI).toBe(false);
    expect(byId.noIs).toBe(false);
    expect(byId.capital).toBe(false);
  });
});
