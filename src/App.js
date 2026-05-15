import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import WelcomeScreen from './components/WelcomeScreen';
import HomePage from './components/HomePage';
import AddSubtractGame from './components/AddSubtractGame';
import MultiplyDivideGame from './components/MultiplyDivideGame';
import DecimalStructureGame from './components/DecimalStructureGame';
import DataAnalysisGame from './components/DataAnalysisGame';
import WordProblemsGame from './components/WordProblemsGame';
import ShapesGame from './components/ShapesGame';
import MeasurementsGame from './components/MeasurementsGame';
import BackgroundElements from './components/BackgroundElements';

function App() {
  const [currentGame, setCurrentGame] = useState('welcome');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [userData, setUserData] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedScore = localStorage.getItem('quiz_score');
    const savedStreak = localStorage.getItem('quiz_streak');
    const savedQuestionCount = localStorage.getItem('quiz_questionCount');
    const savedUserData = localStorage.getItem('quiz_userData');
    const savedHistory = localStorage.getItem('quiz_history');

    if (savedScore) setScore(parseInt(savedScore));
    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedQuestionCount) setQuestionCount(parseInt(savedQuestionCount));
    if (savedUserData) {
      setUserData(JSON.parse(savedUserData));
      setCurrentGame('home');
    }
    if (savedHistory) setGameHistory(JSON.parse(savedHistory));
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('quiz_score', score.toString());
  }, [score]);

  useEffect(() => {
    localStorage.setItem('quiz_streak', streak.toString());
  }, [streak]);

  useEffect(() => {
    localStorage.setItem('quiz_questionCount', questionCount.toString());
  }, [questionCount]);

  useEffect(() => {
    if (userData) {
      localStorage.setItem('quiz_userData', JSON.stringify(userData));
    }
  }, [userData]);

  useEffect(() => {
    localStorage.setItem('quiz_history', JSON.stringify(gameHistory));
  }, [gameHistory]);

  const handleWelcomeComplete = (data) => {
    setUserData(data);
    setCurrentGame('home');
  };

  const handleGameStats = (newScore, newStreak, newQuestionCount) => {
    setScore(newScore);
    setStreak(newStreak);
    setQuestionCount(newQuestionCount);
  };

  const addToHistory = (gameType, result) => {
    const historyEntry = {
      id: Date.now(),
      gameType,
      result,
      timestamp: new Date().toISOString(),
      score: result.score,
      correct: result.correct,
      total: result.total
    };
    setGameHistory([historyEntry, ...gameHistory].slice(0, 50)); // Keep last 50 entries
  };

  const games = {
    welcome: <WelcomeScreen onStart={handleWelcomeComplete} />,
    home: <HomePage 
      onSelectGame={setCurrentGame} 
      score={score} 
      streak={streak}
      questionCount={questionCount}
      userData={userData}
      gameHistory={gameHistory}
    />,
    addSubtract: <AddSubtractGame 
      onBack={() => setCurrentGame('home')} 
      score={score} 
      setScore={setScore}
      streak={streak}
      setStreak={setStreak}
      questionCount={questionCount}
      setQuestionCount={setQuestionCount}
      userData={userData} 
    />,
    multiplyDivide: <MultiplyDivideGame 
      onBack={() => setCurrentGame('home')} 
      score={score} 
      setScore={setScore}
      streak={streak}
      setStreak={setStreak}
      questionCount={questionCount}
      setQuestionCount={setQuestionCount}
      userData={userData} 
    />,
    decimalStructure: <DecimalStructureGame 
      onBack={() => setCurrentGame('home')} 
      score={score} 
      setScore={setScore}
      streak={streak}
      setStreak={setStreak}
      questionCount={questionCount}
      setQuestionCount={setQuestionCount}
      userData={userData} 
    />,
    dataAnalysis: <DataAnalysisGame 
      onBack={() => setCurrentGame('home')} 
      score={score} 
      setScore={setScore}
      streak={streak}
      setStreak={setStreak}
      questionCount={questionCount}
      setQuestionCount={setQuestionCount}
      userData={userData} 
    />,
    wordProblems: <WordProblemsGame 
      onBack={() => setCurrentGame('home')} 
      score={score} 
      setScore={setScore}
      streak={streak}
      setStreak={setStreak}
      questionCount={questionCount}
      setQuestionCount={setQuestionCount}
      onAddHistory={(result) => addToHistory('wordProblems', result)}
      userData={userData} 
    />,
    shapes: <ShapesGame 
      onBack={() => setCurrentGame('home')} 
      score={score} 
      setScore={setScore}
      streak={streak}
      setStreak={setStreak}
      questionCount={questionCount}
      setQuestionCount={setQuestionCount}
      onAddHistory={(result) => addToHistory('shapes', result)}
      userData={userData} 
    />,
    measurements: <MeasurementsGame 
      onBack={() => setCurrentGame('home')} 
      score={score} 
      setScore={setScore}
      streak={streak}
      setStreak={setStreak}
      questionCount={questionCount}
      setQuestionCount={setQuestionCount}
      onAddHistory={(result) => addToHistory('measurements', result)}
      userData={userData} 
    />,
  };

  return (
    <div className="App">
      <BackgroundElements />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentGame}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {games[currentGame]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;
