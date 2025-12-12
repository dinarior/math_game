import React, { useEffect } from 'react';
import { Star, Trophy, ArrowRight, Home } from 'lucide-react';
import { getLevelConfig, LEVEL_CONFIGS } from '../config/levels';
import soundManager from '../services/soundManager';

interface LevelCompleteProps {
  level: number;
  score: number;
  livesRemaining: number;
  onNextLevel: () => void;
  onMainMenu: () => void;
  isLastLevel: boolean;
}

const LevelComplete: React.FC<LevelCompleteProps> = ({
  level,
  score,
  livesRemaining,
  onNextLevel,
  onMainMenu,
  isLastLevel,
}) => {
  const config = getLevelConfig(level);
  const stars = livesRemaining;  // Stars based on lives remaining

  useEffect(() => {
    soundManager.play('levelComplete');
  }, []);

  const handleNextClick = () => {
    soundManager.play('buttonClick');
    onNextLevel();
  };

  const handleMenuClick = () => {
    soundManager.play('buttonClick');
    onMainMenu();
  };

  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div
        className="bg-gradient-to-b from-white to-gray-100 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-bounce-in"
        style={{
          borderTop: `8px solid ${config?.colors.accent || '#32CD32'}`,
        }}
      >
        {/* Trophy */}
        <div className="mb-4">
          <Trophy size={64} className="mx-auto text-yellow-500 animate-pulse" />
        </div>

        {/* Level Complete Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          כל הכבוד!
        </h1>
        <h2 className="text-xl text-gray-600 mb-6">
          סיימת את שלב {level}: {config?.nameHebrew || ''}
        </h2>

        {/* Collectibles Display */}
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {config?.collectibles.slice(0, 5).map((emoji, i) => (
            <span
              key={i}
              className="text-3xl animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {emoji}
            </span>
          ))}
        </div>

        {/* Score */}
        <div className="bg-gray-200 rounded-xl p-4 mb-6">
          <div className="text-gray-600 text-sm mb-1">ניקוד</div>
          <div className="text-4xl font-bold text-gray-800">{score}</div>
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-3 mb-8">
          {[1, 2, 3].map((starNum) => (
            <Star
              key={starNum}
              size={48}
              className={`
                transition-all duration-500
                ${starNum <= stars
                  ? 'text-yellow-400 fill-yellow-400 animate-bounce'
                  : 'text-gray-300'
                }
              `}
              style={{
                animationDelay: starNum <= stars ? `${starNum * 0.2}s` : '0s',
              }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          {!isLastLevel && (
            <button
              onClick={handleNextClick}
              className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              <span>לשלב הבא</span>
              <ArrowRight size={24} />
            </button>
          )}

          {isLastLevel && (
            <div className="bg-yellow-100 rounded-xl p-4 mb-4">
              <div className="text-2xl mb-2">🎉</div>
              <div className="text-yellow-800 font-bold">
                סיימת את כל השלבים!
              </div>
            </div>
          )}

          <button
            onClick={handleMenuClick}
            className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-all"
          >
            <Home size={20} />
            <span>תפריט ראשי</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelComplete;
