import React, { useMemo } from 'react';

interface JungleBackgroundProps {
  cameraX: number;
  cameraY: number;
  canvasWidth: number;
  canvasHeight: number;
}

// SVG Tree Component
export const JungleTree: React.FC<{ x: number; y: number; scale?: number; variant?: number }> = ({
  x, y, scale = 1, variant = 1
}) => {
  const treeVariants = {
    1: {
      trunkColor: '#8B4513',
      leavesColor: '#228B22',
      width: 160,
      height: 400,
    },
    2: {
      trunkColor: '#A0522D',
      leavesColor: '#32CD32',
      width: 200,
      height: 480,
    },
    3: {
      trunkColor: '#8B4513',
      leavesColor: '#006400',
      width: 120,
      height: 350,
    }
  };

  const tree = treeVariants[variant as keyof typeof treeVariants] || treeVariants[1];

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* Trunk - adjusted proportions for taller trees */}
      <rect
        x={tree.width * 0.4}
        y={tree.height * 0.7} // Start trunk lower for taller trees
        width={tree.width * 0.2}
        height={tree.height * 0.3} // Trunk is 30% of total height
        fill={tree.trunkColor}
        stroke="#654321"
        strokeWidth="2"
      />
      {/* Tree crown circles - larger for much taller trees */}
      <circle cx={tree.width * 0.3} cy={tree.height * 0.35} r="48" fill={tree.leavesColor} opacity="0.8" />
      <circle cx={tree.width * 0.5} cy={tree.height * 0.25} r="58" fill={tree.leavesColor} opacity="0.9" />
      <circle cx={tree.width * 0.7} cy={tree.height * 0.35} r="42" fill={tree.leavesColor} opacity="0.8" />
      <circle cx={tree.width * 0.2} cy={tree.height * 0.45} r="38" fill={tree.leavesColor} opacity="0.7" />
      <circle cx={tree.width * 0.8} cy={tree.height * 0.45} r="40" fill={tree.leavesColor} opacity="0.7" />
      <circle cx={tree.width * 0.6} cy={tree.height * 0.3} r="35" fill={tree.leavesColor} opacity="0.8" />
      <circle cx={tree.width * 0.4} cy={tree.height * 0.4} r="32" fill={tree.leavesColor} opacity="0.85" />
    </g>
  );
};

// SVG Bush Component
export const JungleBush: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <circle cx="20" cy="20" r="15" fill="#228B22" opacity="0.9" />
      <circle cx="35" cy="18" r="12" fill="#32CD32" opacity="0.8" />
      <circle cx="50" cy="22" r="14" fill="#228B22" opacity="0.9" />
      <circle cx="10" cy="25" r="10" fill="#006400" opacity="0.7" />
      <circle cx="60" cy="25" r="11" fill="#006400" opacity="0.7" />
    </g>
  );
};

// SVG Vine Component
export const JungleVine: React.FC<{ x: number; y: number; length?: number }> = ({ x, y, length = 100 }) => {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <path
        d={`M0,0 Q5,${length * 0.25} 0,${length * 0.5} Q-5,${length * 0.75} 0,${length}`}
        fill="none"
        stroke="#228B22"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Leaves along the vine */}
      <ellipse cx="3" cy={length * 0.2} rx="8" ry="4" fill="#32CD32" transform="rotate(15)" />
      <ellipse cx="-3" cy={length * 0.4} rx="6" ry="3" fill="#228B22" transform="rotate(-20)" />
      <ellipse cx="4" cy={length * 0.6} rx="7" ry="3.5" fill="#32CD32" transform="rotate(10)" />
      <ellipse cx="-2" cy={length * 0.8} rx="5" ry="3" fill="#006400" transform="rotate(-15)" />
    </g>
  );
};

// SVG Cloud Component
export const Cloud: React.FC<{ x: number; y: number; scale?: number; opacity?: number }> = ({
  x, y, scale = 1, opacity = 0.8
}) => {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
      <circle cx="30" cy="30" r="20" fill="white" />
      <circle cx="50" cy="35" r="25" fill="white" />
      <circle cx="70" cy="30" r="18" fill="white" />
      <circle cx="85" cy="25" r="15" fill="white" />
      <circle cx="15" cy="25" r="12" fill="white" />
      {/* Cloud shadow */}
      <ellipse cx="50" cy="50" rx="45" ry="8" fill="#E5E7EB" opacity="0.3" />
    </g>
  );
};

