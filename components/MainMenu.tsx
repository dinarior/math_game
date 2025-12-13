import React, { useState } from 'react';
import { Play, Package, Map, Trophy, RotateCcw, AlertTriangle } from 'lucide-react';
import { CharacterId } from '../types';
import { LevelState } from '../services/levelManager';
import soundManager from '../services/soundManager';

interface MainMenuProps {
  onStart: () => void;
  character: CharacterId;
  setCharacter: (c: CharacterId) => void;
  onViewCollection: () => void;
  onLevelSelect?: () => void;
  onViewHighScores?: () => void;
  onResetProgress?: () => void;
  levelState: LevelState;
}

const MainMenu: React.FC<MainMenuProps> = ({
  onStart,
  character,
  setCharacter,
  onViewCollection,
  onLevelSelect,
  onViewHighScores,
  onResetProgress,
  levelState
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  // Calculate total collectibles across all levels
  const totalCollected = Object.values(levelState.levelProgress).reduce(
    (sum, progress) => {
      if (progress.levelId === levelState.currentLevel) {
        return sum + levelState.currentCollectibles;
      }
      return sum + (progress.completed ? 10 : 0);
    },
    0
  );
  const totalPossible = 100; // 10 levels × 10 collectibles

  const handleCharacterSelect = (c: CharacterId) => {
    soundManager.play('buttonClick');
    setCharacter(c);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-sky-200 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute bottom-0 w-full h-32 bg-green-500 z-0"></div>
      <div className="absolute top-10 left-10 text-9xl opacity-20 animate-pulse">☁️</div>
      <div className="absolute top-20 right-20 text-8xl opacity-20 animate-pulse delay-700">☁️</div>

      <div className="z-10 bg-white/90 backdrop-blur-sm p-8 md:p-12 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-center max-w-lg w-full border-b-8 border-sky-400 mx-4">
        <h1 className="text-5xl md:text-6xl font-black text-sky-600 mb-2 tracking-tight">
          Math Hopper
        </h1>
        <p className="text-2xl text-sky-400 font-bold mb-8">Jungle Adventure</p>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Collection Progress */}
          <button
            onClick={onViewCollection}
            className="bg-green-100 hover:bg-green-200 border-2 border-green-300 rounded-2xl p-3 flex items-center justify-center gap-2 transition-colors group"
          >
            <Package className="text-green-600 group-hover:scale-110 transition-transform" size={24} />
            <div className="text-left">
              <p className="text-sm font-bold text-green-700">Collection</p>
              <p className="text-xs text-green-600">{totalCollected}/{totalPossible}</p>
            </div>
          </button>

          {/* Level Select */}
          {onLevelSelect && (
            <button
              onClick={onLevelSelect}
              className="bg-purple-100 hover:bg-purple-200 border-2 border-purple-300 rounded-2xl p-3 flex items-center justify-center gap-2 transition-colors group"
            >
              <Map className="text-purple-600 group-hover:scale-110 transition-transform" size={24} />
              <div className="text-left">
                <p className="text-sm font-bold text-purple-700">Levels</p>
                <p className="text-xs text-purple-600">Select Stage</p>
              </div>
            </button>
          )}

          {/* High Scores */}
          {onViewHighScores && (
            <button
              onClick={onViewHighScores}
              className="bg-yellow-100 hover:bg-yellow-200 border-2 border-yellow-300 rounded-2xl p-3 flex items-center justify-center gap-2 transition-colors group col-span-2"
            >
              <Trophy className="text-yellow-600 group-hover:scale-110 transition-transform" size={24} />
              <div className="text-left">
                <p className="text-sm font-bold text-yellow-700">High Scores</p>
                <p className="text-xs text-yellow-600">View Leaderboard</p>
              </div>
            </button>
          )}
        </div>

        <div className="mb-8">
          <p className="text-gray-500 font-bold mb-4 uppercase tracking-wider text-sm">Choose Your Character</p>

          <div className="flex justify-center gap-4">
            {/* Amit Selection */}
            <button
               onClick={() => handleCharacterSelect('AMIT')}
               className={`relative flex flex-col items-center transition-all ${character === 'AMIT' ? 'scale-110' : 'opacity-60 hover:opacity-100 hover:scale-105'}`}
            >
               {character === 'AMIT' && (
                 <span className="absolute -top-10 text-xl font-black text-pink-500 animate-bounce bg-white px-3 py-1 rounded-full shadow-sm border-2 border-pink-200">
                    Amit
                 </span>
               )}
               <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border-4 shadow-xl transition-colors ${character === 'AMIT' ? 'bg-pink-100 border-pink-500 ring-4 ring-pink-200' : 'bg-gray-100 border-gray-300'}`}>
                 <span className="text-5xl filter drop-shadow-md">👧🏽</span>
               </div>
            </button>

            {/* Yuval Selection */}
            <button
               onClick={() => handleCharacterSelect('YUVAL')}
               className={`relative flex flex-col items-center transition-all ${character === 'YUVAL' ? 'scale-110' : 'opacity-60 hover:opacity-100 hover:scale-105'}`}
            >
               {character === 'YUVAL' && (
                 <span className="absolute -top-10 text-xl font-black text-purple-500 animate-bounce bg-white px-3 py-1 rounded-full shadow-sm border-2 border-purple-200">
                    Yuval
                 </span>
               )}
               <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border-4 shadow-xl transition-colors ${character === 'YUVAL' ? 'bg-purple-100 border-purple-500 ring-4 ring-purple-200' : 'bg-gray-100 border-gray-300'}`}>
                 <span className="text-5xl filter drop-shadow-md">👧🏻</span>
               </div>
            </button>

            {/* Kangaroo Selection */}
            <button
               onClick={() => handleCharacterSelect('KANGAROO')}
               className={`relative flex flex-col items-center transition-all ${character === 'KANGAROO' ? 'scale-110' : 'opacity-60 hover:opacity-100 hover:scale-105'}`}
            >
               {character === 'KANGAROO' && (
                 <span className="absolute -top-10 text-xl font-black text-orange-500 animate-bounce bg-white px-3 py-1 rounded-full shadow-sm border-2 border-orange-200">
                    Jumper
                 </span>
               )}
               <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border-4 shadow-xl transition-colors ${character === 'KANGAROO' ? 'bg-orange-100 border-orange-500 ring-4 ring-orange-200' : 'bg-gray-100 border-gray-300'}`}>
                 <span className="text-5xl filter drop-shadow-md">🦘</span>
               </div>
            </button>
          </div>
        </div>

        <button
          onClick={onStart}
          className="group relative inline-flex items-center justify-center px-8 py-4 text-2xl font-bold text-white transition-all duration-200 bg-green-500 font-sans rounded-full hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-offset-2 active:scale-95 w-full shadow-lg border-b-4 border-green-700"
        >
          <Play className="mr-3 w-8 h-8 fill-current" />
          Start Adventure
        </button>

        {/* Reset Progress Button */}
        {onResetProgress && (
          <button
            onClick={() => {
              soundManager.play('buttonClick');
              setShowResetConfirm(true);
            }}
            className="mt-4 flex items-center justify-center gap-2 w-full py-2 px-4 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition-all text-sm border-2 border-red-300"
          >
            <RotateCcw size={16} />
            Reset All Progress
          </button>
        )}

        <p className="mt-6 text-gray-400 text-sm font-semibold">
          For ages 4-6 • 10 Levels • Math Adventure Game
        </p>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex justify-center mb-4">
              <AlertTriangle size={48} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">
              Reset All Progress?
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              This will delete all collected animals, scores, and unlocked levels. This cannot be undone!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  soundManager.play('buttonClick');
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  soundManager.play('buttonClick');
                  if (onResetProgress) {
                    onResetProgress();
                  }
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainMenu;
