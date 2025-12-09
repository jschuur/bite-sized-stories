import { storyRequirements } from '@/config';

export type StoryRequirementOptions = {
  count: number;
  options: (string | number)[];
  template: string;
  label?: string;
};

export type StoryRequirementType = keyof typeof storyRequirements;
export type StoryRequirements = Record<StoryRequirementType, StoryRequirementOptions>;

// Usage tracking types
export type StoryUsage = {
  characters: number;
  tokens: number;
  requests: number;
  timestamp: number;
};

export type DailyUsage = {
  date: string; // YYYY-MM-DD format
  characters: number;
  tokens: number;
  requests: number;
};

export type SessionUsage = {
  characters: number;
  tokens: number;
  requests: number;
};

export type UsageStats = {
  currentStory: StoryUsage | null;
  session: SessionUsage;
  dailyHistory: DailyUsage[];
  totalAllTime: {
    characters: number;
    tokens: number;
    requests: number;
  };
};
