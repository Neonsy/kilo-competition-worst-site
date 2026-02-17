'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { HostilityMode, HostilityPhase, hostilityPrimitives, randomInRange, withPityAdjustment } from '@/data/hostilityPrimitives';

interface ClipboardSaboteurProps {
  phase: HostilityPhase;
  pityPass?: boolean;
  active?: boolean;
  corruptionUntil?: number;
  hostilityMode?: HostilityMode;
  onIncident?: (line: string) => void;
}

function getHostileField(target: EventTarget | null): HTMLInputElement | HTMLTextAreaElement | null {
  if (!(target instanceof HTMLElement)) return null;
  const field = target.closest('[data-clipboard-hostile] input, [data-clipboard-hostile] textarea, input[data-clipboard-hostile], textarea[data-clipboard-hostile]');
  if (!field) return null;
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) return field;
  return null;
}

export function ClipboardSaboteur({
  phase,
  pityPass = false,
  active = true,
  corruptionUntil = 0,
  hostilityMode = 'legacy',
  onIncident,
}: ClipboardSaboteurProps) {
  const rules = hostilityPrimitives.clipboardRules;
  const effectivePhase: HostilityPhase = hostilityMode === 'maximum' ? 3 : phase;
  const [localCorruptUntil, setLocalCorruptUntil] = useState(0);
  const [tick, setTick] = useState(Date.now());
  const failMapRef = useRef(new WeakMap<HTMLElement, number>());
  const disabledFieldsRef = useRef(new WeakSet<HTMLElement>());

  const trapChance = useMemo(
    () => withPityAdjustment(rules.trapChance[effectivePhase], pityPass),
    [effectivePhase, pityPass, rules.trapChance]
  );

  useEffect(() => {
    const timer = setInterval(() => setTick(Date.now()), 240);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!active) return;

    const registerFailure = (field: HTMLElement) => {
      const fails = (failMapRef.current.get(field) || 0) + 1;
      if (fails >= rules.fieldDisableAfterRepeats) {
        disabledFieldsRef.current.add(field);
        onIncident?.('Clipboard trap disabled on current field after repeated failures.');
      } else {
        failMapRef.current.set(field, fails);
      }
    };

    const activateCorruptionWindow = () => {
      const duration = randomInRange(rules.corruptionWindowMs[0], rules.corruptionWindowMs[1]);
      setLocalCorruptUntil(Date.now() + duration);
    };

    const onCopy = (event: ClipboardEvent) => {
      if (pityPass || Math.random() > trapChance) return;
      const field = getHostileField(event.target);
      if (!field || disabledFieldsRef.current.has(field)) return;

      const selected = field.value.substring(field.selectionStart || 0, field.selectionEnd || 0);
      const source = selected || field.value || 'clipboard';
      const noisy = `${source} ::artifact-${Math.floor(Math.random() * 900 + 100)}`;
      event.preventDefault();
      event.clipboardData?.setData('text/plain', noisy);
      registerFailure(field);
      activateCorruptionWindow();
      onIncident?.('Clipboard output perturbation injected harmless suffix.');
    };

    const onPaste = (event: ClipboardEvent) => {
      if (pityPass || Math.random() > trapChance) return;
      const field = getHostileField(event.target);
      if (!field || disabledFieldsRef.current.has(field)) return;

      event.preventDefault();
      registerFailure(field);
      activateCorruptionWindow();
      onIncident?.('Paste rejected due to temporary format mismatch.');
    };

    document.addEventListener('copy', onCopy, true);
    document.addEventListener('paste', onPaste, true);

    return () => {
      document.removeEventListener('copy', onCopy, true);
      document.removeEventListener('paste', onPaste, true);
    };
  }, [active, onIncident, effectivePhase, pityPass, rules.corruptionWindowMs, rules.fieldDisableAfterRepeats, trapChance]);

  useEffect(() => {
    const enabled = active && (localCorruptUntil > tick || corruptionUntil > tick);
    document.body.classList.toggle('clipboard-corrupt-mode', enabled);
    return () => {
      document.body.classList.remove('clipboard-corrupt-mode');
    };
  }, [active, corruptionUntil, localCorruptUntil, tick]);

  return null;
}

export default ClipboardSaboteur;
