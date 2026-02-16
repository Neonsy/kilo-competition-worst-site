export type TourEventPhase = 1 | 2 | 3;
export type TourEventTrigger = 'before-validate' | 'after-validate' | 'before-transition' | 'idle';
export type TourEventEffect =
  | 'strike'
  | 'regress'
  | 'lockout'
  | 'instability'
  | 'suspicion'
  | 'freeze'
  | 'grant-recovery'
  | 'input-corrupt';

export interface TourEvent {
  id: string;
  phase: TourEventPhase;
  trigger: TourEventTrigger;
  probability: number;
  effect: TourEventEffect;
  copy: string;
  cooldownMs: number;
}

interface ScheduleParams {
  phase: TourEventPhase;
  trigger: TourEventTrigger;
  now: number;
  lastEventAt: number;
  catastrophicCooldownMs: number;
  baseChance: number;
  rng: (salt: number) => number;
}

const CATASTROPHIC_EFFECTS: TourEventEffect[] = ['regress', 'lockout', 'freeze'];

export const tourEvents: TourEvent[] = [
  {
    id: 'p1-validation-nag',
    phase: 1,
    trigger: 'before-validate',
    probability: 0.35,
    effect: 'strike',
    copy: 'Validation inspector frowned at your posture. Strike applied.',
    cooldownMs: 3000,
  },
  {
    id: 'p1-instability-kick',
    phase: 1,
    trigger: 'after-validate',
    probability: 0.3,
    effect: 'instability',
    copy: 'Mild interface turbulence detected.',
    cooldownMs: 2600,
  },
  {
    id: 'p1-mercy-token',
    phase: 1,
    trigger: 'before-transition',
    probability: 0.18,
    effect: 'grant-recovery',
    copy: 'A pity token has been issued by legal compliance.',
    cooldownMs: 8000,
  },
  {
    id: 'p2-suspicion-spike',
    phase: 2,
    trigger: 'before-validate',
    probability: 0.28,
    effect: 'suspicion',
    copy: 'Your confidence was flagged as suspicious.',
    cooldownMs: 2800,
  },
  {
    id: 'p2-soft-lockout',
    phase: 2,
    trigger: 'after-validate',
    probability: 0.26,
    effect: 'lockout',
    copy: 'Queue saturation detected. Temporary lockout activated.',
    cooldownMs: 4500,
  },
  {
    id: 'p2-step-regression',
    phase: 2,
    trigger: 'before-transition',
    probability: 0.22,
    effect: 'regress',
    copy: 'Sequence drift: your step index moved backwards.',
    cooldownMs: 7000,
  },
  {
    id: 'p2-input-corrupt',
    phase: 2,
    trigger: 'before-validate',
    probability: 0.2,
    effect: 'input-corrupt',
    copy: 'Input hygiene incident: text corruption mode enabled.',
    cooldownMs: 5000,
  },
  {
    id: 'p3-freeze-burst',
    phase: 3,
    trigger: 'before-validate',
    probability: 0.28,
    effect: 'freeze',
    copy: 'UI freeze burst initiated for authenticity.',
    cooldownMs: 9000,
  },
  {
    id: 'p3-hard-lockout',
    phase: 3,
    trigger: 'after-validate',
    probability: 0.3,
    effect: 'lockout',
    copy: 'Thermal lockout engaged. Please wait while nothing improves.',
    cooldownMs: 7000,
  },
  {
    id: 'p3-regress',
    phase: 3,
    trigger: 'before-transition',
    probability: 0.24,
    effect: 'regress',
    copy: 'Integrity mismatch forced a reverse progression event.',
    cooldownMs: 12000,
  },
  {
    id: 'p3-strike',
    phase: 3,
    trigger: 'before-validate',
    probability: 0.3,
    effect: 'strike',
    copy: 'Compliance strike issued for excessive optimism.',
    cooldownMs: 2800,
  },
];

export function getPhaseByStep(step: number): TourEventPhase {
  if (step <= 4) return 1;
  if (step <= 8) return 2;
  return 3;
}

export function scheduleTourEvent(params: ScheduleParams): TourEvent | null {
  const {
    phase,
    trigger,
    now,
    lastEventAt,
    catastrophicCooldownMs,
    baseChance,
    rng,
  } = params;

  if (rng(1) > baseChance) {
    return null;
  }

  const candidates = tourEvents.filter(event => {
    if (event.phase !== phase || event.trigger !== trigger) {
      return false;
    }
    if (now - lastEventAt < event.cooldownMs) {
      return false;
    }
    if (
      CATASTROPHIC_EFFECTS.includes(event.effect) &&
      now - lastEventAt < catastrophicCooldownMs
    ) {
      return false;
    }
    return true;
  });

  if (candidates.length === 0) {
    return null;
  }

  const totalWeight = candidates.reduce((sum, event) => sum + event.probability, 0);
  const roll = rng(2) * totalWeight;
  let cumulative = 0;
  for (const event of candidates) {
    cumulative += event.probability;
    if (roll <= cumulative) {
      return event;
    }
  }
  return candidates[candidates.length - 1] || null;
}
