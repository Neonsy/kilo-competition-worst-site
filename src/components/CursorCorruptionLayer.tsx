'use client';

import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HostilityMode, HostilityPhase, hostilityPrimitives, randomInRange, withPityAdjustment } from '@/data/hostilityPrimitives';

type CursorPersona = 'pointer' | 'text' | 'wait' | 'not-allowed' | 'crosshair';

interface CursorCorruptionMetrics {
  trailNodesSpawned: number;
  decoyActivations: number;
  clickOffsetInterventions: number;
}

interface CursorCorruptionLayerProps {
  phase: HostilityPhase;
  pityPass?: boolean;
  active?: boolean;
  eventPulse?: number;
  hostilityMode?: HostilityMode;
  onIncident?: (line: string) => void;
  onMetrics?: (metrics: CursorCorruptionMetrics) => void;
}

interface CursorPosition {
  x: number;
  y: number;
}

interface CursorTrailNode {
  id: string;
  x: number;
  y: number;
  variant: CursorPersona;
  scale: number;
  rotation: number;
  opacity: number;
  blurPx: number;
  expiresAt: number;
}

interface CursorFlashNode {
  id: string;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  expiresAt: number;
}

interface CursorDecoyNode {
  id: string;
  x: number;
  y: number;
  variant: CursorPersona;
  scale: number;
  rotation: number;
  opacity: number;
  expiresAt: number;
}

const pointerSpriteByPersona: Record<CursorPersona, string> = {
  pointer:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 26 38'%3E%3Cpath d='M3 2l16 16h-8l4 16-5 2-4-16-6 6z' fill='%23f7f4e8' stroke='%23171717' stroke-width='2' stroke-linejoin='round'/%3E%3C/svg%3E",
  text:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 26 38'%3E%3Crect x='10' y='5' width='6' height='28' rx='2' fill='%23f6f2de' stroke='%23161616' stroke-width='2'/%3E%3Crect x='6' y='6' width='14' height='4' rx='1.4' fill='%23f6f2de' stroke='%23161616' stroke-width='1.6'/%3E%3Crect x='6' y='28' width='14' height='4' rx='1.4' fill='%23f6f2de' stroke='%23161616' stroke-width='1.6'/%3E%3C/svg%3E",
  wait:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 26 38'%3E%3Cpath d='M3 2l16 16h-8l4 16-5 2-4-16-6 6z' fill='%23f7f4e8' stroke='%23171717' stroke-width='2' stroke-linejoin='round'/%3E%3Ccircle cx='20' cy='31' r='4.7' fill='%23f2d37e' stroke='%23815c00' stroke-width='1.6'/%3E%3Cpath d='M20 28.3v2.7l1.8 1.2' stroke='%23815c00' stroke-width='1.4' stroke-linecap='round'/%3E%3C/svg%3E",
  'not-allowed':
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 26 38'%3E%3Cpath d='M3 2l16 16h-8l4 16-5 2-4-16-6 6z' fill='%23f7f4e8' stroke='%23171717' stroke-width='2' stroke-linejoin='round'/%3E%3Ccircle cx='20' cy='31' r='4.8' fill='%23f8dfdf' stroke='%23a21e24' stroke-width='1.7'/%3E%3Cpath d='M17 34l6-6' stroke='%23a21e24' stroke-width='1.7' stroke-linecap='round'/%3E%3C/svg%3E",
  crosshair:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 26 38'%3E%3Cpath d='M3 2l16 16h-8l4 16-5 2-4-16-6 6z' fill='%23f7f4e8' stroke='%23171717' stroke-width='2' stroke-linejoin='round'/%3E%3Ccircle cx='20' cy='31' r='4.6' fill='none' stroke='%230a8da8' stroke-width='1.6'/%3E%3Cpath d='M20 25.8v2.1M20 34.1v2.1M14.8 31h2.1M23.1 31h2.1' stroke='%230a8da8' stroke-width='1.3' stroke-linecap='round'/%3E%3C/svg%3E",
};

const personaPool: CursorPersona[] = ['pointer', 'text', 'wait', 'not-allowed', 'crosshair'];

