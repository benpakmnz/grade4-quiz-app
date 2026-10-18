import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ProgressReport, { PARENT_TIPS } from './ProgressReport';
import { allCategories as categories } from '../data/subjects';
import { parseUser } from '../data/userStats';

const user = parseUser('u1', {
  profile: { name: 'Noa', email: 'noa@x.com' },
  progress: { data: {}, updatedAt: 1 },
  sessions: { a: { start: Date.UTC(2026, 9, 14, 15, 0), last: Date.UTC(2026, 9, 14, 15, 25), end: Date.UTC(2026, 9, 14, 15, 26), d: 'iPhone · Safari', k: 'mobile' } }
});

test('admins see the activity times with the device', () => {
  const html = renderToStaticMarkup(<ProgressReport user={user} mode="admin" />);
  expect(html).toContain('זמני פעילות');
  expect(html).toContain('iPhone · Safari');
  expect(html).toContain('26 דק&#x27;');
});

test('kids and parents do not see the activity log', () => {
  const html = renderToStaticMarkup(<ProgressReport user={user} mode="self" />);
  expect(html).not.toContain('זמני פעילות');
});

test('every topic has a parent tip', () => {
  categories.forEach(c => expect([c.id, Boolean(PARENT_TIPS[c.id])]).toEqual([c.id, true]));
});
