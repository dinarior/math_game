
import React, { useState, useEffect, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import MathModal from './components/MathModal';
import MainMenu from './components/MainMenu';
import CollectionView from './components/CollectionView';
import LevelSelect from './components/LevelSelect';
import LevelComplete from './components/LevelComplete';
import HighScoreTable, { HighScoreEntryModal } from './components/HighScoreTable';
import { GameState, MathQuestion, CharacterId } from './types';
import { generateQuestion } from './services/questionGenerator';
import {
  loadLevelState,
  startLevel,
  awardCollectible,
  collectCoin,
  stompEnemy,
  loseLife,
  completeLevel,
  resetAllProgress,
  LevelState,
} from './services/levelManager';
import { isHighScore } from './services/highScores';
import soundManager, { initSoundOnInteraction } from './services/soundManager';
import { RefreshCw } from 'lucide-react';
import { LEVEL_CONFIGS } from './config/levels';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [character, setCharacter] = useState<CharacterId>('AMIT');
  const [restartTrigger, setRestartTrigger] = useState(0);

  // Level state (persisted)
  const [levelState, setLevelState] = useState<LevelState>(loadLevelState);

  // High score entry modal
  const [showHighScoreEntry, setShowHighScoreEntry] = useState(false);
  const [pendingHighScore, setPendingHighScore] = useState<{ score: number; level: number } | null>(null);

  // Initialize sound on user interaction
  useEffect(() => {
    initSoundOnInteraction();
  }, []);

  // Derived state
  const score = levelState.currentScore;
  const currentLevel = levelState.currentLevel;
  const lives = levelState.currentLives;
  const collectiblesCount = levelState.currentCollectibles;

  // Start game from menu
  const handleStart = useCallback(() => {
    soundManager.play('buttonClick');
    const newState = startLevel(levelState, 1);
    setLevelState(newState);
    setRestartTrigger(prev => prev + 1);
    setGameState(GameState.PLAYING);
  }, [levelState]);

  // Start specific level
  const handleStartLevel = useCallback((levelId: number) => {
    const newState = startLevel(levelState, levelId);
    setLevelState(newState);
    setRestartTrigger(prev => prev + 1);
    setGameState(GameState.PLAYING);
  }, [levelState]);

  // Game restart (full reset of current level)
  const handleGameRestart = useCallback(() => {
    const newState = startLevel(levelState, currentLevel);
    setLevelState(newState);
    setCurrentQuestion(null);
    setLoadingQuestions(false);
    setRestartTrigger(prev => prev + 1);
    setGameState(GameState.PLAYING);
  }, [levelState, currentLevel]);

  // Trigger a question
  const handleTriggerQuestion = useCallback(() => {
    setGameState(GameState.PAUSED_FOR_QUESTION);

    // Generate a new question for the current level
    const question = generateQuestion(currentLevel);
    setCurrentQuestion({
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
    });
  }, [currentLevel]);

  // Handle answer
  const handleAnswer = useCallback((correct: boolean) => {
    if (correct) {
      soundManager.play('correctAnswer');

      // Award collectible
      const result = awardCollectible(levelState);
      setLevelState(result.state);

      // Check if level is complete (20 collectibles)
      if (result.levelComplete) {
        setTimeout(() => {
          const completedState = completeLevel(result.state);
          setLevelState(completedState);
          setGameState(GameState.LEVEL_COMPLETE);
        }, 500);
      }

      setGameState(GameState.PLAYING);
      setCurrentQuestion(null);
    } else {
      soundManager.play('wrongAnswer');
      // Wrong answer - just continue playing
      setGameState(GameState.PLAYING);
      setCurrentQuestion(null);
    }
  }, [levelState]);

  // Handle coin collection
  const handleCollectCoin = useCallback(() => {
    setLevelState(prev => collectCoin(prev));
  }, []);

  // Handle enemy stomp
  const handleStompEnemy = useCallback(() => {
    setLevelState(prev => stompEnemy(prev));
  }, []);

  // Handle losing a life
  const handleLoseLife = useCallback(() => {
    const result = loseLife(levelState);
    setLevelState(result.state);

    if (result.gameOver) {
      soundManager.play('gameOver');

      // Check for high score
      if (isHighScore(levelState.currentScore)) {
        setPendingHighScore({
          score: levelState.currentScore,
          level: levelState.currentLevel,
        });
        setShowHighScoreEntry(true);
      } else {
        setGameState(GameState.GAME_OVER);
      }
    }
  }, [levelState]);

  // Handle level complete -> next level
  const handleNextLevel = useCallback(() => {
    const nextLevelId = currentLevel + 1;
    if (nextLevelId <= LEVEL_CONFIGS.length) {
      const newState = startLevel(levelState, nextLevelId);
      setLevelState(newState);
      setRestartTrigger(prev => prev + 1);
      setGameState(GameState.PLAYING);
    } else {
      // All levels complete!
      setGameState(GameState.VICTORY);
    }
  }, [currentLevel, levelState]);

  // View collection
  const handleViewCollection = useCallback(() => {
    setGameState(GameState.COLLECTION_VIEW);
  }, []);

  const handleBackFromCollection = useCallback(() => {
    setGameState(GameState.MENU);
  }, []);

  // Handle continue playing (stay on same level after completion)
  const handleContinuePlaying = useCallback(() => {
    setGameState(GameState.PLAYING);
  }, []);

  // Handle reset all progress
  const handleResetProgress = useCallback(() => {
    const newState = resetAllProgress();
    setLevelState(newState);
    setGameState(GameState.MENU);
  }, []);

  // High score entry
  const handleHighScoreSubmit = useCallback(() => {
    setShowHighScoreEntry(false);
    setPendingHighScore(null);
    setGameState(GameState.HIGH_SCORES);
  }, []);

  const handleHighScoreSkip = useCallback(() => {
    setShowHighScoreEntry(false);
    setPendingHighScore(null);
    setGameState(GameState.GAME_OVER);
  }, []);

  // Go to level select
  const handleLevelSelect = useCallback(() => {
    soundManager.play('buttonClick');
    setGameState(GameState.LEVEL_SELECT);
  }, []);

  // Go to high scores
  const handleViewHighScores = useCallback(() => {
    soundManager.play('buttonClick');
    setGameState(GameState.HIGH_SCORES);
  }, []);

  // Return to menu
  const handleMainMenu = useCallback(() => {
    soundManager.play('buttonClick');
    setGameState(GameState.MENU);
  }, []);

  const isLastLevel = currentLevel >= LEVEL_CONFIGS.length;

  return (
    <div className="w-full h-screen relative overflow-hidden font-sans">
      {/* Game Layer */}
      {(gameState === GameState.PLAYING ||
        gameState === GameState.PAUSED_FOR_QUESTION) && (
        <GameCanvas
          gameState={gameState}
          setGameState={setGameState}
          onTriggerQuestion={handleTriggerQuestion}
          onCollectCoin={handleCollectCoin}
          onLevelComplete={() => {}}
          onGameRestart={handleGameRestart}
          onLoseLife={handleLoseLife}
          onStompEnemy={handleStompEnemy}
          restartTrigger={restartTrigger}
          character={character}
          level={currentLevel}
          lives={lives}
          collectiblesCount={collectiblesCount}
          score={score}
        />
      )}

      {/* Modals & Screens */}
      {gameState === GameState.MENU && (
        <MainMenu
          onStart={handleStart}
          character={character}
          setCharacter={setCharacter}
          onViewCollection={handleViewCollection}
          onLevelSelect={handleLevelSelect}
          onViewHighScores={handleViewHighScores}
          onResetProgress={handleResetProgress}
          levelState={levelState}
        />
      )}

      {gameState === GameState.LEVEL_SELECT && (
        <LevelSelect
          levelState={levelState}
          onSelectLevel={handleStartLevel}
          onBack={handleMainMenu}
        />
      )}

      {gameState === GameState.HIGH_SCORES && (
        <HighScoreTable onBack={handleMainMenu} />
      )}

      {gameState === GameState.COLLECTION_VIEW && (
        <CollectionView onBack={handleBackFromCollection} levelState={levelState} />
      )}

      {gameState === GameState.PAUSED_FOR_QUESTION && (
        <MathModal
          question={currentQuestion}
          onAnswer={handleAnswer}
          isLoading={loadingQuestions && !currentQuestion}
        />
      )}

      {gameState === GameState.LEVEL_COMPLETE && (
        <LevelComplete
          level={currentLevel}
          score={score}
          livesRemaining={lives}
          onNextLevel={handleNextLevel}
          onMainMenu={handleMainMenu}
          onContinuePlaying={handleContinuePlaying}
          isLastLevel={isLastLevel}
        />
      )}

      {gameState === GameState.GAME_OVER && (
        <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center animate-fade-in z-50">
          <div className="bg-white rounded-3xl p-12 text-center shadow-2xl max-w-md w-full mx-4 animate-bounce-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-4 bg-red-600"></div>
            <div className="flex justify-center mb-6">
              <div className="text-6xl">😢</div>
            </div>
            <h2 className="text-4xl font-bold text-red-700 mb-4">Game Over</h2>
            <p className="text-xl text-gray-600 mb-2">Level {currentLevel}</p>
            <p className="text-2xl text-gray-500 mb-8">Score: {score}</p>
            <div className="flex gap-3">
              <button
                onClick={handleGameRestart}
                className="bg-red-500 hover:bg-red-600 text-white text-lg font-bold py-3 px-6 rounded-full shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 flex-1"
              >
                <RefreshCw size={20} />
                Try Again
              </button>
              <button
                onClick={handleMainMenu}
                className="bg-gray-500 hover:bg-gray-600 text-white text-lg font-bold py-3 px-6 rounded-full shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 flex-1"
              >
                Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === GameState.VICTORY && (
        <div className="absolute inset-0 bg-green-400 flex items-center justify-center animate-fade-in z-50">
          <div className="bg-white rounded-3xl p-12 text-center shadow-2xl max-w-md w-full mx-4 animate-bounce-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-4 bg-green-500"></div>
            <div className="flex justify-center mb-6">
              <div className="text-6xl animate-bounce">🎉</div>
            </div>
            <h2 className="text-4xl font-bold text-green-700 mb-4">
              {isLastLevel ? 'All Levels Complete!' : 'Collection Complete!'}
            </h2>
            <p className="text-xl text-green-600 mb-2">All jungle animals collected!</p>
            <p className="text-2xl text-gray-500 mb-8">Final Score: {levelState.totalScore + score}</p>
            <div className="flex gap-3">
              <button
                onClick={handleViewCollection}
                className="bg-green-500 hover:bg-green-600 text-white text-lg font-bold py-3 px-6 rounded-full shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 flex-1"
              >
                <Package size={20} />
                View Collection
              </button>
              <button
                onClick={handleMainMenu}
                className="bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold py-3 px-6 rounded-full shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 flex-1"
              >
                <RefreshCw size={20} />
                Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* High Score Entry Modal */}
      {showHighScoreEntry && pendingHighScore && (
        <HighScoreEntryModal
          score={pendingHighScore.score}
          level={pendingHighScore.level}
          onSubmit={handleHighScoreSubmit}
          onSkip={handleHighScoreSkip}
        />
      )}
    </div>
  );
};

export default App;
