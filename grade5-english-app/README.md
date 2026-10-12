# 🇬🇧 תרגול למבחן מיפוי באנגלית - כיתה ה'

אפליקציה לתרגול לקראת מבחן המיפוי באנגלית (21.10.26), לפי החומר שפורסם על ידי המורה.
בנויה באותו סגנון כמו אפליקציית התרגול של כיתה ד' (`../`): מסך פתיחה עם דמות וצבע, אריחי נושאים, נקודות, רצפים, הישגים וספירה לאחור למבחן.

## ✨ הנושאים (לפי החומר למבחן)

| נושא | מה מתרגלים |
|------|------------|
| 📚 אוצר מילים | משמעות מילים (אנגלית↔עברית), התאמת מילה לתמונה, התאמת מילה להגדרה, השלמת משפט ממחסן מילים |
| 🟰 is / are | יחיד ורבים, There is / There are, שאלות |
| 🎒 has / have | he/she/it ← has, I/you/we/they ← have |
| 💪 can / can't | לפי ההיגיון של המשפט |
| ❓ because / why | Why שואל, because עונה + התאמת שאלה לתשובה |
| 🧩 סידור משפטים | בניית משפט תקין ממילים מעורבבות (עם רמז בעברית) |
| 📖 הבנת הנקרא | 8 קטעים: שאלות אמריקאיות, Yes/No, סידור אירועים לפי סדר |
| 🎧 הבנת הנשמע | 6 קטעים שהדפדפן מקריא בקול (אפשר גם לאט) + שאלות |
| ✍️ כתיבה | "איזה משפט כתוב נכון?" + כתיבת קטע על עצמי עם פתיחי משפטים, רשימת בדיקה אוטומטית וקטע לדוגמה |

🔊 בכל מקום שיש כפתור רמקול אפשר לשמוע את המילה / המשפט באנגלית (Web Speech API - בלי שרת ובלי מפתח API).

## ☁️ התחברות עם Google ושמירה בענן (Firebase)

לאפליקציה יש פרויקט Firebase משלה (נפרד מכל פרויקט אחר).
כל ילד/ה מתחבר/ת עם Google, וההתקדמות (פרופיל, נקודות, הישגים, סטטיסטיקה וטיוטת הכתיבה) נשמרת תחת
`english/users/<uid>` ב-Realtime Database ועוברת בין מכשירים. בלי אינטרנט האפליקציה ממשיכה לעבוד ומסתנכרנת כשהחיבור חוזר.
אפשר גם "להמשיך בלי התחברות" - אז הכול נשמר רק בדפדפן, ואפשר להתחבר מאוחר יותר מחלון עריכת הפרופיל (לחיצה על השם) וההתקדמות תעלה לענן.

**הגדרה חד-פעמית ב-[Firebase Console](https://console.firebase.google.com):**
1. **Add project** - שם לבחירה (למשל `english-practice`). Google Analytics לא נחוץ.
2. **Build ← Realtime Database ← Create Database** - מיקום **europe-west1 (Belgium)**, מצב **Start in locked mode**.
3. **Realtime Database ← Rules** - למחוק הכול, להדביק את התוכן של [`database.rules.json`](database.rules.json) ו-**Publish**.
   כל ילד/ה יכול/ה לקרוא ולכתוב רק את הנתונים של עצמו/ה.
4. **Build ← Authentication ← Get started ← Sign-in method ← Google ← Enable** (לבחור אימייל תמיכה ← Save).
5. **Authentication ← Settings ← Authorized domains ← Add domain** - להוסיף את כתובת האתר ב-Vercel (למשל `grade5-english-app.vercel.app`). `localhost` כבר מאושר.
6. **Project settings ⚙️ ← Your apps ← `</>`** - לרשום אפליקציית Web (בלי Firebase Hosting) ולהעתיק את ה-`firebaseConfig`.
7. ב-Vercel: **Settings ← Environment Variables** - להוסיף את המשתנים מ-[`.env.example`](.env.example) עם הערכים
   (`databaseURL` נמצא ב-`firebaseConfig` או בראש הלשונית Realtime Database ← Data), ואז **Redeploy** -
   הערכים נכנסים לקוד בזמן הבנייה. להרצה מקומית - קובץ `.env.local` עם אותם משתנים.

בלי המשתנים האלה האפליקציה עובדת כמו קודם, בלי מסך התחברות.

## 🚀 הרצה

```bash
cd grade5-english-app
npm install
npm start
```

## 🧪 בדיקות

```bash
npm test
```

## ☁️ פריסה ב-Vercel

ליצור פרויקט חדש ב-Vercel מאותו ריפו, ולהגדיר **Root Directory = `grade5-english-app`**.
(קובץ `vercel.json` כבר נמצא בתיקייה.)

## ✏️ הוספת תוכן

כל השאלות נמצאות ב-`src/data/`:
- `vocabulary.js` - מילים ומשפטים להשלמה
- `grammar.js` - is/are, has/have, can/can't, because/why
- `sentences.js` - משפטים לסידור
- `reading.js` - קטעי קריאה והאזנה
- `writing.js` - תרגול כתיבה ובדיקות הקטע
- `categories.js` - תאריך המבחן והנושאים

**בהצלחה במבחן! 💪📚**
