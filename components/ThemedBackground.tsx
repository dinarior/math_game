import React, { useMemo } from 'react';
import { getLevelConfig } from '../config/levels';

interface ThemedBackgroundProps {
  cameraX: number;
  cameraY: number;
  canvasWidth: number;
  canvasHeight: number;
  level: number;
}

// Theme-specific colors
const THEME_COLORS: Record<string, {
  skyGradient: [string, string, string];
  cloudColor: string;
  groundColor: string;
}> = {
  jungle: {
    skyGradient: ['#87CEEB', '#98D8E8', '#B0E0E6'],
    cloudColor: 'white',
    groundColor: '#228B22',
  },
  ocean: {
    skyGradient: ['#006994', '#1E90FF', '#40E0D0'],
    cloudColor: '#E0FFFF',
    groundColor: '#1E90FF',
  },
  desert: {
    skyGradient: ['#FFD700', '#FFA500', '#FF8C00'],
    cloudColor: '#FFF8DC',
    groundColor: '#D2691E',
  },
  arctic: {
    skyGradient: ['#E0FFFF', '#B0E0E6', '#87CEEB'],
    cloudColor: 'white',
    groundColor: '#F0FFFF',
  },
  space: {
    skyGradient: ['#000033', '#191970', '#2F2F4F'],
    cloudColor: '#4B0082',
    groundColor: '#2F2F4F',
  },
  candy: {
    skyGradient: ['#FFB6C1', '#FF69B4', '#DDA0DD'],
    cloudColor: '#FFFACD',
    groundColor: '#FF69B4',
  },
  volcano: {
    skyGradient: ['#8B0000', '#FF4500', '#FF6347'],
    cloudColor: '#696969',
    groundColor: '#2F1810',
  },
  sky: {
    skyGradient: ['#87CEEB', '#ADD8E6', '#FFFFFF'],
    cloudColor: 'white',
    groundColor: '#F0F8FF',
  },
  forest: {
    skyGradient: ['#2E0854', '#9932CC', '#DDA0DD'],
    cloudColor: '#E6E6FA',
    groundColor: '#228B22',
  },
  treasure: {
    skyGradient: ['#87CEEB', '#FFD700', '#FFA500'],
    cloudColor: 'white',
    groundColor: '#DEB887',
  },
};

// Generic Cloud Component
const Cloud: React.FC<{ x: number; y: number; scale?: number; opacity?: number; color?: string }> = ({
  x, y, scale = 1, opacity = 0.8, color = 'white'
}) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
    <circle cx="30" cy="30" r="20" fill={color} />
    <circle cx="50" cy="35" r="25" fill={color} />
    <circle cx="70" cy="30" r="18" fill={color} />
    <circle cx="85" cy="25" r="15" fill={color} />
    <circle cx="15" cy="25" r="12" fill={color} />
  </g>
);

// Star for space theme
const Star: React.FC<{ x: number; y: number; size?: number }> = ({ x, y, size = 3 }) => (
  <circle cx={x} cy={y} r={size} fill="white" opacity={0.8 + Math.random() * 0.2} />
);

// Jungle Tree
const JungleTree: React.FC<{ x: number; y: number; scale?: number; variant?: number }> = ({
  x, y, scale = 1, variant = 1
}) => {
  const variants = [
    { trunk: '#8B4513', leaves: '#228B22', w: 160, h: 400 },
    { trunk: '#A0522D', leaves: '#32CD32', w: 200, h: 480 },
    { trunk: '#8B4513', leaves: '#006400', w: 120, h: 350 },
  ];
  // Ensure positive index by handling negative modulo results
  const index = ((variant - 1) % 3 + 3) % 3;
  const tree = variants[index];

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <rect x={tree.w * 0.4} y={tree.h * 0.7} width={tree.w * 0.2} height={tree.h * 0.3} fill={tree.trunk} />
      <circle cx={tree.w * 0.3} cy={tree.h * 0.35} r="48" fill={tree.leaves} opacity="0.8" />
      <circle cx={tree.w * 0.5} cy={tree.h * 0.25} r="58" fill={tree.leaves} opacity="0.9" />
      <circle cx={tree.w * 0.7} cy={tree.h * 0.35} r="42" fill={tree.leaves} opacity="0.8" />
      <circle cx={tree.w * 0.2} cy={tree.h * 0.45} r="38" fill={tree.leaves} opacity="0.7" />
      <circle cx={tree.w * 0.8} cy={tree.h * 0.45} r="40" fill={tree.leaves} opacity="0.7" />
    </g>
  );
};

