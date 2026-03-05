import type { SortingState } from '@tanstack/react-table';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const defaultSorting: SortingState = [{ id: 'updatedAt', desc: true }];

type AdminTablePreferencesState = {
  languagesSorting: SortingState;
  storyRequirementsSorting: SortingState;
  topicIdeasSorting: SortingState;
  setLanguagesSorting: (sorting: SortingState) => void;
  setStoryRequirementsSorting: (sorting: SortingState) => void;
  setTopicIdeasSorting: (sorting: SortingState) => void;
};

export const useAdminPreferences = create<AdminTablePreferencesState>()(
  persist(
    (set) => ({
      languagesSorting: defaultSorting,
      storyRequirementsSorting: defaultSorting,
      topicIdeasSorting: defaultSorting,
      setLanguagesSorting: (sorting) => set({ languagesSorting: sorting }),
      setStoryRequirementsSorting: (sorting) => set({ storyRequirementsSorting: sorting }),
      setTopicIdeasSorting: (sorting) => set({ topicIdeasSorting: sorting }),
    }),
    {
      name: 'bite-sized-admin-preferences',
      partialize: (state) => ({
        languagesSorting: state.languagesSorting,
        storyRequirementsSorting: state.storyRequirementsSorting,
        topicIdeasSorting: state.topicIdeasSorting,
      }),
    },
  ),
);
