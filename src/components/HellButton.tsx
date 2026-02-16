'use client';

import { useState, useCallback } from 'react';

type ButtonVariant = 
  | 'glossy'
  | 'flat'
  | 'link'
  | 'pill'
  | 'tiny'
  | 'checkbox'
  | 'skeuomorphic'
  | 'win95'
  | 'dodge'
  | 'spin'
  | 'shake';

type ButtonLabel = 
  | 'OK'
  | 'Proceed??'
  | 'Yup'
  | 'Nope'
  | 'Continue (DO NOT CLICK)'
  | 'Submit'
  | 'Send'
  | 'Y'
  | 'Continue (unsafe)'
  | 'Do the thing'
  | 'Maybe'
  | 'Click?'
  | "Don't Click"
  | 'Next...'
  | 'Forward?'
  | 'Advance'
  | 'Progress'
  | 'Go'
  | 'Fine';

interface HellButtonProps {
  variant?: ButtonVariant;
  label?: ButtonLabel | string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'massive';
  hideOnMobile?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  glossy: 'glossy text-white px-6 py-3',
  flat: 'bg-[#808080] text-white px-4 py-2 border-none',
  link: 'text-[#0000FF] underline bg-transparent border-none p-0 hover:text-[#FF0000]',
  pill: 'bg-[#FF69B4] text-white px-8 py-4 rounded-full text-lg',
  tiny: 'bg-[#C0C0C0] text-black px-1 py-0.5 text-[8px] border border-[#808080]',
  checkbox: 'btn-checkbox',
  skeuomorphic: 'skeuomorphic px-6 py-3 text-white',
  win95: 'win95',
  dodge: 'bg-[#39FF14] text-[#8B4513] px-4 py-2 border-2 border-[#8B4513] btn-dodge',
  spin: 'bg-[#FF69B4] text-white px-6 py-3 rounded btn-spin',
  shake: 'bg-[#00FFFF] text-[#8B4513] px-4 py-2 btn-shake',
};

const sizeStyles: Record<string, string> = {
  tiny: 'text-[6px] px-1 py-0.5',
  small: 'text-xs px-2 py-1',
  medium: 'text-sm px-4 py-2',
  large: 'text-lg px-6 py-3',
  massive: 'text-2xl px-10 py-6',
};

const defaultLabels: ButtonLabel[] = [
  'OK',
  'Proceed??',
  'Yup',
  'Nope',
  'Continue (DO NOT CLICK)',
  'Submit',
  'Send',
  'Y',
  'Continue (unsafe)',
  'Do the thing',
];

export function HellButton({
  variant = 'glossy',
  label,
  onClick,
  disabled = false,
  className = '',
  size = 'medium',
  hideOnMobile = false,
}: HellButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [clickAttempts, setClickAttempts] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleClick = useCallback(() => {
    setClickAttempts(prev => prev + 1);
    
    // Sometimes the button doesn't work on first click
    if (clickAttempts === 0 && Math.random() > 0.7) {
      // Button "misses" the click
      return;
    }
    
    onClick?.();
  }, [clickAttempts, onClick]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    
    // Dodge button moves away
    if (variant === 'dodge') {
      setOffset({
        x: (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 20,
      });
    }
  }, [variant]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (variant === 'dodge') {
      setOffset({ x: 0, y: 0 });
    }
  }, [variant]);

  // Random font for each button
  const fonts = [
    "'Comic Neue', cursive",
    "'Bangers', cursive",
    "'Press Start 2P', cursive",
    "'VT323', monospace",
    "'Arial Black', sans-serif",
    "'Times New Roman', serif",
    "'Courier New', monospace",
  ];
  const randomFont = fonts[Math.floor(Math.random() * fonts.length)];

  const displayLabel = label || defaultLabels[Math.floor(Math.random() * defaultLabels.length)];

  if (variant === 'checkbox') {
    return (
      <label className={`inline-flex items-center gap-2 cursor-pointer ${className}`}>
        <input
          type="checkbox"
          className="btn-checkbox"
          onClick={handleClick}
          disabled={disabled}
        />
        <span style={{ fontFamily: randomFont }}>{displayLabel}</span>
      </label>
    );
  }

  return (
    <button
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${hideOnMobile ? 'md:block hidden' : ''}
        cursor-pointer transition-all
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      style={{
        fontFamily: randomFont,
        transform: `translate(${offset.x}px, ${offset.y}px) ${isHovered && variant === 'spin' ? 'rotate(360deg)' : ''}`,
        transition: variant === 'dodge' ? 'transform 0.1s' : 'all 0.3s',
        // Primary action button slightly off screen on mobile
        ...(hideOnMobile && {
          position: 'relative',
          right: '-10px',
        }),
      }}
    >
      {displayLabel}
      {variant === 'glossy' && isHovered && (
        <span className="ml-2 animate-blink-fast">✨</span>
      )}
    </button>
  );
}

