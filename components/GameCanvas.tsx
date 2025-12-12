
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { PlayerState, Platform, Collectible, GameState, Particle, CharacterId, Enemy } from '../types';
import { ArrowUp, Volume2, VolumeX } from 'lucide-react';
import ThemedBackground from './ThemedBackground';
import LivesDisplay from './LivesDisplay';
import VirtualJoystick from './VirtualJoystick';
import { getLevelConfig } from '../config/levels';
import {
  createEnemy,
  updateEnemies,
  checkEnemyCollision,
  killEnemy,
  cleanupEnemies,
  getStompBounceVelocity,
  renderEnemy
} from '../services/enemyManager';
import soundManager from '../services/soundManager';

// Use URL constructor for asset resolution to avoid module resolution issues
// Amit sprites
const walk1 = new URL('../sprites/amit/amit_walk_01.png', import.meta.url).href;
const walk2 = new URL('../sprites/amit/amit_walk_02.png', import.meta.url).href;
const walk3 = new URL('../sprites/amit/amit_walk_03.png', import.meta.url).href;
const walk4 = new URL('../sprites/amit/amit_walk_04.png', import.meta.url).href;
const walk5 = new URL('../sprites/amit/amit_walk_05.png', import.meta.url).href;
const walk6 = new URL('../sprites/amit/amit_walk_06.png', import.meta.url).href;

// Yuval sprites
const yuvalWalk1 = new URL('../sprites/yuval/yuval_walk_01.png', import.meta.url).href;
const yuvalWalk2 = new URL('../sprites/yuval/yuval_walk_02.png', import.meta.url).href;
const yuvalWalk3 = new URL('../sprites/yuval/yuval_walk_03.png', import.meta.url).href;
const yuvalWalk4 = new URL('../sprites/yuval/yuval_walk_04.png', import.meta.url).href;
const yuvalWalk5 = new URL('../sprites/yuval/yuval_walk_05.png', import.meta.url).href;
const yuvalWalk6 = new URL('../sprites/yuval/yuval_walk_06.png', import.meta.url).href;

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  onTriggerQuestion: () => void;
  onCollectCoin: () => void;
  onLevelComplete: () => void;
  onGameRestart: () => void;
  onLoseLife: () => void;
  onStompEnemy: () => void;
  restartTrigger: number;
  character: CharacterId;
  level: number;
  lives: number;
  collectiblesCount: number;
  score: number;
}

const GRAVITY = 0.6;
const JUMP_FORCE = -14;
const MOVE_SPEED = 5;
const FRICTION = 0.8;

// Initial game state constants
const INITIAL_PLAYER_STATE: PlayerState = {
  x: 50, y: 300, vx: 0, vy: 0, width: 40, height: 50, isGrounded: false, facingRight: true
};

// Create initial platforms based on level difficulty
function createInitialPlatforms(level: number): Platform[] {
  const config = getLevelConfig(level);
  const minWidth = config?.difficulty.platformWidthMin || 150;
  const maxWidth = config?.difficulty.platformWidthMax || 250;

  return [
    { x: 0, y: 500, width: 2000, height: 1000, type: 'ground' }, // Ground
    { x: 300, y: 350, width: minWidth + Math.random() * (maxWidth - minWidth), height: 20, type: 'floating' },
    { x: 400, y: 220, width: minWidth + Math.random() * (maxWidth - minWidth) * 0.8, height: 20, type: 'floating' },
    { x: 550, y: 420, width: minWidth + Math.random() * (maxWidth - minWidth), height: 20, type: 'floating' },
    { x: 800, y: 350, width: minWidth + Math.random() * (maxWidth - minWidth), height: 20, type: 'floating' },
    { x: 850, y: 220, width: minWidth + Math.random() * (maxWidth - minWidth) * 0.8, height: 20, type: 'floating' },
    { x: 1100, y: 350, width: minWidth + Math.random() * (maxWidth - minWidth), height: 20, type: 'floating' },
    { x: 1400, y: 420, width: minWidth + Math.random() * (maxWidth - minWidth), height: 20, type: 'floating' },
  ];
}

