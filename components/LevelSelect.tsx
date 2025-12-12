import React from 'react';
import { ArrowLeft, Lock, Star } from 'lucide-react';
import { LEVEL_CONFIGS } from '../config/levels';
import { LevelState, LevelProgress } from '../services/levelManager';
import soundManager from '../services/soundManager';

interface LevelSelectProps {
  levelState: LevelState;
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
}

const LevelSelect: React.FC<LevelSelectProps> = ({
  levelState,
  onSelectLevel,
  onBack,
}) => {
  const handleLevelClick = (levelId: number) => {
    soundManager.play('buttonClick');
    if (levelState.levelProgress[levelId]?.unlocked) {
      onSelectLevel(levelId);
    }
  };

  const handleBackClick = () => {
    soundManager.play('buttonClick');
    onBack();
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-sky-400 to-green-400 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-4xl mb-6">
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 text-white hover:text-yellow-200 transition-colors"
        >
          <ArrowLeft size={24} />
          <span className="text-lg font-bold">חזרה</span>
        </button>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center drop-shadow-lg">
        בחר שלב
      </h1>

      {/* Level Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-4xl w-full px-4">
        {LEVEL_CONFIGS.map((config) => {
          const progress = levelState.levelProgress[config.id];
          const isUnlocked = progress?.unlocked ?? false;
          const isCompleted = progress?.completed ?? false;
          const stars = progress?.stars ?? 0;

          return (
            <button
              key={config.id}
              onClick={() => handleLevelClick(config.id)}
              disabled={!isUnlocked}
              className={`
                relative aspect-square rounded-2xl p-4 flex flex-col items-center justify-center
                transition-all duration-200 transform
                ${isUnlocked
                  ? 'bg-white/90 hover:bg-white hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl'
                  : 'bg-gray-400/50 cursor-not-allowed'
                }
                ${isCompleted ? 'ring-4 ring-yellow-400' : ''}
              `}
              style={{
                background: isUnlocked
                  ? `linear-gradient(135deg, ${config.colors.skyGradient[0]}40, ${config.colors.skyGradient[1]}40)`
                  : undefined,
              }}
            >
              {/* Level Number */}
              <div className={`
                text-3xl font-bold mb-1
                ${isUnlocked ? 'text-gray-800' : 'text-gray-500'}
              `}>
                {isUnlocked ? config.id : <Lock size={32} />}
              </div>

              {/* Level Name */}
              {isUnlocked && (
                <div className="text-sm font-medium text-gray-700 text-center">
                  {config.nameHebrew}
                </div>
              )}

              {/* Theme emoji */}
              {isUnlocked && (
                <div className="text-2xl mt-1">
                  {config.collectibles[0]}
                </div>
              )}

              {/* Stars */}
              {isCompleted && (
                <div className="flex gap-0.5 mt-2">
                  {[1, 2, 3].map((starNum) => (
                    <Star
                      key={starNum}
                      size={16}
                      className={starNum <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
              )}

              {/* Best Score */}
              {isCompleted && progress?.bestScore > 0 && (
                <div className="text-xs text-gray-600 mt-1">
                  {progress.bestScore}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Total Stars */}
      <div className="mt-8 flex items-center gap-2 text-white text-xl">
        <Star size={28} className="text-yellow-400 fill-yellow-400" />
        <span className="font-bold">
          {Object.values(levelState.levelProgress).reduce((sum: number, p: LevelProgress) => sum + p.stars, 0)}
          {' / '}
          {LEVEL_CONFIGS.length * 3}
        </span>
      </div>
    </div>
  );
};

export default LevelSelect;
