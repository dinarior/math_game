import React, { useState, useEffect, useCallback } from 'react';
import { MathQuestion } from '../types';
import { Sparkles, CheckCircle2, XCircle } from 'lucide-react';

interface MathModalProps {
  question: MathQuestion | null;
  onAnswer: (correct: boolean) => void;
  isLoading: boolean;
}

const MathModal: React.FC<MathModalProps> = ({ question, onAnswer, isLoading }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);

  useEffect(() => {
    // Reset state when a new question arrives
    if (question) {
      setSelectedOption(null);
      setFeedback(null);
      setHighlightedIndex(0);
    }
  }, [question]);

  const handleOptionClick = useCallback((option: string) => {
    if (feedback !== null) return; // Prevent clicking after answered

    setSelectedOption(option);
    const isCorrect = option === question?.correctAnswer;

    if (isCorrect) {
      setFeedback('correct');
      // Delay to show success animation
      setTimeout(() => {
        onAnswer(true);
      }, 1500);
    } else {
      setFeedback('incorrect');
      setTimeout(() => {
        onAnswer(false); // Restart the game immediately after showing error feedback
      }, 800); // Reduced delay for quicker restart
    }
  }, [question?.correctAnswer, feedback, onAnswer]);

  // Keyboard navigation
  useEffect(() => {
    if (!question || feedback !== null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev =>
            prev > 0 ? prev - 1 : question.options.length - 1
          );
          break;
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev =>
            prev < question.options.length - 1 ? prev + 1 : 0
          );
          break;
        case 'Enter':
          e.preventDefault();
          handleOptionClick(question.options[highlightedIndex]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [question, feedback, highlightedIndex, handleOptionClick]);

  if (!question && isLoading) {
    return (
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full mx-4 border-4 border-sky-400">
          <div className="animate-spin text-sky-500">
            <Sparkles size={48} />
          </div>
          <p className="text-xl font-bold text-sky-600 font-sans">Thinking of a fun puzzle...</p>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-md w-full mx-4 border-b-8 border-r-8 border-sky-500 relative transform transition-all animate-bounce-in">

        {/* Header Icon */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-yellow-400 p-4 rounded-full border-4 border-white shadow-lg">
          <span className="text-4xl">❓</span>
        </div>

        <div className="mt-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 leading-tight">
            {question.question}
          </h2>

          <div className="grid gap-4">
            {question.options.map((option, idx) => {
              let btnClass = "py-4 px-6 rounded-2xl text-2xl font-bold transition-all transform active:scale-95 border-b-4 ";

              if (feedback === 'correct' && option === question.correctAnswer) {
                btnClass += "bg-green-500 border-green-700 text-white scale-105 shadow-lg";
              } else if (feedback === 'incorrect' && option === selectedOption) {
                btnClass += "bg-red-500 border-red-700 text-white";
              } else if (feedback !== null && option !== question.correctAnswer) {
                 btnClass += "bg-gray-100 border-gray-300 text-gray-400";
              } else if (highlightedIndex === idx && feedback === null) {
                // Keyboard highlighted option
                btnClass += "bg-yellow-200 border-yellow-400 text-yellow-800 scale-105 shadow-lg ring-4 ring-yellow-300";
              } else {
                btnClass += "bg-sky-100 border-sky-300 text-sky-700 hover:bg-sky-200 hover:border-sky-400";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(option)}
                  className={btnClass}
                  disabled={feedback !== null}
                >
                  <div className="flex items-center justify-center gap-3">
                    {option}
                    {feedback === 'correct' && option === question.correctAnswer && <CheckCircle2 className="animate-bounce" />}
                    {feedback === 'incorrect' && option === selectedOption && <XCircle className="animate-pulse" />}
                  </div>
                </button>
              );
            })}
          </div>

          {feedback === 'correct' && (
            <div className="mt-4 text-green-600 font-bold text-xl animate-bounce">
              {question.explanation || "Great Job!"}
            </div>
          )}
          {feedback === 'incorrect' && (
            <div className="mt-4 text-red-500 font-bold text-xl animate-shake">
              Oops! Try again!
            </div>
          )}

          {/* Keyboard instructions */}
          {feedback === null && (
            <div className="mt-4 text-sm text-gray-500">
              Use ↑↓ keys to navigate, Enter to select
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MathModal;
