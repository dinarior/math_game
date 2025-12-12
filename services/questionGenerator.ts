// Auto-generated Hebrew math questions for Math Hopper
// Supports addition (all levels) and subtraction (level 3+)

import { QUESTION_EMOJIS, SIMPLE_FINGER_EMOJIS, getLevelConfig } from '../config/levels';

export interface GeneratedQuestion {
  id: string;
  question: string;         // Display text with emojis in Hebrew
  options: string[];        // 4 shuffled options
  correctAnswer: string;
  explanation: string;      // Hebrew explanation
  difficulty: number;       // Level number
}

// Question format types
type QuestionFormat = 'numeric' | 'emoji' | 'fingers' | 'mixed';

// Generate a random integer between min and max (inclusive)
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Shuffle an array
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Format a number as repeated emojis (max 5)
function formatAsEmoji(count: number, emoji: string): string {
  if (count === 0) return '0';
  if (count > 5) return String(count); // More than 5 is hard to count, show number
  return emoji.repeat(count);
}

// Format a number as finger emojis (only for 1-5)
function formatAsFingers(count: number): string | null {
  if (count < 1 || count > 5) return null;
  return SIMPLE_FINGER_EMOJIS[count] || null;
}

// Get random emoji for a level theme
function getRandomEmoji(level: number): string {
  const config = getLevelConfig(level);
  const theme = config?.theme || 'jungle';
  const emojis = QUESTION_EMOJIS[theme] || QUESTION_EMOJIS.jungle;
  return emojis[randomInt(0, emojis.length - 1)];
}

// Generate wrong answers that are close to the correct answer
function generateWrongAnswers(correctAnswer: number, maxNumber: number): number[] {
  const wrongs: Set<number> = new Set();

  // Add some nearby numbers
  const offsets = [-3, -2, -1, 1, 2, 3, -5, 5, -10, 10];
  for (const offset of offsets) {
    const candidate = correctAnswer + offset;
    if (candidate >= 0 && candidate <= maxNumber && candidate !== correctAnswer) {
      wrongs.add(candidate);
    }
    if (wrongs.size >= 10) break;
  }

  // Add some random numbers if needed
  while (wrongs.size < 10) {
    const candidate = randomInt(0, Math.min(maxNumber, correctAnswer + 20));
    if (candidate !== correctAnswer) {
      wrongs.add(candidate);
    }
  }

  return Array.from(wrongs);
}

// Generate a numeric question: "5 + 3 = ?"
function generateNumericQuestion(
  num1: number,
  num2: number,
  isSubtraction: boolean
): { questionText: string; explanation: string } {
  const operator = isSubtraction ? '-' : '+';
  const result = isSubtraction ? num1 - num2 : num1 + num2;

  return {
    questionText: `${num1} ${operator} ${num2} = ?`,
    explanation: isSubtraction
      ? `${num1} פחות ${num2} שווה ${result}.`
      : `${num1} ועוד ${num2} שווה ${result}.`,
  };
}

// Generate an emoji question: "🍎🍎🍎 + 🍎🍎 = ?"
function generateEmojiQuestion(
  num1: number,
  num2: number,
  isSubtraction: boolean,
  emoji: string
): { questionText: string; explanation: string } {
  const operator = isSubtraction ? '-' : '+';
  const result = isSubtraction ? num1 - num2 : num1 + num2;

  const emoji1 = formatAsEmoji(num1, emoji);
  const emoji2 = formatAsEmoji(num2, emoji);

  return {
    questionText: `${emoji1} ${operator} ${emoji2} = ?`,
    explanation: isSubtraction
      ? `${num1} פחות ${num2} שווה ${result}.`
      : `${num1} ועוד ${num2} שווה ${result}.`,
  };
}

// Generate a finger question: "✋ + ✌️ = ?"
function generateFingerQuestion(
  num1: number,
  num2: number,
  isSubtraction: boolean
): { questionText: string; explanation: string } | null {
  const finger1 = formatAsFingers(num1);
  const finger2 = formatAsFingers(num2);

  if (!finger1 || !finger2) return null;

  const operator = isSubtraction ? '-' : '+';
  const result = isSubtraction ? num1 - num2 : num1 + num2;

  return {
    questionText: `${finger1} ${operator} ${finger2} = ?`,
    explanation: isSubtraction
      ? `${num1} אצבעות פחות ${num2} אצבעות שווה ${result} אצבעות.`
      : `${num1} אצבעות ועוד ${num2} אצבעות שווה ${result} אצבעות.`,
  };
}

