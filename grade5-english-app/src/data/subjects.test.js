import { availableSubjects, readSubject, saveSubject } from './subjects';

afterEach(() => localStorage.clear());

test('math is only for admins (for now)', () => {
  expect(availableSubjects(false)).toEqual(['english']);
  expect(availableSubjects(true)).toEqual(['english', 'math']);
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
