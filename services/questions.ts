import { MathQuestion } from '../types';

// Import all question files
const questionFiles = {
  1: () => import('../questions/level1/questions.json'),
  2: () => import('../questions/level2/questions.json'),
  3: () => import('../questions/level3/questions.json'),
  4: () => import('../questions/level4/questions.json'),
  5: () => import('../questions/level5/questions.json'),
};

// Cache for loaded questions
const questionCache: { [key: number]: MathQuestion[] } = {};

/**
 * Load questions for a specific level
 */
async function loadQuestionsForLevel(level: number): Promise<MathQuestion[]> {
  if (questionCache[level]) {
    return questionCache[level];
  }

  try {
    const questionFile = questionFiles[level as keyof typeof questionFiles];
    if (!questionFile) {
      console.warn(`No questions available for level ${level}`);
      return [];
    }

    const module = await questionFile();
    const questions = (module as any).default || module;

    questionCache[level] = questions;
    console.log(`Loaded ${questions.length} questions for level ${level}`);
    return questions;
  } catch (error) {
    console.error(`Failed to load questions for level ${level}:`, error);
    return [];
  }
}

/**
 * Get random questions from a specific level
 */
export async function getMathQuestions(level: number = 1, count: number = 5): Promise<MathQuestion[]> {
  const allQuestions = await loadQuestionsForLevel(level);

  if (allQuestions.length === 0) {
    console.warn(`No questions available for level ${level}`);
    return [];
  }

  // If we need more questions than available, repeat the available ones
  const selectedQuestions: MathQuestion[] = [];
  const availableQuestions = [...allQuestions];

  for (let i = 0; i < count; i++) {
    if (availableQuestions.length === 0) {
      // Reset available questions if we've used them all
      availableQuestions.push(...allQuestions);
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions.splice(randomIndex, 1)[0];
    selectedQuestions.push(selectedQuestion);
  }

  return selectedQuestions;
}

/**
 * Get a single random question from a specific level
 */
export async function getRandomMathQuestion(level: number = 1): Promise<MathQuestion | null> {
  const questions = await getMathQuestions(level, 1);
  return questions.length > 0 ? questions[0] : null;
}

/**
 * Get available levels
 */
export function getAvailableLevels(): number[] {
  return Object.keys(questionFiles).map(Number);
}