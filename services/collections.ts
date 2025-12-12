import { LevelTheme, CollectionItem } from '../types';

// Jungle theme animal collection
export const JUNGLE_THEME: LevelTheme = {
  id: 'jungle',
  name: 'Jungle Animals',
  requiredItems: 20,
  items: [
    { id: 'lion', emoji: '🦁', name: 'Lion', collected: false },
    { id: 'tiger', emoji: '🐅', name: 'Tiger', collected: false },
    { id: 'elephant', emoji: '🐘', name: 'Elephant', collected: false },
    { id: 'monkey', emoji: '🐵', name: 'Monkey', collected: false },
    { id: 'gorilla', emoji: '🦍', name: 'Gorilla', collected: false },
    { id: 'giraffe', emoji: '🦒', name: 'Giraffe', collected: false },
    { id: 'zebra', emoji: '🦓', name: 'Zebra', collected: false },
    { id: 'rhino', emoji: '🦏', name: 'Rhinoceros', collected: false },
    { id: 'hippo', emoji: '🦛', name: 'Hippopotamus', collected: false },
    { id: 'crocodile', emoji: '🐊', name: 'Crocodile', collected: false },
    { id: 'snake', emoji: '🐍', name: 'Snake', collected: false },
    { id: 'parrot', emoji: '🦜', name: 'Parrot', collected: false },
    { id: 'toucan', emoji: '🪶', name: 'Toucan', collected: false },
    { id: 'leopard', emoji: '🐆', name: 'Leopard', collected: false },
    { id: 'cheetah', emoji: '🐱', name: 'Wild Cat', collected: false },
    { id: 'panda', emoji: '🐼', name: 'Panda', collected: false },
    { id: 'sloth', emoji: '🦥', name: 'Sloth', collected: false },
    { id: 'orangutan', emoji: '🦧', name: 'Orangutan', collected: false },
    { id: 'butterfly', emoji: '🦋', name: 'Butterfly', collected: false },
    { id: 'frog', emoji: '🐸', name: 'Frog', collected: false },
  ]
};

const STORAGE_KEY = 'math-hopper-collections';

export interface CollectionProgress {
  currentTheme: string;
  themes: { [themeId: string]: string[] }; // themeId -> collected item ids
}

// Load collection progress from localStorage
export function loadCollectionProgress(): CollectionProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load collection progress:', error);
  }

  return {
    currentTheme: 'jungle',
    themes: {
      jungle: []
    }
  };
}

// Save collection progress to localStorage
export function saveCollectionProgress(progress: CollectionProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.warn('Failed to save collection progress:', error);
  }
}

// Get current theme with collected items marked
export function getCurrentTheme(): LevelTheme {
  const progress = loadCollectionProgress();
  const collectedIds = progress.themes[progress.currentTheme] || [];

  return {
    ...JUNGLE_THEME,
    items: JUNGLE_THEME.items.map(item => ({
      ...item,
      collected: collectedIds.includes(item.id)
    }))
  };
}

// Collect a random uncollected item from current theme
export function collectRandomItem(): CollectionItem | null {
  const progress = loadCollectionProgress();
  const collectedIds = progress.themes[progress.currentTheme] || [];

  const uncollectedItems = JUNGLE_THEME.items.filter(
    item => !collectedIds.includes(item.id)
  );

  if (uncollectedItems.length === 0) {
    return null; // All items collected
  }

  // Pick random uncollected item
  const randomItem = uncollectedItems[Math.floor(Math.random() * uncollectedItems.length)];

  // Add to collected items
  const updatedProgress = {
    ...progress,
    themes: {
      ...progress.themes,
      [progress.currentTheme]: [...collectedIds, randomItem.id]
    }
  };

  saveCollectionProgress(updatedProgress);

  return {
    ...randomItem,
    collected: true
  };
}

// Check if current theme is complete
export function isThemeComplete(): boolean {
  const progress = loadCollectionProgress();
  const collectedIds = progress.themes[progress.currentTheme] || [];
  return collectedIds.length >= JUNGLE_THEME.requiredItems;
}

// Get collection statistics
export function getCollectionStats(): { collected: number; total: number; percentage: number } {
  const progress = loadCollectionProgress();
  const collectedIds = progress.themes[progress.currentTheme] || [];
  const collected = collectedIds.length;
  const total = JUNGLE_THEME.requiredItems;

  return {
    collected,
    total,
    percentage: Math.round((collected / total) * 100)
  };
}

// Reset collection progress for current theme
export function resetCollectionProgress(): void {
  const progress = loadCollectionProgress();

  const updatedProgress = {
    ...progress,
    themes: {
      ...progress.themes,
      [progress.currentTheme]: []
    }
  };

  saveCollectionProgress(updatedProgress);
}