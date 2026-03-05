import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { formatDate } from '@/lib/utils';

import type { LanguageWithStoryCount } from '@/db/queries/settings';

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

export function getLanguagesColumns(
  openEdit: (lang: LanguageWithStoryCount) => void,
  openDeleteConfirm: (id: string) => void,
  toggleActive: (id: string, active: boolean) => void,
): ColumnDef<LanguageWithStoryCount>[] {
  return [
    {
      accessorKey: 'storyCount',
      header: ({ column }) => <SortableHeader column={column}>Stories</SortableHeader>,
      cell: ({ row }) => (
        <div className='text-left'>
          <Link
            href={`/stories?language=${row.original.languageCode}`}
            className='hover:underline text-blue-500'
          >
            {row.original.storyCount}
          </Link>
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
    },
    {
      accessorKey: 'languageCode',
      header: ({ column }) => <SortableHeader column={column}>Code</SortableHeader>,
    },
    {
      accessorKey: 'googleCloudTts',
      header: ({ column }) => <SortableHeader column={column}>Google TTS</SortableHeader>,
      cell: ({ row }) => (row.original.googleCloudTts ? 'Yes' : 'No'),
      sortingFn: (rowA, rowB) =>
        Number(rowA.original.googleCloudTts) - Number(rowB.original.googleCloudTts),
    },
    {
      accessorKey: 'active',
      header: ({ column }) => <SortableHeader column={column}>Active</SortableHeader>,
      cell: ({ row }) => (
        <span className={row.original.active ? 'text-green-600' : 'text-muted-foreground'}>
          {row.original.active ? 'Yes' : 'No'}
        </span>
      ),
      sortingFn: (rowA, rowB) => Number(rowA.original.active) - Number(rowB.original.active),
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => (
        <SortableHeader column={column} className='justify-end'>
          Updated
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <div className='text-right'>{formatDate(new Date(row.original.updatedAt))}</div>
      ),
      size: 130,
    },
    {
      id: 'actions',
      header: () => null,
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex justify-end'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon-sm'>
                <MoreHorizontal className='size-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => openEdit(row.original)}>
                <Pencil className='size-3.5 mr-2' />
                Edit
              </DropdownMenuItem>
              <DropdownMenuCheckboxItem
                checked={row.original.active}
                onCheckedChange={(checked) => toggleActive(row.original.id, checked === true)}
              >
                Active
              </DropdownMenuCheckboxItem>
              <DropdownMenuItem
                variant='destructive'
                disabled={row.original.storyCount > 0}
                onClick={() => openDeleteConfirm(row.original.id)}
              >
                <Trash2 className='size-3.5 mr-2' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
