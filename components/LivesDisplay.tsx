import React from 'react';

interface LivesDisplayProps {
  lives: number;
  maxLives?: number;
  size?: 'small' | 'medium' | 'large';
}

const LivesDisplay: React.FC<LivesDisplayProps> = ({
  lives,
  maxLives = 3,
  size = 'medium',
}) => {
  const sizeClasses = {
    small: 'text-lg gap-0.5',
    medium: 'text-2xl gap-1',
    large: 'text-4xl gap-2',
  };

  return (
    <div className={`flex items-center ${sizeClasses[size]}`}>
      {Array.from({ length: maxLives }, (_, i) => (
        <span
          key={i}
          className={`
            transition-all duration-200
            ${i < lives ? 'opacity-100 scale-100' : 'opacity-30 scale-90 grayscale'}
          `}
        >
          {i < lives ? '❤️' : '🖤'}
        </span>
      ))}
    </div>
  );
};

export default LivesDisplay;
