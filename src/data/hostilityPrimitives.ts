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
  presentation: {
    nativeCursorPolicy: 'mostly-visible-brief-hide';
    hideBurstChanceOnDesync: number;
    hideBurstWindowMs: [number, number];
    hideBurstCooldownMs: number;
    trailLifetimeMs: number;
    trailSpawnIntervalMs: number;
    maxTrailNodesDesktop: number;
    maxTrailNodesMobile: number;
    trailBlurPxRange: [number, number];
    trailOpacityRange: [number, number];
    trailPointerStyle: 'real-pointer';
    trailScaleRange: [number, number];
    trailRotationJitterDeg: [number, number];
    liveDecoyEnabled: boolean;
    liveDecoyCountDesktop: number;
    liveDecoyCountMobile: number;
    liveDecoyOffsetPxRange: [number, number];
    criticalControlRemapChance: number;
    criticalControlRemapIntervalMs: [number, number];
    desyncClickOffsetChance: number;
    desyncClickOffsetPxRange: [number, number];
  };
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

const cursorPresentationSource = MAXIMUM_HOSTILITY.primitives.cursorPresentation;
const cursorPresentationDefaults: CursorGlobalRules['presentation'] = {
  nativeCursorPolicy: 'mostly-visible-brief-hide',
  hideBurstChanceOnDesync: 0.16,
  hideBurstWindowMs: [140, 280],
  hideBurstCooldownMs: 1100,
  trailLifetimeMs: 3000,
  trailSpawnIntervalMs: 70,
  maxTrailNodesDesktop: 42,
  maxTrailNodesMobile: 24,
  trailBlurPxRange: [6, 14],
  trailOpacityRange: [0.08, 0.42],
  trailPointerStyle: 'real-pointer',
  trailScaleRange: [0.9, 1.2],
  trailRotationJitterDeg: [-6, 6],
  liveDecoyEnabled: true,
  liveDecoyCountDesktop: 1,
  liveDecoyCountMobile: 0,
  liveDecoyOffsetPxRange: [10, 24],
  criticalControlRemapChance: 0.6,
  criticalControlRemapIntervalMs: [480, 980],
  desyncClickOffsetChance: 0.34,
  desyncClickOffsetPxRange: [4, 12],
};

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
    presentation: {
      nativeCursorPolicy: cursorPresentationSource.nativeCursorPolicy ?? cursorPresentationDefaults.nativeCursorPolicy,
      hideBurstChanceOnDesync: cursorPresentationSource.hideBurstChanceOnDesync ?? cursorPresentationDefaults.hideBurstChanceOnDesync,
      hideBurstWindowMs: cursorPresentationSource.hideBurstWindowMs ?? cursorPresentationDefaults.hideBurstWindowMs,
      hideBurstCooldownMs: cursorPresentationSource.hideBurstCooldownMs ?? cursorPresentationDefaults.hideBurstCooldownMs,
      trailLifetimeMs: cursorPresentationSource.trailLifetimeMs ?? cursorPresentationDefaults.trailLifetimeMs,
      trailSpawnIntervalMs: cursorPresentationSource.trailSpawnIntervalMs ?? cursorPresentationDefaults.trailSpawnIntervalMs,
      maxTrailNodesDesktop: cursorPresentationSource.maxTrailNodesDesktop ?? cursorPresentationDefaults.maxTrailNodesDesktop,
      maxTrailNodesMobile: cursorPresentationSource.maxTrailNodesMobile ?? cursorPresentationDefaults.maxTrailNodesMobile,
      trailBlurPxRange: cursorPresentationSource.trailBlurPxRange ?? cursorPresentationDefaults.trailBlurPxRange,
      trailOpacityRange: cursorPresentationSource.trailOpacityRange ?? cursorPresentationDefaults.trailOpacityRange,
      trailPointerStyle: cursorPresentationSource.trailPointerStyle ?? cursorPresentationDefaults.trailPointerStyle,
      trailScaleRange: cursorPresentationSource.trailScaleRange ?? cursorPresentationDefaults.trailScaleRange,
      trailRotationJitterDeg: cursorPresentationSource.trailRotationJitterDeg ?? cursorPresentationDefaults.trailRotationJitterDeg,
      liveDecoyEnabled: cursorPresentationSource.liveDecoyEnabled ?? cursorPresentationDefaults.liveDecoyEnabled,
      liveDecoyCountDesktop: cursorPresentationSource.liveDecoyCountDesktop ?? cursorPresentationDefaults.liveDecoyCountDesktop,
      liveDecoyCountMobile: cursorPresentationSource.liveDecoyCountMobile ?? cursorPresentationDefaults.liveDecoyCountMobile,
      liveDecoyOffsetPxRange: cursorPresentationSource.liveDecoyOffsetPxRange ?? cursorPresentationDefaults.liveDecoyOffsetPxRange,
      criticalControlRemapChance: cursorPresentationSource.criticalControlRemapChance ?? cursorPresentationDefaults.criticalControlRemapChance,
      criticalControlRemapIntervalMs: cursorPresentationSource.criticalControlRemapIntervalMs ?? cursorPresentationDefaults.criticalControlRemapIntervalMs,
      desyncClickOffsetChance: cursorPresentationSource.desyncClickOffsetChance ?? cursorPresentationDefaults.desyncClickOffsetChance,
      desyncClickOffsetPxRange: cursorPresentationSource.desyncClickOffsetPxRange ?? cursorPresentationDefaults.desyncClickOffsetPxRange,
    },
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