function detectTargetPersona(target: EventTarget | null): CursorPersona {
  if (!(target instanceof HTMLElement)) return 'pointer';
  if (target.matches('input, textarea, [contenteditable="true"]')) return 'text';
  if (target.matches('button, a, [role="button"], [data-trap-zone] *')) return 'pointer';
  return 'crosshair';
}

function randomPersona(): CursorPersona {
  return personaPool[Math.floor(Math.random() * personaPool.length)] || 'pointer';
}

function buildPointerStyle(
  x: number,
  y: number,
  variant: CursorPersona,
  scale: number,
  rotation: number,
  opacity: number,
  blurPx = 0
): CSSProperties {
  const style: CSSProperties = {
    left: x,
    top: y,
    opacity,
  };
  const cssVarStyle = style as CSSProperties & Record<string, string | number>;
  cssVarStyle['--cursor-pointer-uri'] = `url("${pointerSpriteByPersona[variant]}")`;
  cssVarStyle['--cursor-transform'] = `translate(-14%, -8%) rotate(${rotation}deg) scale(${scale})`;
  cssVarStyle['--cursor-glow'] = `${blurPx}px`;
  return style;
}

export function CursorCorruptionLayer({
  phase,
  pityPass = false,
  active = true,
  eventPulse = 0,
  hostilityMode = 'legacy',
  onIncident,
  onMetrics,
}: CursorCorruptionLayerProps) {
  const rules = hostilityPrimitives.cursorGlobalRules;
  const effectivePhase: HostilityPhase = hostilityMode === 'maximum' ? 3 : phase;
  const [position, setPosition] = useState<CursorPosition>({ x: -100, y: -100 });
  const [renderPosition, setRenderPosition] = useState<CursorPosition>({ x: -100, y: -100 });
  const [persona, setPersona] = useState<CursorPersona>(rules.baseModeByPhase[effectivePhase]);
  const [desyncUntil, setDesyncUntil] = useState(0);
  const [jitterUntil, setJitterUntil] = useState(0);
  const [tick, setTick] = useState(Date.now());
  const [trailNodes, setTrailNodes] = useState<CursorTrailNode[]>([]);
  const [flashNodes, setFlashNodes] = useState<CursorFlashNode[]>([]);
  const [decoyNodes, setDecoyNodes] = useState<CursorDecoyNode[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const missedRef = useRef(0);
  const relaxUntilRef = useRef(0);
  const lastTrailAtRef = useRef(0);
  const lastHideBurstAtRef = useRef(0);
  const hideBurstTimerRef = useRef<number | null>(null);
  const syntheticClickGuardRef = useRef(false);
  const metricsRef = useRef<CursorCorruptionMetrics>({
    trailNodesSpawned: 0,
    decoyActivations: 0,
    clickOffsetInterventions: 0,
  });

  const emitMetrics = useCallback(() => {
    onMetrics?.({ ...metricsRef.current });
  }, [onMetrics]);

  const bumpMetric = useCallback(
    (key: keyof CursorCorruptionMetrics, amount = 1) => {
      metricsRef.current[key] += amount;
      emitMetrics();
    },
    [emitMetrics]
  );

  useEffect(() => {
    emitMetrics();
  }, [emitMetrics]);

  const misclassificationChance = useMemo(
    () => withPityAdjustment(rules.misclassificationChance[effectivePhase], pityPass),
    [effectivePhase, pityPass, rules.misclassificationChance]
  );
  const desyncChance = useMemo(
    () => withPityAdjustment(rules.desyncChanceByPhase[effectivePhase] + Math.min(eventPulse * 0.004, 0.08), pityPass),
    [effectivePhase, eventPulse, pityPass, rules.desyncChanceByPhase]
  );
  const jitterPx = useMemo(
    () =>
      Math.max(
        1,
        pityPass ? Math.floor(rules.jitterPxByPhase[effectivePhase] / 2) : rules.jitterPxByPhase[effectivePhase]
      ),
    [effectivePhase, pityPass, rules.jitterPxByPhase]
  );
  const effectiveJitterPx = useMemo(
    () => (prefersReducedMotion ? Math.max(1, Math.floor(jitterPx * 0.3)) : jitterPx),
    [jitterPx, prefersReducedMotion]
  );

  useEffect(() => {
    const timer = setInterval(() => setTick(Date.now()), 120);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setPrefersReducedMotion(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!active || typeof window === 'undefined') return;
    const desktop = window.matchMedia('(pointer:fine)').matches;
    if (!desktop) return;
    document.body.classList.add('cursor-corruption-active');
    return () => {
      document.body.classList.remove('cursor-corruption-active');
      document.body.classList.remove('cursor-corruption-hide-brief');
    };
  }, [active]);

  useEffect(() => {
    if (!active) {
      setTrailNodes([]);
      setFlashNodes([]);
      setDecoyNodes([]);
      return;
    }
    const pruneTimer = window.setInterval(() => {
      const now = Date.now();
      setTrailNodes(prev => prev.filter(node => node.expiresAt > now));
      setFlashNodes(prev => prev.filter(node => node.expiresAt > now));
      setDecoyNodes(prev => prev.filter(node => node.expiresAt > now));
    }, 130);
    return () => window.clearInterval(pruneTimer);
  }, [active]);

  useEffect(() => {
    if (!active) return;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const targetPersona = detectTargetPersona(event.target);
      const now = Date.now();
      setPosition({ x: event.clientX, y: event.clientY });

      if (!prefersReducedMotion && now - lastTrailAtRef.current >= rules.presentation.trailSpawnIntervalMs) {
        lastTrailAtRef.current = now;
        const blurPx = randomInRange(rules.presentation.trailBlurPxRange[0], rules.presentation.trailBlurPxRange[1]);
        const opacity = randomInRange(rules.presentation.trailOpacityRange[0], rules.presentation.trailOpacityRange[1]);
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        const cap = isMobile ? rules.presentation.maxTrailNodesMobile : rules.presentation.maxTrailNodesDesktop;
        const variant = Math.random() < 0.72 ? targetPersona : randomPersona();
        const trail: CursorTrailNode = {
          id: `trail-${now}-${Math.random().toString(36).slice(2, 7)}`,
          x: event.clientX + randomInRange(-3, 3),
          y: event.clientY + randomInRange(-3, 3),
          variant,
          scale: randomInRange(rules.presentation.trailScaleRange[0], rules.presentation.trailScaleRange[1]),
          rotation: randomInRange(
            rules.presentation.trailRotationJitterDeg[0],
            rules.presentation.trailRotationJitterDeg[1]
          ),
          opacity,
          blurPx,
          expiresAt: now + rules.presentation.trailLifetimeMs,
        };
        setTrailNodes(prev => {
          const alive = prev.filter(node => node.expiresAt > now);
          const next = [...alive, trail];
          return next.length > cap ? next.slice(next.length - cap) : next;
        });
        bumpMetric('trailNodesSpawned');
      }

      if (now < relaxUntilRef.current) {
        setPersona(targetPersona);
        return;
      }

      if (Math.random() < misclassificationChance) {
        setPersona(randomPersona());
      } else {
        setPersona(targetPersona);
      }

      if (Math.random() < desyncChance) {
        const duration = randomInRange(rules.driftMsRange[0], rules.driftMsRange[1]);
        setDesyncUntil(now + duration);
        setJitterUntil(now + duration);

        if (!prefersReducedMotion) {
          const flash: CursorFlashNode = {
            id: `flash-${now}-${Math.random().toString(36).slice(2, 7)}`,
            x: event.clientX,
            y: event.clientY,
            scale: randomInRange(0.9, 1.5),
            opacity: randomInRange(0.24, 0.52),
            expiresAt: now + 520,
          };
          setFlashNodes(prev => [...prev.slice(-8), flash]);
        }

        if (!prefersReducedMotion && rules.presentation.liveDecoyEnabled) {
          const isMobile = window.matchMedia('(max-width: 768px)').matches;
          const count = isMobile ? rules.presentation.liveDecoyCountMobile : rules.presentation.liveDecoyCountDesktop;
          if (count > 0) {
            const [offsetMin, offsetMax] = rules.presentation.liveDecoyOffsetPxRange;
            const decoys: CursorDecoyNode[] = Array.from({ length: count }).map((_, index) => {
              const angle = randomInRange(0, Math.PI * 2);
              const offset = randomInRange(offsetMin, offsetMax);
              return {
                id: `decoy-${now}-${index}-${Math.random().toString(36).slice(2, 7)}`,
                x: event.clientX + Math.cos(angle) * offset,
                y: event.clientY + Math.sin(angle) * offset,
                variant: randomPersona(),
                scale: randomInRange(0.9, 1.16),
                rotation: randomInRange(-12, 12),
                opacity: randomInRange(0.34, 0.66),
                expiresAt: now + randomInRange(400, 900),
              };
            });
            setDecoyNodes(prev => [...prev.slice(-8), ...decoys]);
            bumpMetric('decoyActivations', decoys.length);
          }
        }

        if (
          !prefersReducedMotion &&
          now - lastHideBurstAtRef.current >= rules.presentation.hideBurstCooldownMs &&
          Math.random() < rules.presentation.hideBurstChanceOnDesync
        ) {
          lastHideBurstAtRef.current = now;
          const hideMs = randomInRange(rules.presentation.hideBurstWindowMs[0], rules.presentation.hideBurstWindowMs[1]);
          document.body.classList.add('cursor-corruption-hide-brief');
          if (hideBurstTimerRef.current !== null) {
            window.clearTimeout(hideBurstTimerRef.current);
          }
          hideBurstTimerRef.current = window.setTimeout(() => {
            document.body.classList.remove('cursor-corruption-hide-brief');
            hideBurstTimerRef.current = null;
          }, hideMs);
          onIncident?.('Cursor visibility flicker burst triggered.');
        }
      }
    };

    const onClickCapture = (event: MouseEvent) => {
      if (syntheticClickGuardRef.current) return;
      const now = Date.now();
      if (now >= desyncUntil || pityPass) return;
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.closest('[data-trap-zone]')) return;

      const [offsetMin, offsetMax] = rules.presentation.desyncClickOffsetPxRange;
      if (Math.random() < rules.presentation.desyncClickOffsetChance) {
        const offsetX = (Math.random() > 0.5 ? 1 : -1) * randomInRange(offsetMin, offsetMax);
        const offsetY = (Math.random() > 0.5 ? 1 : -1) * randomInRange(offsetMin, offsetMax);
        const shiftedX = Math.max(0, Math.min(window.innerWidth - 1, event.clientX + offsetX));
        const shiftedY = Math.max(0, Math.min(window.innerHeight - 1, event.clientY + offsetY));
        const offsetTarget = document.elementFromPoint(shiftedX, shiftedY);

        if (offsetTarget instanceof HTMLElement && offsetTarget !== target) {
          event.preventDefault();
          event.stopPropagation();
          bumpMetric('clickOffsetInterventions');
          onIncident?.('Cursor desync offset nudged the click target.');
          syntheticClickGuardRef.current = true;
          window.setTimeout(() => {
            offsetTarget.dispatchEvent(
              new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: shiftedX,
                clientY: shiftedY,
              })
            );
            syntheticClickGuardRef.current = false;
          }, 0);
          return;
        }
      }

      if (Math.random() > 0.24) return;
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
      document.body.classList.remove('cursor-corruption-hide-brief');
      if (hideBurstTimerRef.current !== null) {
        window.clearTimeout(hideBurstTimerRef.current);
        hideBurstTimerRef.current = null;
      }
      syntheticClickGuardRef.current = false;
    };
  }, [
    active,
    bumpMetric,
    desyncChance,
    desyncUntil,
    misclassificationChance,
    onIncident,
    pityPass,
    prefersReducedMotion,
    rules.driftMsRange,
    rules.globalRelaxAfterFails,
    rules.presentation.desyncClickOffsetChance,
    rules.presentation.desyncClickOffsetPxRange,
    rules.presentation.hideBurstChanceOnDesync,
    rules.presentation.hideBurstCooldownMs,
    rules.presentation.hideBurstWindowMs,
    rules.presentation.liveDecoyCountDesktop,
    rules.presentation.liveDecoyCountMobile,
    rules.presentation.liveDecoyEnabled,
    rules.presentation.liveDecoyOffsetPxRange,
    rules.presentation.maxTrailNodesDesktop,
    rules.presentation.maxTrailNodesMobile,
    rules.presentation.trailBlurPxRange,
    rules.presentation.trailLifetimeMs,
    rules.presentation.trailOpacityRange,
    rules.presentation.trailRotationJitterDeg,
    rules.presentation.trailScaleRange,
    rules.presentation.trailSpawnIntervalMs,
  ]);

  useEffect(() => {
    if (!active) return;
    const lag = randomInRange(rules.driftMsRange[0], rules.driftMsRange[1]);
    const timer = window.setTimeout(() => {
      const jitterX = tick < jitterUntil ? (Math.random() > 0.5 ? 1 : -1) * effectiveJitterPx : 0;
      const jitterY = tick < jitterUntil ? (Math.random() > 0.5 ? 1 : -1) * effectiveJitterPx : 0;
      const desyncX = tick < desyncUntil ? effectiveJitterPx * (prefersReducedMotion ? 0.45 : 1.28) : 0;
      const desyncY = tick < desyncUntil ? -effectiveJitterPx * (prefersReducedMotion ? 0.2 : 0.72) : 0;
      setRenderPosition({
        x: position.x + jitterX + desyncX,
        y: position.y + jitterY + desyncY,
      });
    }, lag);

    return () => window.clearTimeout(timer);
  }, [
    active,
    desyncUntil,
    effectiveJitterPx,
    jitterUntil,
    position.x,
    position.y,
    prefersReducedMotion,
    rules.driftMsRange,
    tick,
  ]);

  if (!active) return null;

  const ghosts = Array.from({ length: rules.ghostCursorCountByPhase[effectivePhase] }).map((_, index) => {
    const offset = (index + 1) * 11;
    return {
      x: renderPosition.x - offset,
      y: renderPosition.y + offset * 0.42,
      opacity: Math.max(0.12, 0.4 - index * 0.1),
      scale: Math.max(0.72, 0.95 - index * 0.12),
      rotation: (index % 2 === 0 ? -1 : 1) * (2 + index * 1.8),
    };
  });

  return (
    <div className="cursor-corruption-layer" aria-hidden>
      {!prefersReducedMotion &&
        trailNodes.map(node => (
          <span
            key={node.id}
            className={`cursor-corruption-pointer cursor-corruption-trail cursor-corruption-variant-${node.variant}`}
            style={buildPointerStyle(node.x, node.y, node.variant, node.scale, node.rotation, node.opacity, node.blurPx)}
          />
        ))}

      {!prefersReducedMotion &&
        decoyNodes.map(node => (
          <span
            key={node.id}
            className={`cursor-corruption-pointer cursor-corruption-decoy cursor-corruption-variant-${node.variant}`}
            style={buildPointerStyle(node.x, node.y, node.variant, node.scale, node.rotation, node.opacity, 6)}
          />
        ))}

      {!prefersReducedMotion &&
        flashNodes.map(node => {
          const flashStyle = {
            left: node.x,
            top: node.y,
            opacity: node.opacity,
            width: `${18 * node.scale}px`,
            height: `${18 * node.scale}px`,
          } as CSSProperties;
          return <span key={node.id} className="cursor-corruption-flash" style={flashStyle} />;
        })}

      {ghosts.map((ghost, index) => (
        <span
          key={`ghost-${index}`}
          className={`cursor-corruption-pointer cursor-corruption-ghost cursor-corruption-variant-${persona}`}
          style={buildPointerStyle(ghost.x, ghost.y, persona, ghost.scale, ghost.rotation, ghost.opacity)}
        />
      ))}
      <span
        className={`cursor-corruption-pointer cursor-corruption-primary cursor-corruption-variant-${persona}`}
        style={buildPointerStyle(renderPosition.x, renderPosition.y, persona, 1, 0, 0.97, 3)}
      />
    </div>
  );
}

export default CursorCorruptionLayer;
