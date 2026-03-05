import { ColumnDef } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import pluralize from 'pluralize';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { formatDate } from '@/lib/utils';

import type { StoryRequirementCategory } from '@/db/queries/settings';

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

export function getStoryRequirementsColumns(
  openEdit: (cat: StoryRequirementCategory) => void,
  openDeleteConfirm: (id: string) => void
): ColumnDef<StoryRequirementCategory>[] {
  return [
    {
      accessorKey: 'key',
      header: 'Key',
    },
    {
      accessorKey: 'label',
      header: 'Label',
    },
    {
      accessorKey: 'count',
      header: 'Pick Count',
      size: 80,
    },
    {
      accessorKey: 'template',
      header: 'Template',
    },
    {
      accessorKey: 'options',
      header: 'Options',
      cell: ({ row }) => {
        const opts = row.original.options;

        return (
          <span className='text-sm text-muted-foreground'>
            {pluralize('option', opts.length, true)}
          </span>
        );
      },
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
