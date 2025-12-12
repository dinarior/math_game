// Level state management for Math Hopper
// Handles level progression, unlocks, scores, and persistence

import { LEVEL_CONFIGS, getLevelConfig, type LevelConfig } from '../config/levels';

const STORAGE_KEY = 'math-hopper-level-state';

export interface LevelProgress {
  levelId: number;
  unlocked: boolean;
  completed: boolean;
  bestScore: number;
  stars: number;  // 0-3 stars based on lives remaining
  collectiblesEarned: string[];  // Emojis collected in this level
}

export interface LevelState {
  currentLevel: number;
  currentScore: number;
  currentLives: number;
  currentCollectibles: number;  // Count of collectibles in current run
  levelProgress: Record<number, LevelProgress>;
  totalScore: number;
}

const DEFAULT_LIVES = 3;
const COLLECTIBLES_PER_LEVEL = 20;

// Create default state
function createDefaultState(): LevelState {
  const levelProgress: Record<number, LevelProgress> = {};

  LEVEL_CONFIGS.forEach((config) => {
    levelProgress[config.id] = {
      levelId: config.id,
      unlocked: config.id === 1,  // Only level 1 starts unlocked
      completed: false,
      bestScore: 0,
      stars: 0,
      collectiblesEarned: [],
    };
  });

  return {
    currentLevel: 1,
    currentScore: 0,
    currentLives: DEFAULT_LIVES,
    currentCollectibles: 0,
    levelProgress,
    totalScore: 0,
  };
}

// Load state from localStorage
export function loadLevelState(): LevelState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as LevelState;
      // Ensure all levels exist in progress (in case new levels were added)
      LEVEL_CONFIGS.forEach((config) => {
        if (!parsed.levelProgress[config.id]) {
          parsed.levelProgress[config.id] = {
            levelId: config.id,
            unlocked: config.id === 1,
            completed: false,
            bestScore: 0,
            stars: 0,
            collectiblesEarned: [],
          };
        }
      });
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load level state:', e);
  }
  return createDefaultState();
}

// Save state to localStorage
export function saveLevelState(state: LevelState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save level state:', e);
  }
}

// Start a new game at a specific level
export function startLevel(state: LevelState, levelId: number): LevelState {
  const config = getLevelConfig(levelId);
  if (!config || !state.levelProgress[levelId]?.unlocked) {
    // Level doesn't exist or isn't unlocked, start level 1
    return startLevel(state, 1);
  }

  return {
    ...state,
    currentLevel: levelId,
    currentScore: 0,
    currentLives: DEFAULT_LIVES,
    currentCollectibles: 0,
  };
}

// Award a collectible for correct answer
export function awardCollectible(state: LevelState): {
  state: LevelState;
  collectible: string;
  levelComplete: boolean;
} {
  const config = getLevelConfig(state.currentLevel);
  if (!config) {
    return { state, collectible: '', levelComplete: false };
  }

  const newCollectibles = state.currentCollectibles + 1;
  const newScore = state.currentScore + 50;  // 50 points per correct answer

  // Pick a random collectible emoji from the level's theme
  const collectibleIndex = (state.currentCollectibles) % config.collectibles.length;
  const collectible = config.collectibles[collectibleIndex];

  const levelComplete = newCollectibles >= config.requiredCollectibles;

  const newState: LevelState = {
    ...state,
    currentCollectibles: newCollectibles,
    currentScore: newScore,
  };

  return {
    state: newState,
    collectible,
    levelComplete,
  };
}

// Handle coin collection (from platform coins)
export function collectCoin(state: LevelState): LevelState {
  return {
    ...state,
    currentScore: state.currentScore + 10,
  };
}

// Handle enemy stomp
export function stompEnemy(state: LevelState): LevelState {
  return {
    ...state,
    currentScore: state.currentScore + 25,
  };
}

// Lose a life (from enemy collision or falling)
export function loseLife(state: LevelState): {
  state: LevelState;
  gameOver: boolean;
} {
  const newLives = state.currentLives - 1;
  const gameOver = newLives <= 0;

  return {
    state: {
      ...state,
      currentLives: newLives,
    },
    gameOver,
  };
}

// Complete the current level
export function completeLevel(state: LevelState): LevelState {
  const currentProgress = state.levelProgress[state.currentLevel];
  const config = getLevelConfig(state.currentLevel);

  if (!currentProgress || !config) {
    return state;
  }

  // Calculate stars based on lives remaining
  const stars = state.currentLives;  // 3 lives = 3 stars, 2 = 2, 1 = 1

  // Update best score if this run was better
  const newBestScore = Math.max(currentProgress.bestScore, state.currentScore);
  const newStars = Math.max(currentProgress.stars, stars);

  // Collect earned collectibles
  const newCollectiblesEarned = [...new Set([
    ...currentProgress.collectiblesEarned,
    ...config.collectibles.slice(0, state.currentCollectibles),
  ])];

  // Update level progress
  const newProgress: LevelProgress = {
    ...currentProgress,
    completed: true,
    bestScore: newBestScore,
    stars: newStars,
    collectiblesEarned: newCollectiblesEarned,
  };

  // Unlock next level
  const nextLevelId = state.currentLevel + 1;
  const nextProgress = state.levelProgress[nextLevelId];
  let updatedNextProgress = nextProgress;
  if (nextProgress && !nextProgress.unlocked) {
    updatedNextProgress = {
      ...nextProgress,
      unlocked: true,
    };
  }

  const newLevelProgress = {
    ...state.levelProgress,
    [state.currentLevel]: newProgress,
  };

  if (updatedNextProgress && nextLevelId <= 10) {
    newLevelProgress[nextLevelId] = updatedNextProgress;
  }

  const newTotalScore = state.totalScore + state.currentScore;

  const newState: LevelState = {
    ...state,
    levelProgress: newLevelProgress,
    totalScore: newTotalScore,
  };

  // Save progress
  saveLevelState(newState);

  return newState;
}

// Game over - save state but don't complete level
export function handleGameOver(state: LevelState): LevelState {
  // Could save partial progress here if desired
  // For now, just save the overall state
  saveLevelState(state);
  return state;
}

// Get the current level config
export function getCurrentLevelConfig(state: LevelState): LevelConfig | undefined {
  return getLevelConfig(state.currentLevel);
}

// Get all unlocked levels
export function getUnlockedLevels(state: LevelState): LevelConfig[] {
  return LEVEL_CONFIGS.filter(
    (config) => state.levelProgress[config.id]?.unlocked
  );
}

// Get completion percentage for a level
export function getLevelCompletionPercent(state: LevelState): number {
  const config = getLevelConfig(state.currentLevel);
  if (!config) return 0;
  return Math.min(100, (state.currentCollectibles / config.requiredCollectibles) * 100);
}

// Get total stars earned across all levels
export function getTotalStars(state: LevelState): number {
  return Object.values(state.levelProgress).reduce(
    (sum, progress) => sum + progress.stars,
    0
  );
}

// Get maximum possible stars
export function getMaxStars(): number {
  return LEVEL_CONFIGS.length * 3;  // 3 stars per level
}

// Reset all progress (for debugging or user request)
export function resetAllProgress(): LevelState {
  const state = createDefaultState();
  saveLevelState(state);
  return state;
}
