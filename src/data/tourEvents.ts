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
  | 'input-corrupt'
  | 'cursor-trap'
  | 'focus-trap'
  | 'clipboard-trap'
  | 'drag-friction'
  | 'chrome-mislead'
  | 'cursor-global-shift'
  | 'cursor-desync'
  | 'loading-loop'
  | 'loading-regress'
  | 'loading-stall'
  | 'skin-mutate'
  | 'minigame-interrupt';

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
    id: 'p1-cursor-global',
    phase: 1,
    trigger: 'idle',
    probability: 0.2,
    effect: 'cursor-global-shift',
    copy: 'Cursor persona rotated unexpectedly.',
    cooldownMs: 2600,
  },
  {
    id: 'p1-cursor-trap',
    phase: 1,
    trigger: 'before-validate',
    probability: 0.2,
    effect: 'cursor-trap',
    copy: 'Cursor calibration shifted near the target control.',
    cooldownMs: 2600,
  },
  {
    id: 'p1-chrome-noise',
    phase: 1,
    trigger: 'idle',
    probability: 0.15,
    effect: 'chrome-mislead',
    copy: 'Fake browser chrome emitted a confidence warning.',
    cooldownMs: 3600,
  },
  {
    id: 'p1-loading-loop',
    phase: 1,
    trigger: 'before-transition',
    probability: 0.16,
    effect: 'loading-loop',
    copy: 'Loading labyrinth loop pressure increased.',
    cooldownMs: 5200,
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
    id: 'p2-focus-trap',
    phase: 2,
    trigger: 'before-validate',
    probability: 0.2,
    effect: 'focus-trap',
    copy: 'Focus drift rule triggered around your active field.',
    cooldownMs: 4200,
  },
  {
    id: 'p2-clipboard-trap',
    phase: 2,
    trigger: 'after-validate',
    probability: 0.16,
    effect: 'clipboard-trap',
    copy: 'Clipboard guard switched to disruptive mode.',
    cooldownMs: 5200,
  },
  {
    id: 'p2-drag-friction',
    phase: 2,
    trigger: 'idle',
    probability: 0.18,
    effect: 'drag-friction',
    copy: 'Drag dampening increased in nearby controls.',
    cooldownMs: 4600,
  },
  {
    id: 'p2-cursor-desync',
    phase: 2,
    trigger: 'idle',
    probability: 0.22,
    effect: 'cursor-desync',
    copy: 'Cursor desync burst armed for trap zones.',
    cooldownMs: 5100,
  },
  {
    id: 'p2-loading-regress',
    phase: 2,
    trigger: 'before-transition',
    probability: 0.19,
    effect: 'loading-regress',
    copy: 'Loading regression pressure applied.',
    cooldownMs: 5600,
  },
  {
    id: 'p2-skin-mutate',
    phase: 2,
    trigger: 'after-validate',
    probability: 0.22,
    effect: 'skin-mutate',
    copy: 'Module design pack swapped mid-run.',
    cooldownMs: 4300,
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
  {
    id: 'p3-cursor-trap',
    phase: 3,
    trigger: 'before-validate',
    probability: 0.23,
    effect: 'cursor-trap',
    copy: 'Phase-3 cursor trap targeted your progress control.',
    cooldownMs: 3200,
  },
  {
    id: 'p3-focus-trap',
    phase: 3,
    trigger: 'before-transition',
    probability: 0.19,
    effect: 'focus-trap',
    copy: 'Focus rerouted to decorative controls.',
    cooldownMs: 5800,
  },
  {
    id: 'p3-clipboard-trap',
    phase: 3,
    trigger: 'after-validate',
    probability: 0.18,
    effect: 'clipboard-trap',
    copy: 'Clipboard corruption window activated.',
    cooldownMs: 6200,
  },
  {
    id: 'p3-drag-friction',
    phase: 3,
    trigger: 'idle',
    probability: 0.2,
    effect: 'drag-friction',
    copy: 'Drag friction surged due to interface stress.',
    cooldownMs: 6400,
  },
  {
    id: 'p3-chrome-mislead',
    phase: 3,
    trigger: 'idle',
    probability: 0.2,
    effect: 'chrome-mislead',
    copy: 'Chrome error ribbon intensified and jittered.',
    cooldownMs: 5000,
  },
  {
    id: 'p3-loading-stall',
    phase: 3,
    trigger: 'before-transition',
    probability: 0.23,
    effect: 'loading-stall',
    copy: 'Loading pipeline stalled under ceremonial review.',
    cooldownMs: 6200,
  },
  {
    id: 'p3-loading-loop',
    phase: 3,
    trigger: 'before-transition',
    probability: 0.24,
    effect: 'loading-loop',
    copy: 'Loading loop event queued.',
    cooldownMs: 6000,
  },
  {
    id: 'p3-minigame-interrupt',
    phase: 3,
    trigger: 'before-validate',
    probability: 0.17,
    effect: 'minigame-interrupt',
    copy: 'Minigame interruption routine activated.',
    cooldownMs: 6700,
  },
  {
    id: 'p3-skin-mutate',
    phase: 3,
    trigger: 'idle',
    probability: 0.2,
    effect: 'skin-mutate',
    copy: 'High pulse mutation swapped a module skin.',
    cooldownMs: 4200,
  },
];

export function getPhaseByStep(step: number): TourEventPhase {
  if (step <= 6) return 1;
  if (step <= 11) return 2;
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
