'use client';

import { useMemo, useState } from 'react';

interface BureaucracyQueueProps {
  attemptCount: number;
  onPass: (meta: { cycles: number; fails: number }) => void;
  onFail: () => void;
}

const docs = [
  'Form A-17',
  'Stamp Ledger',
  'Blue Carbon Copy',
  'Compliance Ticket',
  'Archive Slip',
  'Queue Verification',
];

function expectedOrder(attemptCount: number): string[] {
  const base = ['Form A-17', 'Blue Carbon Copy', 'Compliance Ticket', 'Queue Verification'];
  if (attemptCount % 2 === 1) {
    return [base[1], base[0], base[2], base[3]];
  }
  return base;
}

export function BureaucracyQueue({ attemptCount, onPass, onFail }: BureaucracyQueueProps) {
  const [picked, setPicked] = useState<string[]>([]);
  const [fails, setFails] = useState(0);
  const [cycles, setCycles] = useState(0);

  const order = useMemo(() => expectedOrder(attemptCount + fails), [attemptCount, fails]);

  const togglePick = (doc: string) => {
    setPicked(prev => {
      if (prev.includes(doc)) return prev.filter(item => item !== doc);
      if (prev.length >= 4) return prev;
      return [...prev, doc];
    });
  };

  const submit = () => {
    setCycles(prev => prev + 1);
    const valid = picked.length === 4 && picked.every((item, index) => item === order[index]);
    if (valid) {
      onPass({ cycles: cycles + 1, fails });
      return;
    }
    setFails(prev => prev + 1);
    setPicked([]);
    onFail();
  };

  return (
    <div className="minigame-shell">
      <p className="minigame-title">Bureaucracy Queue</p>
      <p className="minigame-subtitle">Pick 4 documents in the correct order. Rule mutates every 2 selection cycles.</p>
      <div className="minigame-grid">
        {docs.map(doc => (
          <button
            key={doc}
            type="button"
            onClick={() => togglePick(doc)}
            className={`minigame-card ${picked.includes(doc) ? 'active' : ''}`}
          >
            {doc}
          </button>
        ))}
      </div>
      <p className="minigame-hint">Queue: {picked.join(' -> ') || '(empty)'}</p>
      {fails >= 3 && <p className="minigame-hint">Forced hint: first document is "{order[0]}".</p>}
      <button type="button" onClick={submit} className="minigame-submit">
        Submit Queue
      </button>
    </div>
  );
}

export default BureaucracyQueue;

