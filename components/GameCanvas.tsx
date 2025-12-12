
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { PlayerState, Platform, Collectible, GameState, Particle, CharacterId } from '../types';
import { ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';
import JungleBackground from './JungleBackground';

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
  restartTrigger: number;
  character: CharacterId;
}

const GRAVITY = 0.6;
const JUMP_FORCE = -14;
const MOVE_SPEED = 5;
const FRICTION = 0.8;

// Initial game state constants
const INITIAL_PLAYER_STATE: PlayerState = {
  x: 50, y: 300, vx: 0, vy: 0, width: 40, height: 50, isGrounded: false, facingRight: true
};

const INITIAL_PLATFORMS: Platform[] = [
  { x: 0, y: 500, width: 2000, height: 1000, type: 'ground' }, // Ground
  { x: 300, y: 350, width: 150, height: 20, type: 'floating' },   // Main level
  { x: 400, y: 220, width: 120, height: 20, type: 'floating' },   // Upper level
  { x: 550, y: 420, width: 150, height: 20, type: 'floating' },   // Lower level
  { x: 800, y: 350, width: 150, height: 20, type: 'floating' },   // Main level
  { x: 850, y: 220, width: 130, height: 20, type: 'floating' },   // Upper level
  { x: 1100, y: 350, width: 200, height: 20, type: 'floating' },  // Main level
  { x: 1400, y: 420, width: 150, height: 20, type: 'floating' },  // Lower level
];

const INITIAL_COLLECTIBLES: Collectible[] = [
  { id: 'c1', x: 350, y: 310, width: 30, height: 30, collected: false, type: 'coin' },    // Main level (350-40)
  { id: 'c2', x: 430, y: 180, width: 30, height: 30, collected: false, type: 'coin' },    // Upper level (220-40)
  { id: 'c3', x: 600, y: 380, width: 30, height: 30, collected: false, type: 'coin' },    // Lower level (420-40)
  { id: 'c4', x: 850, y: 310, width: 30, height: 30, collected: false, type: 'coin' },    // Main level (350-40)
  { id: 'c5', x: 880, y: 180, width: 30, height: 30, collected: false, type: 'coin' },    // Upper level (220-40)
  { id: 'q1', x: 1150, y: 290, width: 50, height: 50, collected: false, type: 'question_block' }, // Main level (350-60)
  { id: 'c6', x: 1450, y: 380, width: 30, height: 30, collected: false, type: 'coin' },    // Lower level (420-40)
];