// Ocean elements
const Wave: React.FC<{ x: number; y: number; width?: number }> = ({ x, y, width = 100 }) => (
  <path
    d={`M${x},${y} Q${x + width * 0.25},${y - 20} ${x + width * 0.5},${y} Q${x + width * 0.75},${y + 20} ${x + width},${y}`}
    fill="none"
    stroke="#40E0D0"
    strokeWidth="3"
    opacity="0.6"
  />
);

const Seaweed: React.FC<{ x: number; y: number; height?: number }> = ({ x, y, height = 80 }) => (
  <g transform={`translate(${x}, ${y})`}>
    <path d={`M0,0 Q10,${-height * 0.3} -5,${-height * 0.6} Q10,${-height * 0.8} 0,${-height}`}
      fill="none" stroke="#228B22" strokeWidth="4" />
    <path d={`M15,0 Q25,${-height * 0.25} 10,${-height * 0.5} Q25,${-height * 0.7} 15,${-height * 0.9}`}
      fill="none" stroke="#32CD32" strokeWidth="3" />
  </g>
);

// Desert elements
const Cactus: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    <rect x="15" y="0" width="20" height="80" fill="#228B22" rx="5" />
    <rect x="0" y="20" width="15" height="10" fill="#228B22" />
    <rect x="0" y="10" width="10" height="20" fill="#228B22" rx="3" />
    <rect x="35" y="30" width="15" height="10" fill="#228B22" />
    <rect x="40" y="20" width="10" height="25" fill="#228B22" rx="3" />
  </g>
);

const Dune: React.FC<{ x: number; y: number; width?: number; height?: number }> = ({ x, y, width = 200, height = 60 }) => (
  <ellipse cx={x + width / 2} cy={y} rx={width / 2} ry={height} fill="#DEB887" opacity="0.7" />
);

// Arctic elements
const Snowflake: React.FC<{ x: number; y: number; size?: number }> = ({ x, y, size = 10 }) => (
  <g transform={`translate(${x}, ${y})`} fill="white" opacity="0.8">
    <line x1="0" y1={-size} x2="0" y2={size} stroke="white" strokeWidth="2" />
    <line x1={-size} y1="0" x2={size} y2="0" stroke="white" strokeWidth="2" />
    <line x1={-size * 0.7} y1={-size * 0.7} x2={size * 0.7} y2={size * 0.7} stroke="white" strokeWidth="2" />
    <line x1={-size * 0.7} y1={size * 0.7} x2={size * 0.7} y2={-size * 0.7} stroke="white" strokeWidth="2" />
  </g>
);

const Iceberg: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    <polygon points="0,60 30,0 50,20 80,0 100,60" fill="#E0FFFF" stroke="#B0E0E6" strokeWidth="2" />
    <polygon points="10,60 35,25 65,35 90,60" fill="#ADD8E6" opacity="0.5" />
  </g>
);

// Candy elements
const Lollipop: React.FC<{ x: number; y: number; color?: string }> = ({ x, y, color = '#FF69B4' }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect x="8" y="40" width="4" height="60" fill="white" />
    <circle cx="10" cy="25" r="25" fill={color} />
    <path d="M10,0 Q25,10 10,25 Q-5,10 10,0" fill="white" opacity="0.3" />
  </g>
);

const CandyCane: React.FC<{ x: number; y: number; height?: number }> = ({ x, y, height = 100 }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect x="0" y="20" width="15" height={height} fill="white" />
    <rect x="0" y="20" width="15" height="10" fill="#FF0000" />
    <rect x="0" y="40" width="15" height="10" fill="#FF0000" />
    <rect x="0" y="60" width="15" height="10" fill="#FF0000" />
    <rect x="0" y="80" width="15" height="10" fill="#FF0000" />
    <circle cx="22" cy="10" r="15" fill="white" />
    <path d="M15,20 Q30,20 30,5 Q30,-10 15,-5" fill="none" stroke="#FF0000" strokeWidth="3" />
  </g>
);

// Volcano elements
const LavaRock: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    <polygon points="0,40 20,0 40,10 50,40" fill="#2F1810" />
    <polygon points="5,40 22,8 38,15 45,40" fill="#4A2820" />
  </g>
);

const Flame: React.FC<{ x: number; y: number; size?: number }> = ({ x, y, size = 30 }) => (
  <g transform={`translate(${x}, ${y})`}>
    <ellipse cx="0" cy="0" rx={size * 0.4} ry={size} fill="#FF4500" opacity="0.8" />
    <ellipse cx="0" cy={-size * 0.2} rx={size * 0.25} ry={size * 0.6} fill="#FFD700" opacity="0.9" />
  </g>
);

