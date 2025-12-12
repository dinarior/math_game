import React, { useState } from 'react';
import { ArrowLeft, Star, Lock } from 'lucide-react';
import { LevelState } from '../services/levelManager';
import { LEVEL_CONFIGS } from '../config/levels';

interface CollectionViewProps {
  onBack: () => void;
  levelState: LevelState;
}

const CollectionView: React.FC<CollectionViewProps> = ({ onBack, levelState }) => {
  const [selectedLevel, setSelectedLevel] = useState(1);

  // Calculate total collection stats
  const totalCollectibles = LEVEL_CONFIGS.reduce((sum, config) => sum + config.requiredCollectibles, 0);
  const totalCollected = Object.values(levelState.levelProgress).reduce(
    (sum, progress) => {
      if (progress.levelId === levelState.currentLevel) {
        return sum + levelState.currentCollectibles;
      }
      return sum + (progress.completed ? 10 : 0);
    },
    0
  );

  const selectedConfig = LEVEL_CONFIGS.find(c => c.id === selectedLevel);
  const selectedProgress = levelState.levelProgress[selectedLevel];
  const isCurrentLevel = levelState.currentLevel === selectedLevel;
  const collectiblesInLevel = isCurrentLevel ? levelState.currentCollectibles : (selectedProgress?.completed ? 10 : 0);

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-sky-400 to-green-400 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-sm p-4 shadow-lg">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <button
            onClick={onBack}
            className="bg-white text-sky-600 px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-sky-50 transition-colors"
          >
            <ArrowLeft size={20} />
            חזרה
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">אוסף</h1>
            <p className="text-white/90">
              {totalCollected} / {totalCollectibles} נאספו
            </p>
          </div>

          <div className="w-24"></div>
        </div>
      </div>

      {/* Level Selector */}
      <div className="bg-white/10 backdrop-blur-sm p-4 overflow-x-auto">
        <div className="flex gap-2 max-w-6xl mx-auto justify-center">
          {LEVEL_CONFIGS.map((config) => {
            const progress = levelState.levelProgress[config.id];
            const isUnlocked = progress?.unlocked ?? false;
            const isSelected = config.id === selectedLevel;

            return (
              <button
                key={config.id}
                onClick={() => isUnlocked && setSelectedLevel(config.id)}
                disabled={!isUnlocked}
                className={`
                  relative flex flex-col items-center justify-center p-3 rounded-xl min-w-[80px]
                  transition-all duration-200
                  ${isUnlocked
                    ? isSelected
                      ? 'bg-white scale-110 shadow-lg'
                      : 'bg-white/60 hover:bg-white/80 hover:scale-105'
                    : 'bg-gray-400/30 cursor-not-allowed'
                  }
                `}
              >
                {isUnlocked ? (
                  <>
                    <span className="text-2xl mb-1">{config.collectibles[0]}</span>
                    <span className="text-xs font-bold text-gray-700">{config.id}</span>
                    {progress?.stars > 0 && (
                      <div className="flex gap-0.5 mt-1">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            size={10}
                            className={s <= progress.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Lock size={24} className="text-gray-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Level Collection */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {selectedConfig && (
            <>
              {/* Level Header */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {selectedConfig.nameHebrew}
                </h2>
                <p className="text-white/90 text-lg">
                  {collectiblesInLevel} / {selectedConfig.requiredCollectibles} נאספו
                </p>
                {isCurrentLevel && (
                  <p className="text-yellow-300 font-bold mt-1">שלב נוכחי</p>
                )}
              </div>

              {/* Progress Bar */}
              <div className="bg-white/20 backdrop-blur-sm rounded-full h-4 overflow-hidden mb-6">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-full transition-all duration-500"
                  style={{ width: `${(collectiblesInLevel / selectedConfig.requiredCollectibles) * 100}%` }}
                ></div>
              </div>

              {/* Collection Grid */}
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6">
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                  {selectedConfig.collectibles.slice(0, 10).map((emoji, idx) => {
                    const isCollected = idx < collectiblesInLevel;

                    return (
                      <div
                        key={idx}
                        className={`
                          relative aspect-square rounded-xl border-4 transition-all duration-300
                          flex items-center justify-center text-2xl sm:text-3xl
                          ${isCollected
                            ? 'border-green-400 bg-white shadow-lg scale-100'
                            : 'border-gray-500 bg-gray-700/50 opacity-40 scale-90'
                          }
                        `}
                      >
                        <span className={isCollected ? 'grayscale-0' : 'grayscale brightness-75'}>
                          {emoji}
                        </span>

                        {/* Collection number */}
                        {isCollected && (
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Completion Message */}
              {collectiblesInLevel === selectedConfig.requiredCollectibles && (
                <div className="mt-6 text-center">
                  <div className="bg-yellow-400 rounded-2xl p-6 shadow-xl border-4 border-yellow-500">
                    <h3 className="text-2xl font-bold text-yellow-800 mb-2">
                      🎉 שלב הושלם! 🎉
                    </h3>
                    <p className="text-yellow-700 text-lg">
                      אספת את כל {selectedConfig.requiredCollectibles} האוספים בשלב זה!
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionView;
