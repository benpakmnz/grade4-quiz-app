# בדיקת בעיית LocalStorage

## הבעיה
הנתונים מתאפסים כשמרפרשים את הדף, למרות שהקוד אמור לשמור ב-localStorage.

## שלבי בדיקה

### שלב 1: בדיקה בסיסית של הדפדפן

1. **פתח את כלי הבדיקה**:
   ```
   http://localhost:3000/test-localstorage.html
   ```

2. **הרץ את הבדיקות**:
   - לחץ על "בדיקת כתיבה" ✍️
   - לחץ על "בדיקת קריאה" 📖
   - לחץ על "רענן דף" 🔄
   - לחץ שוב על "בדיקת קריאה" 📖
   
3. **תוצאה צפויה**:
   - אם הנתונים נשארו אחרי רענון = הדפדפן תקין ✅
   - אם הנתונים נמחקו = יש בעיה בהגדרות הדפדפן ❌

### שלב 2: בדיקת הקונסול באפליקציה

1. **פתח את האפליקציה**:
   ```
   http://localhost:3000
   ```

2. **פתח את הקונסול** (F12 או Ctrl+Shift+I)

3. **חפש לוגים**:
   - `🔍 Loading from localStorage...` - טעינה
   - `💾 Saving score to localStorage:` - שמירה
   - `📊 Loaded values:` - ערכים שנטענו

4. **בדוק מה מוצג**:
   ```javascript
   // בקונסול, הקלד:
   console.log('All localStorage:', localStorage);
   console.log('Score:', localStorage.getItem('quiz_score'));
   console.log('UserData:', localStorage.getItem('quiz_userData'));
   ```

### שלב 3: בדיקת הגדרות הדפדפן

#### Chrome / Edge:
1. הגדרות → פרטיות ואבטחה → Cookies and site data
2. ודא ש-"Clear cookies and site data when you close all windows" **כבוי**
3. ודא ש-"Block third-party cookies" **כבוי** (או הוסף localhost לחריגים)

#### Firefox:
1. הגדרות → פרטיות ואבטחה
2. ודא שב-"History" לא מסומן "Clear history when Firefox closes"
3. ודא שב-"Cookies and Site Data" לא מסומן "Delete cookies and site data when Firefox is closed"

#### Safari:
1. העדפות → פרטיות
2. ודא ש-"Block all cookies" **כבוי**
3. ודא ש-"Prevent cross-site tracking" **כבוי** (או הוסף localhost לחריגים)

### שלב 4: בדיקת מצב גלישה פרטית

**האם אתה במצב גלישה פרטית/Incognito?**
- במצב גלישה פרטית, localStorage נמחק כשסוגרים את החלון!
- פתח את האפליקציה בחלון רגיל (לא פרטי)

### שלב 5: בדיקת הרחבות דפדפן

חלק מהרחבות דפדפן יכולות למחוק localStorage:
- Privacy Badger
- uBlock Origin (במצבים מסוימים)
- Cookie Auto-Delete
- Clear Cache

**נסה**:
1. השבת את כל ההרחבות
2. רענן את הדף
3. בדוק אם הבעיה נפתרה

### שלב 6: בדיקה ידנית בקונסול

```javascript
// 1. שמור נתונים
localStorage.setItem('test', 'hello');
console.log('Saved:', localStorage.getItem('test'));

// 2. רענן את הדף (F5)

// 3. בדוק שוב
console.log('After refresh:', localStorage.getItem('test'));

// אם זה null - יש בעיה בדפדפן!
```

## פתרונות אפשריים

### פתרון 1: שימוש ב-sessionStorage כגיבוי
אם localStorage לא עובד, נוכל להשתמש גם ב-sessionStorage (נשאר עד סגירת הטאב):

```javascript
// שמירה גם ב-sessionStorage
sessionStorage.setItem('quiz_score', score.toString());
```

### פתרון 2: שמירה בשרת
אם הבעיה נמשכת, נוכל לשמור את הנתונים בשרת (Firebase, MongoDB, וכו').

### פתרון 3: שימוש ב-IndexedDB
אלטרנטיבה חזקה יותר ל-localStorage:

```javascript
// במקום localStorage
import { openDB } from 'idb';
```

## בדיקות נוספות

### בדיקה 1: גודל הנתונים
localStorage מוגבל ל-5-10MB. בדוק:

```javascript
// בקונסול
let total = 0;
for (let key in localStorage) {
  if (localStorage.hasOwnProperty(key)) {
    total += localStorage[key].length + key.length;
  }
}
console.log('Total size:', total, 'characters');
console.log('Approximately:', (total / 1024).toFixed(2), 'KB');
```

### בדיקה 2: שגיאות JavaScript
פתח את הקונסול וחפש שגיאות אדומות. אם יש שגיאה לפני השמירה, הנתונים לא יישמרו.

### בדיקה 3: בדיקת Domain
```javascript
// בקונסול
console.log('Current domain:', window.location.hostname);
console.log('Protocol:', window.location.protocol);
```

אם זה `file://` במקום `http://localhost`, localStorage לא יעבוד!

## דיווח בעיה

אם אף אחד מהפתרונות לא עזר, אנא שלח:

1. **דפדפן וגרסה**: Chrome 120, Firefox 121, וכו'
2. **מערכת הפעלה**: Windows 11, macOS, וכו'
3. **לוגים מהקונסול**: העתק את כל הלוגים
4. **תוצאות מ-test-localstorage.html**
5. **צילום מסך של הקונסול**

## טיפים נוספים

### ניקוי Cache
לפעמים Cache ישן יכול לגרום לבעיות:
1. Ctrl+Shift+Delete (Chrome/Edge)
2. בחר "Cached images and files"
3. לחץ "Clear data"
4. רענן את הדף

### בדיקת Quota
```javascript
// בדוק כמה מקום יש
if (navigator.storage && navigator.storage.estimate) {
  navigator.storage.estimate().then(estimate => {
    console.log('Usage:', estimate.usage);
    console.log('Quota:', estimate.quota);
    console.log('Percentage:', (estimate.usage / estimate.quota * 100).toFixed(2) + '%');
  });
}
```
