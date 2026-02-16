export type ResonancePulseKind = 'event' | 'cursor' | 'loading' | 'minigame' | 'mutation';

export interface ResonancePulseState {
  key: number;
  kind: ResonancePulseKind;
  strength: number;
  at: number;
}

export const initialResonancePulseState: ResonancePulseState = {
  key: 0,
  kind: 'event',
  strength: 0.2,
  at: 0,
};

export function emitPulse(
  prev: ResonancePulseState,
  kind: ResonancePulseKind,
  strength: number
): ResonancePulseState {
  return {
    key: prev.key + 1,
    kind,
    strength: Math.max(0, Math.min(1, strength)),
    at: Date.now(),
  };
}