const INITIAL_COLLECTIBLES: Collectible[] = [
  { id: 'c1', x: 350, y: 310, width: 30, height: 30, collected: false, type: 'coin' },
  { id: 'c2', x: 430, y: 180, width: 30, height: 30, collected: false, type: 'coin' },
  { id: 'c3', x: 600, y: 380, width: 30, height: 30, collected: false, type: 'coin' },
  { id: 'c4', x: 850, y: 310, width: 30, height: 30, collected: false, type: 'coin' },
  { id: 'c5', x: 880, y: 180, width: 30, height: 30, collected: false, type: 'coin' },
  { id: 'q1', x: 1150, y: 290, width: 50, height: 50, collected: false, type: 'question_block' },
  { id: 'c6', x: 1450, y: 380, width: 30, height: 30, collected: false, type: 'coin' },
];

const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  setGameState,
  onTriggerQuestion,
  onCollectCoin,
  onLevelComplete,
  onGameRestart,
  onLoseLife,
  onStompEnemy,
  restartTrigger,
  character,
  level,
  lives,
  collectiblesCount,
  score
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animation Frames
  const amitFramesRef = useRef<HTMLImageElement[]>([]);
  const yuvalFramesRef = useRef<HTMLImageElement[]>([]);
  const [framesLoaded, setFramesLoaded] = useState(false);
  const animationFrameRef = useRef(0);
  const lastAnimTimeRef = useRef(0);

  // Canvas dimensions for background rendering
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 });

  // Camera state for background rendering (reactive to trigger re-renders)
  const [cameraState, setCameraState] = useState({ x: 0, y: 0 });
  const lastCameraUpdateRef = useRef(0);

  // Game State Refs (Mutable for performance)
  const playerRef = useRef<PlayerState>({ ...INITIAL_PLAYER_STATE });

  // Enemies
  const enemiesRef = useRef<Enemy[]>([]);

  // Invincibility frames after taking damage
  const invincibilityRef = useRef(0);
  const INVINCIBILITY_DURATION = 120; // 2 seconds at 60fps

  // Last safe platform for respawn
  const lastSafePlatformRef = useRef({ x: 50, y: 450 });

  // Procedural generation state
  const lastPlatformXRef = useRef(1550);
  const platformIdCounterRef = useRef(8);
  const collectibleIdCounterRef = useRef(8);

  // Level Design
  const platformsRef = useRef<Platform[]>(createInitialPlatforms(level));
  const collectiblesRef = useRef<Collectible[]>([...INITIAL_COLLECTIBLES]);
  const particlesRef = useRef<Particle[]>([]);

  // Controls
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // Camera
  const cameraXRef = useRef(0);
  const cameraYRef = useRef(0);

  // Sound mute state
  const [isMuted, setIsMuted] = useState(soundManager.isMuted());

  // Get level config
  const levelConfig = getLevelConfig(level);

  // Game reset function
  const resetGameState = useCallback(() => {
    // Reset player
    playerRef.current = { ...INITIAL_PLAYER_STATE };

    // Reset camera
    cameraXRef.current = 0;
    cameraYRef.current = 0;

    // Reset platforms with level-specific difficulty
    platformsRef.current = createInitialPlatforms(level);

    // Reset collectibles
    collectiblesRef.current = [...INITIAL_COLLECTIBLES];

    // Reset enemies
    enemiesRef.current = [];

    // Reset procedural generation state
    lastPlatformXRef.current = 1550;
    platformIdCounterRef.current = 8;
    collectibleIdCounterRef.current = 8;

    // Clear particles
    particlesRef.current = [];

    // Reset invincibility
    invincibilityRef.current = 0;

    // Reset last safe platform
    lastSafePlatformRef.current = { x: 50, y: 450 };

    // Reset animation state
    animationFrameRef.current = 0;
    lastAnimTimeRef.current = 0;
  }, [level]);

  // Reset game when restartTrigger changes (actual restart scenario)
  useEffect(() => {
    if (restartTrigger > 0) {
      resetGameState();
    }
  }, [restartTrigger, resetGameState]);

  // Procedural Generation Functions
  const generatePlatform = useCallback(() => {
    const lastX = lastPlatformXRef.current;
    const config = getLevelConfig(level);

    const minGap = config?.difficulty.gapMin || 80;
    const maxGap = config?.difficulty.gapMax || 140;
    const minWidth = config?.difficulty.platformWidthMin || 100;
    const maxWidth = config?.difficulty.platformWidthMax || 200;

    let gapSize = minGap + Math.random() * (maxGap - minGap);
    let newX = lastX + gapSize;

    const MAIN_LEVEL_Y = 350;
    const UPPER_LEVEL_Y = 220;
    const LOWER_LEVEL_Y = 420;

    const levelChoices = [LOWER_LEVEL_Y, MAIN_LEVEL_Y];
    const mainY = levelChoices[Math.floor(Math.random() * levelChoices.length)];
    const width = minWidth + Math.random() * (maxWidth - minWidth);

    const mainPlatform: Platform = {
      x: newX,
      y: mainY,
      width: width,
      height: 20,
      type: 'floating'
    };

    platformsRef.current.push(mainPlatform);
    generateCollectiblesOnPlatform(mainPlatform);

    // Generate enemy on platform
    const platformId = `platform-${platformIdCounterRef.current}`;
    const enemy = createEnemy(mainPlatform, platformId, level);
    if (enemy) {
      enemiesRef.current.push(enemy);
    }

    // 40% chance to add upper level platform
    if (Math.random() < 0.4) {
      const upperWidth = minWidth * 0.8 + Math.random() * (maxWidth - minWidth) * 0.6;
      const upperX = newX + (width - upperWidth) / 2 + (Math.random() - 0.5) * 80;

      const upperPlatform: Platform = {
        x: upperX,
        y: UPPER_LEVEL_Y,
        width: upperWidth,
        height: 20,
        type: 'floating'
      };

      platformsRef.current.push(upperPlatform);
      generateCollectiblesOnPlatform(upperPlatform);
    }

    // If the gap was large, add intermediate platform
    if (gapSize > (minGap + maxGap) / 2) {
      const midX = lastX + gapSize * 0.4 + Math.random() * (gapSize * 0.2);
      const midWidth = minWidth + Math.random() * (maxWidth - minWidth) * 0.5;
      const midY = mainY === MAIN_LEVEL_Y ? LOWER_LEVEL_Y : MAIN_LEVEL_Y;

      const intermediatePlatform: Platform = {
        x: midX,
        y: midY,
        width: midWidth,
        height: 20,
        type: 'floating'
      };

      platformsRef.current.push(intermediatePlatform);

      if (Math.random() < 0.6) {
        generateCollectiblesOnPlatform(intermediatePlatform);
      }
    }

    lastPlatformXRef.current = newX + width;
    platformIdCounterRef.current++;
  }, [level]);

  const generateCollectiblesOnPlatform = useCallback((platform: Platform) => {
    const rand = Math.random();

    if (rand < 0.7) {
      collectiblesRef.current.push({
        id: `c${collectibleIdCounterRef.current}`,
        x: platform.x + platform.width / 2 - 15,
        y: platform.y - 40,
        width: 30,
        height: 30,
        collected: false,
        type: 'coin'
      });
      collectibleIdCounterRef.current++;
    } else if (rand < 0.9) {
      collectiblesRef.current.push({
        id: `q${collectibleIdCounterRef.current}`,
        x: platform.x + platform.width / 2 - 25,
        y: platform.y - 60,
        width: 50,
        height: 50,
        collected: false,
        type: 'question_block'
      });
      collectibleIdCounterRef.current++;
    }
  }, []);

  const cleanupOldPlatforms = useCallback(() => {
    const playerX = playerRef.current.x;
    const cleanupDistance = 1000;

    platformsRef.current = platformsRef.current.filter(platform =>
      platform.type === 'ground' || platform.x + platform.width > playerX - cleanupDistance
    );

    collectiblesRef.current = collectiblesRef.current.filter(collectible =>
      collectible.x + collectible.width > playerX - cleanupDistance
    );

    // Cleanup enemies
    enemiesRef.current = cleanupEnemies(enemiesRef.current, cameraXRef.current, canvasDimensions.width);
  }, [canvasDimensions.width]);

  const checkForNewPlatforms = useCallback(() => {
    const playerX = playerRef.current.x;
    const generateDistance = 1500;

    while (lastPlatformXRef.current < playerX + generateDistance) {
      generatePlatform();
    }

    cleanupOldPlatforms();
  }, [generatePlatform, cleanupOldPlatforms]);

  // Load Sprites
  useEffect(() => {
    console.log('Loading character sprites...');

    const amitFrameUrls = [walk1, walk2, walk3, walk4, walk5, walk6];
    const yuvalFrameUrls = [yuvalWalk1, yuvalWalk2, yuvalWalk3, yuvalWalk4, yuvalWalk5, yuvalWalk6];

    let totalLoaded = 0;
    const totalSprites = 12;

    const amitLoadedImages: HTMLImageElement[] = [];
    const yuvalLoadedImages: HTMLImageElement[] = [];

    amitFrameUrls.forEach((url, index) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => {
        amitLoadedImages[index] = img;
        totalLoaded++;
        if (totalLoaded === totalSprites) {
          amitFramesRef.current = amitLoadedImages;
          yuvalFramesRef.current = yuvalLoadedImages;
          setFramesLoaded(true);
        }
      };
      img.onerror = () => {
        console.error(`Failed to load Amit sprite ${index + 1}`);
      };
      amitLoadedImages[index] = img;
    });

    yuvalFrameUrls.forEach((url, index) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => {
        yuvalLoadedImages[index] = img;
        totalLoaded++;
        if (totalLoaded === totalSprites) {
          amitFramesRef.current = amitLoadedImages;
          yuvalFramesRef.current = yuvalLoadedImages;
          setFramesLoaded(true);
        }
      };
      img.onerror = () => {
        console.error(`Failed to load Yuval sprite ${index + 1}`);
      };
      yuvalLoadedImages[index] = img;
    });
  }, []);

  // Helper for particles
  const createParticles = useCallback((x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x, y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 30 + Math.random() * 20,
        color
      });
    }
  }, []);

  // --- Input Handling ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.code] = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const jump = useCallback(() => {
    if (playerRef.current.isGrounded) {
      playerRef.current.vy = JUMP_FORCE;
      playerRef.current.isGrounded = false;
      soundManager.play('jump');
      createParticles(playerRef.current.x + 20, playerRef.current.y + 40, '#ffffff', 5);
    }
  }, [createParticles]);

  // Toggle mute
  const toggleMute = () => {
    const newMuted = soundManager.toggleMute();
    setIsMuted(newMuted);
  };

  // --- Rendering Functions ---

  const drawKangaroo = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, facingRight: boolean, flash: boolean) => {
    if (flash) return; // Skip drawing during flash
    ctx.save();
    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const centerX = x + width / 2;
    const centerY = y + height / 2;

    ctx.translate(centerX, centerY);

    if (facingRight) {
      ctx.scale(-1, 1);
    }

    ctx.fillText('\u{1F998}', 0, 0);
    ctx.restore();
  };

  const drawAmit = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, isMoving: boolean, isGrounded: boolean, facingRight: boolean, flash: boolean) => {
    if (flash) return; // Skip drawing during flash

    if (framesLoaded && amitFramesRef.current.length === 6) {
      let frameIndex = 0;

      if (!isGrounded) {
        frameIndex = 2;
      } else if (isMoving) {
        const currentTime = Date.now();
        if (currentTime - lastAnimTimeRef.current > 150) {
          animationFrameRef.current = (animationFrameRef.current + 1) % 6;
          lastAnimTimeRef.current = currentTime;
        }
        frameIndex = 5 - animationFrameRef.current;
      } else {
        frameIndex = 0;
        animationFrameRef.current = 0;
        lastAnimTimeRef.current = Date.now();
      }

      const img = amitFramesRef.current[frameIndex];
      if (!img || !img.complete || img.naturalWidth === 0) {
        ctx.fillStyle = '#F472B6';
        ctx.fillRect(x, y, width, height);
        return;
      }

      ctx.save();
      ctx.translate(x + width / 2, y + height / 2);

      if (!facingRight) {
        ctx.scale(-1, 1);
      }

      ctx.imageSmoothingEnabled = false;

      const spriteWidth = img.naturalWidth || 120;
      const spriteHeight = img.naturalHeight || 160;
      const scale = 0.4;
      const renderWidth = spriteWidth * scale;
      const renderHeight = spriteHeight * scale;
      const offsetY = -height;

      ctx.drawImage(img, -renderWidth / 2, -renderHeight / 2 + offsetY, renderWidth, renderHeight);
      ctx.restore();
      return;
    }

    ctx.fillStyle = '#F472B6';
    ctx.fillRect(x, y, width, height);
  };

  const drawYuval = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, isMoving: boolean, isGrounded: boolean, facingRight: boolean, flash: boolean) => {
    if (flash) return; // Skip drawing during flash

    if (framesLoaded && yuvalFramesRef.current.length === 6) {
      let frameIndex = 0;

      if (!isGrounded) {
        frameIndex = 2;
      } else if (isMoving) {
        const currentTime = Date.now();
        if (currentTime - lastAnimTimeRef.current > 150) {
          animationFrameRef.current = (animationFrameRef.current + 1) % 6;
          lastAnimTimeRef.current = currentTime;
        }
        frameIndex = 5 - animationFrameRef.current;
      } else {
        frameIndex = 0;
        animationFrameRef.current = 0;
        lastAnimTimeRef.current = Date.now();
      }

      const img = yuvalFramesRef.current[frameIndex];
      if (!img || !img.complete || img.naturalWidth === 0) {
        ctx.fillStyle = '#A78BFA';
        ctx.fillRect(x, y, width, height);
        return;
      }

      ctx.save();
      ctx.translate(x + width / 2, y + height / 2);

      if (!facingRight) {
        ctx.scale(-1, 1);
      }

      ctx.imageSmoothingEnabled = false;

      const spriteWidth = img.naturalWidth || 120;
      const spriteHeight = img.naturalHeight || 160;
      const scale = 0.3;
      const renderWidth = spriteWidth * scale;
      const renderHeight = spriteHeight * scale;
      const offsetY = -height * 0.75;

      ctx.drawImage(img, -renderWidth / 2, -renderHeight / 2 + offsetY, renderWidth, renderHeight);
      ctx.restore();
      return;
    }

    ctx.fillStyle = '#A78BFA';
    ctx.fillRect(x, y, width, height);
  };

  // --- Game Loop ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const loop = () => {
      if (gameState !== GameState.PLAYING) {
        animationFrameId = requestAnimationFrame(loop);
        return;
      }

      const player = playerRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Update invincibility
      if (invincibilityRef.current > 0) {
        invincibilityRef.current--;
      }

      // 1. Physics Update
      if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) {
        player.vx += 1;
        player.facingRight = true;
      }
      if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) {
        player.vx -= 1;
        player.facingRight = false;
      }
      if (keysRef.current['Space'] || keysRef.current['ArrowUp'] || keysRef.current['KeyW']) {
        if (player.isGrounded) {
          player.vy = JUMP_FORCE;
          player.isGrounded = false;
          soundManager.play('jump');
          createParticles(player.x + 20, player.y + 40, '#ffffff', 5);
        }
      }

      player.vx *= FRICTION;
      player.vy += GRAVITY;
      player.vx = Math.max(Math.min(player.vx, MOVE_SPEED), -MOVE_SPEED);
      player.x += player.vx;
      player.y += player.vy;

      // 2. Platform Collision Detection
      player.isGrounded = false;
      platformsRef.current.forEach(plat => {
        if (
          player.x + player.width > plat.x &&
          player.x < plat.x + plat.width &&
          player.y + player.height > plat.y &&
          player.y + player.height < plat.y + plat.height + 20 &&
          player.vy >= 0
        ) {
          player.isGrounded = true;
          player.vy = 0;
          player.y = plat.y - player.height;

          // Update last safe platform
          if (plat.type !== 'ground') {
            lastSafePlatformRef.current = { x: plat.x + plat.width / 2 - 20, y: plat.y - player.height };
          }
        }
      });

      if (player.x < 0) { player.x = 0; player.vx = 0; }

      // Fall death - lose life instead of instant restart
      if (player.y > height + 600) {
        if (invincibilityRef.current <= 0) {
          soundManager.play('loseLife');
          onLoseLife();
          // Respawn at last safe platform
          player.x = lastSafePlatformRef.current.x;
          player.y = lastSafePlatformRef.current.y;
          player.vx = 0;
          player.vy = 0;
          invincibilityRef.current = INVINCIBILITY_DURATION;
        }
      }

      // 3. Enemy collision detection
      enemiesRef.current = updateEnemies(enemiesRef.current, level);

      if (invincibilityRef.current <= 0) {
        for (const enemy of enemiesRef.current) {
          const collision = checkEnemyCollision(player, enemy);

          if (collision === 'stomp') {
            // Player stomped enemy
            enemiesRef.current = killEnemy(enemiesRef.current, enemy.id);
            player.vy = getStompBounceVelocity();
            soundManager.play('enemyStomp');
            onStompEnemy();
            createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#FF0000', 10);
            break;
          } else if (collision === 'hit') {
            // Enemy hit player
            soundManager.play('loseLife');
            onLoseLife();
            // Bounce player back
            player.vx = enemy.x > player.x ? -8 : 8;
            player.vy = -5;
            invincibilityRef.current = INVINCIBILITY_DURATION;
            createParticles(player.x + player.width / 2, player.y + player.height / 2, '#FF6666', 8);
            break;
          }
        }
      }

      // 4. Collectible collision
      collectiblesRef.current.forEach(c => {
        if (!c.collected &&
            player.x < c.x + c.width &&
            player.x + player.width > c.x &&
            player.y < c.y + c.height &&
            player.y + player.height > c.y
        ) {
          if (c.type === 'coin') {
            c.collected = true;
            soundManager.play('coin');
            onCollectCoin();
            createParticles(c.x + 15, c.y + 15, levelConfig?.colors.accent || '#FCD34D', 10);
          } else if (c.type === 'question_block') {
            c.collected = true;
            player.vx = 0;
            soundManager.play('questionBlock');
            onTriggerQuestion();
          }
        }
      });

      // Procedural generation
      checkForNewPlatforms();

      // 5. Camera Update
      const targetCamX = player.x - width / 3;
      cameraXRef.current += (targetCamX - cameraXRef.current) * 0.1;

      const levelBottom = 600;
      const maxCamY = levelBottom - height;
      let targetCamY = player.y - height * 0.6;
      if (targetCamY > maxCamY) {
        targetCamY = maxCamY;
      }
      cameraYRef.current += (targetCamY - cameraYRef.current) * 0.1;

      const now = performance.now();
      if (now - lastCameraUpdateRef.current > 50) {
        setCameraState({ x: cameraXRef.current, y: cameraYRef.current });
        lastCameraUpdateRef.current = now;
      }

      // 6. Drawing
      ctx.clearRect(0, 0, width, height);
      ctx.imageSmoothingEnabled = false;

      ctx.save();
      ctx.translate(-Math.floor(cameraXRef.current), -Math.floor(cameraYRef.current));

      // Draw platforms with level-themed colors
      const platformColor = levelConfig?.colors.platform || '#4ADE80';
      const platformTopColor = levelConfig?.colors.platformTop || '#16A34A';
      const groundColor = levelConfig?.colors.ground || '#22C55E';
      const groundTopColor = levelConfig?.colors.groundTop || '#16A34A';

      platformsRef.current.forEach(plat => {
        ctx.fillStyle = plat.type === 'ground' ? groundColor : platformColor;
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        ctx.fillStyle = plat.type === 'ground' ? groundTopColor : platformTopColor;
        ctx.fillRect(plat.x, plat.y, plat.width, 10);
      });

      // Draw collectibles
      collectiblesRef.current.forEach(c => {
        if (c.collected) return;
        if (c.type === 'coin') {
          ctx.fillStyle = levelConfig?.colors.accent || '#FCD34D';
          ctx.beginPath();
          ctx.arc(c.x + c.width/2, c.y + c.height/2, c.width/2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = '#F59E0B';
          ctx.font = 'bold 20px sans-serif';
          ctx.fillText('$', c.x + 10, c.y + 22);
        } else if (c.type === 'question_block') {
          ctx.fillStyle = '#F472B6';
          ctx.fillRect(c.x, c.y, c.width, c.height);
          ctx.fillStyle = 'white';
          ctx.font = 'bold 30px sans-serif';
          ctx.fillText('?', c.x + 15, c.y + 35);
          ctx.strokeStyle = '#DB2777';
          ctx.lineWidth = 3;
          ctx.strokeRect(c.x, c.y, c.width, c.height);
        }
      });

      // Draw enemies
      enemiesRef.current.forEach(enemy => {
        if (enemy.alive) {
          renderEnemy(ctx, enemy, cameraXRef.current, cameraYRef.current);
        }
      });

      // --- Draw Player ---
      const isMoving = Math.abs(player.vx) > 0.5;
      // Flash effect during invincibility
      const shouldFlash = invincibilityRef.current > 0 && Math.floor(invincibilityRef.current / 8) % 2 === 0;

      if (character === 'AMIT') {
        drawAmit(ctx, player.x, player.y, player.width, player.height, isMoving, player.isGrounded, player.facingRight, shouldFlash);
      } else if (character === 'YUVAL') {
        drawYuval(ctx, player.x, player.y, player.width, player.height, isMoving, player.isGrounded, player.facingRight, shouldFlash);
      } else {
        drawKangaroo(ctx, player.x, player.y, player.width, player.height, player.facingRight, shouldFlash);
      }

      // Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 30;
        ctx.fillRect(p.x, p.y, 4, 4);
        ctx.globalAlpha = 1.0;
        if (p.life <= 0) particlesRef.current.splice(i, 1);
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, onTriggerQuestion, onCollectCoin, onLevelComplete, onLoseLife, onStompEnemy, createParticles, character, framesLoaded, level, levelConfig, checkForNewPlatforms]);

  // Handle resizing
  useEffect(() => {
    let frameId: number;
    const handleResize = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        if (containerRef.current && canvasRef.current) {
          const { clientWidth, clientHeight } = containerRef.current;
          if (clientWidth > 0 && clientHeight > 0) {
            if (canvasRef.current.width !== clientWidth || canvasRef.current.height !== clientHeight) {
              canvasRef.current.width = clientWidth;
              canvasRef.current.height = clientHeight;
              setCanvasDimensions({ width: clientWidth, height: clientHeight });
            }
          }
        }
      });
    };
    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, []);

  const handleTouchStart = (key: string) => {
    keysRef.current[key] = true;
    if (key === 'Space') jump();
  };
  const handleTouchEnd = (key: string) => {
    keysRef.current[key] = false;
  };

  // Joystick handler
  const handleJoystickMove = useCallback((direction: 'left' | 'right' | 'neutral') => {
    keysRef.current['ArrowLeft'] = direction === 'left';
    keysRef.current['ArrowRight'] = direction === 'right';
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Themed Background Layer */}
      <ThemedBackground
        cameraX={cameraState.x}
        cameraY={cameraState.y}
        canvasWidth={canvasDimensions.width}
        canvasHeight={canvasDimensions.height}
        level={level}
      />

      <canvas ref={canvasRef} className="block w-full h-full bg-transparent" />

      {/* HUD - Top Left: Score and Level */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
        <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2 text-white">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-xl">$</span>
            <span className="font-bold text-lg">{score}</span>
          </div>
        </div>
        <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2 text-white min-w-[120px]">
          <div className="text-sm font-bold text-center">
            {levelConfig?.nameHebrew || `Level ${level}`}
          </div>
        </div>
      </div>

      {/* HUD - Top Right: Lives and Mute */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
        <LivesDisplay lives={lives} />
        <button
          onClick={toggleMute}
          className="bg-black/40 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/60 transition-colors"
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
      </div>

      {/* Themed Collection Progress - Shows which emojis have been collected */}
      <div className="absolute top-28 left-4 right-4 max-w-md z-10">
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-2">
          <div className="grid grid-cols-10 gap-1">
            {levelConfig?.collectibles.slice(0, 10).map((emoji, idx) => (
              <div
                key={idx}
                className={`
                  aspect-square rounded-md flex items-center justify-center text-sm
                  transition-all duration-300
                  ${idx < collectiblesCount
                    ? 'bg-green-400/80 scale-100'
                    : 'bg-gray-600/50 scale-90 opacity-40'
                  }
                `}
              >
                <span className={idx < collectiblesCount ? 'grayscale-0' : 'grayscale'}>
                  {emoji}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Controls */}
      <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 lg:bottom-16 lg:left-16 z-20">
        <div className="scale-100 md:scale-110 lg:scale-125">
          <VirtualJoystick onMove={handleJoystickMove} size={140} />
        </div>
      </div>

      <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 lg:bottom-16 lg:right-16 z-20">
        <button
          className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-green-400/80 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white active:bg-green-500 active:scale-95 transition-all shadow-lg"
          onPointerDown={() => handleTouchStart('Space')}
          onPointerUp={() => handleTouchEnd('Space')}
          onPointerLeave={() => handleTouchEnd('Space')}
        >
          <ArrowUp size={48} className="text-white md:w-14 md:h-14 lg:w-16 lg:h-16" />
        </button>
      </div>
    </div>
  );
};

export default GameCanvas;
