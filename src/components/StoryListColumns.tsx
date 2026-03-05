import { ColumnDef } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, Info, MoreHorizontal } from 'lucide-react';
import NextLink from 'next/link';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

import { formatDate } from '@/lib/utils';

import type { Story, StoryRequirements } from '@/types';
import type { Language, StoryRequirementCategory } from '@/db/queries/settings';

function formatStoryRequirements(
  requirements: StoryRequirements | null,
  requirementCategories: StoryRequirementCategory[]
): React.ReactNode {
  if (!requirements || typeof requirements !== 'object') return null;

  const entries = Object.entries(requirements).filter(
    ([, values]) => Array.isArray(values) && values.length > 0,
  );

  const categoryMap = new Map(requirementCategories.map((c) => [c.key, c]));

  return (
    <div className='grid grid-cols-2 gap-x-6 gap-y-2 text-sm'>
      {entries.map(([key, values]) => {
        const config = categoryMap.get(key);
        const label =
          config?.label ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
        const valueStr = (values as (string | number)[]).map(String).join(', ');

        return (
          <div key={key} className='flex flex-col gap-0.5'>
            <span className='text-xs text-muted-foreground'>{label}</span>
            <span className='font-semibold'>{valueStr}</span>
          </div>
        );
      })}
    </div>
  );
}

function getDifficultyBadgeClass(difficulty: string): string {
  if (['A1', 'A2'].includes(difficulty))
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
  if (['B1', 'B2'].includes(difficulty))
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
  if (['C1', 'C2'].includes(difficulty))
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
}

function getLanguageName(languageCode: string, languages: Language[]): string {
  const language = languages.find((l) => l.languageCode === languageCode);

  return language?.name || languageCode;
}

function SortableHeader({
  column,
  children,
  className,
}: {
  column: { getIsSorted: () => false | 'asc' | 'desc'; toggleSorting: (desc?: boolean) => void };
  children: React.ReactNode;
  className?: string;
}) {
  const sorted = column.getIsSorted();

  return (
    <Button
      variant='ghost'
      size='sm'
      className={`-ml-3 h-8 ${className ?? ''}`}
      onClick={() => column.toggleSorting(sorted === 'asc')}
    >
      {children}
      {sorted === 'asc' && <ArrowUp className='ml-1 size-3.5' />}
      {sorted === 'desc' && <ArrowDown className='ml-1 size-3.5' />}
      {!sorted && <ArrowUpDown className='ml-1 size-3.5 opacity-40' />}
    </Button>
  );
}

export function getStoryListColumns(
  configLanguages: Language[],
  configRequirements: StoryRequirementCategory[]
): ColumnDef<Story>[] {
  return [
    {
      accessorKey: 'title',
      size: 0,
      header: ({ column }) => <SortableHeader column={column}>Title</SortableHeader>,
      cell: ({ row }) => {
        const story = row.original;

        return (
          <div className='flex items-center gap-1 min-w-0'>
            <NextLink
              href={`/story/${story.id}`}
              className='flex-1 min-w-0 hover:underline truncate'
            >
              {story.title || 'Untitled'}
            </NextLink>
            <HoverCard openDelay={200} closeDelay={100}>
              <HoverCardTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  type='button'
                  className='size-6 shrink-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                >
                  <Info className='size-3.5' />
                  <span className='sr-only'>Story details</span>
                </Button>
              </HoverCardTrigger>
              <HoverCardContent side='top' align='start' className='w-[32rem]'>
                <div className='space-y-3'>
                  {story.topic && (
                    <div className='flex flex-col gap-0.5'>
                      <span className='text-xs text-muted-foreground'>Topic</span>
                      <span className='font-semibold'>{story.topic}</span>
                    </div>
                  )}
                  <div>
                    {formatStoryRequirements(story.storyRequirements, configRequirements)}
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        );
      },
    },
    {
      accessorKey: 'language',
      size: 120,
      header: ({ column }) => (
        <SortableHeader column={column} className='justify-center'>
          Language
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <div className='text-center'>{getLanguageName(row.original.language, configLanguages)}</div>
      ),
    },
    {
      accessorKey: 'difficultyLevel',
      size: 110,
      header: ({ column }) => (
        <SortableHeader column={column} className='justify-center'>
          Difficulty
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getDifficultyBadgeClass(
              row.original.difficultyLevel,
            )}`}
          >
            {row.original.difficultyLevel}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'wordCount',
      size: 110,
      header: ({ column }) => (
        <SortableHeader column={column} className='justify-center'>
          Length
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <div className='text-center'>
          {row.original.wordCount ? `${row.original.wordCount} words` : 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      size: 130,
      header: ({ column }) => (
        <SortableHeader column={column} className='justify-end'>
          Created
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <div className='text-right'>{formatDate(new Date(row.original.createdAt))}</div>
      ),
    },
    {
      accessorKey: 'updatedAt',
      size: 130,
      header: ({ column }) => (
        <SortableHeader column={column} className='justify-end'>
          Updated
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <div className='text-right'>{formatDate(new Date(row.original.updatedAt))}</div>
      ),
    },
    {
      id: 'actions',
      size: 48,
      header: () => null,
      cell: ({ row }) => {
        const story = row.original;
        const storyLink =
          typeof window !== 'undefined'
            ? `${window.location.origin}/story/${story.id}`
            : `/story/${story.id}`;

        return (
          <div className='flex justify-end'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon-sm' className='h-8 w-8'>
                  <MoreHorizontal className='size-4' />
                  <span className='sr-only'>Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem
                  onSelect={() => {
                    navigator.clipboard.writeText(story.id);
                  }}
                >
                  Copy Story ID
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    navigator.clipboard.writeText(storyLink);
                  }}
                >
                  Copy Story Link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
