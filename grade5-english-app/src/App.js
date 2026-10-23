import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import WelcomeScreen from './components/WelcomeScreen';
import HomePage from './components/HomePage';
import QuizGame from './components/QuizGame';
import PassageGame from './components/PassageGame';
import WritingGame from './components/WritingGame';
import MathGame from './components/MathGame';
import { generateHebrewQuestion } from './data/hebrewQuestions';
import SubjectHub from './components/SubjectHub';
import HamburgerMenu from './components/HamburgerMenu';
import AdminPanel from './components/AdminPanel';
import BackgroundElements from './components/BackgroundElements';
import Achievements from './components/Achievements';
import ProfileEditDialog from './components/ProfileEditDialog';
import WelcomeDialog from './components/WelcomeDialog';
import StatusDialog from './components/StatusDialog';
import GuestReminderDialog from './components/GuestReminderDialog';
import EscapeRoom, { EscapeRoomBoundary } from './components/EscapeRoom';
import { readRoomParam, escapeRoomAvailable, readEscapeStats } from './data/escapeRoom';
import EscapeHistoryDialog from './components/EscapeHistory';
import FxLayer from './components/FxLayer';
import { watchInvites } from './services/rooms';
import { getGenderText } from './utils/genderText';
import { TARGET_PER_CATEGORY } from './data/categories';
import {
  SUBJECTS, SUBJECT_IDS, allCategories, findCategory, readSubject, saveSubject, getDaysUntilSubjectExam, examCountdownText, availableSubjects
} from './data/subjects';
import { notifyLocalChange } from './services/cloudSync';
import { emailToUsername } from './utils/username';
import {
  Box,
  Text,
  HStack,
  VStack,
  Badge,
} from '@chakra-ui/react';

const HEBREW_PRAISES = ['כל הכבוד! 🌟', 'מעולה! את אלופה! 🚀', 'נכון מאוד! ⭐', 'יפה מאוד! 🏆', 'מצוין! 🎉'];

