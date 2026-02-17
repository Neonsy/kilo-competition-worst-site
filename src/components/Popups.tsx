'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { getRandomPopup } from '@/data/disclaimers';

type PopupVariant = 'normal' | 'annoying' | 'impossible';
type PopupSkin = 'classic' | 'terminal' | 'hazard' | 'sticky';
type PopupInteraction = 'normal' | 'countdown' | 'confirm-twice' | 'teleport-button';

interface PopupInstance extends ReturnType<typeof getRandomPopup> {
  id: string;
  variant: PopupVariant;
  skin: PopupSkin;
  interaction: PopupInteraction;
  position: { x: number; y: number };
}

interface PopupProps {
  id: string;
  title: string;
  message: string;
  buttonText: string;
  onClose: (id: string) => void;
  variant: PopupVariant;
  skin: PopupSkin;
  interaction: PopupInteraction;
  stackIndex: number;
  startPosition: { x: number; y: number };
}

function Popup({
  id,
  title,
  message,
  buttonText,
  onClose,
  variant,
  skin,
  interaction,
  stackIndex,
  startPosition,
}: PopupProps) {
  const [position, setPosition] = useState(startPosition);
  const [closeAttempts, setCloseAttempts] = useState(0);
  const [confirmArmed, setConfirmArmed] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [buttonShift, setButtonShift] = useState({ x: 0, y: 0 });

  const movePopup = useCallback(() => {
    if (variant === 'annoying') {
      setPosition({
        x: Math.max(12, Math.random() * Math.max(window.innerWidth - 420, 120)),
        y: Math.max(12, Math.random() * Math.max(window.innerHeight - 320, 90)),
      });
    }
  }, [variant]);

  useEffect(() => {
    if (variant === 'annoying') {
      const interval = setInterval(movePopup, 3000);
      return () => clearInterval(interval);
    }
  }, [variant, movePopup]);

  useEffect(() => {
    if (interaction !== 'countdown') return;
    setCountdown(4 + Math.floor(Math.random() * 4));
  }, [interaction]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown(prev => Math.max(0, prev - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  const handleClose = () => {
    if (variant === 'impossible' && closeAttempts < 3) {
      setCloseAttempts(closeAttempts + 1);
      alert(`You must click ${3 - closeAttempts} more time(s) to close this popup.`);
      return;
    }
    if (interaction === 'countdown' && countdown > 0) {
      alert(`Close action locked for ${countdown}s.`);
      return;
    }
    if (interaction === 'confirm-twice' && !confirmArmed) {
      setConfirmArmed(true);
      return;
    }
    onClose(id);
  };

  return (
    <div
      className={`popup-chaos popup-style-${skin}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        minWidth: '300px',
        maxWidth: '400px',
        zIndex: 10001 + stackIndex,
      }}
    >
      <div className="popup-chaos-header">
        <span style={{ fontFamily: "'Comic Neue', cursive" }}>{title}</span>
        <div className="popup-chaos-chips">
          <span className="popup-chaos-chip">{skin}</span>
          {interaction !== 'normal' && <span className="popup-chaos-chip popup-chaos-chip-alert">{interaction}</span>}
          {interaction === 'countdown' && <span className="popup-chaos-chip">{countdown}s</span>}
        </div>
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
        {interaction === 'confirm-twice' && !confirmArmed && (
          <p className="mt-2 text-xs" style={{ fontFamily: "'VT323', monospace" }}>
            First click arms close. Second click actually closes.
          </p>
        )}
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
              if (interaction === 'teleport-button') {
                const moveX = Math.floor((Math.random() - 0.5) * 140);
                const moveY = Math.floor((Math.random() - 0.5) * 48);
                setButtonShift({ x: moveX, y: moveY });
              }
            }}
            className="px-6 py-2 bg-[#39FF14] text-[#8B4513] font-bold border-4 border-outset hover:bg-[#FF69B4] hover:text-white transition-colors"
            style={{
              fontFamily: "'Bangers', cursive",
              fontSize: '14px',
              transform: `translate(${buttonShift.x}px, ${buttonShift.y}px)`,
            }}
          >
            {confirmArmed ? 'Confirm Close' : buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Toast notification component
interface ToastProps {
  id: string;
  message: string;
  duration?: number;
  stackIndex: number;
  onClose: (id: string) => void;
}

export function Toast({ id, message, duration = 3000, stackIndex, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [duration, id, onClose]);

  return (
    <div
      className="fixed bottom-4 right-4 bg-[#FFFF99] border-4 border-double border-[#8B4513] p-4 shadow-lg animate-float"
      style={{
        fontFamily: "'Comic Neue', cursive",
        zIndex: 10002 + stackIndex,
        maxWidth: '300px',
        bottom: `${16 + stackIndex * 70}px`,
      }}
    >
      <p className="text-sm text-[#8B4513]">{message}</p>
    </div>
  );
}

// Popup manager component
export function PopupManager({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [activePopups, setActivePopups] = useState<PopupInstance[]>([]);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string }>>([]);
  const [popupCount, setPopupCount] = useState(0);
  const suppressForTour = pathname?.startsWith('/tour');

  const spawnPopup = useCallback((forcedVariant?: PopupVariant) => {
    if (suppressForTour) return;
    const variantPool: PopupVariant[] = ['normal', 'annoying', 'impossible'];
    const skinPool: PopupSkin[] = ['classic', 'terminal', 'hazard', 'sticky'];
    const interactionPool: PopupInteraction[] = ['normal', 'countdown', 'confirm-twice', 'teleport-button'];
    const selectedVariant = forcedVariant || variantPool[Math.floor(Math.random() * variantPool.length)];
    const popup = getRandomPopup();
    const id = `popup-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const x = 50 + Math.floor(Math.random() * Math.max(window.innerWidth - 520, 220));
    const y = 60 + Math.floor(Math.random() * Math.max(window.innerHeight - 380, 200));

    setActivePopups(prev => {
      if (prev.length >= 3) return prev;
      return [
        ...prev,
        {
          ...popup,
          id,
          variant: selectedVariant,
          skin: skinPool[Math.floor(Math.random() * skinPool.length)] || 'classic',
          interaction: interactionPool[Math.floor(Math.random() * interactionPool.length)] || 'normal',
          position: { x, y },
        },
      ];
    });
    setPopupCount(prev => prev + 1);
  }, [suppressForTour]);

  useEffect(() => {
    if (!suppressForTour) return;
    setActivePopups([]);
    setToasts([]);
  }, [suppressForTour]);

  useEffect(() => {
    if (suppressForTour) return;
    // Show a popup shortly after landing.
    const timer = setTimeout(() => {
      if (popupCount === 0) {
        spawnPopup();
        setTimeout(() => spawnPopup('annoying'), 900);
      }
    }, 1500 + Math.floor(Math.random() * 1700));

    return () => clearTimeout(timer);
  }, [popupCount, spawnPopup, suppressForTour]);

  // Frequent random popup trigger.
  useEffect(() => {
    if (suppressForTour) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.68 && activePopups.length < 3) {
        spawnPopup();
      }
    }, 9000);

    return () => clearInterval(interval);
  }, [activePopups.length, spawnPopup, suppressForTour]);

  // Exit intent popup.
  useEffect(() => {
    if (suppressForTour) return;
    const handleMouseLeaveTop = (e: MouseEvent) => {
      if (e.clientY <= 6 && Math.random() > 0.45 && activePopups.length < 3) {
        spawnPopup('impossible');
      }
    };
    document.addEventListener('mouseout', handleMouseLeaveTop);
    return () => document.removeEventListener('mouseout', handleMouseLeaveTop);
  }, [activePopups.length, spawnPopup, suppressForTour]);

  // Scroll-depth popup.
  useEffect(() => {
    if (suppressForTour) return;
    const handleScroll = () => {
      if (activePopups.length < 3 && window.scrollY > 280 && Math.random() > 0.8) {
        spawnPopup('annoying');
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activePopups.length, spawnPopup, suppressForTour]);

  const closePopup = (id: string) => {
    if (suppressForTour) return;
    setActivePopups(prev => prev.filter(popup => popup.id !== id));
    // Show toast after closing popup
    const messages = [
      'Popup closed. Another will appear shortly.',
      'Action recorded.',
      'Your patience has been noted.',
      'Popup dismissed (it\'s still watching though)',
      'You will receive more popups shortly.',
    ];
    const toastId = `toast-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const message = messages[Math.floor(Math.random() * messages.length)] || 'Action recorded.';
    setToasts(prev => [...prev.slice(-2), { id: toastId, message }]);

    // Sometimes chain into another popup immediately.
    if (Math.random() > 0.46) {
      setTimeout(() => {
        spawnPopup(Math.random() > 0.5 ? 'annoying' : 'impossible');
      }, 500 + Math.floor(Math.random() * 900));
    }
  };

  const closeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <>
      {children}
      {activePopups.map((popup, index) => (
        <Popup
          key={popup.id}
          id={popup.id}
          title={popup.title}
          message={popup.message}
          buttonText={popup.buttonText}
          onClose={closePopup}
          variant={popup.variant}
          skin={popup.skin}
          interaction={popup.interaction}
          stackIndex={index}
          startPosition={popup.position}
        />
      ))}
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          stackIndex={index}
          onClose={closeToast}
        />
      ))}
    </>
  );
}

export default Popup;
