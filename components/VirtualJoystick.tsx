import React, { useRef, useState, useEffect, useCallback } from 'react';

interface VirtualJoystickProps {
  onMove: (direction: 'left' | 'right' | 'neutral') => void;
  size?: number;
}

const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove, size = 120 }) => {
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const activePointerRef = useRef<number | null>(null);

  const maxDistance = size / 2 - 20; // Maximum distance the stick can move

  const handleStart = useCallback((clientX: number, clientY: number, pointerId: number) => {
    if (activePointerRef.current !== null) return; // Already tracking a pointer

    activePointerRef.current = pointerId;
    setIsActive(true);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance <= maxDistance) {
        setPosition({ x: deltaX, y: deltaY });
      } else {
        const angle = Math.atan2(deltaY, deltaX);
        setPosition({
          x: Math.cos(angle) * maxDistance,
          y: Math.sin(angle) * maxDistance
        });
      }
    }
  }, [maxDistance]);

  const handleMove = useCallback((clientX: number, clientY: number, pointerId: number) => {
    if (activePointerRef.current !== pointerId) return; // Ignore if not our pointer

    if (containerRef.current && isActive) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance <= maxDistance) {
        setPosition({ x: deltaX, y: deltaY });
      } else {
        const angle = Math.atan2(deltaY, deltaX);
        setPosition({
          x: Math.cos(angle) * maxDistance,
          y: Math.sin(angle) * maxDistance
        });
      }
    }
  }, [isActive, maxDistance]);

  const handleEnd = useCallback((pointerId: number) => {
    if (activePointerRef.current !== pointerId) return; // Ignore if not our pointer

    activePointerRef.current = null;
    setIsActive(false);
    setPosition({ x: 0, y: 0 });
    onMove('neutral');
  }, [onMove]);

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY, touch.identifier);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      const touch = Array.from(e.touches).find(t => t.identifier === activePointerRef.current);
      if (touch) {
        handleMove(touch.clientX, touch.clientY, touch.identifier);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (activePointerRef.current !== null) {
      const touch = Array.from(e.changedTouches).find(t => t.identifier === activePointerRef.current);
      if (touch) {
        handleEnd(touch.identifier);
      }
    }
  };

  // Mouse event handlers (for desktop testing)
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY, -1);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleMove(e.clientX, e.clientY, -1);
  }, [handleMove]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    handleEnd(-1);
  }, [handleEnd]);

  useEffect(() => {
    if (isActive && activePointerRef.current === -1) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isActive, handleMouseMove, handleMouseUp]);

  // Calculate direction based on position
  useEffect(() => {
    if (isActive) {
      const threshold = 10; // Minimum movement to register
      if (Math.abs(position.x) > threshold) {
        if (position.x > 0) {
          onMove('right');
        } else {
          onMove('left');
        }
      } else {
        onMove('neutral');
      }
    }
  }, [position, isActive, onMove]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center touch-none select-none"
      style={{ width: size, height: size }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      {/* Outer circle */}
      <div
        className="absolute rounded-full bg-white/30 backdrop-blur-md border-4 border-white/50"
        style={{ width: size, height: size }}
      />

      {/* Inner stick */}
      <div
        className={`absolute rounded-full bg-white/70 backdrop-blur-md border-4 border-white transition-all ${
          isActive ? 'scale-110 bg-sky-400/90' : 'scale-100'
        }`}
        style={{
          width: size / 2,
          height: size / 2,
          transform: `translate(${position.x}px, ${position.y}px)`
        }}
      >
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-sky-700" />
        </div>
      </div>
    </div>
  );
};

export default VirtualJoystick;
