// High score management for Math Hopper
// Persists top 10 scores in localStorage

import { HighScoreEntry } from '../types';

const STORAGE_KEY = 'math-hopper-high-scores';
const MAX_ENTRIES = 10;

// Get all high scores from storage
export function getHighScores(): HighScoreEntry[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const scores = JSON.parse(saved) as HighScoreEntry[];
      // Sort by score descending
      return scores.sort((a, b) => b.score - a.score);
    }
  } catch (e) {
    console.error('Failed to load high scores:', e);
  }
  return [];
}

// Save high scores to storage
function saveHighScores(scores: HighScoreEntry[]): void {
  try {
    // Sort and limit to max entries
    const sortedScores = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedScores));
  } catch (e) {
    console.error('Failed to save high scores:', e);
  }
}

// Check if a score qualifies for the high score table
export function isHighScore(score: number): boolean {
  const scores = getHighScores();

  // If we have fewer than MAX_ENTRIES, any score qualifies
  if (scores.length < MAX_ENTRIES) {
    return true;
  }

  // Otherwise, check if this score beats the lowest
  const lowestScore = scores[scores.length - 1]?.score || 0;
  return score > lowestScore;
}

// Add a new high score entry
export function addHighScore(entry: HighScoreEntry): HighScoreEntry[] {
  const scores = getHighScores();
  scores.push(entry);
  saveHighScores(scores);
  return getHighScores();
}

// Get the rank of a score (1-based, 0 if not ranked)
export function getScoreRank(score: number): number {
  const scores = getHighScores();

  // Find where this score would be placed
  for (let i = 0; i < scores.length; i++) {
    if (score >= scores[i].score) {
      return i + 1;
    }
  }

  // If we have room in the table
  if (scores.length < MAX_ENTRIES) {
    return scores.length + 1;
  }

  return 0; // Not ranked
}

// Clear all high scores (for debugging/testing)
export function clearHighScores(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear high scores:', e);
  }
}

// Get formatted date string
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'short',
    });
  } catch (e) {
    return dateString;
  }
}

// Get medal emoji for rank
export function getMedalEmoji(rank: number): string {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return '';
  }
}

// Create a new high score entry
export function createHighScoreEntry(
  name: string,
  score: number,
  level: number
): HighScoreEntry {
  return {
    name: name.trim().slice(0, 20),  // Limit name length
    score,
    level,
    date: new Date().toISOString(),
  };
}

// Default player names in Hebrew
export const DEFAULT_PLAYER_NAMES = [
  'שחקן',      // Player
  'גיבור',     // Hero
  'אלוף',      // Champion
  'כוכב',      // Star
  'חכמולי',    // Smart one
];

// Get a random default name
export function getRandomDefaultName(): string {
  return DEFAULT_PLAYER_NAMES[Math.floor(Math.random() * DEFAULT_PLAYER_NAMES.length)];
}
