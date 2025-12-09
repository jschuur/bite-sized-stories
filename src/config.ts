import type { StoryRequirementOptions } from '@/types';

export const difficultyLevels: Record<string, string> = {
  A1: 'A1 (beginners)',
  A2: 'A2 (pre-intermediate)',
  B1: 'B1 (intermediate)',
  B2: 'B2 (upper-intermediate)',
  C1: 'C1 (advanced)',
  C2: 'C2 (proficiency)',
};
export const defaultDifficultyLevel = 'B1';

export const languages = [
  'German',
  'Dutch',
  'French',
  'Spanish',
  'English',
  'Italian',
  'Portuguese',
  'Chinese',
  'Ukrainian',
  'Polish',
];
export const defaultTargetLanguage = 'Dutch';

export const defaultStoryLength = 300;
export const defaultStoryLengthMin = 50;
export const defaultStoryLengthMax = 1000;

export const topicIdeas = [
  'A story about a journey to a new country',
  'An unexpected encounter at a local market',
  'A day in the life of a street musician',
  'A mysterious package arrives at the wrong address',
  'Two strangers meet on a train and share their stories',
  'A chef discovers a forgotten family recipe',
  'Someone finds an old photograph in a second-hand book',
  'A letter written decades ago is finally delivered',
  'A person learns a new skill that changes their perspective',
  'A scientist uses their knowledge to solve a big problem to save the world',
  'An ordinary day turns extraordinary due to a small coincidence',
  'A neighbour helps solve a puzzling problem',
  'Someone revisits their childhood hometown after many years',
  'An explorer finds beauty and wonder in the strangest place',
  'A lost pet brings together an unlikely friendship',
  'A café regular notices something unusual one morning',
  'An aspiring artist finds inspiration in an unexpected place',
  'A family tradition is questioned by the younger generation',
  'Someone discovers a hidden talent during a crisis',
  'A technological mishap leads to a fortunate discovery',
  'Two people bond over their shared love of books',
  'A gardener witnesses the changing seasons and reflects on life',
  'A musician finds inspiration in a new instrument',
  'A scientist discovers a new theory that changes their understanding of the world',
  'A chef discovers a new ingredient that changes their cooking style',
  'A person discovers a new way to use technology to improve their life',
  'A politician changes their attitude to life and makes a big difference in their community',
  'A soldier must think fast and make a difficult decision',
  'A student must overcome a fear to achieve their goal',
  'An office worker rises to the occasion and saves the day and improves their career',
  'A parent at home emerges from darkness and does what is right for their family',
  'An artist plots how to use his craft to change society',
  'A child in school imagines their future',
  'A super hero wonders if they are a hero or a villain',
  'Someone is lost, but finds their way back home',
  'A parent finds unusual ways to connect with their child',
  'An old person finds a new purpose in life',
  'A machine suddenly comes to life and starts to think',
  'Life emerges from an unusual source',
  "Someone's death changes the lives of those around them",
  'A philosopher comes to a surprising conclusion about the origin and purpose of life',
  'A priest discovers a new way to connect with their faith',
  'A marriage has a bigger impact than expected',
  'Kids left alone for the first time grow up faster than expected',
  'Young love is both complicated and beautiful',
  'A city rises, falls and rises again',
  "Music is the key to a person's heart",
  'Things happen in a museum after hours',
  'A movie star has a normal life',
  'A worker hones their skills',
  'A villain contemplates the endgame',
  'Nature finds a way',
  'Evil finds a way',
  'Good finds a way',
  'Love finds a way',
  'Hope finds a way',
  'Faith finds a way',
  'Science goes wrong. Or does it?',
  'War suddenly ends',
  'Progress is halted',
  'The solution was there all along',
  'Life on other planets',
  'Spirits exist and are just like us',
];

export const getRandomTopic = (oldTopic?: string) => {
  let newTopic: string;

  do {
    newTopic = topicIdeas[Math.floor(Math.random() * topicIdeas.length)];
  } while (oldTopic && newTopic === oldTopic);

  return newTopic;
};

export const storyRequirements = {
  tones: {
    count: 3,
    options: [
      'excitement',
      'anger',
      'joy',
      'pride',
      'earnestness',
      'dedication',
      'desperation',
      'sadness',
      'fear',
      'hope',
      'nostalgia',
      'curiosity',
      'melancholy',
      'wonder',
      'anxiety',
      'serenity',
      'anticipation',
      'tension',
      'relief',
      'confusion',
      'determination',
      'loneliness',
      'contentment',
      'regret',
      'euphoria',
      'suspense',
      'gratitude',
    ],
    template: 'Use these tones: {value}',
    label: 'Tones to incorporate',
  },
  type: {
    count: 1,
    options: [
      'Comedy',
      'Drama',
      'Thriller',
      'Horror',
      'Romance',
      'Science Fiction',
      'Fantasy',
      'Historical',
      'Biography',
      'Essay',
      'News Article',
      'Travel Guide',
      'Travel Diary',
    ],
    template: 'Is written in the {value} genre/style',
    label: 'Story Type',
  },
  characterCount: {
    count: 1,
    options: [1, 2, 3],
    template: 'Features {value} main character{plural}',
    label: 'Number of Main Characters',
  },
  conflictType: {
    count: 1,
    options: ['internal', 'external', 'person vs nature', 'person vs society', 'person vs person'],
    template: 'Centers around {value} conflict',
    label: 'Conflict Type',
  },
  endingStyle: {
    count: 1,
    options: ['happy', 'open-ended', 'twist ending', 'bittersweet', 'tragic'],
    template: 'Has a {value} ending',
    label: 'Ending Style',
  },
  focus: {
    count: 1,
    options: ['character-driven', 'plot-driven', 'atmosphere-driven'],
    template: 'Is {value} in its approach',
    label: 'Focus',
  },
  pacing: {
    count: 1,
    options: ['fast-paced', 'slow-paced', 'varied pacing'],
    template: 'Has {value} pacing',
    label: 'Pacing',
  },
  dialogueRatio: {
    count: 1,
    options: ['dialogue-heavy', 'narrative-heavy', 'balanced'],
    template: 'Uses a {value} balance between dialogue and narration',
    label: 'Dialogue Ratio',
  },
  perspective: {
    count: 1,
    options: ['first-person', 'third-person'],
    template: 'Is written from the {value} perspective',
    label: 'Perspective',
  },
} as const satisfies Record<string, StoryRequirementOptions>;

export const defaultAnthropicModel = 'claude-sonnet-4-5-20250929';
export const defaultAnthropicUsageUrl = 'https://platform.claude.com/usage';
