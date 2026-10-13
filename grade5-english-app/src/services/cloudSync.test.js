// בדיקות להחלטות הסנכרון: מתי טוענים מהענן, מתי מעלים, ומתי מנקים
const cloud = {};

jest.mock('./firebase', () => ({ db: {} }));
jest.mock('firebase/database', () => ({
  ref: (db, path) => path,
  get: async (path) => ({ exists: () => path in cloud, val: () => cloud[path] }),
  set: async (path, value) => { cloud[path] = JSON.parse(JSON.stringify(value)); },
  remove: async (path) => { Object.keys(cloud).filter(k => k.startsWith(path)).forEach(k => delete cloud[k]); },
  serverTimestamp: () => 'SERVER_TS'
}));

const { startSync, stopSync, notifyLocalChange, pushNow, mergeProgress } = require('./cloudSync');

const P = (uid) => `english/users/${uid}/progress`;
const alice = { uid: 'alice', displayName: 'Alice A', email: 'a@x.com' };
const bob = { uid: 'bob', displayName: 'Bob', email: 'b@x.com' };

beforeEach(() => {
  localStorage.clear();
  Object.keys(cloud).forEach(k => delete cloud[k]);
  stopSync();
});

test('first login uploads existing local (guest) progress', async () => {
  localStorage.setItem('english_userData', '{"name":"Noa"}');
  localStorage.setItem('english_score', '120');
  await startSync(alice);
  expect(cloud[P('alice')].data.english_score).toBe('120');
  expect(localStorage.getItem('english_owner')).toBe('alice');
});

test('login on a new device loads cloud progress', async () => {
  cloud[P('alice')] = { data: { english_userData: '{"name":"Noa"}', english_score: '300' }, clientUpdatedAt: 1000 };
  await startSync(alice);
  expect(localStorage.getItem('english_score')).toBe('300');
});

test('cloud wins over older local data of the same user', async () => {
  localStorage.setItem('english_owner', 'alice');
  localStorage.setItem('english_userData', '{"name":"Noa"}');
  localStorage.setItem('english_score', '50');
  localStorage.setItem('english_localUpdatedAt', '500');
  cloud[P('alice')] = { data: { english_userData: '{"name":"Noa"}', english_score: '300' }, clientUpdatedAt: 1000 };
  await startSync(alice);
  expect(localStorage.getItem('english_score')).toBe('300');
});

test('newer offline progress of the same user is uploaded, not overwritten', async () => {
  localStorage.setItem('english_owner', 'alice');
  localStorage.setItem('english_userData', '{"name":"Noa"}');
  localStorage.setItem('english_score', '400');
  localStorage.setItem('english_localUpdatedAt', '2000');
  cloud[P('alice')] = { data: { english_userData: '{"name":"Noa"}', english_score: '300' }, clientUpdatedAt: 1000 };
  await startSync(alice);
  expect(localStorage.getItem('english_score')).toBe('400');
  expect(cloud[P('alice')].data.english_score).toBe('400');
});

test("another child's local progress is never uploaded to a new account", async () => {
  localStorage.setItem('english_owner', 'alice');
  localStorage.setItem('english_userData', '{"name":"Noa"}');
  localStorage.setItem('english_score', '400');
  await startSync(bob);
  expect(cloud[P('bob')]).toBeUndefined();
  expect(localStorage.getItem('english_score')).toBeNull();
  expect(localStorage.getItem('english_owner')).toBe('bob');
});

test('local changes are saved to the cloud after a short delay', async () => {
  jest.useFakeTimers();
  await startSync(alice);
  localStorage.setItem('english_userData', '{"name":"Noa"}');
  localStorage.setItem('english_score', '15');
  notifyLocalChange();
  expect(cloud[P('alice')]).toBeUndefined();
  jest.advanceTimersByTime(2000);
  jest.useRealTimers();
  await pushNow(); // מחכה לכתיבה שהתחילה
  expect(cloud[P('alice')].data.english_score).toBe('15');
});

test('nothing is sent while signed out', async () => {
  localStorage.setItem('english_score', '15');
  notifyLocalChange();
  await pushNow();
  expect(Object.keys(cloud)).toHaveLength(0);
});

test('a guest who signs up keeps everything stored on the device', async () => {
  localStorage.setItem('english_guest', '1');
  const guestData = {
    english_userData: '{"name":"Noa"}',
    english_score: '250',
    english_questionCount: '40',
    english_categoryStats: '{"isAre":{"correct":12,"total":15}}',
    english_achievements: '[{"id":"first_steps"}]',
    english_mistakes: '[{"ts":5,"category":"isAre","question":"q","given":"is","correct":"are"}]',
    english_lessonsSeen: '["isAre"]',
    english_writingDraft: 'My name is Noa.'
  };
  Object.entries(guestData).forEach(([k, v]) => localStorage.setItem(k, v));
  await startSync({ uid: 'newkid', displayName: 'noa', email: 'u6e6f61@kids.english-practice.app' });
  expect(cloud[P('newkid')].data).toEqual(expect.objectContaining(guestData));
  expect(localStorage.getItem('english_guest')).toBeNull();
  expect(localStorage.getItem('english_owner')).toBe('newkid');
  expect(cloud['english/users/newkid/profile']).toEqual(expect.objectContaining({ username: 'noa', email: '' }));
});

test('a guest who signs in to an existing account is merged, not overwritten', async () => {
  cloud[P('alice')] = {
    data: {
      english_userData: '{"name":"Alice"}',
      english_score: '100',
      english_categoryStats: '{"isAre":{"correct":5,"total":6},"canCant":{"correct":2,"total":2}}',
      english_achievements: '[{"id":"first_steps"}]'
    },
    clientUpdatedAt: 9999999999999
  };
  localStorage.setItem('english_userData', '{"name":"Guest"}');
  localStorage.setItem('english_score', '30');
  localStorage.setItem('english_categoryStats', '{"isAre":{"correct":1,"total":3}}');
  localStorage.setItem('english_achievements', '[{"id":"first_steps"},{"id":"streak_3"}]');
  await startSync(alice);
  const saved = cloud[P('alice')].data;
  expect(saved.english_score).toBe('130');
  expect(JSON.parse(saved.english_categoryStats)).toEqual({ isAre: { correct: 6, total: 9 }, canCant: { correct: 2, total: 2 } });
  expect(JSON.parse(saved.english_achievements).map(a => a.id)).toEqual(['first_steps', 'streak_3']);
  expect(JSON.parse(saved.english_userData).name).toBe('Alice');
  expect(localStorage.getItem('english_score')).toBe('130');
});

test('mergeProgress keeps the newest mistakes first and the longer writing draft', () => {
  const m = mergeProgress(
    { english_mistakes: '[{"ts":1}]', english_writingDraft: 'Hi.' },
    { english_mistakes: '[{"ts":3},{"ts":2}]', english_writingDraft: 'My name is Noa. I am ten.' }
  );
  expect(JSON.parse(m.english_mistakes).map(x => x.ts)).toEqual([3, 2, 1]);
  expect(m.english_writingDraft).toBe('My name is Noa. I am ten.');
});
