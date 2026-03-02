'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

import { getLanguage } from '@/lib/utils';

import type { Story } from '@/types';

export default function StoryPage() {
  const params = useParams();
  const storyId = params.id as string;

  const { data: story, isLoading, error } = useQuery<Story>({
    queryKey: ['story', storyId],
    queryFn: async () => {
      const response = await fetch(`/api/stories/${storyId}`);
      if (!response.ok) throw new Error('Failed to fetch story');

      return response.json();
    },
    enabled: !!storyId,
  });

  if (isLoading) {
    return (
      <div className='py-12 px-4'>
        <div className='mx-auto max-w-4xl'>
          <div className='flex justify-center p-8'>
            <div className='flex items-center space-x-2'>
              <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
              <span>Loading story...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className='py-12 px-4'>
        <div className='mx-auto max-w-4xl'>
          <div className='text-center p-8 text-red-600'>
            Failed to load story.{' '}
            <Link href='/stories' className='underline'>
              Back to stories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='py-12 px-4'>
      <div className='mx-auto max-w-4xl space-y-4'>
        <Link
          href='/stories'
          className='inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors'
        >
          &larr; Back to stories
        </Link>

        <div className='flex flex-wrap gap-4 text-sm text-muted-foreground'>
          <span className='font-medium text-foreground'>Language:</span>
          <span>
            {getLanguage({ languageCode: story.language })?.name || story.language}
          </span>
          <span className='font-medium text-foreground'>Difficulty:</span>
          <span className='capitalize'>{story.difficultyLevel}</span>
          {story.wordCount && (
            <>
              <span className='font-medium text-foreground'>Length:</span>
              <span>{story.wordCount} words</span>
            </>
          )}
          <span className='font-medium text-foreground'>Created:</span>
          <span>{new Date(story.createdAt).toLocaleDateString()}</span>
        </div>

        {story.story && (
          <div className='space-y-4'>
            <h3 className='text-xl font-semibold border-b pb-2'>
              {story.title || 'Untitled Story'}
            </h3>
            <div className='prose max-w-none dark:prose-invert'>
              <ReactMarkdown>{story.story}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
