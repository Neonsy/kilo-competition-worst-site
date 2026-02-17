'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { HostilityMode, HostilityPhase, hostilityPrimitives, randomInRange, withPityAdjustment } from '@/data/hostilityPrimitives';

interface CursorDecoyState {
  visible: boolean;
  x: number;
  y: number;
  icon: string;
  style: 'not-allowed' | 'wait' | 'progress' | 'crosshair';
}

interface CursorRemapStatus {
  active: number;
  scanned: number;
}

interface TargetedCursorLayerProps {
  phase: HostilityPhase;
  pityPass?: boolean;
  active?: boolean;
  offsetBoost?: number;
  chanceBoost?: number;
  hostilityMode?: HostilityMode;
  onIncident?: (line: string) => void;
  onRemapStatus?: (status: CursorRemapStatus) => void;
}

const DECOY_ICONS = ['⛔', '⌛', '🖱', '✖'];
const CURSOR_STYLES: CursorDecoyState['style'][] = ['not-allowed', 'wait', 'progress', 'crosshair'];
const REMAP_STYLES: CursorDecoyState['style'][] = ['wait', 'not-allowed', 'progress', 'crosshair'];

interface ZoneState {
  fails: number;
  disabledUntil: number;
}

function findTrapTarget(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  const zone = target.closest('[data-trap-zone]');
  if (!(zone instanceof HTMLElement)) return null;

  const interactive = target.closest('button, a, [role="button"], input[type="submit"], input[type="button"], [data-trap-target]');
  if (interactive instanceof HTMLElement) return interactive;
  return zone;
}

