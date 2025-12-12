
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED_FOR_QUESTION = 'PAUSED_FOR_QUESTION',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
  COLLECTION_VIEW = 'COLLECTION_VIEW'
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
