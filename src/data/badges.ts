// Certificate badges for tour completion

export interface Badge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

export const badges: Badge[] = [
  {
    id: 'overclicker',
    title: 'Certified Overclicker',
    description: 'Clicked buttons with enthusiasm bordering on concern',
    emoji: '🖱️',
    rarity: 'common',
  },
  {
    id: 'survivor',
    title: 'Wizard Completion Survivor',
    description: 'Survived the tour with most of their sanity intact',
    emoji: '🏆',
    rarity: 'common',
  },
  {
    id: 'misalignment',
    title: 'Patron Saint of Misalignment',
    description: 'Navigated chaos with grace and questionable judgment',
    emoji: '📐',
    rarity: 'uncommon',
  },
  {
    id: 'doctor',
    title: 'Doctor of Questionable Choices',
    description: 'PhD in Making Decisions That Raise Eyebrows',
    emoji: '🎓',
    rarity: 'uncommon',
  },
  {
    id: 'font-criminal',
    title: 'Master of Font Crimes',
    description: 'Witnessed typography atrocities and kept scrolling',
    emoji: '🔤',
    rarity: 'rare',
  },
  {
    id: 'color-criminal',
    title: 'Color Coordination Criminal',
    description: 'Survived the neon assault on their retinas',
    emoji: '🎨',
    rarity: 'rare',
  },
  {
    id: 'form-warrior',
    title: 'Form Field Warrior',
    description: 'Battled hostile validation and emerged victorious',
    emoji: '⚔️',
    rarity: 'rare',
  },
  {
    id: 'regret-master',
    title: 'Grand Master of Regret',
    description: 'Achieved maximum regret. Is this a win?',
    emoji: '😢',
    rarity: 'legendary',
  },
  {
    id: 'chaos-champion',
    title: 'Chaos Champion',
    description: 'The chaos fears you now. You have become the chaos.',
    emoji: '🌀',
    rarity: 'legendary',
  },
  {
    id: 'enlightened',
    title: 'The Enlightened One',
    description: 'Achieved enlightenment through poor user experience',
    emoji: '🧘',
    rarity: 'legendary',
  },
];

export function getRandomBadge(): Badge {
  // Weight by rarity
  const weights = {
    common: 50,
    uncommon: 30,
    rare: 15,
    legendary: 5,
  };
  
  const totalWeight = badges.reduce((sum, badge) => sum + weights[badge.rarity], 0);
  let random = Math.random() * totalWeight;
  
  for (const badge of badges) {
    random -= weights[badge.rarity];
    if (random <= 0) {
      return badge;
    }
  }
  
  return badges[0]; // Fallback
}

export function getBadgeById(id: string): Badge | undefined {
  return badges.find(b => b.id === id);
}

export function getBadgeByScore(score: number): Badge {
  if (score >= 9000) {
    return badges.find(b => b.id === 'enlightened') || badges[0];
  } else if (score >= 7000) {
    return badges.find(b => b.id === 'chaos-champion') || badges[0];
  } else if (score >= 5000) {
    return badges.find(b => b.id === 'regret-master') || badges[0];
  } else if (score >= 3000) {
    const rareBadges = badges.filter(b => b.rarity === 'rare');
    return rareBadges[Math.floor(Math.random() * rareBadges.length)];
  } else if (score >= 1500) {
    const uncommonBadges = badges.filter(b => b.rarity === 'uncommon');
    return uncommonBadges[Math.floor(Math.random() * uncommonBadges.length)];
  } else {
    const commonBadges = badges.filter(b => b.rarity === 'common');
    return commonBadges[Math.floor(Math.random() * commonBadges.length)];
  }
}
