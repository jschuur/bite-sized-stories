import { useQuery } from '@tanstack/react-query';

import type { Language, StoryRequirementCategory, TopicIdea } from '@/db/queries/settings';

type ConfigResponse = {
  languages: Language[];
  topicIdeas: TopicIdea[];
  storyRequirements: StoryRequirementCategory[];
};

export function useConfig(includeInactive = false) {
  return useQuery<ConfigResponse>({
    queryKey: ['config', { includeInactive }],
    queryFn: async () => {
      const url = includeInactive ? '/api/config?includeInactive=true' : '/api/config';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch config');

      return res.json();
    },
    staleTime: 10 * 60 * 1000,
  });
}
