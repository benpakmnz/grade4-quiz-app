import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

// Get the Gemini model
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

/**
 * Generate word problems for grade 4
 */
export const generateWordProblem = async () => {
  const prompt = `
צור בעיה מילולית במתמטיקה לכיתה ד' בעברית.
הבעיה צריכה להיות:
- חד-שלבית או דו-שלבית
- עם מספרים עד 10,000
- בנושאים: חיבור, חיסור, כפל, חילוק, או שילוב
- מציאותית ומעניינת לילדים

החזר JSON בפורמט הבא בלבד (ללא טקסט נוסף):
{
  "question": "הבעיה המילולית",
  "answer": המספר התשובה (מספר בלבד),
  "explanation": "הסבר קצר איך מגיעים לתשובה"
}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to parse response');
  } catch (error) {
    console.error('Error generating word problem:', error);
    // Fallback to static question
    return {
      question: 'לשרה היו 45 מדבקות. היא קיבלה עוד 23 מדבקות מחברה. כמה מדבקות יש לה עכשיו?',
      answer: 68,
      explanation: '45 + 23 = 68'
    };
  }
};

/**
 * Generate data analysis question (tables, charts)
 */
export const generateDataAnalysisQuestion = async () => {
  const prompt = `
צור שאלת חקר נתונים לכיתה ד' בעברית.
השאלה צריכה להיות על:
- טבלה עם נתונים (3-5 שורות)
- או גרף עמודות
- או גרף קוביות
- עם שאלה על הנתונים

החזר JSON בפורמט הבא בלבד (ללא טקסט נוסף):
{
  "type": "table" או "bar" או "pictograph",
  "title": "כותרת הטבלה/גרף",
  "data": [{"label": "תווית", "value": מספר}, ...],
  "question": "השאלה על הנתונים",
  "answer": המספר התשובה (מספר בלבד),
  "explanation": "הסבר קצר"
}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to parse response');
  } catch (error) {
    console.error('Error generating data analysis question:', error);
    // Fallback
    return {
      type: 'table',
      title: 'ציוני מבחן',
      data: [
        { label: 'דני', value: 85 },
        { label: 'מיכל', value: 92 },
        { label: 'יוסי', value: 78 }
      ],
      question: 'מי קיבל את הציון הגבוה ביותר?',
      answer: 92,
      explanation: 'מיכל קיבלה 92 - הציון הגבוה ביותר'
    };
  }
};

/**
 * Generate shapes question
 */
export const generateShapesQuestion = async () => {
  const prompt = `
צור שאלה על צורות הנדסיות לכיתה ד' בעברית.
השאלה צריכה להיות על:
- זיהוי צורות (משולש, ריבוע, מלבן, מעגל, מחומש, משושה)
- מספר צלעות או קודקודים
- סיווג צורות

החזר JSON בפורמט הבא בלבד (ללא טקסט נוסף):
{
  "question": "השאלה",
  "options": ["אפשרות 1", "אפשרות 2", "אפשרות 3", "אפשרות 4"],
  "correctIndex": מספר האינדקס של התשובה הנכונה (0-3),
  "explanation": "הסבר קצר"
}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to parse response');
  } catch (error) {
    console.error('Error generating shapes question:', error);
    // Fallback
    return {
      question: 'כמה צלעות יש למשושה?',
      options: ['4', '5', '6', '8'],
      correctIndex: 2,
      explanation: 'למשושה יש 6 צלעות'
    };
  }
};

/**
 * Generate measurements question
 */
export const generateMeasurementsQuestion = async () => {
  const prompt = `
צור שאלה על מדידות לכיתה ד' בעברית.
השאלה צריכה להיות על:
- אורך (ס"מ, מ', ק"מ)
- משקל (גרם, ק"ג)
- נפח (ליטר, מ"ל)
- המרות בין יחידות

החזר JSON בפורמט הבא בלבד (ללא טקסט נוסף):
{
  "question": "השאלה",
  "answer": המספר התשובה (מספר בלבד),
  "unit": "יחידת המידה",
  "explanation": "הסבר קצר"
}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to parse response');
  } catch (error) {
    console.error('Error generating measurements question:', error);
    // Fallback
    return {
      question: 'כמה סנטימטרים יש ב-2 מטר?',
      answer: 200,
      unit: 'ס"מ',
      explanation: '1 מטר = 100 ס"מ, לכן 2 מטר = 200 ס"מ'
    };
  }
};