// Main Jungle Background Component
const JungleBackground: React.FC<JungleBackgroundProps> = ({ cameraX, cameraY, canvasWidth, canvasHeight }) => {
  // Pre-generate background elements to avoid re-computation on every render
  const backgroundElements = useMemo(() => {
    const viewLeft = cameraX - canvasWidth;
    const viewRight = cameraX + canvasWidth * 2;

    const elements = {
      clouds: [] as React.ReactElement[],
      backgroundTrees: [] as React.ReactElement[],
      midgroundElements: [] as React.ReactElement[],
    };

    // Clouds (very slow parallax)
    for (let x = Math.floor(viewLeft / 400) * 400; x < viewRight; x += 400) {
      const seed = x / 400;
      const cloudX = x + (seed % 3) * 50;
      elements.clouds.push(
        <Cloud
          key={`cloud-${x}`}
          x={cloudX - cameraX * 0.1}
          y={canvasHeight * 0.1 - cameraY * 0.05}
          scale={0.8 + (seed % 5) * 0.1}
          opacity={0.6 + (seed % 3) * 0.1}
        />
      );
    }

    // Background trees (far layer - slow parallax) - grounded at bottom with taller heights
    for (let x = Math.floor(viewLeft / 400) * 400; x < viewRight; x += 400) {
      const seed = x / 400;
      const treeX = x + (seed % 2) * 150;
      elements.backgroundTrees.push(
        <JungleTree
          key={`bg-tree-${x}`}
          x={treeX - cameraX * 0.2}
          y={canvasHeight - 450 - cameraY * 0.1} // Adjusted for taller trees
          scale={1.0 + (seed % 3) * 0.3}
          variant={(Math.floor(seed) % 3) + 1}
        />
      );
    }

    // Foreground trees (close layer - faster parallax) - grounded at bottom with taller heights
    for (let x = Math.floor(viewLeft / 500) * 500; x < viewRight; x += 500) {
      const seed = x / 500;
      const treeX = x + (seed % 3) * 200;
      elements.backgroundTrees.push(
        <JungleTree
          key={`fg-tree-${x}`}
          x={treeX - cameraX * 0.6}
          y={canvasHeight - 600 - cameraY * 0.4} // Adjusted for much taller foreground trees
          scale={1.5 + (seed % 2) * 0.5}
          variant={(Math.floor(seed) % 3) + 1}
        />
      );
    }

    // Midground elements (medium parallax) - better grounded
    for (let x = Math.floor(viewLeft / 200) * 200; x < viewRight; x += 200) {
      const seed = x / 200;
      const elementX = x + (seed % 4) * 20;
      elements.midgroundElements.push(
        <JungleBush
          key={`mg-bush-${x}`}
          x={elementX - cameraX * 0.5}
          y={canvasHeight * 0.8 - cameraY * 0.3}
          scale={0.8 + (seed % 4) * 0.1}
        />
      );

      // Add vines hanging from tree branches (not floating in sky)
      if (Math.floor(seed) % 3 === 0) {
        elements.midgroundElements.push(
          <JungleVine
            key={`mg-vine-${x}`}
            x={elementX + 100 - cameraX * 0.5}
            y={canvasHeight * 0.4 - cameraY * 0.3} // Hang from middle height, not sky
            length={80 + (seed % 3) * 15} // Shorter vines
          />
        );
      }
    }

    return elements;
  }, [cameraX, cameraY, canvasWidth, canvasHeight]);

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={canvasWidth}
      height={canvasHeight}
      style={{ zIndex: -1 }}
    >
      {/* Sky gradient */}
      <defs>
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#87CEEB" />
          <stop offset="50%" stopColor="#98D8E8" />
          <stop offset="100%" stopColor="#B0E0E6" />
        </linearGradient>
      </defs>

      <rect width="100%" height="100%" fill="url(#skyGradient)" />

      {/* Render layers from back to front */}
      {backgroundElements.clouds}
      {backgroundElements.backgroundTrees}
      {backgroundElements.midgroundElements}
    </svg>
  );
};

export default JungleBackground;