const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  setGameState,
  onTriggerQuestion,
  onCollectCoin,
  onLevelComplete,
  onGameRestart,
  restartTrigger,
  character
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

  // Procedural generation state
  const lastPlatformXRef = useRef(1550); // Start after initial platforms (updated for new layout)
  const platformIdCounterRef = useRef(8); // Start after initial platforms (now 8 total)
  const collectibleIdCounterRef = useRef(8); // Start after initial collectibles

  // Level Design - Initial platforms with consistent height levels
  const platformsRef = useRef<Platform[]>([...INITIAL_PLATFORMS]);

  const collectiblesRef = useRef<Collectible[]>([...INITIAL_COLLECTIBLES]);

  const particlesRef = useRef<Particle[]>([]);

  // Controls
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // Camera
  const cameraXRef = useRef(0);
  const cameraYRef = useRef(0);

  // Game reset function
  const resetGameState = useCallback(() => {
    // Reset player
    playerRef.current = { ...INITIAL_PLAYER_STATE };

    // Reset camera
    cameraXRef.current = 0;
    cameraYRef.current = 0;

    // Reset platforms
    platformsRef.current = [...INITIAL_PLATFORMS];

    // Reset collectibles
    collectiblesRef.current = [...INITIAL_COLLECTIBLES];

    // Reset procedural generation state
    lastPlatformXRef.current = 1550;
    platformIdCounterRef.current = 8;
    collectibleIdCounterRef.current = 8;

    // Clear particles
    particlesRef.current = [];

    // Reset animation state
    animationFrameRef.current = 0;
    lastAnimTimeRef.current = 0;
  }, []);

  // Reset game when restartTrigger changes (actual restart scenario)
  useEffect(() => {
    if (restartTrigger > 0) {
      resetGameState();
    }
  }, [restartTrigger, resetGameState]);

  // Procedural Generation Functions
  const generatePlatform = useCallback(() => {
    const lastX = lastPlatformXRef.current;
    const maxJumpDistance = 140; // Safe jump distance based on physics
    const minGap = 80;
    const maxGap = maxJumpDistance;

    // Generate main platform with reasonable gap
    let gapSize = minGap + Math.random() * (maxGap - minGap);
    let newX = lastX + gapSize;

    // Fixed platform height levels for consistency
    const MAIN_LEVEL_Y = 350;     // Main platform level
    const UPPER_LEVEL_Y = 220;    // Upper platform level (130px above main)
    const LOWER_LEVEL_Y = 420;    // Lower platform level (70px below main)

    // Randomly choose main platform from available levels
    const levelChoices = [LOWER_LEVEL_Y, MAIN_LEVEL_Y];
    const mainY = levelChoices[Math.floor(Math.random() * levelChoices.length)];
    const width = 120 + Math.random() * 80;

    const mainPlatform: Platform = {
      x: newX,
      y: mainY,
      width: width,
      height: 20,
      type: 'floating'
    };

    platformsRef.current.push(mainPlatform);
    generateCollectiblesOnPlatform(mainPlatform);

    // 40% chance to add upper level platform at fixed height
    if (Math.random() < 0.4) {
      const upperWidth = 100 + Math.random() * 60;
      const upperX = newX + (width - upperWidth) / 2 + (Math.random() - 0.5) * 80; // Slightly offset

      const upperPlatform: Platform = {
        x: upperX,
        y: UPPER_LEVEL_Y, // Fixed upper level height
        width: upperWidth,
        height: 20,
        type: 'floating'
      };

      platformsRef.current.push(upperPlatform);
      generateCollectiblesOnPlatform(upperPlatform);
    }

    // If the gap was large, add intermediate platform at appropriate level
    if (gapSize > 120) {
      const midX = lastX + gapSize * 0.4 + Math.random() * (gapSize * 0.2);
      const midWidth = 100 + Math.random() * 40;
      // Choose intermediate platform level that works with main platform
      const midY = mainY === MAIN_LEVEL_Y ? LOWER_LEVEL_Y : MAIN_LEVEL_Y;

      const intermediatePlatform: Platform = {
        x: midX,
        y: midY,
        width: midWidth,
        height: 20,
        type: 'floating'
      };

      platformsRef.current.push(intermediatePlatform);

      // 60% chance for collectible on intermediate platform
      if (Math.random() < 0.6) {
        generateCollectiblesOnPlatform(intermediatePlatform);
      }
    }

    lastPlatformXRef.current = newX + width;
    platformIdCounterRef.current++;
  }, []);

  const generateCollectiblesOnPlatform = useCallback((platform: Platform) => {
    // 70% chance of coin, 20% chance of question block, 10% chance of nothing
    const rand = Math.random();

    if (rand < 0.7) {
      // Add coin
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
      // Add question block
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
    const cleanupDistance = 1000; // Remove platforms 1000px behind player

    // Remove old platforms
    platformsRef.current = platformsRef.current.filter(platform =>
      platform.type === 'ground' || platform.x + platform.width > playerX - cleanupDistance
    );

    // Remove old collectibles
    collectiblesRef.current = collectiblesRef.current.filter(collectible =>
      collectible.x + collectible.width > playerX - cleanupDistance
    );
  }, []);

  const checkForNewPlatforms = useCallback(() => {
    const playerX = playerRef.current.x;
    const generateDistance = 1500; // Generate platforms when player is within 1500px

    // Generate new platforms ahead of player
    while (lastPlatformXRef.current < playerX + generateDistance) {
      generatePlatform();
    }

    // Cleanup old platforms
    cleanupOldPlatforms();
  }, [generatePlatform, cleanupOldPlatforms]);

  // Load Sprites
  useEffect(() => {
    console.log('Loading character sprites...');

    // Amit sprites
    const amitFrameUrls = [walk1, walk2, walk3, walk4, walk5, walk6];
    // Yuval sprites
    const yuvalFrameUrls = [yuvalWalk1, yuvalWalk2, yuvalWalk3, yuvalWalk4, yuvalWalk5, yuvalWalk6];

    console.log('Amit Sprite URLs:', amitFrameUrls);
    console.log('Yuval Sprite URLs:', yuvalFrameUrls);

    let totalLoaded = 0;
    const totalSprites = 12; // 6 Amit + 6 Yuval

    const amitLoadedImages: HTMLImageElement[] = [];
    const yuvalLoadedImages: HTMLImageElement[] = [];

    // Load Amit sprites
    amitFrameUrls.forEach((url, index) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => {
        console.log(`Amit sprite ${index + 1} loaded successfully:`, url, `Size: ${img.naturalWidth}x${img.naturalHeight}`);
        amitLoadedImages[index] = img;
        totalLoaded++;
        if (totalLoaded === totalSprites) {
          console.log('All character sprites loaded successfully!');
          amitFramesRef.current = amitLoadedImages;
          yuvalFramesRef.current = yuvalLoadedImages;
          setFramesLoaded(true);
        }
      };
      img.onerror = (e) => {
        console.error(`Failed to load Amit sprite ${index + 1}: ${url}`, e);
      };
      amitLoadedImages[index] = img;
    });

    // Load Yuval sprites
    yuvalFrameUrls.forEach((url, index) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => {
        console.log(`Yuval sprite ${index + 1} loaded successfully:`, url, `Size: ${img.naturalWidth}x${img.naturalHeight}`);
        yuvalLoadedImages[index] = img;
        totalLoaded++;
        if (totalLoaded === totalSprites) {
          console.log('All character sprites loaded successfully!');
          amitFramesRef.current = amitLoadedImages;
          yuvalFramesRef.current = yuvalLoadedImages;
          setFramesLoaded(true);
        }
      };
      img.onerror = (e) => {
        console.error(`Failed to load Yuval sprite ${index + 1}: ${url}`, e);
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
      createParticles(playerRef.current.x + 20, playerRef.current.y + 40, '#ffffff', 5);
    }
  }, [createParticles]);

  // --- Rendering Functions ---

  const drawKangaroo = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, facingRight: boolean) => {
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
      
      ctx.fillText('🦘', 0, 0);
      ctx.restore();
  };

  const drawAmit = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, isMoving: boolean, isGrounded: boolean, facingRight: boolean) => {
      // Use loaded sprites if available
      if (framesLoaded && amitFramesRef.current.length === 6) {
          let frameIndex = 0;

          if (!isGrounded) {
              // Jump frame (use 3rd frame as a jump pose - typically legs spread)
              frameIndex = 2;
          } else if (isMoving) {
              // Walk cycle - frame-based timing with correct animation sequence
              const currentTime = Date.now();
              if (currentTime - lastAnimTimeRef.current > 150) { // 150ms per frame
                  animationFrameRef.current = (animationFrameRef.current + 1) % 6;
                  lastAnimTimeRef.current = currentTime;
              }
              // Reverse the frame sequence to fix backwards walking animation
              frameIndex = 5 - animationFrameRef.current;
          } else {
              // Idle - reset animation to first frame
              frameIndex = 0;
              animationFrameRef.current = 0;
              lastAnimTimeRef.current = Date.now();
          }

          const img = amitFramesRef.current[frameIndex];
          if (!img || !img.complete || img.naturalWidth === 0) {
             // Fallback if image failed or not ready
             ctx.fillStyle = '#F472B6';
             ctx.fillRect(x, y, width, height);
             return;
          }

          ctx.save();
          // Center the drawing
          ctx.translate(x + width / 2, y + height / 2);

          if (!facingRight) {
            ctx.scale(-1, 1);
          }

          // Ensure pixel art look
          ctx.imageSmoothingEnabled = false;

          // Simple, stable sprite rendering with proper ground alignment
          const spriteWidth = img.naturalWidth || 120;
          const spriteHeight = img.naturalHeight || 160;

          // Fixed scale that maintains aspect ratio and proper positioning
          const scale = 0.4; // Simple fixed scale

          const renderWidth = spriteWidth * scale;
          const renderHeight = spriteHeight * scale;

          // Move character up by platform height to stand on surface
          const offsetY = -height; // Move up by full collision box height (50px)

          ctx.drawImage(
              img,
              -renderWidth / 2,      // Center horizontally
              -renderHeight / 2 + offsetY,  // Move up to stand on platform surface
              renderWidth,
              renderHeight
          );

          ctx.restore();
          return;
      }

      // Fallback if image not loaded yet
      ctx.fillStyle = '#F472B6';
      ctx.fillRect(x, y, width, height);
  };

  const drawYuval = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, isMoving: boolean, isGrounded: boolean, facingRight: boolean) => {
      // Use loaded sprites if available
      if (framesLoaded && yuvalFramesRef.current.length === 6) {
          let frameIndex = 0;

          if (!isGrounded) {
              // Jump frame (use 3rd frame as a jump pose - typically legs spread)
              frameIndex = 2;
          } else if (isMoving) {
              // Walk cycle - frame-based timing with correct animation sequence
              const currentTime = Date.now();
              if (currentTime - lastAnimTimeRef.current > 150) { // 150ms per frame
                  animationFrameRef.current = (animationFrameRef.current + 1) % 6;
                  lastAnimTimeRef.current = currentTime;
              }
              // Reverse the frame sequence to fix backwards walking animation
              frameIndex = 5 - animationFrameRef.current;
          } else {
              // Idle - reset animation to first frame
              frameIndex = 0;
              animationFrameRef.current = 0;
              lastAnimTimeRef.current = Date.now();
          }

          const img = yuvalFramesRef.current[frameIndex];
          if (!img || !img.complete || img.naturalWidth === 0) {
             // Fallback if image failed or not ready
             ctx.fillStyle = '#A78BFA'; // Purple fallback for Yuval
             ctx.fillRect(x, y, width, height);
             return;
          }

          ctx.save();
          // Center the drawing
          ctx.translate(x + width / 2, y + height / 2);

          if (!facingRight) {
            ctx.scale(-1, 1);
          }

          // Ensure pixel art look
          ctx.imageSmoothingEnabled = false;

          // Simple, stable sprite rendering with proper ground alignment
          const spriteWidth = img.naturalWidth || 120;
          const spriteHeight = img.naturalHeight || 160;

          // Fixed scale that maintains aspect ratio and proper positioning - Yuval is smaller
          const scale = 0.3; // 75% of Amit's scale (0.4 × 0.75 = 0.3)

          const renderWidth = spriteWidth * scale;
          const renderHeight = spriteHeight * scale;

          // Move character up by platform height to stand on surface, adjusted for smaller size
          const offsetY = -height * 0.75; // Smaller offset for smaller character (50px * 0.75 = 37.5px)

          ctx.drawImage(
              img,
              -renderWidth / 2,      // Center horizontally
              -renderHeight / 2 + offsetY,  // Move up to stand on platform surface
              renderWidth,
              renderHeight
          );

          ctx.restore();
          return;
      }

      // Fallback if image not loaded yet
      ctx.fillStyle = '#A78BFA'; // Purple fallback for Yuval
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
          createParticles(player.x + 20, player.y + 40, '#ffffff', 5);
        }
      }

      player.vx *= FRICTION;
      player.vy += GRAVITY;
      player.vx = Math.max(Math.min(player.vx, MOVE_SPEED), -MOVE_SPEED);
      player.x += player.vx;
      player.y += player.vy;

      // 2. Collision Detection
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
        }
      });

      if (player.x < 0) { player.x = 0; player.vx = 0; }
      if (player.y > height + 600) {
        // Trigger restart through parent callback
        onGameRestart();
      }

      collectiblesRef.current.forEach(c => {
        if (!c.collected &&
            player.x < c.x + c.width &&
            player.x + player.width > c.x &&
            player.y < c.y + c.height &&
            player.y + player.height > c.y
        ) {
            if (c.type === 'coin') {
                c.collected = true;
                onCollectCoin();
                createParticles(c.x + 15, c.y + 15, '#FCD34D', 10);
            } else if (c.type === 'question_block') {
                c.collected = true;
                player.vx = 0;
                onTriggerQuestion();
            }
        }
      });

      // Procedural generation - generate new platforms as needed
      checkForNewPlatforms();

      // 3. Camera Update - Infinite scrolling
      const targetCamX = player.x - width / 3;
      cameraXRef.current += (targetCamX - cameraXRef.current) * 0.1;
      // Remove camera X limit for infinite scrolling

      const levelBottom = 600;
      const maxCamY = levelBottom - height;
      let targetCamY = player.y - height * 0.6;
      if (targetCamY > maxCamY) {
          targetCamY = maxCamY;
      }
      cameraYRef.current += (targetCamY - cameraYRef.current) * 0.1;

      // Update camera state for background rendering (throttled to avoid too many re-renders)
      const now = performance.now();
      if (now - lastCameraUpdateRef.current > 50) { // Update every 50ms (20 FPS)
        setCameraState({ x: cameraXRef.current, y: cameraYRef.current });
        lastCameraUpdateRef.current = now;
      }


      // 4. Drawing
      ctx.clearRect(0, 0, width, height);

      // Disable smoothing for pixel art styles
      ctx.imageSmoothingEnabled = false;
      
      ctx.save();
      ctx.translate(-Math.floor(cameraXRef.current), -Math.floor(cameraYRef.current));

      platformsRef.current.forEach(plat => {
        ctx.fillStyle = plat.type === 'ground' ? '#22C55E' : '#4ADE80';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        ctx.fillStyle = '#16A34A'; 
        ctx.fillRect(plat.x, plat.y, plat.width, 10);
      });

      collectiblesRef.current.forEach(c => {
        if (c.collected) return;
        if (c.type === 'coin') {
            ctx.fillStyle = '#FCD34D'; 
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
        } else if (c.type === 'star') {
            ctx.fillStyle = '#FFFF00'; 
            ctx.beginPath();
            const cx = c.x + c.width/2;
            const cy = c.y + c.height/2;
            const spikes = 5;
            const outerRadius = 30;
            const innerRadius = 15;
            let rot = Math.PI / 2 * 3;
            let x = cx;
            let y = cy;
            const step = Math.PI / spikes;
            ctx.moveTo(cx, cy - outerRadius);
            for (let i = 0; i < spikes; i++) {
                x = cx + Math.cos(rot) * outerRadius;
                y = cy + Math.sin(rot) * outerRadius;
                ctx.lineTo(x, y);
                rot += step;
                x = cx + Math.cos(rot) * innerRadius;
                y = cy + Math.sin(rot) * innerRadius;
                ctx.lineTo(x, y);
                rot += step;
            }
            ctx.lineTo(cx, cy - outerRadius);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = 'orange';
            ctx.stroke();
        }
      });

      // --- Draw Player ---
      const isMoving = Math.abs(player.vx) > 0.5;
      if (character === 'AMIT') {
          drawAmit(ctx, player.x, player.y, player.width, player.height, isMoving, player.isGrounded, player.facingRight);
      } else if (character === 'YUVAL') {
          drawYuval(ctx, player.x, player.y, player.width, player.height, isMoving, player.isGrounded, player.facingRight);
      } else {
          drawKangaroo(ctx, player.x, player.y, player.width, player.height, player.facingRight);
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
  }, [gameState, onTriggerQuestion, onCollectCoin, onLevelComplete, createParticles, character, framesLoaded, resetGameState]);

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
    // Initial size check
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

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Jungle Background Layer */}
      <JungleBackground
        cameraX={cameraState.x}
        cameraY={cameraState.y}
        canvasWidth={canvasDimensions.width}
        canvasHeight={canvasDimensions.height}
      />

      <canvas ref={canvasRef} className="block w-full h-full bg-transparent" />
      
      {/* Mobile Controls */}
      <div className="absolute bottom-8 left-8 flex gap-4">
        <button 
          className="w-16 h-16 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white active:bg-white/80 active:scale-95 transition-all shadow-lg"
          onPointerDown={() => handleTouchStart('ArrowLeft')}
          onPointerUp={() => handleTouchEnd('ArrowLeft')}
          onPointerLeave={() => handleTouchEnd('ArrowLeft')}
        >
          <ArrowLeft size={32} className="text-sky-700" />
        </button>
        <button 
          className="w-16 h-16 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white active:bg-white/80 active:scale-95 transition-all shadow-lg"
          onPointerDown={() => handleTouchStart('ArrowRight')}
          onPointerUp={() => handleTouchEnd('ArrowRight')}
          onPointerLeave={() => handleTouchEnd('ArrowRight')}
        >
          <ArrowRight size={32} className="text-sky-700" />
        </button>
      </div>

      <div className="absolute bottom-8 right-8">
        <button 
          className="w-20 h-20 bg-green-400/80 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white active:bg-green-500 active:scale-95 transition-all shadow-lg"
          onPointerDown={() => handleTouchStart('Space')}
          onPointerUp={() => handleTouchEnd('Space')}
          onPointerLeave={() => handleTouchEnd('Space')}
        >
          <ArrowUp size={40} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default GameCanvas;
