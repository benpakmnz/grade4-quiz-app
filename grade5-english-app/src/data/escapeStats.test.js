import { computeEscapeStats, formatSeconds } from './escapeStats';

const user = (name, history) => ({
  profile: { name },
  progress: { data: {
    english_userData: JSON.stringify({ name, character: { emoji: '🦊' } }),
    english_escapeRooms: JSON.stringify({ played: history.length, history })
  } }
});

const room = (id, extra) => ({ id, at: 1000, subject: 'math', tasks: 5, minutes: 10, opened: true, seconds: 300, filled: 5, total: 5, emojis: ['🦊', '🐼'], ...extra });

test('a room played by the whole team is counted once', () => {
  const s = computeEscapeStats({
    a: user('נועה', [room('X-1', { seconds: 310 }), room('Y-2', { subject: 'hebrew', opened: false, seconds: null, emojis: ['🦊'], filled: 2 })]),
    b: user('דן', [room('X-1', { seconds: 300 })]),
    c: { progress: { data: { english_escapeRooms: 'not json' } } }
  });
  expect(s.total.played).toBe(2);
  expect(s.total.opened).toBe(1);
  expect(s.playersCount).toBe(2);
  const math = s.bySubject.find(r => r.id === 'math');
  expect(math).toMatchObject({ played: 1, opened: 1, rate: 100, medianSeconds: 300, fastestSeconds: 300 });
  expect(s.bySubject.find(r => r.id === 'hebrew')).toMatchObject({ played: 1, opened: 0, rate: 0, medianSeconds: null });
  expect(s.bySubject.find(r => r.id === 'english').played).toBe(0);
  expect(s.byTeam.find(r => r.id === 'pair').played).toBe(1);
  expect(s.byTeam.find(r => r.id === 'solo').played).toBe(1);
  expect(s.bySize.find(r => r.tasks === 5).played).toBe(2);
  expect(s.recent.find(r => r.id === 'X-1').players.map(p => p.name).sort()).toEqual(['דן', 'נועה']);
  expect(s.topPlayers[0].name).toBe('נועה');
});

test('empty data', () => {
  expect(computeEscapeStats(null).total.played).toBe(0);
  expect(formatSeconds(125)).toBe('2:05');
  expect(formatSeconds(null)).toBe('—');
});
