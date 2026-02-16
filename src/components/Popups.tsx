'use client';

import { useState, useEffect, useCallback } from 'react';
import { getRandomPopup } from '@/data/disclaimers';

interface PopupProps {
  title: string;
  message: string;
  buttonText: string;
  onClose: () => void;
  variant?: 'normal' | 'annoying' | 'impossible';
}

function Popup({ title, message, buttonText, onClose, variant = 'normal' }: PopupProps) {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [closeAttempts, setCloseAttempts] = useState(0);

  const movePopup = useCallback(() => {
    if (variant === 'annoying') {
      setPosition({
        x: Math.random() * (window.innerWidth - 400),
        y: Math.random() * (window.innerHeight - 300),
      });
    }
  }, [variant]);

  useEffect(() => {
    if (variant === 'annoying') {
      const interval = setInterval(movePopup, 3000);
      return () => clearInterval(interval);
    }
  }, [variant, movePopup]);

  const handleClose = () => {
    if (variant === 'impossible' && closeAttempts < 3) {
      setCloseAttempts(closeAttempts + 1);
      alert(`You must click ${3 - closeAttempts} more time(s) to close this popup.`);
      return;
    }
    onClose();
  };

  return (
    <div
      className="popup-chaos"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        minWidth: '300px',
        maxWidth: '400px',
        zIndex: 10001,
      }}
    >
      <div className="popup-chaos-header">
        <span style={{ fontFamily: "'Comic Neue', cursive" }}>{title}</span>
        <button
          onClick={handleClose}
          className="popup-chaos-close"
          style={{
            fontSize: variant === 'impossible' ? '4px' : '10px',
            padding: variant === 'impossible' ? '0' : '2px',
          }}
        >
          ✕
        </button>
      </div>
      <div className="popup-chaos-content">
        <p style={{ fontFamily: "'Times New Roman', serif" }}>{message}</p>
        <div className="flex justify-center mt-4">
          <button
            onClick={handleClose}
            onMouseEnter={(e) => {
              if (variant === 'annoying') {
                const rect = e.currentTarget.getBoundingClientRect();
                const moveX = Math.random() > 0.5 ? 50 : -50;
                if (rect.left + moveX > 0 && rect.right + moveX < window.innerWidth) {
                  e.currentTarget.style.transform = `translateX(${moveX}px)`;
                }
              }
            }}
            className="px-6 py-2 bg-[#39FF14] text-[#8B4513] font-bold border-4 border-outset hover:bg-[#FF69B4] hover:text-white transition-colors"
            style={{
              fontFamily: "'Bangers', cursive",
              fontSize: '14px',
            }}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Toast notification component
interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className="fixed bottom-4 right-4 bg-[#FFFF99] border-4 border-double border-[#8B4513] p-4 shadow-lg animate-float"
      style={{
        fontFamily: "'Comic Neue', cursive",
        zIndex: 10002,
        maxWidth: '300px',
      }}
    >
      <p className="text-sm text-[#8B4513]">{message}</p>
    </div>
  );
}

// Popup manager component
export function PopupManager({ children }: { children: React.ReactNode }) {
  const [activePopup, setActivePopup] = useState<ReturnType<typeof getRandomPopup> | null>(null);
  const [activeVariant, setActiveVariant] = useState<'normal' | 'annoying' | 'impossible'>('normal');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [popupCount, setPopupCount] = useState(0);

  const spawnPopup = useCallback((forcedVariant?: 'normal' | 'annoying' | 'impossible') => {
    if (activePopup) {
      return;
    }
    const variantPool: Array<'normal' | 'annoying' | 'impossible'> = ['normal', 'annoying', 'impossible'];
    const selectedVariant =
      forcedVariant || variantPool[Math.floor(Math.random() * variantPool.length)];
    setActivePopup(getRandomPopup());
    setActiveVariant(selectedVariant);
    setPopupCount(prev => prev + 1);
  }, [activePopup]);

  useEffect(() => {
    // Show a popup shortly after landing.
    const timer = setTimeout(() => {
      if (popupCount === 0) {
        spawnPopup();
      }
    }, 1500 + Math.floor(Math.random() * 1700));

    return () => clearTimeout(timer);
  }, [popupCount, spawnPopup]);

  // Frequent random popup trigger.
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.78 && !activePopup) {
        spawnPopup();
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [activePopup, spawnPopup]);

  // Exit intent popup.
  useEffect(() => {
    const handleMouseLeaveTop = (e: MouseEvent) => {
      if (e.clientY <= 6 && Math.random() > 0.45 && !activePopup) {
        spawnPopup('impossible');
      }
    };
    document.addEventListener('mouseout', handleMouseLeaveTop);
    return () => document.removeEventListener('mouseout', handleMouseLeaveTop);
  }, [activePopup, spawnPopup]);

  // Scroll-depth popup.
  useEffect(() => {
    const handleScroll = () => {
      if (!activePopup && window.scrollY > 280 && Math.random() > 0.88) {
        spawnPopup('annoying');
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activePopup, spawnPopup]);

  const closePopup = () => {
    setActivePopup(null);
    setActiveVariant('normal');
    // Show toast after closing popup
    const messages = [
      'Popup closed. Another will appear shortly.',
      'Action recorded.',
      'Your patience has been noted.',
      'Popup dismissed (it\'s still watching though)',
      'You will receive more popups shortly.',
    ];
    setToastMessage(messages[Math.floor(Math.random() * messages.length)]);

    // Sometimes chain into another popup immediately.
    if (Math.random() > 0.58) {
      setTimeout(() => {
        spawnPopup(Math.random() > 0.5 ? 'annoying' : 'impossible');
      }, 500 + Math.floor(Math.random() * 900));
    }
  };

  return (
    <>
      {children}
      {activePopup && (
        <Popup
          title={activePopup.title}
          message={activePopup.message}
          buttonText={activePopup.buttonText}
          onClose={closePopup}
          variant={activeVariant}
        />
      )}
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </>
  );
}

export default Popup;
