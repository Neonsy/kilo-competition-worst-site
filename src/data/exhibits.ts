// Exhibit data for the Museum of Bad Decisions

export interface Exhibit {
  id: string;
  title: string;
  description: string;
  premium: boolean;
  regretValue: number;
  interactiveType: 'button' | 'slider' | 'checkbox' | 'dropdown' | 'input' | 'captcha' | 'modal' | 'scroll';
  interactiveLabel: string;
  learnMoreText: string;
  icon: string;
  rating: number;
  visitors: string;
  dateAdded: string;
  category: string;
}

export const exhibits: Exhibit[] = [
  {
    id: 'button-nothing',
    title: 'The Button That Does Nothing (Premium)',
    description: 'Click it. Click it again. Nothing happens. That\'s the point. Premium users get access to the button that does even less.',
    premium: true,
    regretValue: 500,
    interactiveType: 'button',
    interactiveLabel: 'Click Me (Nothing Will Happen)',
    learnMoreText: 'This button was designed by our team of 47 engineers over 3 years. It cost $2.3 million to develop. It does absolutely nothing. Studies show that users click it an average of 14.7 times before accepting their fate. The button has been clicked over 50 million times since opening. None of those clicks accomplished anything.',
    icon: '🔘',
    rating: 2,
    visitors: '1.2M',
    dateAdded: '03/15/2024',
    category: 'Buttons of Futility'
  },
  {
    id: 'infinite-scroll-sideways',
    title: 'Infinite Scroll But It\'s Sideways',
    description: 'Why scroll down when you can scroll... that way? Features over 10,000 panels of content you didn\'t ask for.',
    premium: false,
    regretValue: 750,
    interactiveType: 'scroll',
    interactiveLabel: 'Start Scrolling →',
    learnMoreText: 'WARNING: Users have reported getting stuck in the sideways scroll for up to 6 hours. There is no bottom. There is no top. There is only... sideways. Our legal team has advised us to mention that carpal tunnel syndrome is not covered in your visit waiver.',
    icon: '↔️',
    rating: 4,
    visitors: '890K',
    dateAdded: '15 Feb 2026',
    category: 'Directional Confusion'
  },
  {
    id: 'terms-musical',
    title: 'Terms & Conditions: The Musical',
    description: 'Experience the Terms of Service you never read, now as a 4-hour musical production with interpretive dance.',
    premium: false,
    regretValue: 1200,
    interactiveType: 'button',
    interactiveLabel: '▶️ Play Act I (of XII)',
    learnMoreText: 'Featuring such hit songs as "I Agree to the Following", "Binding Arbitration (Reprise)", and the showstopping "Section 14.2: Limitation of Liability". Our cast of 40 lawyers performs nightly. Standing ovations are mandatory per subsection C of your ticket agreement.',
    icon: '🎭',
    rating: 1,
    visitors: '45K',
    dateAdded: '01/01/2024',
    category: 'Legal Entertainment'
  },
  {
    id: 'captcha-regret',
    title: 'Captcha: Select All Images With Regret',
    description: 'Prove you\'re human by identifying which images contain the concept of regret. There are no correct answers.',
    premium: false,
    regretValue: 2000,
    interactiveType: 'captcha',
    interactiveLabel: 'I am not a robot (probably)',
    learnMoreText: 'This CAPTCHA has a 0.0001% pass rate. Those who pass report feeling empty inside. Our AI has determined that the ability to perceive regret in inanimate objects is the true measure of humanity. Good luck. You\'ll need it.',
    icon: '🤖',
    rating: 5,
    visitors: '2.1M',
    dateAdded: '2024-07-23',
    category: 'Identity Crisis'
  },
  {
    id: 'checkbox-unchecks',
    title: 'The Checkbox That Unchecks Itself',
    description: 'Check it. Watch it uncheck. Check it again. Watch it uncheck again. It knows. It always knows.',
    premium: false,
    regretValue: 800,
    interactiveType: 'checkbox',
    interactiveLabel: 'I accept that this checkbox will not accept me',
    learnMoreText: 'The checkbox was trained on 50,000 hours of user frustration. It has developed what our researchers call "malicious compliance." It technically works, just not for you specifically. The checkbox has never been successfully checked by anyone named "Steve."',
    icon: '☑️',
    rating: 3,
    visitors: '670K',
    dateAdded: '12/25/2023',
    category: 'Defiant UI Elements'
  },
  {
    id: 'progress-97',
    title: 'A Progress Bar That Only Goes to 97%',
    description: 'Watch in real-time as the progress bar approaches completion... and then stops. Forever. At 97%.',
    premium: false,
    regretValue: 1500,
    interactiveType: 'slider',
    interactiveLabel: 'Progress: 97%',
    learnMoreText: 'This exhibit represents the universal human experience of almost finishing something. The progress bar has been at 97% since 2019. It will never reach 100%. Some say that\'s the point. Others say it\'s a bug. We say it\'s art.',
    icon: '📊',
    rating: 4,
    visitors: '1.5M',
    dateAdded: '03/03/2024',
    category: 'Incomplete Experiences'
  },
  {
    id: 'password-hell',
    title: 'Password Strength Meter From Hell',
    description: 'Create a password. Any password. It will always be "Weak." Your password is never good enough for us.',
    premium: false,
    regretValue: 900,
    interactiveType: 'input',
    interactiveLabel: 'Enter password (will be judged)',
    learnMoreText: 'Requirements: 8-47 characters, at least 3 uppercase, 2 lowercase, 4 numbers, 2 symbols (but not &, $, or %), the name of your first pet, and a haiku about network security. Even if you meet all requirements, the meter will display "Weak" because we believe in keeping you humble.',
    icon: '🔐',
    rating: 2,
    visitors: '890K',
    dateAdded: '11 Nov 2025',
    category: 'Security Theater'
  },
  {
    id: 'modal-ception',
    title: 'Modal Within A Modal Within A Modal',
    description: 'Click to open a popup. Inside that popup: another popup. Inside that popup: you get the idea. Escape is not guaranteed.',
    premium: true,
    regretValue: 1800,
    interactiveType: 'modal',
    interactiveLabel: 'Open Modal (Warning: Modal)',
    learnMoreText: 'Current record for deepest modal depth: 47 levels. User was found 3 days later, dehydrated but spiritually enlightened. Emergency exits are available at modal levels 5, 12, and 23, but they lead to more modals. There is no bottom.',
    icon: '🪟',
    rating: 5,
    visitors: '340K',
    dateAdded: '09/09/2024',
    category: 'Recursive Nightmares'
  },
  {
    id: 'dropdown-500',
    title: 'The Dropdown With 500 Options',
    description: 'Choose your country. Choose your planet. Choose your destiny. All from one dropdown. Alphabetized incorrectly.',
    premium: false,
    regretValue: 600,
    interactiveType: 'dropdown',
    interactiveLabel: 'Select your fate...',
    learnMoreText: 'Options include: "United States", "United Statez", "Untied States", "United Stetes", and 496 others. The correct answer changes daily. No one has ever scrolled to the bottom. Legend says there\'s a prize down there. Legend is a liar.',
    icon: '📋',
    rating: 3,
    visitors: '445K',
    dateAdded: '29 Feb 2024',
    category: 'Choice Paralysis'
  },
  {
    id: 'autoplay-image',
    title: 'Autoplay Video You Can\'t Pause',
    description: 'It looks like a video. It has video controls. But it\'s just a static image. The play button is decorative.',
    premium: false,
    regretValue: 400,
    interactiveType: 'button',
    interactiveLabel: '▶ (does nothing)',
    learnMoreText: 'This exhibit is a commentary on our expectations of media. You expected a video. You got an image. The play button is a lie. The pause button is a lie. The volume slider is a lie. Everything is a lie. Except this text. This text is true. Probably.',
    icon: '🎬',
    rating: 2,
    visitors: '780K',
    dateAdded: '07/04/2024',
    category: 'Deceptive Media'
  },
  {
    id: 'form-breath',
    title: 'The Form That Submits When You Breathe',
    description: 'Fill out this form. But be careful. Breathe too hard and it submits. Breathe too soft and it submits. Exist and it submits.',
    premium: false,
    regretValue: 1100,
    interactiveType: 'input',
    interactiveLabel: 'Type quietly...',
    learnMoreText: 'This form uses advanced breath detection technology (a microphone we bought at a garage sale). Your breathing pattern is analyzed in real-time. Optimal breathing: 4 seconds in, 4 seconds out, but only on Tuesdays. The form has never been successfully completed.',
    icon: '📝',
    rating: 4,
    visitors: '230K',
    dateAdded: '14 Feb 2026',
    category: 'Involuntary Submission'
  },
  {
    id: 'tos-adventure',
    title: 'Terms of Service: Choose Your Own Adventure',
    description: 'Navigate through 500 pages of legal text. Each choice leads to more legal text. 47 possible endings, all bad.',
    premium: true,
    regretValue: 2500,
    interactiveType: 'button',
    interactiveLabel: 'I have read and agree (lie)',
    learnMoreText: 'If you choose to accept the terms, turn to page 47. If you choose to decline, turn to page 47. If you\'re unsure, turn to page 47. Page 47 contains more choices. All choices lead to page 47. This is legally binding in 47 jurisdictions.',
    icon: '📖',
    rating: 5,
    visitors: '89K',
    dateAdded: '2025-12-01',
    category: 'Legal Labyrinths'
  }
];

export const exhibitCategories = [
  'Buttons of Futility',
  'Directional Confusion',
  'Legal Entertainment',
  'Identity Crisis',
  'Defiant UI Elements',
  'Incomplete Experiences',
  'Security Theater',
  'Recursive Nightmares',
  'Choice Paralysis',
  'Deceptive Media',
  'Involuntary Submission',
  'Legal Labyrinths'
];

export function getRandomExhibits(count: number): Exhibit[] {
  const shuffled = [...exhibits].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getExhibitById(id: string): Exhibit | undefined {
  return exhibits.find(e => e.id === id);
}

export function calculateRegretScore(exhibitIds: string[]): number {
  const base = Math.floor(Math.random() * 2000) + 1000;
  const exhibitBonus = exhibitIds.reduce((acc, id) => {
    const exhibit = getExhibitById(id);
    return acc + (exhibit?.regretValue || 0);
  }, 0);
  const chaosMultiplier = Math.random() * 2 + 0.5;
  const shoeSizeFactor = Math.floor(Math.random() * 500);
  
  return Math.floor((base + exhibitBonus) * chaosMultiplier + shoeSizeFactor);
}
