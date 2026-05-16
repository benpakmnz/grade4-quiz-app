// Helper function to convert text based on gender
export const getGenderText = (text, gender) => {
  
  if (!gender || gender === 'female') {
    return text;
  }
  
  // Convert female forms to male forms
  // Using split and join for simple word replacement
  let result = text;
  
  // List of conversions - order matters! Longer phrases first
  const conversions = [
    ['איפה את עומדת', 'איפה אתה עומד'],
    ['אל תוותרי', 'אל תוותר'],
    ['בואי נתחיל', 'בוא נתחיל'],
    ['ברוכה הבאה', 'ברוך הבא'],
    ['את יכולה', 'אתה יכול'],
    ['את חזקה', 'אתה חזק'],
    ['את עומדת', 'אתה עומד'],
    ['את בטוחה', 'אתה בטוח'],
    ['לומדת מהירה', 'לומד מהיר'],
    ['בלתי ניתנת לעצירה', 'בלתי ניתן לעצירה'],
    ['מלכת החשבון', 'מלך החשבון'],
    ['גאונית מתמטיקה', 'גאון מתמטיקה'],
    ['כדאי לך להתמקד ב', 'כדאי לך להתמקד ב'],
    ['נושאים שעוד לא התחלת', 'נושאים שעוד לא התחלת'],
    ['לא נכון, נסי שוב', 'לא נכון, נסה שוב'],
    ['מצוין! חשבת נכון', 'מצוין! חשבת נכון'],
    ['מצוין! זיהית נכון', 'מצוין! זיהית נכון'],
    ['פתרת את זה', 'פתרת את זה'],
    ['מעולה! חישבת נכון', 'מעולה! חישבת נכון'],
    ['האם את בטוחה', 'האם אתה בטוח'],
    ['הכי חזקה ב', 'הכי חזק ב'],
    ['נסי', 'נסה'],
    ['בואי', 'בוא'],
    ['הכניסי', 'הכנס'],
    ['בחרי', 'בחר'],
    ['תרגלי', 'תרגל'],
    ['קחי', 'קח'],
    ['כתבי', 'כתוב'],
    ['התמקדי', 'התמקד'],
    ['תוותרי', 'תוותר'],
    ['המשיכי', 'המשך'],
    ['ברוכה', 'ברוך'],
    ['הבאה', 'הבא'],
    ['לומדת', 'לומד'],
    ['מסורה', 'מסור'],
    ['אלופה', 'אלוף'],
    ['אספנית', 'אספן'],
    ['מלכת', 'מלך'],
    ['גאונית', 'גאון'],
    ['ניתנת', 'ניתן'],
    ['חזקה', 'חזק'],
    ['בטוחה', 'בטוח'],
    ['עומדת', 'עומד'],
    ['גאונות', 'גאון'],
    ['יכולה', 'יכול']
    // Note: 'את' → 'אתה' is NOT here to avoid double replacement
  ];
  
  conversions.forEach(([female, male]) => {
    if (result.includes(female)) {
      console.log(`Found and replacing "${female}" with "${male}"`);
      // Use replaceAll to replace all occurrences
      result = result.replaceAll(female, male);
    }
  });
  
  console.log('Converted text:', result);
  return result;
};
