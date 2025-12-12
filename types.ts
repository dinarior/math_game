
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED_FOR_QUESTION = 'PAUSED_FOR_QUESTION',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
  COLLECTION_VIEW = 'COLLECTION_VIEW',
  LEVEL_SELECT = 'LEVEL_SELECT',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  HIGH_SCORES = 'HIGH_SCORES'
}

export type CharacterId = 'AMIT' | 'KANGAROO' | 'YUVAL';

export interface MathQuestion {
  question: string;
  options: string[]; // 2-4 options for multiple choice
  correctAnswer: string;
  explanation?: string; // Optional simple explanation
}

export interface CollectionItem {
  id: string;
  emoji: string;
  name: string;
  collected: boolean;
}

export interface LevelTheme {
  id: string;
  name: string;
  items: CollectionItem[];
  requiredItems: number;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number; // Velocity X
  vy: number; // Velocity Y
  width: number;
  height: number;
  isGrounded: boolean;
  facingRight: boolean;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ground' | 'floating';
}

export interface Collectible {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
  type: 'coin' | 'star' | 'question_block';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number; // Frames remaining
}

// Enemy types for the platformer
export interface Enemy {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  emoji: string;           // The emoji to render
  platformId: string;      // ID of platform this enemy patrols
  platformLeft: number;    // Left boundary of patrol
  platformRight: number;   // Right boundary of patrol
  alive: boolean;
  direction: 1 | -1;       // 1 = moving right, -1 = moving left
}

// High score entry
export interface HighScoreEntry {
  name: string;
  score: number;
  level: number;           // Highest level reached
  date: string;            // ISO date string
}

// Moving platform (for level 5+)
export interface MovingPlatform extends Platform {
  isMoving: boolean;
  moveSpeed: number;
  moveRange: number;       // How far left/right it moves
  startX: number;          // Original X position
  direction: 1 | -1;
}