// Collection of buttons for forms
interface ButtonGroupProps {
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  primaryLabel?: string;
  secondaryLabel?: string;
}

export function HellButtonGroup({
  onPrimaryClick,
  onSecondaryClick,
  primaryLabel = 'Submit',
  secondaryLabel = 'Cancel (does nothing)',
}: ButtonGroupProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center justify-between mt-4">
      {/* Primary button - styled inconsistently */}
      <HellButton
        variant="glossy"
        label={primaryLabel}
        onClick={onPrimaryClick}
        size="large"
        className="ml-auto mr-4"
      />
      
      {/* Secondary button - more prominent than primary */}
      <HellButton
        variant="pill"
        label={secondaryLabel}
        onClick={onSecondaryClick}
        size="massive"
      />
      
      {/* Mystery third button */}
      <HellButton
        variant="link"
        label="???"
        onClick={() => alert('You found the mystery button! Your reward: nothing.')}
        size="tiny"
      />
    </div>
  );
}

// Progress button that shows fake progress
export function ProgressButton({ 
  onClick, 
  label = 'Process' 
}: { 
  onClick?: () => void; 
  label?: string;
}) {
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [stage, setStage] = useState(0);

  const stages = [
    'Initializing...',
    'Loading loaders...',
    'Processing process...',
    'Almost there (lie)...',
    'Still going...',
    'Just a bit more...',
    'You\'re still here?',
    'Almost almost there...',
    '99% complete forever...',
  ];

  const handleClick = () => {
    if (isProcessing || isCoolingDown) {
      return;
    }

    // Sometimes reject a click for "security" reasons.
    if (Math.random() > 0.83) {
      setIsCoolingDown(true);
      setTimeout(() => setIsCoolingDown(false), 1200);
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setStage(0);

    const interval = window.setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 15;
        if (next >= 97) {
          window.clearInterval(interval);
          return 97; // Never reaches 100
        }
        return next;
      });
      
      setStage(prev => Math.min(prev + 1, stages.length - 1));
    }, 500);

    // Actually call onClick after fake delay
    window.setTimeout(() => {
      window.clearInterval(interval);
      onClick?.();
      setIsProcessing(false);
      setIsCoolingDown(true);
      setStage(0);
      setProgress(0);
      window.setTimeout(() => setIsCoolingDown(false), 900);
    }, 3000 + Math.floor(Math.random() * 900));
  };

  return (
    <div className="inline-block">
      <HellButton
        variant="skeuomorphic"
        label={isProcessing ? stages[stage] : isCoolingDown ? 'Recalibrating...' : label}
        onClick={handleClick}
        disabled={isProcessing || isCoolingDown}
      />
      {isProcessing && (
        <div className="progress-lie mt-2 w-48">
          <div 
            className="progress-lie-fill"
            style={{ width: `${progress}%` }}
          />
          <div className="progress-lie-text">
            {Math.floor(progress)}%
          </div>
        </div>
      )}
    </div>
  );
}

export default HellButton;
