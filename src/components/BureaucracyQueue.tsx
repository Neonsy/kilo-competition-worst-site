'use client';

import { useEffect, useMemo, useState } from 'react';

type AssistTier = 0 | 1 | 2;

interface BureaucracyQueueStatus {
  mode: 'building' | 'submitted' | 'failed' | 'passed';
  selectedCount: number;
  cycle: number;
  fails: number;
  ruleMode: 'A' | 'B';
  lastResetReason?: string;
}

interface BureaucracyQueueProps {
  attemptCount: number;
  assistTier: AssistTier;
  onPass: (meta: { cycles: number; fails: number }) => void;
  onFail: () => void;
  onStatus?: (status: BureaucracyQueueStatus) => void;
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

export function BureaucracyQueue({ attemptCount, assistTier, onPass, onFail, onStatus }: BureaucracyQueueProps) {
  const [picked, setPicked] = useState<string[]>([]);
  const [fails, setFails] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [lockedPrefix, setLockedPrefix] = useState(0);
  const [mode, setMode] = useState<BureaucracyQueueStatus['mode']>('building');
  const [lastResetReason, setLastResetReason] = useState<string | null>(null);

  const order = useMemo(() => expectedOrder(attemptCount + fails), [attemptCount, fails]);
  const ruleMode = useMemo(() => ((attemptCount + fails) % 2 === 0 ? 'A' : 'B'), [attemptCount, fails]);
  const showForcedHint = fails >= 3 || assistTier >= 1;

  useEffect(() => {
    onStatus?.({
      mode,
      selectedCount: picked.length,
      cycle: cycles,
      fails,
      ruleMode,
      lastResetReason: lastResetReason || undefined,
    });
  }, [cycles, fails, lastResetReason, mode, onStatus, picked.length, ruleMode]);

  const togglePick = (doc: string) => {
    setMode('building');
    setPicked(prev => {
      if (prev.includes(doc)) {
        const index = prev.indexOf(doc);
        if (index >= 0 && index < lockedPrefix) {
          return prev;
        }
        return prev.filter(item => item !== doc);
      }
      if (prev.length >= 4) return prev;
      return [...prev, doc];
    });
  };

  const submit = () => {
    setMode('submitted');
    setCycles(prev => prev + 1);
    const valid = picked.length === 4 && picked.every((item, index) => item === order[index]);
    if (valid) {
      setMode('passed');
      setLastResetReason(null);
      setLockedPrefix(0);
      onPass({ cycles: cycles + 1, fails });
      return;
    }
    setMode('failed');
    const nextFails = fails + 1;
    const nextOrder = expectedOrder(attemptCount + nextFails);
    const nextRuleMode = (attemptCount + nextFails) % 2 === 0 ? 'A' : 'B';
    setLastResetReason(`Incorrect queue order submitted. Rule mode switched to ${nextRuleMode}.`);
    setFails(prev => prev + 1);
    if (assistTier >= 2) {
      setLockedPrefix(2);
      setPicked(nextOrder.slice(0, 2));
      setLastResetReason(`Queue reset after fail. Slots #1-#2 locked for rule mode ${nextRuleMode}.`);
    } else {
      setLockedPrefix(0);
      setPicked([]);
    }
    onFail();
  };

  return (
    <div className="minigame-shell">
      <p className="minigame-title">Bureaucracy Queue</p>
      <p className="minigame-subtitle">Pick 4 documents in the correct order. Rule mode flips by attempt/fail parity.</p>
      <p className="minigame-hint">How to pass: select 4 docs, then submit once your queue matches the current rule mode order.</p>
      <p className="minigame-hint">Mode policy: A starts with Form A-17. B starts with Blue Carbon Copy.</p>
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
      <p className="minigame-hint">Selected: {picked.length}/4 | Cycle: {cycles} | Rule mode: {ruleMode}</p>
      <p className="minigame-hint">Last reset: {lastResetReason || 'No reset yet.'}</p>
      {showForcedHint && <p className="minigame-hint">Forced hint: first document is "{order[0]}".</p>}
      {assistTier >= 1 && <p className="minigame-hint">Tier-1 exact order: {order.join(' -> ')}</p>}
      {assistTier >= 2 && (
        <>
          <p className="minigame-hint">Tier-2 assist: first two slots stay locked after failed submit.</p>
          <p className="minigame-hint">Remaining unsolved slots: {picked.length >= 2 ? '#3 and #4' : '#1 to #4'}</p>
        </>
      )}
      <button type="button" onClick={submit} className="minigame-submit" disabled={picked.length !== 4}>
        Submit Queue
      </button>
    </div>
  );
}

export default BureaucracyQueue;
