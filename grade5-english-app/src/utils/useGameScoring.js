import { getGenderText } from './genderText';
import { fxCorrect, fxWrong } from './fx';

// לוגיקת ניקוד משותפת לכל המשחקים: נקודות, רצף, ספירת שאלות וסטטיסטיקה לפי נושא
export const useGameScoring = ({
  score, setScore, streak, setStreak, questionCount, setQuestionCount, onAnswer, userData
}) => {
  const registerResult = (isCorrect, basePoints = 15) => {
    if (onAnswer) onAnswer(isCorrect);
    setQuestionCount(questionCount + 1);
    if (isCorrect) {
      const points = basePoints + streak * 5;
      setScore(score + points);
      setStreak(streak + 1);
      fxCorrect(points, streak + 1);
      return points;
    }
    setStreak(0);
    fxWrong();
    return 0;
  };

  const praise = () =>
    [
      'Excellent! 🎉',
      'Great job! ⭐',
      'כל הכבוד! 🌟',
      getGenderText('מעולה! את אלופה! 🚀', userData?.gender),
      'Well done! 🏆'
    ][Math.floor(Math.random() * 5)];

  return { registerResult, praise };
};
