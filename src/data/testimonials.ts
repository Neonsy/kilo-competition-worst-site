// Fake testimonials for the home page

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar: string;
  text: string;
  rating: number;
  date: string;
}

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Definitely A Real Person',
    location: 'Some Place, Country',
    avatar: '👤',
    text: 'I came for the exhibits and stayed because I couldn\'t find the exit. 5 stars!',
    rating: 5,
    date: '02/03/2026',
  },
  {
    id: '2',
    name: 'Satisfied Customer #4729',
    location: 'Your Area, Probably',
    avatar: '🧑',
    text: 'The tour changed my life. I now make worse decisions than ever. Thank you!',
    rating: 4,
    date: '3 Feb 2026',
  },
  {
    id: '3',
    name: 'Webmaster2000',
    location: 'The Internet',
    avatar: '👨‍💻',
    text: 'This site reminds me of my GeoCities page from 1999. I\'m both honored and horrified.',
    rating: 5,
    date: '2026-01-15',
  },
  {
    id: '4',
    name: 'Anonymous Visitor',
    location: 'Nowhere Special',
    avatar: '🎭',
    text: 'I\'ve been to many museums, but this is the only one that made me question my choices.',
    rating: 3,
    date: '12/25/2025',
  },
  {
    id: '5',
    name: 'Certified Regret Expert',
    location: 'Regretville, RS',
    avatar: '🧐',
    text: 'As someone with a PhD in Bad Decisions, I can confirm this museum is accurate.',
    rating: 5,
    date: '01 Jan 2026',
  },
  {
    id: '6',
    name: 'Lost Tourist',
    location: 'Still Here',
    avatar: '🚶',
    text: 'I started the tour 3 hours ago. Send help. The progress bar says 97%.',
    rating: 2,
    date: '11 Nov 2025',
  },
  {
    id: '7',
    name: 'UI Designer (Crying)',
    location: 'San Francisco, CA',
    avatar: '😭',
    text: 'I\'m filing this as a hate crime against design principles. Also, where do I buy tickets?',
    rating: 4,
    date: '14 Feb 2026',
  },
  {
    id: '8',
    name: 'Time Traveler',
    location: 'Year 2087',
    avatar: '🔮',
    text: 'In the future, this museum is considered high art. You\'re all ahead of your time.',
    rating: 5,
    date: '29 Feb 2024',
  },
];

export function getRandomTestimonials(count: number): Testimonial[] {
  const shuffled = [...testimonials].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getTestimonialById(id: string): Testimonial | undefined {
  return testimonials.find(t => t.id === id);
}
