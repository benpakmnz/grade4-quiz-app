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
import Achievements from './components/Achievements';
import ProfileEditDialog from './components/ProfileEditDialog';
import WelcomeDialog from './components/WelcomeDialog';
import StatusDialog from './components/StatusDialog';
import { getGenderText } from './utils/genderText';
import {
  Box,
  Text,
  Button,
  HStack,
  Badge,
} from '@chakra-ui/react';

function App() {
  const [currentGame, setCurrentGame] = useState('welcome');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [userData, setUserData] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  
  // Track success per category
  const [categoryStats, setCategoryStats] = useState({
    addSubtract: { correct: 0, total: 0 },
    multiplyDivide: { correct: 0, total: 0 },
    decimalStructure: { correct: 0, total: 0 },
    dataAnalysis: { correct: 0, total: 0 },
    wordProblems: { correct: 0, total: 0 },
    shapes: { correct: 0, total: 0 },
    measurements: { correct: 0, total: 0 }
  });
  
  const openAchievements = () => setShowAchievements(true);
  const closeAchievements = () => setShowAchievements(false);
  const openProfileEdit = () => setShowProfileEdit(true);
  const closeProfileEdit = () => setShowProfileEdit(false);

  const handleProfileSave = (newUserData) => {
    console.log('Saving profile with data:', newUserData);
    setUserData(newUserData);
  };

  // Helper function to darken color for gradient
  const adjustColor = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  };

    const examDate = new Date('2026-05-27');
  const today = new Date();
  const diffTime = examDate - today;
  const daysUntilExam = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Load data from localStorage on mount
  useEffect(() => {
    const savedScore = localStorage.getItem('quiz_score');
    const savedStreak = localStorage.getItem('quiz_streak');
    const savedQuestionCount = localStorage.getItem('quiz_questionCount');
    const savedUserData = localStorage.getItem('quiz_userData');
    const savedHistory = localStorage.getItem('quiz_history');
    const savedCategoryStats = localStorage.getItem('quiz_categoryStats');
    const hasSeenWelcome = localStorage.getItem('quiz_hasSeenWelcome');

    if (savedScore) setScore(parseInt(savedScore));
    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedQuestionCount) setQuestionCount(parseInt(savedQuestionCount));
    if (savedUserData) {
      const parsedUserData = JSON.parse(savedUserData);
      setUserData(parsedUserData);
      setCurrentGame('home');
      
      // Show status dialog on app reload (but not on first visit)
      if (hasSeenWelcome) {
        // Small delay to let the UI render first
        setTimeout(() => {
          setShowStatusDialog(true);
        }, 500);
      }
    }
    if (savedHistory) setGameHistory(JSON.parse(savedHistory));
    if (savedCategoryStats) setCategoryStats(JSON.parse(savedCategoryStats));
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

  useEffect(() => {
    localStorage.setItem('quiz_categoryStats', JSON.stringify(categoryStats));
  }, [categoryStats]);

  const handleWelcomeComplete = (data) => {
    console.log('handleWelcomeComplete - received data:', data);
    
    // Add default values if not provided
    const completeData = {
      ...data,
      gender: data.gender || 'female',
      themeColor: data.themeColor || '#667eea'
    };
    
    console.log('handleWelcomeComplete - completeData:', completeData);
    setUserData(completeData);
    setCurrentGame('home');
    
    // Check if this is the first time
    const isFirstTime = !localStorage.getItem('quiz_hasSeenWelcome');
    console.log('Is first time?', isFirstTime);
    if (isFirstTime) {
      localStorage.setItem('quiz_hasSeenWelcome', 'true');
      // Small delay to let the UI render first
      setTimeout(() => {
        setShowWelcomeDialog(true);
      }, 500);
    }
  };

  const handleGameStats = (newScore, newStreak, newQuestionCount) => {
    setScore(newScore);
    setStreak(newStreak);
    setQuestionCount(newQuestionCount);
  };

  const updateCategoryStats = (category, isCorrect) => {
    setCategoryStats(prev => ({
      ...prev,
      [category]: {
        correct: prev[category].correct + (isCorrect ? 1 : 0),
        total: prev[category].total + 1
      }
    }));
  };

  const calculateSuccessRate = (category) => {
    const stats = categoryStats[category];
    if (stats.total === 0) return 0;
    
    // 30 correct answers = 100%
    const TARGET_FOR_100 = 30;
    const percentage = Math.min(100, Math.round((stats.correct / TARGET_FOR_100) * 100));
    return percentage;
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

  const renderGame = () => {
    switch (currentGame) {
      case 'welcome':
        return <WelcomeScreen onStart={handleWelcomeComplete} />;
      case 'home':
        return <HomePage 
          onSelectGame={setCurrentGame} 
          score={score} 
          streak={streak}
          questionCount={questionCount}
          userData={userData}
          gameHistory={gameHistory}
          categoryStats={categoryStats}
          calculateSuccessRate={calculateSuccessRate}
          getGenderText={getGenderText}
        />;
      case 'addSubtract':
        return <AddSubtractGame 
          onBack={() => setCurrentGame('home')} 
          score={score} 
          setScore={setScore}
          streak={streak}
          setStreak={setStreak}
          questionCount={questionCount}
          setQuestionCount={setQuestionCount}
          userData={userData}
          onAnswer={(isCorrect) => updateCategoryStats('addSubtract', isCorrect)}
        />;
      case 'multiplyDivide':
        return <MultiplyDivideGame 
          onBack={() => setCurrentGame('home')} 
          score={score} 
          setScore={setScore}
          streak={streak}
          setStreak={setStreak}
          questionCount={questionCount}
          setQuestionCount={setQuestionCount}
          userData={userData}
          onAnswer={(isCorrect) => updateCategoryStats('multiplyDivide', isCorrect)}
        />;
      case 'decimalStructure':
        return <DecimalStructureGame 
          onBack={() => setCurrentGame('home')} 
          score={score} 
          setScore={setScore}
          streak={streak}
          setStreak={setStreak}
          questionCount={questionCount}
          setQuestionCount={setQuestionCount}
          userData={userData}
          onAnswer={(isCorrect) => updateCategoryStats('decimalStructure', isCorrect)}
        />;
      case 'dataAnalysis':
        return <DataAnalysisGame 
          onBack={() => setCurrentGame('home')} 
          score={score} 
          setScore={setScore}
          streak={streak}
          setStreak={setStreak}
          questionCount={questionCount}
          setQuestionCount={setQuestionCount}
          userData={userData}
          onAnswer={(isCorrect) => updateCategoryStats('dataAnalysis', isCorrect)}
        />;
      case 'wordProblems':
        return <WordProblemsGame 
          onBack={() => setCurrentGame('home')} 
          score={score} 
          setScore={setScore}
          streak={streak}
          setStreak={setStreak}
          questionCount={questionCount}
          setQuestionCount={setQuestionCount}
          onAddHistory={(result) => addToHistory('wordProblems', result)}
          userData={userData}
          onAnswer={(isCorrect) => updateCategoryStats('wordProblems', isCorrect)}
        />;
      case 'shapes':
        return <ShapesGame 
          onBack={() => setCurrentGame('home')} 
          score={score} 
          setScore={setScore}
          streak={streak}
          setStreak={setStreak}
          questionCount={questionCount}
          setQuestionCount={setQuestionCount}
          onAddHistory={(result) => addToHistory('shapes', result)}
          userData={userData}
          onAnswer={(isCorrect) => updateCategoryStats('shapes', isCorrect)}
        />;
      case 'measurements':
        return <MeasurementsGame 
          onBack={() => setCurrentGame('home')} 
          score={score} 
          setScore={setScore}
          streak={streak}
          setStreak={setStreak}
          questionCount={questionCount}
          setQuestionCount={setQuestionCount}
          onAddHistory={(result) => addToHistory('measurements', result)}
          userData={userData}
          onAnswer={(isCorrect) => updateCategoryStats('measurements', isCorrect)}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="App" style={{
      background: userData?.themeColor 
        ? `linear-gradient(135deg, ${userData.themeColor} 0%, ${adjustColor(userData.themeColor, -20)} 100%)`
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <BackgroundElements />
      
      {/* Fixed Header */}
      {currentGame !== 'welcome' && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bg="white"
          boxShadow="lg"
          zIndex={1000}
          borderBottom="3px solid"
          borderColor="purple.500"
          w="100vw"
        >
          <Box maxW="100%" px={8}>
            <HStack justify="space-between" py={3} spacing={4}>
              {/* Right Side - Greeting with Character */}
              {userData && (
                <HStack spacing={2}>
                  <Text fontSize="3xl" className="character-buddy">
                    {userData.character.emoji}
                  </Text>
                  <Text 
                    fontSize="lg" 
                    fontWeight="bold" 
                    color={userData.themeColor || 'purple.600'}
                    cursor="pointer"
                    onClick={openProfileEdit}
                    _hover={{ textDecoration: 'underline', transform: 'scale(1.05)' }}
                    transition="all 0.3s"
                    title="לחץ לעריכת פרופיל"
                  >
                    שלום {userData.name}! 👋
                  </Text>
                </HStack>
              )}
  
              {/* Center - Title with Icon */}
              <HStack spacing={2}>
                <Text fontSize="2xl">🎮</Text>
                <Text 
                  fontSize="lg" 
                  fontWeight="bold" 
                  color={userData?.themeColor || 'purple.600'}
                >
                  תרגול למבחן בחשבון כיתה ד'
                </Text>
              </HStack>
  
              {/* Left Side - Stats & Achievements */}
              <HStack spacing={3}>
                <Badge
                  fontSize="md"
                  px={4}
                  py={2}
                  borderRadius="full"
                  bg={userData?.themeColor || "purple.500"}
                  bgGradient={`linear(to-r, ${userData?.themeColor || "pink.400"}, ${adjustColor(userData?.themeColor || "#667eea", -20)})`}
                  color="white"
                  boxShadow="md"
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <Text fontWeight="bold">נקודות:</Text>
                  <Text fontWeight="bold" fontSize="lg">{score}</Text>
                  <Text fontSize="lg">⭐</Text>
                </Badge>
  
                <Button
                  size="sm"
                  colorScheme="yellow"
                  borderRadius="full"
                  boxShadow="md"
                  onClick={() => {
                    console.log('Opening achievements, current state:', showAchievements);
                    openAchievements();
                  }}
                  leftIcon={<span>🏆</span>}
                  px={4}
                  py={2}
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                  transition="all 0.3s"
                >
                  ההישגים שלי
                </Button>

                {/* Exam Countdown - Compact */}
                <Badge
                  fontSize="sm"
                  px={3}
                  py={2}
                  borderRadius="full"
                  bg="red.500"
                  color="white"
                  boxShadow="md"
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <Text fontSize="md">⏰</Text>
                  <Text fontWeight="bold">המבחן בעוד:</Text>
                  <Text fontWeight="bold" fontSize="md">
                    {daysUntilExam > 0 ? `${daysUntilExam} ימים` : 'היום!'}
                  </Text>
                </Badge>
              </HStack>
            </HStack>
          </Box>
        </Box>
      )}
  
      <AnimatePresence mode="wait">
        <motion.div
          key={currentGame}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderGame()}
        </motion.div>
      </AnimatePresence>

      {/* Profile Edit Dialog */}
      {showProfileEdit && userData && (
        <ProfileEditDialog
          userData={userData}
          onSave={handleProfileSave}
          onClose={closeProfileEdit}
        />
      )}

      {/* Welcome Dialog - First Time Only */}
      {showWelcomeDialog && userData && (
        <AnimatePresence>
          <WelcomeDialog
            userData={userData}
            onClose={() => setShowWelcomeDialog(false)}
          />
        </AnimatePresence>
      )}

      {/* Status Dialog - On App Reload */}
      {showStatusDialog && userData && (
        <AnimatePresence>
          <StatusDialog
            userData={userData}
            categoryStats={categoryStats}
            onClose={() => setShowStatusDialog(false)}
          />
        </AnimatePresence>
      )}

      {/* Achievements Modal */}
      {showAchievements && (
        <AnimatePresence>
          <motion.div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              zIndex: 99998,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAchievements}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <Achievements
                score={score}
                streak={streak}
                questionCount={questionCount}
                onClose={closeAchievements}
                categoryStats={categoryStats}
                userData={userData}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

export default App;
