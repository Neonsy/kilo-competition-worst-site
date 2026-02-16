'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { HostilityPhase, hostilityPrimitives, withPityAdjustment } from '@/data/hostilityPrimitives';

interface FocusSaboteurProps {
  phase: HostilityPhase;
  step: number;
  pityPass?: boolean;
  armSignal: number;
  active?: boolean;
  onIncident?: (line: string) => void;
}

export function FocusSaboteur({
  phase,
  step,
  pityPass = false,
  armSignal,
  active = true,
  onIncident,
}: FocusSaboteurProps) {
  const rules = hostilityPrimitives.focusTrapRules;
  const [decoysActiveUntil, setDecoysActiveUntil] = useState(0);
  const [tick, setTick] = useState(Date.now());
  const enterBypassUntilRef = useRef<Record<number, number>>({});
  const struggleCountRef = useRef(0);
  const cooldownUntilRef = useRef(0);

  const sabotageChance = useMemo(
    () => withPityAdjustment(rules.sabotageChance[phase], pityPass),
    [phase, pityPass, rules.sabotageChance]
  );

  useEffect(() => {
    const timer = setInterval(() => setTick(Date.now()), 300);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!active || pityPass) return;
    const now = Date.now();
    if (now < cooldownUntilRef.current) return;
    if (Math.random() > sabotageChance) return;

    const activeElement = document.activeElement;
    if (!(activeElement instanceof HTMLElement)) return;
    if (!activeElement.closest('[data-focus-zone]')) return;

    const decoy = document.querySelector<HTMLElement>('[data-focus-decoy="primary"]');
    if (!decoy) return;

    decoy.focus();
    setDecoysActiveUntil(now + 2600);
    onIncident?.('Focus drift moved to a nearby irrelevant control.');
  }, [active, armSignal, pityPass, sabotageChance, onIncident]);

  useEffect(() => {
    if (!active) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return;
      if (pityPass) return;

      const now = Date.now();
      if (now < cooldownUntilRef.current) return;
      if (enterBypassUntilRef.current[step] && now < enterBypassUntilRef.current[step]) return;

      const activeElement = document.activeElement;
      if (!(activeElement instanceof HTMLElement)) return;
      if (!activeElement.closest('[data-focus-zone]')) return;
      if (Math.random() > sabotageChance) return;

      event.preventDefault();
      event.stopPropagation();
      enterBypassUntilRef.current[step] = now + rules.enterRetryWindowMs;
      setDecoysActiveUntil(now + 2000);
      struggleCountRef.current += 1;
      onIncident?.('Enter key rerouted to warning state. Retry to continue.');

      if (struggleCountRef.current >= rules.struggleThreshold) {
        cooldownUntilRef.current = now + rules.struggleCooldownMs;
        struggleCountRef.current = 0;
        onIncident?.('Focus sabotage paused for 8s after repeated failed attempts.');
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [active, phase, pityPass, rules.enterRetryWindowMs, rules.struggleCooldownMs, rules.struggleThreshold, sabotageChance, step, onIncident]);

  if (!active) return null;

  return (
    <div className={`focus-saboteur-layer ${decoysActiveUntil > tick ? 'active' : ''}`} aria-hidden>
      <button
        type="button"
        data-focus-decoy="primary"
        className="focus-saboteur-decoy"
        tabIndex={decoysActiveUntil > tick ? 0 : -1}
      >
        Alternate Continue
      </button>
      <button
        type="button"
        data-focus-decoy="secondary"
        className="focus-saboteur-decoy"
        tabIndex={decoysActiveUntil > tick ? 0 : -1}
      >
        Safe Exit (Decorative)
      </button>
    </div>
  );
}

export default FocusSaboteur;
