'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type MysteryItem = {
  id: string;
  icon: string;
  intended: string;
};

const routePool = ['/', '/tour', '/exhibits', '/help', '/settings', '/certificate'];

const hints = [
  'Probably home. Maybe.',
  'Could be exhibits.',
  'This one feels unsafe.',
  'Navigation confidence: low.',
  'Icon meaning expired.',
  'You clicked a symbol.',
];

const items: MysteryItem[] = [
  { id: 'meat-0', icon: '◉', intended: '/' },
  { id: 'meat-1', icon: '⌁', intended: '/tour' },
  { id: 'meat-2', icon: '▣', intended: '/exhibits' },
  { id: 'meat-3', icon: '⟁', intended: '/help' },
  { id: 'meat-4', icon: '⌬', intended: '/settings' },
  { id: 'meat-5', icon: '✶', intended: '/certificate' },
];

export function MysteryMeatNav() {
  const router = useRouter();
  const [hint, setHint] = useState('Mystery meat navigation active.');
  const [misfires, setMisfires] = useState(0);

  const labelById = useMemo(() => {
    return new Map(items.map(item => [item.id, `Unknown action ${item.icon}`]));
  }, []);

  const chooseRoute = useCallback((intended: string) => {
    const mislead = Math.random() < 0.62;
    if (!mislead) return intended;
    const wrongRoutes = routePool.filter(route => route !== intended);
    return wrongRoutes[Math.floor(Math.random() * wrongRoutes.length)] || intended;
  }, []);

  const handleClick = (item: MysteryItem) => {
    const target = chooseRoute(item.intended);
    const denied = Math.random() < 0.18;
    if (denied) {
      setHint('Route denied. Please click a different glyph.');
      setMisfires(prev => prev + 1);
      return;
    }
    if (target !== item.intended) {
      setHint(`Rerouted to ${target}. This is intentional.`);
      setMisfires(prev => prev + 1);
    } else {
      setHint(`For once, ${item.icon} matched its destination.`);
    }
    router.push(target);
  };

  return (
    <div className="mystery-meat-nav" aria-label="Mystery meat navigation">
      <div className="mystery-meat-hint">{hint}</div>
      <div className="mystery-meat-strip" data-trap-zone="mystery-meat-nav">
        {items.map(item => (
          <button
            key={item.id}
            type="button"
            className="mystery-meat-btn"
            aria-label={labelById.get(item.id)}
            onMouseEnter={() => {
              setHint(hints[Math.floor(Math.random() * hints.length)] || 'Unknown navigation state.');
            }}
            onClick={() => handleClick(item)}
          >
            {item.icon}
          </button>
        ))}
      </div>
      <p className="mystery-meat-meta">Misfires: {misfires}</p>
    </div>
  );
}

export default MysteryMeatNav;
