import { fixedPhaseRecord, MAXIMUM_HOSTILITY } from '@/data/maximumHostility';

export type HostilityPhase = 1 | 2 | 3;
export type HostilityMode = 'legacy' | 'maximum';
export const HOSTILITY_MODE: HostilityMode = 'maximum';

export interface CursorTrapZone {
  id: string;
  selectors: string[];
  activationProbability: Record<HostilityPhase, number>;
  hotspotOffsetPx: Record<HostilityPhase, number>;
  lagWindowMs: [number, number];
  mobileDelayMs: [number, number];
  failDisableThreshold: number;
  struggleCooldownMs: number;
}

export interface FocusTrapRules {
  sabotageChance: Record<HostilityPhase, number>;
  enterRetryWindowMs: number;
  struggleThreshold: number;
  struggleCooldownMs: number;
}

export interface ClipboardRules {
  trapChance: Record<HostilityPhase, number>;
  corruptionWindowMs: [number, number];
  fieldDisableAfterRepeats: number;
}

export interface DragRules {
  frictionMultiplier: Record<HostilityPhase, number>;
  snapBackChance: Record<HostilityPhase, number>;
  maxSnapBackPerInteraction: number;
  retryRelaxationThreshold: number;
}

export interface ChromeRules {
  chromeNoiseByPhase: Record<HostilityPhase, number>;
  interruptionWindowMs: [number, number];
  fakeControlChance: Record<HostilityPhase, number>;
}

export interface CursorGlobalRules {
  baseModeByPhase: Record<HostilityPhase, 'pointer' | 'text' | 'wait' | 'not-allowed' | 'crosshair'>;
  misclassificationChance: Record<HostilityPhase, number>;
  jitterPxByPhase: Record<HostilityPhase, number>;
  driftMsRange: [number, number];
  ghostCursorCountByPhase: Record<HostilityPhase, number>;
  desyncChanceByPhase: Record<HostilityPhase, number>;
  globalRelaxAfterFails: number;
}

export interface LoadingLabyrinthRules {
  stageDurationsMs: Record<HostilityPhase, [number, number]>;
  loopChanceByPhase: Record<HostilityPhase, number>;
  falseCompleteChanceByPhase: Record<HostilityPhase, number>;
  regressionChanceByPhase: Record<HostilityPhase, number>;
  stallChanceByPhase: Record<HostilityPhase, number>;
  rageCooldownMs: number;
  pityBypassAfterLoops: number;
}

export interface HostilityPrimitiveConfig {
  cursorTrapZones: CursorTrapZone[];
  focusTrapRules: FocusTrapRules;
  clipboardRules: ClipboardRules;
  dragRules: DragRules;
  chromeRules: ChromeRules;
  cursorGlobalRules: CursorGlobalRules;
  loadingLabyrinthRules: LoadingLabyrinthRules;
}

export const hostilityPrimitives: HostilityPrimitiveConfig = {
  cursorTrapZones: [
    {
      id: 'primary-actions',
      selectors: [
        '[data-trap-zone]',
        '[data-trap-zone] button',
        '[data-trap-zone] a',
        '[data-trap-zone] input[type="submit"]',
        '[data-trap-zone] input[type="button"]',
      ],
      activationProbability: fixedPhaseRecord(MAXIMUM_HOSTILITY.primitives.cursorTrap),
      hotspotOffsetPx: fixedPhaseRecord(MAXIMUM_HOSTILITY.primitives.cursorHotspotOffset),
      lagWindowMs: [120, 260],
      mobileDelayMs: [120, 350],
      failDisableThreshold: 3,
      struggleCooldownMs: 8000,
    },
  ],
  focusTrapRules: {
    sabotageChance: fixedPhaseRecord(MAXIMUM_HOSTILITY.primitives.focusSabotage),
    enterRetryWindowMs: 3500,
    struggleThreshold: 2,
    struggleCooldownMs: 8000,
  },
  clipboardRules: {
    trapChance: fixedPhaseRecord(MAXIMUM_HOSTILITY.primitives.clipboardTrap),
    corruptionWindowMs: [900, 2200],
    fieldDisableAfterRepeats: 2,
  },
  dragRules: {
    frictionMultiplier: fixedPhaseRecord(MAXIMUM_HOSTILITY.primitives.dragFriction),
    snapBackChance: fixedPhaseRecord(MAXIMUM_HOSTILITY.primitives.dragSnapBack),
    maxSnapBackPerInteraction: 1,
    retryRelaxationThreshold: 2,
  },
  chromeRules: {
    chromeNoiseByPhase: fixedPhaseRecord(MAXIMUM_HOSTILITY.primitives.chromeNoise),
    interruptionWindowMs: [700, 1500],
    fakeControlChance: fixedPhaseRecord(MAXIMUM_HOSTILITY.primitives.chromeFakeControl),
  },
  cursorGlobalRules: {
    baseModeByPhase: { 1: 'crosshair', 2: 'crosshair', 3: 'crosshair' },
    misclassificationChance: fixedPhaseRecord(MAXIMUM_HOSTILITY.primitives.cursorMisclassification),
    jitterPxByPhase: fixedPhaseRecord(MAXIMUM_HOSTILITY.primitives.cursorHotspotOffset),
    driftMsRange: [90, 210],
    ghostCursorCountByPhase: fixedPhaseRecord(MAXIMUM_HOSTILITY.primitives.cursorGhostCount),
    desyncChanceByPhase: fixedPhaseRecord(MAXIMUM_HOSTILITY.primitives.cursorDesync),
    globalRelaxAfterFails: 3,
  },
  loadingLabyrinthRules: {
    stageDurationsMs: {
      1: MAXIMUM_HOSTILITY.primitives.loadingStageDurationMs,
      2: MAXIMUM_HOSTILITY.primitives.loadingStageDurationMs,
      3: MAXIMUM_HOSTILITY.primitives.loadingStageDurationMs,
    },
    loopChanceByPhase: fixedPhaseRecord(MAXIMUM_HOSTILITY.primitives.loadingLoop),
    falseCompleteChanceByPhase: fixedPhaseRecord(MAXIMUM_HOSTILITY.primitives.loadingFalseComplete),
    regressionChanceByPhase: fixedPhaseRecord(MAXIMUM_HOSTILITY.primitives.loadingRegression),
    stallChanceByPhase: fixedPhaseRecord(MAXIMUM_HOSTILITY.primitives.loadingStall),
    rageCooldownMs: 18000,
    pityBypassAfterLoops: 4,
  },
};

export function withPityAdjustment(baseChance: number, pityPass: boolean): number {
  if (!pityPass) return baseChance;
  return Math.max(0, Math.min(1, baseChance * 0.5));
}

export function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