// Sky Kingdom elements
const Rainbow: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity="0.6">
    <path d="M0,100 Q100,-50 200,100" fill="none" stroke="#FF0000" strokeWidth="8" />
    <path d="M5,100 Q100,-40 195,100" fill="none" stroke="#FF7F00" strokeWidth="8" />
    <path d="M10,100 Q100,-30 190,100" fill="none" stroke="#FFFF00" strokeWidth="8" />
    <path d="M15,100 Q100,-20 185,100" fill="none" stroke="#00FF00" strokeWidth="8" />
    <path d="M20,100 Q100,-10 180,100" fill="none" stroke="#0000FF" strokeWidth="8" />
    <path d="M25,100 Q100,0 175,100" fill="none" stroke="#8B00FF" strokeWidth="8" />
  </g>
);

// Enchanted Forest elements
const MagicMushroom: React.FC<{ x: number; y: number; color?: string }> = ({ x, y, color = '#FF69B4' }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect x="8" y="25" width="10" height="25" fill="#F5F5DC" />
    <ellipse cx="13" cy="15" rx="20" ry="15" fill={color} />
    <circle cx="5" cy="12" r="4" fill="white" opacity="0.8" />
    <circle cx="18" cy="8" r="3" fill="white" opacity="0.8" />
    <circle cx="22" cy="18" r="2" fill="white" opacity="0.8" />
  </g>
);

const Sparkle: React.FC<{ x: number; y: number; size?: number }> = ({ x, y, size = 8 }) => (
  <g transform={`translate(${x}, ${y})`}>
    <polygon points={`0,${-size} ${size * 0.3},${-size * 0.3} ${size},0 ${size * 0.3},${size * 0.3} 0,${size} ${-size * 0.3},${size * 0.3} ${-size},0 ${-size * 0.3},${-size * 0.3}`}
      fill="#FFD700" opacity="0.9" />
  </g>
);

// Treasure Island elements
const PalmTree: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    <path d="M20,200 Q15,100 25,0" fill="none" stroke="#8B4513" strokeWidth="15" />
    <ellipse cx="25" cy="0" rx="60" ry="20" fill="#228B22" transform="rotate(-30, 25, 0)" />
    <ellipse cx="25" cy="0" rx="50" ry="15" fill="#32CD32" transform="rotate(20, 25, 0)" />
    <ellipse cx="25" cy="0" rx="55" ry="18" fill="#228B22" transform="rotate(-60, 25, 0)" />
    <ellipse cx="25" cy="0" rx="45" ry="12" fill="#32CD32" transform="rotate(50, 25, 0)" />
  </g>
);

const TreasureChest: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect x="0" y="20" width="40" height="25" fill="#8B4513" />
    <path d="M0,20 Q20,0 40,20" fill="#A0522D" />
    <rect x="15" y="25" width="10" height="8" fill="#FFD700" />
  </g>
);

