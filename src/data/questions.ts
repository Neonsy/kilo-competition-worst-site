// Tour Wizard Questions - Hostile and Confusing

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
  | 'integrity';

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
  helpText: string;
  disclaimer?: string;
}

export const tourQuestions: TourQuestion[] = [
  {
    id: 'door-choice',
    questionNumber: 1,
    phase: 1,
    difficultyWeight: 1.05,
    title: 'Pick a Door',
    subtitle: 'Choose wisely. Or do not. The doors still disappoint equally.',
    type: 'door',
    options: [
      { id: 'door-1', label: '🚪 Door #1', value: 'door1', regretMultiplier: 1.2 },
      { id: 'door-2', label: '🚪 Door #2 (Recommended)', value: 'door2', regretMultiplier: 1.4 },
      { id: 'door-3', label: '🚪 Door #3 (Probably Cursed)', value: 'door3', regretMultiplier: 1.1 },
    ],
    penaltyHooks: ['suspicion'],
    eventHooks: ['before-validate'],
    helpText: 'All doors are emotionally equivalent.',
    disclaimer: 'Door outcomes are final and mostly symbolic.',
  },
  {
    id: 'unsafe-button',
    questionNumber: 2,
    phase: 1,
    difficultyWeight: 1.1,
    title: 'Choose a Button That Feels Unsafe',
    subtitle: 'Trust your instincts. They are historically unreliable.',
    type: 'button',
    options: [
      { id: 'btn-red', label: '🔴 DO NOT PRESS', value: 'red', regretMultiplier: 2.0 },
      { id: 'btn-green', label: '🟢 Press Me Maybe', value: 'green', regretMultiplier: 1.3 },
      { id: 'btn-blue', label: '🔵 Definitely Normal', value: 'blue', regretMultiplier: 1.1 },
      { id: 'btn-yellow', label: '🟡 Prize Adjacent', value: 'yellow', regretMultiplier: 1.8 },
      { id: 'btn-purple', label: '🟣 Undefined Behavior', value: 'purple', regretMultiplier: 1.6 },
    ],
    penaltyHooks: ['strike'],
    eventHooks: ['after-validate'],
    helpText: 'The labels are legal fiction.',
    disclaimer: 'Button compliance not guaranteed across browsers or centuries.',
  },
  {
    id: 'hated-sound',
    questionNumber: 3,
    phase: 1,
    difficultyWeight: 1.15,
    title: 'Select a Sound You Hate',
    subtitle: 'We promise not to play it. We promise many things.',
    type: 'sound',
    options: [
      { id: 'sound-nails', label: '💅 Nails on chalkboard', value: 'nails', regretMultiplier: 1.4 },
      { id: 'sound-alarm', label: '🔔 3AM alarm clock', value: 'alarm', regretMultiplier: 1.2 },
      { id: 'sound-chew', label: '👄 Loud chewing', value: 'chew', regretMultiplier: 1.3 },
      { id: 'sound-baby', label: '👶 Crying baby on airplane', value: 'baby', regretMultiplier: 1.5 },
      { id: 'sound-dialup', label: '📞 Dial-up modem', value: 'dialup', regretMultiplier: 1.1 },
      { id: 'sound-voice', label: '📢 "Your call is important to us"', value: 'voice', regretMultiplier: 1.6 },
    ],
    penaltyHooks: ['instability'],
    eventHooks: ['before-transition'],
    helpText: 'Remember this answer. We will absolutely use it against you later.',
  },
  {
    id: 'confidence-slider',
    questionNumber: 4,
    phase: 1,
    difficultyWeight: 1.2,
    title: 'Rate Your Confidence',
    subtitle: 'Move the slider to indicate confidence in your current suffering.',
    type: 'slider',
    penaltyHooks: ['instability'],
    eventHooks: ['after-validate'],
    helpText: 'This slider has trust issues and occasional teleportation.',
    disclaimer: 'Confidence expires without notice.',
  },
  {
    id: 'contradiction-matrix',
    questionNumber: 5,
    phase: 2,
    difficultyWeight: 1.4,
    title: 'Contradiction Matrix',
    subtitle: 'Select at least 2 statements that cannot both be true.',
    type: 'matrix',
    options: [
      { id: 'cm-1', label: 'I always click carefully.', value: 'careful', regretMultiplier: 1.1 },
      { id: 'cm-2', label: 'I clicked every flashing thing today.', value: 'flash', regretMultiplier: 1.6 },
      { id: 'cm-3', label: 'I trust this interface completely.', value: 'trust', regretMultiplier: 1.5 },
      { id: 'cm-4', label: 'I have no trust left.', value: 'none', regretMultiplier: 1.5 },
    ],
    validation: {
      required: true,
      minSelections: 2,
      customMessage: 'Pick at least two contradictions. Reality is optional here.',
    },
    penaltyHooks: ['strike', 'lockout'],
    eventHooks: ['before-validate', 'after-validate'],
    helpText: 'You are being graded for internal inconsistency.',
    disclaimer: 'Contradictions are archived permanently.',
  },
  {
    id: 'memory-trap',
    questionNumber: 6,
    phase: 2,
    difficultyWeight: 1.45,
    title: 'Memory Trap',
    subtitle: 'Type the exact sound code you selected in Step 3.',
    type: 'memory',
    placeholder: 'Examples: nails, alarm, chew...',
    validation: {
      required: true,
      minLength: 3,
      maxLength: 20,
      customMessage: 'Memory retrieval failed. Try remembering harder.',
    },
    penaltyHooks: ['regress', 'suspicion'],
    eventHooks: ['before-validate'],
    helpText: 'The answer is one word from your earlier suffering.',
    disclaimer: 'Forgetting is treated as non-compliance.',
  },
  {
    id: 'color-wrong',
    questionNumber: 7,
    phase: 2,
    difficultyWeight: 1.5,
    title: 'Pick a Color',
    subtitle: 'Labels are wrong. The consequences are real.',
    type: 'color',
    options: [
      { id: 'color-1', label: '🔴 Red (actually Blue)', value: 'blue', regretMultiplier: 1.1 },
      { id: 'color-2', label: '🔵 Blue (actually Green)', value: 'green', regretMultiplier: 1.2 },
      { id: 'color-3', label: '🟢 Green (actually Red)', value: 'red', regretMultiplier: 1.3 },
      { id: 'color-4', label: '🟡 Yellow (actually yellow)', value: 'yellow', regretMultiplier: 0.9 },
      { id: 'color-5', label: '🟣 Purple (trust issue)', value: 'purple', regretMultiplier: 1.4 },
    ],
    penaltyHooks: ['strike'],
    eventHooks: ['after-validate'],
    helpText: 'Do not trust labels. Do not trust us. Do not trust yourself.',
  },
  {
    id: 'fate-choice',
    questionNumber: 8,
    phase: 2,
    difficultyWeight: 1.55,
    title: 'Choose Your Fate',
    subtitle: 'All paths converge. The humiliation differs.',
    type: 'radio',
    options: [
      { id: 'fate-1', label: 'Accept your destiny', value: 'accept', regretMultiplier: 1.0 },
      { id: 'fate-2', label: 'Deny your destiny', value: 'deny', regretMultiplier: 1.3 },
      { id: 'fate-3', label: 'Negotiate with destiny', value: 'negotiate', regretMultiplier: 1.5 },
      { id: 'fate-4', label: 'Pretend this is fine', value: 'pretend', regretMultiplier: 1.2 },
      { id: 'fate-5', label: 'Random selection strategy', value: 'random', regretMultiplier: 1.1 },
    ],
    penaltyHooks: ['instability', 'suspicion'],
    eventHooks: ['before-transition'],
    helpText: 'Destiny has already left this meeting.',
    disclaimer: 'No refunds on fate.',
  },
  {
    id: 'useless-data',
    questionNumber: 9,
    phase: 3,
    difficultyWeight: 1.8,
    title: 'Enter Useless Data',
    subtitle: 'We need information with no practical function.',
    type: 'input',
    placeholder: 'Your name (normal names may be rejected)',
    validation: {
      required: true,
      minLength: 2,
      maxLength: 50,
      customMessage: 'Your name is too normal. Please enter a more interesting name.',
    },
    penaltyHooks: ['input-corrupt', 'strike'],
    eventHooks: ['before-validate', 'after-validate'],
    helpText: 'Normality is a validation error.',
    disclaimer: 'Entered names may be judged by fictional interns.',
  },
  {
    id: 'timelock-confirm',
    questionNumber: 10,
    phase: 3,
    difficultyWeight: 1.95,
    title: 'Time-Lock Confirmation',
    subtitle: 'Submit only when the gate is OPEN. It closes quickly.',
    type: 'timelock',
    options: [
      { id: 'tl-1', label: 'Proceed now', value: 'proceed', regretMultiplier: 1.4 },
      { id: 'tl-2', label: 'Wait patiently', value: 'wait', regretMultiplier: 1.1 },
      { id: 'tl-3', label: 'Spam button aggressively', value: 'spam', regretMultiplier: 1.9 },
    ],
    validation: {
      required: true,
    },
    penaltyHooks: ['lockout', 'freeze'],
    eventHooks: ['before-validate', 'before-transition'],
    helpText: 'Green light means OPEN. Red light means regret.',
    disclaimer: 'Timing windows are intentionally unreasonable.',
  },
  {
    id: 'integrity-check',
    questionNumber: 11,
    phase: 3,
    difficultyWeight: 2.1,
    title: 'Final Integrity Check',
    subtitle: 'Provide checksum, PIN, and oath. All fields are spiritually required.',
    type: 'integrity',
    validation: {
      required: true,
      minLength: 3,
    },
    penaltyHooks: ['strike', 'regress', 'suspicion'],
    eventHooks: ['before-validate', 'after-validate'],
    helpText: 'Checksum requires at least one number. PIN hint appears in the card.',
    disclaimer: 'Integrity is verified by unreadable logic.',
  },
  {
    id: 'final-confirm',
    questionNumber: 12,
    phase: 3,
    difficultyWeight: 2.25,
    title: 'Final Confirmation',
    subtitle: 'Are you sure? We can keep asking if you want.',
    type: 'confirm',
    options: [
      { id: 'confirm-yes', label: 'Yes, I am sure', value: 'yes', regretMultiplier: 1.0 },
      { id: 'confirm-no', label: 'No, take me back', value: 'no', regretMultiplier: 1.6 },
      { id: 'confirm-maybe', label: 'Maybe (high-risk)', value: 'maybe', regretMultiplier: 2.0 },
      { id: 'confirm-help', label: 'Help (not available)', value: 'help', regretMultiplier: 1.8 },
    ],
    validation: {
      required: true,
    },
    penaltyHooks: ['lockout', 'regress', 'freeze'],
    eventHooks: ['before-validate', 'before-transition'],
    helpText: 'Final means "almost final".',
    disclaimer: 'Confirmation is binding in all known and unknown jurisdictions.',
  },
];

export function getQuestionById(id: string): TourQuestion | undefined {
  return tourQuestions.find(q => q.id === id);
}

export function getQuestionByNumber(num: number): TourQuestion | undefined {
  return tourQuestions.find(q => q.questionNumber === num);
}

export const totalQuestions = tourQuestions.length;
