'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { HostilityMode, HostilityPhase, hostilityPrimitives, randomInRange, withPityAdjustment } from '@/data/hostilityPrimitives';

type CursorPersona = 'pointer' | 'text' | 'wait' | 'not-allowed' | 'crosshair';

interface CursorCorruptionLayerProps {
  phase: HostilityPhase;
  pityPass?: boolean;
  active?: boolean;
  eventPulse?: number;
  hostilityMode?: HostilityMode;
  onIncident?: (line: string) => void;
}

interface CursorPosition {
  x: number;
  y: number;
}

const personaGlyph: Record<CursorPersona, string> = {
  pointer: '🖱',
  text: 'I',
  wait: '⌛',
  'not-allowed': '⛔',
  crosshair: '✛',
};

function detectTargetPersona(target: EventTarget | null): CursorPersona {
  if (!(target instanceof HTMLElement)) return 'pointer';
  if (target.matches('input, textarea, [contenteditable="true"]')) return 'text';
  if (target.matches('button, a, [role="button"], [data-trap-zone] *')) return 'pointer';
  return 'crosshair';
}

export function CursorCorruptionLayer({
  phase,
  pityPass = false,
  active = true,
  eventPulse = 0,
  hostilityMode = 'legacy',
  onIncident,
}: CursorCorruptionLayerProps) {
  const rules = hostilityPrimitives.cursorGlobalRules;
  const effectivePhase: HostilityPhase = hostilityMode === 'maximum' ? 3 : phase;
  const [position, setPosition] = useState<CursorPosition>({ x: -100, y: -100 });
  const [renderPosition, setRenderPosition] = useState<CursorPosition>({ x: -100, y: -100 });
  const [persona, setPersona] = useState<CursorPersona>(rules.baseModeByPhase[effectivePhase]);
  const [desyncUntil, setDesyncUntil] = useState(0);
  const [jitterUntil, setJitterUntil] = useState(0);
  const [tick, setTick] = useState(Date.now());
  const missedRef = useRef(0);
  const relaxUntilRef = useRef(0);

  const misclassificationChance = useMemo(
    () => withPityAdjustment(rules.misclassificationChance[effectivePhase], pityPass),
    [effectivePhase, pityPass, rules.misclassificationChance]
  );
  const desyncChance = useMemo(
    () => withPityAdjustment(rules.desyncChanceByPhase[effectivePhase] + Math.min(eventPulse * 0.004, 0.08), pityPass),
    [effectivePhase, eventPulse, pityPass, rules.desyncChanceByPhase]
  );
  const jitterPx = useMemo(() => Math.max(1, pityPass ? Math.floor(rules.jitterPxByPhase[effectivePhase] / 2) : rules.jitterPxByPhase[effectivePhase]), [effectivePhase, pityPass, rules.jitterPxByPhase]);

  useEffect(() => {
    const timer = setInterval(() => setTick(Date.now()), 120);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!active || typeof window === 'undefined') return;
    const desktop = window.matchMedia('(pointer:fine)').matches;
    if (!desktop) return;
    document.body.classList.add('cursor-corruption-active');
    return () => {
      document.body.classList.remove('cursor-corruption-active');
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      setPosition({ x: event.clientX, y: event.clientY });

      const targetPersona = detectTargetPersona(event.target);
      const now = Date.now();
      if (now < relaxUntilRef.current) {
        setPersona(targetPersona);
        return;
      }

      if (Math.random() < misclassificationChance) {
        const personas: CursorPersona[] = ['pointer', 'text', 'wait', 'not-allowed', 'crosshair'];
        setPersona(personas[Math.floor(Math.random() * personas.length)] || targetPersona);
      } else {
        setPersona(targetPersona);
      }

      if (Math.random() < desyncChance) {
        const duration = randomInRange(rules.driftMsRange[0], rules.driftMsRange[1]);
        setDesyncUntil(now + duration);
        setJitterUntil(now + duration);
      }
    };

    const onClickCapture = (event: MouseEvent) => {
      const now = Date.now();
      if (now >= desyncUntil || pityPass) return;
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.closest('[data-trap-zone]')) return;
      if (Math.random() > 0.28) return;

      event.preventDefault();
      event.stopPropagation();
      missedRef.current += 1;
      onIncident?.('Cursor desync intercepted an activation attempt.');
      if (missedRef.current >= rules.globalRelaxAfterFails) {
        relaxUntilRef.current = now + 8000;
        missedRef.current = 0;
        onIncident?.('Global cursor corruption relaxed for 8 seconds after repeated misses.');
      }
    };

    document.addEventListener('pointermove', onMove, true);
    document.addEventListener('click', onClickCapture, true);

    return () => {
      document.removeEventListener('pointermove', onMove, true);
      document.removeEventListener('click', onClickCapture, true);
    };
  }, [active, desyncChance, desyncUntil, misclassificationChance, onIncident, pityPass, rules.driftMsRange, rules.globalRelaxAfterFails]);

  useEffect(() => {
    if (!active) return;
    const lag = randomInRange(rules.driftMsRange[0], rules.driftMsRange[1]);
    const timer = window.setTimeout(() => {
      const jitterX = tick < jitterUntil ? (Math.random() > 0.5 ? 1 : -1) * jitterPx : 0;
      const jitterY = tick < jitterUntil ? (Math.random() > 0.5 ? 1 : -1) * jitterPx : 0;
      const desyncX = tick < desyncUntil ? jitterPx * 1.5 : 0;
      const desyncY = tick < desyncUntil ? -jitterPx * 0.8 : 0;
      setRenderPosition({
        x: position.x + jitterX + desyncX,
        y: position.y + jitterY + desyncY,
      });
    }, lag);

    return () => window.clearTimeout(timer);
  }, [active, desyncUntil, jitterPx, jitterUntil, position.x, position.y, rules.driftMsRange, tick]);

  if (!active) return null;

  const ghosts = Array.from({ length: rules.ghostCursorCountByPhase[effectivePhase] }).map((_, index) => {
    const offset = (index + 1) * 10;
    return {
      x: renderPosition.x - offset,
      y: renderPosition.y + offset * 0.4,
      opacity: Math.max(0.15, 0.42 - index * 0.11),
    };
  });

  return (
    <div className="cursor-corruption-layer" aria-hidden>
      {ghosts.map((ghost, index) => (
        <span
          key={`ghost-${index}`}
          className="cursor-corruption-ghost"
          style={{ left: ghost.x, top: ghost.y, opacity: ghost.opacity }}
        >
          {personaGlyph[persona]}
        </span>
      ))}
      <span
        className={`cursor-corruption-primary cursor-corruption-${persona}`}
        style={{ left: renderPosition.x, top: renderPosition.y }}
      >
        {personaGlyph[persona]}
      </span>
    </div>
  );
}

export default CursorCorruptionLayer;
