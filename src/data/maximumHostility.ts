type HostilityPhase = 1 | 2 | 3;

export const MAXIMUM_HOSTILITY = {
  visual: {
    resonanceIntensity: 0.97,
    resonanceNoiseSeverity: 0.88,
    resonancePulseIntensity: 0.97,
    resonanceFragmentDensity: 'dense' as const,
    resonanceCoverage: 'full' as const,
  },
  shell: {
    profile: 'heavy' as const,
    intensity: 0.95,
    breakMs: 340,
    healMs: 620,
    maxTargets: 5,
    ambientRangeMs: [1200, 2200] as [number, number],
    aftershockDelayMs: 220,
  },
  heartbeat: {
    intervalMs: 1300,
    spikeIntervalMs: 3600,
    baseStrength: 0.62,
    spikeStrength: 0.9,
  },
  overlay: {
    intensity: 'high' as const,
    occluderBaseChance: 0.34,
    occluderWindowMs: [900, 1700] as [number, number],
    badges: 12,
    ghosts: 14,
    rifts: 6,
    fractureNoticeIntervalMs: 1100,
  },
  primitives: {
    cursorTrap: 0.44,
    cursorHotspotOffset: 8,
    focusSabotage: 0.34,
    clipboardTrap: 0.28,
    dragFriction: 1.6,
    dragSnapBack: 0.22,
    chromeNoise: 0.9,
    chromeFakeControl: 0.38,
    cursorMisclassification: 0.7,
    cursorDesync: 0.42,
    cursorGhostCount: 3,
    loadingLoop: 0.42,
    loadingFalseComplete: 0.38,
    loadingRegression: 0.31,
    loadingStall: 0.36,
    loadingStageDurationMs: [430, 760] as [number, number],
  },
  tour: {
    beforeValidateChance: 0.56,
    afterValidateChance: 0.52,
    beforeTransitionChance: 0.54,
    idleChance: 0.46,
    regressionChance: 0.24,
    lockoutRangeMs: [2200, 4200] as [number, number],
    randomValidationAdditive: 0.1,
  },
} as const;

export function fixedPhaseRecord<T>(value: T): Record<HostilityPhase, T> {
  return { 1: value, 2: value, 3: value };
}
