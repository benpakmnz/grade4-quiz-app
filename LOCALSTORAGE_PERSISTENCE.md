# LocalStorage Persistence - שמירת התקדמות

## בעיה שנפתרה
כשמרפרשים את הדף, התוצאות וההתקדמות היו נשמרות ב-localStorage אבל המשתמש לא ראה אותן בצורה ברורה.

## פתרון

### 1. שמירה אוטומטית ב-localStorage
הנתונים הבאים נשמרים אוטומטית ב-localStorage:
- ✅ **ניקוד (score)** - `quiz_score`
- ✅ **רצף (streak)** - `quiz_streak`
- ✅ **מספר שאלות (questionCount)** - `quiz_questionCount`
- ✅ **נתוני משתמש (userData)** - `quiz_userData`
- ✅ **היסטוריית משחקים (gameHistory)** - `quiz_history`
- ✅ **סטטיסטיקות לפי קטגוריה (categoryStats)** - `quiz_categoryStats`

### 2. טעינה אוטומטית בעת רענון
כשמרפרשים את הדף:
1. כל הנתונים נטענים מ-localStorage
2. המשתמש חוזר ישירות למסך הבית (לא למסך הפתיחה)
3. מוצג StatusDialog שמראה את ההתקדמות המלאה

### 3. שיפורים בממשק

#### A. הדר עליון - תצוגת נתונים
- **תג הניקוד** - כעת ניתן ללחוץ עליו כדי לראות התקדמות מלאה
- **תג מספר שאלות** - חדש! מציג כמה שאלות נענו, ניתן ללחוץ לפרטים
- שני התגים מוסיפים tooltip: "לחץ לצפייה בהתקדמות מלאה"

```javascript
<Badge
  cursor="pointer"
  onClick={() => setShowStatusDialog(true)}
  title="לחץ לצפייה בהתקדמות מלאה"
>
  <Text>נקודות: {score} ⭐</Text>
</Badge>

<Badge
  cursor="pointer"
  onClick={() => setShowStatusDialog(true)}
  title="לחץ לצפייה בהתקדמות מלאה"
>
  <Text>שאלות: {questionCount} 📝</Text>
</Badge>
```

#### B. StatusDialog - דיאלוג ההתקדמות
הוספנו כותרת משנה שמבהירה שהנתונים נשמרו:
```javascript
<h2>👋 שלום שוב {userData?.name}!</h2>
<p className="status-subtitle">כל ההתקדמות שלך נשמרה ✅</p>
```

הדיאלוג מציג:
- **התקדמות כללית** - תרגילים נכונים, אחוז התקדמות, אחוז הצלחה
- **זמן עד המבחן** - כמה ימים נשארו
- **המלצה יומית** - כמה תרגילים מומלץ לעשות ביום
- **נושאים שטרם התחילו** - אזהרה על קטגוריות שלא נגעו בהן
- **נושאים לחיזוק** - 3 הקטגוריות החלשות ביותר
- **נושאים חזקים** - 2 הקטגוריות החזקות ביותר

### 4. זרימת עבודה

#### ביקור ראשון:
1. מסך פתיחה (WelcomeScreen)
2. בחירת שם, דמות, צבע, מגדר
3. מעבר למסך הבית
4. WelcomeDialog מוצג (פעם אחת בלבד)
5. `quiz_hasSeenWelcome` נשמר ב-localStorage

#### רענון דף / ביקור חוזר:
1. טעינת נתונים מ-localStorage
2. מעבר ישיר למסך הבית
3. StatusDialog מוצג אוטומטית (אחרי 500ms)
4. המשתמש רואה את כל ההתקדמות שלו

#### לחיצה על תגי הניקוד/שאלות:
1. StatusDialog נפתח
2. המשתמש רואה התקדמות מפורטת
3. יכול לסגור ולהמשיך

### 5. קוד טכני

#### שמירה ב-localStorage:
```javascript
useEffect(() => {
  localStorage.setItem('quiz_score', score.toString());
}, [score]);

useEffect(() => {
  localStorage.setItem('quiz_questionCount', questionCount.toString());
}, [questionCount]);

// וכן הלאה לכל שדה...
```

#### טעינה מ-localStorage:
```javascript
useEffect(() => {
  const savedScore = localStorage.getItem('quiz_score');
  const savedQuestionCount = localStorage.getItem('quiz_questionCount');
  const savedUserData = localStorage.getItem('quiz_userData');
  
  if (savedScore) setScore(parseInt(savedScore));
  if (savedQuestionCount) setQuestionCount(parseInt(savedQuestionCount));
  if (savedUserData) {
    setUserData(JSON.parse(savedUserData));
    setCurrentGame('home');
    
    // הצג StatusDialog אם זה לא ביקור ראשון
    if (localStorage.getItem('quiz_hasSeenWelcome')) {
      setTimeout(() => setShowStatusDialog(true), 500);
    }
  }
}, []);
```

## יתרונות

1. ✅ **אין אובדן נתונים** - כל ההתקדמות נשמרת גם אחרי רענון/סגירת דפדפן
2. ✅ **משוב ויזואלי ברור** - המשתמש רואה מיד שהנתונים נשמרו
3. ✅ **גישה קלה למידע** - לחיצה על תגי הניקוד/שאלות מציגה פרטים
4. ✅ **חוויית משתמש רציפה** - חזרה ישירה למסך הבית, לא צריך להתחיל מחדש
5. ✅ **מוטיבציה** - רואים את ההתקדמות ומקבלים המלצות מותאמות אישית

## בדיקות שכדאי לעשות

1. ✅ ענה על כמה שאלות
2. ✅ רענן את הדף (F5)
3. ✅ בדוק שהניקוד ומספר השאלות נשארו
4. ✅ לחץ על תג הניקוד - בדוק שנפתח StatusDialog
5. ✅ סגור את הדפדפן לגמרי
6. ✅ פתח שוב - בדוק שהכל נשמר

## ניקוי נתונים (למפתחים)

אם רוצים לאפס הכל ולהתחיל מחדש:
```javascript
// בקונסול של הדפדפן:
localStorage.clear();
location.reload();
```

או באופן סלקטיבי:
```javascript
localStorage.removeItem('quiz_score');
localStorage.removeItem('quiz_questionCount');
localStorage.removeItem('quiz_userData');
// וכו'...
```
