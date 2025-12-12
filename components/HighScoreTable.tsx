import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, X } from 'lucide-react';
import {
  getHighScores,
  addHighScore,
  createHighScoreEntry,
  getMedalEmoji,
  formatDate,
  getRandomDefaultName,
} from '../services/highScores';
import { HighScoreEntry } from '../types';
import soundManager from '../services/soundManager';

interface HighScoreTableProps {
  onBack: () => void;
}

const HighScoreTable: React.FC<HighScoreTableProps> = ({ onBack }) => {
  const [scores, setScores] = useState<HighScoreEntry[]>([]);

  useEffect(() => {
    setScores(getHighScores());
  }, []);

  const handleBackClick = () => {
    soundManager.play('buttonClick');
    onBack();
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-yellow-400 to-orange-500 flex flex-col items-center justify-start p-4 overflow-auto">
      {/* Header */}
      <div className="w-full max-w-2xl mb-4">
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 text-white hover:text-yellow-100 transition-colors"
        >
          <ArrowLeft size={24} />
          <span className="text-lg font-bold">חזרה</span>
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Trophy size={40} className="text-yellow-200" />
        <h1 className="text-4xl font-bold text-white drop-shadow-lg">
          טבלת שיאים
        </h1>
      </div>

      {/* Scores Table */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {scores.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">🎮</div>
            <p className="text-lg">עדיין אין שיאים.</p>
            <p>שחק כדי להיות הראשון!</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-200">
                <th className="py-3 px-4 text-right text-gray-600 font-bold">#</th>
                <th className="py-3 px-4 text-right text-gray-600 font-bold">שם</th>
                <th className="py-3 px-4 text-center text-gray-600 font-bold">ניקוד</th>
                <th className="py-3 px-4 text-center text-gray-600 font-bold">שלב</th>
                <th className="py-3 px-4 text-left text-gray-600 font-bold">תאריך</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((entry, index) => {
                const rank = index + 1;
                const medal = getMedalEmoji(rank);
                const isTopThree = rank <= 3;

                return (
                  <tr
                    key={`${entry.name}-${entry.date}`}
                    className={`
                      border-b border-gray-100 transition-colors
                      ${isTopThree ? 'bg-yellow-50' : 'hover:bg-gray-50'}
                    `}
                  >
                    <td className="py-4 px-4">
                      <span className="text-2xl">{medal || rank}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-bold ${isTopThree ? 'text-yellow-700' : 'text-gray-800'}`}>
                        {entry.name}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`font-bold text-lg ${isTopThree ? 'text-yellow-600' : 'text-gray-700'}`}>
                        {entry.score.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="bg-gray-200 px-2 py-1 rounded-full text-sm font-medium">
                        {entry.level}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-left text-gray-500 text-sm">
                      {formatDate(entry.date)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// High Score Entry Modal (for entering name after achieving a high score)
interface HighScoreEntryModalProps {
  score: number;
  level: number;
  onSubmit: (name: string) => void;
  onSkip: () => void;
}

export const HighScoreEntryModal: React.FC<HighScoreEntryModalProps> = ({
  score,
  level,
  onSubmit,
  onSkip,
}) => {
  const [name, setName] = useState(getRandomDefaultName());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.play('correctAnswer');
    const entry = createHighScoreEntry(name || getRandomDefaultName(), score, level);
    addHighScore(entry);
    onSubmit(name);
  };

  const handleSkip = () => {
    soundManager.play('buttonClick');
    onSkip();
  };

  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-bounce-in">
        {/* Trophy */}
        <div className="text-5xl mb-4">🏆</div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          שיא חדש!
        </h2>
        <p className="text-gray-600 mb-6">
          הצלחת להשיג {score.toLocaleString()} נקודות!
        </p>

        <form onSubmit={handleSubmit}>
          <label className="block text-right text-gray-700 font-medium mb-2">
            הכנס את שמך:
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-right text-lg focus:border-yellow-400 focus:outline-none mb-6"
            placeholder="שם השחקן"
            dir="rtl"
          />

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 py-3 px-6 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              שמור שיא
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HighScoreTable;