// Main Themed Background Component
const ThemedBackground: React.FC<ThemedBackgroundProps> = ({
  cameraX, cameraY, canvasWidth, canvasHeight, level
}) => {
  const config = getLevelConfig(level);
  const theme = config?.theme || 'jungle';
  const colors = THEME_COLORS[theme] || THEME_COLORS.jungle;

  const backgroundElements = useMemo(() => {
    // Extended view to ensure elements don't disappear
    const viewLeft = Math.max(0, cameraX - canvasWidth * 1.5);
    const viewRight = cameraX + canvasWidth * 2.5;
    const elements: React.ReactElement[] = [];

    // Generate elements based on theme
    switch (theme) {
      case 'jungle':
        // Clouds
        for (let x = Math.floor(viewLeft / 400) * 400; x < viewRight; x += 400) {
          const seed = x / 400;
          const worldX = x;
          const parallaxX = worldX - cameraX * 0.1;
          elements.push(
            <Cloud key={`cloud-${x}`} x={parallaxX} y={canvasHeight * 0.1 - cameraY * 0.05}
              scale={0.8 + (Math.abs(seed) % 5) * 0.1} color={colors.cloudColor} />
          );
        }
        // Trees
        for (let x = Math.floor(viewLeft / 400) * 400; x < viewRight; x += 400) {
          const seed = x / 400;
          const variantValue = ((Math.abs(Math.floor(seed)) % 3) + 1); // Ensure 1, 2, or 3
          const worldX = x;
          const parallaxX = worldX - cameraX * 0.2;
          elements.push(
            <JungleTree key={`tree-${x}`} x={parallaxX} y={canvasHeight - 450 - cameraY * 0.1}
              scale={1.0 + (Math.abs(seed) % 3) * 0.3} variant={variantValue} />
          );
        }
        break;

      case 'ocean':
        // Waves
        for (let x = Math.floor(viewLeft / 150) * 150; x < viewRight; x += 150) {
          elements.push(
            <Wave key={`wave-${x}`} x={x - cameraX * 0.3} y={canvasHeight * 0.3 + Math.sin(x * 0.01) * 20} />
          );
        }
        // Seaweed
        for (let x = Math.floor(viewLeft / 200) * 200; x < viewRight; x += 200) {
          elements.push(
            <Seaweed key={`seaweed-${x}`} x={x - cameraX * 0.5} y={canvasHeight * 0.85} height={60 + (x % 40)} />
          );
        }
        // Bubbles
        for (let x = Math.floor(viewLeft / 100) * 100; x < viewRight; x += 100) {
          const seed = x / 100;
          elements.push(
            <circle key={`bubble-${x}`} cx={x - cameraX * 0.4 + (seed % 50)}
              cy={canvasHeight * 0.5 - (Date.now() * 0.02 + seed * 50) % 200}
              r={5 + (seed % 5)} fill="#FFFFFF" opacity="0.3" />
          );
        }
        break;

      case 'desert':
        // Sun
        elements.push(
          <circle key="sun" cx={canvasWidth * 0.8 - cameraX * 0.05} cy={80}
            r="50" fill="#FFD700" opacity="0.9" />
        );
        // Dunes
        for (let x = Math.floor(viewLeft / 300) * 300; x < viewRight; x += 300) {
          elements.push(
            <Dune key={`dune-${x}`} x={x - cameraX * 0.3} y={canvasHeight * 0.75}
              width={200 + (x % 100)} height={40 + (x % 30)} />
          );
        }
        // Cacti
        for (let x = Math.floor(viewLeft / 350) * 350; x < viewRight; x += 350) {
          elements.push(
            <Cactus key={`cactus-${x}`} x={x - cameraX * 0.5} y={canvasHeight * 0.65}
              scale={0.8 + (x % 5) * 0.1} />
          );
        }
        break;

      case 'arctic':
        // Snowflakes
        for (let x = Math.floor(viewLeft / 80) * 80; x < viewRight; x += 80) {
          const seed = x / 80;
          elements.push(
            <Snowflake key={`snow-${x}`} x={x - cameraX * 0.2 + (seed % 30)}
              y={canvasHeight * 0.2 + (seed % 100)} size={8 + (seed % 6)} />
          );
        }
        // Icebergs
        for (let x = Math.floor(viewLeft / 400) * 400; x < viewRight; x += 400) {
          elements.push(
            <Iceberg key={`ice-${x}`} x={x - cameraX * 0.4} y={canvasHeight * 0.7}
              scale={0.8 + (x % 50) * 0.01} />
          );
        }
        break;

      case 'space':
        // Stars
        for (let x = Math.floor(viewLeft / 50) * 50; x < viewRight; x += 50) {
          const seed = x / 50;
          elements.push(
            <Star key={`star-${x}`} x={x - cameraX * 0.05}
              y={20 + (seed * 37) % (canvasHeight * 0.6)} size={1 + (seed % 3)} />
          );
        }
        // Planets
        for (let x = Math.floor(viewLeft / 600) * 600; x < viewRight; x += 600) {
          const seed = x / 600;
          const planetColors = ['#FF6347', '#9370DB', '#20B2AA', '#FFD700'];
          elements.push(
            <circle key={`planet-${x}`} cx={x - cameraX * 0.1 + 100}
              cy={100 + (seed % 100)} r={30 + (seed % 20)}
              fill={planetColors[Math.floor(seed) % 4]} opacity="0.8" />
          );
        }
        break;

      case 'candy':
        // Lollipops
        for (let x = Math.floor(viewLeft / 300) * 300; x < viewRight; x += 300) {
          const candyColors = ['#FF69B4', '#FF1493', '#9370DB', '#00CED1'];
          elements.push(
            <Lollipop key={`lolli-${x}`} x={x - cameraX * 0.4} y={canvasHeight * 0.6}
              color={candyColors[Math.floor(x / 300) % 4]} />
          );
        }
        // Candy canes
        for (let x = Math.floor(viewLeft / 400) * 400; x < viewRight; x += 400) {
          elements.push(
            <CandyCane key={`cane-${x}`} x={x + 150 - cameraX * 0.3} y={canvasHeight * 0.55} />
          );
        }
        // Clouds (cotton candy style)
        for (let x = Math.floor(viewLeft / 350) * 350; x < viewRight; x += 350) {
          elements.push(
            <Cloud key={`cloud-${x}`} x={x - cameraX * 0.1} y={canvasHeight * 0.15}
              scale={0.9} color="#FFB6C1" />
          );
        }
        break;

      case 'volcano':
        // Smoke clouds
        for (let x = Math.floor(viewLeft / 300) * 300; x < viewRight; x += 300) {
          elements.push(
            <Cloud key={`smoke-${x}`} x={x - cameraX * 0.15} y={canvasHeight * 0.1}
              scale={1.2} color="#696969" opacity={0.6} />
          );
        }
        // Lava rocks
        for (let x = Math.floor(viewLeft / 250) * 250; x < viewRight; x += 250) {
          elements.push(
            <LavaRock key={`rock-${x}`} x={x - cameraX * 0.4} y={canvasHeight * 0.7}
              scale={0.8 + (x % 40) * 0.02} />
          );
        }
        // Flames
        for (let x = Math.floor(viewLeft / 400) * 400; x < viewRight; x += 400) {
          elements.push(
            <Flame key={`flame-${x}`} x={x + 50 - cameraX * 0.5} y={canvasHeight * 0.75}
              size={25 + (x % 15)} />
          );
        }
        break;

      case 'sky':
        // Fluffy clouds
        for (let x = Math.floor(viewLeft / 250) * 250; x < viewRight; x += 250) {
          elements.push(
            <Cloud key={`cloud-${x}`} x={x - cameraX * 0.1} y={canvasHeight * 0.2 + (x % 80)}
              scale={1.0 + (x % 30) * 0.02} color="white" />
          );
        }
        // Rainbow (occasional)
        if (Math.floor(cameraX / 1500) % 2 === 0) {
          elements.push(
            <Rainbow key="rainbow" x={Math.floor(cameraX / 1500) * 1500 + 300 - cameraX * 0.2}
              y={canvasHeight * 0.3} />
          );
        }
        break;

      case 'forest':
        // Sparkles
        for (let x = Math.floor(viewLeft / 100) * 100; x < viewRight; x += 100) {
          const seed = x / 100;
          elements.push(
            <Sparkle key={`sparkle-${x}`} x={x - cameraX * 0.3 + (seed % 40)}
              y={canvasHeight * 0.2 + (seed % 150)} size={5 + (seed % 5)} />
          );
        }
        // Magic mushrooms
        for (let x = Math.floor(viewLeft / 300) * 300; x < viewRight; x += 300) {
          const mushColors = ['#FF69B4', '#9370DB', '#00CED1', '#FF6347'];
          elements.push(
            <MagicMushroom key={`mush-${x}`} x={x - cameraX * 0.5} y={canvasHeight * 0.75}
              color={mushColors[Math.floor(x / 300) % 4]} />
          );
        }
        // Trees (enchanted style - using jungle trees with different opacity)
        for (let x = Math.floor(viewLeft / 500) * 500; x < viewRight; x += 500) {
          elements.push(
            <g key={`etree-${x}`} opacity="0.7">
              <JungleTree x={x - cameraX * 0.2} y={canvasHeight - 450} scale={1.2} variant={1} />
            </g>
          );
        }
        break;

      case 'treasure':
        // Palm trees
        for (let x = Math.floor(viewLeft / 400) * 400; x < viewRight; x += 400) {
          elements.push(
            <PalmTree key={`palm-${x}`} x={x - cameraX * 0.3} y={canvasHeight * 0.55}
              scale={0.7 + (x % 30) * 0.01} />
          );
        }
        // Treasure chests (occasional)
        for (let x = Math.floor(viewLeft / 800) * 800; x < viewRight; x += 800) {
          elements.push(
            <TreasureChest key={`chest-${x}`} x={x + 200 - cameraX * 0.5} y={canvasHeight * 0.78} />
          );
        }
        // Clouds
        for (let x = Math.floor(viewLeft / 400) * 400; x < viewRight; x += 400) {
          elements.push(
            <Cloud key={`cloud-${x}`} x={x - cameraX * 0.1} y={canvasHeight * 0.1}
              scale={0.8} color="white" />
          );
        }
        break;
    }

    return elements;
  }, [cameraX, cameraY, canvasWidth, canvasHeight, theme, colors]);

  const gradientId = `skyGradient-${level}`;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={canvasWidth}
      height={canvasHeight}
      style={{ zIndex: -1 }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.skyGradient[0]} />
          <stop offset="50%" stopColor={colors.skyGradient[1]} />
          <stop offset="100%" stopColor={colors.skyGradient[2]} />
        </linearGradient>
      </defs>

      <rect width="100%" height="100%" fill={`url(#${gradientId})`} />

      {backgroundElements}
    </svg>
  );
};

export default ThemedBackground;
