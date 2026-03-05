import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { env } from '@/env';

type StoryPreferencesState = {
  targetLanguage: string;
  storyLength: string;
  difficultyLevel: string;
  setTargetLanguage: (value: string) => void;
  setStoryLength: (value: string) => void;
  setDifficultyLevel: (value: string) => void;
};

export const useUserPreferences = create<StoryPreferencesState>()(
  persist(
    (set) => ({
      targetLanguage: env.NEXT_PUBLIC_DEFAULT_TARGET_LANGUAGE,
      storyLength: env.NEXT_PUBLIC_DEFAULT_STORY_LENGTH.toString(),
      difficultyLevel: env.NEXT_PUBLIC_DEFAULT_DIFFICULTY_LEVEL,
      setTargetLanguage: (value) => set({ targetLanguage: value }),
      setStoryLength: (value) => set({ storyLength: value }),
      setDifficultyLevel: (value) => set({ difficultyLevel: value }),
    }),
    {
      name: 'bite-sized-preferences',
      partialize: (state) => ({
        targetLanguage: state.targetLanguage,
        storyLength: state.storyLength,
        difficultyLevel: state.difficultyLevel,
      }),
    },
  ),
);
