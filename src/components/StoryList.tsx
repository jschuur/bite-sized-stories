'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Info,
  MoreHorizontal,
  X,
} from 'lucide-react';
import NextLink from 'next/link';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { formatDate, getLanguage } from '@/lib/utils';

import { difficultyLevels, storyRequirementsConfig, supportedLanguages } from '@/config';

import type { Story, StoryRequirementType, StoryRequirements } from '@/types';

function formatStoryRequirements(requirements: StoryRequirements | null): React.ReactNode {
  if (!requirements || typeof requirements !== 'object') return null;

  const entries = Object.entries(requirements).filter(
    ([, values]) => Array.isArray(values) && values.length > 0,
  );

  return (
    <div className='grid grid-cols-2 gap-x-6 gap-y-2 text-sm'>
      {entries.map(([key, values]) => {
        const config = storyRequirementsConfig[key as StoryRequirementType];
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

type PaginatedResponse = {
  stories: Story[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

const LENGTH_OPTIONS = [
  { value: 'short', label: 'Short (≤200 words)' },
  { value: 'medium', label: 'Medium (201-500 words)' },
  { value: 'long', label: 'Long (500+ words)' },
] as const;

const DATE_RANGE_OPTIONS = [
  { value: '1', label: 'Today' },
  { value: '3', label: 'Last 3 days' },
  { value: '7', label: 'Last week' },
  { value: '14', label: 'Last 2 weeks' },
  { value: '30', label: 'Last 30 days' },
  { value: '60', label: 'Last 60 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '180', label: 'Last 180 days' },
] as const;

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

const ALL_VALUE = '__all__';

const storyListParams = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  sortBy: parseAsString.withDefault('createdAt'),
  sortOrder: parseAsString.withDefault('desc'),
  language: parseAsString.withDefault(ALL_VALUE),
  difficulty: parseAsString.withDefault(ALL_VALUE),
  length: parseAsString.withDefault(ALL_VALUE),
  age: parseAsString.withDefault(ALL_VALUE),
};

export function StoryList() {
  const [params, setParams] = useQueryStates(storyListParams, {
    history: 'push',
  });

  const {
    page,
    pageSize,
    sortBy,
    sortOrder,
    language: languageFilter,
    difficulty: difficultyFilter,
    length: lengthFilter,
    age: ageFilter,
  } = params;

  const sorting: SortingState = useMemo(
    () => [{ id: sortBy, desc: sortOrder === 'desc' }],
    [sortBy, sortOrder],
  );

  const setSorting = (updater: SortingState | ((old: SortingState) => SortingState)) => {
    const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
    const newSort = newSorting[0];
    if (newSort) {
      setParams({ sortBy: newSort.id, sortOrder: newSort.desc ? 'desc' : 'asc', page: 1 });
    }
  };

  const setPage = (updater: number | ((old: number) => number)) => {
    const newPage = typeof updater === 'function' ? updater(page) : updater;
    setParams({ page: newPage });
  };

  const queryParams = useMemo(() => {
    const apiParams = new URLSearchParams({
      paginated: 'true',
      page: String(page),
      pageSize: String(pageSize),
      sortBy,
      sortOrder,
    });

    if (languageFilter !== ALL_VALUE) apiParams.set('language', languageFilter);
    if (difficultyFilter !== ALL_VALUE) apiParams.set('difficulty', difficultyFilter);
    if (lengthFilter !== ALL_VALUE) apiParams.set('lengthRange', lengthFilter);
    if (ageFilter !== ALL_VALUE) apiParams.set('createdWithinDays', ageFilter);

    return apiParams.toString();
  }, [
    page,
    pageSize,
    sortBy,
    sortOrder,
    languageFilter,
    difficultyFilter,
    lengthFilter,
    ageFilter,
  ]);

  const { data, isLoading, error, isFetching } = useQuery<PaginatedResponse>({
    queryKey: ['stories', queryParams],
    queryFn: async () => {
      const response = await fetch(`/api/stories?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch stories');
      return response.json();
    },
    placeholderData: keepPreviousData,
  });

  const columns: ColumnDef<Story>[] = useMemo(
    () => [
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
                      {formatStoryRequirements(story.storyRequirements)}
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
          <div className='text-center'>{getLanguageName(row.original.language)}</div>
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
    ],
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data?.stories ?? [],
    columns,
    state: { sorting },
    onSortingChange: (updater) => {
      setSorting(updater);
      setPage(1);
    },
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    pageCount: data?.totalPages ?? -1,
  });

  const handleFilterChange = (key: 'language' | 'difficulty' | 'length' | 'age', value: string) => {
    setParams({ [key]: value, page: 1 });
  };

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>Stories</h3>
        <div className='flex justify-center p-8'>
          <div className='flex items-center space-x-2'>
            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
            <span>Loading stories...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>Stories</h3>
        <div className='text-center p-8 text-red-600'>
          Failed to load stories. Please try again later.
        </div>
      </div>
    );
  }

  const hasActiveFilters =
    languageFilter !== ALL_VALUE ||
    difficultyFilter !== ALL_VALUE ||
    lengthFilter !== ALL_VALUE ||
    ageFilter !== ALL_VALUE;

  const noStories = !data?.stories?.length;

  return (
    <div className='space-y-4'>
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-2'>
        <h3 className='text-lg font-semibold'>
          Stories
          {data && (
            <span className='ml-2 text-sm font-normal text-muted-foreground'>({data.total})</span>
          )}
        </h3>

        <div className='flex flex-wrap items-center justify-end gap-2'>
          <Button
            variant='ghost'
            size='icon-sm'
            onClick={() => {
              setParams({
                language: ALL_VALUE,
                difficulty: ALL_VALUE,
                length: ALL_VALUE,
                age: ALL_VALUE,
                page: 1,
              });
            }}
            disabled={!hasActiveFilters}
            className={hasActiveFilters ? 'text-muted-foreground' : 'invisible'}
          >
            <X className='size-4' />
          </Button>

          <Select value={languageFilter} onValueChange={(v) => handleFilterChange('language', v)}>
            <SelectTrigger size='sm' className='w-[140px]'>
              <SelectValue placeholder='Language' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All Languages</SelectItem>
              {supportedLanguages.map((lang) => (
                <SelectItem key={lang.languageCode} value={lang.languageCode}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={difficultyFilter}
            onValueChange={(v) => handleFilterChange('difficulty', v)}
          >
            <SelectTrigger size='sm' className='w-[130px]'>
              <SelectValue placeholder='Difficulty' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All Levels</SelectItem>
              {Object.keys(difficultyLevels).map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={lengthFilter} onValueChange={(v) => handleFilterChange('length', v)}>
            <SelectTrigger size='sm' className='w-[160px]'>
              <SelectValue placeholder='Length' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All Lengths</SelectItem>
              {LENGTH_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={ageFilter} onValueChange={(v) => handleFilterChange('age', v)}>
            <SelectTrigger size='sm' className='w-[160px]'>
              <SelectValue placeholder='Created' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All Ages</SelectItem>
              {DATE_RANGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='relative'>
        {isFetching && !isLoading && (
          <div className='absolute inset-0 z-10 bg-background/50 flex items-center justify-center'>
            <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600'></div>
          </div>
        )}

        {noStories ? (
          <div className='text-center p-8 text-muted-foreground'>
            {hasActiveFilters
              ? 'No stories match the current filters.'
              : 'No stories found. Generate your first story!'}
          </div>
        ) : (
          <Table className='border-none table-fixed'>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className='border-none'>
                  {headerGroup.headers.map((header) => {
                    const size = header.column.columnDef.size;

                    return (
                      <TableHead
                        key={header.id}
                        className='text-left'
                        style={size ? { width: `${size}px` } : undefined}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className='group hover:bg-muted/50 transition-colors border-none'>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className='border-none'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {data && !noStories && data.total > pageSize && (
        <div className='flex items-center justify-between pt-2'>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setParams({ pageSize: Number(v), page: 1 });
              }}
            >
              <SelectTrigger size='sm' className='w-[70px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className='text-sm text-muted-foreground ml-2'>
              Page {data.page} of {data.totalPages}
            </span>
          </div>

          <div className='flex items-center gap-1'>
            <Button
              variant='outline'
              size='icon-sm'
              onClick={() => setPage(1)}
              disabled={page <= 1}
            >
              <ChevronsLeft className='size-4' />
            </Button>
            <Button
              variant='outline'
              size='icon-sm'
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className='size-4' />
            </Button>
            <Button
              variant='outline'
              size='icon-sm'
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page >= data.totalPages}
            >
              <ChevronRight className='size-4' />
            </Button>
            <Button
              variant='outline'
              size='icon-sm'
              onClick={() => setPage(data.totalPages)}
              disabled={page >= data.totalPages}
            >
              <ChevronsRight className='size-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
