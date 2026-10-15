import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import WelcomeScreen from './components/WelcomeScreen';
import HomePage from './components/HomePage';
import QuizGame from './components/QuizGame';
import PassageGame from './components/PassageGame';
import WritingGame from './components/WritingGame';
import AdminPanel from './components/AdminPanel';
import BackgroundElements from './components/BackgroundElements';
import Achievements from './components/Achievements';
import ProfileEditDialog from './components/ProfileEditDialog';
import WelcomeDialog from './components/WelcomeDialog';
import StatusDialog from './components/StatusDialog';
import GuestReminderDialog from './components/GuestReminderDialog';
import { getGenderText } from './utils/genderText';
import { categories, getEmptyCategoryStats, getDaysUntilExam, TARGET_PER_CATEGORY } from './data/categories';
import { notifyLocalChange } from './services/cloudSync';
import { emailToUsername } from './utils/username';
import {
  Box,
  Text,
  Button,
  HStack,
  VStack,
  Badge,
} from '@chakra-ui/react';

function App({ authUser = null, cloudEnabled = false, syncError = null, isAdmin = false, isGuest = false, onRequestSignup }) {
  const [currentGame, setCurrentGame] = useState('welcome');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [userData, setUserData] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [showAchievements, setShowAchievements] = useState(false);
  const [achievementsTab, setAchievementsTab] = useState('overview');
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showGuestReminder, setShowGuestReminder] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Track success per category
  const [categoryStats, setCategoryStats] = useState(getEmptyCategoryStats);
  
  const openAchievements = (tab = 'overview') => {
    setAchievementsTab(typeof tab === 'string' ? tab : 'overview');
    setShowAchievements(true);
  };
  const closeAchievements = () => setShowAchievements(false);
  const openProfileEdit = () => setShowProfileEdit(true);
  const closeProfileEdit = () => setShowProfileEdit(false);

  const handleProfileSave = (newUserData) => {
    setUserData(newUserData);
  };

  // Helper function to darken color for gradient
  const adjustColor = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  };

  const daysUntilExam = getDaysUntilExam();

  // Load data from localStorage on mount
  useEffect(() => {
    
    const savedScore = localStorage.getItem('english_score');
    const savedStreak = localStorage.getItem('english_streak');
    const savedQuestionCount = localStorage.getItem('english_questionCount');
    const savedUserData = localStorage.getItem('english_userData');
    const savedHistory = localStorage.getItem('english_history');
    const savedCategoryStats = localStorage.getItem('english_categoryStats');
    const hasSeenWelcome = localStorage.getItem('english_hasSeenWelcome');

    if (savedScore) setScore(parseInt(savedScore));
    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedQuestionCount) setQuestionCount(parseInt(savedQuestionCount));
    if (savedUserData) {
      const parsedUserData = JSON.parse(savedUserData);
      setUserData(parsedUserData);
      setCurrentGame('home');
      
      // Show status dialog on app reload (but not on first visit)
      // אורח/ת שחוזר/ת: קודם תזכורת להירשם (פעם אחת בכל כניסה), אחר כך מסך הסטטוס
      let remindedThisVisit = false;
      try {
        remindedThisVisit = sessionStorage.getItem('english_guestReminded') === '1';
      } catch {
        // ignore
      }
      if (isGuest && onRequestSignup && !remindedThisVisit) {
        setTimeout(() => setShowGuestReminder(true), 500);
      } else if (hasSeenWelcome) {
        // Small delay to let the UI render first
        setTimeout(() => {
          setShowStatusDialog(true);
        }, 500);
      }
    }
    if (savedHistory) setGameHistory(JSON.parse(savedHistory));
    if (savedCategoryStats) setCategoryStats({ ...getEmptyCategoryStats(), ...JSON.parse(savedCategoryStats) });
    
    // Mark initial load as complete
    setIsInitialLoad(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- טעינה פעם אחת (App נטען מחדש לכל משתמש)

  // Save data to localStorage whenever it changes (but not on initial load)
  useEffect(() => {
    if (isInitialLoad) return;
    localStorage.setItem('english_score', score.toString());
  }, [score, isInitialLoad]);

  useEffect(() => {
    if (isInitialLoad) return;
    localStorage.setItem('english_streak', streak.toString());
  }, [streak, isInitialLoad]);

  useEffect(() => {
    if (isInitialLoad) return;
    localStorage.setItem('english_questionCount', questionCount.toString());
  }, [questionCount, isInitialLoad]);

  useEffect(() => {
    if (isInitialLoad) return;
    if (userData) {
      localStorage.setItem('english_userData', JSON.stringify(userData));
    }
  }, [userData, isInitialLoad]);

  useEffect(() => {
    if (isInitialLoad) return;
    localStorage.setItem('english_history', JSON.stringify(gameHistory));
  }, [gameHistory, isInitialLoad]);

  useEffect(() => {
    if (isInitialLoad) return;
    localStorage.setItem('english_categoryStats', JSON.stringify(categoryStats));
  }, [categoryStats, isInitialLoad]);

  // שמירה בענן אחרי כל שינוי (רק כשמחוברים; עם השהיה קצרה)
  useEffect(() => {
    if (isInitialLoad) return;
    notifyLocalChange();
  }, [score, streak, questionCount, userData, gameHistory, categoryStats, isInitialLoad]);

  const handleWelcomeComplete = (data) => {
    
    // Add default values if not provided
    const completeData = {
      ...data,
      gender: data.gender || 'female',
      themeColor: data.themeColor || '#667eea'
    };
    setUserData(completeData);
    setCurrentGame('home');
    
    // Check if this is the first time
    const isFirstTime = !localStorage.getItem('english_hasSeenWelcome');
    if (isFirstTime) {
      localStorage.setItem('english_hasSeenWelcome', 'true');
      notifyLocalChange();
      // Small delay to let the UI render first
      setTimeout(() => {
        setShowWelcomeDialog(true);
      }, 500);
    }
  };

  const updateCategoryStats = (category, isCorrect) => {
    setCategoryStats(prev => {
      // Ensure the category exists, if not initialize it
      if (!prev[category]) {
        return {
          ...prev,
          [category]: {
            correct: isCorrect ? 1 : 0,
            total: 1
          }
        };
      }
      
      return {
        ...prev,
        [category]: {
          correct: prev[category].correct + (isCorrect ? 1 : 0),
          total: prev[category].total + 1
        }
      };
    });
  };

  const calculateSuccessRate = (category) => {
    const stats = categoryStats[category];
    if (!stats || stats.total === 0) return 0;
    
    // 30 correct answers = 100%
    const percentage = Math.min(100, Math.round((stats.correct / TARGET_PER_CATEGORY) * 100));
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
    if (currentGame === 'welcome') {
      return <WelcomeScreen onStart={handleWelcomeComplete} defaultName={emailToUsername(authUser?.email) || (authUser?.displayName || '').split(' ')[0]} />;
    }
    if (currentGame === 'home') {
      return <HomePage
        onSelectGame={(id) => (id === 'myProgress' ? openAchievements('progress') : setCurrentGame(id))}
        score={score}
        streak={streak}
        questionCount={questionCount}
        userData={userData}
        gameHistory={gameHistory}
        categoryStats={categoryStats}
        calculateSuccessRate={calculateSuccessRate}
        getGenderText={getGenderText}
      />;
    }

    if (currentGame === 'admin' && isAdmin) {
      return <AdminPanel onBack={() => setCurrentGame('home')} />;
    }

    const category = categories.find(c => c.id === currentGame);
    if (!category) return null;

    const gameProps = {
      key: category.id,
      category: category.id,
      title: category.title,
      testLength: category.testLength || 0,
      onBack: () => setCurrentGame('home'),
      score,
      setScore,
      streak,
      setStreak,
      questionCount,
      setQuestionCount,
      userData,
      onAnswer: (isCorrect) => updateCategoryStats(category.id, isCorrect),
      onAddHistory: (result) => addToHistory(category.id, result)
    };

    if (category.id === 'reading' || category.id === 'listening') {
      return <PassageGame {...gameProps} />;
    }
    if (category.id === 'writing') {
      return <WritingGame {...gameProps} />;
    }
    return <QuizGame {...gameProps} />;
  };

  return (
    <div className="App" style={{
      background: userData?.themeColor 
        ? `linear-gradient(135deg, ${userData.themeColor} 0%, ${adjustColor(userData.themeColor, -20)} 100%)`
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <BackgroundElements />

      {syncError && currentGame !== 'welcome' && (
        <div className="sync-error-banner">⚠️ {syncError}</div>
      )}
      
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
            {/* Desktop: Single row with name on right, stats on left */}
            <HStack 
              justify="space-between" 
              py={3} 
              spacing={4}
              display={{ base: 'none', md: 'flex' }}
            >
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
                  {authUser && (
                    <Text fontSize="lg" title={`ההתקדמות נשמרת בענן (${emailToUsername(authUser.email) || authUser.email})`}>☁️</Text>
                  )}
                </HStack>
              )}
  
              {/* Left Side - Stats & Achievements with Labels */}
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

                {isAdmin && (
                  <Button
                    size="sm"
                    borderRadius="full"
                    boxShadow="md"
                    onClick={() => setCurrentGame('admin')}
                    px={4}
                    py={2}
                    title="ניהול שאלות"
                  >
                    ⚙️ ניהול
                  </Button>
                )}

                {/* Exam Countdown */}
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

            {/* Mobile: Two rows - name on top, compact stats on bottom */}
            <VStack 
              spacing={2} 
              py={3}
              display={{ base: 'flex', md: 'none' }}
            >
              {/* Top Row - Greeting with Character */}
              {userData && (
                <HStack spacing={2} w="full" justify="center">
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
                  {authUser && (
                    <Text fontSize="lg" title={`ההתקדמות נשמרת בענן (${emailToUsername(authUser.email) || authUser.email})`}>☁️</Text>
                  )}
                </HStack>
              )}
  
              {/* Bottom Row - Compact Stats (icons only) */}
              <HStack spacing={3} w="full" justify="center">
                <Badge
                  fontSize="lg"
                  px={3}
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
                  <Text fontWeight="bold" fontSize="xl">{score}</Text>
                  <Text fontSize="xl">⭐</Text>
                </Badge>
  
                <Button
                  size="sm"
                  colorScheme="yellow"
                  borderRadius="full"
                  boxShadow="md"
                  onClick={() => {
                    openAchievements();
                  }}
                  px={3}
                  py={2}
                  minW="auto"
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                  transition="all 0.3s"
                  title="ההישגים שלי"
                >
                  <Text fontSize="xl">🏆</Text>
                </Button>

                {isAdmin && (
                  <Button
                    size="sm"
                    borderRadius="full"
                    boxShadow="md"
                    onClick={() => setCurrentGame('admin')}
                    px={3}
                    py={2}
                    minW="auto"
                    title="ניהול שאלות"
                  >
                    <Text fontSize="xl">⚙️</Text>
                  </Button>
                )}

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
            </VStack>
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
          authUser={authUser}
          cloudEnabled={cloudEnabled}
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

      {/* Guest Reminder - returning guests are invited to sign up */}
      {showGuestReminder && userData && (
        <AnimatePresence>
          <GuestReminderDialog
            userData={userData}
            score={score}
            onSignup={() => {
              setShowGuestReminder(false);
              onRequestSignup();
            }}
            onLater={() => {
              try {
                sessionStorage.setItem('english_guestReminded', '1');
              } catch {
                // ignore
              }
              setShowGuestReminder(false);
              if (localStorage.getItem('english_hasSeenWelcome')) setShowStatusDialog(true);
            }}
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
                initialTab={achievementsTab}
                onPractice={(id) => {
                  closeAchievements();
                  setCurrentGame(id);
                }}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

export default App;
