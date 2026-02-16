'use client';

import { useMemo, useState } from 'react';
import { HostilityPhase, hostilityPrimitives, randomInRange, withPityAdjustment } from '@/data/hostilityPrimitives';

type LoadingStage = 'boot' | 'precheck' | 'deep-scan' | 'finalizing' | 'false-complete' | 'commit';

export interface LoadingLabyrinthMetrics {
  loops: number;
  regressions: number;
  falseCompletes: number;
  bypassed: boolean;
}

interface LoadingLabyrinthButtonProps {
  label: string;
  phase: HostilityPhase;
  pityPass?: boolean;
  className?: string;
  onCommit: () => Promise<void> | void;
  onIncident?: (line: string) => void;
  onMetrics?: (metrics: LoadingLabyrinthMetrics) => void;
}

const stageOrder: LoadingStage[] = ['boot', 'precheck', 'deep-scan', 'finalizing', 'false-complete', 'commit'];

const stageCopy: Record<LoadingStage, string> = {
  boot: 'Boot sequence (unverified)',
  precheck: 'Running prechecks',
  'deep-scan': 'Deep scan of regret vectors',
  finalizing: 'Finalizing almost-final state',
  'false-complete': '100% reached. Validating that 100%.',
  commit: 'Commiting... please remain unsettled',
};

export function LoadingLabyrinthButton({
  label,
  phase,
  pityPass = false,
  className = '',
  onCommit,
  onIncident,
  onMetrics,
}: LoadingLabyrinthButtonProps) {
  const rules = hostilityPrimitives.loadingLabyrinthRules;
  const [isRunning, setIsRunning] = useState(false);
  const [stage, setStage] = useState<LoadingStage>('boot');
  const [progress, setProgress] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(0);

  const loopChance = useMemo(() => withPityAdjustment(rules.loopChanceByPhase[phase], pityPass), [phase, pityPass, rules.loopChanceByPhase]);
  const falseCompleteChance = useMemo(
    () => withPityAdjustment(rules.falseCompleteChanceByPhase[phase], pityPass),
    [phase, pityPass, rules.falseCompleteChanceByPhase]
  );
  const regressionChance = useMemo(
    () => withPityAdjustment(rules.regressionChanceByPhase[phase], pityPass),
    [phase, pityPass, rules.regressionChanceByPhase]
  );
  const stallChance = useMemo(() => withPityAdjustment(rules.stallChanceByPhase[phase], pityPass), [phase, pityPass, rules.stallChanceByPhase]);

  const canClick = Date.now() > cooldownUntil && !isRunning;

  const runLabyrinth = async () => {
    if (!canClick) return;
    setIsRunning(true);
    setStage('boot');
    setProgress(0);

    const metrics: LoadingLabyrinthMetrics = {
      loops: 0,
      regressions: 0,
      falseCompletes: 0,
      bypassed: false,
    };

    let stageIndex = 0;
    const startedAt = Date.now();
    const maxRuntime = rules.rageCooldownMs;

    while (stageIndex < stageOrder.length) {
      const current = stageOrder[stageIndex];
      setStage(current);

      const [minMs, maxMs] = rules.stageDurationsMs[phase];
      const waitMs = randomInRange(minMs, maxMs) + (current === 'deep-scan' && Math.random() < stallChance ? randomInRange(380, 760) : 0);
      if (current === 'deep-scan' && Math.random() < stallChance) {
        onIncident?.('Loading stall: deep scan waiting on decorative infrastructure.');
      }

      await new Promise(resolve => setTimeout(resolve, waitMs));

      if (Date.now() - startedAt > maxRuntime) {
        metrics.bypassed = true;
        onIncident?.('Loading hard timeout reached. Forced commit granted.');
        break;
      }

      if (current === 'finalizing' && Math.random() < falseCompleteChance) {
        metrics.falseCompletes += 1;
        setProgress(100);
        await new Promise(resolve => setTimeout(resolve, randomInRange(220, 480)));
        setProgress(63);
        onIncident?.('False-complete rollback: 100% was ceremonial.');
        stageIndex = Math.max(1, stageIndex - 1);
        metrics.loops += 1;
      } else if (Math.random() < loopChance && stageIndex > 0 && stageIndex < stageOrder.length - 1) {
        metrics.loops += 1;
        stageIndex -= 1;
        onIncident?.('Labyrinth loop triggered. Returning to prior stage.');
      } else if (
        Math.random() < regressionChance &&
        stageIndex > 1 &&
        stageIndex < stageOrder.length - 1 &&
        metrics.regressions < 2
      ) {
        metrics.regressions += 1;
        stageIndex = Math.max(0, stageIndex - 2);
        onIncident?.('Loading regression applied by integrity monitor.');
      } else {
        stageIndex += 1;
      }

      if (metrics.loops >= rules.pityBypassAfterLoops) {
        metrics.bypassed = true;
        onIncident?.('Loading bypass token issued after repeated loopbacks.');
        break;
      }

      const percent = Math.min(97, Math.floor((Math.max(stageIndex, 1) / (stageOrder.length - 1)) * 100));
      setProgress(percent);
    }

    setStage('commit');
    setProgress(100);
    await new Promise(resolve => setTimeout(resolve, randomInRange(220, 520)));

    try {
      await onCommit();
    } finally {
      onMetrics?.(metrics);
      setIsRunning(false);
      setCooldownUntil(Date.now() + randomInRange(620, 1300));
      setTimeout(() => {
        setStage('boot');
        setProgress(0);
      }, 250);
    }
  };

  return (
    <div className={`loading-labyrinth-wrapper ${className}`}>
      <button
        type="button"
        className={`loading-labyrinth-button ${isRunning ? 'running' : ''} ${!canClick ? 'cooling' : ''}`}
        onClick={runLabyrinth}
        disabled={!canClick}
      >
        {isRunning ? stageCopy[stage] : !canClick ? 'Recalibrating...' : label}
      </button>
      {isRunning && (
        <div className="loading-labyrinth-meter">
          <div className="loading-labyrinth-fill" style={{ width: `${progress}%` }} />
          <span className="loading-labyrinth-text">{Math.floor(progress)}%</span>
        </div>
      )}
    </div>
  );
}

export default LoadingLabyrinthButton;

