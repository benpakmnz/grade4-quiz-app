import { startSession, endSession } from './sessions';
import { calls } from 'firebase/database';

jest.mock('./firebase', () => ({ db: {} }));
jest.mock('firebase/database', () => {
  let n = 0;
  const calls = [];
  return {
    calls,
    ref: (_db, path) => ({ path }),
    push: (parent) => ({ path: `${parent.path}/s${++n}` }),
    update: (r, v) => { calls.push([r, v]); return Promise.resolve(); },
    get: () => Promise.resolve({ val: () => ({}) }),
    onValue: () => () => {},
    onDisconnect: () => ({ update: () => Promise.resolve(), cancel: () => Promise.resolve() }),
    serverTimestamp: () => 'NOW'
  };
});

const MIN = 60000;
const clear = () => { calls.length = 0; };
const writes = () => calls.map(([r, v]) => [r.path.split('/').pop(), Object.keys(v).sort().join(',')]);
const touch = () => window.dispatchEvent(new Event('pointerdown'));

beforeEach(() => {
  jest.useFakeTimers();
  clear();
});
afterEach(() => {
  endSession();
  jest.useRealTimers();
});

test('activity keeps the session going; 15 idle minutes end it; the next touch opens a new one', () => {
  startSession('u1');
  const first = writes()[0][0];
  expect(writes()[0][1]).toBe('d,k,last,start');

  jest.advanceTimersByTime(5 * MIN);
  touch();
  jest.advanceTimersByTime(MIN);
  expect(writes()).toContainEqual([first, 'last']);

  clear();
  jest.advanceTimersByTime(15 * MIN);
  expect(writes()).toEqual([[first, 'end']]);

  clear();
  touch();
  const [[second, fields]] = writes();
  expect(second).not.toBe(first);
  expect(fields).toBe('d,k,last,start');
});

test('signing out closes the open session', async () => {
  startSession('u1');
  clear();
  touch();
  await endSession();
  expect(writes()).toEqual([[expect.any(String), 'end,last']]);
});
