'use client';

import { useCompletion } from '@ai-sdk/react';
import { useQueryClient } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';

import { StoryForm } from '@/components/Story/StoryForm';
import { StoryResponse } from '@/components/StoryResponse';

import {
  completeStoryAtom,
  resetSessionAtom,
  startStoryAtom,
  updateStoryUsageAtom,
} from '@/store/usage';

export default function NewStoryPage() {
  const [formData, setFormData] = useState<{
    targetLanguage: string;
    difficultyLevel: string;
  } | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const prevIsLoadingRef = useRef<boolean>(false);

  const queryClient = useQueryClient();

  const startStory = useSetAtom(startStoryAtom);
  const updateStoryUsage = useSetAtom(updateStoryUsageAtom);
  const completeStory = useSetAtom(completeStoryAtom);
  const resetSession = useSetAtom(resetSessionAtom);

  const { completion, complete, isLoading } = useCompletion({
    api: '/api/generate-story',
    onError: (err) => {
      console.error('Completion error:', err);
    },
  });

  useEffect(() => {
    resetSession();
  }, [resetSession]);

  // Track when story generation completes
  useEffect(() => {
    if (prevIsLoadingRef.current && !isLoading && startTime && !endTime) {
      queueMicrotask(() => {
        setEndTime(Date.now());

        const estimatedTokens = Math.ceil(completion.length / 4);
        completeStory({
          characters: completion.length,
          tokens: estimatedTokens,
        });

        queryClient.invalidateQueries({ queryKey: ['stories'] });
      });
    }
    prevIsLoadingRef.current = isLoading;
  }, [isLoading, startTime, endTime, completion.length, completeStory, queryClient]);

  // Update current story usage during streaming
  useEffect(() => {
    if (isLoading && completion.length > 0) {
      const estimatedTokens = Math.ceil(completion.length / 4);
      updateStoryUsage({
        characters: completion.length,
        tokens: estimatedTokens,
      });
    }
  }, [completion.length, isLoading, updateStoryUsage]);

  const handleFormSubmit = async (data: {
    targetLanguage: string;
    storyLength: number;
    difficultyLevel: string;
    topic: string;
    includeVocabulary: boolean;
    includeGrammarTips: boolean;
  }) => {
    setFormData({
      targetLanguage: data.targetLanguage,
      difficultyLevel: data.difficultyLevel,
    });
    setStartTime(Date.now());
    setEndTime(null);

    startStory();

    await complete('', {
      body: {
        targetLanguage: data.targetLanguage,
        storyLength: data.storyLength,
        difficultyLevel: data.difficultyLevel,
        topic: data.topic,
        includeVocabulary: data.includeVocabulary,
        includeGrammarTips: data.includeGrammarTips,
      },
    });
  };

  return (
    <div className='py-12 px-4'>
      <div className='mx-auto max-w-4xl space-y-6'>
        <StoryForm onSubmit={handleFormSubmit} isLoading={isLoading} />

        {(isLoading || completion) && formData && (
          <StoryResponse
            completion={completion}
            isLoading={isLoading}
            difficultyLevel={formData.difficultyLevel}
            targetLanguage={formData.targetLanguage}
            startTime={startTime}
            endTime={endTime}
          />
        )}
      </div>
    </div>
  );
}