// Generate a mixed question: "4 + 🌟🌟 = ?"
function generateMixedQuestion(
  num1: number,
  num2: number,
  isSubtraction: boolean,
  emoji: string
): { questionText: string; explanation: string } {
  const operator = isSubtraction ? '-' : '+';
  const result = isSubtraction ? num1 - num2 : num1 + num2;

  // Randomly choose which number to show as emoji
  const useEmojiFirst = Math.random() > 0.5;
  const part1 = useEmojiFirst ? formatAsEmoji(num1, emoji) : String(num1);
  const part2 = useEmojiFirst ? String(num2) : formatAsEmoji(num2, emoji);

  return {
    questionText: `${part1} ${operator} ${part2} = ?`,
    explanation: isSubtraction
      ? `${num1} פחות ${num2} שווה ${result}.`
      : `${num1} ועוד ${num2} שווה ${result}.`,
  };
}

// Generate a multi-operand question: "3 + 2 - 1 + 4 = ?"
function generateMultiOperandQuestion(
  numbers: number[],
  operations: ('+' | '-')[],
  format: QuestionFormat,
  emoji: string
): { questionText: string; explanation: string } {
  const result = numbers.reduce((sum, num, idx) => {
    if (idx === 0) return num;
    return operations[idx - 1] === '+' ? sum + num : sum - num;
  }, 0);

  let questionText = '';

  if (format === 'numeric') {
    // Pure numeric: "3 + 2 - 1 = ?"
    questionText = numbers[0].toString();
    for (let i = 0; i < operations.length; i++) {
      questionText += ` ${operations[i]} ${numbers[i + 1]}`;
    }
    questionText += ' = ?';
  } else if (format === 'emoji' && numbers.every(n => n <= 5)) {
    // All emojis: "🦁🦁🦁 + 🦁🦁 - 🦁 = ?"
    questionText = formatAsEmoji(numbers[0], emoji);
    for (let i = 0; i < operations.length; i++) {
      questionText += ` ${operations[i]} ${formatAsEmoji(numbers[i + 1], emoji)}`;
    }
    questionText += ' = ?';
  } else {
    // Mixed or fallback to numeric
    questionText = numbers[0].toString();
    for (let i = 0; i < operations.length; i++) {
      const nextPart = numbers[i + 1] <= 5 && Math.random() > 0.5
        ? formatAsEmoji(numbers[i + 1], emoji)
        : numbers[i + 1].toString();
      questionText += ` ${operations[i]} ${nextPart}`;
    }
    questionText += ' = ?';
  }

  return {
    questionText,
    explanation: `התשובה היא ${result}.`
  };
}

