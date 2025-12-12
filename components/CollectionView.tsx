import React, { useState } from 'react';
import { getCurrentTheme, getCollectionStats, resetCollectionProgress } from '../services/collections';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface CollectionViewProps {
  onBack: () => void;
}

const CollectionView: React.FC<CollectionViewProps> = ({ onBack }) => {
  const [theme, setTheme] = useState(getCurrentTheme());
  const [stats, setStats] = useState(getCollectionStats());
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    resetCollectionProgress();
    // Refresh the data after reset
    setTheme(getCurrentTheme());
    setStats(getCollectionStats());
    setShowResetConfirm(false);
  };

  return (
    <div className="absolute inset-0 bg-green-400 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-green-500 p-4 shadow-lg">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="bg-white text-green-600 px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-green-50 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Game
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">{theme.name}</h1>
            <p className="text-green-100">
              {stats.collected} / {stats.total} collected ({stats.percentage}%)
            </p>
          </div>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 transition-colors"
          >
            <RotateCcw size={20} />
            Reset
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-4 bg-white border-b-4 border-green-600">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-full transition-all duration-500"
              style={{ width: `${stats.percentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Collection Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-4">
            {theme.items.map((item, index) => (
              <div
                key={item.id}
                className={`
                  relative aspect-square rounded-xl border-4 transition-all duration-300 flex items-center justify-center
                  ${item.collected
                    ? 'border-green-500 bg-white shadow-lg scale-105'
                    : 'border-gray-400 bg-gray-200 opacity-50'
                  }
                `}
              >
                <span
                  className={`text-4xl transition-all duration-300 ${
                    item.collected ? 'grayscale-0' : 'grayscale brightness-50'
                  }`}
                >
                  {item.emoji}
                </span>

                {/* Collection order number */}
                {item.collected && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {index + 1}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Completion Message */}
          {stats.collected === stats.total && (
            <div className="mt-8 text-center">
              <div className="bg-yellow-400 rounded-2xl p-6 shadow-xl border-4 border-yellow-500">
                <h2 className="text-3xl font-bold text-yellow-800 mb-2">🎉 Collection Complete! 🎉</h2>
                <p className="text-yellow-700 text-lg">
                  You've collected all {stats.total} jungle animals! Ready for the next adventure?
                </p>
              </div>
            </div>
          )}

          {/* Animal Names Grid */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {theme.items.map((item) => (
              <div
                key={`name-${item.id}`}
                className={`
                  p-3 rounded-lg text-center transition-all
                  ${item.collected
                    ? 'bg-white text-green-800 shadow-md'
                    : 'bg-gray-300 text-gray-500'
                  }
                `}
              >
                <span className="text-sm font-semibold">
                  {item.emoji} {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Reset Collection?</h2>
            <p className="text-gray-600 mb-6">
              This will permanently delete all your collected animals. You'll have to collect them again by answering math questions.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full transition-colors"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionView;