'use client';

import { parseAsString, useQueryState } from 'nuqs';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { LanguagesTable } from '@/components/Admin/LanguagesTable';
import { StoryRequirementsTable } from '@/components/Admin/StoryRequirementsTable';
import { TopicIdeasTable } from '@/components/Admin/TopicIdeasTable';

export default function SettingsPage() {
  const [tab, setTab] = useQueryState('tab', parseAsString.withDefault('languages'));

  return (
    <div className='py-12 px-4'>
      <div className='mx-auto max-w-6xl space-y-8'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Settings</h1>
          <p className='text-muted-foreground mt-1'>
            Manage languages, topic ideas, and story requirements.
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value='languages'>Languages</TabsTrigger>
            <TabsTrigger value='topic-ideas'>Topic Ideas</TabsTrigger>
            <TabsTrigger value='story-requirements'>Story Requirements</TabsTrigger>
          </TabsList>

          <TabsContent value='languages' className='mt-6'>
            <LanguagesTable />
          </TabsContent>

          <TabsContent value='topic-ideas' className='mt-6'>
            <TopicIdeasTable />
          </TabsContent>

          <TabsContent value='story-requirements' className='mt-6'>
            <StoryRequirementsTable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
