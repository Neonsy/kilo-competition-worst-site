'use client';

import { useEffect, useMemo, useState } from 'react';

interface CaptchaGauntletProps {
  phase: 1 | 2 | 3;
  attemptCount: number;
  onPass: (meta: { rounds: number; fails: number }) => void;
  onFail: () => void;
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

export function CaptchaGauntlet({ phase, attemptCount, onPass, onFail }: CaptchaGauntletProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [selection, setSelection] = useState<string>('');
  const [fails, setFails] = useState(0);
  const [timer, setTimer] = useState(phase === 3 ? 6 : phase === 2 ? 8 : 10);

  const currentRound = useMemo(() => rounds[roundIndex] || rounds[0], [roundIndex]);
  const misleadingCopy = roundIndex === 1 && (attemptCount + fails) % 2 === 1;

  useEffect(() => {
    setTimer(phase === 3 ? 6 : phase === 2 ? 8 : 10);
  }, [roundIndex, phase]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [roundIndex, phase]);

  useEffect(() => {
    if (timer > 0) return;
    setFails(prev => prev + 1);
    setRoundIndex(0);
    setSelection('');
    onFail();
  }, [onFail, timer]);

  const submit = () => {
    if (selection !== currentRound.correct) {
      setFails(prev => prev + 1);
      setRoundIndex(0);
      setSelection('');
      onFail();
      return;
    }

    const next = roundIndex + 1;
    if (next >= rounds.length) {
      onPass({ rounds: rounds.length, fails });
      return;
    }
    setRoundIndex(next);
    setSelection('');
  };

  return (
    <div className="minigame-shell">
      <p className="minigame-title">Captcha Gauntlet</p>
      <p className="minigame-subtitle">Pass 3 contradictory rounds in one run. Timer tightens with phase.</p>
      <p className="minigame-hint">Round {roundIndex + 1}/3 | Time left: {Math.max(0, timer)}s | Failures: {fails}</p>
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
      <button type="button" onClick={submit} className="minigame-submit">
        Submit Round
      </button>
    </div>
  );
}

export default CaptchaGauntlet;

