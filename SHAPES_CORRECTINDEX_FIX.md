# תיקון בעיית correctIndex בשאלות צורות

## הבעיה 🐛

משתמש סימן תשובה נכונה (42 ס"מ) אבל המערכת אמרה שזה לא נכון.

### השאלה:
```javascript
{
  question: 'מלבן שאורכו 16 ס"מ ורוחבו 5 ס"מ. מהו היקפו?',
  options: ['21 ס"מ', '32 ס"מ', '42 ס"מ', '80 ס"מ'],
  correctIndex: 2,  // ← האינדקס של '42 ס"מ'
  explanation: 'היקף = 2 × (16 + 5) = 2 × 21 = 42 ס"מ'
}
```

### הקוד הישן:
```javascript
const isCorrect = selectedAnswer === question.correctAnswer;
```

הקוד חיפש `question.correctAnswer` (מחרוזת), אבל השאלה השתמשה ב-`correctIndex` (מספר)!

## הפתרון ✅

עדכנתי את `ShapesGame.js` לתמוך בשני הפורמטים:

```javascript
const checkAnswer = (selectedAnswer) => {
  // Support both correctAnswer (string) and correctIndex (number)
  let isCorrect;
  if (question.correctIndex !== undefined) {
    // If correctIndex is provided, compare by index
    const selectedIndex = question.options.indexOf(selectedAnswer);
    isCorrect = selectedIndex === question.correctIndex;
  } else {
    // Otherwise, compare by value
    isCorrect = selectedAnswer === question.correctAnswer;
  }
  
  const newAttempts = attempts + 1;
  // ... rest of code
};
```

### איך זה עובד:

1. **אם יש `correctIndex`**:
   - מוצא את האינדקס של התשובה שנבחרה
   - משווה אותו ל-`correctIndex`
   - דוגמה: '42 ס"מ' → אינדקס 2 → 2 === 2 ✅

2. **אם יש `correctAnswer`**:
   - משווה ישירות את המחרוזות
   - דוגמה: '42 ס"מ' === '42 ס"מ' ✅

## תיקון נוסף: תצוגת התשובה הנכונה

גם עדכנתי את התצוגה כשנכשלים:

```javascript
{!feedback.correct && (question.correctAnswer || question.correctIndex !== undefined) && (
  <p className="correct-answer">
    התשובה הנכונה: {question.correctAnswer || question.options[question.correctIndex]}
  </p>
)}
```

עכשיו אם יש `correctIndex`, זה מציג את `question.options[correctIndex]`.

## סטטיסטיקה 📊

- **98 שאלות** משתמשות ב-`correctIndex`
- כל השאלות האלה עכשיו יעבדו נכון!

## בדיקה 🧪

1. ✅ שאלה עם `correctIndex` - עובד
2. ✅ שאלה עם `correctAnswer` - עובד
3. ✅ תצוגת תשובה נכונה - עובד

## למה היו שני פורמטים?

כנראה שבזמן הפיתוח השתמשנו בשני סגנונות שונים:
- **correctIndex**: יותר יעיל (מספר במקום מחרוזת)
- **correctAnswer**: יותר קריא (רואים את התשובה ישירות)

עכשיו הקוד תומך בשניהם! 🎉
