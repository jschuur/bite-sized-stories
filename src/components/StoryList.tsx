'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { formatDate, getLanguage } from '@/lib/utils';

import type { Story } from '@/types';

function getDifficultyBadgeClass(difficulty: string): string {
  if (['A1', 'A2'].includes(difficulty))
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
  if (['B1', 'B2'].includes(difficulty))
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
  if (['C1', 'C2'].includes(difficulty))
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
}

function getLanguageName(languageCode: string): string {
  const language = getLanguage({ languageCode });
  return language?.name || languageCode;
}

export function StoryList() {
  const {
    data: storiesData,
    isLoading,
    error,
  } = useQuery<{
    stories: Story[];
  }>({
    queryKey: ['stories'],
    queryFn: async () => {
      const response = await fetch('/api/stories?limit=10');
      if (!response.ok) {
        throw new Error('Failed to fetch stories');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className='flex justify-center p-8'>
        <div className='flex items-center space-x-2'>
          <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
          <span>Loading stories...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center p-8 text-red-600'>
        Failed to load stories. Please try again later.
      </div>
    );
  }

  const stories = storiesData?.stories || [];

  if (stories.length === 0) {
    return (
      <div className='text-center p-8 text-muted-foreground'>
        No stories found. Generate your first story!
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold'>Recent Stories</h3>
      <Table className='border-none'>
        <TableHeader>
          <TableRow className='border-none'>
            <TableHead className='text-left'>Title</TableHead>
            <TableHead className='text-center'>Language</TableHead>
            <TableHead className='text-center'>Difficulty</TableHead>
            <TableHead className='text-center'>Length</TableHead>
            <TableHead className='text-right'>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stories.map((story: Story) => (
            <TableRow
              key={story.id}
              className='hover:bg-muted/50 transition-colors border-none'
            >
              <TableCell className='font-medium border-none p-0'>
                <Link
                  href={`/story/${story.id}`}
                  className='block px-4 py-2 w-full'
                >
                  {story.title || 'Untitled'}
                </Link>
              </TableCell>
              <TableCell className='border-none text-center'>
                {getLanguageName(story.language)}
              </TableCell>
              <TableCell className='border-none'>
                <div className='flex justify-center'>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getDifficultyBadgeClass(
                      story.difficultyLevel
                    )}`}
                  >
                    {story.difficultyLevel}
                  </span>
                </div>
              </TableCell>
              <TableCell className='border-none text-center'>
                {story.wordCount ? `${story.wordCount} words` : 'N/A'}
              </TableCell>
              <TableCell className='border-none text-right'>
                {formatDate(new Date(story.createdAt))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
