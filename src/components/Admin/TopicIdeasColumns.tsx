import { ColumnDef } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { formatDate } from '@/lib/utils';

import type { TopicIdeaWithStoryCount } from '@/db/queries/settings';

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

export function getTopicIdeasColumns(
  openEdit: (idea: TopicIdeaWithStoryCount) => void,
  openDeleteConfirm: (id: string) => void,
): ColumnDef<TopicIdeaWithStoryCount>[] {
  return [
    {
      accessorKey: 'storyCount',
      header: ({ column }) => <SortableHeader column={column}>Stories</SortableHeader>,
      size: 100,
    },
    {
      accessorKey: 'topic',
      header: ({ column }) => <SortableHeader column={column}>Topic</SortableHeader>,
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
      size: 80,
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
              <DropdownMenuItem
                variant='destructive'
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
