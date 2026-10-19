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

test('with two subjects the report shows one subject at a time (no "all"), starting with the current one', () => {
  const both = parseUser('u2', {
    profile: { name: 'Noa' },
    progress: {
      data: {
        english_categoryStats: JSON.stringify({ isAre: { correct: 3, total: 4 }, mFractionAdd: { correct: 1, total: 4 } }),
        english_mistakes: JSON.stringify([
          { ts: 1, category: 'mFractionAdd', question: '2 3/5 + 1 4/5 = ?', given: '3 7/5', correct: '4 2/5' },
          { ts: 2, category: 'isAre', question: 'The cats ____ hungry.', given: 'is', correct: 'are' }
        ])
      },
      updatedAt: 1
    }
  });
  const math = renderToStaticMarkup(<ProgressReport user={both} mode="self" subjects={['english', 'math']} defaultSubject="math" />);
  expect(math).toContain('חיבור וחיסור שברים');
  expect(math).not.toContain('The cats');
  expect(math).not.toContain('am / is / are');
  const english = renderToStaticMarkup(<ProgressReport user={both} mode="self" subjects={['english', 'math']} defaultSubject="english" />);
  expect(english).toContain('The cats');
  expect(english).not.toContain('חיבור וחיסור שברים');
  expect(math).not.toContain('הכל');
  // בממשק הניהול - נפתח על המקצוע שתורגל הכי הרבה (כאן שניהם 4 תשובות - הראשון)
  const admin = renderToStaticMarkup(<ProgressReport user={both} mode="admin" subjects={['english', 'math']} />);
  expect(admin).toContain('report-subjects');
  // משתמש/ת בלי חשבון - אין סינון ואין זכר לחשבון
  const englishOnly = renderToStaticMarkup(<ProgressReport user={both} mode="self" subjects={['english']} />);
  expect(englishOnly).not.toContain('report-subjects');
  expect(englishOnly).not.toContain('חיבור וחיסור שברים');
});