export function TargetedCursorLayer({
  phase,
  pityPass = false,
  active = true,
  offsetBoost = 0,
  chanceBoost = 0,
  hostilityMode = 'legacy',
  onIncident,
  onRemapStatus,
}: TargetedCursorLayerProps) {
  const zoneConfig = hostilityPrimitives.cursorTrapZones[0];
  const cursorPresentation = hostilityPrimitives.cursorGlobalRules.presentation;
  const [decoy, setDecoy] = useState<CursorDecoyState>({
    visible: false,
    x: 0,
    y: 0,
    icon: DECOY_ICONS[0],
    style: 'not-allowed',
  });

  const zoneStateMap = useRef(new WeakMap<HTMLElement, ZoneState>());
  const mobileBypassRef = useRef<WeakSet<HTMLElement>>(new WeakSet());
  const hideTimerRef = useRef<number | null>(null);
  const remapTimerRef = useRef<number | null>(null);

  const effectivePhase: HostilityPhase = hostilityMode === 'maximum' ? 3 : phase;
  const trapChance = useMemo(
    () => Math.min(0.92, withPityAdjustment(zoneConfig.activationProbability[effectivePhase], pityPass) + chanceBoost),
    [chanceBoost, effectivePhase, pityPass, zoneConfig.activationProbability]
  );
  const hotspotOffset = useMemo(
    () => Math.max(1, (pityPass ? Math.max(1, Math.floor(zoneConfig.hotspotOffsetPx[effectivePhase] / 2)) : zoneConfig.hotspotOffsetPx[effectivePhase]) + offsetBoost),
    [effectivePhase, offsetBoost, pityPass, zoneConfig.hotspotOffsetPx]
  );

  useEffect(() => {
    if (!active) return;

    const canTrigger = (el: HTMLElement) => {
      const now = Date.now();
      const state = zoneStateMap.current.get(el) || { fails: 0, disabledUntil: 0 };
      if (now < state.disabledUntil) {
        return false;
      }
      return true;
    };

    const registerFail = (el: HTMLElement) => {
      const prev = zoneStateMap.current.get(el) || { fails: 0, disabledUntil: 0 };
      const nextFails = prev.fails + 1;
      if (nextFails >= zoneConfig.failDisableThreshold) {
        zoneStateMap.current.set(el, {
          fails: 0,
          disabledUntil: Date.now() + zoneConfig.struggleCooldownMs,
        });
        onIncident?.('Cursor trap relaxed locally after repeated struggles.');
        return;
      }
      zoneStateMap.current.set(el, { ...prev, fails: nextFails });
    };

    const clearTrapClass = (el: HTMLElement) => {
      el.classList.remove('cursor-trap-active');
      el.classList.remove('cursor-trap-lag');
      el.style.removeProperty('--cursor-trap-offset-x');
      el.style.removeProperty('--cursor-trap-offset-y');
      el.removeAttribute('data-cursor-trap-style');
    };

    const triggerTrap = (el: HTMLElement, clientX: number, clientY: number) => {
      const lag = randomInRange(zoneConfig.lagWindowMs[0], zoneConfig.lagWindowMs[1]);
      const signedOffsetX = (Math.random() > 0.5 ? 1 : -1) * hotspotOffset;
      const signedOffsetY = (Math.random() > 0.5 ? 1 : -1) * hotspotOffset;

      el.classList.add('cursor-trap-active');
      el.classList.add('cursor-trap-lag');
      el.style.setProperty('--cursor-trap-offset-x', `${signedOffsetX}px`);
      el.style.setProperty('--cursor-trap-offset-y', `${signedOffsetY}px`);
      el.dataset.cursorTrapStyle = CURSOR_STYLES[Math.floor(Math.random() * CURSOR_STYLES.length)];

      setDecoy({
        visible: true,
        x: clientX + signedOffsetX,
        y: clientY + signedOffsetY,
        icon: DECOY_ICONS[Math.floor(Math.random() * DECOY_ICONS.length)],
        style: (el.dataset.cursorTrapStyle as CursorDecoyState['style']) || 'not-allowed',
      });

      if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = window.setTimeout(() => {
        setDecoy(prev => ({ ...prev, visible: false }));
        clearTrapClass(el);
      }, lag);

      registerFail(el);
      onIncident?.('Targeted cursor trap triggered near critical control.');
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const target = findTrapTarget(event.target);
      if (!target) return;
      if (!canTrigger(target)) return;
      if (Math.random() > trapChance) return;
      triggerTrap(target, event.clientX, event.clientY);
    };

    const onPointerLeave = (event: PointerEvent) => {
      const target = findTrapTarget(event.target);
      if (!target) return;
      clearTrapClass(target);
      setDecoy(prev => ({ ...prev, visible: false }));
    };

    const onClickCapture = (event: MouseEvent) => {
      const target = findTrapTarget(event.target);
      if (!target) return;
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      if (!isMobile) return;
      if (!canTrigger(target)) return;
      if (mobileBypassRef.current.has(target)) {
        mobileBypassRef.current.delete(target);
        return;
      }
      if (Math.random() > trapChance) return;

      event.preventDefault();
      event.stopPropagation();
      registerFail(target);

      const delay = randomInRange(zoneConfig.mobileDelayMs[0], zoneConfig.mobileDelayMs[1]);
      setDecoy({
        visible: true,
        x: event.clientX || window.innerWidth * 0.5,
        y: event.clientY || window.innerHeight * 0.5,
        icon: '⏳',
        style: 'wait',
      });

      window.setTimeout(() => {
        mobileBypassRef.current.add(target);
        target.click();
        setDecoy(prev => ({ ...prev, visible: false }));
      }, delay);
      onIncident?.('Tap acknowledgement delayed in trap zone.');
    };

    document.addEventListener('pointermove', onPointerMove, true);
    document.addEventListener('pointerleave', onPointerLeave, true);
    document.addEventListener('click', onClickCapture, true);

    return () => {
      document.removeEventListener('pointermove', onPointerMove, true);
      document.removeEventListener('pointerleave', onPointerLeave, true);
      document.removeEventListener('click', onClickCapture, true);
      if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current);
      document
        .querySelectorAll<HTMLElement>('[data-cursor-trap-style], .cursor-trap-active, .cursor-trap-lag')
        .forEach(clearTrapClass);
    };
  }, [active, hotspotOffset, onIncident, trapChance, zoneConfig]);

  useEffect(() => {
    if (!active || hostilityMode !== 'maximum') {
      onRemapStatus?.({ active: 0, scanned: 0 });
      return;
    }

    let cancelled = false;
    const selector =
      '[data-trap-zone] button, [data-trap-zone] a, [data-trap-zone] input[type="submit"], [data-trap-zone] input[type="button"], [data-trap-zone] [role="button"]';

    const clearRemaps = () => {
      document
        .querySelectorAll<HTMLElement>('[data-cursor-remap-style]')
        .forEach(node => node.removeAttribute('data-cursor-remap-style'));
    };

    const runRemapTick = () => {
      if (cancelled) return;
      const controls = Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(node => {
        const style = window.getComputedStyle(node);
        return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0.08;
      });

      let activeRemaps = 0;
      controls.forEach(control => {
        if (Math.random() < cursorPresentation.criticalControlRemapChance) {
          const style = REMAP_STYLES[Math.floor(Math.random() * REMAP_STYLES.length)];
          control.dataset.cursorRemapStyle = style;
          activeRemaps += 1;
          return;
        }
        control.removeAttribute('data-cursor-remap-style');
      });
      onRemapStatus?.({ active: activeRemaps, scanned: controls.length });

      const nextDelay = randomInRange(
        cursorPresentation.criticalControlRemapIntervalMs[0],
        cursorPresentation.criticalControlRemapIntervalMs[1]
      );
      remapTimerRef.current = window.setTimeout(runRemapTick, nextDelay);
    };

    runRemapTick();
    return () => {
      cancelled = true;
      if (remapTimerRef.current !== null) {
        window.clearTimeout(remapTimerRef.current);
        remapTimerRef.current = null;
      }
      clearRemaps();
      onRemapStatus?.({ active: 0, scanned: 0 });
    };
  }, [active, cursorPresentation.criticalControlRemapChance, cursorPresentation.criticalControlRemapIntervalMs, hostilityMode, onRemapStatus]);

  if (!active) return null;

  return (
    <div className="targeted-cursor-layer" aria-hidden>
      {decoy.visible && (
        <span
          className={`targeted-cursor-decoy targeted-cursor-${decoy.style}`}
          style={{ left: decoy.x, top: decoy.y }}
        >
          {decoy.icon}
        </span>
      )}
    </div>
  );
}

export default TargetedCursorLayer;
