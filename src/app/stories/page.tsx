import { Suspense } from 'react';

import { StoryList } from '@/components/Story/StoryList';

export default function StoriesPage() {
  return (
    <div className='py-12 px-4'>
      <div className='mx-auto max-w-4xl'>
        <Suspense
          fallback={
            <div className='flex justify-center p-8'>
              <div className='flex items-center space-x-2'>
                <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
                <span>Loading stories...</span>
              </div>
            </div>
          }
        >
          <StoryList />
        </Suspense>
      </div>
    </div>
  );
}
