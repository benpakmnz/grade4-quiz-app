import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

// Get the Gemini model
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Cache for AI-generated questions to reduce API calls
const questionCache = {
  wordProblems: [],
  dataAnalysis: [],
  shapes: [],
  measurements: []
};

// Rate limiting - track last API call time
let lastApiCall = 0;
const MIN_API_INTERVAL = 2000; // 2 seconds between API calls

/**
 * Helper function to check if we should use AI or fallback
 */
const shouldUseAI = () => {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCall;
  
  // If less than 2 seconds since last call, use cache/fallback
  if (timeSinceLastCall < MIN_API_INTERVAL) {
    console.log('Rate limiting: using cache/fallback');
    return false;
  }
  
  // Random chance to use AI (70% AI, 30% static for variety)
  return Math.random() > 0.3;
};

/**
 * Helper function to call AI with rate limiting
 */
const callAI = async (prompt) => {
  lastApiCall = Date.now();
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

/**
 * Generate word problems for grade 4
 */
export const generateWordProblem = async () => {
  // Check cache first
  if (questionCache.wordProblems.length > 0 && Math.random() > 0.5) {
    const cached = questionCache.wordProblems.shift();
    console.log('Using cached word problem');
    return cached;
  }
  
  // Check if we should use AI
  if (!shouldUseAI()) {
    return getFallbackWordProblem();
  }
  
  const prompt = `
צור בעיה מילולית במתמטיקה לכיתה ד' בעברית.
הבעיה צריכה להיות פשוטה ומעניינת לילדים.

החזר JSON בפורמט הבא בלבד:
{
  "question": "הבעיה המילולית",
  "answer": המספר התשובה,
  "explanation": "הסבר קצר"
}
`;

  try {
    const text = await callAI(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      // Cache for future use
      if (questionCache.wordProblems.length < 5) {
        questionCache.wordProblems.push(result);
      }
      return result;
    }
    
    throw new Error('Failed to parse response');
  } catch (error) {
    console.error('Error generating word problem:', error);
    return getFallbackWordProblem();
  }
};

const getFallbackWordProblem = () => {
  const problems = [
    {
      question: 'לשרה היו 45 מדבקות. היא קיבלה עוד 23 מדבקות מחברה. כמה מדבקות יש לה עכשיו?',
      answer: 68,
      explanation: '45 + 23 = 68'
    },
    {
      question: 'בחנות היו 120 ספרים. נמכרו 47 ספרים. כמה ספרים נשארו?',
      answer: 73,
      explanation: '120 - 47 = 73'
    },
    {
      question: 'בכל קופסה יש 8 עוגיות. יש 7 קופסאות. כמה עוגיות יש בסך הכל?',
      answer: 56,
      explanation: '8 × 7 = 56'
    },
    {
      question: 'אמא קנתה 36 תפוחים. היא רוצה לחלק אותם שווה ל-4 ילדים. כמה תפוחים יקבל כל ילד?',
      answer: 9,
      explanation: '36 ÷ 4 = 9'
    },
    {
      question: 'דני קנה 3 עטים ב-12 ש"ח כל אחד. כמה כסף הוציא בסך הכל?',
      answer: 36,
      explanation: '3 × 12 = 36 ש"ח'
    }
  ];
  
  return problems[Math.floor(Math.random() * problems.length)];
};

/**
 * Generate data analysis question (tables, charts)
 * Using a hybrid approach - AI generates content, we structure it
 */
export const generateDataAnalysisQuestion = async () => {
  // Random type selection
  const types = ['table', 'bar', 'pictograph', 'pie'];
  const selectedType = types[Math.floor(Math.random() * types.length)];
  
  const simplePrompt = `
צור רעיון לשאלת חקר נתונים לכיתה ד' מסוג ${selectedType}.

החזר JSON פשוט עם:
- נושא (topic): למשל "פירות", "ספורט", "חיות מחמד", "ציונים"
- 4 פריטים (items): רשימה של 4 פריטים בנושא
- 4 ערכים (values): מספרים בין 10-30
- שאלה (question): שאלה על הנתונים
- תשובה (answer): מספר

דוגמה:
{
  "topic": "פירות אהובים",
  "items": ["תפוחים", "בננות", "תפוזים", "ענבים"],
  "values": [15, 23, 18, 12],
  "question": "איזה פרי הכי אהוב?",
  "answer": 23
}

החזר רק JSON, ללא טקסט נוסף.
`;

  try {
    const result = await model.generateContent(simplePrompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Gemini simple response:', text);
    
    // Extract JSON
    let jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) jsonMatch[0] = jsonMatch[1];
    }
    
    if (jsonMatch) {
      const aiData = JSON.parse(jsonMatch[0]);
      console.log('Parsed AI data:', aiData);
      
      // Build structured question based on type
      if (selectedType === 'table') {
        const students = aiData.items || ['דני', 'מיכל', 'יוסי', 'שרה'];
        const subjects = ['מתמטיקה', 'עברית', 'אנגלית'];
        const data = {};
        
        students.forEach((student, idx) => {
          data[student] = {};
          subjects.forEach((subject, subIdx) => {
            data[student][subject] = (aiData.values?.[idx] || 80) + (subIdx * 5);
          });
        });
        
        return {
          type: 'table',
          title: aiData.topic || 'ציוני מבחן',
          students,
          subjects,
          data,
          question: aiData.question || 'מה הציון הגבוה ביותר?',
          answer: aiData.answer || Math.max(...(aiData.values || [85])),
          explanation: `התשובה היא ${aiData.answer}`
        };
      } else if (selectedType === 'bar') {
        const data = {};
        (aiData.items || ['פריט1', 'פריט2', 'פריט3', 'פריט4']).forEach((item, idx) => {
          data[item] = aiData.values?.[idx] || (15 + idx * 5);
        });
        
        return {
          type: 'bar',
          title: aiData.topic || 'נתונים',
          data,
          question: aiData.question || 'מה הערך הגבוה ביותר?',
          answer: aiData.answer || Math.max(...Object.values(data)),
          explanation: `התשובה היא ${aiData.answer}`
        };
      } else if (selectedType === 'pictograph') {
        const emojis = ['🍎', '🍌', '🍊', '🍇', '⚽', '🏀', '🎾', '🏊', '🐕', '🐈', '🐠', '🐦'];
        const data = {};
        const scale = 5;
        
        (aiData.items || ['פריט1', 'פריט2', 'פריט3', 'פריט4']).forEach((item, idx) => {
          const emoji = emojis[idx] || '⭐';
          const value = (aiData.values?.[idx] || (10 + idx * 5));
          data[`${emoji} ${item}`] = Math.round(value / scale) * scale; // Round to scale
        });
        
        return {
          type: 'pictograph',
          title: aiData.topic || 'נתונים',
          scale,
          data,
          question: aiData.question || 'כמה יש בסך הכל?',
          answer: aiData.answer || Object.values(data)[0],
          explanation: `התשובה היא ${aiData.answer}`
        };
      } else if (selectedType === 'pie') {
        const data = {};
        let total = 0;
        
        (aiData.items || ['פריט1', 'פריט2', 'פריט3', 'פריט4']).forEach((item, idx) => {
          const value = aiData.values?.[idx] || (10 + idx * 3);
          data[item] = value;
          total += value;
        });
        
        return {
          type: 'pie',
          title: aiData.topic || 'נתונים',
          data,
          total,
          question: aiData.question || 'כמה בחרו באפשרות הראשונה?',
          answer: aiData.answer || Object.values(data)[0],
          explanation: `התשובה היא ${aiData.answer}`
        };
      }
    }
    
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('Error with AI, using fallback:', error);
    
    // Rich varied fallbacks
    const fallbacks = [
      {
        type: 'bar',
        title: 'פירות שנמכרו השבוע',
        data: { 'תפוחים': 28, 'בננות': 35, 'תפוזים': 22, 'ענבים': 19 },
        question: 'איזה פרי נמכר הכי הרבה?',
        answer: 35,
        explanation: 'בננות נמכרו הכי הרבה - 35 יחידות'
      },
      {
        type: 'bar',
        title: 'ספורט אהוב בכיתה',
        data: { 'כדורגל': 18, 'כדורסל': 14, 'שחייה': 22, 'טניס': 9 },
        question: 'כמה ילדים אוהבים שחייה?',
        answer: 22,
        explanation: '22 ילדים אוהבים שחייה'
      },
      {
        type: 'pictograph',
        title: 'ספרים שנקראו החודש',
        scale: 5,
        data: { '📕 הרפתקאות': 25, '📗 מדע': 20, '📘 היסטוריה': 15, '📙 ספורט': 30 },
        question: 'כמה ספרי ספורט נקראו?',
        answer: 30,
        explanation: 'נקראו 30 ספרי ספורט (6 אייקונים × 5)'
      },
      {
        type: 'pie',
        title: 'צבע אהוב בכיתה',
        data: { 'כחול': 12, 'אדום': 15, 'ירוק': 8, 'צהוב': 10 },
        total: 45,
        question: 'כמה ילדים בחרו באדום?',
        answer: 15,
        explanation: '15 ילדים בחרו באדום'
      },
      {
        type: 'bar',
        title: 'חיות בגן החיות',
        data: { 'אריות': 8, 'קופים': 24, 'פילים': 6, 'ג\'ירפות': 12 },
        question: 'כמה קופים יש בגן החיות?',
        answer: 24,
        explanation: 'יש 24 קופים בגן החיות'
      }
    ];
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
};

/**
 * Generate shapes question
 */
export const generateShapesQuestion = async () => {
  // Check if we should use AI
  if (!shouldUseAI()) {
    return getFallbackShapesQuestion();
  }
  
  const prompt = `
צור שאלה על צורות הנדסיות לכיתה ד' בעברית.

החזר JSON בפורמט הבא:
{
  "question": "השאלה",
  "options": ["אפשרות 1", "אפשרות 2", "אפשרות 3", "אפשרות 4"],
  "correctIndex": מספר האינדקס (0-3),
  "explanation": "הסבר"
}
`;

  try {
    const text = await callAI(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to parse response');
  } catch (error) {
    console.error('Error generating shapes question:', error);
    return getFallbackShapesQuestion();
  }
};

const getFallbackShapesQuestion = () => {
  const questions = [
    {
      question: 'כמה צלעות יש למשושה?',
      options: ['4', '5', '6', '8'],
      correctIndex: 2,
      explanation: 'למשושה יש 6 צלעות'
    },
    {
      question: 'כמה זוויות יש למשולש?',
      options: ['2', '3', '4', '5'],
      correctIndex: 1,
      explanation: 'למשולש יש 3 זוויות'
    },
    {
      question: 'איזו צורה יש לה 4 צלעות שוות?',
      options: ['מלבן', 'ריבוע', 'משולש', 'מעגל'],
      correctIndex: 1,
      explanation: 'לריבוע יש 4 צלעות שוות'
    },
    {
      question: 'כמה צלעות יש למחומש?',
      options: ['3', '4', '5', '6'],
      correctIndex: 2,
      explanation: 'למחומש יש 5 צלעות'
    }
  ];
  
  return questions[Math.floor(Math.random() * questions.length)];
};

/**
 * Generate measurements question
 */
export const generateMeasurementsQuestion = async () => {
  // Check if we should use AI
  if (!shouldUseAI()) {
    return getFallbackMeasurementsQuestion();
  }
  
  const prompt = `
צור שאלה על מדידות לכיתה ד' בעברית (אורך, משקל, נפח).

החזר JSON בפורמט הבא:
{
  "question": "השאלה",
  "answer": המספר התשובה,
  "unit": "יחידת המידה",
  "explanation": "הסבר"
}
`;

  try {
    const text = await callAI(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to parse response');
  } catch (error) {
    console.error('Error generating measurements question:', error);
    return getFallbackMeasurementsQuestion();
  }
};

const getFallbackMeasurementsQuestion = () => {
  const questions = [
    {
      question: 'כמה סנטימטרים יש ב-2 מטר?',
      answer: 200,
      unit: 'ס"מ',
      explanation: '1 מטר = 100 ס"מ, לכן 2 מטר = 200 ס"מ'
    },
    {
      question: 'כמה גרם יש בחצי קילוגרם?',
      answer: 500,
      unit: 'גרם',
      explanation: '1 ק"ג = 1000 גרם, לכן חצי ק"ג = 500 גרם'
    },
    {
      question: 'כמה מילימטרים יש ב-5 סנטימטר?',
      answer: 50,
      unit: 'מ"מ',
      explanation: '1 ס"מ = 10 מ"מ, לכן 5 ס"מ = 50 מ"מ'
    },
    {
      question: 'כמה ליטר יש ב-3000 מיליליטר?',
      answer: 3,
      unit: 'ליטר',
      explanation: '1 ליטר = 1000 מ"ל, לכן 3000 מ"ל = 3 ליטר'
    }
  ];
  
  return questions[Math.floor(Math.random() * questions.length)];
};
