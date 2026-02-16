// Tour Wizard Questions - Hostile and Confusing

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
  regretMultiplier: number;
  leadsTo?: string;
}

export interface TourQuestion {
  id: string;
  questionNumber: number;
  title: string;
  subtitle: string;
  type: 'door' | 'button' | 'sound' | 'slider' | 'color' | 'radio' | 'input' | 'confirm';
  options?: QuestionOption[];
  placeholder?: string;
  validation?: {
    required: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    customMessage?: string;
  };
  helpText: string;
  disclaimer?: string;
}

export const tourQuestions: TourQuestion[] = [
  {
    id: 'door-choice',
    questionNumber: 1,
    title: 'Pick a Door',
    subtitle: 'Choose wisely. Or don\'t. The doors don\'t actually lead anywhere different.',
    type: 'door',
    options: [
      {
        id: 'door-1',
        label: '🚪 Door #1',
        value: 'door1',
        regretMultiplier: 1.2,
      },
      {
        id: 'door-2',
        label: '🚪 Door #2 (Recommended)',
        value: 'door2',
        regretMultiplier: 1.5,
      },
      {
        id: 'door-3',
        label: '🚪 Door #3 (Not Recommended)',
        value: 'door3',
        regretMultiplier: 0.8,
      },
    ],
    helpText: 'Fun fact: All doors lead to the same place. We just wanted to give you the illusion of choice.',
    disclaimer: 'By selecting a door, you agree that we are not responsible for what\'s behind it.',
  },
  {
    id: 'unsafe-button',
    questionNumber: 2,
    title: 'Choose a Button That Feels Unsafe',
    subtitle: 'Each button looks suspicious. Trust your instincts. Your instincts are wrong.',
    type: 'button',
    options: [
      {
        id: 'btn-red',
        label: '🔴 DO NOT PRESS',
        value: 'red',
        regretMultiplier: 2.0,
      },
      {
        id: 'btn-green',
        label: '🟢 Press Me Maybe',
        value: 'green',
        regretMultiplier: 1.3,
      },
      {
        id: 'btn-blue',
        label: '🔵 I\'m Just a Button',
        value: 'blue',
        regretMultiplier: 1.1,
      },
      {
        id: 'btn-yellow',
        label: '🟡 Click for Prize*',
        value: 'yellow',
        regretMultiplier: 1.8,
      },
      {
        id: 'btn-purple',
        label: '🟣 Undefined Behavior',
        value: 'purple',
        regretMultiplier: 1.6,
      },
    ],
    helpText: '*Prize may include: disappointment, more buttons, or a mild sense of accomplishment.',
    disclaimer: 'Button functionality not guaranteed. Buttons may or may not be buttons.',
  },
  {
    id: 'hated-sound',
    questionNumber: 3,
    title: 'Select a Sound You Hate',
    subtitle: 'Don\'t worry, we won\'t play any sounds. We\'re not monsters. Just select one.',
    type: 'sound',
    options: [
      {
        id: 'sound-nails',
        label: '💅 Nails on chalkboard',
        value: 'nails',
        regretMultiplier: 1.4,
      },
      {
        id: 'sound-alarm',
        label: '🔔 3AM alarm clock',
        value: 'alarm',
        regretMultiplier: 1.2,
      },
      {
        id: 'sound-chew',
        label: '👄 Loud chewing',
        value: 'chew',
        regretMultiplier: 1.3,
      },
      {
        id: 'sound-baby',
        label: '👶 Crying baby on airplane',
        value: 'baby',
        regretMultiplier: 1.5,
      },
      {
        id: 'sound-dialup',
        label: '📞 Dial-up modem',
        value: 'dialup',
        regretMultiplier: 1.1,
      },
      {
        id: 'sound-voice',
        label: '📢 "Your call is important to us"',
        value: 'voice',
        regretMultiplier: 1.6,
      },
    ],
    helpText: 'We\'ve collected these sounds for scientific purposes. Your selection will be used to calculate your Annoyance Tolerance Index™.',
  },
  {
    id: 'confidence-slider',
    questionNumber: 4,
    title: 'Rate Your Confidence',
    subtitle: 'Move the slider to indicate how confident you feel about... something.',
    type: 'slider',
    helpText: 'The slider may or may not reflect your actual input. It has feelings too.',
    disclaimer: 'Confidence ratings are non-transferable and expire after 30 minutes.',
  },
  {
    id: 'color-wrong',
    questionNumber: 5,
    title: 'Pick a Color',
    subtitle: 'The colors are labeled incorrectly. Choose based on the actual color, not the name.',
    type: 'color',
    options: [
      {
        id: 'color-1',
        label: '🔴 Red (actually Blue)',
        value: 'blue',
        regretMultiplier: 1.1,
      },
      {
        id: 'color-2',
        label: '🔵 Blue (actually Green)',
        value: 'green',
        regretMultiplier: 1.2,
      },
      {
        id: 'color-3',
        label: '🟢 Green (actually Red)',
        value: 'red',
        regretMultiplier: 1.3,
      },
      {
        id: 'color-4',
        label: '🟡 Yellow (it\'s actually yellow)',
        value: 'yellow',
        regretMultiplier: 0.9,
      },
      {
        id: 'color-5',
        label: '🟣 Purple (trust issue)',
        value: 'purple',
        regretMultiplier: 1.4,
      },
    ],
    helpText: 'This question tests your ability to trust labels. Spoiler: don\'t.',
  },
  {
    id: 'fate-choice',
    questionNumber: 6,
    title: 'Choose Your Fate',
    subtitle: 'All options lead to the same outcome, but the journey varies slightly.',
    type: 'radio',
    options: [
      {
        id: 'fate-1',
        label: 'Accept your destiny',
        value: 'accept',
        regretMultiplier: 1.0,
      },
      {
        id: 'fate-2',
        label: 'Deny your destiny (it still happens)',
        value: 'deny',
        regretMultiplier: 1.3,
      },
      {
        id: 'fate-3',
        label: 'Negotiate with destiny (destiny doesn\'t negotiate)',
        value: 'negotiate',
        regretMultiplier: 1.5,
      },
      {
        id: 'fate-4',
        label: 'Pretend this isn\'t happening',
        value: 'pretend',
        regretMultiplier: 1.2,
      },
      {
        id: 'fate-5',
        label: 'Choose this option for no reason',
        value: 'random',
        regretMultiplier: 1.1,
      },
    ],
    helpText: 'Your fate was determined before you were born. This question is just for engagement metrics.',
    disclaimer: 'Fate selection is final. No exchanges or refunds.',
  },
  {
    id: 'useless-data',
    questionNumber: 7,
    title: 'Enter Useless Data',
    subtitle: 'We need information that serves no purpose whatsoever.',
    type: 'input',
    placeholder: 'Your name (too normal names will be rejected)',
    validation: {
      required: true,
      minLength: 2,
      maxLength: 50,
      customMessage: 'Your name is too normal. Please enter a more interesting name.',
    },
    helpText: 'This data will be stored in our "Useless Information Database" and never looked at again.',
    disclaimer: 'By entering your name, you agree that it may be used in future exhibits of bad decisions.',
  },
  {
    id: 'final-confirm',
    questionNumber: 8,
    title: 'Final Confirmation',
    subtitle: 'Are you sure? Are you sure you\'re sure? Are you sure you\'re sure you\'re sure?',
    type: 'confirm',
    options: [
      {
        id: 'confirm-yes',
        label: 'Yes, I\'m sure',
        value: 'yes',
        regretMultiplier: 1.0,
      },
      {
        id: 'confirm-no',
        label: 'No, take me back (doesn\'t work)',
        value: 'no',
        regretMultiplier: 1.5,
      },
      {
        id: 'confirm-maybe',
        label: 'Maybe (invalid choice)',
        value: 'maybe',
        regretMultiplier: 2.0,
      },
      {
        id: 'confirm-help',
        label: 'Help (not available)',
        value: 'help',
        regretMultiplier: 1.8,
      },
    ],
    helpText: 'This confirmation has no legal weight but makes you feel like you had agency in this process.',
    disclaimer: 'Confirmation is binding in all jurisdictions, including the ones that don\'t exist yet.',
  },
];

export function getQuestionById(id: string): TourQuestion | undefined {
  return tourQuestions.find(q => q.id === id);
}

export function getNextQuestion(currentId: string): TourQuestion | undefined {
  const currentIndex = tourQuestions.findIndex(q => q.id === currentId);
  // Sometimes we skip ahead or go back randomly
  const chaos = Math.random();
  if (chaos > 0.9) {
    // Skip ahead
    return tourQuestions[Math.min(currentIndex + 2, tourQuestions.length - 1)];
  } else if (chaos > 0.85) {
    // Go back
    return tourQuestions[Math.max(currentIndex - 1, 0)];
  }
  return tourQuestions[currentIndex + 1];
}

export function getQuestionByNumber(num: number): TourQuestion | undefined {
  return tourQuestions.find(q => q.questionNumber === num);
}

export const totalQuestions = tourQuestions.length;
