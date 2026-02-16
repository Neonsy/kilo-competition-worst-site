export type MinigameId = 'bureaucracy-queue' | 'maze-consent' | 'captcha-gauntlet';

export interface MinigamePhaseRule {
  phase: 1 | 2 | 3;
  pressure: number;
}

export interface MinigamePenaltyRule {
  strikeOnFail: number;
  lockoutMsOnFail: [number, number];
  pityTrigger: number;
}

export interface MinigameWinCondition {
  id: string;
  description: string;
}

export interface MinigameSpec {
  id: MinigameId;
  title: string;
  summary: string;
  phaseRules: MinigamePhaseRule[];
  penaltyRule: MinigamePenaltyRule;
  winCondition: MinigameWinCondition;
}

export const minigameSpecs: Record<MinigameId, MinigameSpec> = {
  'bureaucracy-queue': {
    id: 'bureaucracy-queue',
    title: 'Bureaucracy Queue',
    summary: 'Collect and submit fake stamped documents in the correct order while policy mutates.',
    phaseRules: [
      { phase: 1, pressure: 0.35 },
      { phase: 2, pressure: 0.52 },
      { phase: 3, pressure: 0.68 },
    ],
    penaltyRule: {
      strikeOnFail: 1,
      lockoutMsOnFail: [900, 1700],
      pityTrigger: 3,
    },
    winCondition: {
      id: 'bureaucracy-order',
      description: 'Submit the correct 4-document order in a single commit cycle.',
    },
  },
  'maze-consent': {
    id: 'maze-consent',
    title: 'Maze of Consent',
    summary: 'Navigate moving safe tiles while labels and one decoy success tile attempt to mislead.',
    phaseRules: [
      { phase: 1, pressure: 0.4 },
      { phase: 2, pressure: 0.58 },
      { phase: 3, pressure: 0.74 },
    ],
    penaltyRule: {
      strikeOnFail: 1,
      lockoutMsOnFail: [1200, 1900],
      pityTrigger: 2,
    },
    winCondition: {
      id: 'maze-end',
      description: 'Reach end tile in 9 moves or fewer.',
    },
  },
  'captcha-gauntlet': {
    id: 'captcha-gauntlet',
    title: 'Captcha Gauntlet',
    summary: 'Pass three contradictory captcha rounds in one run against shrinking time windows.',
    phaseRules: [
      { phase: 1, pressure: 0.45 },
      { phase: 2, pressure: 0.64 },
      { phase: 3, pressure: 0.8 },
    ],
    penaltyRule: {
      strikeOnFail: 1,
      lockoutMsOnFail: [1400, 2400],
      pityTrigger: 4,
    },
    winCondition: {
      id: 'captcha-three-rounds',
      description: 'Clear all 3 rounds in a single run.',
    },
  },
};

