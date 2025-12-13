import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

import { createStory, updateStory } from '@/db/queries';
import { debug, extractStoryContent } from '@/lib/utils';

import { storyRequirementsConfig } from '@/config';
import { env } from '@/env';

import type {
  Story,
  StoryRequest,
  StoryRequirementOptions,
  StoryRequirements,
  StoryRequirementType,
  StoryRequirementValue,
} from '@/types';

type BuildStoryRequirementResponse = {
  requirement: StoryRequirementValue;
  formattedRequirement: string;
};
function buildStoryRequirement(config: StoryRequirementOptions): BuildStoryRequirementResponse {
  let requirement: StoryRequirementValue;

  if (config.options.length === 0) throw new Error('No options available in configuration');

  if (config.count === 1) {
    const randomIndex = Math.floor(Math.random() * config.options.length);

    requirement = [config.options[randomIndex]];
  } else {
    const shuffled = [...config.options].sort(() => Math.random() - 0.5);

    requirement = shuffled.slice(0, Math.min(config.count, config.options.length));
  }

  const formattedRequirement = renderTemplate(config.template, requirement);

  return { requirement, formattedRequirement };
}

function renderTemplate(template: string, requirement: StoryRequirementValue): string {
  const displayValue =
    requirement && requirement.length > 1 ? requirement.join(', ') : String(requirement[0]);
  const formatted = template.replace('{value}', displayValue);

  const count = typeof requirement[0] === 'number' ? requirement[0] : requirement.length;

  return count > 1 ? formatted.replace('{plural}', 's') : formatted.replace('{plural}', '');
}

export type BuiltPromptParams = {
  targetLanguage: string;
  storyLength: number;
  difficultyLevel: string;
  topic: string;
  includeVocabulary: boolean;
  includeGrammarTips: boolean;
};

export function buildPrompt({
  targetLanguage,
  storyLength,
  difficultyLevel,
  topic,
  includeVocabulary,
  includeGrammarTips,
}: BuiltPromptParams) {
  const storyRequirements: StoryRequirements = {} as StoryRequirements;
  const storyRequirementsList: string[] = [];

  for (const [key, config] of Object.entries(storyRequirementsConfig)) {
    const { requirement, formattedRequirement } = buildStoryRequirement(config);

    storyRequirements[key as StoryRequirementType] = requirement;
    storyRequirementsList.push(formattedRequirement);
  }

  const prompt = `Generate a short story in ${targetLanguage} for language learners.

Please create an engaging story that meets the following requirements:

1. Uses vocabulary and grammar appropriate for ${difficultyLevel} CEFR level learners
2. Is approximately ${storyLength} words long
3. Relates to the topic: ${topic}
4. Is written entirely in ${targetLanguage}
5. Has a clear narrative structure with beginning, middle, and end. Do not add headings for the narrative structure sections.
${storyRequirementsList.map((req, index) => `${index + 6}. ${req}`).join('\n')}

Give the story a title. Put the title at the beginning of the story as a heading.

${
  includeVocabulary
    ? 'Include a vocabulary section at the end with a clear heading and a line break in markdown.'
    : ''
}
${
  includeGrammarTips
    ? 'Include a summary of key grammar points in English at the end with a clear heading and a line break in markdown.'
    : ''
}`;

  debug(prompt);

  return { prompt, storyRequirements };
}

export async function generateStoryStreaming(storyRequest: StoryRequest) {
  let story: Story | null = null;
  let storyId: string | null = null;

  const { prompt, storyRequirements } = buildPrompt(storyRequest);

  try {
    // Create story entry with status 'pending'
    story = await createStory({
      language: storyRequest.targetLanguage,
      topic: storyRequest.topic,
      difficultyLevel: storyRequest.difficultyLevel,
      storyRequirements,
      prompt,
    });

    storyId = story.id;
  } catch (error) {
    console.warn('Error creating story:', error);
  }

  const result = streamText({
    model: anthropic(env.ANTHROPIC_MODEL),
    prompt,
    onFinish: async ({ text }) => {
      try {
        if (storyId) {
          const { title, story } = extractStoryContent(text);
          await updateStory({
            id: storyId,
            title,
            story,
            status: 'completed',
          });
        }
      } catch (error) {
        console.warn('Error updating story:', error);
      }
    },
  });

  return result;
}
