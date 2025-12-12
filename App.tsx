
import React, { useState, useEffect, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import MathModal from './components/MathModal';
import MainMenu from './components/MainMenu';
import CollectionView from './components/CollectionView';
import { GameState, MathQuestion, CharacterId, CollectionItem } from './types';
import { getMathQuestions } from './services/questions';
import { collectRandomItem, getCollectionStats, isThemeComplete, getCurrentTheme } from './services/collections';
import { RefreshCw, Star, Coins, Package } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [character, setCharacter] = useState<CharacterId>('AMIT');
  const [restartTrigger, setRestartTrigger] = useState(0);

  // Collection system state
  const [recentEmoji, setRecentEmoji] = useState<CollectionItem | null>(null);
  const [showEmojiReward, setShowEmojiReward] = useState(false);
  const [previousGameState, setPreviousGameState] = useState<GameState>(GameState.MENU);

  // Pre-load questions when game starts
  useEffect(() => {
    if (gameState === GameState.PLAYING && questions.length === 0 && !loadingQuestions) {
      setLoadingQuestions(true);
      getMathQuestions(currentLevel, 5).then(qs => {
        setQuestions(qs);
        setLoadingQuestions(false);
      });
    }
  }, [gameState, questions.length, loadingQuestions, currentLevel]);

  const handleStart = () => {
    setScore(0);
    setCurrentLevel(1);
    setQuestions([]);
    setGameState(GameState.PLAYING);
  };

  const handleGameRestart = useCallback(() => {
    // Complete game restart - reset all state
    setScore(0);
    setCurrentLevel(1);
    setQuestions([]);
    setCurrentQuestion(null);
    setLoadingQuestions(false);
    setGameState(GameState.PLAYING);
    setRestartTrigger(prev => prev + 1); // Signal restart to GameCanvas
  }, []);

  const handleTriggerQuestion = useCallback(async () => {
    setGameState(GameState.PAUSED_FOR_QUESTION);

    // If we have questions ready, use one. Else wait (loading state handled in Modal)
    if (questions.length > 0) {
      const nextQ = questions[0];
      const remainingQs = questions.slice(1);

      setCurrentQuestion(nextQ);
      setQuestions(remainingQs);

      // Fetch more in background if low
      if (remainingQs.length < 3 && !loadingQuestions) {
        getMathQuestions(currentLevel, 3).then(newQs => {
           setQuestions(prev => [...prev, ...newQs]);
        });
      }
    } else {
        // Emergency fetch if empty
        setLoadingQuestions(true);
        const newQs = await getMathQuestions(currentLevel, 3);
        if (newQs.length > 0) {
            const [first, ...rest] = newQs;
            setCurrentQuestion(first);
            setQuestions(rest);
        }
        setLoadingQuestions(false);
    }
  }, [questions, loadingQuestions, currentLevel]);

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      const newScore = score + 50;
      setScore(newScore);

      // Collect a random emoji on correct answer
      const collectedEmoji = collectRandomItem();
      if (collectedEmoji) {
        setRecentEmoji(collectedEmoji);
        setShowEmojiReward(true);

        // Hide emoji reward after 2 seconds
        setTimeout(() => {
          setShowEmojiReward(false);
          setRecentEmoji(null);
        }, 2000);
      }

      // Check if theme is complete
      if (isThemeComplete()) {
        setTimeout(() => {
          setGameState(GameState.VICTORY);
        }, 2500); // Show victory after emoji reward
      }

      setGameState(GameState.PLAYING);
      setCurrentQuestion(null);
    } else {
      // Wrong answer restarts the game completely
      handleGameRestart();
    }
  };

  const handleCollectCoin = useCallback(() => {
    setScore(s => s + 10);
  }, []);

  const handleLevelComplete = useCallback(() => {
    setGameState(GameState.VICTORY);
  }, []);

  const handleViewCollection = useCallback(() => {
    setPreviousGameState(gameState);
    setGameState(GameState.COLLECTION_VIEW);
  }, [gameState]);

  const handleBackFromCollection = useCallback(() => {
    setGameState(previousGameState);
  }, [previousGameState]);

  return (
    <div className="w-full h-screen relative overflow-hidden font-sans">
      {/* Game Layer */}
      {gameState !== GameState.MENU && gameState !== GameState.VICTORY && (
        <GameCanvas
          gameState={gameState}
          setGameState={setGameState}
          onTriggerQuestion={handleTriggerQuestion}
          onCollectCoin={handleCollectCoin}
          onLevelComplete={handleLevelComplete}
          onGameRestart={handleGameRestart}
          restartTrigger={restartTrigger}
          character={character}
        />
      )}

      {/* UI HUD */}
      {(gameState === GameState.PLAYING || gameState === GameState.PAUSED_FOR_QUESTION) && (
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
            <div className="bg-white/80 backdrop-blur rounded-2xl p-3 shadow-lg border-2 border-sky-300 flex items-center gap-2">
                <Coins className="text-yellow-500 fill-current" />
                <span className="text-2xl font-bold text-sky-800">{score}</span>
            </div>

            {/* Collection Progress */}
            <div
              className="bg-white/80 backdrop-blur rounded-2xl p-3 shadow-lg border-2 border-green-300 flex items-center gap-2 pointer-events-auto cursor-pointer hover:bg-white/90 transition-colors"
              onClick={handleViewCollection}
            >
              <Package className="text-green-600" />
              <span className="text-lg font-semibold text-green-600">
                {(() => {
                  const stats = getCollectionStats();
                  return `${stats.collected}/${stats.total}`;
                })()}
              </span>
            </div>

            <div className="bg-white/80 backdrop-blur rounded-2xl p-3 shadow-lg border-2 border-purple-300 flex items-center gap-2">
                <span className="text-lg font-semibold text-purple-600">Level</span>
                <span className="text-2xl font-bold text-purple-800">{currentLevel}</span>
            </div>
        </div>
      )}

      {/* Enhanced Emoji Reward Animation with Full Collection Preview */}
      {showEmojiReward && recentEmoji && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border-4 border-green-500 animate-bounce-in max-w-md w-full mx-4">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2 animate-pulse">{recentEmoji.emoji}</div>
              <h3 className="text-xl font-bold text-green-600 mb-1">New Animal Collected!</h3>
              <p className="text-lg text-gray-600">{recentEmoji.name}</p>
            </div>

            {/* Full Collection Grid - All 20 Animals */}
            <div className="bg-green-50 rounded-2xl p-3 border-2 border-green-200">
              <div className="grid grid-cols-5 gap-1.5">
                {(() => {
                  const theme = getCurrentTheme();
                  return theme.items.map((item) => ( // Show all 20 animals
                    <div
                      key={item.id}
                      className={`
                        aspect-square rounded-lg border-2 transition-all duration-300 flex items-center justify-center text-sm
                        ${item.collected
                          ? item.id === recentEmoji.id
                            ? 'border-yellow-400 bg-yellow-100 animate-pulse scale-110' // Newly collected
                            : 'border-green-400 bg-green-100' // Previously collected
                          : 'border-gray-300 bg-gray-100 opacity-40' // Not collected
                        }
                      `}
                    >
                      <span className={item.collected ? 'grayscale-0' : 'grayscale brightness-50'}>
                        {item.emoji}
                      </span>
                    </div>
                  ));
                })()}
              </div>
              <div className="text-center mt-2">
                <span className="text-xs text-green-600 font-semibold">
                  {(() => {
                    const stats = getCollectionStats();
                    return `${stats.collected} / ${stats.total} Animals Collected`;
                  })()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {gameState === GameState.MENU && (
        <MainMenu
          onStart={handleStart}
          character={character}
          setCharacter={setCharacter}
          onViewCollection={handleViewCollection}
        />
      )}

      {gameState === GameState.COLLECTION_VIEW && (
        <CollectionView onBack={handleBackFromCollection} />
      )}

      {gameState === GameState.PAUSED_FOR_QUESTION && (
        <MathModal
            question={currentQuestion}
            onAnswer={handleAnswer}
            isLoading={loadingQuestions && !currentQuestion}
        />
      )}

      {gameState === GameState.VICTORY && (
        <div className="absolute inset-0 bg-green-400 flex items-center justify-center animate-fade-in z-50">
             <div className="bg-white rounded-3xl p-12 text-center shadow-2xl max-w-md w-full mx-4 animate-bounce-in relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-4 bg-green-500"></div>
                <div className="flex justify-center mb-6">
                    <div className="text-6xl animate-bounce">🎉</div>
                </div>
                <h2 className="text-4xl font-bold text-green-700 mb-4">Collection Complete!</h2>
                <p className="text-xl text-green-600 mb-2">All jungle animals collected!</p>
                <p className="text-2xl text-gray-500 mb-8">Final Score: {score}</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleViewCollection}
                    className="bg-green-500 hover:bg-green-600 text-white text-lg font-bold py-3 px-6 rounded-full shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 flex-1"
                  >
                    <Package size={20} />
                    View Collection
                  </button>
                  <button
                    onClick={() => setGameState(GameState.MENU)}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold py-3 px-6 rounded-full shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 flex-1"
                  >
                    <RefreshCw size={20} />
                    Menu
                  </button>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default App;
