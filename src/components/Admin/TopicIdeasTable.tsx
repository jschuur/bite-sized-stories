'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { getTopicIdeasColumns } from '@/components/Admin/TopicIdeasColumns';

import { useAdminPreferences } from '@/hooks/useAdminPreferences';

import type { TopicIdeaWithStoryCount } from '@/db/queries/settings';

export function TopicIdeasTable() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const { topicIdeasSorting: sorting, setTopicIdeasSorting: setSorting } = useAdminPreferences();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const { data: ideas = [], isLoading } = useQuery<TopicIdeaWithStoryCount[]>({
    queryKey: ['admin-topic-ideas'],
    queryFn: async () => {
      const res = await fetch('/api/admin/settings/topic-ideas');
      if (!res.ok) throw new Error('Failed to fetch');

      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ id, topic }: { id?: string; topic: string }) => {
      const url = id ? `/api/admin/settings/topic-ideas/${id}` : '/api/admin/settings/topic-ideas';
      const res = await fetch(url, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      if (!res.ok) throw new Error('Failed to save');

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-topic-ideas'] });
      queryClient.invalidateQueries({ queryKey: ['config'] });
      setDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/settings/topic-ideas/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-topic-ideas'] });
      queryClient.invalidateQueries({ queryKey: ['config'] });
    },
  });

  const openCreate = () => {
    setEditingId(null);
    setTopic('');
    setDialogOpen(true);
  };

  const openEdit = (idea: TopicIdeaWithStoryCount) => {
    setEditingId(idea.id);
    setTopic(idea.topic);
    setDialogOpen(true);
  };

  const handleSave = () => {
    saveMutation.mutate({ id: editingId ?? undefined, topic });
  };

  const openDeleteConfirm = (id: string) => setDeleteTargetId(id);
  const closeDeleteConfirm = () => setDeleteTargetId(null);
  const confirmDelete = () => {
    if (deleteTargetId) {
      deleteMutation.mutate(deleteTargetId);
      closeDeleteConfirm();
    }
  };

  const columns = getTopicIdeasColumns(openEdit, openDeleteConfirm);

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table returns non-memoizable functions
  const table = useReactTable({
    data: ideas,
    columns,
    state: { sorting },
    onSortingChange: (updaterOrValue) =>
      setSorting(typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading)
    return <div className='text-center p-8 text-muted-foreground'>Loading topic ideas...</div>;

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>Topic Ideas ({ideas.length})</h3>
        <Button size='sm' onClick={openCreate}>
          <Plus className='size-4 mr-1' />
          Add Topic
        </Button>
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className='text-center text-muted-foreground'>
                No topic ideas configured.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => !open && closeDeleteConfirm()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete topic idea?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the topic idea.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant='destructive' onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Topic Idea' : 'Add Topic Idea'}</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='topic-text'>Topic</Label>
              <Textarea
                id='topic-text'
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder='e.g. A story about a journey to a new country'
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
