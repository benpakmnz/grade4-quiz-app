import {
  validateUsername, validatePassword, usernameToEmail, emailToUsername, accountLabel, USERNAME_DOMAIN
} from './username';

test('valid and invalid usernames', () => {
  expect(validateUsername('noa_10')).toBeNull();
  expect(validateUsername('נועה')).toBeNull();
  expect(validateUsername('Dana-K')).toBeNull();
  expect(validateUsername('ab')).toMatch(/לפחות/);
  expect(validateUsername('a'.repeat(16))).toMatch(/עד/);
  expect(validateUsername('noa cohen')).toMatch(/בלי רווחים/);
  expect(validateUsername('noa@x')).toMatch(/רק אותיות/);
});

test('password needs at least 6 characters', () => {
  expect(validatePassword('12345')).toMatch(/6/);
  expect(validatePassword('123456')).toBeNull();
});

test('username <-> internal email round trip, case-insensitive', () => {
  ['noa', 'נועה', 'dana_k-10', 'אבגדהוזחטיכלמנס'.slice(0, 15)].forEach(name => {
    const email = usernameToEmail(name);
    expect(email.endsWith(`@${USERNAME_DOMAIN}`)).toBe(true);
    expect(email.split('@')[0].length).toBeLessThanOrEqual(64); // מגבלת אימייל
    expect(emailToUsername(email)).toBe(name.toLowerCase());
  });
  expect(usernameToEmail('Noa')).toBe(usernameToEmail('noa'));
  expect(usernameToEmail(' noa ')).toBe(usernameToEmail('noa'));
});

test('Google emails are not usernames', () => {
  expect(emailToUsername('someone@gmail.com')).toBeNull();
  expect(emailToUsername('u6e6f61@other.com')).toBeNull();
  expect(accountLabel({ email: 'someone@gmail.com' })).toBe('someone@gmail.com');
  expect(accountLabel({ email: usernameToEmail('noa') })).toBe('👤 noa');
});
