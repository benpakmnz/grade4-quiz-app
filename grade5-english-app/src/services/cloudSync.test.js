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

const { startSync, stopSync, notifyLocalChange, pushNow } = require('./cloudSync');

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
