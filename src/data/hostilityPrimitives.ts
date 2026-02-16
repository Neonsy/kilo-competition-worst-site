export type HostilityPhase = 1 | 2 | 3;

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
      activationProbability: { 1: 0.16, 2: 0.28, 3: 0.39 },
      hotspotOffsetPx: { 1: 2, 2: 4, 3: 6 },
      lagWindowMs: [120, 260],
      mobileDelayMs: [120, 350],
      failDisableThreshold: 3,
      struggleCooldownMs: 8000,
    },
  ],
  focusTrapRules: {
    sabotageChance: { 1: 0.1, 2: 0.18, 3: 0.27 },
    enterRetryWindowMs: 3500,
    struggleThreshold: 2,
    struggleCooldownMs: 8000,
  },
  clipboardRules: {
    trapChance: { 1: 0.08, 2: 0.15, 3: 0.24 },
    corruptionWindowMs: [900, 2200],
    fieldDisableAfterRepeats: 2,
  },
  dragRules: {
    frictionMultiplier: { 1: 1.15, 2: 1.35, 3: 1.55 },
    snapBackChance: { 1: 0.08, 2: 0.14, 3: 0.2 },
    maxSnapBackPerInteraction: 1,
    retryRelaxationThreshold: 2,
  },
  chromeRules: {
    chromeNoiseByPhase: { 1: 0.3, 2: 0.55, 3: 0.82 },
    interruptionWindowMs: [700, 1500],
    fakeControlChance: { 1: 0.16, 2: 0.25, 3: 0.35 },
  },
  cursorGlobalRules: {
    baseModeByPhase: { 1: 'pointer', 2: 'wait', 3: 'crosshair' },
    misclassificationChance: { 1: 0.32, 2: 0.48, 3: 0.64 },
    jitterPxByPhase: { 1: 2, 2: 4, 3: 7 },
    driftMsRange: [90, 210],
    ghostCursorCountByPhase: { 1: 1, 2: 2, 3: 3 },
    desyncChanceByPhase: { 1: 0.14, 2: 0.24, 3: 0.36 },
    globalRelaxAfterFails: 3,
  },
  loadingLabyrinthRules: {
    stageDurationsMs: {
      1: [280, 520],
      2: [340, 620],
      3: [430, 760],
    },
    loopChanceByPhase: { 1: 0.22, 2: 0.34, 3: 0.46 },
    falseCompleteChanceByPhase: { 1: 0.18, 2: 0.29, 3: 0.41 },
    regressionChanceByPhase: { 1: 0.1, 2: 0.18, 3: 0.27 },
    stallChanceByPhase: { 1: 0.15, 2: 0.25, 3: 0.33 },
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