const getEmptyCategoryStats = () =>
  allCategories.reduce((acc, cat) => {
    acc[cat.id] = { correct: 0, total: 0 };
    return acc;
  }, {});

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
  // המקצוע שנבחר בדף הבית (אנגלית / חשבון)
  const allowedSubjects = availableSubjects(isAdmin);
  const [chosenSubject, setSubject] = useState(() => readSubject(undefined, allowedSubjects));
  // מי שאין לו גישה לחשבון (עדיין) - תמיד אנגלית
  const subject = allowedSubjects.includes(chosenSubject) ? chosenSubject : 'english';
  // כולם מתחילים בדף הבחירה (אנגלית / חשבון). מקצוע שעוד לא פתוח למשתמש/ת מוצג אפור עם "בקרוב"
  const hasHub = SUBJECT_IDS.length > 1;
  // קישור הזמנה לחדר בריחה (?room=123456) - נכנסים ישר לחדר
  const [roomInvite] = useState(() => readRoomParam());
  const escapeOn = escapeRoomAvailable(isAdmin) || Boolean(roomInvite);
  const startPage = roomInvite ? 'escape' : hasHub ? 'hub' : 'home';
  const homePage = hasHub ? 'hub' : 'home';
  // מפתח בכותרת: כמה אתגרים בוצעו, ולחיצה פותחת את הרשימה
  const [escapeStats, setEscapeStats] = useState(() => readEscapeStats());
  const [showChallenges, setShowChallenges] = useState(false);
  // כל כניסה לאתגר (מהתפריט, מדף הבחירה או מהמפתח) פותחת אותו מחדש - גם כשכבר נמצאים בו.
  // אתגר שנגמר כבר לא נזכר, אז נפתח דף הכניסה; אתגר באמצע - חוזרים אליו
  const [escapeVisit, setEscapeVisit] = useState(0);
  const openEscape = () => {
    setEscapeVisit(v => v + 1);
    setCurrentGame('escape');
  };
  // הזמנות לאתגר חדש מחברים לצוות (מופיע בדף הבחירה)
  const [inviteCount, setInviteCount] = useState(0);
  useEffect(() => {
    if (!escapeOn || !authUser || !cloudEnabled) return undefined;
    return watchInvites(authUser.uid, (all) => {
      const fresh = Object.values(all).filter(inv => inv && Date.now() - (inv.t || 0) < 6 * 3600000);
      setInviteCount(fresh.length);
    });
  }, [escapeOn, authUser, cloudEnabled]);
  const [lastSubject] = useState(() => {
    try {
      return localStorage.getItem('english_subject');
    } catch {
      return null;
    }
  });

  // בחירת מקצוע בדף הבחירה. מסך "איפה את עומדת" נפתח פעם אחת בכל כניסה לכל מקצוע
  const pickSubject = (id) => {
    if (!allowedSubjects.includes(id)) return;
    changeSubject(id);
    setCurrentGame('home');
    let shown = true;
    try {
      shown = sessionStorage.getItem(`english_statusShown_${id}`) === '1';
      sessionStorage.setItem(`english_statusShown_${id}`, '1');
    } catch {
      // ignore
    }
    if (!shown && localStorage.getItem('english_hasSeenWelcome')) {
      setTimeout(() => setShowStatusDialog(true), 450);
    }
  };
  const changeSubject = (id) => {
    if (!allowedSubjects.includes(id)) return;
    setSubject(id);
    saveSubject(id);
  };
  
  // כניסה לנושא - וגם מעבר למקצוע שלו (כדי שהחזרה לדף הבית תהיה למקצוע הנכון)
  const startGame = (id) => {
    const cat = findCategory(id);
    if (cat && !allowedSubjects.includes(cat.subject)) return;
    if (cat && cat.subject !== subject) changeSubject(cat.subject);
    setCurrentGame(id);
  };

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

  const daysUntilExam = getDaysUntilSubjectExam(subject);
  const examBadgeText = `${SUBJECTS[subject].emoji} המבחן בעוד:`;

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
      setCurrentGame(startPage);
      
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
      } else if (hasSeenWelcome && !hasHub) {
        // Small delay to let the UI render first (עם דף בחירה - המסך נפתח אחרי בחירת המקצוע)
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

  // כל מעבר מסך מתחיל מראש העמוד (אחרת בטלפון נשארים גלולים באמצע, למשל אחרי מסך הפתיחה)
  useEffect(() => {
    window.scrollTo(0, 0);
    setEscapeStats(readEscapeStats()); // אחרי סנכרון מהענן או אתגר שהסתיים
  }, [currentGame]);

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
    setCurrentGame(startPage);
    
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
    if (currentGame === 'hub' && hasHub) {
      return (
        <SubjectHub
          subjects={SUBJECT_IDS}
          enabled={allowedSubjects}
          userData={userData}
          categoryStats={categoryStats}
          lastSubject={lastSubject}
          onPick={pickSubject}
          onEscapeRoom={escapeOn ? openEscape : null}
          escapeInvites={inviteCount}
        />
      );
    }
    if (currentGame === 'home' || currentGame === 'hub') {
      return <HomePage
        onSelectGame={(id) => (id === 'myProgress' ? openAchievements('progress') : startGame(id))}
        subject={subject}
        onOpenHub={hasHub ? () => setCurrentGame('hub') : null}
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

    if (currentGame === 'escape' && escapeOn) {
      return (
        <EscapeRoomBoundary onExit={() => setCurrentGame(homePage)}>
        <EscapeRoom
          key={escapeVisit}
          authUser={authUser}
          userData={userData}
          categoryStats={categoryStats}
          subjects={allowedSubjects}
          defaultSubject={subject}
          initialCode={escapeVisit === 0 ? roomInvite : null}
          onExit={() => setCurrentGame(homePage)}
          onAnswer={(topic, ok) => updateCategoryStats(topic, ok)}
          onReward={(points) => setScore(s => s + points)}
          onSignUp={onRequestSignup}
          onFinished={() => setEscapeStats(readEscapeStats())}
        />
        </EscapeRoomBoundary>
      );
    }

    if (currentGame === 'admin' && isAdmin) {
      return <AdminPanel onBack={() => setCurrentGame('home')} />;
    }

    const category = findCategory(currentGame);
    if (!category || !allowedSubjects.includes(category.subject)) return null;

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

    if (category.subject === 'math') {
      return <MathGame {...gameProps} />;
    }
    if (category.subject === 'hebrew') {
      return <MathGame {...gameProps} generate={generateHebrewQuestion} praises={HEBREW_PRAISES} />;
    }
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
      <FxLayer />

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
          {userData && (
            <HamburgerMenu
              userData={userData}
              authUser={authUser}
              isGuest={isGuest}
              cloudEnabled={cloudEnabled}
              isAdmin={isAdmin}
              subjects={SUBJECT_IDS}
              enabled={allowedSubjects}
              subject={currentGame === 'hub' ? null : subject}
              onPickSubject={pickSubject}
              onOpenHub={hasHub ? () => setCurrentGame('hub') : null}
              onAchievements={() => openAchievements('overview')}
              onProgress={() => openAchievements('progress')}
              onEditProfile={openProfileEdit}
              onAdmin={() => setCurrentGame('admin')}
              onEscapeRoom={escapeOn ? openEscape : null}
              onSignUp={onRequestSignup}
            />
          )}
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
                <HStack spacing={2} style={{ marginRight: 48 }}>
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
                  <motion.span key={score} className="score-bump" initial={{ scale: 1.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 12 }}>
                    <Text as="span" fontWeight="bold" fontSize="lg">{score}</Text>
                  </motion.span>
                  <Text fontSize="lg">⭐</Text>
                </Badge>
                {streak >= 3 && (
                  <motion.span
                    key={`streak-${streak}`}
                    className="streak-pill"
                    dir="ltr"
                    title="רצף תשובות נכונות"
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                  >
                    🔥 {streak}
                  </motion.span>
                )}
                {escapeStats.played > 0 && (
                  <button
                    className="key-badge"
                    onClick={() => setShowChallenges(true)}
                    aria-label={`האתגרים שלי: ${escapeStats.played}`}
                    title="האתגרים שלי"
                  >
                    🗝️<i>{escapeStats.played}</i>
                  </button>
                )}
  


                {/* Exam Countdown */}
                {currentGame !== 'hub' && daysUntilExam >= 0 && (
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
                  <Text fontWeight="bold">{examBadgeText}</Text>
                  <Text fontWeight="bold" fontSize="md">
                    {examCountdownText(daysUntilExam)}
                  </Text>
                </Badge>
                )}
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
                <HStack spacing={2} w="full" justify="center" px="52px">
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
                  <motion.span key={score} className="score-bump" initial={{ scale: 1.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 12 }}>
                    <Text as="span" fontWeight="bold" fontSize="xl">{score}</Text>
                  </motion.span>
                  <Text fontSize="xl">⭐</Text>
                </Badge>
                {streak >= 3 && (
                  <motion.span
                    key={`streak-${streak}`}
                    className="streak-pill"
                    dir="ltr"
                    title="רצף תשובות נכונות"
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                  >
                    🔥 {streak}
                  </motion.span>
                )}
                {escapeStats.played > 0 && (
                  <button
                    className="key-badge"
                    onClick={() => setShowChallenges(true)}
                    aria-label={`האתגרים שלי: ${escapeStats.played}`}
                    title="האתגרים שלי"
                  >
                    🗝️<i>{escapeStats.played}</i>
                  </button>
                )}
  


                {/* Exam Countdown - Compact */}
                {currentGame !== 'hub' && daysUntilExam >= 0 && (
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
                  <Text fontWeight="bold">{examBadgeText}</Text>
                  <Text fontWeight="bold" fontSize="md">
                    {examCountdownText(daysUntilExam)}
                  </Text>
                </Badge>
                )}
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}
  
      <AnimatePresence mode="wait">
        <motion.div
          key={currentGame}
          // בחדר הבריחה התוכן מעל כוכבי הרקע (שלא יסתירו כפתורים)
          style={currentGame === 'escape' ? { position: 'relative', zIndex: 2 } : undefined}
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
            subjects={allowedSubjects}
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
              if (localStorage.getItem('english_hasSeenWelcome') && !hasHub) setShowStatusDialog(true);
            }}
          />
        </AnimatePresence>
      )}

      {/* האתגרים שבוצעו (מהמפתח בכותרת) */}
      <AnimatePresence>
        {showChallenges && (
          <EscapeHistoryDialog
            stats={escapeStats}
            onClose={() => setShowChallenges(false)}
            onNew={escapeOn ? () => { setShowChallenges(false); openEscape(); } : null}
          />
        )}
      </AnimatePresence>

      {/* Status Dialog - On App Reload */}
      {showStatusDialog && userData && (
        <AnimatePresence>
          <StatusDialog
            userData={userData}
            categoryStats={categoryStats}
            subject={subject}
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
                subject={subject}
                subjects={allowedSubjects}
                initialTab={achievementsTab}
                onPractice={(id) => {
                  closeAchievements();
                  startGame(id);
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
