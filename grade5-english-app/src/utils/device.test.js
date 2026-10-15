import { describeDevice } from './device';

test.each([
  ['Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1', 0, 'mobile', 'iPhone · Safari'],
  ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15', 5, 'tablet', 'iPad · Safari'],
  ['Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36', 5, 'mobile', 'Android · Chrome'],
  ['Mozilla/5.0 (Linux; Android 13; SM-X200) AppleWebKit/537.36 Chrome/120.0 Safari/537.36', 5, 'tablet', 'טאבלט Android · Chrome'],
  ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36 Edg/120.0', 0, 'desktop', 'Windows · Edge'],
  ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0 Safari/537.36', 0, 'desktop', 'Mac · Chrome'],
])('%s', (ua, touch, type, label) => {
  expect(describeDevice(ua, touch)).toEqual({ type, label });
});
