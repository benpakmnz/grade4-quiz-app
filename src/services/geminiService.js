import { wordProblems } from '../data/wordProblems';
import { shapes } from '../data/shapes';
import { measurements } from '../data/measurements';
import { dataAnalysis } from '../data/dataAnalysis';

// Question banks
const questionsBank = {
  wordProblems,
  shapes,
  measurements,
  dataAnalysis
};

// Track which questions were used to avoid repetition
const usedQuestions = {
  wordProblems: new Set(),
  shapes: new Set(),
  measurements: new Set(),
  dataAnalysis: new Set()
};

/**
 * Get a random unused question from the static bank
 */
const getRandomQuestion = (type) => {
  const bank = questionsBank[type];
  if (!bank || bank.length === 0) {
    console.error(`No questions found for type: ${type}`);
    return null;
  }

  // Find unused questions
  const availableIndices = bank
    .map((_, idx) => idx)
    .filter(idx => !usedQuestions[type].has(idx));

  // If all used, reset
  if (availableIndices.length === 0) {
    console.log(`🔄 Resetting ${type} question pool (all ${bank.length} questions used)`);
    usedQuestions[type].clear();
    availableIndices.push(...bank.map((_, idx) => idx));
  }

  // Pick random unused question
  const selectedIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  usedQuestions[type].add(selectedIdx);

  const question = bank[selectedIdx];
  console.log(`✅ Using ${type} question ${selectedIdx + 1}/${bank.length} (${usedQuestions[type].size} used)`);

  return question;
};

/**
 * Generate word problems for grade 4
 */
export const generateWordProblem = async () => {
  return getRandomQuestion('wordProblems');
};

/**
 * Generate data analysis question (tables, charts)
 */
export const generateDataAnalysisQuestion = async () => {
  return getRandomQuestion('dataAnalysis');
};

/**
 * Generate shapes question
 */
export const generateShapesQuestion = async () => {
  return getRandomQuestion('shapes');
};

/**
 * Generate measurements question
 */
export const generateMeasurementsQuestion = async () => {
  return getRandomQuestion('measurements');
};
