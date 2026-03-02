'use client';

import { StoryList } from '@/components/StoryList';

export default function StoriesPage() {
  return (
    <div className='py-12 px-4'>
      <div className='mx-auto max-w-4xl'>
        <StoryList />
      </div>
    </div>
  );
}
