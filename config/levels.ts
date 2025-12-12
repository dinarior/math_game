// Level configurations for Math Hopper: Jungle Adventure
// 10 themed levels with increasing difficulty

export interface LevelConfig {
  id: number;
  name: string;
  nameHebrew: string;
  theme: string;

  // Visual theme
  colors: {
    skyGradient: [string, string];
    ground: string;
    groundTop: string;
    platform: string;
    platformTop: string;
    accent: string;
  };

  // Collectibles for this level
  collectibles: string[];  // Array of emojis to collect

  // Enemy configuration
  enemy: {
    emoji: string;
    speed: number;       // Base speed multiplier
    spawnChance: number; // 0-1, chance to spawn on platform
  };

  // Platformer difficulty
  difficulty: {
    gapMin: number;      // Minimum gap between platforms
    gapMax: number;      // Maximum gap between platforms
    platformWidthMin: number;
    platformWidthMax: number;
    movingPlatforms: boolean;
    movingPlatformChance: number;
  };

  // Math difficulty
  math: {
    maxNumber: number;           // Maximum number in questions
    allowSubtraction: boolean;   // Whether subtraction is allowed
  };

  // Completion requirements
  requiredCollectibles: number;
}

export const LEVEL_CONFIGS: LevelConfig[] = [
  // Level 1: Jungle (Tutorial-like, easiest)
  {
    id: 1,
    name: 'Jungle',
    nameHebrew: 'ג\'ונגל',
    theme: 'jungle',
    colors: {
      skyGradient: ['#87CEEB', '#B0E0E6'],
      ground: '#228B22',
      groundTop: '#32CD32',
      platform: '#8B4513',
      platformTop: '#A0522D',
      accent: '#32CD32',
    },
    collectibles: ['🦁', '🐯', '🐘', '🦒', '🐵', '🦜', '🦋', '🐸', '🦎', '🐍', '🦓', '🦏', '🐆', '🦘', '🐊', '🦅', '🦩', '🐛', '🦗', '🕷️'],
    enemy: {
      emoji: '🐍',
      speed: 1.0,
      spawnChance: 0.10,
    },
    difficulty: {
      gapMin: 80,
      gapMax: 100,
      platformWidthMin: 150,
      platformWidthMax: 250,
      movingPlatforms: false,
      movingPlatformChance: 0,
    },
    math: {
      maxNumber: 10,  // Very easy for level 1
      allowSubtraction: false,
    },
    requiredCollectibles: 10,
  },

  // Level 2: Ocean
  {
    id: 2,
    name: 'Ocean',
    nameHebrew: 'אוקיינוס',
    theme: 'ocean',
    colors: {
      skyGradient: ['#006994', '#40E0D0'],
      ground: '#1E90FF',
      groundTop: '#00CED1',
      platform: '#20B2AA',
      platformTop: '#48D1CC',
      accent: '#00CED1',
    },
    collectibles: ['🐠', '🐙', '🦀', '🐬', '🐳', '🦈', '🐚', '🦑', '🐡', '🦞', '🐟', '🦐', '🐋', '🦭', '🐢', '🦦', '🪼', '🐌', '🦪', '🪸'],
    enemy: {
      emoji: '🪼',
      speed: 1.2,
      spawnChance: 0.15,
    },
    difficulty: {
      gapMin: 90,
      gapMax: 110,
      platformWidthMin: 140,
      platformWidthMax: 240,
      movingPlatforms: false,
      movingPlatformChance: 0,
    },
    math: {
      maxNumber: 20,  // 2 * 10
      allowSubtraction: false,
    },
    requiredCollectibles: 10,
  },

  // Level 3: Desert (First subtraction level)
  {
    id: 3,
    name: 'Desert',
    nameHebrew: 'מדבר',
    theme: 'desert',
    colors: {
      skyGradient: ['#FFD700', '#FFA500'],
      ground: '#D2691E',
      groundTop: '#DEB887',
      platform: '#C19A6B',
      platformTop: '#D2B48C',
      accent: '#FF8C00',
    },
    collectibles: ['🦎', '🏜️', '🌵', '🐪', '🦂', '🐫', '🌴', '🦅', '🐍', '🏺', '🦗', '🌞', '🏜️', '🦙', '🐀', '🦔', '🐁', '🦜', '🌺', '🪨'],
    enemy: {
      emoji: '🦂',
      speed: 1.4,
      spawnChance: 0.20,
    },
    difficulty: {
      gapMin: 100,
      gapMax: 120,
      platformWidthMin: 130,
      platformWidthMax: 230,
      movingPlatforms: false,
      movingPlatformChance: 0,
    },
    math: {
      maxNumber: 30,  // 3 * 10
      allowSubtraction: true,  // Subtraction starts here!
    },
    requiredCollectibles: 10,
  },

  // Level 4: Arctic
  {
    id: 4,
    name: 'Arctic',
    nameHebrew: 'קוטב',
    theme: 'arctic',
    colors: {
      skyGradient: ['#E0FFFF', '#B0E0E6'],
      ground: '#F0FFFF',
      groundTop: '#FFFFFF',
      platform: '#ADD8E6',
      platformTop: '#E0FFFF',
      accent: '#87CEEB',
    },
    collectibles: ['🐧', '🦭', '🐻‍❄️', '🐋', '❄️', '🌨️', '🏔️', '🦌', '🐺', '🦉', '🦊', '⛄', '🧊', '🏔️', '❄️', '🐻', '🦫', '🦦', '☃️', '🌬️'],
    enemy: {
      emoji: '⚪',
      speed: 1.6,
      spawnChance: 0.25,
    },
    difficulty: {
      gapMin: 100,
      gapMax: 130,
      platformWidthMin: 120,
      platformWidthMax: 220,
      movingPlatforms: false,
      movingPlatformChance: 0,
    },
    math: {
      maxNumber: 40,  // 4 * 10
      allowSubtraction: true,
    },
    requiredCollectibles: 10,
  },

  // Level 5: Space (First moving platforms)
  {
    id: 5,
    name: 'Space',
    nameHebrew: 'חלל',
    theme: 'space',
    colors: {
      skyGradient: ['#191970', '#000033'],
      ground: '#2F2F4F',
      groundTop: '#483D8B',
      platform: '#4B0082',
      platformTop: '#6A5ACD',
      accent: '#9370DB',
    },
    collectibles: ['🌟', '🚀', '👽', '🛸', '🌙', '☄️', '🪐', '🌌', '✨', '🛰️', '🌠', '⭐', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔'],
    enemy: {
      emoji: '👾',
      speed: 1.8,
      spawnChance: 0.30,
    },
    difficulty: {
      gapMin: 110,
      gapMax: 140,
      platformWidthMin: 110,
      platformWidthMax: 210,
      movingPlatforms: true,
      movingPlatformChance: 0.15,
    },
    math: {
      maxNumber: 50,  // 5 * 10
      allowSubtraction: true,
    },
    requiredCollectibles: 10,
  },

  // Level 6: Candy Land
  {
    id: 6,
    name: 'Candy Land',
    nameHebrew: 'ארץ הממתקים',
    theme: 'candy',
    colors: {
      skyGradient: ['#FFB6C1', '#DDA0DD'],
      ground: '#FF69B4',
      groundTop: '#FFB6C1',
      platform: '#FF1493',
      platformTop: '#FF69B4',
      accent: '#FF00FF',
    },
    collectibles: ['🍭', '🍬', '🧁', '🍰', '🍩', '🍪', '🎂', '🍫', '🍦', '🍡', '🍮', '🧃', '🍧', '🥤', '🍨', '🍯', '🍒', '🍓', '🥧', '🍌'],
    enemy: {
      emoji: '🧸',
      speed: 2.0,
      spawnChance: 0.30,
    },
    difficulty: {
      gapMin: 110,
      gapMax: 150,
      platformWidthMin: 100,
      platformWidthMax: 200,
      movingPlatforms: true,
      movingPlatformChance: 0.20,
    },
    math: {
      maxNumber: 60,  // 6 * 10
      allowSubtraction: true,
    },
    requiredCollectibles: 10,
  },

  // Level 7: Volcano
  {
    id: 7,
    name: 'Volcano',
    nameHebrew: 'הר געש',
    theme: 'volcano',
    colors: {
      skyGradient: ['#FF4500', '#8B0000'],
      ground: '#2F1810',
      groundTop: '#4A2820',
      platform: '#8B4513',
      platformTop: '#A0522D',
      accent: '#FF6347',
    },
    collectibles: ['💎', '🔥', '🌋', '💰', '🔶', '🔴', '🟠', '🟡', '⭐', '🏆', '💍', '💵', '💴', '💶', '💷', '🪙', '🔸', '🔹', '🟥', '🟧'],
    enemy: {
      emoji: '🔴',
      speed: 2.2,
      spawnChance: 0.35,
    },
    difficulty: {
      gapMin: 120,
      gapMax: 160,
      platformWidthMin: 90,
      platformWidthMax: 190,
      movingPlatforms: true,
      movingPlatformChance: 0.25,
    },
    math: {
      maxNumber: 70,  // 7 * 10
      allowSubtraction: true,
    },
    requiredCollectibles: 10,
  },

  // Level 8: Sky Kingdom
  {
    id: 8,
    name: 'Sky Kingdom',
    nameHebrew: 'ממלכת השמיים',
    theme: 'sky',
    colors: {
      skyGradient: ['#87CEEB', '#FFFFFF'],
      ground: '#F0F8FF',
      groundTop: '#FFFFFF',
      platform: '#B0C4DE',
      platformTop: '#E6E6FA',
      accent: '#00BFFF',
    },
    collectibles: ['🦅', '☁️', '🌈', '🦋', '🕊️', '🎈', '🪁', '⛅', '🌤️', '🦢', '🌥️', '⛈️', '🌦️', '🌧️', '⭐', '✨', '💫', '🦜', '🦚', '🐦'],
    enemy: {
      emoji: '🦇',
      speed: 2.4,
      spawnChance: 0.35,
    },
    difficulty: {
      gapMin: 120,
      gapMax: 170,
      platformWidthMin: 80,
      platformWidthMax: 180,
      movingPlatforms: true,
      movingPlatformChance: 0.30,
    },
    math: {
      maxNumber: 80,  // 8 * 10
      allowSubtraction: true,
    },
    requiredCollectibles: 10,
  },

  // Level 9: Enchanted Forest
  {
    id: 9,
    name: 'Enchanted Forest',
    nameHebrew: 'יער הקסמים',
    theme: 'forest',
    colors: {
      skyGradient: ['#9932CC', '#2E0854'],
      ground: '#228B22',
      groundTop: '#32CD32',
      platform: '#006400',
      platformTop: '#228B22',
      accent: '#9400D3',
    },
    collectibles: ['🍄', '🧚', '✨', '🦄', '🌸', '🌺', '🦋', '💫', '🌙', '🔮', '🌻', '🌷', '🌹', '🏵️', '🪷', '🌼', '💐', '🪻', '🌿', '🍀'],
    enemy: {
      emoji: '👺',
      speed: 2.6,
      spawnChance: 0.40,
    },
    difficulty: {
      gapMin: 130,
      gapMax: 180,
      platformWidthMin: 70,
      platformWidthMax: 170,
      movingPlatforms: true,
      movingPlatformChance: 0.35,
    },
    math: {
      maxNumber: 90,  // 9 * 10
      allowSubtraction: true,
    },
    requiredCollectibles: 10,
  },

  // Level 10: Treasure Island (Final level, hardest)
  {
    id: 10,
    name: 'Treasure Island',
    nameHebrew: 'אי המטמון',
    theme: 'treasure',
    colors: {
      skyGradient: ['#FFD700', '#87CEEB'],
      ground: '#DEB887',
      groundTop: '#F4A460',
      platform: '#8B4513',
      platformTop: '#CD853F',
      accent: '#FFD700',
    },
    collectibles: ['💰', '👑', '🏴‍☠️', '💎', '🗝️', '📿', '🏆', '💍', '🎖️', '⚱️', '🪙', '💵', '🗺️', '⚓', '🦜', '🔱', '⚔️', '🛡️', '📜', '🧭'],
    enemy: {
      emoji: '🏴‍☠️',
      speed: 2.8,
      spawnChance: 0.40,
    },
    difficulty: {
      gapMin: 130,
      gapMax: 190,
      platformWidthMin: 60,
      platformWidthMax: 160,
      movingPlatforms: true,
      movingPlatformChance: 0.40,
    },
    math: {
      maxNumber: 100,  // 10 * 10
      allowSubtraction: true,
    },
    requiredCollectibles: 10,
  },
];

// Helper function to get level config by ID
export function getLevelConfig(levelId: number): LevelConfig | undefined {
  return LEVEL_CONFIGS.find(l => l.id === levelId);
}

// Emojis for question generation by theme
export const QUESTION_EMOJIS: Record<string, string[]> = {
  jungle: ['🍌', '🥥', '🌴', '🦁', '🐵', '🦋'],
  ocean: ['🐠', '🐚', '🦀', '🐙', '🐬', '🌊'],
  desert: ['🌵', '🐪', '☀️', '🏜️', '🦂', '🌻'],
  arctic: ['❄️', '🐧', '⛄', '🧊', '🌨️', '🐻‍❄️'],
  space: ['⭐', '🚀', '🌙', '☄️', '👽', '🛸'],
  candy: ['🍭', '🍬', '🧁', '🍩', '🍪', '🎂'],
  volcano: ['💎', '🔥', '🌋', '🔶', '💰', '⚡'],
  sky: ['☁️', '🌈', '🎈', '🦋', '⛅', '🕊️'],
  forest: ['🍄', '✨', '🌸', '🌺', '🦋', '🌿'],
  treasure: ['💰', '💎', '👑', '🗝️', '⚓', '🏆'],
};

// Finger emojis for counting
export const FINGER_EMOJIS: Record<number, string> = {
  1: '☝️',
  2: '✌️',
  3: '🤟',   // Using "I love you" as 3 fingers
  4: '🖖',   // Vulcan salute as 4 fingers
  5: '🖐️',
  6: '🤙',   // 6 = hand + shaka (thumb + pinky = 2, so 5+1)
  7: '✋✌️', // 5 + 2
  8: '✋🤟', // 5 + 3
  9: '✋🖖', // 5 + 4
  10: '🙌',  // Two hands = 10
};

// Simple finger emojis for young children (only 1-5)
export const SIMPLE_FINGER_EMOJIS: Record<number, string> = {
  1: '☝️',
  2: '✌️',
  3: '🤟',
  4: '🖖',
  5: '🖐️',
};
