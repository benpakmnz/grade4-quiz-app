import React from 'react';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import App from './App';

// The grade-4 quiz app with its Chakra provider, loaded as its own chunk
// so the birthday game (see src/party) doesn't pay for it and vice versa.
const QuizRoot = () => (
  <ChakraProvider value={defaultSystem}>
    <App />
  </ChakraProvider>
);

export default QuizRoot;
