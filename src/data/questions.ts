import { MinigameId } from '@/data/minigames';

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
  regretMultiplier: number;
  leadsTo?: string;
}

export type TourQuestionType =
  | 'door'
  | 'button'
  | 'sound'
  | 'slider'
  | 'color'
  | 'radio'
  | 'input'
  | 'confirm'
  | 'matrix'
  | 'memory'
  | 'timelock'
  | 'integrity'
  | 'minigame';

export interface TourQuestion {
  id: string;
  questionNumber: number;
  phase: 1 | 2 | 3;
  difficultyWeight: number;
  title: string;
  subtitle: string;
  type: TourQuestionType;
  options?: QuestionOption[];
  placeholder?: string;
  validation?: {
    required: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    minSelections?: number;
    customMessage?: string;
  };
  penaltyHooks?: string[];
  eventHooks?: string[];
  moduleSkinPool?: string[];
  mutationHooks?: string[];
  minigameId?: MinigameId;
  requiredWinCondition?: string;
  helpText: string;
  disclaimer?: string;
}

const allSkinPools = ['retro-os', 'corporate-gray', 'festival-neon', 'terminal-crash', 'print-flyer', 'medical-form', 'infomercial', 'broken-admin'];

export const tourQuestions: TourQuestion[] = [
  {
    id: 'door-choice',
    questionNumber: 1,
    phase: 1,
    difficultyWeight: 1.05,
    title: 'Pick a Door',
    subtitle: 'Choose wisely. The doors are all hostile.',
    type: 'door',
    options: [
      { id: 'door-1', label: '🚪 Door #1', value: 'door1', regretMultiplier: 1.2 },
      { id: 'door-2', label: '🚪 Door #2', value: 'door2', regretMultiplier: 1.4 },
      { id: 'door-3', label: '🚪 Door #3', value: 'door3', regretMultiplier: 1.1 },
    ],
    penaltyHooks: ['suspicion'],
    eventHooks: ['before-validate'],
    moduleSkinPool: allSkinPools,
    mutationHooks: ['click', 'event'],
    helpText: 'No door is a safe door.',
  },
  {
    id: 'unsafe-button',
    questionNumber: 2,
    phase: 1,
    difficultyWeight: 1.1,
    title: 'Choose an Unsafe Button',
    subtitle: 'Pick with confidence. Confidence is punishable.',
    type: 'button',
    options: [
      { id: 'btn-red', label: '🔴 DO NOT PRESS', value: 'red', regretMultiplier: 2.0 },
      { id: 'btn-green', label: '🟢 Press Maybe', value: 'green', regretMultiplier: 1.3 },
      { id: 'btn-blue', label: '🔵 Looks Fine', value: 'blue', regretMultiplier: 1.1 },
      { id: 'btn-yellow', label: '🟡 Risky Prize', value: 'yellow', regretMultiplier: 1.8 },
      { id: 'btn-purple', label: '🟣 Undefined', value: 'purple', regretMultiplier: 1.6 },
    ],
    penaltyHooks: ['strike'],
    eventHooks: ['after-validate'],
    moduleSkinPool: allSkinPools,
    mutationHooks: ['hover', 'click'],
    helpText: 'All labels are decorative.',
  },
  {
    id: 'hated-sound',
    questionNumber: 3,
    phase: 1,
    difficultyWeight: 1.15,
    title: 'Select a Sound You Hate',
    subtitle: 'Remember your answer. It will return.',
    type: 'sound',
    options: [
      { id: 'sound-nails', label: 'Nails on chalkboard', value: 'nails', regretMultiplier: 1.4 },
      { id: 'sound-alarm', label: '3AM alarm clock', value: 'alarm', regretMultiplier: 1.2 },
      { id: 'sound-chew', label: 'Loud chewing', value: 'chew', regretMultiplier: 1.3 },
      { id: 'sound-baby', label: 'Crying baby on plane', value: 'baby', regretMultiplier: 1.5 },
      { id: 'sound-dialup', label: 'Dial-up modem', value: 'dialup', regretMultiplier: 1.1 },
    ],
    penaltyHooks: ['instability'],
    eventHooks: ['before-transition'],
    moduleSkinPool: allSkinPools,
    mutationHooks: ['click'],
    helpText: 'Memory pressure begins now.',
  },
  {
    id: 'confidence-slider',
    questionNumber: 4,
    phase: 1,
    difficultyWeight: 1.2,
    title: 'Rate Your Confidence',
    subtitle: 'Move the slider and question your life.',
    type: 'slider',
    penaltyHooks: ['instability'],
    eventHooks: ['after-validate'],
    moduleSkinPool: allSkinPools,
    mutationHooks: ['drag', 'event'],
    helpText: 'The slider is emotionally unstable.',
  },
  {
    id: 'contradiction-matrix',
    questionNumber: 5,
    phase: 1,
    difficultyWeight: 1.4,
    title: 'Contradiction Matrix',
    subtitle: 'Pick statements that conflict with each other.',
    type: 'matrix',
    options: [
      { id: 'cm-1', label: 'I always click carefully.', value: 'careful', regretMultiplier: 1.1 },
      { id: 'cm-2', label: 'I clicked every flashing thing.', value: 'flash', regretMultiplier: 1.6 },
      { id: 'cm-3', label: 'I trust this interface.', value: 'trust', regretMultiplier: 1.5 },
      { id: 'cm-4', label: 'I trust nothing now.', value: 'none', regretMultiplier: 1.5 },
    ],
    validation: {
      required: true,
      minSelections: 2,
      customMessage: 'Pick at least two contradictions.',
    },
    penaltyHooks: ['strike', 'lockout'],
    eventHooks: ['before-validate', 'after-validate'],
    moduleSkinPool: allSkinPools,
    mutationHooks: ['click', 'fail'],
    helpText: 'Consistency is not rewarded.',
  },
  {
    id: 'bureaucracy-queue',
    questionNumber: 6,
    phase: 1,
    difficultyWeight: 1.65,
    title: 'Minigame A: Bureaucracy Queue',
    subtitle: 'Collect fake documents in the exact order while policy mutates.',
    type: 'minigame',
    minigameId: 'bureaucracy-queue',
    requiredWinCondition: 'Submit correct 4-document order in one commit cycle.',
    penaltyHooks: ['strike', 'lockout'],
    eventHooks: ['before-validate'],
    moduleSkinPool: allSkinPools,
    mutationHooks: ['click', 'event', 'fail'],
    helpText: 'Wrong order causes queue reset and penalties.',
  },
  {
    id: 'memory-trap',
    questionNumber: 7,
    phase: 2,
    difficultyWeight: 1.45,
    title: 'Memory Trap',
    subtitle: 'Type the exact sound code from Step 3.',
    type: 'memory',
    placeholder: 'nails / alarm / chew / baby / dialup',
    validation: { required: true, minLength: 3, maxLength: 20 },
    penaltyHooks: ['regress', 'suspicion'],
    eventHooks: ['before-validate'],
    moduleSkinPool: allSkinPools,
    mutationHooks: ['input', 'fail'],
    helpText: 'Exact text only.',
  },
  {
    id: 'color-wrong',
    questionNumber: 8,
    phase: 2,
    difficultyWeight: 1.5,
    title: 'Pick a Color',
    subtitle: 'Labels are wrong. Outcomes are not.',
    type: 'color',
    options: [
      { id: 'color-1', label: 'Red (actually blue)', value: 'blue', regretMultiplier: 1.1 },
      { id: 'color-2', label: 'Blue (actually green)', value: 'green', regretMultiplier: 1.2 },
      { id: 'color-3', label: 'Green (actually red)', value: 'red', regretMultiplier: 1.3 },
      { id: 'color-4', label: 'Yellow (actually yellow)', value: 'yellow', regretMultiplier: 0.9 },
      { id: 'color-5', label: 'Purple (trust issue)', value: 'purple', regretMultiplier: 1.4 },
    ],
    penaltyHooks: ['strike'],
    eventHooks: ['after-validate'],
    moduleSkinPool: allSkinPools,
    mutationHooks: ['click'],
    helpText: 'Perception is taxed here.',
  },
  {
    id: 'fate-choice',
    questionNumber: 9,
    phase: 2,
    difficultyWeight: 1.55,
    title: 'Choose Your Fate',
    subtitle: 'All outcomes are valid and disappointing.',
    type: 'radio',
    options: [
      { id: 'fate-1', label: 'Accept', value: 'accept', regretMultiplier: 1.0 },
      { id: 'fate-2', label: 'Deny', value: 'deny', regretMultiplier: 1.3 },
      { id: 'fate-3', label: 'Negotiate', value: 'negotiate', regretMultiplier: 1.5 },
      { id: 'fate-4', label: 'Pretend', value: 'pretend', regretMultiplier: 1.2 },
      { id: 'fate-5', label: 'Random', value: 'random', regretMultiplier: 1.1 },
    ],
    penaltyHooks: ['instability', 'suspicion'],
    eventHooks: ['before-transition'],
    moduleSkinPool: allSkinPools,
    mutationHooks: ['click'],
    helpText: 'Destiny has no support queue.',
  },
  {
    id: 'useless-data',
    questionNumber: 10,
    phase: 2,
    difficultyWeight: 1.8,
    title: 'Enter Useless Data',
    subtitle: 'Provide data with no practical purpose.',
    type: 'input',
    placeholder: 'Name (normal names may be rejected)',
    validation: {
      required: true,
      minLength: 2,
      maxLength: 50,
      customMessage: 'Normality rejected.',
    },
    penaltyHooks: ['input-corrupt', 'strike'],
    eventHooks: ['before-validate', 'after-validate'],
    moduleSkinPool: allSkinPools,
    mutationHooks: ['input', 'fail'],
    helpText: 'Creativity is mandatory.',
  },
  {
    id: 'maze-consent',
    questionNumber: 11,
    phase: 2,
    difficultyWeight: 1.9,
    title: 'Minigame B: Maze of Consent',
    subtitle: 'Reach end tile with moving safe path and decoy success trap.',
    type: 'minigame',
    minigameId: 'maze-consent',
    requiredWinCondition: 'Reach end tile within 9 moves.',
    penaltyHooks: ['strike', 'lockout', 'regress'],
    eventHooks: ['before-validate'],
    moduleSkinPool: allSkinPools,
    mutationHooks: ['click', 'fail', 'event'],
    helpText: 'One tile lies about success.',
  },
  {
    id: 'timelock-confirm',
    questionNumber: 12,
    phase: 3,
    difficultyWeight: 1.95,
    title: 'Time-Lock Confirmation',
    subtitle: 'Submit while gate is open.',
    type: 'timelock',
    options: [
      { id: 'tl-1', label: 'Proceed now', value: 'proceed', regretMultiplier: 1.4 },
      { id: 'tl-2', label: 'Wait', value: 'wait', regretMultiplier: 1.1 },
      { id: 'tl-3', label: 'Spam', value: 'spam', regretMultiplier: 1.9 },
    ],
    validation: { required: true },
    penaltyHooks: ['lockout', 'freeze'],
    eventHooks: ['before-validate', 'before-transition'],
    moduleSkinPool: allSkinPools,
    mutationHooks: ['click', 'event'],
    helpText: 'Open windows are brief.',
  },
  {
    id: 'integrity-check',
    questionNumber: 13,
    phase: 3,
    difficultyWeight: 2.1,
    title: 'Integrity Check Alpha',
    subtitle: 'Checksum, PIN, and oath required.',
    type: 'integrity',
    validation: { required: true, minLength: 3 },
    penaltyHooks: ['strike', 'regress', 'suspicion'],
    eventHooks: ['before-validate', 'after-validate'],
    moduleSkinPool: allSkinPools,
    mutationHooks: ['input', 'fail'],
    helpText: 'Checksum must include digits.',
  },
  {
    id: 'policy-ack',
    questionNumber: 14,
    phase: 3,
    difficultyWeight: 2.14,
    title: 'Policy Acknowledgment',
    subtitle: 'Acknowledge contradictory policy statements.',
    type: 'radio',
    options: [
      { id: 'pa-1', label: 'I agree with all policies', value: 'agree', regretMultiplier: 1.2 },
      { id: 'pa-2', label: 'I disagree with all policies', value: 'disagree', regretMultiplier: 1.4 },
      { id: 'pa-3', label: 'I agree and disagree', value: 'both', regretMultiplier: 1.7 },
    ],
    validation: { required: true },
    penaltyHooks: ['suspicion', 'strike'],
    eventHooks: ['before-validate'],
    moduleSkinPool: allSkinPools,
    mutationHooks: ['click'],
    helpText: 'Contradiction is compliant.',
  },
  {
    id: 'latency-oath',
    questionNumber: 15,
    phase: 3,
    difficultyWeight: 2.18,
    title: 'Latency Oath',
    subtitle: 'Swear to tolerate unstable latency.',
    type: 'confirm',
    options: [
      { id: 'lo-1', label: 'I swear', value: 'swear', regretMultiplier: 1.3 },
      { id: 'lo-2', label: 'I might swear', value: 'might', regretMultiplier: 1.7 },
      { id: 'lo-3', label: 'I reject latency', value: 'reject', regretMultiplier: 2.1 },
    ],
    validation: { required: true },
    penaltyHooks: ['lockout', 'strike'],
    eventHooks: ['after-validate'],
    moduleSkinPool: allSkinPools,
    mutationHooks: ['click', 'fail'],
    helpText: 'Latency has legal standing here.',
  },
  {
    id: 'captcha-gauntlet',
    questionNumber: 16,
    phase: 3,
    difficultyWeight: 2.25,
    title: 'Minigame C: Captcha Gauntlet',
    subtitle: 'Pass three contradictory rounds in one run.',
    type: 'minigame',
    minigameId: 'captcha-gauntlet',
    requiredWinCondition: 'Clear 3 rounds without a reset.',
    penaltyHooks: ['strike', 'lockout', 'freeze'],
    eventHooks: ['before-validate', 'after-validate'],
    moduleSkinPool: allSkinPools,
    mutationHooks: ['click', 'fail', 'event'],
    helpText: 'Timer gets tighter with hostility.',
  },
  {
    id: 'integrity-check-beta',
    questionNumber: 17,
    phase: 3,
    difficultyWeight: 2.3,
    title: 'Integrity Check Beta',
    subtitle: 'Provide final phrase and numerical suffix.',
    type: 'input',
    placeholder: 'Format: phrase-42',
    validation: {
      required: true,
      minLength: 6,
      customMessage: 'Use phrase-number format.',
    },
    penaltyHooks: ['regress', 'strike'],
    eventHooks: ['before-validate', 'before-transition'],
    moduleSkinPool: allSkinPools,
    mutationHooks: ['input', 'fail'],
    helpText: 'Must include at least one hyphen and one number.',
  },
  {
    id: 'final-confirm',
    questionNumber: 18,
    phase: 3,
    difficultyWeight: 2.4,
    title: 'Final Confirmation',
    subtitle: 'Final means almost final.',
    type: 'confirm',
    options: [
      { id: 'confirm-yes', label: 'Yes, finalize', value: 'yes', regretMultiplier: 1.0 },
      { id: 'confirm-no', label: 'No, regress me', value: 'no', regretMultiplier: 1.8 },
      { id: 'confirm-maybe', label: 'Maybe, delay me', value: 'maybe', regretMultiplier: 2.0 },
    ],
    validation: { required: true },
    penaltyHooks: ['lockout', 'regress', 'freeze'],
    eventHooks: ['before-validate', 'before-transition'],
    moduleSkinPool: allSkinPools,
    mutationHooks: ['click', 'event', 'fail'],
    helpText: 'There is one real completion path.',
  },
];

export function getQuestionById(id: string): TourQuestion | undefined {
  return tourQuestions.find(q => q.id === id);
}

export function getQuestionByNumber(num: number): TourQuestion | undefined {
  return tourQuestions.find(q => q.questionNumber === num);
}

export const totalQuestions = tourQuestions.length;

