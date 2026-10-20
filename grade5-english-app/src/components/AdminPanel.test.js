import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminPanel from './AdminPanel';

jest.mock('../services/contentSync', () => ({
  addQuestion: () => Promise.resolve(),
  deleteCustomQuestion: () => Promise.resolve(),
  setBuiltinHidden: () => Promise.resolve(),
  fetchAllUsers: () => Promise.resolve({}),
  fetchVisitsSince: () => Promise.resolve({}),
  subscribePresence: () => () => {}
}));

test('the questions tab has English and Math, and math topics get their own add-question form', () => {
  render(<AdminPanel onBack={() => {}} />);
  // אנגלית כברירת מחדל
  expect(screen.getByRole('tab', { name: /אנגלית/ })).toHaveAttribute('aria-selected', 'true');
  expect(screen.queryByText(/משמעות השבר/)).toBeNull();

  fireEvent.click(screen.getByRole('tab', { name: /חשבון/ }));
  expect(screen.getByText(/משמעות השבר/)).toBeTruthy();
  expect(screen.getByText(/בנוסף לשאלות שנוצרות אוטומטית/)).toBeTruthy();
  expect(screen.getByText(/עוד לא הוספת שאלות לנושא הזה/)).toBeTruthy();

  fireEvent.click(screen.getByText(/➕ הוספת שאלה/));
  // בחירה מתוך 4: יש "3 תשובות לא נכונות", אין יחידה
  expect(screen.getByText('3 תשובות לא נכונות')).toBeTruthy();
  expect(screen.queryByText(/יחידה ליד התשובה/)).toBeNull();

  // הקלדת מספר: היחידה מופיעה, התשובות הלא נכונות נעלמות
  fireEvent.change(screen.getByDisplayValue('בחירה מתוך 4 תשובות'), { target: { value: 'input' } });
  expect(screen.getByText(/יחידה ליד התשובה/)).toBeTruthy();
  expect(screen.queryByText('3 תשובות לא נכונות')).toBeNull();

  // שמירה בלי שאלה - הודעת שגיאה ברורה
  fireEvent.click(screen.getByText(/💾 שמירה/));
  expect(screen.getByText(/צריך לכתוב את השאלה/)).toBeTruthy();
});
