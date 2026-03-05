'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { flexRender, getCoreRowModel, SortingState, useReactTable } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from 'lucide-react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { useConfig } from '@/hooks/useConfig';
import { authClient } from '@/lib/authClient';
import { difficultyLevels } from '@/config';

import { getStoryListColumns } from '@/components/Story/StoryListColumns';

import type { Story } from '@/types';

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
  const { data: session } = authClient.useSession();
  const userIsAdmin = !!session?.user?.isAdmin;
  const { data: config } = useConfig(userIsAdmin);
  const configLanguages = useMemo(() => config?.languages ?? [], [config?.languages]);
  const configRequirements = useMemo(() => config?.storyRequirements ?? [], [config?.storyRequirements]);

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

  const columns = useMemo(
    () => getStoryListColumns(configLanguages, configRequirements),
    [configLanguages, configRequirements],
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
              {configLanguages.map((lang) => (
                <SelectItem key={lang.languageCode} value={lang.languageCode}>
                  {lang.name}
                  {'active' in lang && !lang.active && ' (inactive)'}
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
                <TableRow
                  key={row.id}
                  className='group hover:bg-muted/50 transition-colors border-none'
                >
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
