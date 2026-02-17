'use client';

import { useEffect, useMemo, useState } from 'react';

type AssistTier = 0 | 1 | 2;

interface CaptchaStatus {
  round: number;
  timeLeft: number;
  fails: number;
  mode: 'running' | 'failed' | 'passed';
  lastResetReason?: string;
}

interface CaptchaGauntletProps {
  phase: 1 | 2 | 3;
  attemptCount: number;
  assistTier: AssistTier;
  onPass: (meta: { rounds: number; fails: number }) => void;
  onFail: () => void;
  onStatus?: (status: CaptchaStatus) => void;
}

interface RoundSpec {
  prompt: string;
  options: string[];
  correct: string;
}

const rounds: RoundSpec[] = [
  {
    prompt: 'Select the option that is NOT unlike a square circle.',
    options: ['None', 'All', 'Square Circle', 'Unknown'],
    correct: 'None',
  },
  {
    prompt: 'Pick the image that is most NOT a traffic light (text-only mode).',
    options: ['Stop', 'Go', 'Maybe', 'Blink'],
    correct: 'Maybe',
  },
  {
    prompt: 'Final check: Choose the least incorrect synonym for "valid".',
    options: ['Questionable', 'Dubious', 'Acceptable', 'Broken'],
    correct: 'Acceptable',
  },
];

function getBaseTimer(phase: 1 | 2 | 3): number {
  return phase === 3 ? 6 : phase === 2 ? 8 : 10;
}

function getTimerBonus(assistTier: AssistTier): number {
  if (assistTier >= 2) return 2;
  if (assistTier >= 1) return 1;
  return 0;
}

function getSemanticHint(round: number): string {
  if (round === 0) return 'Pick the choice that neutralizes contradiction.';
  if (round === 1) return 'Pick the option that signals uncertainty.';
  return 'Pick the least broken quality word.';
}

function getDirectHint(round: number): string {
  if (round === 0) return 'Near-direct: choose the option meaning zero items.';
  if (round === 1) return 'Near-direct: choose the uncertainty option.';
  return 'Near-direct: choose the practical synonym of valid.';
}

export function CaptchaGauntlet({ phase, attemptCount, assistTier, onPass, onFail, onStatus }: CaptchaGauntletProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [selection, setSelection] = useState<string>('');
  const [fails, setFails] = useState(0);
  const [mode, setMode] = useState<CaptchaStatus['mode']>('running');
  const [lastResetReason, setLastResetReason] = useState<string | null>(null);
  const timerBudget = useMemo(() => getBaseTimer(phase) + getTimerBonus(assistTier), [assistTier, phase]);
  const [timer, setTimer] = useState(timerBudget);

  const currentRound = useMemo(() => rounds[roundIndex] || rounds[0], [roundIndex]);
  const misleadingCopy = roundIndex === 1 && (attemptCount + fails) % 2 === 1;

  useEffect(() => {
    setTimer(timerBudget);
  }, [roundIndex, timerBudget]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [roundIndex, timerBudget]);

  useEffect(() => {
    if (timer > 0) return;
    setMode('failed');
    setLastResetReason('Timeout reached. Round sequence reset to 1.');
    setFails(prev => prev + 1);
    setRoundIndex(0);
    setSelection('');
    setTimer(timerBudget);
    onFail();
  }, [onFail, timer, timerBudget]);

  useEffect(() => {
    onStatus?.({
      round: roundIndex + 1,
      timeLeft: Math.max(0, timer),
      fails,
      mode,
      lastResetReason: lastResetReason || undefined,
    });
  }, [fails, lastResetReason, mode, onStatus, roundIndex, timer]);

  const submit = () => {
    setMode('running');
    if (selection !== currentRound.correct) {
      setMode('failed');
      setLastResetReason('Incorrect answer submitted. Round sequence reset to 1.');
      setFails(prev => prev + 1);
      setRoundIndex(0);
      setSelection('');
      setTimer(timerBudget);
      onFail();
      return;
    }

    const next = roundIndex + 1;
    if (next >= rounds.length) {
      setMode('passed');
      setLastResetReason(null);
      onPass({ rounds: rounds.length, fails });
      return;
    }
    setRoundIndex(next);
    setSelection('');
    setLastResetReason(null);
  };

  return (
    <div className="minigame-shell">
      <p className="minigame-title">Captcha Gauntlet</p>
      <p className="minigame-subtitle">Pass 3 contradictory rounds in one run. Timer tightens with phase.</p>
      <p className="minigame-hint">Round {roundIndex + 1}/3 | Time left: {Math.max(0, timer)}s | Failures: {fails}</p>
      <p className="minigame-hint">Run policy: progress persists through lockout/freeze/noise. Reset only on fail or step change.</p>
      <p className="minigame-hint">Last reset: {lastResetReason || 'No reset yet.'}</p>
      <div className="minigame-card mt-2">{currentRound.prompt}</div>
      <div className="minigame-grid mt-2">
        {currentRound.options.map(option => (
          <button
            key={option}
            type="button"
            onClick={() => setSelection(option)}
            className={`minigame-card ${selection === option ? 'active' : ''}`}
          >
            {option}
          </button>
        ))}
      </div>
      {misleadingCopy && <p className="minigame-hint text-[#FF0000]">Validation says your answer is wrong even when it is right. Submit anyway.</p>}
      {assistTier >= 1 && <p className="minigame-hint">Assist hint: {getSemanticHint(roundIndex)}</p>}
      {assistTier >= 2 && <p className="minigame-hint">Assist hint+: {getDirectHint(roundIndex)}</p>}
      <button type="button" onClick={submit} className="minigame-submit">
        Submit Round
      </button>
    </div>
  );
}

export default CaptchaGauntlet;