// Main question generator
export function generateQuestion(level: number): GeneratedQuestion {
  const config = getLevelConfig(level);
  if (!config) {
    // Fallback to level 1 if invalid
    return generateQuestion(1);
  }

  const { maxNumber, allowSubtraction } = config.math;

  // Calculate maximum number of operands: increases by 1 every 2 levels starting from level 3
  // Level 1-2: max 2 operands, Level 3-4: max 3 operands, Level 5-6: max 4 operands, etc.
  const maxOperands = Math.floor((level + 1) / 2) + 1;
  // Randomly choose between 2 and max operands (inclusive)
  const numOperands = randomInt(2, maxOperands);

  // For subtraction, use range from 2 levels lower
  const subtractionMaxNumber = level >= 3 ? (level - 2) * 10 : maxNumber;

  // Generate the numbers and operations
  const numbers: number[] = [];
  const operations: ('+' | '-')[] = [];

  // First number
  const maxFirst = Math.min(Math.floor(maxNumber / numOperands), 20);
  numbers.push(randomInt(1, maxFirst));

  let currentResult = numbers[0];

  // Generate remaining numbers and operations
  for (let i = 1; i < numOperands; i++) {
    // Decide operation
    let isSubtraction = false;
    if (allowSubtraction && i >= 1) {
      // Level 3+: can use subtraction
      // Level 4+: can use subtraction in multi-operand expressions
      if (level === 3) {
        // Level 3: only allow subtraction if it's a 2-operand question
        isSubtraction = numOperands === 2 && Math.random() < 0.4;
      } else if (level >= 4) {
        // Level 4+: allow subtraction in multi-operand
        isSubtraction = Math.random() < 0.3;
      }
    }

    let nextNum: number;
    if (isSubtraction) {
      // Use smaller range for subtraction and ensure no negative result
      const maxSub = Math.min(currentResult, subtractionMaxNumber, 15);
      nextNum = randomInt(1, Math.max(1, maxSub));
      currentResult -= nextNum;
    } else {
      // Addition
      const remaining = maxNumber - currentResult;
      const maxNext = Math.min(remaining, Math.floor(maxNumber / numOperands), 20);
      nextNum = randomInt(1, Math.max(1, maxNext));
      currentResult += nextNum;
    }

    numbers.push(nextNum);
    operations.push(isSubtraction ? '-' : '+');
  }

  const result = currentResult;

  // Choose question format
  const formats: QuestionFormat[] = ['numeric'];

  // Only add emoji/mixed if all numbers are 5 or less (easy to count)
  if (numbers.every(n => n <= 5)) {
    formats.push('emoji', 'mixed');
  }

  // Only add finger format if 2 operands and both are 1-5
  if (numOperands === 2 && numbers[0] >= 1 && numbers[0] <= 5 && numbers[1] >= 1 && numbers[1] <= 5) {
    formats.push('fingers');
  }

  const format = formats[randomInt(0, formats.length - 1)];
  const emoji = getRandomEmoji(level);

  let questionData: { questionText: string; explanation: string } | null = null;

  // Generate question based on format
  if (numOperands === 2) {
    // Use existing 2-operand functions
    const isSubtraction = operations[0] === '-';
    switch (format) {
      case 'numeric':
        questionData = generateNumericQuestion(numbers[0], numbers[1], isSubtraction);
        break;
      case 'emoji':
        questionData = generateEmojiQuestion(numbers[0], numbers[1], isSubtraction, emoji);
        break;
      case 'fingers':
        questionData = generateFingerQuestion(numbers[0], numbers[1], isSubtraction);
        if (!questionData) {
          questionData = generateNumericQuestion(numbers[0], numbers[1], isSubtraction);
        }
        break;
      case 'mixed':
        questionData = generateMixedQuestion(numbers[0], numbers[1], isSubtraction, emoji);
        break;
    }
  } else {
    // Multi-operand questions (3+ operands)
    questionData = generateMultiOperandQuestion(numbers, operations, format, emoji);
  }

  if (!questionData) {
    // Fallback to simple numeric
    const questionText = numbers[0] + operations.map((op, i) => ` ${op} ${numbers[i + 1]}`).join('') + ' = ?';
    questionData = {
      questionText,
      explanation: `התשובה היא ${result}.`
    };
  }

  // Generate options (1 correct + 3 wrong)
  const wrongAnswers = generateWrongAnswers(result, maxNumber);
  const selectedWrong = shuffle(wrongAnswers).slice(0, 3);
  const options = shuffle([String(result), ...selectedWrong.map(String)]);

  return {
    id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    question: questionData.questionText,
    options,
    correctAnswer: String(result),
    explanation: questionData.explanation,
    difficulty: level,
  };
}

// Generate multiple questions for a level
export function generateQuestions(level: number, count: number): GeneratedQuestion[] {
  const questions: GeneratedQuestion[] = [];
  for (let i = 0; i < count; i++) {
    questions.push(generateQuestion(level));
  }
  return questions;
}

// Pre-generate a pool of questions for smoother gameplay
export class QuestionPool {
  private pool: GeneratedQuestion[] = [];
  private level: number;
  private minSize: number;

  constructor(level: number, initialSize: number = 10, minSize: number = 5) {
    this.level = level;
    this.minSize = minSize;
    this.refill(initialSize);
  }

  private refill(count: number): void {
    const newQuestions = generateQuestions(this.level, count);
    this.pool.push(...newQuestions);
  }

  getQuestion(): GeneratedQuestion {
    if (this.pool.length <= this.minSize) {
      // Refill in the background
      this.refill(10);
    }

    if (this.pool.length === 0) {
      // Emergency: generate one immediately
      return generateQuestion(this.level);
    }

    return this.pool.shift()!;
  }

  setLevel(level: number): void {
    if (level !== this.level) {
      this.level = level;
      this.pool = []; // Clear old questions
      this.refill(10);
    }
  }

  get size(): number {
    return this.pool.length;
  }
}
