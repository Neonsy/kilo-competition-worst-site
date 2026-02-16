'use client';

import { useEffect, useMemo, useRef } from 'react';
import { HostilityPhase, hostilityPrimitives, withPityAdjustment } from '@/data/hostilityPrimitives';

interface DragFrictionFieldProps {
  phase: HostilityPhase;
  pityPass?: boolean;
  active?: boolean;
  resistanceBoost?: number;
  onIncident?: (line: string) => void;
}

interface InteractionState {
  lastValue: number;
  snapped: boolean;
}

function asRangeInput(target: EventTarget | null): HTMLInputElement | null {
  if (!(target instanceof HTMLElement)) return null;
  if (target instanceof HTMLInputElement && target.type === 'range' && target.matches('[data-drag-friction]')) return target;
  const found = target.closest('input[type="range"][data-drag-friction]');
  if (found instanceof HTMLInputElement) return found;
  return null;
}

export function DragFrictionField({
  phase,
  pityPass = false,
  active = true,
  resistanceBoost = 0,
  onIncident,
}: DragFrictionFieldProps) {
  const rules = hostilityPrimitives.dragRules;
  const interactionRef = useRef<WeakMap<HTMLInputElement, InteractionState>>(new WeakMap());
  const retryCountRef = useRef<WeakMap<HTMLInputElement, number>>(new WeakMap());

  const baseMultiplier = useMemo(() => rules.frictionMultiplier[phase] + Math.min(0.2, resistanceBoost * 0.01), [phase, resistanceBoost, rules.frictionMultiplier]);
  const snapChance = useMemo(() => withPityAdjustment(rules.snapBackChance[phase], pityPass), [phase, pityPass, rules.snapBackChance]);

  useEffect(() => {
    if (!active) return;

    const onPointerDown = (event: PointerEvent) => {
      const input = asRangeInput(event.target);
      if (!input) return;
      interactionRef.current.set(input, {
        lastValue: Number(input.value),
        snapped: false,
      });
    };

    const onInputCapture = (event: Event) => {
      const input = asRangeInput(event.target);
      if (!input) return;
      const state = interactionRef.current.get(input) || { lastValue: Number(input.value), snapped: false };
      const retries = retryCountRef.current.get(input) || 0;
      const relax = retries >= rules.retryRelaxationThreshold ? 0.45 : 0;
      const multiplier = Math.max(1.02, baseMultiplier - relax);

      const requested = Number(input.value);
      const delta = requested - state.lastValue;
      const dampened = state.lastValue + delta / multiplier;
      const rounded = Math.round(dampened);

      if (rounded !== requested) {
        input.value = String(rounded);
      }

      state.lastValue = rounded;
      interactionRef.current.set(input, state);
    };

    const onPointerUp = (event: PointerEvent) => {
      const input = asRangeInput(event.target);
      if (!input) return;
      const state = interactionRef.current.get(input);
      if (!state) return;

      const retries = (retryCountRef.current.get(input) || 0) + 1;
      retryCountRef.current.set(input, retries);

      if (!state.snapped && Math.random() < snapChance && rules.maxSnapBackPerInteraction > 0) {
        const current = Number(input.value);
        const min = Number(input.min || 0);
        const max = Number(input.max || 100);
        const next = Math.max(min, Math.min(max, current - Math.max(2, Math.floor(phase * 2))));
        input.value = String(next);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        state.snapped = true;
        interactionRef.current.set(input, state);
        onIncident?.('Drag snap-back applied to active control.');
      }
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('input', onInputCapture, true);
    document.addEventListener('pointerup', onPointerUp, true);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('input', onInputCapture, true);
      document.removeEventListener('pointerup', onPointerUp, true);
    };
  }, [active, baseMultiplier, onIncident, phase, pityPass, rules.maxSnapBackPerInteraction, rules.retryRelaxationThreshold, snapChance]);

  return null;
}

export default DragFrictionField;
