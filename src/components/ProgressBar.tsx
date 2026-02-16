'use client';

import { useState, useEffect } from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function ProgressBar({ currentStep, totalSteps, className = '' }: ProgressBarProps) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [lieMode, setLieMode] = useState(false);

  // The progress bar lies
  useEffect(() => {
    const actualProgress = (currentStep / totalSteps) * 100;
    
    // Sometimes show completely wrong progress
    if (Math.random() > 0.7) {
      setLieMode(true);
      const fakeProgress = [12, 88, 31, 104, 7, 95, 67, 110, 23, 99][Math.floor(Math.random() * 10)];
      setDisplayProgress(fakeProgress);
    } else {
      setLieMode(false);
      // Even "accurate" progress is slightly wrong
      setDisplayProgress(actualProgress + (Math.random() * 20 - 10));
    }
  }, [currentStep, totalSteps]);

  const getMessage = () => {
    if (lieMode) {
      return [
        'Progress: ???',
        'Loading progress...',
        'Error: Too much progress',
        'Progress not found',
        'Your progress is in another castle',
      ][Math.floor(Math.random() * 5)];
    }
    
    if (displayProgress < 25) return 'Just getting started...';
    if (displayProgress < 50) return 'About halfway (not really)';
    if (displayProgress < 75) return 'Almost there (we lie)';
    if (displayProgress < 100) return 'So close! (still lying)';
    return 'Complete! (nothing is complete)';
  };

  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex justify-between mb-1">
        <span 
          className="text-sm"
          style={{ 
            fontFamily: "'Comic Neue', cursive",
            color: lieMode ? '#FF0000' : '#8B4513',
          }}
        >
          Step {currentStep} of {totalSteps}
        </span>
        <span 
          className="text-sm animate-blink-fast"
          style={{ 
            fontFamily: "'Press Start 2P', cursive",
            fontSize: '8px',
          }}
        >
          {Math.floor(displayProgress)}%
        </span>
      </div>
      
      <div className="progress-lie h-6">
        <div 
          className="progress-lie-fill"
          style={{ 
            width: `${Math.min(displayProgress, 110)}%`,
            background: lieMode 
              ? 'linear-gradient(90deg, #FF0000, #FF69B4, #FF0000)'
              : 'linear-gradient(90deg, #39FF14, #00FFFF, #FF69B4)',
          }}
        />
        <div className="progress-lie-text">
          {getMessage()}
        </div>
      </div>
      
      {/* Fake sub-progress bars */}
      <div className="flex gap-1 mt-2">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i}
            className="h-1 flex-1 bg-[#808080] rounded"
          >
            <div 
              className="h-full bg-[#39FF14] rounded"
              style={{ 
                width: `${Math.random() * 100}%`,
                transition: 'width 0.5s',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Mini progress indicator for headers
export function MiniProgress({ progress }: { progress: number }) {
  return (
    <div 
      className="inline-flex items-center gap-2 px-2 py-1 bg-[#FFFF99] border border-[#8B4513] rounded"
      style={{ fontFamily: "'VT323', monospace" }}
    >
      <div className="flex gap-0.5">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i}
            className={`w-2 h-3 ${i < progress / 10 ? 'bg-[#39FF14]' : 'bg-[#808080]'}`}
            style={{ 
              transform: `rotate(${i * 5 - 22.5}deg)`,
              transformOrigin: 'bottom center',
            }}
          />
        ))}
      </div>
      <span className="text-xs">{progress}%</span>
    </div>
  );
}

export default ProgressBar;
