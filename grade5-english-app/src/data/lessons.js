// שיעורים אינטראקטיביים לכל נושא ("איך פותרים?")
// סוגי שלבים:
//   rules - כרטיסי כללים עם דוגמאות (**מילה** = מודגשת)
//   howto - פתרון דוגמה צעד אחרי צעד
//   sort  - משחק מיון: לאן שייכת כל מילה / משפט
//   check - בדיקה קצרה עם הסבר מיד אחרי כל תשובה
//   tips  - טיפים

import { mathLessons } from './mathLessons';
import { hebrewLessons } from './hebrewLessons';

const englishLessons = {
  isAre: {
    title: 'AM / IS / ARE',
    steps: [
      {
        type: 'rules',
        title: 'מתי AM, מתי IS ומתי ARE?',
        intro: 'משתמשים ב-AM / IS / ARE כדי לספר מי מישהו או איך משהו.',
        introEn: 'We use AM / IS / ARE to talk about who someone is or how something is.',
        cards: [
          { word: 'AM', color: '#fce7f3', ink: '#be185d', emoji: '🧒', who: ['I'], examples: ['I **am** a student.', 'I **am** happy.'] },
          { word: 'IS', color: '#dcfce7', ink: '#15803d', emoji: '👧🐱', who: ['He', 'She', 'It'], examples: ['She **is** my sister.', 'He **is** tall.', 'It **is** a cat.'] },
          { word: 'ARE', color: '#fef3c7', ink: '#b45309', emoji: '👫', who: ['We', 'You', 'They'], examples: ['We **are** friends.', 'You **are** at school.', 'They **are** happy.'] }
        ]
      },
      {
        type: 'howto',
        title: 'איך פותרים? 3 צעדים',
        sentence: 'My sister ____ tall.',
        steps: [
          { he: 'מוצאים על מי מדברים במשפט', show: '**My sister** ____ tall.' },
          { he: 'מחליפים במילה קטנה: I / he / she / it / we / you / they', show: 'My sister = **she**' },
          { he: 'בודקים בכלל: עם she משתמשים ב-is', show: 'My sister **is** tall. ✅' }
        ],
        extra: [
          'שני אנשים או יותר - כמו Dan and Tom או My mom and I - הם they / we, ולכן **are**',
          'מילה עם s בסוף - כמו cats או books - היא בדרך כלל רבים, ולכן **are**',
          'גם children ו-people הם רבים (בלי s!), ולכן **are**'
        ]
      },
      {
        type: 'sort',
        title: 'משחק: לאיזו קופסה?',
        instruction: 'לחצי על הקופסה הנכונה לכל מילה',
        buckets: ['am', 'is', 'are'],
        items: [
          { text: 'I', answer: 'am' }, { text: 'She', answer: 'is' }, { text: 'They', answer: 'are' },
          { text: 'It', answer: 'is' }, { text: 'We', answer: 'are' }, { text: 'He', answer: 'is' },
          { text: 'You', answer: 'are' }, { text: 'My dad', answer: 'is' }, { text: 'The cats', answer: 'are' },
          { text: 'Dana and I', answer: 'are' }, { text: 'The dog', answer: 'is' }, { text: 'My friends', answer: 'are' }
        ]
      },
      {
        type: 'check',
        title: 'בדיקה קצרה',
        questions: [
          { sentence: 'They ____ happy.', options: ['am', 'is', 'are'], answer: 'are', tip: 'They → are' },
          { sentence: 'I ____ ten years old.', options: ['am', 'is', 'are'], answer: 'am', tip: 'עם I תמיד am' },
          { sentence: 'The cat ____ black.', options: ['am', 'is', 'are'], answer: 'is', tip: 'The cat = it → is' },
          { sentence: 'Tom and I ____ friends.', options: ['am', 'is', 'are'], answer: 'are', tip: 'Tom and I = we → are' }
        ]
      }
    ]
  },

  hasHave: {
    title: 'HAVE / HAS',
    steps: [
      {
        type: 'rules',
        title: 'מתי HAVE ומתי HAS?',
        intro: 'משתמשים ב-HAVE / HAS כדי לספר על משהו שיש לנו.',
        introEn: 'We use HAVE / HAS to talk about something we own, have or do.',
        cards: [
          { word: 'HAVE', color: '#dbeafe', ink: '#1d4ed8', emoji: '🚲', who: ['I', 'You', 'We', 'They'], examples: ['I **have** a bike.', 'You **have** a pencil.', 'We **have** a dog.', 'They **have** a big house.'] },
          { word: 'HAS', color: '#fce7f3', ink: '#be185d', emoji: '🐱', who: ['He', 'She', 'It'], examples: ['He **has** a book.', 'She **has** a cat.', 'It **has** a long tail.'] }
        ],
        remember: 'HAVE עם I / you / we / they · HAS עם he / she / it'
      },
      {
        type: 'howto',
        title: 'איך פותרים? 3 צעדים',
        sentence: 'The dog ____ a long tail.',
        steps: [
          { he: 'מוצאים למי יש', show: '**The dog** ____ a long tail.' },
          { he: 'מחליפים במילה קטנה', show: 'The dog = **it**' },
          { he: 'בודקים בכלל: עם it משתמשים ב-has', show: 'The dog **has** a long tail. ✅' }
        ],
        extra: [
          'אחרי Do / Does תמיד **have**: Do you have...? Does she have...?',
          'שם של אדם אחד - כמו Noa או Danny - הוא he / she, ולכן **has**'
        ]
      },
      {
        type: 'sort',
        title: 'משחק: HAVE או HAS?',
        instruction: 'לחצי על הקופסה הנכונה לכל מילה',
        buckets: ['have', 'has'],
        items: [
          { text: 'I', answer: 'have' }, { text: 'She', answer: 'has' }, { text: 'We', answer: 'have' },
          { text: 'It', answer: 'has' }, { text: 'They', answer: 'have' }, { text: 'He', answer: 'has' },
          { text: 'You', answer: 'have' }, { text: 'My mom', answer: 'has' }, { text: 'Birds', answer: 'have' },
          { text: 'Danny', answer: 'has' }
        ]
      },
      {
        type: 'check',
        title: 'בדיקה קצרה',
        questions: [
          { sentence: 'She ____ a cat.', options: ['have', 'has'], answer: 'has', tip: 'She → has' },
          { sentence: 'We ____ a dog.', options: ['have', 'has'], answer: 'have', tip: 'We → have' },
          { sentence: 'My brother ____ a red bike.', options: ['have', 'has'], answer: 'has', tip: 'My brother = he → has' },
          { sentence: 'Do you ____ a pencil?', options: ['have', 'has'], answer: 'have', tip: 'אחרי Do תמיד have' }
        ]
      }
    ]
  },

  canCant: {
    title: 'CAN / CAN\'T',
    steps: [
      {
        type: 'rules',
        title: 'CAN ו-CAN\'T',
        intro: 'משתמשים ב-CAN / CAN\'T כדי לדבר על מה שמישהו יכול או לא יכול לעשות.',
        introEn: 'We use CAN / CAN\'T to talk about what someone is able to do.',
        cards: [
          { word: 'CAN', color: '#dcfce7', ink: '#15803d', emoji: '🏊', who: ['I', 'You', 'He', 'She', 'We', 'They'], examples: ['I **can** swim.', 'She **can** play the guitar.', 'We **can** speak English.', 'They **can** run fast.'] },
          { word: 'CAN\'T', color: '#fee2e2', ink: '#b91c1c', emoji: '🚫', who: ['I', 'You', 'He', 'She', 'We', 'They'], examples: ['I **can\'t** fly.', 'He **can\'t** play the piano.', 'We **can\'t** go now.', 'They **can\'t** eat ice cream.'] }
        ],
        remember: 'CAN = יכול/ה · CAN\'T = לא יכול/ה · אותה מילה לכולם!'
      },
      {
        type: 'howto',
        title: 'איך פותרים? חושבים מה הגיוני',
        sentence: 'A fish ____ walk.',
        steps: [
          { he: 'מבינים את המשפט: דג... ללכת?', show: 'A **fish** ____ **walk**.' },
          { he: 'שואלים: זה אפשרי? לדג אין רגליים - לא!', show: '🐟 + 🚶 = ❌' },
          { he: 'לא אפשרי - ולכן can\'t', show: 'A fish **can\'t** walk. ✅' }
        ],
        extra: [
          'רמזים במשפט: so (לכן), but (אבל), because (כי) - עוזרים להבין מה הגיוני',
          'אחרי can בא פועל רגיל, בלי s: He can **swim** (לא swims)'
        ]
      },
      {
        type: 'sort',
        title: 'משחק: אפשרי או לא?',
        instruction: 'CAN אם זה אפשרי, CAN\'T אם לא',
        buckets: ['can', 'can\'t'],
        items: [
          { text: 'Birds ___ fly.', answer: 'can' }, { text: 'A cat ___ read.', answer: 'can\'t' },
          { text: 'Fish ___ swim.', answer: 'can' }, { text: 'A baby ___ drive.', answer: 'can\'t' },
          { text: 'Monkeys ___ climb trees.', answer: 'can' }, { text: 'A car ___ fly.', answer: 'can\'t' },
          { text: 'A turtle ___ run fast.', answer: 'can\'t' }, { text: 'Frogs ___ jump.', answer: 'can' }
        ]
      },
      {
        type: 'check',
        title: 'בדיקה קצרה',
        questions: [
          { sentence: 'Elephants ____ fly.', options: ['can', 'can\'t'], answer: 'can\'t', tip: 'לפילים אין כנפיים' },
          { sentence: 'It is dark. I ____ see.', options: ['can', 'can\'t'], answer: 'can\'t', tip: 'בחושך אי אפשר לראות' },
          { sentence: 'He ____ swim very well.', options: ['can', 'cans'], answer: 'can', tip: 'can - אותה מילה לכולם, בלי s' },
          { sentence: 'She can ____ the piano.', options: ['play', 'plays'], answer: 'play', tip: 'אחרי can - פועל בלי s' }
        ]
      }
    ]
  },

  becauseWhy: {
    title: 'WHY / BECAUSE',
    steps: [
      {
        type: 'rules',
        title: 'WHY שואל, BECAUSE עונה',
        intro: 'משתמשים ב-WHY כדי לשאול סיבה, וב-BECAUSE כדי לתת סיבה.',
        introEn: 'We use WHY to ask for a reason. We use BECAUSE to give a reason.',
        cards: [
          { word: 'WHY...?', color: '#dbeafe', ink: '#1d4ed8', emoji: '🤔', who: ['למה?', 'בהתחלה', 'עם ?'], examples: ['**Why** are you sad?', '**Why** can\'t he come?', '**Why** do you like English?'] },
          { word: 'BECAUSE...', color: '#fce7f3', ink: '#be185d', emoji: '💡', who: ['כי...', 'באמצע', 'בלי ?'], examples: ['I am sad **because** I\'m tired.', 'He can\'t come **because** he is sick.', 'I like English **because** it is fun.'] }
        ],
        remember: 'שואלים עם WHY · עונים עם BECAUSE · הסיבה באה אחרי BECAUSE'
      },
      {
        type: 'howto',
        title: 'איך פותרים? מחפשים 2 סימנים',
        sentence: 'I wear a coat ____ it is cold.',
        steps: [
          { he: 'יש סימן שאלה בסוף? כאן - אין', show: 'I wear a coat ____ it is cold**.**' },
          { he: 'החסר באמצע, ואחריו הסיבה (it is cold)', show: 'I wear a coat ____ **it is cold**.' },
          { he: 'נותנים סיבה - ולכן because', show: 'I wear a coat **because** it is cold. ✅' }
        ],
        extra: [
          'החסר בהתחלה ויש ? בסוף - זו שאלה, ולכן **Why**',
          'על שאלה עם Why עונים עם **Because**'
        ]
      },
      {
        type: 'sort',
        title: 'משחק: WHY או BECAUSE?',
        instruction: 'לחצי על המילה שחסרה',
        buckets: ['Why', 'because'],
        items: [
          { text: '___ are you late?', answer: 'Why' }, { text: 'I eat ___ I am hungry.', answer: 'because' },
          { text: '___ is she smiling?', answer: 'Why' }, { text: 'He is happy ___ it is his birthday.', answer: 'because' },
          { text: '___ do you like dogs?', answer: 'Why' }, { text: 'We stay home ___ it is raining.', answer: 'because' }
        ]
      },
      {
        type: 'check',
        title: 'בדיקה קצרה',
        questions: [
          { sentence: '____ is the baby crying?', options: ['Why', 'Because'], answer: 'Why', tip: 'זו שאלה (יש ?), ולכן Why' },
          { sentence: 'She is tired ____ she didn\'t sleep.', options: ['why', 'because'], answer: 'because', tip: 'סיבה באמצע המשפט, ולכן because' },
          { sentence: 'Why are you happy? ____ I have a new bike.', options: ['Why', 'Because'], answer: 'Because', tip: 'עונים על Why עם Because' }
        ]
      }
    ]
  },

  sentenceOrder: {
    title: 'סידור משפטים',
    steps: [
      {
        type: 'tips',
        title: 'הסדר של משפט באנגלית',
        intro: 'כמעט כל משפט באנגלית בנוי באותו סדר:',
        pattern: [
          { label: 'מי?', en: 'My dog', color: '#dbeafe' },
          { label: 'עושה / מה?', en: 'likes to play', color: '#dcfce7' },
          { label: 'מה / איפה?', en: 'in the garden', color: '#fef3c7' },
          { label: 'מתי?', en: 'every day.', color: '#fce7f3' }
        ],
        tips: [
          'מתחילים מ"מי": I, she, the dog, my mom...',
          'שאלה מתחילה ב-Is / Are / Do / Can / Why: **Do you speak English?**',
          'סימן השאלה ? הולך תמיד לסוף',
          'אות גדולה נשארת רק ל-I ולשמות (Dan, Monday, English) - זה רמז!',
          'בסוף - קוראים את המשפט בקול: נשמע הגיוני?'
        ]
      },
      {
        type: 'howto',
        title: 'דוגמה: בונים משפט',
        sentence: 'barking / the / loudly / dog / is',
        steps: [
          { he: 'מי? - the dog', show: '**the dog** ...' },
          { he: 'עושה מה? - is barking', show: 'the dog **is barking** ...' },
          { he: 'איך? - loudly', show: 'The dog is barking **loudly**. ✅' }
        ]
      },
      {
        type: 'check',
        title: 'בדיקה קצרה: איזה סדר נכון?',
        questions: [
          { sentence: 'has / she / cat / a', options: ['She has a cat.', 'Has she a cat.', 'A cat she has.'], answer: 'She has a cat.', tip: 'קודם מי (she), אחר כך מה (has), ובסוף מה יש (a cat)' },
          { sentence: 'you / swim / can / ?', options: ['You can swim?', 'Can you swim?', 'Swim can you?'], answer: 'Can you swim?', tip: 'שאלה מתחילה ב-Can' }
        ]
      }
    ]
  },

  vocabulary: {
    title: 'אוצר מילים',
    steps: [
      {
        type: 'tips',
        title: 'איך פותרים שאלות אוצר מילים?',
        tips: [
          '🔊 לוחצים על הרמקול ושומעים את המילה - לפעמים מזהים אותה בשמיעה',
          'חושבים לאיזו קבוצה המילה שייכת: חיה? אוכל? צבע? פעולה?',
          'פוסלים קודם את התשובות שבטוח לא נכונות',
          'מחסן מילים: קוראים את כל המשפט, ומנסים להכניס כל מילה - איזו נשמעת הגיונית?',
          'הגדרה באנגלית: מחפשים מילים מוכרות בהגדרה (fly, eat, cold...) - הן רמז'
        ]
      },
      {
        type: 'check',
        title: 'בדיקה קצרה',
        questions: [
          { sentence: 'I drink ____ every morning.', options: ['milk', 'bread', 'chair'], answer: 'milk', tip: 'drink = לשתות, ומה שותים? milk' },
          { sentence: 'A very big grey animal with a long nose.', options: ['elephant', 'mouse', 'bird'], answer: 'elephant', tip: 'big + long nose = elephant 🐘' }
        ]
      }
    ]
  },

  reading: {
    title: 'הבנת הנקרא',
    steps: [
      {
        type: 'tips',
        title: 'איך פותרים הבנת הנקרא?',
        tips: [
          'קוראים קודם את השאלות - ככה יודעים מה לחפש בקטע',
          'מחפשים בקטע מילה מהשאלה (שם, מספר, צבע) - התשובה בדרך כלל באותו משפט',
          'Yes / No: מוצאים את המשפט בקטע ובודקים - כתוב בדיוק ככה, או ההפך?',
          'Why? - התשובה בקטע מתחילה בדרך כלל ב-because',
          'סידור אירועים: מחפשים מילים כמו First, Then, After that, In the evening',
          'אפשר ללחוץ על "הקראת הקטע" ולעקוב אחרי המשפט המודגש'
        ]
      },
      {
        type: 'check',
        title: 'נתרגל על קטע קצר',
        passage: 'Noa has a small dog. His name is Bobo. Bobo is brown. Noa plays with Bobo in the park because he loves to run.',
        questions: [
          { sentence: 'What color is Bobo?', options: ['white', 'brown', 'black'], answer: 'brown', tip: 'Bobo is brown.' },
          { sentence: 'Why does Noa play in the park?', options: ['Because Bobo loves to run', 'Because it is raining', 'Because she is sad'], answer: 'Because Bobo loves to run', tip: '...because he loves to run.' }
        ]
      }
    ]
  },

  listening: {
    title: 'הבנת הנשמע',
    steps: [
      {
        type: 'tips',
        title: 'איך פותרים הבנת הנשמע?',
        tips: [
          'לפני ההשמעה - קוראים את השאלה הראשונה, כדי לדעת למה להקשיב',
          'בוחרים מהירות 🐢 לאט בפעם הראשונה',
          'אפשר לעצור ⏸️ באמצע ולהמשיך ▶️ מאותו משפט',
          'מקשיבים במיוחד לשמות, מספרים, צבעים וימים',
          'מקשיבים פעמיים: פעם להבין את הסיפור, ופעם לחפש את התשובות',
          'את הטקסט כדאי לפתוח רק אם ממש נתקעים'
        ]
      }
    ]
  },

  writing: {
    title: 'כתיבה',
    steps: [
      {
        type: 'tips',
        title: 'איך כותבים קטע על עצמי?',
        pattern: [
          { label: 'מי אני', en: 'My name is Noa. I am ten.', color: '#dbeafe' },
          { label: 'מה יש לי', en: 'I have a brother.', color: '#dcfce7' },
          { label: 'מה אני אוהבת ולמה', en: 'I like pizza because...', color: '#fef3c7' },
          { label: 'מה אני יכולה', en: 'I can swim.', color: '#fce7f3' }
        ],
        tips: [
          'כל משפט מתחיל באות גדולה ונגמר בנקודה',
          'I תמיד באות גדולה - גם באמצע משפט',
          'I am / I have / I can - ולא I is או I has',
          'משתמשים ב-because כדי להסביר למה',
          'משפטים קצרים ופשוטים - עדיף מארוכים עם טעויות'
        ]
      }
    ]
  }
};

export const lessons = { ...englishLessons, ...mathLessons, ...hebrewLessons };

export const hasLesson = (categoryId) => Boolean(lessons[categoryId]);
