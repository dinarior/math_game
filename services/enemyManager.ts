// Enemy management for Math Hopper
// Handles enemy spawning, movement, and collision detection

import { Enemy, Platform, PlayerState } from '../types';
import { getLevelConfig } from '../config/levels';

// Create a new enemy on a platform
export function createEnemy(
  platform: Platform,
  platformId: string,
  level: number
): Enemy | null {
  const config = getLevelConfig(level);
  if (!config) return null;

  // Check spawn chance
  if (Math.random() > config.enemy.spawnChance) {
    return null;
  }

  // Don't spawn on the starting platform (first 300px)
  if (platform.x < 300) {
    return null;
  }

  // Don't spawn on very small platforms
  if (platform.width < 100) {
    return null;
  }

  const enemyWidth = 40;
  const enemyHeight = 40;

  // Position enemy in the middle of the platform
  const x = platform.x + (platform.width - enemyWidth) / 2;
  const y = platform.y - enemyHeight;

  return {
    id: `enemy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    x,
    y,
    width: enemyWidth,
    height: enemyHeight,
    vx: config.enemy.speed * (Math.random() > 0.5 ? 1 : -1),
    emoji: config.enemy.emoji,
    platformId,
    platformLeft: platform.x + 10,  // Small margin from platform edge
    platformRight: platform.x + platform.width - enemyWidth - 10,
    alive: true,
    direction: Math.random() > 0.5 ? 1 : -1,
  };
}

// Update enemy positions (patrol movement)
export function updateEnemies(enemies: Enemy[], level: number): Enemy[] {
  const config = getLevelConfig(level);
  if (!config) return enemies;

  const baseSpeed = config.enemy.speed;

  return enemies.map(enemy => {
    if (!enemy.alive) return enemy;

    let newX = enemy.x + enemy.vx;
    let newDirection = enemy.direction;
    let newVx = enemy.vx;

    // Reverse direction at platform edges
    if (newX <= enemy.platformLeft) {
      newX = enemy.platformLeft;
      newDirection = 1;
      newVx = Math.abs(baseSpeed);
    } else if (newX >= enemy.platformRight) {
      newX = enemy.platformRight;
      newDirection = -1;
      newVx = -Math.abs(baseSpeed);
    }

    return {
      ...enemy,
      x: newX,
      direction: newDirection,
      vx: newVx,
    };
  });
}

// Check collision between player and enemy
// Returns: 'stomp' if player landed on enemy, 'hit' if enemy hit player, null if no collision
export function checkEnemyCollision(
  player: PlayerState,
  enemy: Enemy
): 'stomp' | 'hit' | null {
  if (!enemy.alive) return null;

  // AABB collision detection
  const playerLeft = player.x;
  const playerRight = player.x + player.width;
  const playerTop = player.y;
  const playerBottom = player.y + player.height;

  const enemyLeft = enemy.x;
  const enemyRight = enemy.x + enemy.width;
  const enemyTop = enemy.y;
  const enemyBottom = enemy.y + enemy.height;

  // Check if bounding boxes overlap
  const horizontalOverlap = playerLeft < enemyRight && playerRight > enemyLeft;
  const verticalOverlap = playerTop < enemyBottom && playerBottom > enemyTop;

  if (!horizontalOverlap || !verticalOverlap) {
    return null;
  }

  // Determine if it's a stomp or a hit
  // Stomp: player is falling (vy >= 0) and player's bottom was above enemy's top
  // The player's feet should be in the top 40% of the enemy
  const stompThreshold = enemyTop + enemy.height * 0.4;
  const playerFeet = playerBottom;

  if (player.vy >= 0 && playerFeet <= stompThreshold) {
    // It's a stomp!
    return 'stomp';
  }

  // Otherwise, it's a hit
  return 'hit';
}

// Kill an enemy (when stomped)
export function killEnemy(enemies: Enemy[], enemyId: string): Enemy[] {
  return enemies.map(enemy => {
    if (enemy.id === enemyId) {
      return { ...enemy, alive: false };
    }
    return enemy;
  });
}

// Remove dead enemies and enemies that are off-screen
export function cleanupEnemies(enemies: Enemy[], cameraX: number, canvasWidth: number): Enemy[] {
  const cleanupThreshold = cameraX - canvasWidth;

  return enemies.filter(enemy => {
    // Remove enemies that are too far behind the camera
    if (enemy.x < cleanupThreshold) {
      return false;
    }
    return true;
  });
}

// Get the bounce velocity for when player stomps an enemy
export function getStompBounceVelocity(): number {
  return -10; // Bounce up after stomp
}

// Render enemy to canvas context
// Note: Canvas is already transformed with camera offset, so use world coordinates
export function renderEnemy(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  cameraX: number,
  cameraY: number
): void {
  if (!enemy.alive) return;

  // Draw the enemy emoji at world coordinates (canvas is already camera-transformed)
  ctx.font = `${enemy.height}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Flip the emoji based on direction
  ctx.save();
  if (enemy.direction === -1) {
    ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
    ctx.scale(-1, 1);
    ctx.fillText(enemy.emoji, 0, 0);
  } else {
    ctx.fillText(enemy.emoji, enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
  }
  ctx.restore();
}

// Render enemy death animation (squish effect)
export function renderEnemyDeath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  emoji: string,
  cameraX: number,
  cameraY: number,
  progress: number  // 0 to 1
): void {
  const screenX = x - cameraX;
  const screenY = y - cameraY;

  ctx.save();

  // Squish and fade effect
  const squish = 1 - progress * 0.8;  // Squish down
  const stretch = 1 + progress * 0.5;  // Stretch horizontally
  const alpha = 1 - progress;

  ctx.globalAlpha = alpha;
  ctx.translate(screenX + 20, screenY + 40);
  ctx.scale(stretch, squish);

  ctx.font = '40px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(emoji, 0, 0);

  ctx.restore();
}

// Generate initial enemies for existing platforms
export function generateEnemiesForPlatforms(
  platforms: Platform[],
  level: number
): Enemy[] {
  const enemies: Enemy[] = [];

  platforms.forEach((platform, index) => {
    const platformId = `platform-${index}`;
    const enemy = createEnemy(platform, platformId, level);
    if (enemy) {
      enemies.push(enemy);
    }
  });

  return enemies;
}
