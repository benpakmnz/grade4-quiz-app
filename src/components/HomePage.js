import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Button,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import './HomePage.css';
import Achievements from './Achievements';

const MotionBox = motion(Box);

const HomePage = ({ onSelectGame, score, streak, questionCount, userData }) => {
  const { isOpen: showAchievements, onOpen: openAchievements, onClose: closeAchievements } = useDisclosure();

  // חישוב ימים עד למבחן
  const games = [
    {
      id: 'addSubtract',
      title: '➕➖ חיבור וחיסור',
      description: 'חיבור וחיסור בתחום הרבבה',
      color: 'pink.500',
      emoji: '🧮'
    },
    {
      id: 'multiplyDivide',
      title: '✖️➗ כפל וחילוק',
      description: 'כפל וחילוק עד 12',
      color: 'purple.500',
      emoji: '🔢'
    },
    {
      id: 'decimalStructure',
      title: '🔟 מבנה עשרוני',
      description: 'ערך ספרות במספרים עד 10,000',
      color: 'cyan.500',
      emoji: '💯'
    },
    {
      id: 'wordProblems',
      title: '📝 בעיות מילוליות',
      description: 'חד-שלביות ודו-שלביות',
      color: 'yellow.600',
      emoji: '🤔'
    },
    {
      id: 'dataAnalysis',
      title: '📊 חקר נתונים',
      description: 'קריאת טבלאות וניתוח נתונים',
      color: 'green.500',
      emoji: '📈'
    },
    {
      id: 'shapes',
      title: '🔷 צורות הנדסיות',
      description: 'זיהוי וסיווג צורות',
      color: 'orange.500',
      emoji: '📐'
    },
    {
      id: 'measurements',
      title: '📏 מדידות',
      description: 'אורך, משקל ונפח',
      color: 'teal.500',
      emoji: '⚖️'
    }
  ];

  return (
         <Container maxW="container.xl" pt="120px" pb={20}>
      <VStack spacing={6}>
        {/* Header */}
        <MotionBox
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          textAlign="center"
          w="full"
          maxW="800px"
        >
          <Heading
            size="xl"
            color="white"
            textShadow="3px 3px 6px rgba(0, 0, 0, 0.3)"
            mb={2}
          >
            בחרי נושא לתרגול
          </Heading>
          <Text fontSize="lg" color="yellow.500" textShadow="2px 2px 4px rgba(0, 0, 0, 0.2)" mb={4}>
            כל תרגול מקרב אותך להצלחה! 💪
          </Text>
        </MotionBox>

        {/* Games Grid */}
        <Box w="full" maxW="1600px" pt={4}>
          <SimpleGrid 
            columns={{ base: 1, sm: 2, md: 2, lg: 4 }} 
            spacing={0}
            w="full"
            gap="20px"
          >
            {games.map((game, index) => (
              <MotionBox
                key={game.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Box
                  bg="white"
                  borderRadius="50px"
                  p={6}
                  textAlign="center"
                  boxShadow="2xl"
                  cursor="pointer"
                  border="5px solid"
                  borderColor={game.color}
                  position="relative"
                  onClick={() => onSelectGame(game.id)}
                  _hover={{
                    transform: 'translateY(-5px)',
                    boxShadow: '2xl',
                  }}
                  transition="all 0.3s"
                  aspectRatio="1"
                  w="100%"
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                >
                  <VStack spacing={2}>
                    <Text fontSize="5xl" className="game-emoji">
                      {game.emoji}
                    </Text>
                    
                    <Heading size="md" color="gray.800">
                      {game.title}
                    </Heading>
                    
                    <Text color="gray.600" fontSize="sm" lineHeight="1.4">
                      {game.description}
                    </Text>
                  </VStack>
                  
                  <Button
                    colorScheme={game.color.split('.')[0]}
                    size="md"
                    borderRadius="full"
                    boxShadow="lg"
                    px={6}
                    py={2}
                    mt={3}
                    _hover={{ transform: 'translateY(-3px)', boxShadow: 'xl' }}
                  >
                    בואי נתחיל! 🚀
                  </Button>
                </Box>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Box>

        {/* Motivational Message */}
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          bg="whiteAlpha.200"
          backdropFilter="blur(10px)"
          px={5}
          py={3}
          borderRadius="20px"
          textAlign="center"
          maxW="600px"
        >
          <Text color="white" fontSize="md" fontWeight="bold" textShadow="2px 2px 4px rgba(0, 0, 0, 0.2)">
            💪 את יכולה! כל תרגול מקרב אותך להצלחה!
          </Text>
        </MotionBox>
      </VStack>

      {/* Achievements Modal */}
      <AnimatePresence>
        {showAchievements && (
          <>
            <motion.div
              className="achievements-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAchievements}
            />
            <Achievements
              score={score}
              streak={streak}
              questionCount={questionCount}
              onClose={closeAchievements}
            />
          </>
        )}
      </AnimatePresence>
      </Container>
      
  );
};

export default HomePage;
