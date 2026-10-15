import { PARENT_TIPS } from './ProgressReport';
import { categories } from '../data/categories';

test('every topic has a parent tip', () => {
  categories.forEach(c => expect([c.id, Boolean(PARENT_TIPS[c.id])]).toEqual([c.id, true]));
});
