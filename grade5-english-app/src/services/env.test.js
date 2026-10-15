const load = (vars) => {
  jest.resetModules();
  const saved = { ...process.env };
  Object.assign(process.env, { REACT_APP_VERCEL_ENV: '', REACT_APP_DB_ROOT: '' }, vars);
  const mod = require('./env');
  process.env = saved;
  return mod;
};

test('production and local builds use the real data', () => {
  expect(load({ REACT_APP_VERCEL_ENV: 'production' })).toMatchObject({ DB_ROOT: 'english', IS_TEST_ENV: false });
  expect(load({})).toMatchObject({ DB_ROOT: 'english', IS_TEST_ENV: false });
});

test('Vercel previews (staging and pull requests) use the test data', () => {
  expect(load({ REACT_APP_VERCEL_ENV: 'preview' })).toMatchObject({ DB_ROOT: 'english-test', IS_TEST_ENV: true });
});

test('an explicit root wins, and junk is ignored', () => {
  expect(load({ REACT_APP_DB_ROOT: 'english-test', REACT_APP_VERCEL_ENV: 'production' }).DB_ROOT).toBe('english-test');
  expect(load({ REACT_APP_DB_ROOT: '../hack', REACT_APP_VERCEL_ENV: 'production' }).DB_ROOT).toBe('english');
});
