import {
  ROOM_TOPICS, TASKS_PER_KID, pickTopics, roomQuestion, checkRoomAnswer, canHint, makeHint,
  makeCodeDigits, makeRoomCode, readRoomParam, formatClock, roomReward, recordRoomResult,
  recordHintGiven, readEscapeStats, currentTier, nextTier, shareText, ESCAPE_KEY
} from './escapeRoom';

beforeEach(() => localStorage.clear());

describe('pickTopics', () => {
  test('one question per topic, no repeats, 5 tasks', () => {
    ['english', 'math'].forEach(subject => {
      for (let i = 0; i < 50; i++) {
        const topics = pickTopics(subject, {});
        expect(topics).toHaveLength(TASKS_PER_KID);
        expect(new Set(topics).size).toBe(TASKS_PER_KID);
        topics.forEach(t => expect(ROOM_TOPICS[subject]).toContain(t));
      }
    });
  });

  test('weak topics come first ("ברמה שלו")', () => {
    const stats = {
      vocabulary: { correct: 30, total: 30 },
      isAre: { correct: 30, total: 31 },
      hasHave: { correct: 2, total: 10 },
      canCant: { correct: 1, total: 10 },
      becauseWhy: { correct: 3, total: 10 },
      reading: { correct: 2, total: 9 }
    };
    let strongLeftOut = 0;
    for (let i = 0; i < 100; i++) {
      const topics = pickTopics('english', stats);
      if (!topics.includes('vocabulary') || !topics.includes('isAre')) strongLeftOut++;
      ['hasHave', 'canCant', 'becauseWhy', 'reading'].forEach(t => expect(topics).toContain(t));
    }
    expect(strongLeftOut).toBe(100);
  });
});

describe('roomQuestion', () => {
  test('every room topic gives a question that can be answered', () => {
    Object.values(ROOM_TOPICS).flat().forEach(topic => {
      for (let i = 0; i < 40; i++) {
        const q = roomQuestion(topic);
        expect(q).toBeTruthy();
        expect(['mc', 'input']).toContain(q.kind);
        expect(q.topic).toBe(topic);
        if (q.kind === 'mc') {
          expect(q.options).toContain(q.answer);
          expect(checkRoomAnswer(q, q.answer)).toBe(true);
          expect(checkRoomAnswer(q, q.options.find(o => o !== q.answer))).toBe(false);
        } else {
          expect(checkRoomAnswer(q, q.answer)).toBe(true);
        }
      }
    });
  });

  test('a topic that cannot make a question falls back to another topic', () => {
    const q = roomQuestion('noSuchTopic');
    expect(q).toBeTruthy();
    expect(q.topic).toBe('noSuchTopic');
    expect(ROOM_TOPICS.english).toContain(q.from);
  });

  test('reading question includes the passage', () => {
    const q = roomQuestion('reading');
    expect(q.passage.text.length).toBeGreaterThan(50);
    expect(q.english).toBeTruthy();
  });
});

describe('hints from the shared bank', () => {
  test('multiple choice: removes up to two wrong answers, never the right one', () => {
    const q = { kind: 'mc', options: ['has', 'have', 'is', 'are'], answer: 'has' };
    const h = makeHint(q);
    expect(h.remove).toHaveLength(2);
    expect(h.remove).not.toContain('has');
    const three = makeHint({ kind: 'mc', options: ['a', 'b', 'c'], answer: 'b' });
    expect(three.remove).toHaveLength(1);
  });

  test('no hint for yes/no (only two options)', () => {
    expect(canHint({ kind: 'mc', options: ['Yes', 'No'], answer: 'No' })).toBe(false);
    expect(makeHint({ kind: 'mc', options: ['Yes', 'No'], answer: 'No' })).toBeNull();
  });

  test('open answer: first digit and length', () => {
    expect(makeHint({ kind: 'input', answer: '348' }).text).toContain('3');
    expect(makeHint({ kind: 'input', answer: '348' }).text).toContain('3 ספרות');
    expect(makeHint({ kind: 'input', answer: '7' }).text).toContain('ספרה אחת');
  });
});

test('codes and links', () => {
  expect(makeRoomCode()).toMatch(/^[1-9][0-9]{5}$/);
  const digits = makeCodeDigits(7);
  expect(digits).toHaveLength(7);
  digits.forEach(d => expect(d >= 0 && d <= 9).toBe(true));
  expect(readRoomParam('?room=123456')).toBe('123456');
  expect(readRoomParam('?room=12a456')).toBeNull();
  expect(readRoomParam('')).toBeNull();
  expect(formatClock(75000)).toBe('1:15');
  expect(formatClock(-5)).toBe('0:00');
});

test('reward is the same for the whole team', () => {
  expect(roomReward(5, 5)).toBe(200);
  expect(roomReward(4, 5)).toBe(40);
  expect(roomReward(0, 5)).toBe(0);
});

describe('trophy counter', () => {
  test('each room counts once, also when time ran out', () => {
    expect(recordRoomResult('111111-1', true).played).toBe(1);
    expect(recordRoomResult('111111-1', true)).toBeNull();
    const s = recordRoomResult('222222-1', false);
    expect(s.played).toBe(2);
    expect(s.opened).toBe(1);
    recordHintGiven();
    expect(readEscapeStats().hints).toBe(1);
    expect(JSON.parse(localStorage.getItem(ESCAPE_KEY)).played).toBe(2);
  });

  test('history keeps the team, friends and time - newest first', () => {
    recordRoomResult('333333-1', true, { team: 'מפצחי הכספות', subject: 'math', filled: 3, total: 3, seconds: 412, emojis: ['🦄', '🦁', '🐬'] }, 1000);
    recordRoomResult('444444-1', false, { team: 'הנמרים', subject: 'english', filled: 2, total: 4, seconds: null, emojis: ['🐼'] }, 2000);
    const { history } = readEscapeStats();
    expect(history.map(h => h.team)).toEqual(['הנמרים', 'מפצחי הכספות']);
    expect(history[1]).toMatchObject({ opened: true, subject: 'math', seconds: 412, emojis: ['🦄', '🦁', '🐬'], at: 1000 });
    expect(history[0]).toMatchObject({ opened: false, filled: 2, total: 4, seconds: null });
  });

  test('old saved stats without history still work', () => {
    localStorage.setItem(ESCAPE_KEY, JSON.stringify({ played: 2, opened: 1, hints: 0, rooms: ['a', 'b'] }));
    expect(readEscapeStats().history).toEqual([]);
    expect(recordRoomResult('c', true, { team: 'x' }).history).toHaveLength(1);
  });

  test('tiers: bronze at 1, silver at 5, gold at 10', () => {
    expect(currentTier(0)).toBeNull();
    expect(currentTier(1).id).toBe('bronze');
    expect(currentTier(5).id).toBe('silver');
    expect(currentTier(12).id).toBe('gold');
    expect(nextTier(3).id).toBe('silver');
    expect(nextTier(10)).toBeNull();
  });

  test('broken saved data does not crash', () => {
    localStorage.setItem(ESCAPE_KEY, '{oops');
    expect(readEscapeStats().played).toBe(0);
  });
});

test('share text has the team and result, but no names or scores of kids', () => {
  const text = shareText({ team: 'מפצחי הכספות', opened: true, filled: 5, total: 5, seconds: 692, link: 'https://x.app' });
  expect(text).toContain('מפצחי הכספות');
  expect(text).toContain('11:32');
  expect(text).toContain('https://x.app');
  expect(shareText({ team: 'צוות', opened: false, filled: 4, total: 5, link: 'l' })).toContain('4 מתוך 5');
});
