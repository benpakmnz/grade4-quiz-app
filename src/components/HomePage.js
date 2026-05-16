import React from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Button,
  VStack,
} from '@chakra-ui/react';
import './HomePage.css';

const MotionBox = motion(Box);

const HomePage = ({ onSelectGame, score, streak, questionCount, userData, categoryStats, calculateSuccessRate, getGenderText }) => {
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
      id: 'orderOfOperations',
      title: '🧮 סדר פעולות',
      description: 'תרגילי חישוב ארוכים',
      color: 'blue.500',
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
            {getGenderText('בחרי נושא לתרגול', userData?.gender)}
          </Heading>
          <Text fontSize="lg" color="yellow.500" textShadow="2px 2px 4px rgba(0, 0, 0, 0.2)" mb={4}>
            {getGenderText('כל תרגול מקרב אותך להצלחה! 💪', userData?.gender)}
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
                  {/* Success Rate Badge */}
                  <Box
                    position="absolute"
                    top="-10px"
                    right="-10px"
                    bg={calculateSuccessRate(game.id) >= 80 ? 'green.500' : calculateSuccessRate(game.id) >= 60 ? 'yellow.500' : 'red.500'}
                    color="white"
                    borderRadius="full"
                    w="60px"
                    h="60px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontWeight="bold"
                    fontSize="lg"
                    boxShadow="xl"
                    border="3px solid white"
                  >
                    {calculateSuccessRate(game.id)}%
                  </Box>

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
                    {getGenderText('בואי נתחיל! 🚀', userData?.gender)}
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
          mt={8}
          borderRadius="20px"
          textAlign="center"
          maxW="600px"
        >
          <Text color="white" fontSize="md" fontWeight="bold" textShadow="2px 2px 4px rgba(0, 0, 0, 0.2)">
            {getGenderText('💪 את יכולה! כל תרגול מקרב אותך להצלחה!', userData?.gender)}
          </Text>
        </MotionBox>
      </VStack>
      </Container>
      
  );
};

export default HomePage;
