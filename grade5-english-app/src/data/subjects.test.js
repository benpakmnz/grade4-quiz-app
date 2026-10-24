import { availableSubjects, readSubject, saveSubject } from './subjects';

afterEach(() => localStorage.clear());

test('math and hebrew are only for admins (for now)', () => {
  expect(availableSubjects(false)).toEqual(['english']);
  expect(availableSubjects(true)).toEqual(['english', 'math', 'hebrew']);
});

test('with no saved choice and hebrew open - hebrew exam (1.11) comes before math (8.11)', () => {
  expect(readSubject(new Date('2026-10-25'), ['english', 'math', 'hebrew'])).toBe('hebrew');
  expect(readSubject(new Date('2026-11-03'), ['english', 'math', 'hebrew'])).toBe('math');
});

test('a saved "math" choice is ignored for someone who cannot see math', () => {
  saveSubject('math');
  expect(readSubject(new Date('2026-10-18'), ['english'])).toBe('english');
  expect(readSubject(new Date('2026-10-18'), ['english', 'math'])).toBe('math');
});

test('with no saved choice - the subject whose exam is closest', () => {
  expect(readSubject(new Date('2026-10-18'), ['english', 'math'])).toBe('english');
  expect(readSubject(new Date('2026-10-25'), ['english', 'math'])).toBe('math');
});

test('on the test site (Vercel preview) everyone sees math; on the real site only admins', () => {
  const load = (vercelEnv) => {
    let mod;
    const saved = process.env.REACT_APP_VERCEL_ENV;
    process.env.REACT_APP_VERCEL_ENV = vercelEnv;
    jest.isolateModules(() => { mod = require('./subjects'); });
    process.env.REACT_APP_VERCEL_ENV = saved;
    return mod;
  };
  expect(load('preview').availableSubjects(false)).toEqual(['english', 'math', 'hebrew']);
  expect(load('production').availableSubjects(false)).toEqual(['english']);
  expect(load('production').availableSubjects(true)).toEqual(['english', 'math', 'hebrew']);
});
